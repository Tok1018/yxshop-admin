<script setup>
  import cn from '@arco-design/web-vue/es/locale/lang/zh-cn'
  import tw from '@arco-design/web-vue/es/locale/lang/zh-tw'
  import en from '@arco-design/web-vue/es/locale/lang/en-us'
  import { ref, onMounted } from 'vue'
  import { useAppStore } from './store'
  const appStore = useAppStore()
  const lang = ref(appStore.language === 'zh_CN' ? cn : appStore.language === 'zh_TW' ? tw : en)

  onMounted(() => {
    appStore.changeColor(appStore.color)
  })
</script>

<template>
  <a-config-provider :locale="lang" :update-at-scroll="true">
    <router-view />
  </a-config-provider>
</template>