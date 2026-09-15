import homePageRoutes from './homePageRoutes'

const routes = [
  {
    name: 'layout',
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: 'dashboard',
    children: homePageRoutes
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    name: '403',
    path: '/403',
    component: () => import('@/layout/403.vue'),
    meta: { title: '访问受限' }
  },
  {
    name: '500',
    path: '/500',
    component: () => import('@/layout/500.vue'),
    meta: { title: '服务器错误' }
  },
  {
    path: '/:pathMatch(.*)*',
    hidden: true,
    meta: { title: '访问的页面不存在' },
    component: () => import('@/layout/404.vue')
  }
]

export default routes
