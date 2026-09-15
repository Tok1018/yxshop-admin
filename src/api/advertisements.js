import { request } from '@/utils/request'

export function getAdvertisementsList(params) {
  return request({ url: '/admin/api/advertisements', method: 'get', params })
}
export function getAdvertisementsDetail(id) {
  return request({ url: `/admin/api/advertisements/${id}`, method: 'get' })
}
export function createAdvertisements(data) {
  return request({ url: '/admin/api/advertisements', method: 'post', data })
}
export function updateAdvertisements(id, data) {
  return request({ url: `/admin/api/advertisements/${id}`, method: 'put', data })
}
export function deleteAdvertisements(id) {
  return request({ url: `/admin/api/advertisements/${id}`, method: 'delete' })
}
export function updateAdvertisementsStatus(id, status) {
  return request({ url: `/admin/api/advertisements/${id}`, method: 'put', data: { status } })
}
