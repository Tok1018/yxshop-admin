<template>
  <a-layout class="layout flex flex-col h-full">
    <a-layout-header class="ma-ui-header flex justify-between h-50 layout-banner-header operation-area">
      <div class="flex items-center justify-center logo">
        <div class="banner-logo-icon"><icon-robot :size="18" /></div>
        <span class="ml-2 text-lg font-bold hidden md:block" style="color:var(--color-primary)">{{ $title }}</span>
      </div>
      <div class="flex justify-between w-full layout-banner">
        <children-banner v-model="userStore.routers" />
        <ma-operation />
      </div>
    </a-layout-header>
    <ma-tags class="hidden lg:flex ma-ui-tags" />
    <ma-worker-area class="flex-1 min-h-0" style="overflow-y: auto;" />
  </a-layout>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue'
  import { IconRobot } from '@arco-design/web-vue/es/icon'
  import { useAppStore, useUserStore } from '@/store'
  import { useRoute } from 'vue-router'
  import MaOperation from '../ma-operation.vue'
  import MaWorkerArea from '../ma-workerArea.vue'
  import MaTags from '../ma-tags.vue'
  import ChildrenBanner from '../components/children-banner.vue'

  const route = useRoute()

  const MaMenuRef = ref(null)
  const userStore = useUserStore()
  const appStore = useAppStore()
  const actives = ref([])

  onMounted(() => {
    actives.value = [ route.name ]
  })

  watch(() => route, v => {
    actives.value = [ v.name ]
  }, { deep: true })
</script>

<style scoped lang="less">
.tags {
  margin-top: -1px;
}
.banner-logo-icon {
  width: 32px; height: 32px; background: var(--color-primary); border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center; color: var(--color-on-primary); flex-shrink: 0;
}
html.dark .banner-logo-icon { background: var(--color-inverse-primary); color: var(--color-on-primary-fixed); }
:deep(.arco-menu-collapse-button) {
  right: 10px;
}
:deep(.layout-banner .arco-menu-horizontal .arco-menu-inner) {
  align-items: none;
  padding: 8px 10px;
  overflow-y: hidden;
}
:deep(.sys-menus .arco-menu-icon svg) {
  display: inline;
  margin-bottom: -1px;
}
:deep(.sys-menus .arco-menu-icon .iconify-icon) {
  margin-bottom: 2px;
}
</style>
