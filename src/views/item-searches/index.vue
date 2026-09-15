<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('item_searches.title') }}</h1>
        <p class="page-subtitle">{{ t('item_searches.subtitle') }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('item_searches.search_placeholder')" :aria-label="t('item_searches.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.user_id" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('item_searches.user_all') }}</option>
        <option value="0">{{ t('item_searches.guest') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-id">{{ t('item_searches.col_id') }}</th>
              <th class="col-kw">{{ t('item_searches.col_keyword') }}</th>
              <th class="col-user">{{ t('item_searches.col_user') }}</th>
              <th class="col-count">{{ t('item_searches.col_count') }}</th>
              <th class="col-time">{{ t('item_searches.col_time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="mono muted">{{ r.id }}</td>
              <td>
                <div class="kw-cell">
                  <icon-search :size="13" />
                  <span class="kw-text">{{ r.keyword || '-' }}</span>
                </div>
              </td>
              <td class="mono">{{ r.user_id ? t('item_searches.user') + ' #' + r.user_id : t('item_searches.guest') }}</td>
              <td class="mono">{{ r.result_count ?? 0 }}</td>
              <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <icon-search :size="36" class="empty-icon" />
                  <span class="empty-text">{{ t('item_searches.empty') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('item_searches.total', { total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getItemSearchesList } from '@/api/item_searches'
const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '', user_id: '' })

const showListEmpty = computed(() => !list.value.length && !loading.value)
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getItemSearchesList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('item_searches.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>

.col-id {
  padding-left: 20px;
  width: 100px;
}

.col-kw {
  min-width: 180px;
}

.col-user, .col-count, .col-time {
  text-align: center;
}

.kw-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-secondary);
}

.kw-text {
  font-size: 13px;
  color: var(--color-on-surface);
  font-weight: 500;
}
</style>
