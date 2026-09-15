<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('order_logs.title') }}</h1>
        <p class="page-subtitle">{{ t('order_logs.subtitle') }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('order_logs.search_placeholder')" :aria-label="t('order_logs.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.change_type" class="filter-select" @change="loadData">
        <option value="">{{ t('order_logs.filter_type') }}</option>
        <option v-for="(label, val) in changeTypeMap" :key="val" :value="val">{{ label }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('order_logs.col_id') }}</th>
              <th>{{ t('order_logs.col_order') }}</th>
              <th>{{ t('order_logs.col_type') }}</th>
              <th>{{ t('order_logs.col_field') }}</th>
              <th>{{ t('order_logs.col_change') }}</th>
              <th>{{ t('order_logs.col_reason') }}</th>
              <th>{{ t('order_logs.col_operator') }}</th>
              <th>{{ t('order_logs.col_ip') }}</th>
              <th>{{ t('order_logs.col_time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="mono muted">{{ r.id }}</td>
              <td class="mono"><span class="order-link">#{{ r.order_no || r.order_id || '-' }}</span></td>
              <td><span class="badge" :class="getActionClass(r.change_type)">{{ getChangeTypeText(r.change_type) }}</span></td>
              <td class="mono muted">{{ r.change_field || '-' }}</td>
              <td class="change-cell">
                <span v-if="r.old_value || r.new_value" class="change-values">
                  <span class="old-val">{{ r.old_value || '∅' }}</span>
                  <span class="arrow">→</span>
                  <span class="new-val">{{ r.new_value || '∅' }}</span>
                </span>
                <span v-else class="muted">-</span>
              </td>
              <td class="reason-cell" :title="r.change_reason">{{ r.change_reason || '-' }}</td>
              <td>
                <div class="operator-cell">
                  <span class="op-badge" :class="getOperatorClass(r.operator_type)">{{ getOperatorText(r.operator_type) }}</span>
                  <span class="op-name">{{ r.operator_name || '-' }}</span>
                </div>
              </td>
              <td class="mono muted">{{ r.ip || '-' }}</td>
              <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="9" class="empty-row">
                <div class="empty-state">
                  <icon-file class="empty-icon" />
                  <span class="empty-text">{{ t('order_logs.empty') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('order_logs.total', { total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getOrderLogsList } from '@/api/order_logs'
import { IconSearch, IconFile } from '@arco-design/web-vue/es/icon'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '', change_type: '' })

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (newPage) => { page.value = newPage; loadData() }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

// change_type 常量映射 (与后端 OrderLog 模型一致)
const changeTypeMap = {
  10: 'type_create', 20: 'type_pay', 30: 'type_ship', 40: 'type_receive',
  50: 'type_cancel', 60: 'type_refund', 70: 'type_update', 80: 'type_status',
  90: 'type_change_price', 100: 'type_free_shipping', 110: 'type_audit', 120: 'type_note',
}

const getChangeTypeText = (type) => {
  const key = changeTypeMap[type]
  return key ? t(`order_logs.${key}`) : t('order_logs.type_unknown')
}

const getActionClass = (type) => {
  const map = {
    10: 'badge-success', 20: 'badge-info', 30: 'badge-secondary', 40: 'badge-info',
    50: 'badge-error', 60: 'badge-error', 70: 'badge-warning', 80: 'badge-warning',
    90: 'badge-tertiary', 100: 'badge-tertiary', 110: 'badge-secondary', 120: 'badge-secondary',
  }
  return map[type] || 'badge-secondary'
}

const getOperatorText = (type) => {
  if (type === 10) return t('order_logs.op_user')
  if (type === 20) return t('order_logs.op_admin')
  if (type === 30) return t('order_logs.op_system')
  return '-'
}

const getOperatorClass = (type) => {
  if (type === 10) return 'op-user'
  if (type === 20) return 'op-admin'
  if (type === 30) return 'op-system'
  return 'op-system'
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getOrderLogsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) {
    Message.error(t('order_logs.operation_failed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<style>
html.dark .page-content .data-table td,
[arco-theme="dark"] .page-content .data-table td {
  color: var(--color-inverse-on-surface);
}
</style>

<style scoped>
.order-link { color: var(--color-primary); font-weight: 600; }

.change-cell { max-width: 200px; }
.change-values { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.old-val { color: var(--color-on-surface-variant); text-decoration: line-through; }
.arrow { color: var(--color-on-surface-variant); font-size: 11px; }
.new-val { color: var(--color-primary); font-weight: 500; }

.reason-cell { max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.operator-cell { display: flex; align-items: center; gap: 6px; }
.op-badge {
  font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: var(--radius-full);
  white-space: nowrap;
}
.op-user { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }
.op-admin { background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); }
.op-system { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }
.op-name { font-size: 12px; color: var(--color-on-surface); }

.filter-select { padding: 8px 12px; }
</style>
