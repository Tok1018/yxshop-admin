import { request } from '@/utils/request'

export function getItemList(params) {
  return request({ url: '/admin/api/items', method: 'get', params })
}

export function getItemDetail(id) {
  return request({ url: `/admin/api/items/${id}`, method: 'get' })
}

export function createItem(data) {
  return request({ url: '/admin/api/items', method: 'post', data })
}

export function updateItem(id, data) {
  return request({ url: `/admin/api/items/${id}`, method: 'put', data })
}

export function deleteItem(id) {
  return request({ url: `/admin/api/items/${id}`, method: 'delete' })
}

export function updateItemStatus(id, data) {
  return request({ url: `/admin/api/items/${id}/status`, method: 'post', data })
}

export function batchItemStatus(data) {
  return request({ url: '/admin/api/items/batch-status', method: 'post', data })
}

export function batchItemDelete(data) {
  return request({ url: '/admin/api/items/batch-delete', method: 'post', data })
}

export function getItemSkus(itemId) {
  return request({ url: `/admin/api/items/${itemId}/skus`, method: 'get' })
}

export function getItemSummary(params) {
  return request({ url: '/admin/api/items/summary', method: 'get', params })
}

export function batchPrice(data) {
  return request({ url: '/admin/api/items/batch-price', method: 'post', data })
}

export function stockAdjust(id, data) {
  return request({ url: `/admin/api/items/${id}/stock-adjust`, method: 'post', data })
}

export function batchStockAdjust(data) {
  return request({ url: '/admin/api/items/batch-stock-adjust', method: 'post', data })
}

export function duplicateItem(id) {
  return request({ url: `/admin/api/items/${id}/duplicate`, method: 'post' })
}

export function getPriceHistory(id) {
  return request({ url: `/admin/api/items/${id}/price-history`, method: 'get' })
}

export function exportItems(params) {
  return request({ url: '/admin/api/items/export', method: 'get', params, responseType: 'blob' })
}

export function getCategoryList(params) {
  return request({ url: '/admin/api/items/categories', method: 'get', params })
}

export function getBrandList(params) {
  return request({ url: '/admin/api/items/brands', method: 'get', params })
}
