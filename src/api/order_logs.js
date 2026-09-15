import { request } from '@/utils/request'

export function getOrderLogsList(params) {
  return request({ url: '/admin/api/order-logs', method: 'get', params })
}
export function getOrderLogsDetail(id) {
  return request({ url: `/admin/api/order-logs/${id}`, method: 'get' })
}

