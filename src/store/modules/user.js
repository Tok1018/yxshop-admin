import { defineStore } from 'pinia'
import * as loginApi from '@/api/login'
import tool from '@/utils/tool'
import router from '@/router'
import webRouter from '@/router/webRouter'
import { isUndefined } from 'lodash'
import { homePage } from '@/router/homePageRoutes'
import { useAppStore, useTagStore, useDictStore } from '@/store'
import { getToken as getAuthToken, setToken as setAuthToken, removeToken as removeAuthToken } from '@/utils/auth'

const useUserStore = defineStore('user', {
  state: () => ({
    permissions: undefined,
    roles: undefined,
    routers: undefined,
    user: undefined,
    menus: undefined
  }),

  getters: {
    getState() {
      return { ...this.$state }
    }
  },

  actions: {
    setToken(token) {
      setAuthToken(token)
    },

    getToken() {
      return getAuthToken()
    },

    clearToken() {
      removeAuthToken()
    },

    setInfo(data) {
      this.$patch(data)
    },

    resetUserInfo() {
      this.$reset()
    },

    setMenu(data) {
      const routers = flatAsyncRoutes(filterAsyncRouter(data))
      routers.map((item) => {
        if (isUndefined(item.meta.layout)) {
          router.addRoute('layout', item)
        } else {
          if (item.meta.layout) {
            router.addRoute('layout', item)
          } else {
            router.addRoute(item)
          }
        }
      })

    },

    requestUserInfo() {
      return new Promise((resolve, reject) => {
        loginApi.getInfo().then(async (response) => {
          if (!response || !response.data) {
            this.clearToken()
            await router.push({ name: 'login' })
            reject(false)
          } else {
            this.setInfo(response.data)
            const dictStore = useDictStore()
            await dictStore.initData()
            // homePage.children = webRouter[0].children  //作用用於修改首頁只顯示主菜單dashboard
            this.setMenu(this.routers)
            this.routers = removeButtonMenu(this.routers)
            this.routers.unshift(homePage)
            await this.setApp()
            resolve(response.data)
          }
        })
      })
    },

    login(form) {
      return loginApi
        .login(form)
        .then((r) => {
          if (r.code === 0) {
            this.setToken(r.data.access_token)
            if (r.data.require_password_change) {
              return { require_password_change: true, reason: r.data.password_change_reason }
            }
            return true
          } else {
            return false
          }
        })
        .catch((e) => {
          console.error(e)
          return false
        })
    },

    async logout() {
      // await loginApi.logout()
      const tagStore = useTagStore()
      tool.local.remove('tags')
      tagStore.clearTags()
      this.clearToken()
      this.resetUserInfo()
    },

    async setApp() {
      const appStore = useAppStore()

      const setting = tool.local.get("setting") || (typeof this.user.backend_setting === 'string'
          ? JSON.parse(this.user.backend_setting)
          : this.user.backend_setting)
      // const setting = typeof this.user.backend_setting === 'string'
      //     ? JSON.parse(this.user.backend_setting)
      //     : this.user.backend_setting
      appStore.toggleMode(setting?.mode ?? appStore.mode)
      appStore.toggleMenu(setting?.menuCollapse ?? appStore.menuCollapse)
      appStore.toggleTag(setting?.tag ?? appStore.tag)
      appStore.toggleRound(setting?.round ?? appStore.round)
      appStore.changeMenuWidth(setting?.menuWidth ?? appStore.menuWidth)
      appStore.changeLayout(setting?.layout ?? appStore.layout)
      appStore.useSkin(setting?.skin ?? appStore.skin)
      appStore.changeColor(setting?.color ?? appStore.color)
    }
  },

  persist: {
    key: 'yxshop_user',
    paths: ['permissions', 'roles', 'user', 'menus'],
  }
})

//路由扁平化
const flatAsyncRoutes = (routes, breadcrumb = []) => {
  let res = []
  routes.forEach((route) => {
    const tmp = { ...route }
    if (tmp.children) {
      let childrenBreadcrumb = [...breadcrumb]
      childrenBreadcrumb.push(route)
      let tmpRoute = { ...route }
      tmpRoute.meta.breadcrumb = childrenBreadcrumb
      delete tmpRoute.children
      delete tmpRoute.component
      res.push(tmpRoute)
      let childrenRoutes = flatAsyncRoutes(tmp.children, childrenBreadcrumb)
      childrenRoutes.map((item) => {
        res.push(item)
      })
    } else {
      if (!tmp.path || !tmp.component) {
        return
      }
      let tmpBreadcrumb = [...breadcrumb]
      tmpBreadcrumb.push(tmp)
      tmp.meta.breadcrumb = tmpBreadcrumb
      res.push(tmp)
    }
  })
  return res
}

const views = import.meta.glob('../../views/**/**.vue')
const emptyViews = import.meta.glob('../../layout/empty.vue')

const filterAsyncRouter = (routerMap) => {
  const accessedRouters = []
  routerMap.forEach((item) => {
    if (item.meta.type !== 'B') {
      if (item.meta.type === 'I') {
        item.meta.url = item.path
        item.path = `/maIframe/${item.name}`
      }

      let component
      if (item.component === 'empty') {
        component = emptyViews['../../layout/empty.vue']
      } else {
        component = views[`../../views/${item.component}.vue`]
      }

      if (!component) {
        console.warn(`[Router] 组件未找到: ../../views/${item.component}.vue, 跳过路由: ${item.path}`)
        return
      }

      const route = {
        path: item.path,
        name: item.name,
        hidden: item.hidden === 1,
        meta: item.meta,
        children: item.children ? filterAsyncRouter(item.children) : null,
        component
      }
      accessedRouters.push(route)
    }
  })
  return accessedRouters
}

// 去除按钮菜单
const removeButtonMenu = (routers) => {
  let handlerAfterRouters = []
  routers.forEach((item) => {
    if (item.meta.type !== 'B' && !item.meta.hidden) {
      let route = item
      if (item.children && item.children.length > 0) {
        route.children = removeButtonMenu(item.children)
      }
      handlerAfterRouters.push(route)
    }
  })
  return handlerAfterRouters
}
export default useUserStore
