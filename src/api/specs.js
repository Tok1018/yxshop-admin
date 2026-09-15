import { request } from '@/utils/request'

export function getSpecsList(params) {
  return request({ url: '/admin/api/specs', method: 'get', params })
}
export function getEnabledSpecs() {
  return request({ url: '/admin/api/specs', method: 'get', params: { enabled: 1 } })
}
export function getSpecsDetail(id) {
  return request({ url: `/admin/api/specs/${id}`, method: 'get' })
}
export function createSpecs(data) {
  return request({ url: '/admin/api/specs', method: 'post', data })
}
export function updateSpecs(id, data) {
  return request({ url: `/admin/api/specs/${id}`, method: 'put', data })
}
export function deleteSpecs(id) {
  return request({ url: `/admin/api/specs/${id}`, method: 'delete' })
}
export function updateSpecsStatus(id, data) {
  return request({ url: `/admin/api/specs/${id}/status`, method: 'post', data })
}
