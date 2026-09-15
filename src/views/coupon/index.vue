<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('coupon.title') }}</h1>
        <p class="page-subtitle">{{ t('coupon.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('coupon.add_coupon') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('coupon.search_placeholder')" :aria-label="t('coupon.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('coupon.th_name') }}</th>
              <th>{{ t('coupon.th_type') }}</th>
              <th>{{ t('coupon.th_value') }}</th>
              <th>{{ t('coupon.th_min_amount') }}</th>
              <th>{{ t('coupon.th_validity') }}</th>
              <th>{{ t('coupon.th_status') }}</th>
              <th class="col-actions">{{ t('coupon.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>
                <div class="name-cell">
                  <div class="coupon-icon">
                    <icon-tag />
                  </div>
                  <span>{{ r.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getTypeBadgeClass(r.type)">
                  {{ getTypeLabel(r.type) }}
                </span>
              </td>
              <td class="mono">
                <span class="val-highlight">
                  {{ getValueLabel(r) }}
                </span>
              </td>
              <td class="mono muted">¥{{ r.min_amount ?? 0 }}</td>
              <td class="mono muted date-cell">{{ formatDateRange(r.start_at, r.end_at) }}</td>
              <td>
                <span class="badge" :class="r.status === 1 ? 'badge-success' : 'badge-error'">
                  {{ getStatusLabel(r.status) }}
                </span>
              </td>
               <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(r)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(r)">{{ getToggleLabel(r.status) }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="isListEmpty">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('coupon.empty_data') }}</span>
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
      <span class="total-text">{{ t('coupon.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="isEditing ? t('coupon.edit_coupon') : t('coupon.add_coupon')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('coupon.section_basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('coupon.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :placeholder="t('coupon.placeholder_name')" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('coupon.label_type') }}</label>
            <select v-model.number="form.type" class="form-input">
              <option :value="1">{{ t('coupon.option_full_reduction') }}</option>
              <option :value="2">{{ t('coupon.option_discount') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('coupon.label_status') }}</label>
            <select v-model.number="form.status" class="form-input">
              <option :value="1">{{ t('coupon.option_enabled') }}</option>
              <option :value="0">{{ t('coupon.option_disabled') }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('coupon.label_value') }}</label>
            <input v-model.number="form.value" type="number" :min="0" class="form-input" :placeholder="t('coupon.placeholder_value')" />
          </div>
          <div class="form-group">
            <label>{{ t('coupon.label_min_amount') }}</label>
            <input v-model.number="form.min_amount" type="number" :min="0" class="form-input" :placeholder="t('coupon.placeholder_min_amount')" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('coupon.label_start_date') }}</label>
            <input v-model="form.start_date" type="date" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('coupon.label_end_date') }}</label>
            <input v-model="form.end_date" type="date" class="form-input" />
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('coupon.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ getSubmitLabel() }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconSearch, IconTag } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getCouponList, getCouponDetail, createCoupon, updateCoupon, deleteCoupon, updateCouponStatus } from '@/api/coupon'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })
const formVisible = ref(false)
const form = reactive({
  id: null,
  name: '',
  type: 1,
  value: 0,
  min_amount: 0,
  start_date: '',
  end_date: '',
  status: 1,
  expiry_type: 20,
  scope: 10,
  total_quantity: -1
})

const drawerWidth = 'min(480px, 90vw)'

const isListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const isEditing = computed(() => form.id !== null && form.id !== undefined)

let searchTimer = null

const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400)
}

const formatDate = (d) => {
  if (!d) return '-'
  const n = Number(d)
  if (!isNaN(n) && n > 0) {
    return new Date(n * 1000).toISOString().substring(0, 10)
  }
  if (typeof d === 'string' && d.length > 10) return d.substring(0, 10)
  return '-'
}

const timestampToDate = (ts) => {
  if (!ts) return ''
  const n = Number(ts)
  if (!n || n <= 0) return ''
  return new Date(n * 1000).toISOString().substring(0, 10)
}

const dateToTimestamp = (dateStr) => {
  if (!dateStr) return 0
  const ts = Math.floor(new Date(dateStr).getTime() / 1000)
  return isNaN(ts) ? 0 : ts
}

const formatDateRange = (s, e) => {
  const a = formatDate(s)
  const b = formatDate(e)
  if (a === '-' && b === '-') return '-'
  return a + ' ~ ' + b
}

const getTypeBadgeClass = (type) => type === 1 ? 'badge-info' : 'badge-warning'

const getTypeLabel = (type) => type === 1 ? t('coupon.type_full_reduction') : t('coupon.type_discount')

const getValueLabel = (r) => {
  if (r.type === 1) return '¥' + (r.discount_amount ?? 0)
  return (r.discount_rate ?? 0) + '折'
}

const getStatusLabel = (status) => status === 1 ? t('coupon.status_enabled') : t('coupon.status_disabled')

const getToggleLabel = (status) => status === 1 ? t('coupon.status_disabled') : t('coupon.status_enabled')

const getSubmitLabel = () => {
  if (submitting.value) return t('coupon.btn_saving')
  if (isEditing.value) return t('coupon.btn_save_changes')
  return t('coupon.btn_create_coupon')
}

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k]
    })
    const res = await getCouponList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) {
    Message.error(t('coupon.msg_load_failed'))
  } finally {
    loading.value = false
  }
}

const defaultForm = () => ({
  id: null,
  name: '',
  type: 1,
  value: 0,
  min_amount: 0,
  start_date: '',
  end_date: '',
  status: 1,
  expiry_type: 20,
  scope: 10,
  total_quantity: -1
})

const openForm = (record) => {
  if (record) {
    const value = record.type === 1
      ? (record.discount_amount ?? 0)
      : (record.discount_rate ?? 0)
    Object.assign(form, defaultForm(), {
      id: record.id,
      name: record.name ?? '',
      type: record.type ?? 1,
      value: Number(value),
      min_amount: Number(record.min_amount ?? 0),
      start_date: timestampToDate(record.start_at),
      end_date: timestampToDate(record.end_at),
      status: record.status ?? 1,
      expiry_type: record.expiry_type ?? 20,
      scope: record.scope ?? 10,
      total_quantity: record.total_quantity ?? -1
    })
  } else {
    Object.assign(form, defaultForm())
  }
  formVisible.value = true
}

const buildPayload = () => {
  const payload = {
    name: form.name,
    type: form.type,
    min_amount: form.min_amount,
    status: form.status,
    expiry_type: form.expiry_type,
    scope: form.scope,
    total_quantity: form.total_quantity
  }
  if (form.type === 1) {
    payload.discount_amount = form.value
    payload.discount_rate = 0
  } else {
    payload.discount_rate = form.value
    payload.discount_amount = 0
  }
  if (form.start_date) payload.start_at = dateToTimestamp(form.start_date)
  if (form.end_date) payload.end_at = dateToTimestamp(form.end_date)
  return payload
}

const handleSubmit = async () => {
  if (!form.name || !form.name.trim()) {
    Message.warning(t('coupon.msg_enter_name'))
    return
  }
  submitting.value = true
  try {
    const payload = buildPayload()
    if (form.id) {
      await updateCoupon(form.id, payload)
      Message.success(t('coupon.msg_update_success'))
    } else {
      await createCoupon(payload)
      Message.success(t('coupon.msg_create_success'))
    }
    formVisible.value = false
    loadData()
  } catch (e) {
    Message.error(t('coupon.msg_operation_failed'))
  } finally {
    submitting.value = false
  }
}

const toggleStatus = async (record) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await updateCouponStatus(record.id, newStatus)
    Message.success(newStatus === 1 ? t('coupon.msg_enabled') : t('coupon.msg_disabled'))
    loadData()
  } catch (error) {
    Message.error(t('coupon.msg_operation_failed'))
  }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('coupon.confirm_delete_title'),
    content: t('coupon.confirm_delete_msg', { name: record.name }),
    hideCancel: false,
    onOk: async () => {
      try {
        await deleteCoupon(record.id)
        Message.success(t('coupon.msg_delete_success'))
        loadData()
      } catch (error) {
        Message.error(t('coupon.msg_delete_failed'))
      }
    }
  })
}

onMounted(() => loadData())
</script>

<style scoped>


.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coupon-icon {
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

.name-cell span {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
}

.val-highlight {
  color: var(--color-tertiary);
  font-weight: 700;
}

.date-cell {
  font-size: 11px;
}

@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
}
</style>
