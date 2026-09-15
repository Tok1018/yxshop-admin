import CryptoJS from 'crypto-js'

const tool = {}

tool.local = {
  set(table, settings) {
    return localStorage.setItem(table, JSON.stringify(settings))
  },
  get(table) {
    let data = localStorage.getItem(table)
    try {
      data = JSON.parse(data)
    } catch {
      return null
    }
    return data
  },
  remove(table) {
    return localStorage.removeItem(table)
  },
  clear() {
    return localStorage.clear()
  }
}

tool.session = {
  set(table, settings) {
    return sessionStorage.setItem(table, JSON.stringify(settings))
  },
  get(table) {
    let data = sessionStorage.getItem(table)
    try {
      data = JSON.parse(data)
    } catch {
      return null
    }
    return data
  },
  remove(table) {
    return sessionStorage.removeItem(table)
  },
  clear() {
    return sessionStorage.clear()
  }
}

tool.dateFormat = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  const d = new Date(date)
  const map = {
    'YYYY': d.getFullYear(),
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'HH': String(d.getHours()).padStart(2, '0'),
    'mm': String(d.getMinutes()).padStart(2, '0'),
    'ss': String(d.getSeconds()).padStart(2, '0')
  }
  let result = format
  for (const [key, value] of Object.entries(map)) {
    result = result.replace(key, value)
  }
  return result
}

tool.deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

tool.debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

tool.throttle = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

tool.encrypt = (data, key = 'yxshop') => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
}

tool.decrypt = (ciphertext, key = 'yxshop') => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key)
  try {
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  } catch {
    return null
  }
}

tool.getUrlParam = (name) => {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

tool.getRequestParams = (path) => {
  try {
    const url = new URL(path, window.location.origin)
    const params = {}
    url.searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  } catch {
    return {}
  }
}

tool.downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || ''
  link.click()
}

tool.capsule = (title, info) => {
  console.log(
    `%c ${title} %c ${info} %c`,
    'background:#35495e; padding: 2px 6px; border-radius: 3px 0 0 3px; color: #fff;',
    'background:#165dff; padding: 2px 6px; border-radius: 0 3px 3px 0; color: #fff;',
    'background:transparent'
  )
}

tool.extractList = (res) => {
  if (!res || !res.data) return []
  const d = res.data
  if (Array.isArray(d)) return d
  if (Array.isArray(d.list)) return d.list
  if (Array.isArray(d.data)) return d.data
  return []
}

tool.extractTotal = (res) => {
  if (!res || !res.data) return 0
  const d = res.data
  return d.total || d.total === 0 ? d.total : 0
}

tool.groupSeparator = (num) => {
  if (num === null || num === undefined) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

tool.screen = (element) => {
  const el = element || document.documentElement
  const isFullscreen = document.isFullScreen || document.webkitIsFullScreen || document.mozFullScreen
  if (!isFullscreen) {
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    if (fn) fn.call(el)
  } else {
    const fn = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen
    if (fn) fn.call(document)
  }
}

tool.showFile = (path) => {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_URL || ''
  return base + '/' + path.replace(/^\/+/, '')
}

export default tool