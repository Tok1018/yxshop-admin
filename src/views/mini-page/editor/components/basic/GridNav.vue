<template>
  <div class="grid-nav-wrap">
    <div v-if="props.items && props.items.length > 0" class="grid-nav-grid" :style="{ gridTemplateColumns: `repeat(${props.columns || 4}, 1fr)` }">
      <div v-for="(item, i) in props.items" :key="i" class="nav-item">
        <div class="nav-icon" :class="'nav-color-' + (i % 8)">
          <img v-if="item.icon" :src="item.icon" class="nav-icon-img" />
          <MpIcon v-else-if="item.icon_name" :name="item.icon_name" :size="20" :color="iconColors[i % 8]" />
          <span v-else class="nav-icon-fallback">{{ (item.text || '').substring(0, 1) }}</span>
          <span v-if="item.badge" class="nav-hot-tag">{{ item.badge }}</span>
        </div>
        <span class="nav-text">{{ item.text || '-' }}</span>
      </div>
    </div>
    <div v-else class="grid-nav-empty">
      <icon-apps :size="24" style="opacity: 0.3" />
      <span>{{ t('mini_page.grid_nav_empty') }}</span>
    </div>
  </div>
</template>

<script setup>
import { IconApps } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()
defineProps({ props: { type: Object, default: () => ({}) } })

const iconColors = [
  '#1e40af', '#be185d', '#047857', '#b45309',
  '#0369a1', '#6b21a8', '#b91c1c', '#0f766e',
]
</script>

<style scoped>
/* 卡片容器 — 对齐小程序端 grid-nav 样式 */
.grid-nav-wrap {
  background: #fff;
  margin: 6px 12px;
  border-radius: 10px;
  padding: 10px 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.03);
}
.grid-nav-grid { display: grid; gap: 10px 4px; }
.nav-item { display: flex; flex-direction: column; align-items: center; gap: 5px; }
.nav-icon { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; position: relative; }
.nav-icon-img { width: 20px; height: 20px; object-fit: contain; }
.nav-icon-fallback { font-size: 14px; font-weight: 600; color: #94a3b8; }
.nav-hot-tag { position: absolute; top: -4px; right: -6px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 8px; line-height: 1.2; }
.nav-color-0 { background: linear-gradient(145deg, #eff6ff, #dbeafe); }
.nav-color-1 { background: linear-gradient(145deg, #fdf2f8, #fce7f3); }
.nav-color-2 { background: linear-gradient(145deg, #ecfdf5, #d1fae5); }
.nav-color-3 { background: linear-gradient(145deg, #fffbeb, #fef3c7); }
.nav-color-4 { background: linear-gradient(145deg, #f0f9ff, #e0f2fe); }
.nav-color-5 { background: linear-gradient(145deg, #faf5ff, #f3e8ff); }
.nav-color-6 { background: linear-gradient(145deg, #fef2f2, #fee2e2); }
.nav-color-7 { background: linear-gradient(145deg, #f0fdfa, #ccfbf1); }
.nav-text { font-size: 11px; color: #475569; text-align: center; font-weight: 500; }
.grid-nav-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 30px; color: #999; font-size: 12px; }
</style>
