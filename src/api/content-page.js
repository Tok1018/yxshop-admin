import { request } from '@/utils/request'

export function getContentPageList(params) {
  return request({ url: '/admin/api/content-pages', method: 'get', params })
}
export function getContentPageDetail(id) {
  return request({ url: `/admin/api/content-pages/${id}`, method: 'get' })
}
export function createContentPage(data) {
  return request({ url: '/admin/api/content-pages', method: 'post', data })
}
export function updateContentPage(id, data) {
  return request({ url: `/admin/api/content-pages/${id}`, method: 'put', data })
}
export function deleteContentPage(id) {
  return request({ url: `/admin/api/content-pages/${id}`, method: 'delete' })
}