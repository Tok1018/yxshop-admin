<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('order_deliveries.title') }}</h1>
        <p class="page-subtitle">{{ t('order_deliveries.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('order_deliveries.search_placeholder')" :aria-label="t('order_deliveries.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>{{ t('order_deliveries.col_id') }}</th><th>{{ t('order_deliveries.col_order') }}</th><th>{{ t('order_deliveries.col_express_company') }}</th><th>{{ t('order_deliveries.col_express_no') }}</th><th>{{ t('order_deliveries.col_time') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono">{{ record.id }}</td>
              <td class="mono">{{ record.order_no || record.order_id || '-' }}</td>
              <td>
                <div class="company-cell">
                  <div class="company-icon"><icon-fire /></div>
                  <span>{{ record.company || '-' }}</span>
                </div>
              </td>
              <td class="mono">{{ record.express_no || '-' }}</td>
              <td class="mono muted">{{ formatTime(record.created_at) }}</td>
            </tr>
            <tr v-if="showEmpty"><td colspan="5" class="empty-row"><div class="empty-state"><span class="empty-text">{{ t('order_deliveries.empty') }}</span></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('order_deliveries.total', { total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconFire } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOrderDeliveriesList } from '@/api/order_deliveries'
const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showEmpty = computed(() => !list.value.length && !loading.value)
const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts)
    ? new Date(Number(ts) * 1000)
    : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getOrderDeliveriesList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('order_deliveries.operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>

.company-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.company-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-tertiary-rgb), 0.1);
  color: var(--color-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
