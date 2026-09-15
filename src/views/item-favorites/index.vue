<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('item_favorites.title') }}</h1>
        <p class="page-subtitle">{{ t('item_favorites.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('item_favorites.search_placeholder')" :aria-label="t('item_favorites.search_placeholder')" @input="debouncedSearch" /></div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-id">{{ t('item_favorites.col_id') }}</th><th class="col-user">{{ t('item_favorites.col_user') }}</th><th class="col-item">{{ t('item_favorites.col_item') }}</th><th class="col-price">{{ t('item_favorites.col_price') }}</th><th class="col-time">{{ t('item_favorites.col_time') }}</th></tr></thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="mono muted">{{ r.id }}</td>
              <td><div class="user-cell"><div class="user-avatar">{{ (r.user_id || '?')[0]?.toUpperCase() }}</div><span class="mono">{{ r.user_id ? t('item_favorites.user') + ' #' + r.user_id : t('item_favorites.guest') }}</span></div></td>
              <td><div class="item-cell"><div class="item-icon"><icon-heart :size="14" /></div><div class="item-info"><span class="item-id mono">{{ t('item_favorites.item') }} #{{ r.item_id }}</span><span class="item-name" v-if="r.item_name">{{ r.item_name }}</span></div></div></td>
              <td class="mono" v-if="r.price">¥{{ Number(r.price).toFixed(2) }}</td>
              <td class="mono muted" v-else>-</td>
              <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="5" class="empty-row"><div class="empty-state"><icon-heart :size="36" class="empty-icon" /><span class="empty-text">{{ t('item_favorites.empty') }}</span></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('item_favorites.total', { total }) }}</span>
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
import { IconSearch, IconHeart } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getItemFavoritesList } from '@/api/item_favorites'
const { t } = useI18n()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '' })
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (newPage) => { page.value = newPage; loadData() }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k]===''||params[k]===undefined||params[k]===null) delete params[k] }); const res = await getItemFavoritesList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('item_favorites.operation_failed')) } finally { loading.value = false } }
onMounted(() => loadData())
</script>
<style scoped>

.col-id { padding-left: 20px; width: 100px; }
.col-user, .col-item, .col-price, .col-time { text-align: center; }

.user-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
.user-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--color-error-rgb), 0.1); color: var(--color-error); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.item-cell { display: flex; align-items: center; gap: 10px; justify-content: center; }
.item-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(var(--color-error-rgb), 0.1); color: var(--color-error); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.item-info { display: flex; flex-direction: column; gap: 2px; text-align: left; }
.item-id { font-size: 12px; color: var(--color-on-surface-variant); }
.item-name { font-size: 13px; color: var(--color-on-surface); font-weight: 500; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
