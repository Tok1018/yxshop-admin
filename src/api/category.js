import { request } from '@/utils/request'

export function getCategoryList(params) {
  return request({ url: '/admin/api/categories', method: 'get', params })
}

export function getCategoryDetail(id) {
  return request({ url: `/admin/api/categories/${id}`, method: 'get' })
}

export function createCategory(data) {
  return request({ url: '/admin/api/categories', method: 'post', data })
}

export function updateCategory(id, data) {
  return request({ url: `/admin/api/categories/${id}`, method: 'put', data })
}

export function deleteCategory(id) {
  return request({ url: `/admin/api/categories/${id}`, method: 'delete' })
}

export function updateCategoryStatus(id, data) {
  return request({ url: `/admin/api/categories/${id}/status`, method: 'post', data })
}