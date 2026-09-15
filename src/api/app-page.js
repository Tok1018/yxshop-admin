import { request } from '@/utils/request'

export function getAppPageList(params) {
  return request({ url: '/admin/api/app-pages', method: 'get', params })
}

export function getAppPageDetail(id) {
  return request({ url: `/admin/api/app-pages/${id}`, method: 'get' })
}

export function createAppPage(data) {
  return request({ url: '/admin/api/app-pages', method: 'post', data })
}

export function updateAppPage(id, data) {
  return request({ url: `/admin/api/app-pages/${id}`, method: 'put', data })
}

export function deleteAppPage(id) {
  return request({ url: `/admin/api/app-pages/${id}`, method: 'delete' })
}

export function updateAppPageStatus(id, data) {
  return request({ url: `/admin/api/app-pages/${id}/status`, method: 'post', data })
}

export function previewAppPage(id) {
  return request({ url: `/admin/api/app-pages/${id}/preview`, method: 'get' })
}