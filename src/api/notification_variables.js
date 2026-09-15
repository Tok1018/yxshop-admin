import { request } from '@/utils/request'

export function getNotificationVariablesList(params) {
  return request({ url: '/admin/api/notification-variables', method: 'get', params })
}
export function getNotificationVariablesDetail(id) {
  return request({ url: `/admin/api/notification-variables/${id}`, method: 'get' })
}
export function createNotificationVariables(data) {
  return request({ url: '/admin/api/notification-variables', method: 'post', data })
}
export function updateNotificationVariables(id, data) {
  return request({ url: `/admin/api/notification-variables/${id}`, method: 'put', data })
}
export function deleteNotificationVariables(id) {
  return request({ url: `/admin/api/notification-variables/${id}`, method: 'delete' })
}
