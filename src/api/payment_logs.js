import { request } from '@/utils/request'

export function getPaymentLogsList(params) {
  return request({ url: '/admin/api/payment-logs', method: 'get', params })
}
export function getPaymentLogsDetail(id) {
  return request({ url: `/admin/api/payment-logs/${id}`, method: 'get' })
}

