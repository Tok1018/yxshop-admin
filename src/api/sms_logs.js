import { request } from '@/utils/request'

export function getSmsLogsList(params) {
  return request({ url: '/admin/api/sms-logs', method: 'get', params })
}
export function getSmsLogsDetail(id) {
  return request({ url: `/admin/api/sms-logs/${id}`, method: 'get' })
}

