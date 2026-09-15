import { request } from '@/utils/request'

export function getPromItemList(params) {
  return request({ url: '/admin/api/prom-items', method: 'get', params })
}
export function getPromItemDetail(id) {
  return request({ url: `/admin/api/prom-items/${id}`, method: 'get' })
}
export function createPromItem(data) {
  return request({ url: '/admin/api/prom-items', method: 'post', data })
}
export function updatePromItem(id, data) {
  return request({ url: `/admin/api/prom-items/${id}`, method: 'put', data })
}
export function deletePromItem(id) {
  return request({ url: `/admin/api/prom-items/${id}`, method: 'delete' })
}
export function batchDeletePromItems(ids) {
  return request({ url: '/admin/api/prom-items/batch-delete', method: 'post', data: { ids } })
}
export function getPromotionList(params) {
  return request({ url: '/admin/api/promotions', method: 'get', params })
}
export function getItemListForSelect(params) {
  return request({ url: '/admin/api/items/select', method: 'get', params })
}
