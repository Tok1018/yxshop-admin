import { request } from '@/utils/request'

export function getFriendlyLinkList(params) {
  return request({ url: '/admin/api/friendly-links', method: 'get', params })
}
export function getFriendlyLinkDetail(id) {
  return request({ url: `/admin/api/friendly-links/${id}`, method: 'get' })
}
export function createFriendlyLink(data) {
  return request({ url: '/admin/api/friendly-links', method: 'post', data })
}
export function updateFriendlyLink(id, data) {
  return request({ url: `/admin/api/friendly-links/${id}`, method: 'put', data })
}
export function deleteFriendlyLink(id) {
  return request({ url: `/admin/api/friendly-links/${id}`, method: 'delete' })
}
export function batchDeleteFriendlyLink(ids) {
  return request({ url: '/admin/api/friendly-links/batch-delete', method: 'post', data: { ids } })
}