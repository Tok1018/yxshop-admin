import { request } from '@/utils/request'

export function getRechargePackageList(params) {
  return request({ url: '/admin/api/recharge-packages', method: 'get', params })
}
export function getRechargePackageDetail(id) {
  return request({ url: `/admin/api/recharge-packages/${id}`, method: 'get' })
}
export function createRechargePackage(data) {
  return request({ url: '/admin/api/recharge-packages', method: 'post', data })
}
export function updateRechargePackage(id, data) {
  return request({ url: `/admin/api/recharge-packages/${id}`, method: 'put', data })
}
export function deleteRechargePackage(id) {
  return request({ url: `/admin/api/recharge-packages/${id}`, method: 'delete' })
}
export function batchDeleteRechargePackage(ids) {
  return request({ url: '/admin/api/recharge-packages/batch-delete', method: 'post', data: { ids } })
}