<template>
  <!-- 系统品牌模式：拉取真实数据预览 -->
  <div class="brand-zone-preview" v-if="compProps.source_type === 'system'">
    <div class="bz-header">
      <span class="bz-title">{{ compProps.title || '品牌专区' }}</span>
      <span class="bz-more" v-if="compProps.more_text">{{ compProps.more_text }} ›</span>
    </div>
    <div class="bz-grid" :style="{ gridTemplateColumns: `repeat(${compProps.columns || 4}, 1fr)` }">
      <template v-if="brands.length">
        <div v-for="(item, i) in brands" :key="i" class="bz-item">
          <img v-if="item.logo" :src="item.logo" class="bz-logo" />
          <span v-else class="bz-name">{{ item.name || '品牌' }}</span>
        </div>
      </template>
      <template v-else>
        <div v-for="i in (compProps.limit || 8)" :key="i" class="bz-item bz-placeholder">
          <span class="bz-placeholder-text">品牌</span>
        </div>
      </template>
    </div>
    <div class="system-tag">系统品牌 · {{ compProps.is_hot ? '热门' : '全部' }} · {{ brands.length || (compProps.limit || 8) }}个</div>
  </div>

  <!-- 自定义模式 -->
  <div class="brand-zone-preview" v-else-if="compProps.items && compProps.items.length">
    <div class="bz-header">
      <span class="bz-title">{{ compProps.title || '品牌专区' }}</span>
      <span class="bz-more" v-if="compProps.more_text">{{ compProps.more_text }} ›</span>
    </div>
    <div class="bz-grid" :style="{ gridTemplateColumns: `repeat(${compProps.columns || 4}, 1fr)` }">
      <div v-for="(item, i) in compProps.items" :key="i" class="bz-item">
        <img v-if="item.logo" :src="item.logo" class="bz-logo" />
        <span v-else class="bz-name">{{ item.name || '品牌' }}</span>
      </div>
    </div>
  </div>

  <!-- 自定义模式但无数据 -->
  <div v-else class="brand-zone-empty">
    <span>请添加品牌</span>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getBrandList } from '@/api/brand'

const props = defineProps({ props: { type: Object, default: () => ({}) } })

/** 解包内层 props 数据，避免模板中 props.props.xxx 的命名冲突 */
const compProps = computed(() => props.props || {})

const brands = ref([])

const fetchBrands = async () => {
  if (compProps.value.source_type !== 'system') return
  try {
    const params = { page: 1, page_size: compProps.value.limit || 8 }
    if (compProps.value.is_hot) params.is_hot = 1
    const res = await getBrandList(params)
    const data = res?.data
    const list = data?.list || data?.data || data || []
    brands.value = Array.isArray(list) ? list.slice(0, compProps.value.limit || 8) : []
  } catch (e) {
    brands.value = []
  }
}

watch(() => [compProps.value.source_type, compProps.value.is_hot, compProps.value.limit], () => {
  if (compProps.value.source_type === 'system') fetchBrands()
  else brands.value = []
}, { immediate: false })

onMounted(() => {
  if (compProps.value.source_type !== 'custom') fetchBrands()
})
</script>

<style scoped>
.brand-zone-preview { margin: 6px 12px; background: #fff; border-radius: 16px; padding: 14px; position: relative; }
.bz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.bz-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.bz-more { font-size: 12px; color: #94a3b8; }
.bz-grid { display: grid; gap: 8px; }
.bz-item { background: #f1f5f9; border-radius: 10px; height: 48px; display: flex; align-items: center; justify-content: center; }
.bz-logo { width: 80%; height: 28px; object-fit: contain; }
.bz-name { font-size: 14px; font-weight: 700; color: #475569; letter-spacing: -0.5px; }
.bz-placeholder { opacity: 0.5; }
.bz-placeholder-text { font-size: 12px; color: #94a3b8; }
.system-tag { position: absolute; top: 4px; right: 8px; font-size: 10px; color: #2563eb; background: rgba(37,99,235,0.08); padding: 2px 6px; border-radius: 4px; }
.brand-zone-empty { padding: 30px; text-align: center; color: #999; font-size: 12px; background: #f5f5f5; }
</style>
