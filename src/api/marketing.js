import { request } from '@/utils/request'

export { getPromotionList, getPromotionDetail, createPromotion, updatePromotion, deletePromotion, sendPromotionNotification as sendNotification } from './promotions'

export function getMarketingSummary() {
  return request({ url: '/admin/api/marketing/summary', method: 'get' })
}

export function getMarketingStatistics() {
  return request({ url: '/admin/api/marketing/statistics', method: 'get' })
}

export function getMarketingCampaigns(params) {
  return request({ url: '/admin/api/marketing/campaigns', method: 'get', params })
}

export function getMarketingCoupons(params) {
  return request({ url: '/admin/api/marketing/coupons', method: 'get', params })
}

export function deleteCoupon(id) {
  return request({ url: `/admin/api/marketing/coupons/${id}`, method: 'delete' })
}

export function getMarketingChannels() {
  return request({ url: '/admin/api/marketing/channels', method: 'get' })
}

export function getMarketingInsights() {
  return request({ url: '/admin/api/marketing/insights', method: 'get' })
}

export function launchCampaign(data) {
  return request({ url: '/admin/api/marketing/campaigns', method: 'post', data })
}

export function exportMarketingData(params) {
  return request({ url: '/admin/api/marketing/export', method: 'get', params, responseType: 'blob' })
}
