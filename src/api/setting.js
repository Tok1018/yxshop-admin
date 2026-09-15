import { request } from '@/utils/request'

export function getSetting(key) {
  return request({ url: '/admin/api/settings', method: 'get', params: { key } })
}

export function saveSetting(data) {
  return request({ url: '/admin/api/settings', method: 'post', data })
}

export function getPayment() {
  return request({ url: '/admin/api/settings/payment', method: 'get' })
}

export function savePayment(data) {
  return request({ url: '/admin/api/settings/payment', method: 'post', data })
}

export function uploadCert(formData) {
  return request({ url: '/admin/api/settings/payment/cert', method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
}

export function testPayment() {
  return request({ url: '/admin/api/settings/payment/test', method: 'post' })
}

export function getShipping() {
  return request({ url: '/admin/api/settings/shipping', method: 'get' })
}

export function saveShipping(data) {
  return request({ url: '/admin/api/settings/shipping', method: 'post', data })
}

export function getNotification() {
  return request({ url: '/admin/api/settings/notification', method: 'get' })
}

export function saveNotification(data) {
  return request({ url: '/admin/api/settings/notification', method: 'post', data })
}

// 登录设置（会话超时、验证码类型）
export function getSecuritySettings() {
  return request({ url: '/admin/api/settings/security', method: 'get' })
}

export function saveSecuritySettings(data) {
  return request({ url: '/admin/api/settings/security', method: 'post', data })
}

export function getTradeSettings() {
  return request({ url: '/admin/api/settings/trade', method: 'get' })
}

export function saveTradeSettings(data) {
  return request({ url: '/admin/api/settings/trade', method: 'post', data })
}

export function getRegionalSettings() {
  return request({ url: '/admin/api/settings/regional', method: 'get' })
}

export function updateRegionalSettings(data) {
  return request({ url: '/admin/api/settings/regional', method: 'put', data })
}

export function getTeamMembers(params) {
  return request({ url: '/admin/api/settings/team', method: 'get', params })
}

export function updateTeamRole(id, data) {
  return request({ url: `/admin/api/settings/team/${id}/role`, method: 'put', data })
}

export function inviteTeamMember(data) {
  return request({ url: '/admin/api/settings/team/invite', method: 'post', data })
}

export function updateTeamMemberStatus(id, data) {
  return request({ url: `/admin/api/settings/team/${id}/status`, method: 'post', data })
}

export function removeTeamMember(id) {
  return request({ url: `/admin/api/settings/team/${id}`, method: 'delete' })
}

// API 密钥管理已移除（开源版不需要）
// export function getApiKeys() {
//   return request({ url: '/admin/api/settings/api-keys', method: 'get' })
// }
// export function createApiKey(data) {
//   return request({ url: '/admin/api/settings/api-keys', method: 'post', data })
// }
