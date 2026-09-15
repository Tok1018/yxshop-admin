<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('menu.title') }}</h1>
        <p class="page-subtitle">{{ t('menu.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-ghost btn-sm" @click="expandedKeys = allKeys">
          <icon-down />
          {{ t('menu.expand_all') }}
        </button>
        <button class="btn-ghost btn-sm" @click="expandedKeys = []">
          <icon-up />
          {{ t('menu.collapse_all') }}
        </button>
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('menu.add_menu') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="searchKeyword" :placeholder="t('menu.search_placeholder')" :aria-label="t('menu.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="tree-card card-shadow">
      <div class="tree-header">
        <span class="th-name">{{ t('menu.th_name') }}</span>
        <span class="th-icon">{{ t('menu.th_icon') }}</span>
        <span class="th-url">{{ t('menu.th_url') }}</span>
        <span class="th-sort">{{ t('menu.th_sort') }}</span>
        <span class="th-show">{{ t('menu.th_show') }}</span>
        <span class="th-actions">{{ t('menu.th_actions') }}</span>
      </div>
      <div class="tree-body">
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
        />
        <div v-if="hasNoMenuData" class="empty-row">{{ t('menu.empty_data') }}</div>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <a-drawer
      v-model:visible="formVisible"
      :title="form.id ? t('menu.edit_menu') : t('menu.add_menu')"
      :width="420"
      class="arco-drawer-md3"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('menu.section_basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('menu.label_parent_menu') }}</label>
          <a-tree-select v-model="form.parent_id" :data="menuTreeData" :placeholder="t('menu.placeholder_top_menu')" allow-clear />
        </div>
        <div class="form-group">
          <label>{{ t('menu.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('menu.placeholder_name')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('menu.label_icon') }}</label>
          <sa-icon-picker v-model="form.icon" />
        </div>
        <div class="form-group">
          <label>{{ t('menu.label_url') }}</label>
          <input v-model="form.url" :placeholder="t('menu.placeholder_url')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('menu.label_model') }}</label>
          <input v-model="form.model" :placeholder="t('menu.placeholder_model')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('menu.label_sort') }}</label>
            <input v-model.number="form.sort" type="number" :min="0" placeholder="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('menu.label_is_show') }}</label>
            <sa-switch v-model="form.is_show" :checked-value="1" :unchecked-value="0" />
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('menu.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('menu.btn_save_changes') : t('menu.btn_create_menu') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, h, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconRight, IconDown, IconUp, IconPlus, IconSearch, IconApps, IconMenu } from '@arco-design/web-vue/es/icon'
import { resolveComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const { t } = useI18n()

const TreeNode = {
  name: 'TreeNode',
  props: {
    node: Object,
    depth: { type: Number, default: 0 },
    expandedKeys: { type: Array, default: () => [] }
  },
  emits: ['toggle', 'edit', 'add-child', 'delete'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0)
    const isExpanded = computed(() => props.expandedKeys.includes(props.node.id))
    const indent = computed(() => props.depth * 20)

    const toggle = () => emit('toggle', props.node.id)
    const edit = () => emit('edit', props.node)
    const addChild = () => emit('add-child', props.node.id)
    const del = () => emit('delete', props.node)

    return () => h('div', { class: 'tree-node' }, [
      h('div', { class: 'node-row' }, [
        h('div', { class: 'node-name-cell', style: { paddingLeft: `${indent.value}px` } }, [
          hasChildren.value
            ? h('button', { class: ['expand-btn', { expanded: isExpanded.value }], onClick: toggle }, [
                h(IconRight, { size: 12 })
              ])
            : h('span', { class: 'expand-placeholder' }),
          h('div', { class: props.depth === 0 ? 'node-icon' : 'node-icon sub' }, [
            props.node.icon
              ? h(resolveComponent('SaIcon'), { icon: props.node.icon, size: props.depth === 0 ? 14 : 12 })
              : (props.depth === 0 ? h(IconApps, { size: 14 }) : h(IconMenu, { size: 12 }))
          ]),
          h('span', { class: 'node-name' }, props.node.name),
        ]),
        h('span', { class: 'node-icon-cell mono' }, props.node.icon || '-'),
        h('span', { class: 'node-url mono' }, props.node.url || '-'),
        h('span', { class: 'node-sort mono' }, props.node.sort || 0),
        h('span', { class: 'node-show' }, [
          h('span', { class: ['badge', props.node.is_show === 1 ? 'active' : 'inactive'] }, props.node.is_show === 1 ? t('menu.show_visible') : t('menu.show_hidden'))
        ]),
        h('span', { class: 'node-actions' }, [
          h('button', { class: 'btn-sm btn-ghost', onClick: edit }, t('common.edit')),
          h('button', { class: 'btn-sm btn-ghost', onClick: addChild }, t('menu.btn_add_child')),
          h('button', { class: 'btn-sm btn-danger', onClick: del }, t('common.delete'))
        ])
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
              'onDelete': (n) => emit('delete', n)
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
const form = reactive({ id: null, parent_id: 0, name: '', icon: '', url: '', model: '', sort: 0, is_show: 1 })

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const hasNoMenuData = computed(() => !treeData.value.length && !loading.value)
const treeData = computed(() => {
  if (!searchKeyword.value) return list.value
  const filterTree = (items) => {
    return items
      .filter(item => item.name?.includes(searchKeyword.value))
      .map(item => ({
        ...item,
        children: item.children ? filterTree(item.children) : []
      }))
  }
  return filterTree(list.value)
})

const collectIds = (items) => {
  const ids = []
  items.forEach(item => {
    if (item.children && item.children.length) {
      ids.push(item.id)
      ids.push(...collectIds(item.children))
    }
  })
  return ids
}

const toTreeSelectData = (items) => {
  return items.map(item => ({
    key: item.id,
    title: item.name,
    value: item.id,
    children: item.children && item.children.length ? toTreeSelectData(item.children) : undefined
  }))
}

const allKeys = computed(() => collectIds(list.value))

const menuTreeData = computed(() => toTreeSelectData(list.value))

const toggleExpand = (id) => {
  if (expandedKeys.value.includes(id)) {
    expandedKeys.value = expandedKeys.value.filter(k => k !== id)
  } else {
    expandedKeys.value = [...expandedKeys.value, id]
  }
}

const openForm = (record, parentId) => {
  Object.assign(form, { id: null, parent_id: 0, name: '', icon: '', url: '', model: '', sort: 0, is_show: 1 })
  if (record) Object.assign(form, record)
  else if (parentId) form.parent_id = parentId
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { Message.warning(t('menu.msg_enter_name')); return }
  try {
    if (form.id) { await updateMenu(form.id, form); Message.success(t('menu.msg_update_success')) }
    else { await createMenu(form); Message.success(t('menu.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('menu.msg_operation_failed')) }
}

const handleDelete = (node) => {
  Modal.warning({
    title: t('menu.confirm_delete_title'),
    content: t('menu.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteMenu(node.id); Message.success(t('menu.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('menu.msg_delete_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMenuTree()
    list.value = res.data?.list || res.data || []
    expandedKeys.value = allKeys.value
  } catch (error) { Message.error(t('menu.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style>
.page-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}


.tree-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  flex: 1;
  min-height: 0;
}

.tree-header {
  display: grid;
  grid-template-columns: 1fr 60px 120px 60px 70px 200px;
  padding: var(--spacing-sm) var(--spacing-base);
  border-bottom: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-low);
}

.tree-header span {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-on-surface-variant);
  font-weight: 600;
}


.th-sort { text-align: right; padding-right: 8px; }
.th-show { text-align: center; }
.th-actions { text-align: right; }

.tree-body { padding: 0; }

.node-row {
  display: grid;
  grid-template-columns: 1fr 60px 120px 60px 70px 200px;
  align-items: center;
  padding: 10px var(--spacing-base);
  border-bottom: 1px solid var(--color-outline-variant);
  transition: background 0.15s;
}

.node-row:hover { background: var(--color-surface-container-low); }


.expand-btn {
  background: none;
  border: none;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  margin-right: 4px;
  flex-shrink: 0;
}

.expand-btn.expanded { transform: rotate(90deg); }

.expand-placeholder { width: 20px; height: 20px; margin-right: 4px; flex-shrink: 0; }

.node-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.node-icon.sub {
  width: 24px;
  height: 24px;
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
}

.node-name-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  overflow: hidden;
}

.node-name {
  color: var(--color-on-surface);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.node-icon-cell { font-size: 11px; color: var(--color-on-surface-variant); }
.node-url { font-size: 11px; color: var(--color-on-surface-variant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.node-sort { color: var(--color-on-surface-variant); text-align: right; padding-right: 8px; }
.node-show { text-align: center; }
.node-actions { text-align: right; display: flex; gap: 6px; justify-content: flex-end; align-items: center; }


.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 500;
}

.badge.active {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}

.badge.inactive {
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
}

.empty-row { padding: 60px var(--spacing-base); color: var(--color-on-surface-variant); }

.table-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}

.spinner { width: 20px; height: 20px; border-top-color: var(--color-primary); animation: md3-spin 0.7s linear infinite; }

@keyframes md3-spin { to { transform: rotate(360deg); } }

.form-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0 0 var(--spacing-lg);
}

.form-group { margin-bottom: var(--spacing-base); }

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
  margin-bottom: 6px;
}

.form-input { padding: 8px var(--spacing-sm); }

.form-row { display: flex; gap: var(--spacing-sm); }

@media (max-width: var(--breakpoint-md)) {
  .tree-header,
  .node-row {
    grid-template-columns: 1fr 60px 60px 70px 140px;
  }
  .th-icon,
  .node-icon-cell { display: none; }
}
</style>
