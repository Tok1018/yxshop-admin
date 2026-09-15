import { request } from '@/utils/request'

export function getDeliveriesList(params) {
  return request({ url: '/admin/api/deliveries', method: 'get', params })
}
export function getDeliveriesDetail(id) {
  return request({ url: `/admin/api/deliveries/${id}`, method: 'get' })
}
export function createDeliveries(data) {
  return request({ url: '/admin/api/deliveries', method: 'post', data })
}
export function updateDeliveries(id, data) {
  return request({ url: `/admin/api/deliveries/${id}`, method: 'put', data })
}
export function deleteDeliveries(id) {
  return request({ url: `/admin/api/deliveries/${id}`, method: 'delete' })
}
