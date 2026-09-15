<template>
  <div class="puzzle-captcha">
    <div class="captcha-header">
      <span class="captcha-title">{{ t('sys.login.puzzleTitle') }}</span>
      <button class="refresh-btn" @click="refresh" :disabled="loading">
        <icon-refresh :spin="loading" />
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="captcha-loading" :style="{ width: data.bg_width + 'px', height: data.bg_height + 'px' }">
      <a-spin :size="28" />
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="captcha-error" :style="{ width: data.bg_width + 'px', height: data.bg_height + 'px' }">
      <icon-close-circle-fill style="font-size: 28px; color: var(--color-danger)" />
      <span class="error-text">{{ t('sys.login.puzzleLoadFailed') }}</span>
      <button class="retry-btn" @click="refresh">{{ t('sys.login.puzzleRetry') }}</button>
    </div>

    <!-- 正常显示 -->
    <template v-else>
      <!-- 验证成功遮罩（自动淡出） -->
      <transition name="success-fade">
        <div v-if="showSuccessOverlay" class="captcha-success-overlay" :style="{ width: data.bg_width + 'px', height: (data.bg_height + 48) + 'px' }">
          <div class="success-content">
            <icon-check-circle-fill style="font-size: 36px; color: var(--color-success, #00b42a)" />
            <span class="success-text">{{ t('sys.login.puzzleSuccess') }}</span>
          </div>
        </div>
      </transition>

      <div class="captcha-container" ref="containerRef" :class="{ 'captcha-verified': verified }">
        <!-- 背景图区域 -->
        <div class="captcha-bg" :style="{ width: data.bg_width + 'px', height: data.bg_height + 'px' }">
          <img v-if="data.bg_image" :src="data.bg_image" class="bg-img" alt="captcha bg" draggable="false" />

          <!-- 滑块 -->
          <div
            v-if="data.slider_image"
            class="captcha-slider"
            :class="{ dragging: isDragging }"
            :style="{
              left: sliderLeft + 'px',
              top: (data.target_y || 0) + 'px',
              width: data.slider_size + 'px',
              height: data.slider_size + 'px'
            }"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <img :src="data.slider_image" class="slider-img" alt="slider" draggable="false" />
          </div>
        </div>

        <!-- 滑动轨道 -->
        <div class="captcha-track" :style="{ width: data.bg_width + 'px' }">
          <div class="track-bg" :class="{ 'track-bg-success': verified }">
            <span v-if="sliderLeft === 0 && !verified" class="track-hint">{{ t('sys.login.puzzleDragHint') }}</span>
            <span v-else-if="verified" class="track-success-text">{{ t('sys.login.puzzleSuccess') }}</span>
          </div>
          <div class="track-fill" :class="{ 'track-fill-success': verified }" :style="{ width: sliderLeft + 'px' }"></div>
          <div
            class="track-handle"
            :class="{ dragging: isDragging, 'track-handle-success': verified }"
            :style="{ left: sliderLeft + 'px' }"
            @mousedown="startDrag"
            @touchstart="startDrag"
          >
            <icon-right v-if="!isDragging && sliderLeft === 0 && !verified" />
            <icon-double-right v-else-if="isDragging" />
            <icon-check v-else />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  IconRefresh,
  IconRight,
  IconDoubleRight,
  IconCheck,
  IconCheckCircleFill,
  IconCloseCircleFill,
} from '@arco-design/web-vue/es/icon'
import { request } from '@/utils/request'

const { t } = useI18n()

const emit = defineEmits(['ready', 'drag-end'])

const containerRef = ref(null)
const isDragging = ref(false)
const verified = ref(false)
const showSuccessOverlay = ref(false)
const loading = ref(false)
const loadError = ref(false)
const sliderLeft = ref(0)
const startX = ref(0)
const startLeft = ref(0)
const maxX = ref(260)

const data = ref({
  uuid: '',
  bg_image: '',
  slider_image: '',
  slider_size: 40,
  bg_width: 300,
  bg_height: 150,
  target_y: 0,
})

const generate = async () => {
  loading.value = true
  loadError.value = false
  sliderLeft.value = 0
  isDragging.value = false
  verified.value = false
  showSuccessOverlay.value = false

  try {
    const res = await request({ url: '/admin/api/captcha/puzzle', method: 'get' })
    if (res.code === 0 && res.data) {
      data.value = res.data
      maxX.value = res.data.bg_width - res.data.slider_size - 4
      emit('ready', { uuid: res.data.uuid })
    } else {
      loadError.value = true
    }
  } catch (e) {
    loadError.value = true
  } finally {
    loading.value = false
  }
}

const refresh = () => {
  generate()
}

const startDrag = (e) => {
  if (loading.value || loadError.value) return
  e.preventDefault()
  e.stopPropagation()

  isDragging.value = true
  startX.value = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX
  startLeft.value = sliderLeft.value

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
  if (!isDragging.value) return
  e.preventDefault()

  const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX
  const deltaX = currentX - startX.value
  let newLeft = startLeft.value + deltaX

  if (newLeft < 0) newLeft = 0
  if (newLeft > maxX.value) newLeft = maxX.value

  sliderLeft.value = newLeft
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)

  if (sliderLeft.value > 0) {
    verified.value = true
    showSuccessOverlay.value = true
    emit('drag-end', { uuid: data.value.uuid, x: sliderLeft.value })

    // 1.5秒后自动隐藏遮罩层，保留轨道成功状态
    setTimeout(() => {
      showSuccessOverlay.value = false
    }, 1500)
  }
}

onMounted(() => {
  generate()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})

defineExpose({
  refresh,
  getData: () => ({ uuid: data.value.uuid, x: Math.round(sliderLeft.value) }),
})
</script>

<style scoped>
.puzzle-captcha {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 300px;
  margin-bottom: 4px;
}

.captcha-title {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  font-weight: 500;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-on-surface-variant);
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.refresh-btn:hover {
  color: var(--color-primary);
  background: var(--color-surface-container-low);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.captcha-loading,
.captcha-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-low);
}

.error-text {
  font-size: 12px;
  color: var(--color-on-surface-variant);
}

.retry-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: var(--color-primary);
  color: var(--color-on-primary);
}

.captcha-container {
  position: relative;
}

.captcha-container.captcha-verified {
  opacity: 0.85;
}

.captcha-success-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(0, 180, 42, 0.08);
}

.success-fade-enter-active {
  transition: opacity 0.3s ease;
}
.success-fade-leave-active {
  transition: opacity 0.5s ease;
}
.success-fade-enter-from,
.success-fade-leave-to {
  opacity: 0;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.success-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success, #00b42a);
}

.track-bg-success {
  background: rgba(0, 180, 42, 0.1) !important;
  border-color: var(--color-success, #00b42a) !important;
}

.track-fill-success {
  background: rgba(0, 180, 42, 0.2) !important;
}

.track-success-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success, #00b42a);
  letter-spacing: 0.05em;
}

.track-handle-success {
  background: var(--color-success, #00b42a) !important;
}

.captcha-bg {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-low);
}

.bg-img {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.captcha-slider {
  position: absolute;
  cursor: grab;
  user-select: none;
  transition: box-shadow 0.2s, filter 0.2s;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.captcha-slider.dragging {
  cursor: grabbing;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.captcha-slider:active {
  cursor: grabbing;
}

.slider-img {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
}

.captcha-track {
  position: relative;
  height: 40px;
  margin-top: 8px;
  display: flex;
  align-items: center;
}

.track-bg {
  position: absolute;
  left: 0;
  right: 0;
  height: 36px;
  background: var(--color-surface-container-low);
  border: 1px solid var(--color-outline-variant);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.track-hint {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.05em;
}

.track-fill {
  position: absolute;
  left: 0;
  height: 36px;
  background: rgba(24, 144, 255, 0.15);
  border-radius: 18px 0 0 18px;
  pointer-events: none;
}

.track-handle {
  position: absolute;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary, #1890ff);
  color: var(--color-on-primary, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.1s;
  transform: translateX(-50%);
}

.track-handle.dragging {
  cursor: grabbing;
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
