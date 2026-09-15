<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('category.title') }}</h1>
        <p class="page-subtitle">{{ t('category.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-icon" @click="expandedKeys = allKeys" :title="t('category.expand_all')">
          <icon-down />
        </button>
        <button class="btn-icon" @click="expandedKeys = []" :title="t('category.collapse_all')">
          <icon-up />
        </button>
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('category.add_category') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="searchKeyword" :placeholder="t('category.search_placeholder')" :aria-label="t('category.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="tree-surface card-shadow">
      <div class="tree-head">
        <span class="col-name">{{ t('category.th_name') }}</span>
        <span class="col-sort">{{ t('category.th_sort') }}</span>
        <span class="col-status">{{ t('category.th_status') }}</span>
        <span class="col-ops">{{ t('category.th_actions') }}</span>
      </div>
      <div class="tree-list">
        <tree-node
          v-for="node in treeData"
          :key="node.id"
          :node="node"
          :depth="0"
          :expanded-keys="expandedKeys"
          @toggle="toggleExpand"
          @edit="openForm"
          @add-child="openForm(null, $event)"
          @delete="handleDelete"
          @toggle-status="handleToggleStatus"
        />
        <div v-if="showListEmpty" class="empty-state">
          <icon-folder :size="48" class="empty-icon" />
          <span class="empty-text">{{ t('category.empty_data') }}</span>
        </div>
      </div>
      <div class="table-loading" v-if="loading">
        <div class="spinner"></div>
      </div>
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('category.edit_category') : t('category.add_category')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('category.section_category_info') }}</h4>
        <div class="form-group">
          <label>{{ t('category.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('category.placeholder_name')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('category.label_sort') }}</label>
            <input v-model.number="form.sort" type="number" :min="0" placeholder="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('category.label_status') }}</label>
            <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" val-type="number" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('category.label_parent_category') }}</label>
          <select v-model="form.parent_id" class="form-input">
            <option :value="0">{{ t('category.option_top_level') }}</option>
            <option v-for="c in topLevelCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('category.label_icon') }}</label>
          <sa-icon-picker v-model="form.icon" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('category.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('category.btn_save_changes') : t('category.btn_create_category') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconDown, IconUp, IconRight, IconFolder, IconApps } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getCategoryList, createCategory, updateCategory, deleteCategory, updateCategoryStatus } from '@/api/category'

const { t } = useI18n()

const drawerWidth = 'min(480px, 90vw)'

const TreeNode = {
  name: 'TreeNode',
  props: {
    node: Object,
    depth: { type: Number, default: 0 },
    expandedKeys: { type: Array, default: () => [] }
  },
  emits: ['toggle', 'edit', 'add-child', 'delete', 'toggle-status'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
    const isExpanded = computed(() => props.expandedKeys.includes(props.node.id))
    const indent = computed(() => props.depth * 24)

    const toggle = () => emit('toggle', props.node.id)
    const edit = () => emit('edit', props.node)
    const addChild = () => emit('add-child', props.node.id)
    const del = () => emit('delete', props.node)

    return () => h('div', { class: ['t-node', props.depth > 0 ? 'is-child' : ''] }, [
      h('div', { class: 't-row' }, [
        h('div', { class: 't-name-cell', style: { paddingLeft: `${indent.value}px` } }, [
          hasChildren.value
            ? h('button', { class: ['t-expand', { open: isExpanded.value }], onClick: toggle }, [
                h(IconRight, { size: 14 })
              ])
            : h('span', { class: 't-expand-ph' }),
          h('div', { class: props.depth === 0 ? 't-icon root' : 't-icon leaf' }, [
            props.depth === 0 ? h(IconFolder, { size: 16 }) : h(IconApps, { size: 12 })
          ]),
          h('span', { class: 't-label' }, props.node.name),
        ]),
        h('span', { class: 't-sort' }, props.node.sort || 0),
        h('span', { class: 't-status' }, [
          h('span', { class: ['badge', props.node.status === 1 ? 'badge-success' : 'badge-error'] }, props.node.status === 1 ? t('category.status_enabled') : t('category.status_disabled'))
        ]),
        h('span', { class: 't-ops' }, [
          h('button', { class: 'btn-ghost btn-sm', onClick: edit }, t('common.edit') || '编辑'),
          h('button', { class: props.node.status === 1 ? 'btn-ghost btn-sm' : 'btn-primary btn-sm', onClick: () => emit('toggle-status', props.node) }, props.node.status === 1 ? t('common.disabled') : t('common.enabled')),
          props.depth === 0
            ? h('button', { class: 'btn-ghost btn-sm', onClick: addChild }, t('category.btn_add_child') || '添加子分类')
            : null,
          h('button', { class: 'btn-danger btn-sm', onClick: del }, t('common.delete') || '删除')
        ].filter(Boolean))
      ]),
      hasChildren.value && isExpanded.value
        ? props.node.children.map(child =>
            h(TreeNode, {
              key: child.id,
              node: child,
              depth: props.depth + 1,
              expandedKeys: props.expandedKeys,
              'onToggle': (id) => emit('toggle', id),
              'onEdit': (n) => emit('edit', n),
              'onAdd-child': (id) => emit('add-child', id),
              'onDelete': (n) => emit('delete', n),
              'onToggle-status': (n) => emit('toggle-status', n)
            })
          )
        : null
    ].filter(Boolean))
  }
}

const list = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const expandedKeys = ref([])
const formVisible = ref(false)
const form = reactive({ id: null, name: '', sort: 0, parent_id: 0, icon: '', status: 1 })

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const treeData = computed(() => {
  const items = list.value.filter(item => {
    if (!searchKeyword.value) return true
    return item.name?.includes(searchKeyword.value)
  })
  const map = {}
  items.forEach(item => { map[item.id] = { ...item, children: [] } })
  const roots = []
  items.forEach(item => {
    if (item.parent_id && map[item.parent_id]) {
      map[item.parent_id].children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
})

const showListEmpty = computed(() => !treeData.value.length && !loading.value)
const allKeys = computed(() => list.value.filter(c => list.value.some(i => i.parent_id === c.id)).map(c => c.id))
const topLevelCategories = computed(() => list.value.filter(c => !c.parent_id))

const toggleExpand = (id) => {
  if (expandedKeys.value.includes(id)) {
    expandedKeys.value = expandedKeys.value.filter(k => k !== id)
  } else {
    expandedKeys.value = [...expandedKeys.value, id]
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCategoryList({ keyword: searchKeyword.value, page_size: 1000 })
    const catData = res.data?.data?.data || res.data?.categories?.data || res.data?.list || res.data?.data
    list.value = Array.isArray(catData) ? catData : (Array.isArray(res.data) ? res.data : [])
    expandedKeys.value = allKeys.value
  } catch (error) { Message.error(t('category.msg_operation_failed')) } finally { loading.value = false }
}

const openForm = (record, parentId = '') => {
  if (record) {
    Object.assign(form, { id: null, name: '', sort: 0, parent_id: 0, icon: '', status: 1 }, record)
  } else {
    Object.assign(form, { id: null, name: '', sort: 0, parent_id: parentId || 0, icon: '', status: 1 })
  }
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { Message.warning(t('category.msg_enter_name')); return }
  try {
    const payload = { name: form.name, sort: form.sort, parent_id: form.parent_id || 0, icon: form.icon, status: form.status }
    if (form.id) { await updateCategory(form.id, payload); Message.success(t('category.msg_update_success')) }
    else { await createCategory(payload); Message.success(t('category.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('category.msg_operation_failed')) }
}

const handleDelete = (node) => {
  Modal.warning({
    title: t('category.confirm_delete_title'),
    content: t('category.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteCategory(node.id); Message.success(t('category.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('category.msg_delete_failed')) }
    }
  })
}

const handleToggleStatus = async (node) => {
  try {
    await updateCategoryStatus(node.id, { status: node.status === 1 ? 0 : 1 })
    Message.success(node.status === 1 ? t('category.msg_disabled') : t('category.msg_enabled'))
    loadData()
  } catch (error) { Message.error(t('category.msg_operation_failed')) }
}

onMounted(() => loadData())
</script>

<style>
.page-content {
  min-height: 100%;
  background: var(--color-surface);
}

.header-actions {
  align-items: center;
}

.tree-surface {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
  overflow: hidden;
  position: relative;
}

.tree-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px 96px 280px;
  padding: 0 20px;
  height: 40px;
  align-items: center;
  border-bottom: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-low);
}

.tree-head span {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.col-sort { text-align: right; }
.col-status { text-align: center; }
.col-ops { text-align: right; }


.t-node.is-child .t-row {
  background: var(--color-surface-container-low);
}

.t-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px 96px 280px;
  align-items: center;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid var(--color-outline-variant);
  transition: background 0.15s;
  cursor: default;
}

.t-row:hover { background: var(--color-surface-container); }
.t-node.is-child .t-row:hover { background: var(--color-surface-container); }


.t-name-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.t-expand {
  appearance: none;
  background: none;
  border: none;
  color: var(--color-on-surface-variant);
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
  flex-shrink: 0;
  margin-right: 4px;
}

.t-expand:hover { color: var(--color-on-surface); background: var(--color-surface-container); }
.t-expand.open { transform: rotate(90deg); }
.t-expand-ph { width: 22px; height: 22px; flex-shrink: 0; margin-right: 4px; }

.t-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.t-icon.root {
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}

.t-icon.leaf {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-container);
  color: var(--color-on-surface-variant);
}

.t-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.t-sort {
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  color: var(--color-on-surface-variant);
  text-align: right;
  padding-right: 8px;
}

.t-status { text-align: center; }

.t-ops {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}


@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
  .tree-head,
  .t-row {
    grid-template-columns: minmax(0, 1fr) 60px 80px 200px;
  }
}
</style>
