<template>
  <div class="canvas-area">
    <div class="phone-frame">
      <div class="phone-status-bar">
        <span class="status-time">9:41</span>
        <div class="status-icons">
          <icon-signal />
          <icon-wifi />
          <icon-battery />
        </div>
      </div>
      <div class="phone-body">
        <!-- Hero 渐变区 -->
        <div
          v-if="heroList.length"
          class="hero-zone"
          :style="{ background: heroGradient }"
        >
          <div class="hero-deco-1"></div>
          <div class="hero-deco-2"></div>
          <div class="hero-inner">
            <draggable
              :list="heroList"
              group="components"
              item-key="component_id"
              class="canvas-list hero-list"
              @change="onHeroChange"
              @end="onDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="canvas-component hero-component"
                  :class="{ selected: element.component_id === selectedComponentId }"
                  @click.stop="selectComponent(element.component_id)"
                >
                  <div class="component-inner" :style="styleToCss(element.props && element.props._style)">
                    <component
                      v-if="getRegistry(element.component_type)"
                      :is="getRegistry(element.component_type).renderer"
                      :props="element.props"
                      :hero="true"
                    />
                    <div v-else class="unknown-component">{{ element.component_type }}</div>
                  </div>
                  <div v-if="element.component_id === selectedComponentId" class="component-actions">
                    <a-button size="mini" status="danger" @click.stop="deleteComponent(element.component_id)">
                      <template #icon><icon-delete /></template>
                    </a-button>
                  </div>
                  <div v-if="element.component_id === selectedComponentId" class="component-border"></div>
                </div>
              </template>
            </draggable>
          </div>
        </div>

        <!-- 内容区（白色圆角顶部） -->
        <div class="content-body">
          <draggable
            :list="bodyList"
            group="components"
            item-key="component_id"
            class="canvas-list body-list"
            @change="onBodyChange"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <div
                class="canvas-component"
                :class="{ selected: element.component_id === selectedComponentId }"
                @click.stop="selectComponent(element.component_id)"
              >
                <div class="component-inner" :style="styleToCss(element.props && element.props._style)">
                  <component
                    v-if="getRegistry(element.component_type)"
                    :is="getRegistry(element.component_type).renderer"
                    :props="element.props"
                  />
                  <div v-else class="unknown-component">{{ element.component_type }}</div>
                </div>
                <div v-if="element.component_id === selectedComponentId" class="component-actions">
                  <a-button size="mini" status="danger" @click.stop="deleteComponent(element.component_id)">
                    <template #icon><icon-delete /></template>
                  </a-button>
                </div>
                <div v-if="element.component_id === selectedComponentId" class="component-border"></div>
              </div>
            </template>
          </draggable>
          <div v-if="heroList.length === 0 && bodyList.length === 0" class="canvas-empty">
            <icon-drag-dot-vertical :size="24" style="opacity: 0.3" />
            <span>{{ t('mini_page.canvas_empty') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconDelete, IconDragDotVertical } from '@arco-design/web-vue/es/icon'
import draggable from 'vuedraggable'
import { componentRegistry } from './registry'
import { styleToCss } from './styleHelper'

const { t } = useI18n()

const props = defineProps({
  pageData: { type: Array, default: () => [] },
  selectedComponentId: { type: String, default: null }
})

const emit = defineEmits(['select', 'delete', 'sort-change'])

const heroList = ref([])
const bodyList = ref([])

const getRegistry = (type) => componentRegistry[type] || null
const selectComponent = (id) => { emit('select', id) }
const deleteComponent = (id) => { emit('delete', id) }

/**
 * 将组件列表拆分为 hero 区和 body 区
 * 规则与小程序端 home.js splitHeroBody 一致：
 *  - search_bar / notice_bar → hero 区（标记 _hero）
 *  - promo_banner(style=glass) → hero 区
 *  - 其他 → body 区，且一旦进入 body 区不再回到 hero
 */
function splitHeroBody(list) {
  const hero = []
  const body = []
  let heroEnded = false
  for (const c of list) {
    if (!heroEnded) {
      if (c.component_type === 'search_bar' || c.component_type === 'notice_bar') {
        hero.push({ ...c, props: { ...c.props, _hero: true } })
      } else if (c.component_type === 'promo_banner' && c.props && c.props.style === 'glass') {
        hero.push(c)
      } else {
        heroEnded = true
        body.push(c)
      }
    } else {
      body.push(c)
    }
  }
  return { hero, body }
}

/** 将 hero/body 合并回完整列表，保持 sort 递增 */
function mergeLists() {
  const combined = [...heroList.value, ...bodyList.value]
  return combined.map((item, index) => ({ ...item, sort: index }))
}

const heroGradient = computed(() => {
  // 默认蓝色渐变，与小程序端一致
  return 'linear-gradient(160deg, #1e3a8a 0%, #2563eb 45%, #3b82f6 100%)'
})

watch(() => props.pageData, (val) => {
  const { hero, body } = splitHeroBody([...val])
  heroList.value = hero
  bodyList.value = body
}, { deep: true, immediate: true })

const onHeroChange = () => { emit('sort-change', mergeLists()) }
const onBodyChange = () => { emit('sort-change', mergeLists()) }
const onDragEnd = () => { emit('sort-change', mergeLists()) }
</script>

<style scoped>
.canvas-area { display: flex; justify-content: center; padding: 16px 0; }
.phone-frame { width: 375px; height: 667px; background: #fff; border-radius: 28px; border: 4px solid #1a1a1a; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.15); flex-shrink: 0; }
.phone-status-bar { height: 36px; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; background: #1e3a8a; flex-shrink: 0; }
.status-time { font-size: 14px; font-weight: 600; color: #fff; }
.status-icons { display: flex; gap: 4px; color: #fff; }
.phone-body { flex: 1; overflow-y: auto; background: #f5f7fa; position: relative; }
.canvas-list { min-height: 100%; }

/* Hero 渐变区 */
.hero-zone { position: relative; overflow: hidden; padding-bottom: 16px; }
.hero-deco-1 { position: absolute; top: -40px; right: -30px; width: 200px; height: 200px; background: rgba(255,255,255,0.06); border-radius: 50%; pointer-events: none; }
.hero-deco-2 { position: absolute; bottom: 30px; left: -60px; width: 160px; height: 160px; background: rgba(255,255,255,0.04); border-radius: 50%; pointer-events: none; }
.hero-inner { position: relative; z-index: 2; }
.hero-list { min-height: 60px; }

/* 内容区（白色圆角顶部） */
.content-body { background: #f5f7fa; border-radius: 16px 16px 0 0; margin-top: -8px; position: relative; z-index: 3; padding-top: 2px; min-height: 100px; }
.body-list { min-height: 80px; }

.canvas-component { position: relative; cursor: pointer; transition: box-shadow 0.15s; }
.canvas-component:hover { box-shadow: inset 0 0 0 1px rgba(22,93,255,0.3); }
.component-border { position: absolute; inset: 0; border: 2px solid rgb(var(--arcoblue-6)); pointer-events: none; z-index: 10; }
.component-actions { position: absolute; top: -8px; right: -8px; z-index: 11; }
.unknown-component { padding: 20px; text-align: center; color: #999; font-size: 12px; background: #f0f0f0; }
.canvas-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 80px 20px; color: #999; font-size: 13px; }
</style>
