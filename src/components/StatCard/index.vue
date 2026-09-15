<template>
  <div class="stat-card" :class="[`stat-card--${glow}`]">
    <div class="stat-card__header">
      <span class="stat-card__title">{{ title }}</span>
      <span v-if="prefix" class="stat-card__prefix">{{ prefix }}</span>
    </div>
    <div class="stat-card__value">
      <span class="stat-card__number">{{ displayValue }}</span>
      <span v-if="trend !== null && trend !== undefined" class="stat-card__trend" :class="trendClass">
        <icon-arrow-rise v-if="trend > 0" />
        <icon-arrow-fall v-if="trend < 0" />
        {{ Math.abs(trend) }}%
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { IconArrowRise, IconArrowFall } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  title: { type: String, default: '' },
  value: { type: [Number, String], default: 0 },
  prefix: { type: String, default: '' },
  icon: { type: String, default: '' },
  glow: { type: String, default: 'indigo' },
  trend: { type: Number, default: undefined },
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

const trendClass = computed(() => {
  if (props.trend > 0) return 'stat-card__trend--up'
  if (props.trend < 0) return 'stat-card__trend--down'
  return ''
})
</script>

<style scoped>
.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border-2);
  transition: box-shadow 0.2s;
}
.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.stat-card--indigo { border-left: 3px solid #165dff; }
.stat-card--emerald { border-left: 3px solid #00b42a; }
.stat-card--violet { border-left: 3px solid #722ed1; }
.stat-card--amber { border-left: 3px solid #ff7d00; }
.stat-card--cyan { border-left: 3px solid #0fc6c2; }
.stat-card--rose { border-left: 3px solid #f53f3f; }
.stat-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.stat-card__title {
  font-size: 13px;
  color: var(--color-text-2);
}
.stat-card__prefix {
  font-size: 12px;
  color: var(--color-text-3);
}
.stat-card__value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.stat-card__number {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1);
  line-height: 1.2;
}
.stat-card__trend {
  font-size: 13px;
  font-weight: 500;
}
.stat-card__trend--up {
  color: #00b42a;
}
.stat-card__trend--down {
  color: #f53f3f;
}
</style>