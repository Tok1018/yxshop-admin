import { request } from '@/utils/request'

export function getUserCouponsList(params) {
  return request({ url: '/admin/api/user-coupons', method: 'get', params })
}
export function getUserCouponsDetail(id) {
  return request({ url: `/admin/api/user-coupons/${id}`, method: 'get' })
}

