<template>
  <div class="mr-2 flex justify-end lg:justify-between w-full lg:w-auto">
    <a-space class="mr-0 lg:mr-5" size="medium">

<!--      <a-button type="primary" @click="logRoute">Primary</a-button>-->

      <a-tooltip :content="$t('sys.search')">
        <a-button :shape="'circle'" @click="() => (appStore.searchOpen = true)" class="hidden lg:inline">
          <template #icon>
            <icon-search />
          </template>
        </a-button>
      </a-tooltip>

      <a-tooltip :content="themeMode !== 'dark' ? $t('setting.light') : $t('setting.dark')">
        <a-button :shape="'circle'" class="hidden lg:inline" @click="switchMode">
          <template #icon>
            <icon-sun-fill v-if="themeMode === 'light'"/>
            <icon-moon-fill v-else/>
          </template>
        </a-button>
      </a-tooltip>


      <a-dropdown @select="handleSelectLanguage" trigger="hover">
        <a-button :shape="'circle'" class="hidden lg:inline">
          <template #icon>
            <p v-if="language === 'zh_TW'">繁</p>
            <p v-else-if="language === 'zh_CN'">简</p>
            <p v-else>En</p>
<!--            <icon-english-fill v-if="language === 'en'"/>-->
<!--            <icon-chinese-fill v-else/>-->
          </template>
        </a-button>
        <template #content>
          <a-doption v-for="item in languageMenu" :key="item.code" :value="item.code"> {{item.name}}</a-doption>
        </template>
      </a-dropdown>

      <a-tooltip :content="isFullScreen ? $t('sys.closeFullScreen') : $t('sys.fullScreen')">
        <a-button :shape="'circle'" class="hidden lg:inline" @click="screen">
          <template #icon>
            <icon-fullscreen-exit v-if="isFullScreen" />
            <icon-fullscreen v-else />
          </template>
        </a-button>
      </a-tooltip>

      <a-trigger trigger="click">
        <a-button :shape="'circle'">
          <template #icon>
            <a-badge :count="5" dot :dotStyle="{ width: '5px', height: '5px' }" v-if="messageStore.messageList.length > 0">
              <icon-notification />
            </a-badge>
            <icon-notification v-else />
          </template>
        </a-button>

        <template #content>
          <message-notification />
        </template>
      </a-trigger>

      <a-tooltip :content="$t('sys.pageSetting')">
        <a-button :shape="'circle'" @click="() => (appStore.settingOpen = true)" class="hidden lg:inline">
          <template #icon>
            <icon-settings />
          </template>
        </a-button>
      </a-tooltip>
    </a-space>
    <a-dropdown @select="handleSelect" trigger="hover">
      <a-avatar class="bg-blue-500 text-3xl avatar" style="top: -1px">
        <img :src="userStore.user && userStore.user.avatar ? $tool.showFile(userStore.user.avatar) : $url + 'avatar.jpg'" alt="用户头像" />
      </a-avatar>

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
</template>

<script setup>
import {onMounted, ref, computed} from 'vue'
import { useAppStore, useUserStore, useMessageStore } from '@/store'
import tool from '@/utils/tool'
import MessageNotification from './components/message-notification.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { Push } from '@/utils/push-vue'
import { info } from '@/utils/common'
import * as commonApi from '@/api/common'

const { t ,locale } = useI18n()
const messageStore = useMessageStore()
const userStore = useUserStore()
const appStore = useAppStore()
const setting = ref(null)
const router = useRouter()
const isFullScreen = ref(false)
const showLogoutModal = ref(false)
const isDev = ref(import.meta.env.DEV)
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

const language = computed(() => appStore.language);
const languageMenu = [
  {"code":"zh_TW","name":"中文繁體"},
  {"code":"zh_CN","name":"中文简体"},
  {"code":"en","name":"English"},
]

const handleSelectLanguage = (event) => {
  appStore.changeLanguage(event)
}

const themeMode = ref("dark")
const switchMode = () => {
  if (themeMode.value === 'dark') {
    themeMode.value = 'light';
  } else {
    themeMode.value = 'dark';
  }
  appStore.toggleMode(themeMode)
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
  // 建立连接
  var connection = new Push({
    url: wsURL, // websocket地址
    app_key: appKey, // appkey
    auth: baseURL + '/plugin/webman/push/auth',
  })
  // 创建监听频道
  var user_channel = connection.subscribe('yxadmin')
  // 当yxadmin频道有message事件的消息时
  user_channel.on('message', function (message) {
    // message是消息内容
    info(t('system.newMessage'), t('system.newMessageTip'))
    messageStore.messageList = message.data
  })

  // 假设用户uid为1
  // var uid = 1;
  // // 浏览器监听user-1频道的消息，也就是用户uid为1的用户消息
  // var user_channel = connection.subscribe('user-' + uid);

  // // 当user-1频道有message事件的消息时
  // user_channel.on('message', function (data) {
  //   // data里是消息内容
  //   console.log(data);
  // });
  // // 当user-1频道有friendApply事件时消息时
  // user_channel.on('friendApply', function (data) {
  //   // data里是好友申请相关信息
  //   console.log(data);
  // });

  // // 假设群组id为2
  // var group_id = 2;
  // // 浏览器监听group-2频道的消息，也就是监听群组2的群消息
  // var group_channel = connection.subscribe('group-' + group_id);
  // // 当群组2有message消息事件时
  // group_channel.on('message', function (data) {
  //   // data里是消息内容
  //   console.log(data);
  // });
}

onMounted(() => {
  const defaultSetting =  tool.local.get('setting') || {language: 'zh_TW',mode:'light'};
  language.value = defaultSetting.language;
  themeMode.value = defaultSetting.mode;
})

</script>
<style scoped>
:deep(.arco-avatar-text) {
  top: 1px;
}
:deep(.arco-divider-horizontal) {
  margin: 5px 0;
}
.avatar {
  cursor: pointer;
  margin-top: 6px;
}
</style>
