export function formatCurrency(value, currency = '¥') {
  if (typeof value !== 'number' && typeof value !== 'string') return '-'
  const num = Number(value)
  if (isNaN(num)) return '-'
  return currency + num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatNumber(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return '-'
  const num = Number(value)
  if (isNaN(num)) return '-'
  return num.toLocaleString('zh-CN')
}

export function formatPercent(value, decimals = 1) {
  if (typeof value !== 'number' && typeof value !== 'string') return '-'
  const num = Number(value)
  if (isNaN(num)) return '-'
  return num.toFixed(decimals) + '%'
}

/**
 * 格式化日期时间，兼容整数时间戳(Unix秒)和 "Y-m-d H:i:s" 字符串
 */
export function formatDateTime(value) {
  if (!value) return '-'
  let date
  if (typeof value === 'number') {
    date = new Date(value * 1000)
  } else if (typeof value === 'string') {
    // "2026-07-31 12:34:56" → "2026-07-31T12:34:56" (ISO 8601)
    date = new Date(value.replace(' ', 'T'))
  } else {
    date = new Date(value)
  }
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

export function formatTrend(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return '-'
  const num = Number(value)
  if (isNaN(num)) return '-'
  return num >= 0 ? `+${num.toFixed(1)}%` : `${num.toFixed(1)}%`
}