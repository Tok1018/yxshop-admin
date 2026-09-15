import { request } from '@/utils/request'

export function getUserLogsList(params) {
  return request({ url: '/admin/api/user-logs', method: 'get', params })
}
export function getUserLogsDetail(id) {
  return request({ url: `/admin/api/user-logs/${id}`, method: 'get' })
}

