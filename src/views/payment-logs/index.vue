<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('payment_logs.title') }}</h1>
        <p class="page-subtitle">{{ t('payment_logs.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('payment_logs.search_placeholder')" :aria-label="t('payment_logs.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-center">{{ t('payment_logs.th_id') }}</th><th class="col-center">{{ t('payment_logs.th_order') }}</th><th class="col-center">{{ t('payment_logs.th_amount') }}</th><th class="col-center">{{ t('payment_logs.th_status') }}</th><th class="col-center">{{ t('payment_logs.th_time') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="mono muted col-center">{{ r.id }}</td>
              <td class="mono col-center"><span class="order-link">#{{ r.order_no || '-' }}</span></td>
              <td class="mono col-center" :class="r.status === 1 ? 'amount-positive' : 'amount-negative'">{{ r.status === 1 ? '+' : '-' }}¥{{ r.amount || 0 }}</td>
              <td class="col-center"><span :class="r.status === 1 ? 'badge-success' : 'badge-error'">{{ r.status === 1 ? t('payment_logs.status_success') : t('payment_logs.status_failed') }}</span></td>
              <td class="mono muted col-center">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="5" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('payment_logs.empty_data') }}</span></td></tr>
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
      :total-text="t('payment_logs.total_count', { n: total })"
    />
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPaymentLogsList } from '@/api/payment_logs'
const { t } = useI18n()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '' })
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const onPageChange = (newPage) => { page.value = newPage; loadData() }
const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k]===''||params[k]===undefined||params[k]===null) delete params[k] }); const res = await getPaymentLogsList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('payment_logs.msg_operation_failed')) } finally { loading.value = false } }
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
</style>
