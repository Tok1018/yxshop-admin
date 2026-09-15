import { defineStore } from 'pinia'
import { request } from '@/utils/request'

let defaultConfig = {
  site_name: 'yxadmin',
  site_keywords: '',
  site_desc: '',
  site_record_number: '',
  site_copyright: '',
  site_storage_mode: '',
  web_close: '',
}

const useConfigStore = defineStore('config', {
  state: () => ({ ...defaultConfig }),

  getters: {
    appCurrentConfig() {
      return { ...this.$state }
    },
  },

  actions: {
    updateSettings(partial) {
      this.$patch(partial);
    },

    async loadConfig() {
      try {
        const res = await request({ url: '/admin/api/settings', method: 'get' })
        if (res?.data) {
          this.$patch(res.data)
        }
      } catch (error) {
        console.error('[ConfigStore] loadConfig failed:', error)
      }
    },
  },
})

export default useConfigStore