import { request } from '@/utils/request'

export function getUserMoneyLogsList(params) {
  return request({ url: '/admin/api/user-money-logs', method: 'get', params })
}
export function getUserMoneyLogsDetail(id) {
  return request({ url: `/admin/api/user-money-logs/${id}`, method: 'get' })
}

