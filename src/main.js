import { createApp } from 'vue'
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'

import globalComponents from '@/components'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/i18n'
import directives from './directives'
import dayjs from 'dayjs'
import zhCn from 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.locale(zhCn)
dayjs.extend(relativeTime)

import '@arco-design/web-vue/dist/arco.css'
import '@/assets/css/design-tokens.css'
import '@/assets/css/shared-classes.css'
import '@/assets/css/sidebar.css'
import '@/assets/css/header-bar.css'
import './style/skin.less'
import './style/index.css'
import './style/global.less'

import tool from '@/utils/tool'
import * as common from '@/utils/common'
import packageJson from '../package.json'
import { setupGlobalErrorHandler } from '@/utils/globalErrorHandler'

const app = createApp(App)

app
  .use(ArcoVue, {})
  .use(ArcoVueIcon)
  .use(router)
  .use(store)
  .use(i18n)
  .use(directives)
  .use(globalComponents)

app.config.globalProperties.$tool = tool
app.config.globalProperties.$common = common
app.config.globalProperties.$title = import.meta.env.VITE_APP_TITLE
app.config.globalProperties.$url = import.meta.env.VITE_APP_BASE

app.config.globalProperties.$i18n = true
app.config.globalProperties.$language = 'zh_CN'
setupGlobalErrorHandler(app)
app.mount('#app')
tool.capsule('yxshop-admin', `v${packageJson.version} release`)
