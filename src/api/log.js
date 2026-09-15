import { request } from '@/utils/request'

export function getLoginLogList(params) {
  return request({ url: '/admin/api/logs/login', method: 'get', params })
}

export function getAdminLogList(params) {
  return request({ url: '/admin/api/logs/admin', method: 'get', params })
}

export function getUserLogList(params) {
  return request({ url: '/admin/api/logs/user', method: 'get', params })
}

export function getSystemLogList(params) {
  return request({ url: '/admin/api/logs/system', method: 'get', params })
}

export function getApiLogList(params) {
  return request({ url: '/admin/api/logs/api', method: 'get', params })
}

export function deleteLog(type, id) {
  return request({ url: `/admin/api/logs/${type}/${id}`, method: 'delete' })
}

export function clearLogs(data) {
  return request({ url: '/admin/api/logs/clear', method: 'post', data })
}

export function exportLogs(params) {
  return request({ url: '/admin/api/logs/export', method: 'get', params, responseType: 'blob' })
}