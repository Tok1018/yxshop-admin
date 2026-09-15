import { request } from '@/utils/request'

export function getServiceList(params) {
  return request({ url: '/admin/api/services', method: 'get', params })
}

export function getServiceDetail(id) {
  return request({ url: `/admin/api/services/${id}`, method: 'get' })
}

export function createService(data) {
  return request({ url: '/admin/api/services', method: 'post', data })
}

export function updateService(id, data) {
  return request({ url: `/admin/api/services/${id}`, method: 'put', data })
}

export function deleteService(id) {
  return request({ url: `/admin/api/services/${id}`, method: 'delete' })
}

export function handleService(id, data) {
  return request({ url: `/admin/api/services/${id}/handle`, method: 'post', data })
}

export function batchHandleServices(data) {
  return request({ url: '/admin/api/services/batch-process', method: 'post', data })
}
export function exportServices(params) {
  return request({ url: '/admin/api/services/export', method: 'get', params })
}
export function getServiceStats(params) {
  return request({ url: '/admin/api/services/stats', method: 'get', params })
}
export function updateServiceStatus(id, data) {
  return request({ url: `/admin/api/services/${id}/status`, method: 'post', data })
}