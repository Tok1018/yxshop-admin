import { request } from '@/utils/request'

export function getItemFavoritesList(params) {
  return request({ url: '/admin/api/item-favorites', method: 'get', params })
}
export function getItemFavoritesDetail(id) {
  return request({ url: `/admin/api/item-favorites/${id}`, method: 'get' })
}

