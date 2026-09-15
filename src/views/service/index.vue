<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('service.title') }}</h1>
        <p class="page-subtitle">{{ t('service.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="handleExport">
          <icon-download />
          {{ t('service.btn_export') }}
        </button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrap tertiary"><icon-exclamation-circle /></div>
        <div class="stat-value">{{ stats.pending_count || 0 }}</div>
        <div class="stat-label">{{ t('service.stat_pending') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap secondary"><icon-calendar /></div>
        <div class="stat-value">{{ stats.today_count || 0 }}</div>
        <div class="stat-label">{{ t('service.stat_today') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap primary"><icon-check-circle /></div>
        <div class="stat-value">{{ statusCount(40) }}</div>
        <div class="stat-label">{{ t('service.stat_completed') }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap error"><icon-close-circle /></div>
        <div class="stat-value">{{ statusCount(50) }}</div>
        <div class="stat-label">{{ t('service.stat_rejected') }}</div>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('service.search_placeholder')" :aria-label="t('service.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.type" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('service.all_types') }}</option>
        <option value="1">{{ t('service.type_refund') }}</option>
        <option value="2">{{ t('service.type_return') }}</option>
        <option value="3">{{ t('service.type_exchange') }}</option>
        <option value="4">{{ t('service.type_repair') }}</option>
      </select>
      <select v-model="filters.status" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('service.all_status') }}</option>
        <option value="10">{{ t('service.status_pending') }}</option>
        <option value="20">{{ t('service.status_approved') }}</option>
        <option value="25">{{ t('service.status_return_shipped') }}</option>
        <option value="30">{{ t('service.status_received') }}</option>
        <option value="35">{{ t('service.status_refunding') }}</option>
        <option value="40">{{ t('service.status_completed') }}</option>
        <option value="50">{{ t('service.status_rejected') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th class="col-id">{{ t('service.th_id') }}</th>
              <th>{{ t('service.th_order') }}</th>
              <th>{{ t('service.th_user') }}</th>
              <th>{{ t('service.th_type') }}</th>
              <th>{{ t('service.th_reason') }}</th>
              <th class="col-center">{{ t('service.th_status') }}</th>
              <th>{{ t('service.th_time') }}</th>
              <th class="col-actions">{{ t('service.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id" :class="{ selected: selectedIds.includes(record.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" /></td>
              <td class="mono">{{ record.id }}</td>
              <td class="mono">{{ record.order_id || '-' }}</td>
              <td class="mono">{{ record.user_id ? '#' + record.user_id : '-' }}</td>
              <td><span class="badge badge-info">{{ typeText(record.sub_type) }}</span></td>
              <td class="reason-cell" :title="record.reasons_text">{{ record.reasons_text || '-' }}</td>
              <td class="col-center"><span class="badge" :class="statusBadgeClass(record.status)">{{ statusText(record.status) }}</span></td>
              <td class="mono muted">{{ formatTime(record.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button v-if="record.status === 10" class="btn-primary btn-sm" @click="doAction(record, 'approve')">{{ t('service.btn_approve') }}</button>
                <button v-if="record.status === 10" class="btn-danger btn-sm" @click="openReject(record)">{{ t('service.btn_reject') }}</button>
                <button v-if="record.status === 25" class="btn-ghost btn-sm" @click="doAction(record, 'receive')">{{ t('service.btn_receive') }}</button>
                <button v-if="record.status === 20 || record.status === 30" class="btn-ghost btn-sm" @click="doAction(record, 'refund')">{{ t('service.btn_refund') }}</button>
                <button v-if="record.status === 35" class="btn-ghost btn-sm" @click="doAction(record, 'complete')">{{ t('service.btn_complete') }}</button>
                <button class="btn-ghost btn-sm" @click="viewDetail(record)">{{ t('service.view_detail') }}</button>
              </td>
            </tr>
            <tr v-if="isEmpty">
              <td colspan="9" class="empty-row">
                <div class="empty-state"><span class="empty-text">{{ t('service.empty_data') }}</span></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('service.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('service.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-primary btn-sm" @click="batchApprove">{{ t('service.batch_approve') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []; selectAll = false">{{ t('service.cancel_select') }}</button>
    </div>

    <a-modal :visible="detailVisible" :title="t('service.detail_title')" :footer="false" :width="640" unmount-on-close @cancel="detailVisible = false">
      <div class="detail-grid" v-if="detail">
        <div class="detail-item"><span class="detail-label">{{ t('service.th_id') }}</span><span class="detail-value mono">{{ detail.id }}</span></div>
        <div class="detail-item"><span class="detail-label">{{ t('service.th_order') }}</span><span class="detail-value mono">{{ detail.order_id || '-' }}</span></div>
        <div class="detail-item"><span class="detail-label">{{ t('service.th_type') }}</span><span class="detail-value">{{ typeText(detail.sub_type) }}</span></div>
        <div class="detail-item"><span class="detail-label">{{ t('service.th_status') }}</span><span class="detail-value"><span class="badge" :class="statusBadgeClass(detail.status)">{{ statusText(detail.status) }}</span></span></div>
        <div class="detail-item"><span class="detail-label">{{ t('service.detail_num') }}</span><span class="detail-value mono">{{ detail.num ?? '-' }}</span></div>
        <div class="detail-item"><span class="detail-label">{{ t('service.detail_express_no') }}</span><span class="detail-value mono">{{ detail.express_no || '-' }}</span></div>
      </div>
      <div class="detail-section" v-if="detail && detail.reasons_text">
        <h4>{{ t('service.th_reason') }}</h4>
        <div class="content-box">{{ detail.reasons_text }}</div>
      </div>
      <div class="detail-section" v-if="detail && detail.seller_remark">
        <h4>{{ t('service.detail_seller_remark') }}</h4>
        <div class="content-box">{{ detail.seller_remark }}</div>
      </div>

      <div class="detail-section" v-if="detailImages.length">
        <h4>{{ t('service.detail_images') }}</h4>
        <div class="img-list">
          <img v-for="(img, i) in detailImages" :key="i" :src="img" alt="" />
        </div>
      </div>

      <div class="detail-section" v-if="detailRefunds.length">
        <h4>{{ t('service.detail_refunds') }}</h4>
        <div class="refund-list">
          <div class="refund-item" v-for="r in detailRefunds" :key="r.id">
            <span class="mono">{{ r.refund_no }}</span>
            <span class="refund-amount">¥{{ Number(r.refund_amount || 0).toFixed(2) }}</span>
            <span class="badge" :class="refundBadgeClass(r.refund_status)">{{ refundStatusText(r.refund_status) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-section" v-if="detailLogs.length">
        <h4>{{ t('service.detail_logs') }}</h4>
        <div class="timeline">
          <div class="tl-item" v-for="log in detailLogs" :key="log.id">
            <div class="tl-dot"></div>
            <div class="tl-body">
              <div class="tl-head">
                <span class="tl-action">{{ actionText(log.action) }}</span>
                <span class="tl-time mono muted">{{ formatTime(log.created_at) }}</span>
              </div>
              <div class="tl-meta muted">{{ log.actor_name || log.actor?.name || t('service.system') }}<template v-if="log.remark"> · {{ log.remark }}</template></div>
            </div>
          </div>
        </div>
      </div>
    </a-modal>

    <a-modal :visible="rejectVisible" :title="t('service.btn_reject')" unmount-on-close @cancel="rejectVisible = false" @ok="submitReject">
      <div class="form-group">
        <label>{{ t('service.reject_reason') }} <span class="required">*</span></label>
        <textarea v-model="rejectReason" class="form-textarea" rows="3" :placeholder="t('service.reject_reason_placeholder')"></textarea>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconDownload, IconExclamationCircle, IconCalendar, IconCheckCircle, IconCloseCircle } from '@arco-design/web-vue/es/icon'
import { getServiceList, getServiceDetail, handleService, batchHandleServices, exportServices, getServiceStats } from '@/api/service'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const isEmpty = computed(() => !list.value.length && !loading.value)

const stats = ref({ pending_count: 0, today_count: 0, status_stats: [], type_stats: [] })
const statusCount = (s) => {
  const row = (stats.value.status_stats || []).find(r => Number(r.status) === s)
  return row ? row.count : 0
}

const filters = ref({ keyword: '', type: '', status: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const selectedIds = ref([])
const selectAll = ref(false)

const detailVisible = ref(false)
const detail = ref(null)
const detailLogs = computed(() => detail.value?.logs || [])
const detailRefunds = computed(() => detail.value?.refund_records || detail.value?.refundRecords || [])
const detailImages = computed(() => (detail.value?.images || []).map(i => i.url || i.image_url || i).filter(Boolean))

const rejectVisible = ref(false)
const rejectReason = ref('')
const rejectRecord = ref(null)

const typeText = (v) => ({ 1: t('service.type_refund'), 2: t('service.type_return'), 3: t('service.type_exchange'), 4: t('service.type_repair') }[v] ?? t('service.unknown'))
const statusText = (s) => ({ 10: t('service.status_pending'), 20: t('service.status_approved'), 25: t('service.status_return_shipped'), 30: t('service.status_received'), 35: t('service.status_refunding'), 40: t('service.status_completed'), 50: t('service.status_rejected'), 60: t('service.status_cancelled') }[s] ?? t('service.unknown'))
const statusBadgeClass = (s) => ({ 10: 'badge-warning', 20: 'badge-info', 25: 'badge-info', 30: 'badge-info', 35: 'badge-info', 40: 'badge-success', 50: 'badge-error', 60: 'badge-error' }[s] ?? 'badge-info')
const actionText = (a) => ({ apply: t('service.action_apply'), approve: t('service.action_approve'), reject: t('service.action_reject'), return_ship: t('service.action_return_ship'), receive: t('service.action_receive'), refund: t('service.action_refund'), complete: t('service.action_complete'), cancel: t('service.action_cancel'), update: t('service.action_update') }[a] ?? a)
const refundStatusText = (s) => ({ 10: t('service.status_pending'), 20: t('service.status_refunding'), 30: t('service.refund_success'), 40: t('service.refund_failed') }[s] ?? t('service.unknown'))
const refundBadgeClass = (s) => ({ 30: 'badge-success', 40: 'badge-error' }[s] ?? 'badge-info')

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts)
    ? new Date(Number(ts) * 1000)
    : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const loadStats = async () => {
  try {
    const res = await getServiceStats({})
    stats.value = res.data || stats.value
  } catch (e) { /* ignore stats error */ }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getServiceList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('service.msg_operation_failed')) } finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(r => r.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const viewDetail = async (record) => {
  try {
    const res = await getServiceDetail(record.id)
    detail.value = res.data?.service || res.data || record
    detailVisible.value = true
  } catch (error) { Message.error(t('service.msg_operation_failed')) }
}

const doAction = (record, action) => {
  const titleMap = { approve: t('service.confirm_approve'), refund: t('service.confirm_refund'), complete: t('service.confirm_complete'), receive: t('service.confirm_receive') }
  Modal.warning({
    title: titleMap[action] || t('service.confirm_title'),
    content: t('service.confirm_content'),
    hideCancel: false,
    onOk: async () => {
      try {
        await handleService(record.id, { action })
        Message.success(t('service.msg_operation_success'))
        loadData(); loadStats()
      } catch (error) { Message.error(error?.message || t('service.msg_operation_failed')) }
    }
  })
}

const openReject = (record) => {
  rejectRecord.value = record
  rejectReason.value = ''
  rejectVisible.value = true
}

const submitReject = async () => {
  if (!rejectReason.value.trim()) { Message.warning(t('service.reject_reason_placeholder')); return }
  try {
    await handleService(rejectRecord.value.id, { action: 'reject', reason: rejectReason.value })
    Message.success(t('service.msg_operation_success'))
    rejectVisible.value = false
    loadData(); loadStats()
  } catch (error) { Message.error(error?.message || t('service.msg_operation_failed')) }
}

const batchApprove = () => {
  Modal.warning({
    title: t('service.batch_approve'),
    content: t('service.batch_approve_confirm', { n: selectedIds.value.length }),
    hideCancel: false,
    onOk: async () => {
      try {
        await batchHandleServices({ ids: selectedIds.value })
        Message.success(t('service.msg_operation_success'))
        selectedIds.value = []; selectAll.value = false
        loadData(); loadStats()
      } catch (error) { Message.error(error?.message || t('service.msg_operation_failed')) }
    }
  })
}

const handleExport = async () => {
  try {
    const res = await exportServices({ ...filters.value })
    const rows = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    if (!rows.length) { Message.warning(t('service.empty_data')); return }
    const headers = ['ID', t('service.th_order'), t('service.th_user'), t('service.th_type'), t('service.th_status'), t('service.th_reason'), t('service.th_time')]
    const lines = [headers.join(',')]
    rows.forEach(r => {
      const line = [
        r.id,
        r.order_id || '',
        r.user_id || '',
        typeText(r.sub_type),
        statusText(r.status),
        `"${String(r.reasons_text || '').replace(/"/g, '""')}"`,
        formatTime(r.created_at)
      ]
      lines.push(line.join(','))
    })
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `after-sales-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) { Message.error(t('service.msg_operation_failed')) }
}

onMounted(() => { loadData(); loadStats() })
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.col-center { text-align: center; }

.reason-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.batch-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 18px;
  background: var(--color-surface-container-highest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-card);
  font-size: 13px;
  z-index: 50;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-on-surface-variant);
}

.detail-value {
  font-size: 13px;
  color: var(--color-on-surface);
}

.detail-section {
  margin-top: 16px;
}

.detail-section h4 {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  margin: 0 0 8px;
}

.content-box {
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 13px;
  color: var(--color-on-surface);
  line-height: 1.6;
  white-space: pre-wrap;
}

.img-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.img-list img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
}

.refund-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.refund-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.refund-amount {
  font-weight: 600;
  color: var(--color-error);
  margin-left: auto;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.tl-item {
  display: flex;
  gap: 12px;
  padding-bottom: 16px;
  position: relative;
}

.tl-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  bottom: 0;
  width: 1px;
  background: var(--color-outline-variant);
}

.tl-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-top: 3px;
  flex-shrink: 0;
  z-index: 1;
}

.tl-body { flex: 1; }

.tl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tl-action {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
}

.tl-time { font-size: 12px; }
.tl-meta { font-size: 12px; margin-top: 2px; }

.form-group {
  margin-top: 8px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  margin-bottom: 6px;
}
</style>
