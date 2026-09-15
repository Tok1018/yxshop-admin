import { request } from '@/utils/request'

export function getLanguageList(params) {
  return request({ url: '/admin/api/languages', method: 'get', params })
}

export function getLanguageDetail(id) {
  return request({ url: `/admin/api/languages/${id}`, method: 'get' })
}

export function createLanguage(data) {
  return request({ url: '/admin/api/languages', method: 'post', data })
}

export function updateLanguage(id, data) {
  return request({ url: `/admin/api/languages/${id}`, method: 'put', data })
}

export function deleteLanguage(id) {
  return request({ url: `/admin/api/languages/${id}`, method: 'delete' })
}

export function updateLanguageStatus(id, data) {
  return request({ url: `/admin/api/languages/${id}/status`, method: 'post', data })
}