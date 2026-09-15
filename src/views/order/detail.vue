<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('order.detail.title') }}</h1>
        <p class="page-subtitle">{{ t('order.detail.order_no') }}：{{ detail.order_no || '-' }}</p>
      </div>
      <div class="header-actions">
        <button v-if="getActionVisibility(detail).canConfirm" class="btn-primary" @click="handleConfirm">{{ t('order.detail.confirm_order') }}</button>
        <button v-if="getActionVisibility(detail).canShip" class="btn-primary" @click="showShipModal = true">{{ t('order.detail.ship') }}</button>
        <button v-if="getActionVisibility(detail).canCancel" class="btn-danger" @click="handleCancel">{{ t('order.detail.cancel_order') }}</button>
        <button v-if="getActionVisibility(detail).canPrint" class="btn-ghost" @click="handlePrint">{{ t('order.print') }}</button>
        <button class="btn-ghost" @click="$router.back()">{{ t('order.detail.back_list') }}</button>
      </div>
    </div>

    <div class="step-bar" v-if="detail.status !== undefined">
      <div v-for="(step, idx) in orderSteps" :key="idx" :class="['step-item', { active: step.active, done: step.done }]">
        <div class="step-dot">{{ step.done ? '✓' : idx + 1 }}</div>
        <span class="step-label">{{ step.label }}</span>
      </div>
    </div>

    <div class="detail-grid">
      <div class="info-card">
        <h3>{{ t('order.detail.basic_info') }}</h3>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">{{ t('order.detail.order_no') }}</span><span class="mono">{{ detail.order_no || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.order_status') }}</span><span class="badge" :class="getStatusBadgeClass(detail)">{{ getFlowStatusText(mapOrderFlowStatus(detail)) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.order_amount') }}</span><span class="mono amount-positive">¥{{ Number(detail.total_price || 0).toFixed(2) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.pay_amount') }}</span><span class="mono amount-positive">¥{{ Number(detail.pay_price || 0).toFixed(2) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.shipping_fee') }}</span><span class="mono">¥{{ Number(detail.shipping_fee || 0).toFixed(2) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.discount_amount') }}</span><span class="mono amount-negative">-¥{{ Number(detail.discount_amount || 0).toFixed(2) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.created_at') }}</span><span class="mono">{{ formatTime(detail.created_at) }}</span></div>
          <div class="info-row" v-if="detail.buyer_note"><span class="info-label">{{ t('order.detail.buyer_note') }}</span><span>{{ detail.buyer_note }}</span></div>
          <div class="info-row" v-if="detail.seller_note"><span class="info-label">商家备注</span><span>{{ detail.seller_note }}</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>{{ t('order.detail.payment_info') }}</h3>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">{{ t('order.detail.pay_status') }}</span><span class="badge" :class="detail.pay_status === PAY_STATUS.PAID ? 'badge-success' : 'badge-warning'">{{ PAY_STATUS_TEXT[detail.pay_status] || t('order.detail.unknown') }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.payment_method') }}</span><span class="info-value">{{ detail.payment_method || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.pay_time') }}</span><span class="mono">{{ formatTime(detail.pay_time) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.transaction_no') }}</span><span class="mono">{{ detail.transaction_no || '-' }}</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>{{ t('order.detail.receiver_info') }}</h3>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">{{ t('order.detail.receiver_name') }}</span><span class="info-value">{{ detail.receiver_name || detail.address?.name || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.receiver_phone') }}</span><span class="mono">{{ detail.receiver_phone || detail.address?.phone || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.receiver_address') }}</span><span class="info-value">{{ detail.address?.full_address || detail.receiver_address || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.delivery_status') }}</span><span class="badge-info">{{ DELIVERY_STATUS_TEXT[detail.delivery_status] || t('order.detail.unknown') }}</span></div>
        </div>
      </div>

      <div class="info-card" v-if="detail.delivery && detail.delivery.length">
        <h3>{{ t('order.detail.express_info') }}</h3>
        <div class="info-grid" v-for="d in detail.delivery" :key="d.id">
          <div class="info-row"><span class="info-label">{{ t('order.detail.express_company') }}</span><span class="info-value">{{ d.express_name || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.express_no') }}</span><span class="mono">{{ d.express_no || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.shipped_at') }}</span><span class="mono">{{ formatTime(d.delivery_time) }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('order.detail.received_at') }}</span><span class="mono">{{ formatTime(d.receive_time) }}</span></div>
        </div>
      </div>
    </div>

    <div class="info-card">
      <h3>{{ t('order.orderActions') }}</h3>
      <div class="action-buttons">
        <button v-if="getActionVisibility(detail).canChangePrice" class="btn-primary" @click="showChangePriceModal = true">{{ t('order.change_price') }}</button>
        <button v-if="getActionVisibility(detail).canFreeShipping" class="btn-primary" @click="showFreeShippingModal = true">{{ t('order.free_shipping') }}</button>
        <button v-if="getActionVisibility(detail).canShip" class="btn-primary" @click="showShipModal = true">{{ t('order.ship') }}</button>
        <button v-if="getActionVisibility(detail).canAudit" class="btn-primary" @click="showAuditModal = true">{{ t('order.audit') }}</button>
        <button v-if="getActionVisibility(detail).canRefund" class="btn-danger" @click="showRefundModal = true">{{ t('order.refund') }}</button>
        <button v-if="getActionVisibility(detail).canNote" class="btn-ghost" @click="showNoteModal = true">{{ t('order.note') }}</button>
        <button v-if="getActionVisibility(detail).canPrint" class="btn-ghost" @click="handlePrint">{{ t('order.print') }}</button>
      </div>
    </div>

    <a-modal v-model:visible="showChangePriceModal" :title="t('order.change_price')" @ok="handleChangePrice" :ok-loading="changePriceLoading">
      <a-form :model="changePriceForm" layout="vertical">
        <a-form-item :label="t('order.change_price_label')">
          <a-input-number v-model="changePriceForm.amount" :placeholder="t('order.change_price_placeholder')" />
        </a-form-item>
        <a-form-item :label="t('order.change_price_reason')">
          <a-input v-model="changePriceForm.reason" :placeholder="t('order.reason_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showFreeShippingModal" :title="t('order.free_shipping')" @ok="handleFreeShipping" :ok-loading="freeShippingLoading">
      <a-form :model="freeShippingForm" layout="vertical">
        <p class="modal-hint">{{ t('order.free_shipping_confirm') }}</p>
        <a-form-item :label="t('order.reason_label')">
          <a-input v-model="freeShippingForm.reason" :placeholder="t('order.reason_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showShipModal" :title="t('order.ship')" @ok="handleShipOrder" :ok-loading="shipLoading">
      <a-form :model="shipForm" layout="vertical">
        <a-form-item :label="t('order.ship_express_label')">
          <a-select v-model="shipForm.express_id" :placeholder="t('order.express_placeholder')" allow-clear>
            <a-option value="SF">{{ t('order.express_sf') }}</a-option>
            <a-option value="YTO">{{ t('order.express_yto') }}</a-option>
            <a-option value="ZTO">{{ t('order.express_zto') }}</a-option>
            <a-option value="STO">{{ t('order.express_sto') }}</a-option>
            <a-option value="YD">{{ t('order.express_yd') }}</a-option>
            <a-option value="JD">{{ t('order.express_jd') }}</a-option>
            <a-option value="EMS">{{ t('order.express_ems') }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('order.ship_express_no_label')">
          <a-input v-model="shipForm.express_no" :placeholder="t('order.ship_express_no_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showAuditModal" :title="t('order.audit')" @ok="handleAudit" :ok-loading="auditLoading">
      <a-form :model="auditForm" layout="vertical">
        <a-form-item :label="t('order.audit_result_label')">
          <a-radio-group v-model="auditForm.result">
            <a-radio :value="1">{{ t('order.audit_approve') }}</a-radio>
            <a-radio :value="2">{{ t('order.audit_reject') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="auditForm.result === 2" :label="t('order.audit_reject_reason')" required>
          <a-textarea v-model="auditForm.reject_reason" :placeholder="t('order.reason_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showRefundModal" :title="t('order.refund')" @ok="handleRefund" :ok-loading="refundLoading">
      <a-form :model="refundForm" layout="vertical">
        <a-form-item :label="t('order.refund_max_amount')">
          <span class="mono amount-positive">¥{{ Number(detail.pay_price || 0).toFixed(2) }}</span>
        </a-form-item>
        <a-form-item :label="t('order.refund_amount_label')">
          <a-input-number v-model="refundForm.amount" :min="0.01" :max="Number(detail.pay_price || 0)" :precision="2" />
        </a-form-item>
        <a-form-item :label="t('order.refund_reason_label')">
          <a-input v-model="refundForm.reason" :placeholder="t('order.reason_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showNoteModal" :title="t('order.note')" @ok="handleAddNote" :ok-loading="noteLoading">
      <a-form :model="noteForm" layout="vertical">
        <a-form-item :label="t('order.note_content_label')">
          <a-textarea v-model="noteForm.content" :placeholder="t('order.reason_placeholder')" :auto-size="{ minRows: 3 }" />
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model="noteForm.append">{{ t('order.note_append') }}</a-checkbox>
        </a-form-item>
      </a-form>
    </a-modal>

    <div class="info-card" v-if="detail.items && detail.items.length">
      <h3>{{ t('order.detail.product_list') }}</h3>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('order.detail.product') }}</th>
              <th>{{ t('order.detail.spec') }}</th>
              <th>{{ t('order.detail.unit_price') }}</th>
              <th>{{ t('order.detail.quantity') }}</th>
              <th>{{ t('order.detail.subtotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in detail.items" :key="item.id">
              <td>
                <div class="item-cell">
                  <div class="item-thumb"><img v-if="item.cover || item.image" :src="item.cover || item.image" :alt="t('order.detail.product_image')" /><span v-else class="no-img">—</span></div>
                  <span>{{ item.name || item.title || '-' }}</span>
                </div>
              </td>
              <td>{{ item.sku_name || item.spec_name || '-' }}</td>
              <td class="mono">¥{{ Number(item.price || 0).toFixed(2) }}</td>
              <td class="mono">{{ item.quantity || 1 }}</td>
              <td class="mono">¥{{ Number((item.price || 0) * (item.quantity || 1)).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="info-card">
      <h3>{{ t('order.detail.operation_log') }}</h3>
      <div class="table-scroll" v-if="detail.logs && detail.logs.length">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('order.detail.time') }}</th>
              <th>{{ t('order.detail.operator') }}</th>
              <th>{{ t('order.detail.action') }}</th>
              <th>{{ t('order.detail.remark') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in detail.logs" :key="log.log_id || log.id">
              <td class="mono">{{ formatTime(log.created_at) }}</td>
              <td>{{ log.operator_name || '-' }}</td>
              <td><span class="badge-info">{{ log.change_field || '-' }}</span></td>
              <td>{{ log.change_reason || log.new_value || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state" style="padding: 24px; text-align: center; color: var(--color-on-surface-variant);">暂无操作日志</div>
    </div>
  </div>
</template>

<script setup>
import { Message, Modal } from '@arco-design/web-vue'
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getOrderDetail, updateOrderStatus, changeOrderPrice, freeShipping, shipOrder, auditOrder, refundOrder, addOrderNote } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TEXT, ORDER_STATUS_CLASS, PAY_STATUS, PAY_STATUS_TEXT, DELIVERY_STATUS, DELIVERY_STATUS_TEXT, AUDIT_STATUS, ORDER_FLOW_STATUS, ORDER_FLOW_STATUS_TEXT, BACKEND_ORDER_STATUS, BACKEND_DELIVERY_STATUS } from '@/config/constants'
import { mapOrderFlowStatus, getActionVisibility, getFlowStatusText } from '@/utils/orderStatus'
import '@/assets/css/print-order.css'

const route = useRoute()
const { t } = useI18n()
const detail = ref({})

const showChangePriceModal = ref(false)
const showFreeShippingModal = ref(false)
const showShipModal = ref(false)
const showAuditModal = ref(false)
const showRefundModal = ref(false)
const showNoteModal = ref(false)

const changePriceLoading = ref(false)
const freeShippingLoading = ref(false)
const shipLoading = ref(false)
const auditLoading = ref(false)
const refundLoading = ref(false)
const noteLoading = ref(false)

const changePriceForm = reactive({ amount: 0, reason: '' })
const freeShippingForm = reactive({ reason: '' })
const shipForm = reactive({ express_id: '', express_no: '' })
const auditForm = reactive({ result: 1, reject_reason: '' })
const refundForm = reactive({ amount: 0, reason: '' })
const noteForm = reactive({ content: '', append: false })

const orderSteps = computed(() => {
  const fs = mapOrderFlowStatus(detail.value)
  return [
    { label: t('order.detail.step_pending'), done: fs >= ORDER_FLOW_STATUS.PENDING, active: fs === ORDER_FLOW_STATUS.PENDING },
    { label: t('order.detail.step_confirmed'), done: fs >= ORDER_FLOW_STATUS.CONFIRMED, active: fs === ORDER_FLOW_STATUS.CONFIRMED },
    { label: t('order.detail.step_shipped'), done: fs >= ORDER_FLOW_STATUS.SHIPPED, active: fs === ORDER_FLOW_STATUS.SHIPPED },
    { label: t('order.detail.step_completed'), done: fs >= ORDER_FLOW_STATUS.COMPLETED, active: fs === ORDER_FLOW_STATUS.COMPLETED },
  ]
})

const getStatusBadgeClass = (s) => {
  if (typeof s === 'object' && s !== null) {
    const fs = mapOrderFlowStatus(s)
    if (fs === ORDER_FLOW_STATUS.CANCELLED) return 'badge-error'
    if (fs === ORDER_FLOW_STATUS.COMPLETED) return 'badge-success'
    return 'badge-info'
  }
  const cls = ORDER_STATUS_CLASS[s]
  if (cls === 'cancelled') return 'badge-error'
  if (cls === 'completed') return 'badge-success'
  return 'badge-info'
}

const formatTime = (val) => {
  if (!val) return '-'
  const d = new Date(typeof val === 'number' ? val * 1000 : val)
  return d.toLocaleString('zh-CN')
}

const loadDetail = async () => {
  const id = route.params.id || route.query.id
  if (!id) return
  try {
    const res = await getOrderDetail(id)
    detail.value = res.data || {}
  } catch (error) {
    Message.error(t('order.detail_load_failed'))
  }
}

const handlePrint = () => {
  window.print()
}

const handleConfirm = () => {
  Modal.warning({
    title: t('order.confirmOrder'),
    content: t('order.confirm_order_content'),
    hideCancel: false,
    onOk: async () => {
      try {
        await updateOrderStatus(detail.value.id, { payment_status: PAY_STATUS.PAID })
        Message.success(t('order.orderConfirmed'))
        loadDetail()
      } catch (error) { Message.error(t('order.operationFailed')) }
    }
  })
}

const handleShip = () => {
  showShipModal.value = true
}

const handleCancel = () => {
  Modal.warning({
    title: t('order.cancelOrder'),
    content: t('order.cancel_order_content'),
    hideCancel: false,
    onOk: async () => {
      try {
        await updateOrderStatus(detail.value.id, { status: BACKEND_ORDER_STATUS.CANCEL })
        Message.success(t('order.orderCancelled'))
        loadDetail()
      } catch (error) { Message.error(t('order.operation_failed')) }
    }
  })
}

const handleChangePrice = async () => {
  changePriceLoading.value = true
  try {
    await changeOrderPrice(detail.value.id, changePriceForm)
    Message.success(t('order.operation_success'))
    showChangePriceModal.value = false
    changePriceForm.amount = 0
    changePriceForm.reason = ''
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { changePriceLoading.value = false }
}

const handleFreeShipping = async () => {
  freeShippingLoading.value = true
  try {
    await freeShipping(detail.value.id, freeShippingForm)
    Message.success(t('order.operation_success'))
    showFreeShippingModal.value = false
    freeShippingForm.reason = ''
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { freeShippingLoading.value = false }
}

const handleShipOrder = async () => {
  if (!shipForm.express_id) {
    Message.warning(t('order.ship_express_required'))
    return
  }
  if (!shipForm.express_no || !shipForm.express_no.trim()) {
    Message.warning(t('order.ship_express_no_required'))
    return
  }
  shipLoading.value = true
  try {
    await shipOrder(detail.value.id, shipForm)
    Message.success(t('order.operation_success'))
    showShipModal.value = false
    shipForm.express_id = ''
    shipForm.express_no = ''
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { shipLoading.value = false }
}

const handleAudit = async () => {
  if (auditForm.result === 2 && !auditForm.reject_reason) {
    Message.warning(t('order.audit_reject_reason'))
    return
  }
  auditLoading.value = true
  try {
    await auditOrder(detail.value.id, auditForm)
    Message.success(auditForm.result === 1 ? t('order.audit_approved') : t('order.audit_rejected'))
    showAuditModal.value = false
    auditForm.result = 1
    auditForm.reject_reason = ''
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { auditLoading.value = false }
}

const handleRefund = async () => {
  refundLoading.value = true
  try {
    await refundOrder(detail.value.id, refundForm)
    Message.success(t('order.operation_success'))
    showRefundModal.value = false
    refundForm.amount = 0
    refundForm.reason = ''
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { refundLoading.value = false }
}

const handleAddNote = async () => {
  noteLoading.value = true
  try {
    await addOrderNote(detail.value.id, noteForm)
    Message.success(t('order.operation_success'))
    showNoteModal.value = false
    noteForm.content = ''
    noteForm.append = false
    loadDetail()
  } catch (error) { Message.error(t('order.operation_failed')) } finally { noteLoading.value = false }
}

onMounted(loadDetail)
</script>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.header-actions {
  flex-wrap: wrap;
}


.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-hint {
  margin-bottom: 12px;
  color: var(--color-on-surface-variant);
}

.item-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-thumb {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img {
  color: var(--color-on-surface-variant);
  font-size: 12px;
}




.detail-grid {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: var(--breakpoint-md)) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
