<template>
  <aside
    class="sidebar-panel hidden lg:flex"
    :class="{ 'sidebar-panel-collapsed': appStore.menuCollapse }"
  >
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">
        <icon-robot :size="20" />
      </div>
      <div class="sidebar-logo-text">
        <h1 class="sidebar-logo-brand">{{ $title || t('sys.layout.sidebar.brandName') }}</h1>
        <p class="sidebar-logo-subtitle">{{ t('sys.layout.sidebar.brandSubtitle') }}</p>
      </div>
    </div>
    <ma-menu
      ref="MaMenuRef"
      height="calc(100% - 64px)"
    />
    <div class="sidebar-footer">
      <div class="sidebar-footer-divider"></div>
      <a class="sidebar-footer-link" @click="router.push({ name: 'userCenter' })">
        <span class="sidebar-nav-icon"><icon-settings :size="18" /></span>
        <span class="sidebar-footer-text">{{ t('sys.layout.sidebar.settings') }}</span>
      </a>
      <a class="sidebar-footer-link" href="javascript:void(0)" @click="openHelp">
        <span class="sidebar-nav-icon"><icon-question-circle :size="18" /></span>
        <span class="sidebar-footer-text">{{ t('sys.layout.sidebar.support') }}</span>
      </a>
    </div>
    <div class="sidebar-bottom-bar">
      <div class="sidebar-copyright">
        <span class="sidebar-version">v{{ version }} · 开源版</span>
        <span class="sidebar-copyright-sep">·</span>
        <a class="sidebar-copyright-link" href="https://www.cnzhuhai.com" target="_blank">珠海远讯科技</a>
      </div>
      <button class="sidebar-collapse-btn" @click="appStore.toggleMenu(!appStore.menuCollapse)">
        <icon-menu-fold v-if="!appStore.menuCollapse" :size="18" />
        <icon-menu-unfold v-else :size="18" />
      </button>
    </div>
  </aside>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useAppStore, useUserStore } from '@/store'
  import MaMenu from '../ma-menu.vue'
  import { IconRobot, IconSettings, IconQuestionCircle, IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon'
  import packageJson from '../../../../package.json'

  const version = packageJson.version

  const { t } = useI18n()
  const router = useRouter()
  const MaMenuRef = ref(null)
  const userStore = useUserStore()
  const appStore = useAppStore()

  const openHelp = () => {
    window.open('https://www.cnzhuhai.com/docs', '_blank')
  }

  onMounted(() => {
    setTimeout(_ => {
      MaMenuRef.value.menus = userStore.routers
    }, 50)
  })
</script>
