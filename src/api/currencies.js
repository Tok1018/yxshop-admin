import { request } from '@/utils/request'

export function getCurrenciesList(params) {
  return request({ url: '/admin/api/currencies', method: 'get', params })
}
export function getCurrenciesDetail(id) {
  return request({ url: `/admin/api/currencies/${id}`, method: 'get' })
}
export function createCurrencies(data) {
  return request({ url: '/admin/api/currencies', method: 'post', data })
}
export function updateCurrencies(id, data) {
  return request({ url: `/admin/api/currencies/${id}`, method: 'put', data })
}
export function deleteCurrencies(id) {
  return request({ url: `/admin/api/currencies/${id}`, method: 'delete' })
}
