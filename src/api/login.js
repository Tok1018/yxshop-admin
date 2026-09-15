import { request } from '@/utils/request'

export function getCaptcha() {
  return request({ url: '/admin/api/captcha', method: 'get' })
}

export function getPuzzleCaptcha() {
  return request({ url: '/admin/api/captcha/puzzle', method: 'get' })
}

export function login(params = {}) {
  return request({ url: '/admin/api/login', method: 'post', data: params })
}

export function logout(params = {}) {
  return request({ url: '/admin/api/logout', method: 'post', data: params })
}

export function getInfo(params = {}) {
  return request({ url: '/admin/api/user/info', method: 'get', data: params })
}
