<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('finance.title') }}</h1>
        <p class="page-subtitle">{{ t('finance.subtitle') }}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">{{ t('finance.total_income') }}</div>
        <div class="stat-value">¥{{ stats.total_income?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t('finance.today_income') }}</div>
        <div class="stat-value today">¥{{ stats.today_income?.toFixed(2) || '0.00' }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">{{ t('finance.pending_amount') }}</div>
        <div class="stat-value pending">¥{{ stats.pending_amount?.toFixed(2) || '0.00' }}</div>
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('finance.th_id') }}</th>
              <th>{{ t('finance.th_order_no') }}</th>
              <th>{{ t('finance.th_type') }}</th>
              <th>{{ t('finance.th_amount') }}</th>
              <th>{{ t('finance.th_time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in transactions" :key="record.id">
              <td class="mono muted">{{ record.id }}</td>
              <td class="mono"><span class="order-link">#{{ record.order_no || '-' }}</span></td>
              <td>{{ record.type || '-' }}</td>
              <td><span :class="record.amount >= 0 ? 'amount-positive' : 'amount-negative'">{{ record.amount >= 0 ? '+' : '' }}¥{{ record.amount ?? 0 }}</span></td>
              <td class="mono muted">{{ record.created_at ? formatTime(record.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <icon-safe :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('finance.empty_data') }}</span>
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
      <span class="total-text">{{ t('finance.total_count', { n: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSafe } from '@arco-design/web-vue/es/icon'
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getFinanceStatistics, getTransactionList } from '@/api/finance'

const { t } = useI18n()

const stats = reactive({ total_income: 0, today_income: 0, pending_amount: 0 })
const transactions = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => transactions.value.length === 0 && loading.value === false)

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts.length > 12 ? ts : ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (p) => { page.value = p; loadTransactions() }

const loadStats = async () => {
  try {
    const res = await getFinanceStatistics()
    Object.assign(stats, res.data || {})
  } catch (error) { Message.error(t('finance.msg_operation_failed')) }
}

const loadTransactions = async () => {
  loading.value = true
  try {
    const res = await getTransactionList({ page: page.value, page_size: pageSize })
    transactions.value = res.data?.list || res.data || []
    total.value = res.data?.total || transactions.value.length
  } catch (error) { Message.error(t('finance.msg_operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => { loadStats(); loadTransactions() })
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.stat-value {
  margin-top: var(--spacing-sm);
}

.stat-value.today {
  color: var(--color-secondary);
}

.stat-value.pending {
  color: var(--color-tertiary);
}

.order-link {
  color: var(--color-primary);
  font-weight: 600;
}

.amount-positive {
  color: var(--color-success);
  font-weight: 600;
}

.amount-negative {
  color: var(--color-error);
  font-weight: 600;
}

@media (max-width: var(--breakpoint-md)) {
  .stats-grid { grid-template-columns: 1fr; }
}

@media (min-width: var(--breakpoint-md)) and (max-width: var(--breakpoint-lg)) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
