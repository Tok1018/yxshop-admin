<template>
  <div class="page-content">
    <div class="page-header"><div><h1 class="page-title">{{ t('file_logs.title') }}</h1><p class="page-subtitle">{{ t('file_logs.subtitle') }}</p></div></div>
    <div class="filter-bar">
      <div class="search-box"><IconSearch /><input v-model="filters.keyword" :placeholder="t('file_logs.search_placeholder')" :aria-label="t('file_logs.search_placeholder')" @input="debouncedSearch" /></div>
    </div>
    <div class="table-card">
      <table class="data-table">
        <thead><tr><th class="col-id">{{ t('file_logs.col_id') }}</th><th class="col-file">{{ t('file_logs.col_file') }}</th><th class="col-action">{{ t('file_logs.col_action') }}</th><th class="col-user">{{ t('file_logs.col_user') }}</th><th class="col-time">{{ t('file_logs.col_time') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="mono muted">{{ r.id }}</td>
            <td><div class="file-cell"><IconFile /><span class="file-name">{{ r.file_name || '-' }}</span></div></td>
            <td><span :class="actionBadgeClass(r.action)">{{ getActionLabel(r.action) }}</span></td>
            <td class="mono muted">{{ r.user_id ? t('file_logs.user') + ' #' + r.user_id : t('file_logs.system') }}</td>
            <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
          </tr>
          <tr v-if="showListEmpty"><td colspan="5" class="empty-row"><div class="empty-state"><IconFile :size="36" /><span>{{ t('file_logs.empty') }}</span></div></td></tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0"><span class="total-text">{{ t('file_logs.total', { total }) }}</span><a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" /></div>
  </div>
</template>
<script setup>
import { Message } from '@arco-design/web-vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getFileLogsList } from '@/api/file_logs'
import { IconSearch, IconFile } from '@arco-design/web-vue/es/icon'
const { t } = useI18n()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '' })
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (p) => { page.value = p; loadData() }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const getActionLabel = (a) => ({ upload: t('file_logs.action_upload'), download: t('file_logs.action_download'), delete: t('file_logs.action_delete') }[a] || a || '-')
const actionBadgeClass = (a) => ({ upload: 'badge-success', download: 'badge-info', delete: 'badge-error' }[a] || 'badge-secondary')
const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k]===''||params[k]===undefined||params[k]===null) delete params[k] }); const res = await getFileLogsList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('file_logs.operation_failed')) } finally { loading.value = false } }
onMounted(() => loadData())
</script>
<style scoped>
.page-content { position: relative; height: 100%; display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
.table-card { flex: 1; min-height: 0; z-index: 1; }

</style>
