import { request } from '@/utils/request'

export function getPromOrdersList(params) {
  return request({ url: '/admin/api/prom-orders', method: 'get', params })
}
export function getPromOrdersDetail(id) {
  return request({ url: `/admin/api/prom-orders/${id}`, method: 'get' })
}
export function createPromOrders(data) {
  return request({ url: '/admin/api/prom-orders', method: 'post', data })
}
export function updatePromOrders(id, data) {
  return request({ url: `/admin/api/prom-orders/${id}`, method: 'put', data })
}
export function deletePromOrders(id) {
  return request({ url: `/admin/api/prom-orders/${id}`, method: 'delete' })
}
