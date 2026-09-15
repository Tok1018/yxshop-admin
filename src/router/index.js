import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'
import NProgress from 'nprogress'
import { getToken } from '@/utils/auth'
import 'nprogress/nprogress.css'

import routes from './webRouter.js'

const title = import.meta.env.VITE_APP_TITLE
const defaultRoutePath = '/'
const whiteRoute = ['login', '403', '500', 'notFound']

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  const userStore = useUserStore()
  let toTitle = to.meta.title ? to.meta.title : to.name
  document.title = `${toTitle} - ${title}`
  const token = getToken()

  if (token) {
    if (to.name === 'login') {
      next({ path: defaultRoutePath })
      return
    }

    if (!userStore.routers || !userStore.routers.length) {
      try {
        const data = await userStore.requestUserInfo()
        if (!data) {
          next({ name: 'login', query: { redirect: to.fullPath } })
          return
        }
        next({ ...to, replace: true })
        return
      } catch {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
      }
    }

    if (to.meta.permission && userStore.permissions && !userStore.permissions.includes(to.meta.permission)) {
      next({ name: '403' })
      return
    }

    next()
  } else {
    if (!whiteRoute.includes(to.name)) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done()
})

router.onError(error => {
  NProgress.done()
})

export default router
