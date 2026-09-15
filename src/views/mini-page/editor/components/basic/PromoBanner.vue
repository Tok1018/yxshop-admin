<template>
  <div class="promo-banner-preview" :class="'style-' + (compProps.style || 'solid')" :style="bannerStyle">
    <!-- glass 模糊覆盖层 -->
    <div v-if="compProps.style === 'glass'" class="pb-glass-overlay"></div>

    <div v-if="compProps.show_pulse" class="pb-pulse"></div>
    <div v-if="compProps.icon" class="pb-icon-wrap" :style="iconStyle">
      <MpIcon :name="compProps.icon" :size="18" color="#fff" />
    </div>
    <div class="pb-content">
      <div class="pb-title">{{ compProps.title || '推广标题' }}</div>
      <div class="pb-subtitle" v-if="compProps.subtitle">{{ compProps.subtitle }}</div>
    </div>
    <div v-if="compProps.btn_text" class="pb-btn">{{ compProps.btn_text }}</div>
  </div>
  <div v-if="!compProps.title && !compProps.subtitle" class="promo-banner-empty">
    <span>请配置推广横幅内容</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MpIcon from '@/components/MpIcon.vue'

const props = defineProps({
  props: { type: Object, default: () => ({}) },
  hero: { type: Boolean, default: false }
})
/** 解包内层 props 数据，避免模板中 props.props.xxx 的命名冲突 */
const compProps = computed(() => props.props || {})
const bannerStyle = computed(() => {
  const p = compProps.value
  if (p.style === 'glass') return ''
  const bg1 = p.bg_color1 || '#2563eb'
  const bg2 = p.bg_color2 || '#3b82f6'
  return `background: linear-gradient(135deg, ${bg1}, ${bg2});`
})
const iconStyle = computed(() => {
  return compProps.value.icon_bg ? `background: ${compProps.value.icon_bg};` : ''
})
</script>

<style scoped>
.promo-banner-preview {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 12px 12px 12px;
  padding: 14px 16px;
  border-radius: 14px;
  color: #fff;
  position: relative;
  overflow: hidden;
}
.promo-banner-preview.style-solid {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}
.promo-banner-preview.style-dark {
  background: linear-gradient(135deg, #1e293b, #334155);
}
.promo-banner-preview.style-glass {
  background: linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05));
  border: 1px solid rgba(255,255,255,0.15);
}

/* glass 模糊覆盖层 */
.pb-glass-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: inherit;
  filter: blur(8px);
  z-index: 0;
}
/* glass 模式下子元素提升层级 */
.promo-banner-preview.style-glass .pb-icon-wrap,
.promo-banner-preview.style-glass .pb-content,
.promo-banner-preview.style-glass .pb-btn,
.promo-banner-preview.style-glass .pb-pulse {
  position: relative;
  z-index: 1;
}

.pb-icon-wrap {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  flex-shrink: 0;
}
.pb-content { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.pb-title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-subtitle { font-size: 11px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-btn { background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.2); padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 600; flex-shrink: 0; }
.promo-banner-preview.style-glass .pb-btn { background: linear-gradient(135deg, #f59e0b, #f97316); border: none; }
.pb-pulse { width: 10px; height: 10px; background: #dc2626; border-radius: 50%; flex-shrink: 0; animation: pb-pulse 1.5s ease infinite; }
@keyframes pb-pulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,0.5); } 70% { box-shadow: 0 0 0 8px rgba(220,38,38,0); } 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0); } }
.promo-banner-empty { padding: 30px; text-align: center; color: #999; font-size: 12px; background: #f5f5f5; }
</style>
