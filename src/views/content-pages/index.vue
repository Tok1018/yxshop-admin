<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('content_page.title') }}</h1>
        <p class="page-subtitle">{{ t('content_page.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('content_page.add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('content_page.search_placeholder')" :aria-label="t('content_page.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.page_type" class="filter-select" @change="loadData">
        <option value="">{{ t('content_page.all_type') }}</option>
        <option value="about">{{ t('content_page.type_about') }}</option>
        <option value="terms">{{ t('content_page.type_terms') }}</option>
        <option value="privacy">{{ t('content_page.type_privacy') }}</option>
        <option value="faq">{{ t('content_page.type_faq') }}</option>
        <option value="contact">{{ t('content_page.type_contact') }}</option>
        <option value="custom">{{ t('content_page.type_custom') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('content_page.th_title') }}</th>
              <th>{{ t('content_page.th_slug') }}</th>
              <th>{{ t('content_page.th_type') }}</th>
              <th>{{ t('content_page.th_sort') }}</th>
              <th>{{ t('content_page.th_status') }}</th>
              <th>{{ t('content_page.th_time') }}</th>
              <th class="col-actions">{{ t('content_page.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="title-cell">{{ record.title || '-' }}</td>
              <td class="mono muted">{{ record.slug || '-' }}</td>
              <td><span class="badge badge-info">{{ typeLabel(record.page_type) }}</span></td>
              <td class="mono muted">{{ record.sort || 0 }}</td>
              <td><span :class="record.status === 1 ? 'badge badge-success' : 'badge badge-error'">{{ record.status === 1 ? t('common.enabled') : t('common.disabled') }}</span></td>
              <td class="mono muted">{{ formatTime(record.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleShow(record)">{{ record.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('common.noData') }}</span>
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
      <span class="total-text">{{ t('common.total', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-drawer v-model:visible="formVisible" :title="form.id ? t('common.edit') : t('content_page.add')" class="arco-drawer-md3" :width="'min(640px, 90vw)'" unmount-on-close>
      <div class="form-section">
        <div class="form-group">
          <label>{{ t('content_page.label_title') }} <span class="required">*</span></label>
          <input v-model="form.title" class="form-input" :placeholder="t('content_page.placeholder_title')" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('content_page.label_slug') }}</label>
            <input v-model="form.slug" class="form-input" :placeholder="t('content_page.placeholder_slug')" />
          </div>
          <div class="form-group">
            <label>{{ t('content_page.label_type') }}</label>
            <select v-model="form.page_type" class="form-input">
              <option value="about">{{ t('content_page.type_about') }}</option>
              <option value="terms">{{ t('content_page.type_terms') }}</option>
              <option value="privacy">{{ t('content_page.type_privacy') }}</option>
              <option value="faq">{{ t('content_page.type_faq') }}</option>
              <option value="contact">{{ t('content_page.type_contact') }}</option>
              <option value="custom">{{ t('content_page.type_custom') }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('content_page.label_sort') }}</label>
            <input v-model.number="form.sort" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('content_page.label_status') }}</label>
            <div class="switch-row">
              <input type="checkbox" v-model="form.status" true-value="1" false-value="0" class="toggle-checkbox" />
              <span class="muted">{{ form.status == 1 ? t('common.enabled') : t('common.disabled') }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('content_page.label_content') }}</label>
          <textarea v-model="form.content" class="form-textarea" rows="12" :placeholder="t('content_page.placeholder_content')"></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('common.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? t('common.submit') : (form.id ? t('content_page.save_changes') : t('content_page.create')) }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getContentPageList, createContentPage, updateContentPage, deleteContentPage } from '@/api/content-page'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const formVisible = ref(false)
const filters = ref({ keyword: '', page_type: '' })
const form = reactive({ id: null, title: '', slug: '', content: '', page_type: 'custom', sort: 0, status: 1 })

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const typeLabel = (type) => {
  const map = { about: t('content_page.type_about'), terms: t('content_page.type_terms'), privacy: t('content_page.type_privacy'), faq: t('content_page.type_faq'), contact: t('content_page.type_contact'), custom: t('content_page.type_custom') }
  return map[type] || type || '-'
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const openForm = (record) => {
  Object.assign(form, { id: null, title: '', slug: '', content: '', page_type: 'custom', sort: 0, status: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title) { Message.warning(t('content_page.placeholder_title')); return }
  submitting.value = true
  try {
    if (form.id) { await updateContentPage(form.id, form); Message.success(t('content_page.update_success')) }
    else { await createContentPage(form); Message.success(t('content_page.create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('content_page.operation_failed')) }
  finally { submitting.value = false }
}

const toggleShow = async (record) => {
  try {
    await updateContentPage(record.id, { status: record.status === 1 ? 0 : 1 })
    Message.success(record.status === 1 ? t('content_page.disabled_success') : t('content_page.enabled_success'))
    loadData()
  } catch (error) { Message.error(t('content_page.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('common.delete'),
    content: t('content_page.delete_confirm'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteContentPage(record.id); Message.success(t('content_page.delete_success')); loadData() }
      catch (error) { Message.error(t('content_page.operation_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getContentPageList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('content_page.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.title-cell {
  color: var(--color-on-surface);
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.switch-row { display: flex; align-items: center; gap: 10px; }
.toggle-checkbox { accent-color: var(--color-primary); width: 16px; height: 16px; cursor: pointer; }
.form-textarea { width: 100%; min-height: 200px; padding: var(--spacing-base); font-size: 13px; line-height: 1.6; border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); background: var(--color-surface-container-low); color: var(--color-on-surface); resize: vertical; font-family: inherit; }
.form-textarea:focus { outline: none; border-color: var(--color-primary); }
</style>