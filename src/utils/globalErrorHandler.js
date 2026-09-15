import { Message } from '@arco-design/web-vue'

export function setupGlobalErrorHandler(app) {
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Global Error]', err, { component: instance?.$options?.name, info })
    Message.error('页面加载异常，请刷新重试')
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise]', event.reason)
    event.preventDefault()
  })
}