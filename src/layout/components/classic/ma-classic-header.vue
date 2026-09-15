<template>
  <header class="header-bar">
    <div class="header-bar-main">
      <div class="header-left">
        <a-avatar class="header-mobile-logo" :size="36">
          <img :src="`${$url}logo.png`" class="bg-white" alt="Logo" />
        </a-avatar>
        <h1 class="header-page-title">{{ pageTitle }}</h1>
        <ma-breadcrumb v-if="appStore.breadcrumb" />

      </div>
      <div class="header-right">
        <div class="header-search-input hidden lg:flex">
          <span class="header-search-icon"><icon-search :size="16" /></span>
          <input
            v-model="searchValue"
            :placeholder="t('sys.layout.header.searchPlaceholder')"
            @keyup.enter="handleSearch"
          />
        </div>
        <!-- <a-tooltip :content="$t('sys.search')" class="lg:hidden">
          <button class="header-action-btn" @click="() => (appStore.searchOpen = true)">
            <icon-search :size="18" />
          </button>
        </a-tooltip> -->

        <button class="header-mail-btn" @click="handleMailClick">
          <icon-email :size="18" />
          <span class="header-action-dot secondary" v-if="hasUnreadMail"></span>
        </button>

        <a-trigger trigger="click">
          <button class="header-notification-btn">
            <icon-notification :size="18" />
            <span class="header-action-dot error" v-if="messageStore.messageList.length > 0"></span>
          </button>
          <template #content>
            <message-notification />
          </template>
        </a-trigger>

        <a-tooltip :content="themeMode !== 'dark' ? $t('setting.light') : $t('setting.dark')" class="hidden lg:inline">
          <button class="header-action-btn" @click="switchMode">
            <icon-sun-fill v-if="themeMode === 'light'" :size="18" />
            <icon-moon-fill v-else :size="18" />
          </button>
        </a-tooltip>

        <a-dropdown @select="handleSelectLanguage" trigger="hover" class="hidden lg:inline">
          <button class="header-action-btn">
            <span style="font-size:12px;font-weight:600;">{{ languageLabel }}</span>
          </button>
          <template #content>
            <a-doption v-for="item in languageMenu" :key="item.code" :value="item.code">{{ item.name }}</a-doption>
          </template>
        </a-dropdown>

        <a-tooltip :content="isFullScreen ? $t('sys.closeFullScreen') : $t('sys.fullScreen')" class="hidden lg:inline">
          <button class="header-action-btn" @click="screen">
            <icon-fullscreen-exit v-if="isFullScreen" :size="18" />
            <icon-fullscreen v-else :size="18" />
          </button>
        </a-tooltip>

        <a-tooltip :content="$t('sys.pageSetting')" class="hidden lg:inline">
          <button class="header-action-btn" @click="() => (appStore.settingOpen = true)">
            <icon-settings :size="18" />
          </button>
        </a-tooltip>

        <a-dropdown @select="handleSelect" trigger="hover">
          <div class="header-user-info">
            <img
              class="header-user-avatar"
              :src="userStore.user && userStore.user.avatar ? $tool.showFile(userStore.user.avatar) : $url + 'avatar.jpg'"
              alt="avatar"
            />
            <div class="header-user-text">
              <p class="header-user-name">{{ userStore.user?.nickname || t('sys.layout.header.defaultUserName') }}</p>
              <p class="header-user-shop">{{ userStore.user?.shop_name || t('sys.layout.header.defaultShopName') }}</p>
            </div>
          </div>
          <template #content>
            <a-doption value="userCenter"><icon-user /> {{ $t('sys.userCenter') }}</a-doption>
            <a-doption value="clearCache"><icon-delete /> {{ $t('sys.clearCache') }}</a-doption>
            <a-divider style="margin: 5px 0" />
            <a-doption value="logout"><icon-poweroff /> {{ $t('sys.logout') }}</a-doption>
          </template>
        </a-dropdown>
        <a-modal v-model:visible="showLogoutModal" @ok="handleLogout" @cancel="handleLogoutCancel">
          <template #title>{{ $t('sys.logoutAlert') }}</template>
          <div>{{ $t('sys.logoutMessage') }}</div>
        </a-modal>
      </div>
    </div>
    <ma-tags class="hidden lg:flex" />
  </header>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAppStore, useUserStore, useMessageStore } from '@/store'
import { request } from '@/utils/request'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import tool from '@/utils/tool'
import MessageNotification from '../components/message-notification.vue'
import { Message } from '@arco-design/web-vue'
import { Push } from '@/utils/push-vue'
import { info } from '@/utils/common'
import * as commonApi from '@/api/common'
import MaBreadcrumb from '../ma-breadcrumb.vue'
import MaTags from '../ma-tags.vue'
import {
  IconSearch, IconCalendar, IconDown, IconEmail, IconNotification,
  IconSunFill, IconMoonFill, IconFullscreen, IconFullscreenExit,
  IconSettings, IconUser, IconDelete, IconPoweroff
} from '@arco-design/web-vue/es/icon'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()
const appStore = useAppStore()

const searchValue = ref('')
const isFullScreen = ref(false)
const showLogoutModal = ref(false)
const showDatePicker = ref(false)

const pageTitle = computed(() => {
  if (!appStore.i18n) return route.meta?.title || ''
  const translated = t('menus.' + route.name)
  return translated.indexOf('.') > 0 ? (route.meta?.title || '') : translated
})

const dateDisplay = computed(() => {
  const now = new Date()
  return t('sys.layout.header.dateMonth', { year: now.getFullYear(), month: now.getMonth() + 1 })
})

const hasUnreadMail = computed(() => {
  return messageStore.messageList.some(m => m.type === 'mail' && !m.read)
})

const themeMode = ref('dark')

const language = computed(() => appStore.language)
const languageLabel = computed(() => {
  if (language.value === 'zh_TW') return '繁'
  if (language.value === 'zh_CN') return '简'
  return 'En'
})

const languageMenu = ref([
  { code: 'zh_TW', name: '中文繁體' },
  { code: 'zh_CN', name: '中文简体' },
  { code: 'en', name: 'English' },
])

const loadLanguageList = async () => {
  try {
    const res = await request({ url: '/admin/api/language/list', method: 'get' })
    if (res.code === 0 && res.data) {
      languageMenu.value = res.data
    }
  } catch (e) {
    // fallback to default
  }
}

const handleSearch = () => {
  appStore.searchKeyword = searchValue.value
  appStore.searchOpen = true
}

const handleMailClick = () => {
  if (router.hasRoute('messageCenter')) {
    router.push({ name: 'messageCenter' }).catch(() => {})
  }
}

const switchMode = () => {
  themeMode.value = themeMode.value === 'dark' ? 'light' : 'dark'
  appStore.toggleMode(themeMode.value)
}

const handleSelectLanguage = (event) => {
  appStore.changeLanguage(event)
}

const handleSelect = async (name) => {
  if (name === 'userCenter') {
    router.push({ name: 'userCenter' })
  }
  if (name === 'clearCache') {
    const res = await commonApi.clearAllCache()
    tool.local.remove('dictData')
    res.code === 0 && Message.success(res.message || '操作成功')
  }
  if (name === 'logout') {
    showLogoutModal.value = true
    document.querySelector('#app').style.filter = 'grayscale(1)'
  }
}

const handleLogout = async () => {
  await userStore.logout()
  document.querySelector('#app').style.filter = 'grayscale(0)'
  router.push({ name: 'login' })
}

const handleLogoutCancel = () => {
  document.querySelector('#app').style.filter = 'grayscale(0)'
}

const screen = () => {
  tool.screen(document.documentElement)
  isFullScreen.value = !isFullScreen.value
}

if (appStore.ws) {
  const env = import.meta.env
  const baseURL = env.VITE_APP_OPEN_PROXY === 'true' ? env.VITE_APP_PROXY_PREFIX : env.VITE_APP_BASE_URL
  const wsURL = env.VITE_APP_WS_URL ? env.VITE_APP_WS_URL : ''
  const appKey = env.VITE_APP_WS_APPKEY ? env.VITE_APP_WS_APPKEY : ''
  var connection = new Push({
    url: wsURL,
    app_key: appKey,
    auth: baseURL + '/plugin/webman/push/auth',
  })
  var user_channel = connection.subscribe('yxadmin')
  user_channel.on('message', function (message) {
    info(t('system.newMessage'), t('system.newMessageTip'))
    messageStore.messageList = message.data
  })
}

onMounted(() => {
  const defaultSetting = tool.local.get('setting') || { language: 'zh_TW', mode: 'light' }
  themeMode.value = defaultSetting.mode
  loadLanguageList()
})
</script>
