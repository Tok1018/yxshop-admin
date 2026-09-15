const homePageRoutes = [
  {
    name: 'dashboard',
    path: '/dashboard',
    meta: {
      title: '仪表盘',
      icon: 'IconDashboard',
      type: 'M',
      affix: true
    },
    component: () => import('@/views/dashboard/index.vue')
  },
  {
    name: 'userCenter',
    path: '/usercenter',
    meta: {
      title: '个人信息',
      icon: 'icon-user',
      type: 'M'
    },
    component: () => import('@/views/profile/index.vue')
  },
  {
    name: 'itemEdit',
    path: '/item/edit/:id?',
    meta: {
      title: '商品编辑',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/item/edit.vue')
  },
  {
    name: 'articleEdit',
    path: '/article/edit/:id?',
    meta: {
      title: '文章编辑',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/article/edit.vue')
  },
  {
    name: 'miniPage',
    path: '/mini-page',
    meta: {
      title: '小程序装修',
      icon: 'icon-apps',
      type: 'M'
    },
    component: () => import('@/views/mini-page/index.vue')
  },
  {
    name: 'miniPageEditor',
    path: '/mini-page/editor/:id',
    meta: {
      title: '页面编辑',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/mini-page/editor/index.vue')
  },
  {
    name: 'miniPageTheme',
    path: '/mini-page/theme',
    meta: {
      title: '主题管理',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/mini-page/theme/index.vue')
  },
  {
    name: 'miniPageTabbar',
    path: '/mini-page/tabbar',
    meta: {
      title: 'TabBar配置',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/mini-page/tabbar/index.vue')
  },
  {
    name: 'deliveryEdit',
    path: '/logistics/deliveries/edit/:id?',
    meta: {
      title: '编辑配送模板',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/deliveries/edit.vue')
  },
  {
    name: 'userDetail',
    path: '/user/detail/:id?',
    meta: {
      title: '用户详情',
      type: 'M',
      hidden: true
    },
    component: () => import('@/views/user/detail.vue')
  },
]

export const homePage = {
  name: 'dashboard',
  path: '/dashboard',
  meta: { title: '仪表盘', icon: 'IconDashboard', hidden: false, type: 'M' },
  component: () => import('@/views/dashboard/index.vue')
}

export default homePageRoutes
