import { request } from '@/utils/request'

export function getCouponList(params) {
  return request({ url: '/admin/api/coupons', method: 'get', params })
}
export function getCouponDetail(id) {
  return request({ url: `/admin/api/coupons/${id}`, method: 'get' })
}
export function createCoupon(data) {
  return request({ url: '/admin/api/coupons', method: 'post', data })
}
export function updateCoupon(id, data) {
  return request({ url: `/admin/api/coupons/${id}`, method: 'put', data })
}
export function deleteCoupon(id) {
  return request({ url: `/admin/api/coupons/${id}`, method: 'delete' })
}
export function updateCouponStatus(id, status) {
  return request({ url: `/admin/api/coupons/${id}`, method: 'put', data: { status } })
}
