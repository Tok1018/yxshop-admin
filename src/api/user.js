import { request } from '@/utils/request'

export function getUserList(params) {
  return request({ url: '/admin/api/users', method: 'get', params })
}

export function getUserDetail(id) {
  return request({ url: `/admin/api/users/${id}`, method: 'get' })
}

export function getUserAddresses(id, params) {
  return request({ url: `/admin/api/users/${id}/addresses`, method: 'get', params })
}

export function getUserReports(params) {
  return request({ url: '/admin/api/users/dashboard', method: 'get', params })
}
