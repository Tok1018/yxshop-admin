import { request } from '@/utils/request'

export function getItemSearchesList(params) {
  return request({ url: '/admin/api/item-searches', method: 'get', params })
}
export function clearItemSearches(data) {
  return request({ url: '/admin/api/item-searches/clear', method: 'post', data })
}
