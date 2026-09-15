import { request } from '@/utils/request'

export function getRoleList(params) {
  return request({ url: '/admin/api/roles', method: 'get', params })
}

export function getRoleDetail(id) {
  return request({ url: `/admin/api/roles/${id}`, method: 'get' })
}

export function createRole(data) {
  return request({ url: '/admin/api/roles', method: 'post', data })
}

export function updateRole(id, data) {
  return request({ url: `/admin/api/roles/${id}`, method: 'put', data })
}

export function deleteRole(id) {
  return request({ url: `/admin/api/roles/${id}`, method: 'delete' })
}

export function getRolePermissions(id) {
  return request({ url: `/admin/api/roles/${id}/permissions`, method: 'get' })
}

export function assignRolePermissions(id, data) {
  return request({ url: `/admin/api/roles/${id}/permissions`, method: 'post', data })
}
