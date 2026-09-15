<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('prom_items.title') }}</h1>
        <p class="page-subtitle">{{ t('prom_items.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openModal()">
          <icon-plus />
          {{ t('prom_items.add_relation') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('prom_items.search_placeholder')" :aria-label="t('prom_items.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.prom_id" class="filter-select" @change="onPromFilterChange">
        <option value="">{{ t('prom_items.filter_all_promotions') }}</option>
        <option v-for="p in promotions" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>
    </div>

    <div class="card-shadow table-scroll">
      <a-spin :loading="loading" />
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>{{ t('prom_items.th_id') }}</th>
            <th>{{ t('prom_items.th_promotion') }}</th>
            <th>{{ t('prom_items.th_item') }}</th>
            <th>{{ t('prom_items.th_prom_price') }}</th>
            <th>{{ t('prom_items.th_stock') }}</th>
            <th>{{ t('prom_items.th_sales') }}</th>
            <th>{{ t('prom_items.th_status') }}</th>
            <th class="col-actions">{{ t('prom_items.th_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in list" :key="record.id" :class="getRowClass(record)">
            <td class="col-check" @click.stop>
              <input type="checkbox" :checked="isIdSelected(record.id)" @change="toggleSelect(record.id)" />
            </td>
            <td class="mono muted">{{ record.id }}</td>
            <td>
              <span class="badge-info">{{ getPromLabel(record) }}</span>
              <span class="mono muted prom-id">{{ record.prom_id }}</span>
            </td>
            <td>
              <div class="goods-cell">
                <div class="goods-thumb">
                  <img v-if="record.item && record.item.image" :src="record.item.image" alt="商品图片" />
                  <span v-else class="no-img">—</span>
                </div>
                <div class="goods-info">
                  <span class="goods-name">{{ getItemName(record) }}</span>
                  <span class="mono muted">ID: {{ record.item_id }}</span>
                </div>
              </div>
            </td>
            <td class="mono price-cell">{{ getPriceLabel(record) }}</td>
            <td>
              <span :class="getStockClass(record)">{{ getStockLabel(record) }}</span>
            </td>
            <td class="mono muted">{{ getSalesLabel(record) }}</td>
            <td>
              <span class="badge" :class="getStatusClass(record.prom_status)">{{ getStatusLabel(record.prom_status) }}</span>
            </td>
            <td class="actions-cell" @click.stop>
              <button class="btn-ghost btn-sm" @click="openModal(record)">{{ t('common.edit') }}</button>
              <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
            </td>
          </tr>
          <tr v-if="isListEmpty">
            <td colspan="9" class="empty-row">
              <div class="empty-state">
                <icon-empty class="empty-icon" />
                <span class="empty-text">{{ t('prom_items.empty_data') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-bar" v-if="showPagination">
      <span class="total-text">{{ t('prom_items.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <div class="batch-bar" v-if="showBatchBar">
      <span>{{ t('prom_items.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-danger btn-sm" @click="batchDelete">{{ t('prom_items.batch_delete') }}</button>
      <button class="btn-ghost btn-sm" @click="clearSelection">{{ t('prom_items.clear_selection') }}</button>
    </div>

    <a-drawer :visible="showModal" @cancel="closeDrawer" class="arco-drawer-md3" :width="'min(480px, 90vw)'" unmountOnClose :title="getDrawerTitle()">
      <div class="form-group">
        <label>{{ t('prom_items.label_promotion') }} <span class="required">*</span></label>
        <select v-model.number="form.prom_id" class="form-input">
          <option :value="0">{{ t('prom_items.placeholder_select_promotion') }}</option>
          <option v-for="p in promotions" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>{{ t('prom_items.label_item') }} <span class="required">*</span></label>
        <select v-model.number="form.item_id" class="form-input">
          <option :value="0">{{ t('prom_items.placeholder_select_item') }}</option>
          <option v-for="i in items" :key="i.id" :value="i.id">{{ i.name }}</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>{{ t('prom_items.label_prom_price') }}</label>
          <input v-model.number="form.prom_price" type="number" step="0.01" class="form-input" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>{{ t('prom_items.label_prom_stock') }}</label>
          <input v-model.number="form.prom_stock" type="number" class="form-input" placeholder="0" />
        </div>
      </div>
      <div class="form-group">
        <label>{{ t('prom_items.label_sort') }}</label>
        <input v-model.number="form.sort" type="number" class="form-input" placeholder="0" />
      </div>
      <template #footer>
        <button class="btn-ghost" @click="closeDrawer">{{ t('prom_items.btn_cancel') }}</button>
        <button class="btn-primary" @click="submitForm" :disabled="submitting">{{ getSubmitLabel() }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import {
  getPromItemList,
  createPromItem,
  updatePromItem,
  deletePromItem,
  batchDeletePromItems,
  getPromotionList,
  getItemListForSelect
} from '@/api/prom_items'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const showModal = ref(false)
const editingRecord = ref(null)
const submitting = ref(false)
const promotions = ref([])
const items = ref([])
const filters = ref({ keyword: '', prom_id: '' })

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showPagination = computed(() => total.value > 0)
const showBatchBar = computed(() => selectedIds.value.length > 0)
const isListEmpty = computed(() => list.value.length === 0 && !loading.value)
const isEditing = computed(() => editingRecord.value !== null)

const isIdSelected = (id) => selectedIds.value.includes(id)
const getRowClass = (record) => isIdSelected(record.id) ? 'selected' : ''
const getItemName = (record) => record.item ? record.item.name : '-'
const getPromLabel = (record) => record.promotion ? record.promotion.name : '-'
const getPriceLabel = (record) => record.prom_price ? '¥' + Number(record.prom_price).toFixed(2) : '-'
const getStockClass = (record) => {
  const stock = record.prom_stock ?? 0
  if (stock <= 0) return ['mono', 'stock-out']
  if (stock <= 10) return ['mono', 'stock-low']
  return ['mono']
}
const getStockLabel = (record) => String(record.prom_stock ?? 0)
const getSalesLabel = (record) => String(record.prom_sales || 0)
const getStatusClass = (s) => {
  const map = { 0: 'badge-success', 1: 'badge-warning', 2: 'badge-info' }
  return map[s] || 'badge-info'
}
const getStatusLabel = (s) => ({ 0: t('prom_items.status_normal'), 1: t('prom_items.status_sold_out'), 2: t('prom_items.status_disabled') }[s] || t('prom_items.status_unknown'))
const getDrawerTitle = () => isEditing.value ? t('prom_items.edit_relation') : t('prom_items.add_relation_title')
const getSubmitLabel = () => submitting.value ? t('prom_items.btn_submitting') : t('prom_items.btn_confirm')

const onPageChange = (p) => { page.value = p; loadData() }

let searchTimer = null
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400)
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] == null) delete params[k] })
    const res = await getPromItemList(params)
    list.value = res.data?.list || res.data?.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('prom_items.msg_load_failed')) }
  finally { loading.value = false }
}

const loadRelatedData = async () => {
  try {
    const [promRes, itemRes] = await Promise.all([
      getPromotionList({ page_size: 999 }),
      getItemListForSelect({ page_size: 999 })
    ])
    promotions.value = promRes.data?.list || promRes.data?.data || []
    items.value = itemRes.data?.list || itemRes.data?.data || []
  } catch (error) { Message.error(t('prom_items.msg_operation_failed')) }
}

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? list.value.map(i => i.id) : []
}

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const clearSelection = () => { selectedIds.value = []; selectAll.value = false }
const onPromFilterChange = () => { page.value = 1; loadData() }

const form = ref({ prom_id: 0, item_id: 0, prom_price: '', prom_stock: '', sort: 0 })

const openModal = (record = null) => {
  editingRecord.value = record
  if (record) {
    form.value = { prom_id: record.prom_id || 0, item_id: record.item_id || 0, prom_price: record.prom_price ?? '', prom_stock: record.prom_stock ?? '', sort: record.sort ?? 0 }
  } else {
    form.value = { prom_id: 0, item_id: 0, prom_price: '', prom_stock: '', sort: 0 }
  }
  showModal.value = true
}

const closeDrawer = () => { showModal.value = false }

const submitForm = async () => {
  if (form.value.prom_id === 0) { Message.warning(t('prom_items.msg_select_promotion')); return }
  if (form.value.item_id === 0) { Message.warning(t('prom_items.msg_select_item')); return }
  submitting.value = true
  try {
    if (editingRecord.value) {
      await updatePromItem(editingRecord.value.id, form.value)
      Message.success(t('prom_items.msg_update_success'))
    } else {
      await createPromItem(form.value)
      Message.success(t('prom_items.msg_create_success'))
    }
    showModal.value = false
    loadData()
  } catch (error) { Message.error(editingRecord.value ? t('prom_items.msg_update_failed') : t('prom_items.msg_create_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (id) => {
  Modal.warning({ title: t('prom_items.confirm_delete_title'), content: t('prom_items.confirm_delete_msg'), hideCancel: false,
    onOk: async () => { try { await deletePromItem(id); Message.success(t('prom_items.msg_delete_success')); loadData() } catch (error) { Message.error(t('prom_items.msg_delete_failed')) } }
  })
}

const batchDelete = () => {
  Modal.warning({ title: t('prom_items.confirm_batch_delete_title'), content: t('prom_items.confirm_batch_delete_msg', { n: selectedIds.value.length }), hideCancel: false,
    onOk: async () => { try { await batchDeletePromItems(selectedIds.value); Message.success(t('prom_items.msg_batch_delete_success')); clearSelection(); loadData() } catch (error) { Message.error(t('prom_items.msg_batch_delete_failed')) } }
  })
}

onMounted(() => { loadData(); loadRelatedData() })
</script>

<style scoped>
.prom-id { font-size: 10px; display: block; }

.goods-thumb {
  width: 36px; height: 36px; border-radius: 6px; overflow: hidden;
  background: var(--color-surface-container-low); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.goods-thumb img { width: 100%; height: 100%; object-fit: cover; }
.no-img { color: var(--color-on-surface-variant); font-size: 12px; }

.goods-name {
  color: var(--color-on-surface); font-size: 13px; max-width: 200px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.price-cell { color: var(--color-primary); font-weight: 700; }
.stock-out { color: var(--color-error); font-weight: 600; }
.stock-low { color: var(--color-tertiary); font-weight: 600; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 72px 20px; }
.empty-icon { font-size: 36px; color: var(--color-on-surface-variant); opacity: 0.3; }
.empty-text { color: var(--color-on-surface-variant); font-size: 13px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group label { font-size: 13px; color: var(--color-on-surface-variant); font-weight: 500; }

.form-input { background: var(--color-surface-container-low); border-radius: 6px; font-size: 13px; box-sizing: border-box; }

</style>
