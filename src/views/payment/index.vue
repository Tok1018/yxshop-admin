<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('payment.title') }}</h1>
        <p class="page-subtitle">{{ t('payment.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="handleExport">{{ t('payment.btn_export') }}</button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('payment.search_placeholder')" :aria-label="t('payment.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-center">{{ t('payment.th_id') }}</th><th class="col-center">{{ t('payment.th_order') }}</th><th class="col-center">{{ t('payment.th_amount') }}</th><th class="col-center">{{ t('payment.th_status') }}</th><th class="col-center">{{ t('payment.th_time') }}</th><th class="col-actions">{{ t('payment.th_actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono muted col-center">{{ record.id }}</td>
              <td class="mono col-center"><span class="order-link">#{{ record.order_no || '-' }}</span></td>
              <td class="mono col-center" :class="record.status === 1 ? 'amount-positive' : record.status === 2 ? 'amount-pending' : 'amount-negative'">¥{{ record.amount || 0 }}</td>
              <td class="col-center"><span :class="getStatusBadgeClass(record.status)">{{ getStatusText(record.status) }}</span></td>
              <td class="mono muted col-center">{{ record.created_at ? formatTime(record.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button v-if="record.status === 1" class="btn-danger btn-sm" @click="handleRefund(record)">{{ t('payment.btn_refund') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="6" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('payment.empty_data') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <a-pagination
      v-if="total > 0"
      :current="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
      class="arco-pagination-md3"
      show-total
      :total-text="t('payment.total_count', { n: total })"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getPaymentList, refundPayment, exportPayment } from '@/api/payment'

const { t } = useI18n()

const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '' })
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const getStatusBadgeClass = (s) => ({ 1: 'badge-success', 2: 'badge-warning', 3: 'badge-info' }[s] || 'badge-error')
const getStatusText = (s) => ({ 1: t('payment.status_paid'), 2: t('payment.status_pending'), 3: t('payment.status_refunded') }[s] || t('payment.status_unknown'))

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const handleRefund = (record) => {
  Modal.warning({ title: t('payment.confirm_refund_title'), content: t('payment.confirm_refund_msg'), hideCancel: false, onOk: async () => { try { await refundPayment(record.id, {}); Message.success(t('payment.msg_refund_success')); loadData() } catch (error) { Message.error(t('payment.msg_refund_failed')) } } })
}

const handleExport = async () => {
  try { await exportPayment(filters.value); Message.success(t('payment.msg_export_success')) } catch (error) { Message.error(t('payment.msg_operation_failed')) }
}

const loadData = async () => {
  loading.value = true
  try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] }); const res = await getPaymentList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('payment.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>


.col-center {
  text-align: center;
}

.order-link {
  color: var(--color-secondary);
  font-weight: 600;
}

.amount-pending {
  color: var(--color-tertiary);
  font-weight: 600;
}
</style>
