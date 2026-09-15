import { request } from '@/utils/request'

export function getEmailLogsList(params) {
  return request({ url: '/admin/api/email-logs', method: 'get', params })
}
export function getEmailLogsDetail(id) {
  return request({ url: `/admin/api/email-logs/${id}`, method: 'get' })
}

