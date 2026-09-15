import { useUserStore } from '@/store'

const auth = (name) => {
  const userStore = useUserStore()
  if (!userStore.permissions) return false
  if (userStore.permissions.includes('*')) return true
  return userStore.permissions.includes(name)
}

export { auth }
export default auth
