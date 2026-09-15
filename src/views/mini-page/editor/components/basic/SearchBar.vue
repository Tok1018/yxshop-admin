<template>
  <div class="search-bar-preview" :class="{ hero: hero }">
    <div v-if="props.show_city" class="city-btn">
      <MpIcon name="map-pin" :size="12" :color="hero ? '#fff' : '#2563eb'" />
      <span class="city-name">{{ props.city_name || '定位中' }}</span>
      <MpIcon name="chevron-down" :size="9" :color="hero ? 'rgba(255,255,255,0.7)' : '#94a3b8'" />
    </div>
    <div class="search-input" :class="props.style || 'round'">
      <MpIcon name="search" :size="14" color="#94a3b8" />
      <span class="placeholder">{{ props.placeholder || t('mini_page.search_product') }}</span>
      <div v-if="props.show_scan !== false" class="scan-btn">
        <MpIcon name="scan" :size="16" color="#2563eb" />
      </div>
    </div>
    <div v-if="props.show_msg" class="msg-btn">
      <MpIcon name="message" :size="18" :color="hero ? '#fff' : '#94a3b8'" />
      <span v-if="props.msg_dot" class="msg-red-dot"></span>
    </div>
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
.search-bar-preview {
  display: flex;
  align-items: center;
  padding: 6px 12px 7px;
  background: #fff;
}

/* Hero 模式：透明背景 */
.search-bar-preview.hero {
  background: transparent;
}
.search-bar-preview.hero .search-input {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}
.search-bar-preview.hero .msg-red-dot {
  border-color: rgba(30,58,138,0.5);
}
.search-bar-preview.hero .city-name {
  color: #fff;
}

/* 城市定位按钮 */
.city-btn {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  margin-right: 8px;
  max-width: 90px;
}
.city-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

/* 搜索框 */
.search-input {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 7px 12px;
  font-size: 13px;
  flex: 1;
  height: 36px;
}
.search-input.round { border-radius: 18px; }
.search-input.square { border-radius: 6px; }
.placeholder { color: #94a3b8; flex: 1; }
.scan-btn { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; }

/* 消息按钮 */
.msg-btn { position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-left: 8px; }
.msg-red-dot { position: absolute; top: 2px; right: 2px; width: 7px; height: 7px; background: #dc2626; border-radius: 50%; border: 1px solid #fff; }
</style>
