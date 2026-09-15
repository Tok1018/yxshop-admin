import { request } from '@/utils/request'

export function getOrderList(params) {
  return request({ url: '/admin/api/orders', method: 'get', params })
}

export function getOrderDetail(id) {
  return request({ url: `/admin/api/orders/${id}`, method: 'get' })
}

export function updateOrderStatus(id, data) {
  return request({ url: `/admin/api/orders/${id}/status`, method: 'post', data })
}

export function deleteOrder(id) {
  return request({ url: `/admin/api/orders/${id}`, method: 'delete' })
}

export function getOrderTracking(params) {
  return request({ url: '/admin/api/orders/tracking', method: 'get', params })
}

export function changeOrderPrice(id, data) {
  return request({ url: `/admin/api/orders/${id}/change-price`, method: 'post', data })
}

export function freeShipping(id, data) {
  return request({ url: `/admin/api/orders/${id}/free-shipping`, method: 'post', data })
}

export function shipOrder(id, data) {
  return request({ url: `/admin/api/orders/${id}/ship`, method: 'post', data })
}

export function auditOrder(id, data) {
  return request({ url: `/admin/api/orders/${id}/audit`, method: 'post', data })
}

export function refundOrder(id, data) {
  return request({ url: `/admin/api/orders/${id}/refund`, method: 'post', data })
}

export function addOrderNote(id, data) {
  return request({ url: `/admin/api/orders/${id}/note`, method: 'post', data })
}

export function getOrderStatistics() {
  return request({ url: '/admin/api/orders/statistics', method: 'get' })
}

export function getOrderTrackingById(id) {
  return request({ url: `/admin/api/orders/${id}/tracking`, method: 'get' })
}

export function getCustomerProfile(id) {
  return request({ url: `/admin/api/orders/${id}/customer-profile`, method: 'get' })
}