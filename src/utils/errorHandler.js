import { Message } from '@arco-design/web-vue'

export function handleApiError(error, context = '') {
  const prefix = context ? `[${context}]` : ''
  console.error(`${prefix} API Error:`, error)
  const msg = error?.response?.data?.message || error?.message || '操作失败，请稍后重试'
  Message.error(msg)
}

export async function safeExecute(fn, options = {}) {
  const { context = '', onSuccess, onError } = options
  try {
    const result = await fn()
    if (onSuccess) onSuccess(result)
    return result
  } catch (error) {
    handleApiError(error, context)
    if (onError) onError(error)
    return null
  }
}