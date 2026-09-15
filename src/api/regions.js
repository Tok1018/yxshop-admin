import { request } from '@/utils/request'

export function getRegionsList(params) {
  return request({ url: '/admin/api/regions', method: 'get', params })
}

export function getRegionsTree(params) {
  return request({ url: '/admin/api/regions/tree', method: 'get', params })
}

export function getRegionDetail(id) {
  return request({ url: `/admin/api/regions/${id}`, method: 'get' })
}

export function createRegion(data) {
  return request({ url: '/admin/api/regions', method: 'post', data })
}

export function updateRegion(id, data) {
  return request({ url: `/admin/api/regions/${id}`, method: 'put', data })
}

export function deleteRegion(id) {
  return request({ url: `/admin/api/regions/${id}`, method: 'delete' })
}
