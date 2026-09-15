<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('role.title') }}</h1>
        <p class="page-subtitle">{{ t('role.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('role.add_role') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="keyword" :placeholder="t('role.search_placeholder')" :aria-label="t('role.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="roles-grid">
      <div v-for="role in filteredList" :key="role.id" class="role-card card-shadow">
        <div class="role-card-header">
          <div class="role-icon">
            <icon-safe />
          </div>
          <div class="role-meta">
            <h3 class="role-name">{{ role.role_name }}</h3>
            <span class="role-id mono">ID: {{ role.id }}</span>
          </div>
        </div>
        <p class="role-desc">{{ role.role_desc || t('role.no_description') }}</p>
        <div class="role-stats">
          <div class="stat-item">
            <icon-user />
            <span>{{ t('role.admin_count', { n: role.admins_count ?? 0 }) }}</span>
          </div>
          <div class="stat-item">
            <icon-calendar />
            <span>{{ formatTime(role.created_at) }}</span>
          </div>
        </div>
        <div class="role-actions">
          <button class="btn-sm btn-ghost" @click="openForm(role)">{{ t('common.edit') }}</button>
          <button class="btn-sm btn-primary" @click="openPermission(role)">{{ t('role.btn_permission') }}</button>
          <button class="btn-sm btn-danger" @click="handleDelete(role.id)">{{ t('common.delete') }}</button>
        </div>
      </div>
      <div v-if="isEmpty" class="empty-state">{{ t('role.empty_data') }}</div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <a-drawer
      v-model:visible="formVisible"
      :title="form.id ? t('role.edit_role') : t('role.add_role')"
      :width="'min(480px, 90vw)'"
      class="arco-drawer-md3"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('role.section_role_info') }}</h4>
        <div class="form-group">
          <label>{{ t('role.label_role_name') }} <span class="required">*</span></label>
          <input v-model="form.role_name" :placeholder="t('role.placeholder_role_name')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('role.label_role_desc') }}</label>
          <textarea v-model="form.role_desc" :placeholder="t('role.placeholder_role_desc')" :aria-label="t('role.placeholder_role_desc')" class="form-textarea" rows="3"></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('role.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('role.btn_save_changes') : t('role.btn_create_role') }}</button>
      </template>
    </a-drawer>

    <a-drawer
      v-model:visible="permVisible"
      :title="t('role.title_assign_permission')"
      :width="'min(560px, 90vw)'"
      class="arco-drawer-md3"
      :footer="true"
      unmount-on-close
    >
      <div v-if="permLoading" class="perm-loading">
        <div class="spinner"></div>
        <span>{{ t('role.loading_permission_tree') }}</span>
      </div>
      <div v-else class="perm-tree">
        <div class="perm-header">
          <span class="perm-title">{{ t('role.menu_permission') }}</span>
          <div class="perm-actions">
            <button class="btn-sm btn-ghost" @click="checkAll">{{ t('role.btn_select_all') }}</button>
            <button class="btn-sm btn-ghost" @click="uncheckAll">{{ t('role.btn_unselect_all') }}</button>
          </div>
        </div>
        <div v-for="menu in menuTree" :key="menu.id" class="perm-group">
          <div class="perm-parent" @click="toggleParent(menu)">
            <div class="perm-check">
              <span :class="['checkbox', { checked: isParentChecked(menu), partial: isParentPartial(menu) }]">
                <icon-check v-if="isParentChecked(menu)" />
                <icon-minus v-else-if="isParentPartial(menu)" />
              </span>
            </div>
            <span class="perm-name">{{ menu.name }}</span>
          </div>
          <div v-if="menu.children?.length" class="perm-children">
            <div v-for="child in menu.children" :key="child.id" class="perm-child" @click="toggleChild(child)">
              <span :class="['checkbox', { checked: checkedKeys.includes(String(child.id)) }]">
                <icon-check v-if="checkedKeys.includes(String(child.id))" />
              </span>
              <span class="perm-name">{{ child.name }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="permVisible = false">{{ t('role.btn_cancel') }}</button>
        <button class="btn-primary" @click="handlePermSubmit">{{ t('role.btn_save_permission') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconSafe, IconUser, IconCalendar, IconCheck, IconMinus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getRoleList, createRole, updateRole, deleteRole, getRolePermissions, assignRolePermissions } from '@/api/role'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const keyword = ref('')
const formVisible = ref(false)
const form = reactive({ id: null, role_name: '', role_desc: '' })
const permVisible = ref(false)
const permLoading = ref(false)
const menuTree = ref([])
const checkedKeys = ref([])
const halfCheckedKeys = ref([])
const currentRoleId = ref(null)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => {}, 400) }

const filteredList = computed(() => {
  if (!keyword.value) return list.value
  return list.value.filter(r => r.role_name?.includes(keyword.value))
})
const isEmpty = computed(() => !filteredList.value.length && !loading.value)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({ keyword: keyword.value })
    list.value = Array.isArray(res.data) ? res.data : (res.data?.list || [])
  } catch (error) { Message.error(t('role.msg_operation_failed')) } finally { loading.value = false }
}

const openForm = (record) => {
  Object.assign(form, { id: null, role_name: '', role_desc: '' }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.role_name?.trim()) { Message.warning(t('role.msg_enter_role_name')); return }
  try {
    if (form.id) { await updateRole(form.id, form); Message.success(t('role.msg_update_success')) }
    else { await createRole(form); Message.success(t('role.msg_create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('role.msg_operation_failed')) }
}

const handleDelete = (id) => {
  Modal.warning({
    title: t('role.confirm_delete_title'),
    content: t('role.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteRole(id); Message.success(t('role.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('role.msg_delete_failed')) }
    }
  })
}

const buildMenuTree = (menus, parentId = 0) => {
  return menus
    .filter(m => m.parent_id === parentId)
    .map(m => ({ id: String(m.id), name: m.name, children: buildMenuTree(menus, m.id) }))
    .sort((a, b) => {
      const ma = menus.find(m => String(m.id) === a.id)
      const mb = menus.find(m => String(m.id) === b.id)
      return (ma?.sort ?? 0) - (mb?.sort ?? 0)
    })
}

const openPermission = async (record) => {
  currentRoleId.value = record.id
  permVisible.value = true
  permLoading.value = true
  try {
    const res = await getRolePermissions(record.id)
    const data = res.data || {}
    menuTree.value = buildMenuTree(data.menus || [])
    checkedKeys.value = (data.auth_ids || []).map(String)
    halfCheckedKeys.value = []
  } catch (error) { Message.error(t('role.msg_operation_failed')) } finally { permLoading.value = false }
}

const isParentChecked = (menu) => {
  if (!menu.children?.length) return checkedKeys.value.includes(String(menu.id))
  return menu.children.every(c => checkedKeys.value.includes(String(c.id)))
}
const isParentPartial = (menu) => {
  if (!menu.children?.length) return false
  const some = menu.children.some(c => checkedKeys.value.includes(String(c.id)))
  const all = menu.children.every(c => checkedKeys.value.includes(String(c.id)))
  return some && !all
}

const toggleParent = (menu) => {
  const ids = [String(menu.id), ...(menu.children || []).map(c => String(c.id))]
  if (isParentChecked(menu)) {
    checkedKeys.value = checkedKeys.value.filter(k => !ids.includes(k))
  } else {
    ids.forEach(id => { if (!checkedKeys.value.includes(id)) checkedKeys.value.push(id) })
  }
}

const toggleChild = (child) => {
  const id = String(child.id)
  const idx = checkedKeys.value.indexOf(id)
  if (idx >= 0) checkedKeys.value.splice(idx, 1)
  else checkedKeys.value.push(id)
}

const checkAll = () => {
  const allIds = []
  const collect = (nodes) => { nodes.forEach(n => { allIds.push(String(n.id)); if (n.children) collect(n.children) }) }
  collect(menuTree.value)
  checkedKeys.value = allIds
}
const uncheckAll = () => { checkedKeys.value = [] }

const handlePermSubmit = async () => {
  try {
    const allKeys = [...checkedKeys.value, ...halfCheckedKeys.value].map(Number)
    await assignRolePermissions(currentRoleId.value, { auth_ids: allKeys })
    Message.success(t('role.msg_permission_assign_success'))
    permVisible.value = false
  } catch (error) { Message.error(t('role.msg_permission_assign_failed')) }
}

const formatTime = (t) => {
  if (!t) return '-'
  const d = new Date(typeof t === 'number' ? t * 1000 : t)
  return d.toLocaleDateString('zh-CN')
}

onMounted(() => loadData())
</script>

<style scoped>


.roles-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.role-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  transition: box-shadow 0.2s;
}

.role-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  margin-bottom: var(--spacing-base);
}

.role-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 18px;
}

.role-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--color-on-surface);
}

.role-id {
  font-size: 11px;
  color: var(--color-on-surface-variant);
}


.role-desc {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  margin: 0 0 var(--spacing-base);
  line-height: 1.5;
}

.role-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-base);
  padding-top: var(--spacing-base);
  border-top: 1px solid var(--color-outline-variant);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-on-surface-variant);
}

.stat-item :deep(svg) {
  opacity: 0.6;
}

.role-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.empty-state {
  grid-column: 1 / -1;
}


.form-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0 0 var(--spacing-lg);
}

.form-group {
  margin-bottom: var(--spacing-base);
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
  margin-bottom: 6px;
}


.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  background: var(--color-surface-container-lowest);
  color: var(--color-on-surface);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  border-color: var(--color-primary);
}

.form-textarea {
  resize: vertical;
}

.perm-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-xl);
  color: var(--color-on-surface-variant);
}

.perm-tree {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.perm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-base);
}

.perm-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
}

.perm-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.perm-group {
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.perm-parent {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: var(--spacing-base) var(--spacing-lg);
  cursor: pointer;
  background: var(--color-surface-container-low);
  transition: background 0.15s;
}

.perm-parent:hover {
  background: var(--color-surface-container);
}

.perm-check {
  display: flex;
  align-items: center;
}

.checkbox {
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-size: 12px;
}

.checkbox.checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.checkbox.partial {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-on-primary);
}

.perm-name {
  font-size: 14px;
  color: var(--color-on-surface);
}

.perm-children {
  padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-sm) 52px;
}

.perm-child {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: 6px 0;
  cursor: pointer;
  transition: opacity 0.15s;
}

.perm-child:hover {
  opacity: 0.8;
}

@media (max-width: var(--breakpoint-md)) {
  .roles-grid {
    grid-template-columns: 1fr;
  }
  .role-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
