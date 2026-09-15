import { request } from '@/utils/request'

export function getDeliveryRuleList(params) {
  return request({ url: '/admin/api/delivery-rules', method: 'get', params })
}

export function getDeliveryRuleDetail(id) {
  return request({ url: `/admin/api/delivery-rules/${id}`, method: 'get' })
}

export function createDeliveryRule(data) {
  return request({ url: '/admin/api/delivery-rules', method: 'post', data })
}

export function updateDeliveryRule(id, data) {
  return request({ url: `/admin/api/delivery-rules/${id}`, method: 'put', data })
}

export function deleteDeliveryRule(id) {
  return request({ url: `/admin/api/delivery-rules/${id}`, method: 'delete' })
}