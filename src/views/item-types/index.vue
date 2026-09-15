<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('item_types.title') }}</h1>
        <p class="page-subtitle">{{ t('item_types.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('item_types.add_type') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('item_types.search_placeholder')" :aria-label="t('item_types.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-name">{{ t('item_types.type_name') }}</th>
              <th class="col-sort">{{ t('item_types.sort') }}</th>
              <th class="col-status">{{ t('item_types.status') }}</th>
              <th class="col-time">{{ t('item_types.created_at') }}</th>
              <th class="col-actions">{{ t('item_types.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>
                <div class="name-cell">
                  <div class="type-icon">
                    <icon-apps />
                  </div>
                  <span class="type-name">{{ r.name }}</span>
                </div>
              </td>
              <td class="mono">{{ r.sort ?? 0 }}</td>
              <td><span class="badge" :class="r.status === 1 ? 'badge-success' : 'badge-error'">{{ r.status === 1 ? t('item_types.enabled') : t('item_types.disabled') }}</span></td>
              <td class="mono">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(r)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(r)">{{ r.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('item_types.no_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('item_types.total', { count: total }) }}</span>
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
      :title="form.id ? t('item_types.edit_type') : t('item_types.add_type')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('item_types.basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('item_types.type_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('item_types.type_name_placeholder')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('item_types.sort_value') }}</label>
            <input v-model.number="form.sort" type="number" :min="0" placeholder="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('item_types.status') }}</label>
            <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('item_types.enabled')" :unchecked-text="t('item_types.disabled')" />
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('item_types.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting">{{ t('item_types.saving') }}</span>
          <span v-else>{{ form.id ? t('item_types.save_modify') : t('item_types.create_type') }}</span>
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconApps } from '@arco-design/web-vue/es/icon'
import { getItemTypesList, createItemTypes, updateItemTypes, deleteItemTypes, updateItemTypesStatus } from '@/api/item_types'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })
const formVisible = ref(false)
const form = reactive({ id: null, name: '', sort: 0, status: 1 })
const drawerWidth = 'min(480px, 90vw)'

const showListEmpty = computed(() => !list.value.length && !loading.value)
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getItemTypesList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('item_types.load_failed')) }
  finally { loading.value = false }
}

const openForm = (record) => {
  if (record) Object.assign(form, { id: null, name: '', sort: 0, status: 1 }, record)
  else Object.assign(form, { id: null, name: '', sort: 0, status: 1 })
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name?.trim()) { Message.warning(t('item_types.type_name_placeholder')); return }
  submitting.value = true
  try {
    if (form.id) {
      await updateItemTypes(form.id, form)
      Message.success(t('item_types.update_success'))
    } else {
      await createItemTypes(form)
      Message.success(t('item_types.create_success'))
    }
    formVisible.value = false
    loadData()
  } catch (e) { Message.error(t('item_types.operation_failed')) }
  finally { submitting.value = false }
}

const toggleStatus = async (record) => {
  try {
    await updateItemTypesStatus(record.id, record.status === 1 ? 0 : 1)
    Message.success(record.status === 1 ? t('item_types.disabled') : t('item_types.enabled'))
    loadData()
  } catch (error) { Message.error(t('item_types.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('item_types.delete_confirm'), content: t('item_types.confirm_delete', { name: record.name }), hideCancel: false, onOk: async () => { try { await deleteItemTypes(record.id); Message.success(t('item_types.delete_success')); loadData() } catch (error) { Message.error(t('item_types.delete_failed')) } } })
}

onMounted(() => loadData())
</script>

<style scoped>
.col-name {
  padding-left: 20px;
}

.col-sort, .col-status, .col-time {
  text-align: center;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.type-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
}

@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
}
</style>
