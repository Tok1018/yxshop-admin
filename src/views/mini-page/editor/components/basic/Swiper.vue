<template>
  <div class="swiper-preview">
    <div class="swiper-container">
      <!-- 有图片时展示第一张 -->
      <div v-if="validImages.length > 0" class="swiper-slide">
        <img :src="validImages[0].url || validImages[0].image || validImages[0]" alt="" class="slide-image" />
      </div>
      <!-- 无图片时展示蓝色渐变占位 Banner -->
      <div v-else class="swiper-placeholder">
        <div class="placeholder-inner">
          <div class="placeholder-title">企业采购节 · 预热</div>
          <div class="placeholder-sub">满 10000 减 800 · 认证再享 95 折</div>
          <div class="placeholder-tag">立即抢购</div>
        </div>
        <div class="placeholder-deco"></div>
      </div>
      <div v-if="compProps.indicator_dots" class="swiper-dots">
        <span v-for="(_, i) in validImages" :key="i" class="dot" :class="{ active: i === 0 }"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({ props: { type: Object, default: () => ({}) } })

/** 解包内层 props 数据，避免模板中 props.props.xxx 的命名冲突 */
const compProps = computed(() => props.props || {})

// 过滤掉 URL 为空的图片，与小程序端逻辑一致
const validImages = computed(() => {
  if (!compProps.value.images) return []
  return compProps.value.images.filter(img => img && (img.url || img.image))
})
</script>

<style scoped>
.swiper-preview { background: transparent; padding: 6px 12px; }
.swiper-container { position: relative; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }
.swiper-slide { width: 100%; }
.slide-image { width: 100%; height: 160px; object-fit: cover; display: block; }

/* 蓝色渐变占位 Banner */
.swiper-placeholder {
  height: 160px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
  overflow: hidden;
}
.placeholder-inner { display: flex; flex-direction: column; z-index: 2; }
.placeholder-title { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
.placeholder-sub { font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 6px; }
.placeholder-tag {
  margin-top: 10px;
  background: rgba(255,255,255,0.2);
  padding: 5px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.25);
  font-size: 12px;
  color: #fff;
  font-weight: 600;
  width: fit-content;
}
.placeholder-deco { position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.06); border-radius: 50%; }

.swiper-dots { position: absolute; bottom: 8px; left: 16px; display: flex; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.35); }
.dot.active { background: #fff; width: 12px; border-radius: 6px; }
</style>
