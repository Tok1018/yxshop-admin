<template>
  <div class="sidebar-nav-items">
    <template v-for="menu in modelValue" :key="menu.id">
      <template v-if="!menu.meta.hidden">
        <a
          v-if="!menu.children || menu.children.length === 0"
          class="sidebar-nav-item"
          :class="{ 'sidebar-nav-item-active': actives.includes(menu.name) }"
          @click="routerPush(menu)"
        >
          <span class="sidebar-nav-icon">
            <sa-icon v-if="menu.meta.icon" :icon="menu.meta.icon" :size="18" />
            <icon-menu v-else :size="18" />
          </span>
          <span class="sidebar-nav-text">{{ menuTitle(menu) }}</span>
          <span class="sidebar-nav-badge" v-if="menu.badge && menu.badge > 0 && !appStore.menuCollapse">
            {{ menu.badge > 99 ? t('sys.layout.sidebar.badgeOverflow') : menu.badge }}
          </span>
          <span class="sidebar-nav-dot" v-if="menu.badge && menu.badge > 0 && appStore.menuCollapse"></span>
        </a>
        <div v-else>
          <div
            class="sidebar-nav-item-header"
            :class="{ 'sidebar-nav-item-active': actives.includes(menu.name) }"
            @click="toggleSubmenu(menu.name)"
          >
            <span class="sidebar-nav-icon">
              <sa-icon v-if="menu.meta.icon" :icon="menu.meta.icon" :size="18" />
              <icon-menu v-else :size="18" />
            </span>
            <span class="sidebar-nav-text">{{ menuTitle(menu) }}</span>
            <span class="sidebar-nav-badge" v-if="menu.badge && menu.badge > 0 && !appStore.menuCollapse">
              {{ menu.badge > 99 ? t('sys.layout.sidebar.badgeOverflow') : menu.badge }}
            </span>
            <span class="sidebar-nav-dot" v-if="menu.badge && menu.badge > 0 && appStore.menuCollapse"></span>
            <span class="sidebar-nav-arrow" :class="{ 'sidebar-nav-arrow-open': localOpenKeys.includes(menu.name) }" v-if="!appStore.menuCollapse">
              <icon-down :size="14" />
            </span>
          </div>
          <div class="sidebar-nav-submenu" v-show="localOpenKeys.includes(menu.name) && !appStore.menuCollapse">
            <children-menu v-model="menu.children" />
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
  import { ref, watch, inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useTagStore, useAppStore } from '@/store'
  import { useRouter, useRoute } from 'vue-router'
  import { IconDown, IconMenu } from '@arco-design/web-vue/es/icon'

  const props = defineProps({ modelValue: Array })

  const { t } = useI18n()
  const router = useRouter()
  const route = useRoute()
  const emits = defineEmits(['go'])
  const appStore = useAppStore()
  const tagStore = useTagStore()

  const actives = ref([route.name])
  const localOpenKeys = ref([])

  watch(() => route, (v) => {
    actives.value = [v.name]
  }, { deep: true })

  const menuTitle = (menu) => {
    if (!appStore.i18n) return menu.meta.title
    const translated = t(`menus.${menu.name}`)
    return translated.indexOf('.') > 0 ? menu.meta.title : translated
  }

  const routerPush = (menu) => {
    if (!menu || !menu.path) return
    if (menu.meta && menu.meta.type === 'L') {
      window.open(menu.path)
    } else {
      router.push(menu.path)
      tagStore.addTag({ name: menu.name, title: menu.meta?.title || '', path: menu.path })
    }
  }

  const toggleSubmenu = (name) => {
    const index = localOpenKeys.value.indexOf(name)
    if (index > -1) {
      localOpenKeys.value.splice(index, 1)
    } else {
      localOpenKeys.value = [name]
    }
  }

  watch(() => route, () => {
    if (route.matched[1] && route.matched[1].meta && route.matched[1].meta.breadcrumb) {
      localOpenKeys.value = route.matched[1].meta.breadcrumb.map(item => item.name)
    }
  }, { deep: true, immediate: true })
</script>
