<template>
  <div class="rich-text-preview">
    <div v-if="props.content" class="rich-content" v-html="props.content"></div>
    <div v-else class="rich-empty">
      <icon-edit :size="20" style="opacity: 0.3" />
      <span>{{ t('mini_page.rich_text_empty') }}</span>
    </div>
  </div>
</template>

<script setup>
import { IconEdit } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({ props: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.rich-text-preview { background: #fff; padding: 12px; min-height: 60px; }
.rich-content { font-size: 13px; color: #333; line-height: 1.6; word-break: break-all; }
.rich-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 20px; color: #ccc; font-size: 12px; }
</style>