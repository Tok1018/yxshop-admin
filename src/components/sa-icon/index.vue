<template>
  <!-- Iconify 格式（含冒号，如 'bi:camera'） -->
  <template v-if="value && value.indexOf(':') !== -1">
    <Icon :icon="value" class="iconify-icon" :style="{ fontSize: props.size + 'px' }" />
  </template>
  <!-- Arco Design 图标组件名（如 'IconHome'，不含空格） -->
  <template v-else-if="value && /^[A-Za-z][A-Za-z0-9]*$/.test(value)">
    <component :is="value" :size="props.size"></component>
  </template>
  <!-- 不识别的格式（如 'fas fa-video' 等 Font Awesome 类名）→ 安全降级为空占位 -->
  <template v-else>
    <span class="sa-icon-fallback" :style="{ width: props.size + 'px', height: props.size + 'px', display: 'inline-block' }"></span>
  </template>
</template>
  
<script setup>
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue';
const value = ref('')

const props = defineProps({
  icon: { type: String },
  size: { type: Number, default: 24 },
})

watch(
  () => props.icon,
  (vl) => {
    if (vl) {
      value.value = vl
    }
  },
  { immediate: true }
)
</script>
