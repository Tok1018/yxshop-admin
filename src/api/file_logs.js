import { request } from '@/utils/request'

export function getFileLogsList(params) {
  return request({ url: '/admin/api/file-logs', method: 'get', params })
}
export function getFileLogsDetail(id) {
  return request({ url: `/admin/api/file-logs/${id}`, method: 'get' })
}

