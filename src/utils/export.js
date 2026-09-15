import { Message } from '@arco-design/web-vue'
import { request } from '@/utils/request'

export async function exportToFile(url, params = {}, filename = 'export') {
  try {
    Message.info('正在导出，请稍候...')
    const res = await request({
      url,
      method: 'get',
      params,
      responseType: 'blob',
    })

    if (res instanceof Blob) {
      downloadBlob(res, filename)
      Message.success('导出成功')
      return
    }

    if (res.data instanceof Blob) {
      downloadBlob(res.data, filename)
      Message.success('导出成功')
      return
    }

    const contentType = res.headers?.['content-type'] || ''
    if (contentType.includes('application/json')) {
      Message.error('导出失败，请检查参数')
      return
    }

    downloadBlob(res.data || res, filename)
    Message.success('导出成功')
  } catch (error) {
    console.error('Export error:', error)
    Message.error('导出失败，请重试')
  }
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}