<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('item_attributes.title') }}</h1>
        <p class="page-subtitle">{{ t('item_attributes.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('item_attributes.add_attribute') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('item_attributes.search_placeholder')" :aria-label="t('item_attributes.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-name">{{ t('item_attributes.col_name') }}</th>
              <th class="col-values">{{ t('item_attributes.col_values') }}</th>
              <th class="col-sort">{{ t('item_attributes.col_sort') }}</th>
              <th class="col-time">{{ t('item_attributes.col_created_at') }}</th>
              <th class="col-actions">{{ t('item_attributes.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>
                <div class="name-cell">
                  <div class="attr-icon">
                    <icon-layers />
                  </div>
                  <span class="attr-name">{{ r.name || '-' }}</span>
                </div>
              </td>
              <td>
                <div class="values-wrap">
                  <span v-for="(v, i) in splitValues(r.values)" :key="i" class="value-tag">{{ v }}</span>
                  <span v-if="!splitValues(r.values).length" class="muted">-</span>
                </div>
              </td>
              <td class="mono">{{ r.sort ?? 0 }}</td>
              <td class="mono">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(r)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('item_attributes.no_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('item_attributes.total_count', { count: total }) }}</span>
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
      :title="form.id ? t('item_attributes.edit_attribute') : t('item_attributes.add_attribute')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('item_attributes.basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('item_attributes.col_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('item_attributes.name_placeholder')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('item_attributes.sort_value') }}</label>
          <input v-model.number="form.sort" type="number" :min="0" placeholder="0" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('item_attributes.col_values') }}</label>
          <textarea v-model="form.values" class="form-textarea" rows="4" :placeholder="t('item_attributes.values_placeholder')"></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('item_attributes.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting">{{ t('item_attributes.saving') }}</span>
          <span v-else>{{ form.id ? t('item_attributes.save_changes') : t('item_attributes.create_attribute') }}</span>
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconLayers } from '@arco-design/web-vue/es/icon'
import { getItemAttributesList, createItemAttributes, updateItemAttributes, deleteItemAttributes } from '@/api/item_attributes'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })
const formVisible = ref(false)
const form = reactive({ id: null, name: '', sort: 0, values: '' })
const drawerWidth = 'min(480px, 90vw)'

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts)
    ? new Date(Number(ts) * 1000)
    : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const splitValues = (v) => {
  if (!v) return []
  return String(v).split(/[,，]/).map(s => s.trim()).filter(Boolean)
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
    const res = await getItemAttributesList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('item_attributes.operation_failed')) }
  finally { loading.value = false }
}

const openForm = (record) => {
  if (record) Object.assign(form, { id: null, name: '', sort: 0, values: '' }, record)
  else Object.assign(form, { id: null, name: '', sort: 0, values: '' })
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name?.trim()) { Message.warning(t('item_attributes.please_input_name')); return }
  submitting.value = true
  try {
    const payload = { name: form.name, sort: form.sort, values: form.values }
    if (form.id) { await updateItemAttributes(form.id, payload); Message.success(t('item_attributes.update_success')) }
    else { await createItemAttributes(payload); Message.success(t('item_attributes.create_success')) }
    formVisible.value = false; loadData()
  } catch (e) { Message.error(t('item_attributes.operation_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('item_attributes.delete_confirm_title'), content: t('item_attributes.delete_confirm_content', { name: record.name }), hideCancel: false, onOk: async () => { try { await deleteItemAttributes(record.id); Message.success(t('item_attributes.delete_success')); loadData() } catch (error) { Message.error(t('item_attributes.delete_failed')) } } })
}

onMounted(() => loadData())
</script>

<style scoped>
.col-name {
  padding-left: 20px;
}

.col-sort, .col-time {
  text-align: center;
}

.values-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.value-tag {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(var(--color-secondary-rgb), 0.16);
  color: var(--color-on-surface);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.attr-icon {
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

.attr-name {
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
