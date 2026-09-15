<template>
  <div class="search-filter-bar">
    <a-input-search
      v-model="searchValue"
      :placeholder="searchPlaceholder"
      :style="{ width: searchWidth }"
      allow-clear
      @search="handleSearch"
      @clear="handleSearch"
    />
    <a-select
      v-for="filter in filters"
      :key="filter.key"
      v-model="filterValues[filter.key]"
      :placeholder="filter.placeholder"
      :style="{ width: filter.width || '160px' }"
      allow-clear
      @change="handleFilterChange"
    >
      <a-option v-for="opt in filter.options" :key="opt.value" :value="opt.value">{{ opt.label }}</a-option>
    </a-select>
    <a-range-picker
      v-if="showDateRange"
      v-model="dateRange"
      :style="{ width: '260px' }"
      @change="handleDateChange"
    />
    <slot />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  searchPlaceholder: { type: String, default: '搜索关键词...' },
  searchModel: { type: String, default: '' },
  searchWidth: { type: String, default: '240px' },
  filters: { type: Array, default: () => [] },
  showDateRange: { type: Boolean, default: false },
  debounceDelay: { type: Number, default: 400 },
})

const emit = defineEmits(['search', 'filter-change'])

const searchValue = ref(props.searchModel)
const filterValues = ref({})
const dateRange = ref([])
let debounceTimer = null

watch(() => props.searchModel, (val) => { searchValue.value = val })

function handleSearch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('search', { keyword: searchValue.value, ...filterValues.value, dateRange: dateRange.value })
  }, props.debounceDelay)
}

function handleFilterChange() {
  emit('filter-change', { keyword: searchValue.value, ...filterValues.value, dateRange: dateRange.value })
}

function handleDateChange() {
  emit('filter-change', { keyword: searchValue.value, ...filterValues.value, dateRange: dateRange.value })
}

onUnmounted(() => { clearTimeout(debounceTimer) })
</script>

<style scoped>
.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
</style>