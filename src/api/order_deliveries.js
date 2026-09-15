import { request } from '@/utils/request'

export function getOrderDeliveriesList(params) {
  return request({ url: '/admin/api/order-deliveries', method: 'get', params })
}
export function getOrderDeliveriesDetail(id) {
  return request({ url: `/admin/api/order-deliveries/${id}`, method: 'get' })
}
export function updateOrderDeliveryStatus(id, data) {
  return request({ url: `/admin/api/order-deliveries/${id}`, method: 'put', data })
}
