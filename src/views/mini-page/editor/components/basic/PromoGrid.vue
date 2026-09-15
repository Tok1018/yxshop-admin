<template>
  <div class="promo-grid-preview" v-if="compProps.cards && compProps.cards.length">
    <div class="pg-grid" :class="'layout-' + (compProps.layout || 'one_big_two_small')">
      <div
        v-for="(card, i) in compProps.cards"
        :key="i"
        class="pg-card"
        :class="{ 'pg-big': (compProps.layout || 'one_big_two_small') === 'one_big_two_small' && i === 0 }"
        :style="cardStyle(card)"
      >
        <div class="pg-card-body">
          <div class="pg-title">{{ card.title || '卡片标题' }}</div>
          <div class="pg-sub" v-if="card.subtitle">{{ card.subtitle }}</div>
        </div>
        <div class="pg-btn" v-if="card.btn_text">{{ card.btn_text }}</div>
        <span class="pg-deco" v-if="card.icon">{{ card.icon }}</span>
      </div>
    </div>
  </div>
  <div v-else class="promo-grid-empty">
    <span>请添加推广卡片</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ props: { type: Object, default: () => ({}) } })

/** 解包内层 props 数据，避免模板中 props.props.xxx 的命名冲突 */
const compProps = computed(() => props.props || {})
const cardStyle = (card) => {
  const bg1 = card.bg_color1 || '#fef3c7'
  const bg2 = card.bg_color2 || '#fde68a'
  const tc = card.text_color || '#92400e'
  return `background: linear-gradient(135deg, ${bg1}, ${bg2}); color: ${tc};`
}
</script>

<style scoped>
.promo-grid-preview { margin: 6px 12px; }
.pg-grid { display: grid; gap: 10px; }
.pg-grid.layout-one_big_two_small { grid-template-columns: 1.2fr 1fr; }
.pg-grid.layout-two_col { grid-template-columns: 1fr 1fr; }
.pg-grid.layout-three_col { grid-template-columns: 1fr 1fr 1fr; }
.pg-card { border-radius: 14px; padding: 14px; position: relative; overflow: hidden; min-height: 90px; display: flex; flex-direction: column; justify-content: space-between; }
.pg-big { grid-row: span 2; min-height: 190px; }
.pg-title { font-size: 14px; font-weight: 700; }
.pg-sub { font-size: 11px; margin-top: 3px; opacity: 0.85; }
.pg-btn { display: inline-flex; background: rgba(255,255,255,0.6); padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; width: fit-content; }
.pg-deco { position: absolute; right: -10px; bottom: -10px; font-size: 48px; opacity: 0.12; }
.promo-grid-empty { padding: 30px; text-align: center; color: #999; font-size: 12px; background: #f5f5f5; }
</style>
