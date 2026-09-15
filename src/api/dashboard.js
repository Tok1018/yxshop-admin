import { request } from '@/utils/request'

export function getDashboardStatistics(params) {
  return request({ url: '/admin/api/dashboard/statistics', method: 'get', params })
}
export function getDashboardCharts(params) {
  return request({ url: '/admin/api/dashboard/charts', method: 'get', params })
}
export function getDashboardRecentOrders(params) {
  return request({ url: '/admin/api/dashboard/recent-orders', method: 'get', params })
}
export function getDashboardRecentCustomers(params) {
  return request({ url: '/admin/api/dashboard/recent-customers', method: 'get', params })
}
/**
 * @deprecated 未使用的接口
 */
export function getDashboardTopItems(params) {
  return request({ url: '/admin/api/dashboard/top-items', method: 'get', params })
}
/**
 * @deprecated 未使用的接口
 */
export function getDashboardUserGrowth(params) {
  return request({ url: '/admin/api/dashboard/user-growth', method: 'get', params })
}
/**
 * @deprecated 未使用的接口
 */
export function getDashboardTodos(params) {
  return request({ url: '/admin/api/dashboard/todos', method: 'get', params })
}
