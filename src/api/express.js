import { request } from '@/utils/request'

export function getExpressList(params) {
  return request({ url: '/admin/api/expresses', method: 'get', params })
}

export function getExpressDetail(id) {
  return request({ url: `/admin/api/expresses/${id}`, method: 'get' })
}

export function createExpress(data) {
  return request({ url: '/admin/api/expresses', method: 'post', data })
}

export function updateExpress(id, data) {
  return request({ url: `/admin/api/expresses/${id}`, method: 'put', data })
}

export function deleteExpress(id) {
  return request({ url: `/admin/api/expresses/${id}`, method: 'delete' })
}

export function updateExpressStatus(id, data) {
  return request({ url: `/admin/api/expresses/${id}/status`, method: 'post', data })
}