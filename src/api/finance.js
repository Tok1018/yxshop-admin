import { request } from '@/utils/request'

export function getFinanceStatistics(params) {
  return request({ url: '/admin/api/finance/statistics', method: 'get', params })
}

export function getTransactionList(params) {
  return request({ url: '/admin/api/finance/transactions', method: 'get', params })
}

