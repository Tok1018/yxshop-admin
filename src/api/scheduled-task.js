import { request } from '@/utils/request'

export function getScheduledTaskList(params) {
  return request({ url: '/admin/api/scheduled-tasks', method: 'get', params })
}
export function getScheduledTaskDetail(id) {
  return request({ url: `/admin/api/scheduled-tasks/${id}`, method: 'get' })
}
export function createScheduledTask(data) {
  return request({ url: '/admin/api/scheduled-tasks', method: 'post', data })
}
export function updateScheduledTask(id, data) {
  return request({ url: `/admin/api/scheduled-tasks/${id}`, method: 'put', data })
}
export function deleteScheduledTask(id) {
  return request({ url: `/admin/api/scheduled-tasks/${id}`, method: 'delete' })
}
export function batchDeleteScheduledTask(ids) {
  return request({ url: '/admin/api/scheduled-tasks/batch-delete', method: 'post', data: { ids } })
}