export const validators = {
  required: (message) => (value) => {
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)) {
      return message || '此字段为必填项'
    }
    return true
  },

  phone: (value) => {
    if (!value) return true
    return /^1[3-9]\d{9}$/.test(value) || '请输入正确的手机号'
  },

  email: (value) => {
    if (!value) return true
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || '请输入正确的邮箱地址'
  },

  minLength: (min, message) => (value) => {
    if (!value) return true
    return value.length >= min || message || `最少输入${min}个字符`
  },

  maxLength: (max, message) => (value) => {
    if (!value) return true
    return value.length <= max || message || `最多输入${max}个字符`
  },

  positiveNumber: (value) => {
    if (value === undefined || value === null || value === '') return true
    return Number(value) > 0 || '请输入正数'
  },

  url: (value) => {
    if (!value) return true
    return /^https?:\/\/.+/.test(value) || '请输入正确的URL'
  },
}