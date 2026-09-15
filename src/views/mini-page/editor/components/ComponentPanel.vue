<template>
  <div class="component-panel">
    <div class="panel-title">{{ t('mini_page.component_panel_title') }}</div>
    <div v-for="group in groups" :key="group.key" class="component-group">
      <div class="group-label">{{ group.label }}</div>
      <draggable
        :list="group.items"
        :group="{ name: 'components', pull: 'clone', put: false }"
        :clone="cloneItem"
        item-key="component_type"
        :sort="false"
        class="component-list"
      >
        <template #item="{ element }">
          <div class="component-item" :title="element.name">
            <div class="component-icon" :style="{ background: iconBgMap[element.component_type] || '#f1f5f9' }">
              <MpIcon :name="iconMap[element.component_type] || 'grid'" :size="18" :color="iconColorMap[element.component_type] || '#64748b'" />
            </div>
            <span class="component-name">{{ element.name }}</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import draggable from 'vuedraggable'
import { componentRegistry } from './registry'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()

const props = defineProps({
  schemas: { type: Array, default: () => [] }
})

const groupConfig = [
  { key: 'basic', labelKey: 'mini_page.group_basic' },
  { key: 'commerce', labelKey: 'mini_page.group_commerce' },
  { key: 'marketing', labelKey: 'mini_page.group_marketing' }
]

// 每个组件对应的图标名称
const iconMap = {
  search_bar: 'search',
  swiper: 'layers',
  notice_bar: 'volume',
  rich_text: 'file-text',
  image_ad: 'grid',
  grid_nav: 'smartphone',
  product_list: 'package',
  coupon: 'ticket',
  seckill: 'zap',
  group_buy: 'users',
  coupon_receive: 'gift',
  point_exchange: 'trophy',
  promo_banner: 'tag',
  promo_grid: 'star',
  brand_zone: 'crown',
}

// 每个组件图标的颜色
const iconColorMap = {
  search_bar: '#2563eb',
  swiper: '#0369a1',
  notice_bar: '#f59e0b',
  rich_text: '#6b21a8',
  image_ad: '#047857',
  grid_nav: '#1e40af',
  product_list: '#b45309',
  coupon: '#dc2626',
  seckill: '#dc2626',
  group_buy: '#0f766e',
  coupon_receive: '#be185d',
  point_exchange: '#b45309',
  promo_banner: '#2563eb',
  promo_grid: '#c2410c',
  brand_zone: '#6b21a8',
}

// 图标背景色（浅色系，与图标颜色对应）
const iconBgMap = {
  search_bar: '#eff6ff',
  swiper: '#e0f2fe',
  notice_bar: '#fffbeb',
  rich_text: '#faf5ff',
  image_ad: '#ecfdf5',
  grid_nav: '#eff6ff',
  product_list: '#fffbeb',
  coupon: '#fef2f2',
  seckill: '#fef2f2',
  group_buy: '#f0fdfa',
  coupon_receive: '#fdf2f8',
  point_exchange: '#fff7ed',
  promo_banner: '#eff6ff',
  promo_grid: '#fff7ed',
  brand_zone: '#faf5ff',
}

const groups = computed(() => {
  return groupConfig.map(g => ({
    key: g.key,
    label: t(g.labelKey),
    items: Object.entries(componentRegistry)
      .filter(([, val]) => val.category === g.key)
      .map(([type, val]) => ({ component_type: type, name: val.name }))
  }))
})

const cloneItem = (item) => {
  const reg = componentRegistry[item.component_type]
  return {
    component_id: 'comp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    component_type: item.component_type,
    sort: 0,
    props: reg ? JSON.parse(JSON.stringify(reg.defaultProps)) : {},
    is_visible: true
  }
}
</script>

<style scoped>
.component-panel { padding: 12px; }
.panel-title { font-size: 14px; font-weight: 600; color: var(--color-on-surface); margin-bottom: 16px; }
.component-group { margin-bottom: 16px; }
.group-label { font-size: 12px; color: var(--color-on-surface-variant); font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
.component-list { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.component-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 10px 4px; background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-md); cursor: grab; transition: all 0.2s; user-select: none; }
.component-item:hover { border-color: var(--color-secondary); background: var(--color-surface-container-low); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.component-item:active { cursor: grabbing; }
.component-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.component-name { font-size: 11px; color: var(--color-on-surface-variant); text-align: center; line-height: 1.3; }
</style>
