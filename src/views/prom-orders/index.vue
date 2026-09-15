<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('prom_orders.title') }}</h1><p class="page-subtitle">{{ t('prom_orders.subtitle') }}</p></div>
    </div>

    <div class="filter-strip">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('prom_orders.search_placeholder')" :aria-label="t('prom_orders.search_placeholder')" @input="debouncedSearch" /></div>
    </div>

    <div class="card-shadow table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-id">{{ t('prom_orders.th_id') }}</th>
            <th class="col-prom-id">{{ t('prom_orders.th_prom_id') }}</th>
            <th class="col-prom-title">{{ t('prom_orders.th_prom_title') }}</th>
            <th class="col-order-id">{{ t('prom_orders.th_order_id') }}</th>
            <th class="col-order-no">{{ t('prom_orders.th_order_no') }}</th>
            <th class="col-user">{{ t('prom_orders.th_user') }}</th>
            <th class="col-type">{{ t('prom_orders.th_type') }}</th>
            <th class="col-amount">{{ t('prom_orders.th_amount') }}</th>
            <th class="col-status">{{ t('prom_orders.th_status') }}</th>
            <th class="col-time">{{ t('prom_orders.th_time') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in list" :key="record.id">
            <td class="mono muted">{{ record.id }}</td>
            <td class="mono">
              <span v-if="record.prom_id" class="link-id" @click="goToPromotion(record.prom_id)">{{ record.prom_id }}</span>
              <span v-else class="muted">-</span>
            </td>
            <td>{{ record.promotion?.title || '-' }}</td>
            <td class="mono">
              <span v-if="record.order_id" class="link-id" @click="goToOrderDetail(record.order_id)">{{ record.order_id }}</span>
              <span v-else class="muted">-</span>
            </td>
            <td class="mono">{{ record.order?.order_no || '-' }}</td>
            <td>{{ record.user?.nickname || record.user?.username || '-' }}</td>
            <td><span :class="['badge-tag', 'type-' + record.prom_type]">{{ getPromTypeText(record.prom_type) }}</span></td>
            <td class="mono amount">¥{{ Number(record.prom_amount || 0).toFixed(2) }}</td>
            <td><span :class="['badge-tag', 'status-' + record.prom_status]">{{ getPromStatusText(record.prom_status) }}</span></td>
            <td class="mono muted">{{ formatTime(record.created_at) }}</td>
          </tr>
          <tr v-if="showListEmpty"><td colspan="10" class="empty-row"><div class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('prom_orders.empty_data') }}</span></div></td></tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('prom_orders.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { getPromOrdersList } from '@/api/prom_orders'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'

const { t, locale } = useI18n()
const router = useRouter()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const filters = ref({ keyword: '' })
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (p) => { page.value = p; loadData() }

const PROM_TYPES = {
  1: { zh: '折扣促销', zh_TW: '折扣促銷', en: 'Discount' },
  2: { zh: '优惠券促销', zh_TW: '優惠券促銷', en: 'Coupon' },
  3: { zh: '赠品促销', zh_TW: '贈品促銷', en: 'Gift' },
  4: { zh: '积分促销', zh_TW: '積分促銷', en: 'Points' },
}
const PROM_STATUSES = {
  0: { zh: '待处理', zh_TW: '待處理', en: 'Pending' },
  1: { zh: '成功', zh_TW: '成功', en: 'Success' },
  2: { zh: '失败', zh_TW: '失敗', en: 'Failed' },
  3: { zh: '已取消', zh_TW: '已取消', en: 'Cancelled' },
}

const getPromTypeText = (type) => {
  const item = PROM_TYPES[type]
  if (!item) return '-'
  if (locale.value === 'zh_TW') return item.zh_TW
  if (locale.value === 'en') return item.en
  return item.zh
}
const getPromStatusText = (status) => {
  const item = PROM_STATUSES[status]
  if (!item) return '-'
  if (locale.value === 'zh_TW') return item.zh_TW
  if (locale.value === 'en') return item.en
  return item.zh
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  if (isNaN(d.getTime())) return '-'
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const goToOrderDetail = (orderId) => {
  router.push({ path: `/order/detail/${orderId}` }).catch(() => {
    router.push({ path: '/order', query: { keyword: orderId } })
  })
}
const goToPromotion = (promId) => {
  router.push({ path: '/marketing', query: { prom_id: promId } })
}

const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] }); const res = await getPromOrdersList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (e) { Message.error(t('prom_orders.msg_load_failed')) } finally { loading.value = false } }

onMounted(() => loadData())
</script>

<style scoped>
.page-content { height: 100%; display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
.page-header { display: flex; justify-content: space-between; align-items: flex-end; position: relative; z-index: 1; }
.page-title { font-size: 22px; font-weight: 600; margin: 0; }

.filter-strip { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; position: relative; z-index: 1; }
.search-box { display: flex; align-items: center; gap: 8px; background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: 8px; padding: 0 14px; height: 36px; width: 280px; transition: border-color 0.2s; }
.search-box svg { color: var(--color-on-surface-variant); flex-shrink: 0; }
.search-box input { background: none; border: none; outline: none; color: var(--color-on-surface); font-size: 13px; font-family: inherit; width: 100%; padding: 0; }
.search-box input::placeholder { color: var(--color-on-surface-variant); }
.search-box:focus-within { border-color: var(--color-secondary); }
.card-shadow { background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: 12px; position: relative; z-index: 1; }
.table-scroll { flex: 1; min-height: 0; overflow: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 72px 20px; color: var(--color-on-surface-variant); font-size: 13px; }
.empty-icon { font-size: 36px; opacity: 0.3; }
.empty-text { color: var(--color-on-surface-variant); }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px; position: relative; z-index: 1; }
.total-text { color: var(--color-on-surface-variant); }

.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead th { padding: 12px 12px; text-align: left; font-weight: 600; color: var(--color-on-surface-variant); border-bottom: 1px solid var(--color-outline-variant); white-space: nowrap; background: var(--color-surface-container-low); position: sticky; top: 0; z-index: 1; }
.data-table tbody td { padding: 10px 12px; border-bottom: 1px solid var(--color-outline-variant); color: var(--color-on-surface); white-space: nowrap; }
.data-table tbody tr:hover { background: var(--color-surface-container-low); }
.data-table tbody tr:last-child td { border-bottom: none; }

.col-id { padding-left: 20px; width: 80px; }
.col-prom-id { width: 100px; }
.col-prom-title { min-width: 140px; }
.col-order-id { width: 100px; }
.col-order-no { width: 160px; }
.col-user { min-width: 100px; }
.col-type { width: 90px; text-align: center; }
.col-amount { width: 100px; text-align: right; }
.col-status { width: 80px; text-align: center; }
.col-time { width: 160px; padding-right: 20px; }

.mono { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; font-size: 12px; }
.muted { color: var(--color-on-surface-variant); }
.amount { color: var(--color-primary, #165dff); font-weight: 600; }

.link-id { color: var(--color-primary, #165dff); cursor: pointer; text-decoration: underline; text-underline-offset: 2px; transition: opacity 0.2s; }
.link-id:hover { opacity: 0.75; }

.badge-tag { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 12px; font-weight: 500; line-height: 1.6; }
.type-1 { background: rgba(22, 93, 255, 0.1); color: #165dff; }
.type-2 { background: rgba(0, 180, 42, 0.1); color: #00b42a; }
.type-3 { background: rgba(247, 186, 30, 0.1); color: #ff7d00; }
.type-4 { background: rgba(114, 46, 209, 0.1); color: #722ed1; }
.status-0 { background: rgba(247, 186, 30, 0.1); color: #ff7d00; }
.status-1 { background: rgba(0, 180, 42, 0.1); color: #00b42a; }
.status-2 { background: rgba(245, 63, 63, 0.1); color: #f53f3f; }
.status-3 { background: var(--color-fill-3, rgba(0,0,0,0.06)); color: var(--color-on-surface-variant); }

</style>
