import {
  BACKEND_ORDER_STATUS,
  BACKEND_DELIVERY_STATUS,
  BACKEND_RECEIPT_STATUS,
  BACKEND_REFUND_STATUS,
  ORDER_FLOW_STATUS,
  ORDER_FLOW_STATUS_TEXT,
  ORDER_FLOW_STATUS_CLASS,
  PAY_STATUS,
} from '@/config/constants'

export function mapOrderFlowStatus(order) {
  if (!order) return ORDER_FLOW_STATUS.UNKNOWN
  const s = Number(order.status)
  const ps = Number(order.pay_status)
  const ds = Number(order.delivery_status)

  if (s === BACKEND_ORDER_STATUS.CANCEL) return ORDER_FLOW_STATUS.CANCELLED
  if (s === BACKEND_ORDER_STATUS.COMPLETE) return ORDER_FLOW_STATUS.COMPLETED
  if (s === BACKEND_ORDER_STATUS.PENDING) {
    if (ds === BACKEND_DELIVERY_STATUS.SHIPPED) return ORDER_FLOW_STATUS.SHIPPED
    if (ps === PAY_STATUS.PAID && ds === BACKEND_DELIVERY_STATUS.UNSHIPPED) return ORDER_FLOW_STATUS.CONFIRMED
    if (ps === PAY_STATUS.UNPAID && ds === BACKEND_DELIVERY_STATUS.UNSHIPPED) return ORDER_FLOW_STATUS.PENDING
  }
  return ORDER_FLOW_STATUS.UNKNOWN
}

export function mapFilterToParams(flowStatus) {
  if (flowStatus === '' || flowStatus === null || flowStatus === undefined) return {}
  const fs = Number(flowStatus)
  if (fs === ORDER_FLOW_STATUS.PENDING) return { status: 10, pay_status: 10, delivery_status: 10 }
  if (fs === ORDER_FLOW_STATUS.CONFIRMED) return { status: 10, pay_status: 20, delivery_status: 10 }
  if (fs === ORDER_FLOW_STATUS.SHIPPED) return { status: 10, delivery_status: 20 }
  if (fs === ORDER_FLOW_STATUS.COMPLETED) return { status: 30 }
  if (fs === ORDER_FLOW_STATUS.CANCELLED) return { status: 20 }
  return {}
}

export function getActionVisibility(order) {
  if (!order) return {}
  const s = Number(order.status)
  const ps = Number(order.pay_status)
  const ds = Number(order.delivery_status)

  return {
    canConfirm: s === BACKEND_ORDER_STATUS.PENDING && ps === PAY_STATUS.UNPAID,
    canShip: ps === PAY_STATUS.PAID && ds === BACKEND_DELIVERY_STATUS.UNSHIPPED,
    canChangePrice: ps === PAY_STATUS.UNPAID,
    canFreeShipping: ds === BACKEND_DELIVERY_STATUS.UNSHIPPED,
    canRefund: ps === PAY_STATUS.PAID,
    canAudit: s === BACKEND_ORDER_STATUS.PENDING,
    canNote: true,
    canPrint: true,
    canCancel: s === BACKEND_ORDER_STATUS.PENDING && ps === PAY_STATUS.UNPAID,
  }
}

export function getFlowStatusText(flowStatus) {
  return ORDER_FLOW_STATUS_TEXT[flowStatus] || '未知状态'
}

export function getFlowStatusClass(flowStatus) {
  return ORDER_FLOW_STATUS_CLASS[flowStatus] || 'unknown'
}