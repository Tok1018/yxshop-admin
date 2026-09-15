<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('prom_goods.title') }}</h1>
        <p class="page-subtitle">{{ t('prom_goods.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openModal()">
          <icon-plus />
          {{ t('prom_goods.add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('prom_goods.search_placeholder')" :aria-label="t('prom_goods.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.prom_id" class="filter-select" @change="loadList">
        <option value="">{{ t('prom_goods.filter_all') }}</option>
        <option v-for="p in promotions" :key="p.id" :value="p.id">{{ p.title || p.name }}</option>
      </select>
    </div>

    <div class="card-shadow table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>{{ t('prom_goods.th_id') }}</th>
            <th>{{ t('prom_goods.th_promotion') }}</th>
            <th>{{ t('prom_goods.th_item') }}</th>
            <th>{{ t('prom_goods.th_prom_price') }}</th>
            <th>{{ t('prom_goods.th_stock') }}</th>
            <th>{{ t('prom_goods.th_status') }}</th>
            <th class="col-actions">{{ t('prom_goods.th_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in list" :key="record.id">
            <td class="col-check" @click.stop>
              <input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" />
            </td>
            <td class="mono muted">{{ record.id }}</td>
            <td>
              <span class="badge-info">{{ getPromLabel(record) }}</span>
            </td>
            <td>
              <div class="goods-cell">
                <div class="goods-thumb">
                  <img v-if="record.item && record.item.image" :src="record.item.image" alt="" />
                  <span v-else class="no-img">—</span>
                </div>
                <div class="goods-info">
                  <span class="goods-name">{{ getItemName(record) }}</span>
                  <span class="mono muted">ID: {{ record.item_id }}</span>
                </div>
              </div>
            </td>
            <td class="mono price-cell">{{ getPriceLabel(record) }}</td>
            <td class="mono muted">{{ record.stock ?? record.prom_stock ?? '—' }}</td>
            <td>
              <span :class="getStatusClass(getRecordStatus(record))">{{ getStatusLabel(getRecordStatus(record)) }}</span>
            </td>
            <td class="actions-cell" @click.stop>
              <button class="btn-ghost btn-sm" @click="openModal(record)">{{ t('common.edit') }}</button>
              <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
            </td>
          </tr>
          <tr v-if="isListEmpty">
            <td colspan="8">
              <div class="empty-state">
                <icon-empty class="empty-icon" />
                <span class="empty-text">{{ t('prom_goods.empty_data') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > pageSize">
      <span class="total-text">{{ t('prom_goods.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <a-drawer :visible="modalVisible" @cancel="closeModal" class="arco-drawer-md3" :width="'min(480px, 90vw)'" unmountOnClose :title="editingId ? t('prom_goods.edit_title') : t('prom_goods.add_title')">
      <div class="form-group">
        <label>{{ t('prom_goods.label_promotion') }}</label>
        <select v-model="form.prom_id" class="form-control">
          <option value="">{{ t('prom_goods.select_promotion') }}</option>
          <option v-for="p in promotions" :key="p.id" :value="p.id">{{ p.title || p.name }}</option>
        </select>
      </div>
      <div class="form-group">
        <label>{{ t('prom_goods.label_item_id') }}</label>
        <input v-model.number="form.item_id" type="number" class="form-control" :placeholder="t('prom_goods.input_item_id')" />
      </div>
      <div class="form-group">
        <label>{{ t('prom_goods.label_prom_price') }}</label>
        <input v-model="form.prom_price" type="number" step="0.01" class="form-control" :placeholder="t('prom_goods.input_prom_price')" />
      </div>
      <div class="form-group">
        <label>{{ t('prom_goods.label_stock') }}</label>
        <input v-model.number="form.stock" type="number" class="form-control" :placeholder="t('prom_goods.input_stock')" />
      </div>
      <div class="form-group">
        <label>{{ t('prom_goods.label_status') }}</label>
        <select v-model="form.prom_status" class="form-control">
          <option :value="0">{{ t('prom_goods.status_pending') }}</option>
          <option :value="1">{{ t('prom_goods.status_active') }}</option>
          <option :value="2">{{ t('prom_goods.status_ended') }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="closeModal">{{ t('prom_goods.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? t('prom_goods.submitting') : t('prom_goods.btn_submit') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getPromItemList, createPromItem, updatePromItem, deletePromItem } from '@/api/prom_items'
import { getPromotionList } from '@/api/promotions'

const { t } = useI18n({ useScope: 'global' })

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const promotions = ref([])
const modalVisible = ref(false)
const editingId = ref(null)
const submitting = ref(false)

const filters = reactive({ keyword: '', prom_id: '' })
const form = reactive({ prom_id: '', item_id: null, prom_price: '', stock: null, prom_status: 0 })

const isListEmpty = computed(() => list.value.length === 0 && !loading.value)
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadList() }, 300) }

const onPageChange = (p) => { page.value = p; loadList() }

async function loadList() {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, app_id: 10001 }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.prom_id) params.prom_id = filters.prom_id
    const res = await getPromItemList(params)
    list.value = res.data?.list || res.data?.data || []
    total.value = res.data?.total || 0
  } catch (e) {
    Message.error(e.message || t('prom_goods.load_error'))
  } finally {
    loading.value = false
  }
}

async function loadPromotions() {
  try {
    const res = await getPromotionList({ page_size: 200, app_id: 10001 })
    promotions.value = res.data?.list || res.data?.data || []
  } catch { /* ignore */ }
}

function getPromLabel(record) {
  if (record.name) return record.name
  if (record.promotion) return record.promotion.title || record.promotion.name || '—'
  return record.prom_id || '—'
}

function getItemName(record) {
  if (!record.item) return '—'
  return record.item.title || record.item.name || `#${record.item_id}`
}

function getPriceLabel(record) {
  if (record.expression) return record.expression
  if (record.prom_price != null) return `¥${Number(record.prom_price).toFixed(2)}`
  return '—'
}

function getStatusClass(status) {
  const map = { 0: 'badge-warning', 1: 'badge-success', 2: 'badge-info' }
  return map[status] || 'badge-info'
}

function getRecordStatus(record) {
  if (record.prom_status != null) return record.prom_status
  if (record.is_close != null) return record.is_close === 0 ? 1 : 2
  return 0
}

function getStatusLabel(status) {
  const map = { 0: t('prom_goods.status_pending'), 1: t('prom_goods.status_active'), 2: t('prom_goods.status_ended') }
  return map[status] || t('prom_goods.status_unknown')
}

function toggleSelectAll() {
  selectedIds.value = selectAll.value ? list.value.map(r => r.id) : []
}

function toggleSelect(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function openModal(record = null) {
  editingId.value = record ? record.id : null
  if (record) {
    Object.assign(form, {
      prom_id: record.prom_id || '',
      item_id: record.item_id,
      prom_price: record.prom_price ?? record.expression ?? '',
      stock: record.stock ?? record.prom_stock ?? null,
      prom_status: record.prom_status ?? (record.is_close != null ? (record.is_close === 0 ? 1 : 2) : 0)
    })
  } else {
    Object.assign(form, { prom_id: '', item_id: null, prom_price: '', stock: null, prom_status: 0 })
  }
  modalVisible.value = true
}

function closeModal() { modalVisible.value = false }

async function handleSubmit() {
  if (!form.prom_id || !form.item_id) {
    Message.warning(t('prom_goods.validation_required'))
    return
  }
  submitting.value = true
  try {
    const data = { ...form, app_id: 10001 }
    if (editingId.value) {
      await updatePromItem(editingId.value, data)
      Message.success(t('prom_goods.update_success'))
    } else {
      await createPromItem(data)
      Message.success(t('prom_goods.create_success'))
    }
    closeModal()
    loadList()
  } catch (e) {
    Message.error(e.message || t('prom_goods.submit_error'))
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id) {
  if (!confirm(t('prom_goods.confirm_delete'))) return
  try {
    await deletePromItem(id)
    Message.success(t('prom_goods.delete_success'))
    loadList()
  } catch (e) {
    Message.error(e.message || t('prom_goods.delete_error'))
  }
}

onMounted(() => { loadList(); loadPromotions() })
</script>

<style scoped>

.card-shadow { position: relative; overflow-x: auto; }
.col-check { width: 40px; text-align: center; }
.col-actions { white-space: nowrap; text-align: right; }
.mono { font-family: 'SF Mono', 'Cascadia Code', monospace; font-size: 12px; }

.price-cell { color: var(--color-error); }

.goods-thumb { width: 36px; height: 36px; border-radius: 4px; overflow: hidden; background: var(--color-surface-container-low); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.goods-thumb img { width: 100%; height: 100%; object-fit: cover; }
.goods-thumb .no-img { font-size: 11px; color: var(--color-on-surface-variant); }
.goods-info { display: flex; flex-direction: column; gap: 2px; }
.goods-name { font-size: 13px; color: var(--color-on-surface); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 13px; color: var(--color-on-surface-variant); }
.form-control { width: 100%; padding: 8px 12px; border: 1px solid var(--color-outline-variant); border-radius: 6px; font-size: 13px; background: var(--color-surface-container-lowest); color: var(--color-on-surface); box-sizing: border-box; }
</style>
