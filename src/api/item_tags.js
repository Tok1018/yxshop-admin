import { request } from '@/utils/request'

export function getItemTagsList(params) {
  return request({ url: '/admin/api/item-tags', method: 'get', params })
}
export function getItemTagsDetail(id) {
  return request({ url: `/admin/api/item-tags/${id}`, method: 'get' })
}
export function createItemTags(data) {
  return request({ url: '/admin/api/item-tags', method: 'post', data })
}
export function updateItemTags(id, data) {
  return request({ url: `/admin/api/item-tags/${id}`, method: 'put', data })
}
export function deleteItemTags(id) {
  return request({ url: `/admin/api/item-tags/${id}`, method: 'delete' })
}
export function updateItemTagsStatus(id, status) {
  return request({ url: `/admin/api/item-tags/${id}`, method: 'put', data: { status } })
}
