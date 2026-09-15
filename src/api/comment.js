import { request } from '@/utils/request'

export function getCommentList(params) {
  return request({ url: '/admin/api/comments', method: 'get', params })
}

export function getCommentDetail(id) {
  return request({ url: `/admin/api/comments/${id}`, method: 'get' })
}

export function replyComment(id, data) {
  return request({ url: `/admin/api/comments/${id}/reply`, method: 'post', data })
}

export function updateCommentStatus(id, data) {
  return request({ url: `/admin/api/comments/${id}/status`, method: 'post', data })
}

export function deleteComment(id) {
  return request({ url: `/admin/api/comments/${id}`, method: 'delete' })
}

export function getCommentStats() {
  return request({ url: '/admin/api/comments/stats', method: 'get' })
}

export function exportComments(params) {
  return request({ url: '/admin/api/comments/export', method: 'get', params })
}