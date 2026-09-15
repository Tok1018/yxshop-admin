import router from '@/router'

export function findRouteNameByPath(path) {
  const routes = router.getRoutes()
  const target = routes.find(r => r.path === path)
  return target?.name || null
}

export function navigateTo(path, query) {
  const name = findRouteNameByPath(path)
  if (name) {
    router.push({ name, query })
  } else {
    router.push({ path, query })
  }
}

export function safeBack(fallbackPath) {
  if (window.history.length > 1) {
    const before = router.currentRoute.value.fullPath
    router.back()
    setTimeout(() => {
      if (router.currentRoute.value.fullPath === before) {
        navigateTo(fallbackPath)
      }
    }, 150)
  } else {
    navigateTo(fallbackPath)
  }
}