import { request } from '@/utils/request'

export function getPromotionList(params) {
  return request({ url: '/admin/api/promotions', method: 'get', params })
}
export function getPromotionDetail(id) {
  return request({ url: `/admin/api/promotions/${id}`, method: 'get' })
}
export function createPromotion(data) {
  return request({ url: '/admin/api/promotions', method: 'post', data })
}
export function updatePromotion(id, data) {
  return request({ url: `/admin/api/promotions/${id}`, method: 'put', data })
}
export function deletePromotion(id) {
  return request({ url: `/admin/api/promotions/${id}`, method: 'delete' })
}
export function sendPromotionNotification(id, data) {
  return request({ url: `/admin/api/promotions/${id}/notify`, method: 'post', data })
}
