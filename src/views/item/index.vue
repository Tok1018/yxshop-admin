<template>
  <div class="item-page">
    <div class="page-content">

      <div class="table-section card-shadow">
        <div class="table-header">
          <div>
            <h3 class="headline-md">{{ t('item.summary.productArchive') }}</h3>
            <p class="body-md text-on-surface-variant">{{ t('item.summary.skuCount', { n: formatNumber(total) }) }}</p>
          </div>
          <div class="table-actions">
            <div class="search-box">
              <icon-search />
              <input v-model="filters.keyword" :placeholder="t('item.searchPlaceholder')" :aria-label="t('item.searchPlaceholder')" @input="debouncedSearch" />
            </div>
            <select v-model="filters.category_id" class="filter-select" @change="loadData">
              <option value="">{{ t('item.allCategory') }}</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <select v-model="filters.status" class="filter-select" @change="loadData">
              <option value="">{{ t('item.allStatus') }}</option>
              <option value="1">{{ t('item.onSale') }}</option>
              <option value="0">{{ t('item.offSale') }}</option>
            </select>
            <select v-model="filters.brand_id" class="filter-select" @change="loadData">
              <option value="">{{ t('item.allBrand') }}</option>
              <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
            </select>
            <button class="btn-ghost" @click="handleExport">
              <icon-export />
              {{ t('item.summary.export') }}
            </button>
            <button class="btn-primary" @click="$router.push({ name: 'itemEdit' })">
              <icon-plus />
              {{ t('item.addProduct') }}
            </button>
          </div>
        </div>
        <div class="table-scroll custom-scrollbar">
          <table class="data-table">
            <thead>
              <tr>
                <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
                <th>{{ t('item.summary.basicInfo') }}</th>
                <th>{{ t('item.summary.categoryBrand') }}</th>
                <th>{{ t('item.summary.stockSku') }}</th>
                <th>{{ t('item.price') }}</th>
                <th>{{ t('item.status') }}</th>
                <th class="col-actions">{{ t('item.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.id" :class="{ selected: selectedIds.includes(item.id) }">
                <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleSelect(item.id)" /></td>
                <td>
                  <div class="goods-cell">
                    <div class="goods-thumb">
                      <img v-if="item.image" :src="item.image" :alt="item.name" />
                      <span v-else class="no-img">—</span>
                    </div>
                    <div class="goods-info">
                      <span class="goods-name">{{ item.name }}</span>
                      <span class="goods-sku">SKU: {{ item.sku || item.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="body-md">{{ item.category?.name || '-' }} / {{ item.brand?.name || '-' }}</span>
                </td>
                <td>
                  <div class="stock-cell">
                    <span class="body-md" :class="{ 'text-error': item.stock <= 10 && item.stock > 0, 'text-on-surface': item.stock > 10 }">{{ formatNumber(item.stock) }} {{ t('item.summary.pieces') }}</span>
                    <div class="progress-bar stock-progress">
                      <div class="progress-fill" :class="item.stock <= 10 ? 'error' : 'primary'" :style="{ width: Math.min(item.stock / 500 * 100, 100) + '%' }"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="body-md font-bold">{{ formatCurrency(item.price) }}</span>
                </td>
                <td>
                  <span :class="['status-badge', item.status === 1 ? 'status-on' : 'status-off']">
                    <span class="status-dot"></span>
                    {{ item.status === 1 ? t('item.onSale') : t('item.offSale') }}
                  </span>
                </td>
                <td class="actions-cell" @click.stop>
                  <button class="btn-ghost btn-sm" @click="$router.push({ name: 'itemEdit', params: { id: item.id } })">{{ t('common.edit') }}</button>
                  <button class="btn-ghost btn-sm" @click="toggleStatus(item)">{{ item.status === 1 ? t('item.offSale') : t('item.onSale') }}</button>
                  <button class="btn-ghost btn-sm" @click="handleDuplicate(item)">{{ t('common.copy') }}</button>
                  <button class="btn-ghost btn-sm" @click="openStockAdjust(item)">{{ t('common.adjust') }}</button>
                  <button class="btn-ghost btn-sm" @click="openPriceHistory(item)">{{ t('item.price_history') }}</button>
                  <button class="btn-danger btn-sm" @click="handleDelete(item.id)">{{ t('common.delete') }}</button>
                </td>
              </tr>
              <tr v-if="isItemListEmpty">
                <td colspan="7" class="empty-state">
                  <icon-empty class="empty-icon" />
                  <span class="empty-text">{{ t('item.noData') }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="table-footer" v-if="total > 0">
          <span class="body-md text-on-surface-variant">{{ t('item.summary.showRange', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total: formatNumber(total) }) }}</span>
          <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
        </div>
        <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('item.selected', { n: selectedIds.length }) }}</span>
      <button class="btn-ghost" @click="batchToggleStatus(1)">{{ t('item.batchOnShelf') }}</button>
      <button class="btn-ghost" @click="batchToggleStatus(0)">{{ t('item.batchOffShelf') }}</button>
      <button class="btn-ghost" @click="openBatchPrice">{{ t('item.batch_price') }}</button>
      <button class="btn-ghost" @click="openStockAdjust()">{{ t('item.batch_stock_adjust') }}</button>
      <button class="btn-ghost btn-ghost-danger" @click="batchDelete">{{ t('item.batch_delete') }}</button>
      <button class="btn-ghost" @click="selectedIds = []">{{ t('item.cancelSelect') }}</button>
    </div>

    <a-modal v-model:visible="batchPriceVisible" :title="t('item.batch_price')" @ok="handleBatchPrice" :ok-loading="batchPriceLoading">
      <a-form :model="batchPriceForm" layout="vertical">
        <a-form-item :label="t('item.price_type_fixed') + '/' + t('item.price_type_percent')">
          <a-radio-group v-model="batchPriceForm.type">
            <a-radio value="fixed">{{ t('item.price_type_fixed') }}</a-radio>
            <a-radio value="percent">{{ t('item.price_type_percent') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('item.price_value')">
          <a-input-number v-model="batchPriceForm.value" :placeholder="t('item.price_value')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="stockAdjustVisible" :title="t('item.stock_adjust')" @ok="handleStockAdjust" :ok-loading="stockAdjustLoading">
      <a-form :model="stockAdjustForm" layout="vertical">
        <a-form-item :label="t('item.stock_type_in') + '/' + t('item.stock_type_out') + '/' + t('item.stock_type_check')">
          <a-radio-group v-model="stockAdjustForm.type">
            <a-radio value="in">{{ t('item.stock_type_in') }}</a-radio>
            <a-radio value="out">{{ t('item.stock_type_out') }}</a-radio>
            <a-radio value="check">{{ t('item.stock_type_check') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="t('item.stock_quantity')">
          <a-input-number v-model="stockAdjustForm.quantity" :min="0" />
        </a-form-item>
        <a-form-item :label="t('item.stock_remark')">
          <a-input v-model="stockAdjustForm.remark" :placeholder="t('item.stock_remark')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer v-model:visible="priceHistoryVisible" :title="t('item.price_history') + ' - ' + priceHistoryItem.name" :width="480">
      <div v-if="priceHistoryLoading" style="text-align:center;padding:40px"><a-spin /></div>
      <div v-else-if="priceHistoryList.length === 0" style="text-align:center;padding:40px;color:var(--color-on-surface-variant)">{{ t('item.no_price_history') }}</div>
      <div v-else>
        <div v-for="log in priceHistoryList" :key="log.id" style="padding:12px 0;border-bottom:1px solid var(--color-outline-variant)">
          <div style="display:flex;justify-content:space-between;font-size:13px">
            <span style="color:var(--color-on-surface-variant)">{{ formatDateTime(log.created_at) }}</span>
            <span>{{ log.change_reason || '-' }}</span>
          </div>
          <div style="margin-top:4px;font-size:14px">
            <span style="text-decoration:line-through;color:var(--color-on-surface-variant)">¥{{ Number(log.old_price).toFixed(2) }}</span>
            <span style="margin:0 8px">→</span>
            <span style="color:var(--color-primary);font-weight:600">¥{{ Number(log.new_price).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import {
  IconSearch, IconPlus, IconExport,
  IconArrowRise, IconExclamationCircle, IconStarFill,
  IconEmpty
} from '@arco-design/web-vue/es/icon'
import { getItemList, deleteItem, updateItemStatus, batchItemStatus, batchItemDelete, getItemSummary, batchPrice, stockAdjust, batchStockAdjust, duplicateItem, getPriceHistory, exportItems } from '@/api/item'
import { getCategoryList } from '@/api/item'
import { getBrandList } from '@/api/item'
import { formatCurrency, formatNumber, formatTrend, formatDateTime } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const categories = ref([])
const brands = ref([])
const summaryPeriod = ref('month')

const summary = ref({ onSaleCount: 0, totalValue: 0, stockAlert: 0, onSaleTrend: 0, valueTrend: 0 })
const sparklineData = ref([])

const categoryContrib = ref([])

const trendingItems = ref([])

const filters = ref({ keyword: '', category_id: '', status: '', brand_id: '' })

const isItemListEmpty = computed(() => !list.value.length && !loading.value)

const donutCenterLabel = computed(() => {
  if (!categoryContrib.value.length) return '0%'
  return categoryContrib.value[0].percent + '%'
})

const donutSegments = computed(() => {
  let cumulative = 0
  return categoryContrib.value.map(seg => {
    const dashArray = `${seg.percent} ${100 - seg.percent}`
    const offset = -cumulative
    cumulative += seg.percent
    return { color: seg.color, dashArray, offset }
  })
})

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }
const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getItemList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('item.operationFailed')) } finally { loading.value = false }
}

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? list.value.map(i => i.id) : []
}
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const toggleStatus = async (item) => {
  try {
    await updateItemStatus(item.id, { status: item.status === 1 ? 0 : 1 })
    Message.success(item.status === 1 ? t('item.offShelfSuccess') : t('item.onShelfSuccess'))
    loadData()
  } catch (error) { Message.error(t('item.operationFailed')) }
}

const handleDelete = (id) => {
  Modal.warning({
    title: t('common.delete'),
    content: t('item.confirm_delete'),
    hideCancel: false,
    onOk: async () => {
      try {
        await deleteItem(id)
        Message.success(t('item.delete_success'))
        loadData()
      } catch (error) { Message.error(t('item.delete_failed')) }
    },
  })
}

const batchToggleStatus = async (status) => {
  try {
    await batchItemStatus({ ids: selectedIds.value, status })
    Message.success(status === 1 ? t('item.batchOnShelfSuccess') : t('item.batchOffShelfSuccess'))
    selectedIds.value = []
    loadData()
  } catch (error) { Message.error(t('item.batchOperationFailed')) }
}

const batchDelete = () => {
  Modal.warning({
    title: t('item.batch_delete'),
    content: t('item.confirm_batch_delete', { n: selectedIds.value.length }),
    hideCancel: false,
    onOk: async () => {
      try {
        await batchItemDelete({ ids: selectedIds.value })
        Message.success(t('item.batch_delete_success'))
        selectedIds.value = []
        loadData()
      } catch (error) { Message.error(t('item.batch_delete_failed')) }
    },
  })
}

const handleExport = async (format = 'csv') => {
  if (typeof format !== 'string') format = 'csv'
  try {
    const params = { format, ...filters.value }
    if (selectedIds.value.length > 0) params.ids = selectedIds.value.join(',')
    const res = await exportItems(params)
    const payload = res && res.data !== undefined ? res.data : res
    const blob = payload instanceof Blob ? payload : new Blob([payload], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `items_export_${new Date().toISOString().slice(0,10)}.${format}`
    a.click()
    URL.revokeObjectURL(url)
    Message.success(t('item.summary.export'))
  } catch (error) { Message.error(t('item.export_empty')) }
}
const viewFullReport = () => { Message.info(t('item.summary.reportLoading')) }
const viewAllTrending = () => { router.push({ path: '/item', query: { sort: 'sales' } }) }

const batchPriceVisible = ref(false)
const batchPriceLoading = ref(false)
const batchPriceForm = reactive({ type: 'fixed', value: 0 })
const openBatchPrice = () => {
  if (selectedIds.value.length === 0) { Message.warning(t('item.selectToOperate')); return }
  batchPriceForm.type = 'fixed'
  batchPriceForm.value = 0
  batchPriceVisible.value = true
}
const handleBatchPrice = async () => {
  batchPriceLoading.value = true
  try {
    const res = await batchPrice({ ids: selectedIds.value, type: batchPriceForm.type, value: batchPriceForm.value })
    const data = res.data || {}
    if (data.failed_count > 0) {
      Message.warning(t('item.batch_price_partial', { s: data.success_count, f: data.failed_count }))
    } else {
      Message.success(t('item.batch_price_success', { n: data.success_count }))
    }
    batchPriceVisible.value = false
    loadData()
  } catch (e) { Message.error(t('item.duplicate_failed')) } finally { batchPriceLoading.value = false }
}

const stockAdjustVisible = ref(false)
const stockAdjustLoading = ref(false)
const stockAdjustForm = reactive({ type: 'in', quantity: 0, remark: '' })
const stockAdjustTarget = ref(null)
const stockAdjustIsBatch = ref(false)
const openStockAdjust = (item = null) => {
  stockAdjustTarget.value = item
  stockAdjustIsBatch.value = !item
  if (stockAdjustIsBatch.value && selectedIds.value.length === 0) { Message.warning(t('item.selectToOperate')); return }
  stockAdjustForm.type = 'in'
  stockAdjustForm.quantity = 0
  stockAdjustForm.remark = ''
  stockAdjustVisible.value = true
}
const handleStockAdjust = async () => {
  stockAdjustLoading.value = true
  try {
    if (stockAdjustIsBatch.value) {
      await batchStockAdjust({ ids: selectedIds.value, ...stockAdjustForm })
    } else {
      await stockAdjust(stockAdjustTarget.value.id, stockAdjustForm)
    }
    Message.success(t('item.stock_adjust_success'))
    stockAdjustVisible.value = false
    loadData()
  } catch (e) { Message.error(e.message || t('item.duplicate_failed')) } finally { stockAdjustLoading.value = false }
}

const handleDuplicate = (item) => {
  Modal.warning({
    title: t('item.duplicate'),
    content: t('item.confirm_duplicate'),
    hideCancel: false,
    onOk: async () => {
      try {
        const res = await duplicateItem(item.id)
        Message.success(t('item.duplicate_success'))
        loadData()
      } catch (e) { Message.error(t('item.duplicate_failed')) }
    }
  })
}

const priceHistoryVisible = ref(false)
const priceHistoryItem = ref({ id: null, name: '' })
const priceHistoryList = ref([])
const priceHistoryLoading = ref(false)
const openPriceHistory = async (item) => {
  priceHistoryItem.value = { id: item.id, name: item.name }
  priceHistoryVisible.value = true
  priceHistoryLoading.value = true
  try {
    const res = await getPriceHistory(item.id)
    priceHistoryList.value = res.data?.list || []
  } catch (e) { priceHistoryList.value = [] } finally { priceHistoryLoading.value = false }
}

const getTrendTip = () => {
  const data = sparklineData.value
  if (!data || data.length < 4) return t('item.summary.trendNoData')
  const firstHalf = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3
  const secondHalf = data.slice(3).reduce((a, b) => a + b, 0) / (data.length - 3)
  if (firstHalf === 0 && secondHalf === 0) return t('item.summary.trendNoData')
  const diff = secondHalf - firstHalf
  if (diff > 0) return t('item.summary.trendUp')
  if (diff < 0) return t('item.summary.trendDown')
  return t('item.summary.trendStable')
}

onMounted(async () => {
  loadData()
  try {
    const [catRes, brandRes] = await Promise.all([getCategoryList(), getBrandList()])
    categories.value = catRes.data?.list || catRes.data || []
    brands.value = brandRes.data?.list || brandRes.data || []
  } catch (error) { Message.error(t('item.operationFailed')) }
})
</script>

<style scoped>
.item-page {
  min-height: 100%;
  background: var(--color-surface);
  color: var(--color-on-surface);
  font-family: var(--font-body-md);
}

.page-content {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.text-on-surface-variant { color: var(--color-on-surface-variant); }
.text-error { color: var(--color-error); }
.font-bold { font-weight: 700; }
.body-md { font-size: 14px; line-height: 20px; }
.label-sm { font-size: 12px; line-height: 16px; letter-spacing: 0.01em; font-weight: 500; }
.headline-md { font-size: 20px; line-height: 28px; font-weight: 600; }
.stat-value { font-family: var(--font-stats-number); font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -0.02em; }

.stats-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-lg);
}

.stats-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stats-main-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
}

.stats-main-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-xl);
}

.stat-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.stat-trend {
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 2px;
}
.stat-trend.up { color: var(--color-primary); }
.stat-trend.down { color: var(--color-error); }

.sparkline-bar {
  margin-top: var(--spacing-xl);
  height: 96px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
}
.sparkline-col {
  flex: 1;
  background: rgba(var(--color-primary-container-rgb), 0.2);
  border-radius: 2px 2px 0 0;
  transition: background 0.2s;
  min-height: 4px;
}
.sparkline-col:hover { background: rgba(var(--color-primary-container-rgb), 0.5); }
.sparkline-col.active { background: var(--color-primary-container); }

.stats-ai-forecast {
  background: var(--color-primary);
  color: var(--color-on-primary);
  position: relative;
  overflow: hidden;
}
.ai-decor {
  position: absolute;
  right: -40px;
  top: -40px;
  width: 160px;
  height: 160px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(40px);
}
.ai-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.ai-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-base);
}
.ai-icon { font-size: 20px; }
.ai-desc {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}
.ai-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}
.ai-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ai-badge {
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.ai-btn {
  margin-top: var(--spacing-lg);
  width: 100%;
  background: #ffffff;
  color: var(--color-primary);
  border: none;
  padding: 10px;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}
.ai-btn:hover { opacity: 0.9; }
.ai-btn:active { transform: scale(0.95); }

.table-section {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
  overflow: hidden;
  position: relative;
}

.table-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-base);
  flex-wrap: wrap;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}


.table-section .data-table thead th {
  padding: var(--spacing-base) var(--spacing-xl);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-on-surface-variant);
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}
.table-section .data-table tbody td {
  padding: var(--spacing-base) var(--spacing-xl);
  font-size: 14px;
  color: var(--color-on-surface);
  border-bottom: 1px solid rgba(var(--color-outline-variant-rgb), 0.3);
}
.table-section .data-table tbody tr:hover {
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}


.stock-cell { display: flex; flex-direction: column; gap: 4px; }
.stock-progress { height: 4px; width: 100%; max-width: 96px; }


.table-footer {
  padding: var(--spacing-xl);
  border-top: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
}




.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
}

.chart-card,
.trending-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}


.chart-body {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.donut-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}
.donut-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.donut-bg { stroke: var(--color-surface-container); stroke-width: 4; }
.donut-segment { transition: stroke-dasharray 0.3s; }
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-value { font-size: 24px; line-height: 32px; }

.legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}
.legend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.legend-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}
.trending-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}
.trending-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-container-high);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.trending-thumb img { width: 100%; height: 100%; object-fit: cover; }
.trending-info { flex: 1; }
.trending-price { text-align: right; min-width: 80px; }
.trending-progress { height: 4px; width: 100%; max-width: 64px; margin-top: 4px; }

.batch-bar {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  padding: 10px var(--spacing-xl);
  background: var(--color-inverse-surface);
  backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  font-size: 14px;
  color: var(--color-inverse-on-surface);
  z-index: 100;
}
.btn-ghost-danger { color: var(--color-error); }

@media (max-width: var(--breakpoint-lg)) {
  .stats-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
  .stats-main-grid { grid-template-columns: 1fr 1fr; }
  .table-header { flex-direction: column; }
  .table-actions { width: 100%; }
  .search-box { min-width: 160px; }
}

@media (max-width: var(--breakpoint-md)) {
  .stats-main-grid { grid-template-columns: 1fr; }
  .chart-body { flex-direction: column; }
  .donut-wrap { width: 120px; height: 120px; }
  .actions-cell { white-space: normal; }
  .actions-cell .btn-ghost,
  .actions-cell .btn-danger { margin-bottom: 4px; }
}
</style>
