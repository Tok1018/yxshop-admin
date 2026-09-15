import { request } from '@/utils/request'

export function getPaymentList(params) {
  return request({ url: '/admin/api/payments', method: 'get', params })
}

export function getPaymentDetail(id) {
  return request({ url: `/admin/api/payments/${id}`, method: 'get' })
}

export function refundPayment(id, data) {
  return request({ url: `/admin/api/payments/${id}/refund`, method: 'post', data })
}

export function updatePaymentStatus(id, data) {
  return request({ url: `/admin/api/payments/${id}/status`, method: 'post', data })
}

export function exportPayment(params) {
  return request({ url: '/admin/api/payments/export', method: 'get', params, responseType: 'blob' })
}