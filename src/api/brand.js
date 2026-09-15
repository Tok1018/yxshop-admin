import { request } from '@/utils/request'

export function getBrandList(params) {
  return request({ url: '/admin/api/brands', method: 'get', params })
}

export function getBrandDetail(id) {
  return request({ url: `/admin/api/brands/${id}`, method: 'get' })
}

export function createBrand(data) {
  return request({ url: '/admin/api/brands', method: 'post', data })
}

export function updateBrand(id, data) {
  return request({ url: `/admin/api/brands/${id}`, method: 'put', data })
}

export function deleteBrand(id) {
  return request({ url: `/admin/api/brands/${id}`, method: 'delete' })
}

export function updateBrandStatus(id, data) {
  return request({ url: `/admin/api/brands/${id}/status`, method: 'post', data })
}

export function batchBrandStatus(data) {
  return request({ url: '/admin/api/brands/batch-status', method: 'post', data })
}

export function batchBrandDelete(data) {
  return request({ url: '/admin/api/brands/batch-delete', method: 'post', data })
}