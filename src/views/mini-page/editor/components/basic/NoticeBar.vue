<template>
  <div
    class="notice-bar-preview"
    :class="{ hero: hero }"
    :style="hero ? {} : { color: props.text_color || '#333', background: props.background_color || '#FFF7E6' }"
  >
    <MpIcon v-if="props.icon" :name="props.icon" :size="12" :color="hero ? 'rgba(255,255,255,0.9)' : (props.text_color || '#f59e0b')" />
    <span class="notice-tag">公告</span>
    <div class="notice-content-wrap">
      <span class="notice-content">{{ props.content || t('mini_page.notice_empty') }}</span>
    </div>
    <MpIcon name="close" :size="12" :color="hero ? 'rgba(255,255,255,0.5)' : '#ccc'" class="close-x" />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()
defineProps({
  props: { type: Object, default: () => ({}) },
  hero: { type: Boolean, default: false }
})
</script>

<style scoped>
.notice-bar-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 6px 12px;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 12px;
  overflow: hidden;
}

/* Hero 模式：半透明白色背景 + 模糊 */
.notice-bar-preview.hero {
  background: rgba(255,255,255,0.12);
}
.notice-bar-preview.hero .notice-tag {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.notice-bar-preview.hero .notice-content {
  color: rgba(255,255,255,0.92);
}

.notice-tag {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
}
.notice-content-wrap { flex: 1; overflow: hidden; white-space: nowrap; }
.notice-content { display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.close-x { flex-shrink: 0; cursor: pointer; }
</style>
