import { request } from '@/utils/request'

export function getPermissionTree() {
  return request({ url: '/admin/api/permissions/tree', method: 'get' })
}

export function getAdminList(params) {
  return request({ url: '/admin/api/admins', method: 'get', params })
}

export function getAdminDetail(id) {
  return request({ url: `/admin/api/admins/${id}`, method: 'get' })
}

export function createAdmin(data) {
  return request({ url: '/admin/api/admins', method: 'post', data })
}

export function updateAdmin(id, data) {
  return request({ url: `/admin/api/admins/${id}`, method: 'put', data })
}

export function deleteAdmin(id) {
  return request({ url: `/admin/api/admins/${id}`, method: 'delete' })
}

export function getRoleList(params) {
  return request({ url: '/admin/api/roles', method: 'get', params })
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

export function assignRolePermissions(id, data) {
  return request({ url: `/admin/api/roles/${id}/permissions`, method: 'post', data })
}

export function getPermissionList(params) {
  return request({ url: '/admin/api/permissions/config', method: 'get', params })
}
export function getPermissionDetail(id) {
  return request({ url: `/admin/api/permissions/config/${id}`, method: 'get' })
}
export function createPermission(data) {
  return request({ url: '/admin/api/permissions/config', method: 'post', data })
}
export function updatePermission(id, data) {
  return request({ url: `/admin/api/permissions/config/${id}`, method: 'put', data })
}
export function deletePermission(id) {
  return request({ url: `/admin/api/permissions/config/${id}`, method: 'delete' })
}
export function enablePermission(id) {
  return request({ url: `/admin/api/permissions/config/${id}/enable`, method: 'post' })
}
export function disablePermission(id) {
  return request({ url: `/admin/api/permissions/config/${id}/disable`, method: 'post' })
}
export function getPermissionConfigTree(params) {
  return request({ url: '/admin/api/permissions/config-tree', method: 'get', params })
}
export function batchDeletePermissions(ids) {
  return Promise.all(ids.map(id => deletePermission(id)))
}