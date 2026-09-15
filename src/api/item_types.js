import { request } from '@/utils/request'

export function getItemTypesList(params) {
  return request({ url: '/admin/api/item-types', method: 'get', params })
}
export function getItemTypesDetail(id) {
  return request({ url: `/admin/api/item-types/${id}`, method: 'get' })
}
export function createItemTypes(data) {
  return request({ url: '/admin/api/item-types', method: 'post', data })
}
export function updateItemTypes(id, data) {
  return request({ url: `/admin/api/item-types/${id}`, method: 'put', data })
}
export function deleteItemTypes(id) {
  return request({ url: `/admin/api/item-types/${id}`, method: 'delete' })
}
export function updateItemTypesStatus(id, status) {
  return request({ url: `/admin/api/item-types/${id}`, method: 'put', data: { status } })
}
