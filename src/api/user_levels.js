import { request } from '@/utils/request'

export function getUserLevelsList(params) {
  return request({ url: '/admin/api/user-levels', method: 'get', params })
}
export function getUserLevelsDetail(id) {
  return request({ url: `/admin/api/user-levels/${id}`, method: 'get' })
}
export function createUserLevels(data) {
  return request({ url: '/admin/api/user-levels', method: 'post', data })
}
export function updateUserLevels(id, data) {
  return request({ url: `/admin/api/user-levels/${id}`, method: 'put', data })
}
export function deleteUserLevels(id) {
  return request({ url: `/admin/api/user-levels/${id}`, method: 'delete' })
}
export function updateUserLevelsStatus(id, status) {
  return request({ url: `/admin/api/user-levels/${id}/status`, method: 'post', data: { status } })
}
