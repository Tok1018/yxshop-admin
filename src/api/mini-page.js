import { request } from '@/utils/request'

export function getMiniPageList(params) {
  return request({ url: '/admin/api/mini-page/pages', method: 'get', params })
}

export function getMiniPageDetail(id) {
  return request({ url: `/admin/api/mini-page/pages/${id}`, method: 'get' })
}

export function createMiniPage(data) {
  return request({ url: '/admin/api/mini-page/pages', method: 'post', data })
}

export function updateMiniPage(id, data) {
  return request({ url: `/admin/api/mini-page/pages/${id}`, method: 'post', data })
}

export function deleteMiniPage(id) {
  return request({ url: `/admin/api/mini-page/pages/${id}`, method: 'delete' })
}

export function publishMiniPage(id, data = {}) {
  return request({ url: `/admin/api/mini-page/pages/${id}/publish`, method: 'post', data })
}

export function unpublishMiniPage(id) {
  return request({ url: `/admin/api/mini-page/pages/${id}/unpublish`, method: 'post' })
}

export function getComponentSchemas(params = {}) {
  return request({ url: '/admin/api/mini-page/component-schemas', method: 'get', params })
}

export function getMiniThemeList(params) {
  return request({ url: '/admin/api/mini-page/themes', method: 'get', params })
}

export function createMiniTheme(data) {
  return request({ url: '/admin/api/mini-page/themes', method: 'post', data })
}

export function updateMiniTheme(id, data) {
  return request({ url: `/admin/api/mini-page/themes/${id}`, method: 'post', data })
}

export function deleteMiniTheme(id) {
  return request({ url: `/admin/api/mini-page/themes/${id}`, method: 'delete' })
}

export function applyMiniTheme(id, data) {
  return request({ url: `/admin/api/mini-page/themes/${id}/apply`, method: 'post', data })
}

export function getMiniTabBar(params) {
  return request({ url: '/admin/api/mini-page/tabbar', method: 'get', params })
}

export function saveMiniTabBar(data) {
  return request({ url: '/admin/api/mini-page/tabbar', method: 'post', data })
}

export function getVersionList(pageId, params) {
  return request({ url: `/admin/api/mini-page/pages/${pageId}/versions`, method: 'get', params })
}

export function getVersionDetail(pageId, versionId) {
  return request({ url: `/admin/api/mini-page/pages/${pageId}/versions/${versionId}`, method: 'get' })
}

export function rollbackVersion(pageId, versionId) {
  return request({ url: `/admin/api/mini-page/pages/${pageId}/versions/${versionId}/rollback`, method: 'post' })
}

export function getTemplateList(params) {
  return request({ url: '/admin/api/mini-page/templates', method: 'get', params })
}

export function createTemplate(data) {
  return request({ url: '/admin/api/mini-page/templates', method: 'post', data })
}

export function createPageFromTemplate(id, data) {
  return request({ url: `/admin/api/mini-page/templates/${id}/create-page`, method: 'post', data })
}

export function deleteTemplate(id) {
  return request({ url: `/admin/api/mini-page/templates/${id}`, method: 'delete' })
}

export function getBuiltinTemplates() {
  return request({ url: '/admin/api/mini-page/builtin-templates', method: 'get' })
}

export function getBuiltinTemplateDetail(templateId) {
  return request({ url: `/admin/api/mini-page/builtin-templates/${templateId}`, method: 'get' })
}

export function importBuiltinTemplate(templateId) {
  return request({ url: `/admin/api/mini-page/builtin-templates/${templateId}/import`, method: 'post' })
}

export function createPageFromBuiltin(templateId, data = {}) {
  return request({ url: `/admin/api/mini-page/builtin-templates/${templateId}/create-page`, method: 'post', data })
}