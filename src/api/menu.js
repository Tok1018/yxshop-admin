import { request } from '@/utils/request'

export function getMenuList(params) {
  return request({ url: '/admin/api/menus', method: 'get', params })
}

export function getMenuTree(params) {
  return request({ url: '/admin/api/menus/tree', method: 'get', params })
}

export function createMenu(data) {
  return request({ url: '/admin/api/menus', method: 'post', data })
}

export function updateMenu(id, data) {
  return request({ url: `/admin/api/menus/${id}`, method: 'put', data })
}

export function deleteMenu(id) {
  return request({ url: `/admin/api/menus/${id}`, method: 'delete' })
}

export function sortMenu(data) {
  return request({ url: '/admin/api/menus/sort', method: 'post', data })
}