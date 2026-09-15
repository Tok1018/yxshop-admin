import { request } from '@/utils/request'

export function getUserProfile(params = {}) {
  return request({ url: '/admin/api/user/info', method: 'get', data: params })
}

export function updateProfile(data) {
  return request({ url: '/admin/api/user/profile', method: 'put', data })
}

export function changePassword(data) {
  return request({ url: '/admin/api/user/change-password', method: 'post', data })
}

// 2FA 双因素认证已移除（开源版不需要，属于商业版等保功能）
// export function get2FAStatus() {
//   return request({ url: '/admin/api/user/2fa/status', method: 'get' })
// }
// export function setup2FA() {
//   return request({ url: '/admin/api/user/2fa/setup', method: 'post' })
// }
// export function enable2FA(data) {
//   return request({ url: '/admin/api/user/2fa/enable', method: 'post', data })
// }
// export function disable2FA(data) {
//   return request({ url: '/admin/api/user/2fa/disable', method: 'post', data })
// }

export function forceChangePassword(data) {
  return request({ url: '/admin/api/user/force-change-password', method: 'post', data })
}