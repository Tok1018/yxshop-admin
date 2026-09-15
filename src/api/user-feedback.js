import { request } from '@/utils/request'

export function getUserFeedbackList(params) {
  return request({ url: '/admin/api/user-feedbacks', method: 'get', params })
}
export function getUserFeedbackDetail(id) {
  return request({ url: `/admin/api/user-feedbacks/${id}`, method: 'get' })
}
export function deleteUserFeedback(id) {
  return request({ url: `/admin/api/user-feedbacks/${id}`, method: 'delete' })
}
export function batchDeleteUserFeedback(ids) {
  return request({ url: '/admin/api/user-feedbacks/batch-delete', method: 'post', data: { ids } })
}
export function replyUserFeedback(id, data) {
  return request({ url: `/admin/api/user-feedbacks/${id}/reply`, method: 'post', data })
}
export function closeUserFeedback(id) {
  return request({ url: `/admin/api/user-feedbacks/${id}/close`, method: 'post' })
}
