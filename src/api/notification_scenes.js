import { request } from '@/utils/request'

export function getNotificationScenesList(params) {
  return request({ url: '/admin/api/notification-scenes', method: 'get', params })
}
export function getNotificationScenesDetail(id) {
  return request({ url: `/admin/api/notification-scenes/${id}`, method: 'get' })
}
export function createNotificationScenes(data) {
  return request({ url: '/admin/api/notification-scenes', method: 'post', data })
}
export function updateNotificationScenes(id, data) {
  return request({ url: `/admin/api/notification-scenes/${id}`, method: 'put', data })
}
export function deleteNotificationScenes(id) {
  return request({ url: `/admin/api/notification-scenes/${id}`, method: 'delete' })
}
