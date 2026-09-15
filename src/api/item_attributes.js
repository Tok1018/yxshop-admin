import { request } from '@/utils/request'

export function getItemAttributesList(params) {
  return request({ url: '/admin/api/item-attributes', method: 'get', params })
}
export function getEnabledItemAttributes() {
  return request({ url: '/admin/api/item-attributes', method: 'get', params: { enabled: 1 } })
}
export function getItemAttributesDetail(id) {
  return request({ url: `/admin/api/item-attributes/${id}`, method: 'get' })
}
export function createItemAttributes(data) {
  return request({ url: '/admin/api/item-attributes', method: 'post', data })
}
export function updateItemAttributes(id, data) {
  return request({ url: `/admin/api/item-attributes/${id}`, method: 'put', data })
}
export function deleteItemAttributes(id) {
  return request({ url: `/admin/api/item-attributes/${id}`, method: 'delete' })
}
