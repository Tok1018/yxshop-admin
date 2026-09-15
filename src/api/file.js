import { request } from '@/utils/request'

export function uploadImage(data) {
  return request({ url: '/admin/api/upload/image', method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function uploadFile(data) {
  return request({ url: '/admin/api/upload/file', method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function getFileList(params) {
  return request({ url: '/admin/api/files', method: 'get', params })
}

export function getFileDetail(id) {
  return request({ url: `/admin/api/files/${id}`, method: 'get' })
}

export function deleteFile(id) {
  return request({ url: `/admin/api/files/${id}`, method: 'delete' })
}

export function batchMoveFile(data) {
  return request({ url: '/admin/api/files/batch-move', method: 'post', data })
}

export function moveFileToGroup(data) {
  return request({ url: '/admin/api/files/move-to-group', method: 'post', data })
}

export function getFileStats(params) {
  return request({ url: '/admin/api/files/stats', method: 'get', params })
}

export function getGroupList(params) {
  return request({ url: '/admin/api/files/groups', method: 'get', params })
}

export function createGroup(data) {
  return request({ url: '/admin/api/files/groups', method: 'post', data })
}

export function updateGroup(id, data) {
  return request({ url: `/admin/api/files/groups/${id}`, method: 'put', data })
}

export function deleteGroup(id) {
  return request({ url: `/admin/api/files/groups/${id}`, method: 'delete' })
}
