import { useUserStore } from '@/store'

const checkPermission = (permission) => {
  const userStore = useUserStore()
  if (!userStore.permissions) return false
  if (userStore.permissions.includes('*')) return true
  if (typeof permission === 'string') return userStore.permissions.includes(permission)
  if (Array.isArray(permission)) return permission.some(p => userStore.permissions.includes(p))
  return false
}

const toggleEl = (el, show) => {
  if (show) {
    if (el._displayBackup !== undefined) {
      el.style.display = el._displayBackup
      delete el._displayBackup
    }
  } else {
    el._displayBackup = el.style.display
    el.style.display = 'none'
  }
}

const checkAuth = (el, binding) => {
  const { value } = binding
  if (value === undefined || value === null) return

  const permissions = Array.isArray(value) ? value : [value]
  const hasPermission = permissions.some(p => checkPermission(p))
  toggleEl(el, hasPermission)
}

export function hasPermission(permission) {
  return checkPermission(permission)
}

export default {
  mounted(el, binding) {
    checkAuth(el, binding)
  },
  updated(el, binding) {
    checkAuth(el, binding)
  },
}
