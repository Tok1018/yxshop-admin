import { request } from '@/utils/request'

export function getNotificationBlacklistsList(params) {
  return request({ url: '/admin/api/notification-blacklists', method: 'get', params })
}
export function createNotificationBlacklists(data) {
  return request({ url: '/admin/api/notification-blacklists', method: 'post', data })
}
export function deleteNotificationBlacklists(id) {
  return request({ url: `/admin/api/notification-blacklists/${id}`, method: 'delete' })
}
