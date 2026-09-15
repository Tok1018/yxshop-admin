<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('advertisements.title') }}</h1>
        <p class="page-subtitle">{{ t('advertisements.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('advertisements.btn_add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('advertisements.search_placeholder')" :aria-label="t('advertisements.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.position" class="filter-select" @change="loadData">
        <option value="">{{ t('advertisements.all_position') }}</option>
        <option value="home_banner">{{ t('advertisements.pos_home_banner') }}</option>
        <option value="home_popup">{{ t('advertisements.pos_home_popup') }}</option>
        <option value="category_top">{{ t('advertisements.pos_category_top') }}</option>
        <option value="product_detail">{{ t('advertisements.pos_product_detail') }}</option>
      </select>
      <select v-model="filters.is_show" class="filter-select" @change="loadData">
        <option value="">{{ t('common.allStatus') }}</option>
        <option value="1">{{ t('common.enabled') }}</option>
        <option value="0">{{ t('common.disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('advertisements.th_title') }}</th>
              <th>{{ t('advertisements.th_position') }}</th>
              <th>{{ t('advertisements.th_image') }}</th>
              <th>{{ t('advertisements.th_link') }}</th>
              <th>{{ t('advertisements.th_sort') }}</th>
              <th>{{ t('advertisements.th_status') }}</th>
              <th>{{ t('advertisements.th_time') }}</th>
              <th class="col-actions">{{ t('advertisements.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="title-cell">{{ record.title || '-' }}</td>
              <td><span class="badge badge-info">{{ positionLabel(record.position) }}</span></td>
              <td><img v-if="record.image" :src="record.image" class="thumb-img" :alt="record.title" /><span v-else class="muted">-</span></td>
              <td class="mono muted" style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{{ record.link || '-' }}</td>
              <td class="mono muted">{{ record.sort || 0 }}</td>
              <td><span :class="record.is_show === 1 ? 'badge badge-success' : 'badge badge-error'">{{ record.is_show === 1 ? t('common.enabled') : t('common.disabled') }}</span></td>
              <td class="mono muted">{{ formatTime(record.start_time) }}<br/>~ {{ formatTime(record.end_time) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleShow(record)">{{ record.is_show === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="8" class="empty-row">
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

    <a-drawer v-model:visible="formVisible" :title="form.id ? t('advertisements.drawer_edit') : t('advertisements.drawer_add')" class="arco-drawer-md3" :width="'min(480px, 90vw)'" unmount-on-close>
      <div class="form-section">
        <h4>{{ t('advertisements.section_basic') }}</h4>
        <div class="form-group">
          <label>{{ t('advertisements.label_title') }} <span class="required">*</span></label>
          <input v-model="form.title" class="form-input" :placeholder="t('advertisements.placeholder_title')" />
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_position') }}</label>
          <select v-model="form.position" class="form-input">
            <option value="home_banner">{{ t('advertisements.pos_home_banner') }}</option>
            <option value="home_popup">{{ t('advertisements.pos_home_popup') }}</option>
            <option value="category_top">{{ t('advertisements.pos_category_top') }}</option>
            <option value="product_detail">{{ t('advertisements.pos_product_detail') }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_image') }}</label>
          <sa-upload-image v-model="form.image" />
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_link') }}</label>
          <input v-model="form.link" class="form-input" :placeholder="t('advertisements.placeholder_link')" />
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_time') }}</label>
          <div class="form-row">
            <input type="datetime-local" class="form-input" :value="datetimeLocal(form.start_time)" @change="form.start_time = toTimestamp($event.target.value)" />
            <span class="muted">~</span>
            <input type="datetime-local" class="form-input" :value="datetimeLocal(form.end_time)" @change="form.end_time = toTimestamp($event.target.value)" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('advertisements.label_status') }}</label>
          <div class="switch-row">
            <sa-switch v-model="form.is_show" :checked-value="1" :unchecked-value="0" />
            <span class="muted">{{ form.is_show === 1 ? t('common.enabled') : t('common.disabled') }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('common.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? t('common.submit') : (form.id ? t('advertisements.btn_save') : t('advertisements.btn_create')) }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getAdvertisementsList, createAdvertisements, updateAdvertisements, deleteAdvertisements } from '@/api/advertisements'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const formVisible = ref(false)
const filters = ref({ keyword: '', position: '', is_show: '' })

const showListEmpty = computed(() => !list.value.length && !loading.value)

const form = reactive({ id: null, title: '', position: 'home_banner', image: '', link: '', sort: 0, is_show: 1, start_time: 0, end_time: 0 })

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const positionLabel = (pos) => {
  const map = { home_banner: t('advertisements.pos_home_banner'), home_popup: t('advertisements.pos_home_popup'), category_top: t('advertisements.pos_category_top'), product_detail: t('advertisements.pos_product_detail') }
  return map[pos] || pos || '-'
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const datetimeLocal = (ts) => {
  if (!ts) return ''
  const d = new Date(Number(ts) * 1000)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const toTimestamp = (val) => {
  if (!val) return 0
  const d = new Date(val)
  return isNaN(d.getTime()) ? 0 : Math.floor(d.getTime() / 1000)
}

const openForm = (record) => {
  Object.assign(form, { id: null, title: '', position: 'home_banner', image: '', link: '', sort: 0, is_show: 1, start_time: 0, end_time: 0 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title) { Message.warning(t('advertisements.placeholder_title')); return }
  submitting.value = true
  try {
    if (form.id) { await updateAdvertisements(form.id, form); Message.success(t('advertisements.msg_update_success')) }
    else { await createAdvertisements(form); Message.success(t('advertisements.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('advertisements.msg_operation_failed')) }
  finally { submitting.value = false }
}

const toggleShow = async (record) => {
  try {
    await updateAdvertisements(record.id, { is_show: record.is_show === 1 ? 0 : 1 })
    Message.success(record.is_show === 1 ? t('advertisements.msg_disabled') : t('advertisements.msg_enabled'))
    loadData()
  } catch (error) { Message.error(t('advertisements.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('common.delete'),
    content: t('advertisements.confirm_delete'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteAdvertisements(record.id); Message.success(t('advertisements.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('advertisements.msg_operation_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getAdvertisementsList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('advertisements.msg_operation_failed')) }
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

.thumb-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
