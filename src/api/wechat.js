import { request } from '@/utils/request'

// 微信扫码登录相关接口已移除（开源版不需要）
// 以下仅保留微信应用设置接口（用于系统设置页面配置微信支付/公众号等）

export function getWechatSettings() {
  return request({ url: '/admin/api/settings/wechat', method: 'get' })
}

export function saveWechatSettings(data) {
  return request({ url: '/admin/api/settings/wechat', method: 'post', data })
}