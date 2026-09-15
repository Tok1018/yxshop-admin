<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('promotions.title') }}</h1>
        <p class="page-subtitle">{{ t('promotions.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('promotions.add_promotion') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('promotions.search_placeholder')" :aria-label="t('promotions.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('promotions.th_name') }}</th>
              <th>{{ t('promotions.th_type') }}</th>
              <th>{{ t('promotions.th_rule') }}</th>
              <th>{{ t('promotions.th_time') }}</th>
              <th>{{ t('promotions.th_status') }}</th>
              <th class="col-actions">{{ t('promotions.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.title }}</td>
              <td><span class="badge" :class="getTypeBadgeClass(record.type)">{{ activityTypeText(record.type) }}</span></td>
              <td class="mono muted">{{ formatRule(record.rule) }}</td>
              <td class="mono muted">{{ formatTimeRange(record.start_time, record.end_time) }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('promotions.status_enabled') : t('promotions.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('promotions.empty_data') }}</span>
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
      <span class="total-text">{{ t('promotions.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('promotions.edit_promotion') : t('promotions.add_promotion_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('promotions.section_basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('promotions.label_name') }} <span class="required">*</span></label>
          <input v-model="form.title" :placeholder="t('promotions.placeholder_name')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('promotions.label_type') }}</label>
            <select v-model.number="form.type" class="form-input">
              <option :value="1">{{ t('promotions.type_full_reduction') }}</option>
              <option :value="2">{{ t('promotions.type_discount') }}</option>
              <option :value="3">{{ t('promotions.type_gift') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('promotions.label_status') }}</label>
            <select v-model.number="form.status" class="form-input">
              <option :value="1">{{ t('promotions.status_enabled') }}</option>
              <option :value="0">{{ t('promotions.status_disabled') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('promotions.label_rule') }}</label>
          <textarea v-model="formRuleText" class="form-input" rows="4" :placeholder="t('promotions.placeholder_rule')"></textarea>
          <p class="form-hint">{{ t('promotions.rule_hint') }}</p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('promotions.label_start_time') }}</label>
            <a-date-picker v-model="formStartTime" show-time value-format="timestamp" class="form-input" style="width:100%" />
          </div>
          <div class="form-group">
            <label>{{ t('promotions.label_end_time') }}</label>
            <a-date-picker v-model="formEndTime" show-time value-format="timestamp" class="form-input" style="width:100%" />
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('promotions.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? t('promotions.btn_saving') : (form.id ? t('promotions.btn_save_changes') : t('promotions.btn_create')) }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getPromotionList, createPromotion, updatePromotion, deletePromotion } from '@/api/promotions'

const { t } = useI18n({ useScope: 'global' })

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20

const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '' })
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, title: '', type: 1, status: 1 })
const formRuleText = ref('')
const formStartTime = ref(null)
const formEndTime = ref(null)

const activityTypeText = (type) => ({ 1: t('promotions.type_full_reduction'), 2: t('promotions.type_discount'), 3: t('promotions.type_gift') }[type] ?? t('promotions.type_unknown'))

const getTypeBadgeClass = (type) => ({ 1: 'badge-info', 2: 'badge-warning', 3: 'badge-success' }[type] ?? 'badge-info')

const formatRule = (rule) => {
  if (!rule || typeof rule !== 'object') return '-'
  if (rule.discount != null) return `${(rule.discount * 10).toFixed(1)}折`
  const parts = Object.entries(rule).map(([k, v]) => `${k}减${v}`)
  return parts.join('，') || '-'
}

const formatTimeRange = (start, end) => {
  const fmt = (ts) => {
    if (!ts) return '-'
    const d = new Date(ts * 1000)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return `${fmt(start)} ~ ${fmt(end)}`
}

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const openForm = (record) => {
  if (record) {
    form.id = record.id
    form.title = record.title || ''
    form.type = record.type ?? 1
    form.status = record.status ?? 1
    formRuleText.value = record.rule ? JSON.stringify(record.rule, null, 2) : ''
    formStartTime.value = record.start_time ? record.start_time * 1000 : null
    formEndTime.value = record.end_time ? record.end_time * 1000 : null
  } else {
    form.id = null
    form.title = ''
    form.type = 1
    form.status = 1
    formRuleText.value = ''
    formStartTime.value = null
    formEndTime.value = null
  }
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title?.trim()) { Message.warning(t('promotions.msg_enter_name')); return }
  let rule = {}
  if (formRuleText.value.trim()) {
    try { rule = JSON.parse(formRuleText.value) }
    catch (e) { Message.error(t('promotions.msg_invalid_rule')); return }
  }
  const data = {
    title: form.title,
    type: form.type,
    status: form.status,
    rule,
    start_time: formStartTime.value ? Math.floor(formStartTime.value / 1000) : null,
    end_time: formEndTime.value ? Math.floor(formEndTime.value / 1000) : null,
  }
  submitting.value = true
  try {
    if (form.id) { await updatePromotion(form.id, data); Message.success(t('promotions.msg_update_success')) }
    else { await createPromotion(data); Message.success(t('promotions.msg_create_success')) }
    formVisible.value = false; loadData()
  } catch (e) { Message.error(t('promotions.msg_operation_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('promotions.confirm_delete_title'),
    content: t('promotions.confirm_delete_msg', { name: record.title }),
    hideCancel: false,
    onOk: async () => {
      try { await deletePromotion(record.id); Message.success(t('promotions.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('promotions.msg_delete_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getPromotionList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('promotions.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>


.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.table-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}


@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
}
</style>
