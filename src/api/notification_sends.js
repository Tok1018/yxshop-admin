import { request } from '@/utils/request'

export function getNotificationSendsList(params) {
  return request({ url: '/admin/api/notification-sends', method: 'get', params })
}
export function getNotificationSendsDetail(id) {
  return request({ url: `/admin/api/notification-sends/${id}`, method: 'get' })
}

