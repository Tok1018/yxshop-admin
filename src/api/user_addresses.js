import { request } from '@/utils/request'

export function getUserAddressesList(params) {
  return request({ url: '/admin/api/user-addresses', method: 'get', params })
}
export function getUserAddressesDetail(id) {
  return request({ url: `/admin/api/user-addresses/${id}`, method: 'get' })
}
export function createUserAddresses(data) {
  return request({ url: '/admin/api/user-addresses', method: 'post', data })
}
export function updateUserAddresses(id, data) {
  return request({ url: `/admin/api/user-addresses/${id}`, method: 'put', data })
}
export function deleteUserAddresses(id) {
  return request({ url: `/admin/api/user-addresses/${id}`, method: 'delete' })
}
