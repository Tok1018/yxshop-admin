import { request } from '@/utils/request'

export function getNotificationTemplateList(params) {
  return request({ url: '/admin/api/notification-templates', method: 'get', params })
}

export function getNotificationTemplateDetail(id) {
  return request({ url: `/admin/api/notification-templates/${id}`, method: 'get' })
}

export function createNotificationTemplate(data) {
  return request({ url: '/admin/api/notification-templates', method: 'post', data })
}

export function updateNotificationTemplate(id, data) {
  return request({ url: `/admin/api/notification-templates/${id}`, method: 'put', data })
}

export function deleteNotificationTemplate(id) {
  return request({ url: `/admin/api/notification-templates/${id}`, method: 'delete' })
}

export function updateNotificationTemplateStatus(id, data) {
  return request({ url: `/admin/api/notification-templates/${id}/status`, method: 'post', data })
}

export function previewNotificationTemplate(id) {
  return request({ url: `/admin/api/notification-templates/${id}/preview`, method: 'get' })
}

export function testSendNotificationTemplate(id, data) {
  return request({ url: `/admin/api/notification-templates/${id}/test`, method: 'post', data })
}
