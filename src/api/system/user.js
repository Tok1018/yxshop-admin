import { request } from '@/utils/request'

export function updateUserInfo(params = {}) {
  return request({ url: '/admin/api/user/profile', method: 'put', data: params })
}
