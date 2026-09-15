import { request } from '@/utils/request'

export function getNotificationConfigsList(params) {
  return request({ url: '/admin/api/notification-configs', method: 'get', params })
}
export function updateNotificationConfigs(id, data) {
  return request({ url: `/admin/api/notification-configs/${id}`, method: 'put', data })
}
