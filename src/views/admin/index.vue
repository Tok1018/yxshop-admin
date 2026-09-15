<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('admin.title') }}</h1>
        <p class="page-subtitle">{{ t('admin.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('admin.add_admin') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('admin.search_placeholder')" :aria-label="t('admin.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.status" class="filter-select" @change="loadData">
        <option value="">{{ t('admin.all_status') }}</option>
        <option value="1">{{ t('admin.status_normal') }}</option>
        <option value="0">{{ t('admin.status_disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('admin.th_admin') }}</th>
              <th>{{ t('admin.th_role') }}</th>
              <th>{{ t('admin.th_status') }}</th>
              <th>{{ t('admin.th_lock_status') }}</th>
              <th>{{ t('admin.th_created_at') }}</th>
              <th class="col-actions">{{ t('admin.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in list" :key="admin.id">
              <td>
                <div class="admin-cell">
                  <div class="admin-avatar" :style="{ background: getAvatarColor(admin.id) }">
                    {{ (admin.nickname || admin.username || '?')[0] }}
                  </div>
                  <div class="admin-info">
                    <span class="admin-name">{{ admin.nickname || admin.username || '-' }}</span>
                    <span class="admin-username" v-if="admin.nickname && admin.username">@{{ admin.username }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge-info" v-if="admin.role?.role_name || admin.role_name">{{ admin.role?.role_name || admin.role_name }}</span>
                <span v-else class="muted">-</span>
              </td>
              <td><span class="badge" :class="admin.status === 1 ? 'badge-success' : 'badge-error'">{{ admin.status === 1 ? t('admin.status_normal') : t('admin.status_disabled') }}</span></td>
              <td>
                <span v-if="admin.is_locked" class="badge-error">{{ t('admin.locked') }}</span>
                <span v-else class="badge-success">{{ t('admin.lock_normal') }}</span>
              </td>
              <td class="muted">{{ formatTime(admin.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(admin)">{{ t('common.edit') }}</button>
                <button :class="admin.status === 1 ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'" @click="toggleStatus(admin)">{{ admin.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-ghost btn-sm" @click="handleResetPwd(admin)">{{ t('admin.btn_reset_password') }}</button>
                <button v-if="admin.is_locked" class="btn-primary btn-sm" @click="handleUnlock(admin.id)">{{ t('admin.btn_unlock') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(admin.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="isAdminListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <icon-user-group :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('admin.empty_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading">
        <div class="spinner"></div>
      </div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('admin.total_count', { n: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('admin.edit_admin') : t('admin.add_admin')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('admin.section_account_info') }}</h4>
        <div class="form-group">
          <label>{{ t('admin.label_username') }} <span class="required">*</span></label>
          <input v-model="form.username" :disabled="!!form.id" :placeholder="t('admin.placeholder_username')" class="form-input" :class="{ disabled: !!form.id }" />
        </div>
        <div class="form-group">
          <label>{{ t('admin.label_nickname') }}</label>
          <input v-model="form.nickname" :placeholder="t('admin.placeholder_nickname')" class="form-input" />
        </div>
        <div class="form-group" v-if="!form.id">
          <label>{{ t('admin.label_password') }} <span class="required">*</span></label>
          <input v-model="form.password" type="password" :placeholder="t('admin.placeholder_password')" class="form-input" />
        </div>
      </div>
      <div class="form-section">
        <h4>{{ t('admin.section_permission') }}</h4>
        <div class="form-group">
          <label>{{ t('admin.label_role') }}</label>
          <select v-model="form.role_id" class="form-input">
            <option value="">{{ t('admin.placeholder_role') }}</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.role_name || r.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('admin.label_status') }}</label>
          <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('admin.status_normal')" :unchecked-text="t('admin.status_disabled')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('admin.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('admin.btn_save_changes') : t('admin.btn_create_admin') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconUserGroup } from '@arco-design/web-vue/es/icon'
import * as adminApi from '@/api/admin'
import { getRoleList } from '@/api/role'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const roles = ref([])
const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '', status: '' })
const isAdminListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, username: '', nickname: '', password: '', role_id: '', status: 1 })

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await adminApi.getAdminList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('admin.msg_operation_failed')) }
  finally { loading.value = false }
}

const openForm = (record) => {
  if (record) Object.assign(form, { id: null, username: '', nickname: '', password: '', role_id: '', status: 1 }, record)
  else Object.assign(form, { id: null, username: '', nickname: '', password: '', role_id: '', status: 1 })
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.username) { Message.warning(t('admin.msg_enter_username')); return }
  if (!form.id && !form.password) { Message.warning(t('admin.msg_enter_password')); return }
  try {
    if (form.id) { await adminApi.updateAdmin(form.id, form); Message.success(t('admin.msg_update_success')) }
    else { await adminApi.createAdmin(form); Message.success(t('admin.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('admin.msg_operation_failed')) }
}

const toggleStatus = async (admin) => {
  try { await adminApi.updateAdminStatus(admin.id, { status: admin.status === 1 ? 0 : 1 }); Message.success(admin.status === 1 ? t('admin.msg_disabled') : t('admin.msg_enabled')); loadData() }
  catch (error) { Message.error(t('admin.msg_operation_failed')) }
}

const handleResetPwd = (admin) => {
  Modal.warning({
    title: t('admin.confirm_reset_password'),
    content: t('admin.confirm_reset_password_msg', { name: admin.username }),
    hideCancel: false,
    onOk: async () => {
      try { await adminApi.resetAdminPassword(admin.id); Message.success(t('admin.msg_password_reset')) }
      catch (error) { Message.error(t('admin.msg_reset_failed')) }
    }
  })
}

const handleDelete = (id) => {
  Modal.warning({
    title: t('admin.confirm_delete_admin'),
    content: t('admin.confirm_delete_admin_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await adminApi.deleteAdmin(id); Message.success(t('admin.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('admin.msg_delete_failed')) }
    }
  })
}

const handleUnlock = async (id) => {
  try {
    await adminApi.unlockAdmin(id)
    Message.success(t('admin.msg_unlock_success'))
    loadData()
  } catch (error) {
    Message.error(t('admin.msg_unlock_failed'))
  }
}

const avatarColors = ['var(--color-secondary)', 'var(--color-primary)', 'var(--color-tertiary)', 'var(--color-error)', 'var(--color-primary-container)', 'var(--color-tertiary-container)', 'var(--color-secondary-container)', 'var(--color-error-container)']
const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length]

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  loadData()
  try {
    const res = await getRoleList()
    const roleData = res.data?.data || res.data || []
    roles.value = Array.isArray(roleData) ? roleData : (roleData?.list || [])
  }
  catch (error) { Message.error(t('admin.msg_operation_failed')) }
})
</script>

<style scoped>
.admin-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-primary);
  flex-shrink: 0;
}

.admin-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-name {
  color: var(--color-on-surface);
  font-size: 14px;
  font-weight: 500;
}

.admin-username {
  font-size: 11px;
  color: var(--color-on-surface-variant);
}

.form-input.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
