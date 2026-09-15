import { request } from '@/utils/request'

export function getAppList(params) {
  return request({ url: '/admin/api/apps', method: 'get', params })
}

export function getAppDetail(id) {
  return request({ url: `/admin/api/apps/${id}`, method: 'get' })
}

export function createApp(data) {
  return request({ url: '/admin/api/apps', method: 'post', data })
}

export function updateApp(id, data) {
  return request({ url: `/admin/api/apps/${id}`, method: 'put', data })
}

export function deleteApp(id) {
  return request({ url: `/admin/api/apps/${id}`, method: 'delete' })
}

export function updateAppStatus(id, data) {
  return request({ url: `/admin/api/apps/${id}/status`, method: 'post', data })
}

export function resetAppKey(id) {
  return request({ url: `/admin/api/apps/${id}/reset-key`, method: 'post' })
}