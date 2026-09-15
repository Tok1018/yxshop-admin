<template>
  <div class="image-ad-preview">
    <div v-if="props.images && props.images.length > 0" class="image-ad-grid" :class="'layout-' + (props.layout || 'single')">
      <div v-for="(img, i) in props.images" :key="i" class="ad-image-item">
        <img :src="img.url || img" alt="" />
      </div>
    </div>
    <div v-else class="image-ad-empty">
      <icon-image :size="24" style="opacity: 0.3" />
      <span>{{ t('mini_page.image_ad_empty') }}</span>
    </div>
  </div>
</template>

<script setup>
import { IconImage } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({ props: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.image-ad-preview { background: #fff; }
.image-ad-grid { display: flex; gap: 2px; }
.image-ad-grid.layout-single { flex-direction: column; }
.image-ad-grid.layout-double { flex-wrap: wrap; }
.image-ad-grid.layout-double .ad-image-item { width: calc(50% - 1px); }
.ad-image-item img { width: 100%; height: 100px; object-fit: cover; display: block; }
.image-ad-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px; background: #f5f5f5; color: #999; font-size: 12px; }
</style>