import axios from 'axios'
import { Message } from '@arco-design/web-vue'
import { getToken as getAuthToken, removeToken } from '@/utils/auth'
import tool from '@/utils/tool'
import router from '@/router'
import qs from 'qs'
import { h } from 'vue'
import { IconFaceFrownFill } from '@arco-design/web-vue/dist/arco-vue-icon'

function createService() {
  const service = axios.create({
    transformResponse: [function (data) {
      if (typeof data !== 'string') return data
      try {
        return JSON.parse(data.replace(/("(?:id|parent_id|app_id|user_id|group_id|category_id|sub_category_id|third_category_id|brand_id|tag_id|item_id|file_id|key|value|order_id|coupon_id|sku_id|address_id|payment_id|role_id|admin_id|level_id|referrer_id|auth_id|menu_id|spec_id|spec_item_id|article_id|article_category_id|delivery_id|express_id|comment_id|after_sales_id|notification_id|template_id|scene_id|variable_id|blacklist_id|config_id|send_id|log_id|task_id|version_id|page_id|tab_id|theme_id|seo_id|package_id|recharge_id|withdraw_id|feedback_id|favorite_id|search_id|view_id|integral_id|sign_id|contract_id|dealer_id|referee_id|param_template_id|item_type_id|item_tag_id|file_type_id|file_group_id|upload_id|region_id|currency_id|friendly_link_id|promotion_id|prom_goods_id|prom_item_id|prom_order_id|discount_id|coupon_goods_id|coupon_item_id|coupon_use_log_id|arrival_notification_id)"\s*:\s*)(\d{15,})/g, '$1"$2"'))
      } catch (e) {
        return data
      }
    }]
  })

  service.interceptors.response.use(
    (response) => {
      if (
        response.headers['content-disposition'] ||
        !/^application\/json/.test(response.headers['content-type'] || '')
      ) {
        return response
      }

      const res = response.data

      if (res.code === 0) {
        if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
          if (Array.isArray(res.data.data) && (typeof res.data.total === 'number' || typeof res.data.count === 'number')) {
            if (!Array.isArray(res.data.list)) {
              res.data.list = res.data.data
            }
            if (typeof res.data.total !== 'number' && typeof res.data.count === 'number') {
              res.data.total = res.data.count
            }
            if (!res.data.page && res.data.current_page) res.data.page = res.data.current_page
            if (!res.data.page_size && res.data.per_page) res.data.page_size = res.data.per_page
            if (!res.data.page_size && res.data.limit) res.data.page_size = res.data.limit
          }
        }
        return res
      }

      if (res.code === 401) {
        throttle(() => {
          Message.error({
            content: res.message || res.msg || '登录已过期',
            icon: () => h(IconFaceFrownFill)
          })
          removeToken()
          tool.local.remove('userInfo')
          router.push({ name: 'login' })
        })()
        return Promise.reject(new Error(res.message || '登录已过期'))
      }

      if (res.code === 403) {
        Message.error({
          content: res.message || res.msg || '权限不足',
          icon: () => h(IconFaceFrownFill)
        })
        return Promise.reject(new Error(res.message || res.msg || '权限不足'))
      }

      Message.error({
        content: res.message || res.msg || '请求失败',
        icon: () => h(IconFaceFrownFill)
      })
      return Promise.reject(new Error(res.message || res.msg || '请求失败'))
    },
    (error) => {
      const status = error.response?.status
      const messages = {
        401: '登录已过期',
        403: '权限不足',
        404: '资源不存在',
        422: '请求数据验证失败',
        429: '请求过于频繁，请稍后重试',
        500: '服务器内部错误',
        502: '网关错误',
        503: '服务不可用'
      }
      const msg = messages[status] || '网络错误'

      if (status === 401) {
        throttle(() => {
          Message.error({ content: msg, icon: () => h(IconFaceFrownFill) })
          removeToken()
          tool.local.remove('userInfo')
          router.push({ name: 'login' })
        })()
      } else if (status === 422) {
        const errors = error.response?.data?.errors
        if (errors) {
          const firstError = Object.values(errors)[0]
          Message.error({ content: Array.isArray(firstError) ? firstError[0] : firstError, icon: () => h(IconFaceFrownFill) })
        } else {
          Message.error({ content: msg, icon: () => h(IconFaceFrownFill) })
        }
      } else {
        Message.error({ content: msg, icon: () => h(IconFaceFrownFill) })
      }

      return Promise.reject(error)
    }
  )

  return service
}

function throttle(fn, wait = 1500) {
  return function () {
    if (!throttle.timer) {
      fn.apply(this, arguments)
      throttle.timer = setTimeout(() => {
        throttle.timer = null
      }, wait)
    }
  }
}

function createRequest(service) {
  return function (config) {
    const token = getAuthToken()
    const setting = tool.local.get('setting') || {}
    const configDefault = {
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
        'Accept-Language': setting.language || 'zh-CN',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      timeout: 30000,
      data: {}
    }

    if (config.headers) {
      Object.assign(configDefault.headers, config.headers)
      delete config.headers
    }

    const option = Object.assign(configDefault, config)

    if (!isEmpty(option.params)) {
      option.url = option.url + '?' + qs.stringify(option.params, { allowDots: true, encode: false })
      option.params = {}
    }

    return service(option)
  }
}

function isEmpty(obj) {
  return obj === undefined || obj === null || Object.keys(obj).length === 0
}

export const service = createService()
export const request = createRequest(service)