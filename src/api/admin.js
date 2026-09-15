import { request } from '@/utils/request'

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

export function updateAdminStatus(id, data) {
  return request({ url: `/admin/api/admins/${id}/status`, method: 'post', data })
}

export function resetAdminPassword(id, data) {
  return request({ url: `/admin/api/admins/${id}/reset-password`, method: 'post', data })
}

export function unlockAdmin(id) {
  return request({ url: `/admin/api/admins/${id}/unlock`, method: 'post' })
}
