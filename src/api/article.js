import { request } from '@/utils/request'

export function getArticleList(params) {
  return request({ url: '/admin/api/articles', method: 'get', params })
}

export function getArticleDetail(id) {
  return request({ url: `/admin/api/articles/${id}`, method: 'get' })
}

export function createArticle(data) {
  return request({ url: '/admin/api/articles', method: 'post', data })
}

export function updateArticle(id, data) {
  return request({ url: `/admin/api/articles/${id}`, method: 'put', data })
}

export function deleteArticle(id) {
  return request({ url: `/admin/api/articles/${id}`, method: 'delete' })
}

export function updateArticleStatus(id, data) {
  return request({ url: `/admin/api/articles/${id}/status`, method: 'post', data })
}

export function getArticleCategoryList(params) {
  return request({ url: '/admin/api/article-categories', method: 'get', params })
}

export function createArticleCategory(data) {
  return request({ url: '/admin/api/article-categories', method: 'post', data })
}

export function updateArticleCategory(id, data) {
  return request({ url: `/admin/api/article-categories/${id}`, method: 'put', data })
}

export function deleteArticleCategory(id) {
  return request({ url: `/admin/api/article-categories/${id}`, method: 'delete' })
}