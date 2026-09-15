import { request } from '@/utils/request'

export function getSalesReport(params) {
  return request({ url: '/admin/api/reports/sales', method: 'get', params })
}

export function getUserReport(params) {
  return request({ url: '/admin/api/reports/users', method: 'get', params })
}

export function getProductReport(params) {
  return request({ url: '/admin/api/reports/products', method: 'get', params })
}

