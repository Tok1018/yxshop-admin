import { request } from '@/utils/request'

export function getPageSeoList(params) {
  return request({ url: '/admin/api/page-seos', method: 'get', params })
}
export function getPageSeoDetail(id) {
  return request({ url: `/admin/api/page-seos/${id}`, method: 'get' })
}
export function createPageSeo(data) {
  return request({ url: '/admin/api/page-seos', method: 'post', data })
}
export function updatePageSeo(id, data) {
  return request({ url: `/admin/api/page-seos/${id}`, method: 'put', data })
}
export function deletePageSeo(id) {
  return request({ url: `/admin/api/page-seos/${id}`, method: 'delete' })
}
export function batchDeletePageSeo(ids) {
  return request({ url: '/admin/api/page-seos/batch-delete', method: 'post', data: { ids } })
}