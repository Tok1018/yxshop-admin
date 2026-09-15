import { request } from '@/utils/request'

export function dictAll() {
  return request({ url: '/admin/api/common/dict/all', method: 'get' })
}

export function clearAllCache() {
  return request({ url: '/admin/api/common/clear-cache', method: 'post' })
}

export function importExcel(url, data) {
  return request({ url, method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function download(url) {
  return request({ url, method: 'get', responseType: 'blob' })
}

export function commonGet(url) {
  return request({ url, method: 'get' })
}

export function uploadFile(data) {
  return request({ url: '/admin/api/upload/file', method: 'post', data, headers: { 'Content-Type': 'multipart/form-data' } })
}
