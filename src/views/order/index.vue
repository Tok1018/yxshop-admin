<template>
  <div class="page-content">
    <div class="content-layout">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="body-md text-on-surface-variant">{{ t('order.stats.todayOrders') }}</span>
            <div class="stat-icon-wrap primary"><icon-list /></div>
          </div>
          <div class="stat-card-value">
            <span class="stat-value">{{ formatNumber(stats.todayOrders) }}</span>
            <span class="stat-trend up"><icon-arrow-rise /> {{ formatTrend(stats.todayGrowth) }}</span>
          </div>
          <p class="label-sm text-on-surface-variant">{{ t('order.stats.vsYesterday', { n: stats.todayDiff }) }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="body-md text-on-surface-variant">{{ t('order.stats.pendingPayment') }}</span>
            <div class="stat-icon-wrap secondary"><icon-safe /></div>
          </div>
          <div class="stat-card-value">
            <span class="stat-value">{{ formatNumber(stats.pendingPayment) }}</span>
            <span class="label-sm text-on-surface-variant">{{ t('order.stats.ofTotal', { p: stats.pendingPaymentPct }) }}</span>
          </div>
          <p class="label-sm text-on-surface-variant">{{ t('order.stats.avgStay', { n: stats.avgStayMin }) }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="body-md text-on-surface-variant">{{ t('order.stats.pendingShip') }}</span>
            <div class="stat-icon-wrap tertiary"><icon-send /></div>
          </div>
          <div class="stat-card-value">
            <span class="stat-value">{{ formatNumber(stats.pendingShip) }}</span>
            <span v-if="stats.urgentShip" class="label-sm text-error">{{ t('order.stats.urgent', { n: stats.urgentShip }) }}</span>
          </div>
          <p class="label-sm text-on-surface-variant">{{ t('order.stats.overdueUnshipped', { n: stats.overdueUnshipped }) }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="body-md text-on-surface-variant">{{ t('order.stats.todayRevenue') }}</span>
            <div class="stat-icon-wrap primary"><icon-file /></div>
          </div>
          <div class="stat-card-value">
            <span class="stat-value">{{ formatCurrency(stats.todayRevenue) }}</span>
            <span class="stat-trend up"><icon-arrow-rise /> {{ formatTrend(stats.revenueGrowth) }}</span>
          </div>
          <p class="label-sm text-on-surface-variant">{{ t('order.stats.avgOrderValue', { v: formatCurrency(stats.avgOrderValue) }) }}</p>
        </div>
      </div>

      <div class="main-grid">
        <div class="main-content">
        <div class="table-card card-shadow">
          <div class="table-header">
            <h3 class="headline-md">{{ t('order.stats.orderList') }}</h3>
            <div class="table-actions">
              <div class="search-box">
                <icon-search />
                <input v-model="filters.keyword" :placeholder="t('order.searchPlaceholder')" :aria-label="t('order.searchPlaceholder')" @input="debouncedSearch" />
              </div>
              <select v-model="filters.status" class="filter-select" @change="loadData">
                <option value="">{{ t('order.allStatus') }}</option>
                <option :value="String(ORDER_STATUS.PENDING)">{{ t('order.pending') }}</option>
                <option :value="String(ORDER_STATUS.CONFIRMED)">{{ t('order.confirmed') }}</option>
                <option :value="String(ORDER_STATUS.SHIPPED)">{{ t('order.shipped') }}</option>
                <option :value="String(ORDER_STATUS.COMPLETED)">{{ t('order.completed') }}</option>
                <option :value="String(ORDER_STATUS.CANCELLED)">{{ t('order.cancelled') }}</option>
              </select>
              <select v-model="filters.pay_status" class="filter-select" @change="loadData">
                <option value="">{{ t('order.allPayment') }}</option>
                <option :value="String(PAY_STATUS.UNPAID)">{{ t('order.unpaid') }}</option>
                <option :value="String(PAY_STATUS.PAID)">{{ t('order.paid') }}</option>
              </select>
              <div class="date-range">
                <input type="date" v-model="filters.start_date" @change="loadData" class="filter-select" />
                <span class="date-sep">—</span>
                <input type="date" v-model="filters.end_date" @change="loadData" class="filter-select" />
              </div>
              <button class="btn-ghost" @click="exportOrders"><icon-export /> {{ t('order.export') }}</button>
            </div>
          </div>
          <div class="table-scroll custom-scrollbar">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
                  <th>{{ t('order.stats.orderInfo') }}</th>
                  <th>{{ t('order.stats.buyer') }}</th>
                  <th>{{ t('order.orderStatus') }}</th>
                  <th>{{ t('order.stats.paidAmount') }}</th>
                  <th class="col-actions">{{ t('order.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in list" :key="order.id" :class="{ selected: selectedIds.includes(order.id) }" @click="openDetail(order)">
                  <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(order.id)" @change="toggleSelect(order.id)" /></td>
                  <td>
                    <div class="goods-cell">
                      <div class="goods-thumb" v-if="order.items?.[0]?.cover">
                        <img :src="order.items[0].cover" :alt="getItemName(order)" />
                      </div>
                      <div class="goods-info">
                        <span class="goods-name">{{ order.order_no || order.id }}</span>
                        <span class="goods-sku">{{ getItemName(order) }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="buyer-cell">
                      <div class="buyer-avatar">{{ (order.buyer_name || '?')[0] }}</div>
                      <div>
                        <span class="body-md">{{ order.buyer_name || '-' }}</span>
                        <span class="label-sm text-on-surface-variant">{{ order.buyer_phone || '' }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="['status-badge', getStatusClass(order)]">
                      <span class="status-dot"></span>
                      {{ getStatusText(order) }}
                    </span>
                  </td>
                  <td>
                    <span class="body-md font-bold">{{ formatCurrency(order.pay_price || order.total_price) }}</span>
                    <span v-if="order.pay_method" class="label-sm text-on-surface-variant">{{ order.pay_method }}</span>
                  </td>
                  <td class="actions-cell" @click.stop>
                    <button v-if="getActionVisibility(order).canShip" class="btn-primary btn-sm" @click="openQuickShip(order)">{{ t('order.ship') }}</button>
                    <button v-if="getActionVisibility(order).canConfirm" class="btn-ghost btn-sm" @click="handleConfirm(order)">{{ t('common.confirm') }}</button>
                    <button class="btn-ghost btn-sm" @click="openDetail(order)">{{ t('common.detail') }}</button>
                  </td>
                </tr>
                <tr v-if="hasNoData">
                  <td colspan="6" class="empty-state">
                    <icon-empty class="empty-icon" />
                    <span class="empty-text">{{ t('order.noData') }}</span>
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
          <span class="total-text">{{ t('order.stats.showRange', { from: (page - 1) * pageSize + 1, to: Math.min(page * pageSize, total), total: formatNumber(total) }) }}</span>
          <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
        </div>
        </div>

        <div class="sidebar-grid">
          <div class="card-shadow tracking-card">
            <div class="card-header-row">
              <h3 class="headline-md">{{ t('order.stats.logisticsTracking') }}</h3>
              <button class="link-btn">{{ t('order.stats.viewMap') }}</button>
            </div>
            <div class="tracking-timeline">
              <div v-for="(step, i) in trackingSteps" :key="i" :class="['tracking-step', { active: step.active }]">
                <div class="tracking-dot-wrap">
                  <div class="tracking-dot"><component :is="step.icon" /></div>
                </div>
                <div class="tracking-content">
                  <div class="tracking-row">
                    <span class="body-md font-bold">{{ step.label }}</span>
                    <span class="label-sm text-on-surface-variant">{{ step.time }}</span>
                  </div>
                  <p class="label-sm text-on-surface-variant">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card-shadow customer-card">
            <div class="customer-header">
              <div class="customer-avatar-lg">{{ (customerProfile.name || '?')[0] }}</div>
              <div>
                <h3 class="headline-md">{{ customerProfile.name || '-' }}</h3>
                <div class="member-badge tertiary">
                  <icon-star-fill />
                  <span>{{ customerProfile.level || '-' }}</span>
                </div>
              </div>
            </div>
            <div class="customer-stats">
              <div class="customer-stat-item">
                <span class="label-sm text-on-surface-variant">{{ t('order.stats.totalSpent') }}</span>
                <span class="body-md font-bold">{{ formatCurrency(customerProfile.totalSpent) }}</span>
              </div>
              <div class="customer-stat-item">
                <span class="label-sm text-on-surface-variant">{{ t('order.stats.returnCount') }}</span>
                <span class="body-md font-bold text-error">{{ customerProfile.returnCount || 0 }}</span>
              </div>
            </div>
            <div class="customer-detail-list">
              <div class="customer-detail-row">
                <span class="label-sm text-on-surface-variant">{{ t('order.stats.preference') }}</span>
                <span class="label-sm">{{ customerProfile.preference || '-' }}</span>
              </div>
              <div class="customer-detail-row">
                <span class="label-sm text-on-surface-variant">{{ t('order.stats.frequentAddress') }}</span>
                <span class="label-sm">{{ customerProfile.address || '-' }}</span>
              </div>
            </div>
            <button class="btn-ghost btn-full" @click="contactCustomer">{{ t('order.stats.contactCustomer') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('order.selected', { n: selectedIds.length }) }}</span>
      <button class="btn-ghost" @click="batchConfirm">{{ t('order.batchConfirm') }}</button>
      <button class="btn-primary" @click="batchShip">{{ t('order.batchShip') }}</button>
      <button class="btn-ghost" @click="selectedIds = []; selectAll = false">{{ t('order.cancelSelect') }}</button>
    </div>

    <a-modal v-model:visible="quickShipVisible" :title="quickTargetOrder?.batch ? t('order.batchShip') : t('order.ship')" @ok="handleQuickShip" :ok-loading="quickShipLoading">
      <a-alert v-if="quickTargetOrder?.batch" type="info" style="margin-bottom:12px">{{ t('order.batchShipTip', { n: quickTargetOrder?.ids?.length || 0 }) }}</a-alert>
      <a-form :model="quickShipForm" layout="vertical">
        <a-form-item :label="t('order.ship_express_label')">
          <a-select v-model="quickShipForm.express_id" :placeholder="t('order.express_placeholder')" allow-clear>
            <a-option value="SF">{{ t('order.express_sf') }}</a-option>
            <a-option value="YTO">{{ t('order.express_yto') }}</a-option>
            <a-option value="ZTO">{{ t('order.express_zto') }}</a-option>
            <a-option value="STO">{{ t('order.express_sto') }}</a-option>
            <a-option value="YD">{{ t('order.express_yd') }}</a-option>
            <a-option value="JD">{{ t('order.express_jd') }}</a-option>
            <a-option value="EMS">EMS</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('order.ship_express_no_label')">
          <a-input v-model="quickShipForm.express_no" :placeholder="t('order.ship_express_no_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="quickNoteVisible" title="商家备注" @ok="handleQuickNote" :ok-loading="quickNoteLoading">
      <a-form :model="quickNoteForm" layout="vertical">
        <a-form-item label="备注内容（保存时会自动标注操作人和时间）">
          <a-textarea v-model="quickNoteForm.content" placeholder="请输入备注内容" :auto-size="{ minRows: 3 }" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model="quickNoteForm.append">追加到已有备注（不勾选则覆盖）</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-drawer :visible="detailVisible" :width="'min(560px, 90vw)'" class="arco-drawer-md3" :title="t('order.orderDetail')" @cancel="detailVisible = false" :footer="true" unmount-on-close>
      <div v-if="currentOrder">
        <div class="detail-section">
          <h4>{{ t('order.basicInfo') }}</h4>
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">{{ t('order.orderNo') }}</span><span class="detail-value mono">{{ currentOrder.order_no || currentOrder.id }}</span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.orderTime') }}</span><span class="detail-value">{{ formatTime(currentOrder.created_at) }}</span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.orderStatus') }}</span><span class="detail-value"><span :class="['status-badge', getStatusClass(currentOrder)]"><span class="status-dot"></span>{{ getStatusText(currentOrder) }}</span></span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.payStatus') }}</span><span class="detail-value"><span :class="['status-badge', currentOrder.pay_status === PAY_STATUS.PAID ? 'status-on' : 'status-off']"><span class="status-dot"></span>{{ PAY_STATUS_TEXT[currentOrder.pay_status] || t('order.unknown') }}</span></span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.orderAmount') }}</span><span class="detail-value mono highlight">{{ formatCurrency(currentOrder.total_price) }}</span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.paidAmount') }}</span><span class="detail-value mono highlight">{{ formatCurrency(currentOrder.pay_price) }}</span></div>
          </div>
        </div>
        <div class="detail-section">
          <h4>{{ t('order.productList') }}</h4>
          <div class="goods-list">
            <div v-for="g in (currentOrder.items || [])" :key="g.id" class="goods-item">
              <div class="goods-thumb-sm"><img v-if="g.cover" :src="g.cover" :alt="g.name" /><span v-else class="no-img">—</span></div>
              <div class="goods-detail"><span class="g-name">{{ g.name || g.title }}</span><span class="g-spec" v-if="g.sku_name">{{ g.sku_name }}</span></div>
              <span class="g-price mono">{{ formatCurrency(g.price) }}</span>
              <span class="g-qty">×{{ g.quantity || 1 }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section">
          <h4>订单备注</h4>
          <div class="note-block" v-if="currentOrder.buyer_note">
            <div class="note-block-header">
              <span class="note-tag note-tag-buyer">买家留言</span>
              <span class="note-time" v-if="currentOrder.created_at">{{ formatTime(currentOrder.created_at) }}</span>
            </div>
            <p class="note-content">{{ currentOrder.buyer_note }}</p>
          </div>
          <div class="note-block" v-if="currentOrder.seller_note">
            <div class="note-block-header">
              <span class="note-tag note-tag-seller">商家备注</span>
            </div>
            <div class="note-lines">
              <p class="note-content" v-for="(line, i) in sellerNoteLines(currentOrder.seller_note)" :key="i">{{ line }}</p>
            </div>
          </div>
          <div v-if="!currentOrder.buyer_note && !currentOrder.seller_note" style="padding: 12px; text-align: center; color: var(--color-on-surface-variant); font-size: 13px;">暂无备注</div>
        </div>
        <div class="detail-section" v-if="currentOrder.address">
          <h4>{{ t('order.shippingInfo') }}</h4>
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">{{ t('order.receiver') }}</span><span class="detail-value">{{ currentOrder.address?.name || '-' }}</span></div>
            <div class="detail-item"><span class="detail-label">{{ t('order.phone') }}</span><span class="detail-value mono">{{ currentOrder.address?.phone || '-' }}</span></div>
            <div class="detail-item full"><span class="detail-label">{{ t('order.address') }}</span><span class="detail-value">{{ currentOrder.address?.full_address || currentOrder.address?.address || '-' }}</span></div>
          </div>
        </div>
        <div class="detail-section">
          <h4>{{ t('order.orderActions') }}</h4>
          <div class="action-flow">
            <div v-for="(step, idx) in getOrderFlow(currentOrder)" :key="idx" :class="['flow-step', { active: step.active, done: step.done }]">
              <div class="step-dot"></div>
              <span class="step-label">{{ step.label }}</span>
            </div>
          </div>
          <div class="detail-actions">
            <button v-if="currentOrder && getActionVisibility(currentOrder).canConfirm" class="btn-primary" @click="handleConfirm(currentOrder); detailVisible = false">{{ t('order.confirmOrder') }}</button>
            <button v-if="currentOrder && getActionVisibility(currentOrder).canShip" class="btn-primary" @click="openQuickShip(currentOrder); detailVisible = false">{{ t('order.ship') }}</button>
            <button class="btn-ghost" @click="openQuickNote(currentOrder)">{{ t('order.note') }}</button>
            <button v-if="currentOrder && getActionVisibility(currentOrder).canCancel" class="btn-ghost btn-ghost-danger" @click="handleCancel(currentOrder); detailVisible = false">{{ t('order.cancelOrder') }}</button>
          </div>
        </div>
        <div class="detail-section">
          <h4>操作日志</h4>
          <div v-if="currentOrder.logs && currentOrder.logs.length" class="log-list">
            <div v-for="log in currentOrder.logs" :key="log.log_id || log.id" class="log-row">
              <span class="log-time mono">{{ formatTime(log.created_at) }}</span>
              <span class="log-badge">{{ log.change_field || '-' }}</span>
              <span class="log-operator">{{ log.operator_name || '系统' }}</span>
              <span class="log-reason" v-if="log.change_reason">{{ log.change_reason }}</span>
            </div>
          </div>
          <div v-else style="padding: 16px; text-align: center; color: var(--color-on-surface-variant); font-size: 13px;">暂无操作日志</div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="detailVisible = false">{{ t('common.close') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import {
  IconSearch, IconExport, IconRight,
  IconArrowRise, IconList, IconSafe, IconSend, IconFile,
  IconStarFill, IconPrinter, IconUndo, IconThunderbolt, IconEmpty,
  IconStorage
} from '@arco-design/web-vue/es/icon'
import { getOrderList, updateOrderStatus, getOrderDetail, shipOrder, addOrderNote, getOrderStatistics, getOrderTrackingById, getCustomerProfile } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TEXT, ORDER_STATUS_CLASS, PAY_STATUS, PAY_STATUS_TEXT, DELIVERY_STATUS, ORDER_FLOW_STATUS, ORDER_FLOW_STATUS_TEXT, ORDER_FLOW_STATUS_CLASS, BACKEND_ORDER_STATUS } from '@/config/constants'
import { mapOrderFlowStatus, mapFilterToParams, getActionVisibility, getFlowStatusText, getFlowStatusClass } from '@/utils/orderStatus'
import { exportToFile } from '@/utils/export'
import { formatCurrency, formatNumber, formatTrend } from '@/utils/format'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const detailVisible = ref(false)
const currentOrder = ref(null)

const quickShipVisible = ref(false)
const quickShipLoading = ref(false)
const quickShipForm = reactive({ express_id: '', express_no: '' })
const quickNoteVisible = ref(false)
const quickNoteLoading = ref(false)
const quickNoteForm = reactive({ content: '', append: true })
const quickTargetOrder = ref(null)

const stats = ref({ todayOrders: 0, todayGrowth: 0, todayDiff: 0, pendingPayment: 0, pendingPaymentPct: 0, avgStayMin: 12, pendingShip: 0, urgentShip: 0, overdueUnshipped: 0, todayRevenue: 0, revenueGrowth: 0, avgOrderValue: 0, pendingRefund: 0 })

const trackingSteps = ref([])

const customerProfile = ref({ name: '-', level: '-', totalSpent: 0, returnCount: 0, preference: '-', address: '-' })

const filters = ref({ keyword: '', status: '', pay_status: '', start_date: '', end_date: '' })

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const hasNoData = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }
const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const flowParams = mapFilterToParams(filters.value.status)
    const params = { page: page.value, page_size: pageSize, search: filters.value.keyword, pay_status: filters.value.pay_status, start_date: filters.value.start_date, end_date: filters.value.end_date, ...flowParams }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getOrderList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('order.operationFailed')) } finally { loading.value = false }
}

const loadStats = async () => {
  try {
    const res = await getOrderStatistics()
    if (res.data) Object.assign(stats.value, res.data)
  } catch (error) { /* stats optional */ }
}

const toggleSelectAll = () => {
  selectedIds.value = selectAll.value ? list.value.map(o => o.id) : []
}
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const openDetail = async (order) => {
  try {
    const res = await getOrderDetail(order.id)
    currentOrder.value = res.data?.order || res.data || order
  } catch { currentOrder.value = order }
  detailVisible.value = true
  loadTracking(order.id)
  loadCustomerProfile(order.id)
}

const loadTracking = async (orderId) => {
  try {
    const res = await getOrderTrackingById(orderId)
    const nodes = res.data?.nodes || []
    trackingSteps.value = nodes.map((n, i) => ({
      label: n.description,
      time: formatTime(n.time),
      desc: '',
      icon: i === 0 ? IconSend : IconStorage,
      active: i === 0
    }))
    if (trackingSteps.value.length === 0) {
      trackingSteps.value = [{ label: t('order.noTrackingInfo'), time: '', desc: '', icon: IconStorage, active: false }]
    }
  } catch {
    trackingSteps.value = [{ label: t('order.noTrackingInfo'), time: '', desc: '', icon: IconStorage, active: false }]
  }
}

const loadCustomerProfile = async (orderId) => {
  try {
    const res = await getCustomerProfile(orderId)
    if (res.data) Object.assign(customerProfile.value, res.data)
  } catch { /* keep defaults */ }
}

const handleConfirm = async (order) => {
  Modal.warning({
    title: t('order.confirmOrder'),
    content: t('order.confirm_order_content', { no: order.order_no || order.id }),
    hideCancel: false,
    onOk: async () => {
      try {
        await updateOrderStatus(order.id, { payment_status: PAY_STATUS.PAID })
        Message.success(t('order.orderConfirmed'))
        loadData()
      } catch (error) { Message.error(t('order.operationFailed')) }
    }
  })
}

const handleShip = async (order) => {
  openQuickShip(order)
}

const handleCancel = async (order) => {
  Modal.warning({
    title: t('order.cancelOrder'),
    content: t('order.cancel_order_content', { no: order.order_no || order.id }),
    hideCancel: false,
    onOk: async () => {
      try {
        await updateOrderStatus(order.id, { status: BACKEND_ORDER_STATUS.CANCEL })
        Message.success(t('order.orderCancelled'))
        loadData()
      } catch (error) { Message.error(t('order.operationFailed')) }
    }
  })
}

const batchConfirm = async () => {
  Modal.warning({
    title: t('order.batchConfirm'),
    content: t('order.batchConfirmContent', { n: selectedIds.value.length }),
    hideCancel: false,
    onOk: async () => {
      try {
        await Promise.all(selectedIds.value.map(id => updateOrderStatus(id, { payment_status: PAY_STATUS.PAID })))
        Message.success(t('order.batchConfirmSuccess'))
        selectedIds.value = []
        selectAll.value = false
        loadData()
      } catch (error) { Message.error(t('order.batchOperationFailed')) }
    }
  })
}

const batchShip = async () => {
  if (selectedIds.value.length === 0) {
    Message.warning(t('order.selectFirst'))
    return
  }
  quickShipForm.express_id = ''
  quickShipForm.express_no = ''
  quickTargetOrder.value = { id: null, batch: true, ids: [...selectedIds.value] }
  quickShipVisible.value = true
}

const exportOrders = () => exportToFile('/admin/api/orders/export', filters.value, 'orders.xlsx')

const openQuickShip = (order) => {
  quickTargetOrder.value = order
  quickShipForm.express_id = ''
  quickShipForm.express_no = ''
  quickShipVisible.value = true
}

const handleQuickShip = async () => {
  if (!quickShipForm.express_id) {
    Message.warning(t('order.ship_express_required'))
    return
  }
  if (!quickShipForm.express_no || !quickShipForm.express_no.trim()) {
    Message.warning(t('order.ship_express_no_required'))
    return
  }
  quickShipLoading.value = true
  try {
    if (quickTargetOrder.value?.batch) {
      const ids = quickTargetOrder.value.ids
      await Promise.all(ids.map(id => shipOrder(id, { ...quickShipForm })))
      Message.success(t('order.batchShipSuccess'))
      selectedIds.value = []
      selectAll.value = false
    } else {
      await shipOrder(quickTargetOrder.value.id, quickShipForm)
      Message.success(t('order.operation_success'))
    }
    quickShipVisible.value = false
    loadData()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { quickShipLoading.value = false }
}

const openQuickNote = (order) => {
  quickTargetOrder.value = order
  quickNoteForm.content = ''
  quickNoteForm.append = true
  quickNoteVisible.value = true
}

const handleQuickNote = async () => {
  quickNoteLoading.value = true
  try {
    await addOrderNote(quickTargetOrder.value.id, quickNoteForm)
    Message.success(t('order.operation_success'))
    quickNoteVisible.value = false
    loadData()
    if (detailVisible.value && quickTargetOrder.value?.id) {
      try {
        const res = await getOrderDetail(quickTargetOrder.value.id)
        currentOrder.value = res.data?.order || res.data || currentOrder.value
      } catch { /* keep current */ }
    }
  } catch (error) { Message.error(t('order.operation_failed')) } finally { quickNoteLoading.value = false }
}

const getStatusText = (s) => {
  if (typeof s === 'object' && s !== null) return getFlowStatusText(mapOrderFlowStatus(s))
  return ORDER_FLOW_STATUS_TEXT[s] || t('order.unknown')
}
const getStatusClass = (s) => {
  if (typeof s === 'object' && s !== null) return 'status-' + getFlowStatusClass(mapOrderFlowStatus(s))
  const map = { 0: 'status-pending', 1: 'status-confirmed', 2: 'status-shipped', 3: 'status-on', 4: 'status-off' }
  return map[s] || 'status-pending'
}
const getItemName = (o) => o.items?.[0]?.name || o.item_name || '-'
const formatTime = (t) => t ? new Date(typeof t === 'number' ? t * 1000 : t).toLocaleString('zh-CN') : '-'
const sellerNoteLines = (note) => note ? String(note).split('\n').filter(l => l.trim()) : []
const contactCustomer = () => {
  const phone = currentOrder.value?.buyer_phone || currentOrder.value?.address?.phone
  if (phone) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).then(() => Message.success(t('order.phoneCopied')))
    } else {
      Message.info(t('order.customerPhone') + ': ' + phone)
    }
  } else {
    Message.info(t('order.noCustomerPhone'))
  }
}

const handleBatchPrint = () => {
  if (selectedIds.value.length === 0) {
    Message.warning(t('order.selectToPrint'))
    return
  }
  window.print()
}

const getOrderFlow = (order) => {
  const fs = mapOrderFlowStatus(order)
  const steps = [
    { label: t('order.pending'), done: fs >= ORDER_FLOW_STATUS.PENDING, active: fs === ORDER_FLOW_STATUS.PENDING },
    { label: t('order.confirmed'), done: fs >= ORDER_FLOW_STATUS.CONFIRMED, active: fs === ORDER_FLOW_STATUS.CONFIRMED },
    { label: t('order.shipped'), done: fs >= ORDER_FLOW_STATUS.SHIPPED, active: fs === ORDER_FLOW_STATUS.SHIPPED },
    { label: t('order.completed'), done: fs >= ORDER_FLOW_STATUS.COMPLETED, active: fs === ORDER_FLOW_STATUS.COMPLETED },
  ]
  if (fs === ORDER_FLOW_STATUS.CANCELLED) steps.push({ label: t('order.cancelled'), done: true, active: true })
  return steps
}

onMounted(() => { loadData(); loadStats() })
</script>

<style scoped>
.page-content {
  font-family: var(--font-body-md);
}

.content-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.text-on-surface-variant { color: var(--color-on-surface-variant); }
.text-error { color: var(--color-error); }
.font-bold { font-weight: 700; }
.body-md { font-size: 14px; line-height: 20px; }
.label-sm { font-size: 12px; line-height: 16px; letter-spacing: 0.01em; font-weight: 500; }
.headline-md { font-size: 20px; line-height: 28px; font-weight: 600; }
.stat-value { font-family: var(--font-stats-number); font-size: 24px; font-weight: 700; line-height: 32px; letter-spacing: -0.01em; }

.highlight { color: var(--color-primary); font-weight: 600; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(var(--color-outline-variant-rgb), 0.3);
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-base);
}

.stat-card-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.stat-trend.up { color: var(--color-primary); }

.main-grid {
  display: grid;
  grid-template-columns: 8fr 4fr;
  gap: var(--spacing-lg);
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-width: 0;
}

.table-card .data-table thead th {
  padding: var(--spacing-base) var(--spacing-xl);
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-on-surface-variant);
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}
.table-card .data-table tbody td {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 14px; color: var(--color-on-surface);
  border-bottom: 1px solid rgba(var(--color-outline-variant-rgb), 0.2);
}
.table-card .data-table tbody tr {
  cursor: pointer; transition: background 0.15s;
}
.table-card .data-table tbody tr:hover {
  background: rgba(var(--color-surface-container-low-rgb, 242, 244, 246), 0.5);
}
.table-card .data-table tbody tr.selected {
  background: rgba(var(--color-primary-rgb), 0.05);
}

.table-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-outline-variant);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-base);
  flex-wrap: wrap;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.search-box { min-width: 180px; }

.filter-select { padding: 8px 12px; }
.date-range { display: flex; align-items: center; gap: var(--spacing-sm); }
.date-sep { color: var(--color-on-surface-variant); }

.col-check { width: 48px; }


.goods-cell { display: flex; align-items: center; gap: var(--spacing-base); }
.goods-thumb {
  width: 48px; height: 48px; border-radius: var(--radius-md);
  overflow: hidden; background: var(--color-surface-container-high); flex-shrink: 0;
}
.goods-thumb img { width: 100%; height: 100%; object-fit: cover; }
.goods-info { display: flex; flex-direction: column; gap: 2px; }
.goods-name { color: var(--color-on-surface); font-size: 14px; font-weight: 700; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.goods-sku { font-size: 12px; color: var(--color-on-surface-variant); }

.buyer-cell { display: flex; align-items: center; gap: var(--spacing-sm); }
.buyer-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; flex-shrink: 0;
}

.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: var(--radius-full);
  font-size: 11px; font-weight: 700;
}
.status-on { background: rgba(var(--color-primary-container-rgb), 0.1); color: var(--color-primary); }
.status-on .status-dot { background: var(--color-primary-container); }
.status-pending { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }
.status-pending .status-dot { background: var(--color-tertiary); }
.status-confirmed { background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); }
.status-confirmed .status-dot { background: var(--color-secondary); }
.status-shipped { background: rgba(var(--color-primary-container-rgb), 0.2); color: var(--color-primary); }
.status-shipped .status-dot { background: var(--color-primary-container); }




.sidebar-grid { display: flex; flex-direction: column; gap: var(--spacing-lg); }

.tracking-card,
.customer-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.card-header-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: var(--spacing-xl);
}

.link-btn {
  font-size: 12px; font-weight: 700; color: var(--color-primary);
  background: none; border: none; cursor: pointer;
}


.tracking-timeline {
  display: flex; flex-direction: column; gap: var(--spacing-xl);
  position: relative;
  padding-left: 24px;
}
.tracking-timeline::before {
  content: ''; position: absolute; left: 11px; top: 8px; bottom: 8px;
  width: 1px; background: var(--color-outline-variant);
}

.tracking-step {
  display: flex; gap: var(--spacing-base); position: relative;
}
.tracking-dot-wrap {
  position: relative; z-index: 1;
}
.tracking-dot {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--color-surface-container-highest);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-on-surface-variant); font-size: 12px;
}
.tracking-step.active .tracking-dot {
  background: var(--color-primary-container);
  color: var(--color-on-primary);
  box-shadow: 0 0 0 4px rgba(var(--color-primary-container-rgb), 0.1);
}
.tracking-content { flex: 1; }
.tracking-row { display: flex; justify-content: space-between; align-items: flex-start; }

.customer-header { display: flex; align-items: center; gap: var(--spacing-base); margin-bottom: var(--spacing-xl); }
.customer-avatar-lg {
  width: 64px; height: 64px; border-radius: var(--radius-xl);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 700;
  box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.1);
}
.member-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 700; margin-top: 4px;
}
.member-badge.tertiary { color: var(--color-tertiary); }

.customer-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-base);
  margin-bottom: var(--spacing-xl);
}
.customer-stat-item {
  background: var(--color-surface-container-low);
  padding: var(--spacing-base);
  border-radius: var(--radius-md);
  display: flex; flex-direction: column; gap: 4px;
}

.customer-detail-list { display: flex; flex-direction: column; gap: var(--spacing-sm); margin-bottom: var(--spacing-xl); }
.customer-detail-row { display: flex; justify-content: space-between; align-items: center; }

.btn-full { width: 100%; justify-content: center; }
.btn-ghost-danger { color: var(--color-error); }

.action-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

.action-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  cursor: pointer;
  transition: background 0.2s;
}
.action-card:hover { background: var(--color-surface-container-low); }

.action-icon {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}
.action-icon.primary { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }
.action-icon.secondary { background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); }
.action-icon.tertiary { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }

.action-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.action-arrow { color: rgba(var(--color-on-surface-variant-rgb), 0.3); }

.batch-bar {
  position: fixed; bottom: var(--spacing-xl); left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: var(--spacing-base);
  padding: 10px var(--spacing-xl);
  background: var(--color-inverse-surface); backdrop-filter: blur(16px);
  border-radius: var(--radius-lg); font-size: 14px;
  color: var(--color-inverse-on-surface); z-index: 100;
}

.detail-section { margin-bottom: var(--spacing-2xl); }
.detail-section h4 {
  font-size: 12px; font-weight: 700; color: var(--color-on-surface-variant);
  text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 var(--spacing-base);
}
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-base); }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-item.full { grid-column: 1 / -1; }
.detail-label { font-size: 12px; color: var(--color-on-surface-variant); }
.detail-value { font-size: 14px; color: var(--color-on-surface); }

.goods-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.goods-item {
  display: flex; align-items: center; gap: var(--spacing-base);
  padding: var(--spacing-base); background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
}
.goods-thumb-sm {
  width: 40px; height: 40px; border-radius: var(--radius-md);
  overflow: hidden; background: var(--color-surface-container-high);
  display: flex; align-items: center; justify-content: center;
}
.goods-thumb-sm img { width: 100%; height: 100%; object-fit: cover; }
.no-img { color: var(--color-on-surface-variant); font-size: 12px; }
.goods-detail { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.g-name { font-size: 13px; color: var(--color-on-surface); }
.g-spec { font-size: 11px; color: var(--color-on-surface-variant); }
.g-price { font-size: 13px; color: var(--color-on-surface); min-width: 70px; text-align: right; }
.g-qty { font-size: 12px; color: var(--color-on-surface-variant); min-width: 30px; text-align: right; }

.action-flow { display: flex; margin-bottom: var(--spacing-base); position: relative; padding: 0 var(--spacing-sm); }
.flow-step { flex: 1; display: flex; flex-direction: column; align-items: center; gap: var(--spacing-sm); position: relative; }
.flow-step::before {
  content: ''; position: absolute; top: 7px; left: -50%; right: 50%;
  height: 1px; background: var(--color-outline-variant);
}
.flow-step:first-child::before { display: none; }
.flow-step.done::before { background: var(--color-primary); }
.step-dot {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid var(--color-outline-variant);
  background: var(--color-surface-container-lowest); position: relative; z-index: 1;
}
.flow-step.done .step-dot { border-color: var(--color-primary); background: var(--color-primary); }
.flow-step.active .step-dot { border-color: var(--color-primary); box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.4); }
.step-label { font-size: 11px; color: var(--color-on-surface-variant); }
.flow-step.done .step-label { color: var(--color-on-surface); }
.flow-step.active .step-label { color: var(--color-primary); font-weight: 600; }
.detail-actions { display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm); }
.note-block {
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  padding: var(--spacing-base);
  margin-bottom: var(--spacing-sm);
}
.note-block-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: 6px;
}
.note-tag {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}
.note-tag-buyer {
  background: rgba(var(--color-tertiary-rgb), 0.1);
  color: var(--color-tertiary);
}
.note-tag-seller {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}
.note-time {
  font-size: 11px;
  color: var(--color-on-surface-variant);
}
.note-lines {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.note-content {
  font-size: 13px;
  color: var(--color-on-surface);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
.log-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.log-row {
  display: flex; align-items: center; gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-base);
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
}
.log-time { font-size: 12px; color: var(--color-on-surface-variant); flex-shrink: 0; }
.log-badge {
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  flex-shrink: 0;
}
.log-operator { font-size: 12px; color: var(--color-on-surface); flex-shrink: 0; }
.log-reason { font-size: 12px; color: var(--color-on-surface-variant); flex: 1; min-width: 0; }

@media (max-width: var(--breakpoint-lg)) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
  .action-grid { grid-template-columns: 1fr; }
  .table-header { flex-direction: column; }
  .table-actions { width: 100%; }
  .search-box { min-width: 160px; }
}

@media (max-width: var(--breakpoint-md)) {
  .page-content { padding: var(--spacing-base); }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
