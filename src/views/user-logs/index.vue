<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_logs.title') }}</h1>
        <p class="page-subtitle">{{ t('user_logs.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('user_logs.search_placeholder')" :aria-label="t('user_logs.search_placeholder')" @input="debouncedSearch" /></div>
      <select v-model="filters.action" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('user_logs.filter_all_type') }}</option>
        <option value="login">{{ t('user_logs.filter_login') }}</option>
        <option value="logout">{{ t('user_logs.filter_logout') }}</option>
        <option value="order">{{ t('user_logs.filter_order') }}</option>
        <option value="payment">{{ t('user_logs.filter_payment') }}</option>
      </select>
    </div>
    <div class="table-card card-shadow">
      <table class="data-table">
        <thead><tr><th class="col-id">{{ t('user_logs.th_id') }}</th><th class="col-user">{{ t('user_logs.th_user') }}</th><th class="col-action">{{ t('user_logs.th_action') }}</th><th class="col-detail">{{ t('user_logs.th_detail') }}</th><th class="col-ip">{{ t('user_logs.th_ip') }}</th><th class="col-time">{{ t('user_logs.th_time') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="mono muted">{{ r.id }}</td>
            <td><div class="user-cell"><div class="user-avatar">{{ (r.user?.nickname || r.user_id || '?')[0]?.toUpperCase() }}</div><span class="user-link" v-if="r.user_id" @click="$router.push({ path: '/user/detail/' + r.user_id })">{{ r.user?.nickname || t('user_logs.user_prefix', { id: r.user_id }) }}</span><span v-else>{{ t('user_logs.system') }}</span></div></td>
            <td><span :class="getActionBadgeClass(r.action)">{{ r.action || '-' }}</span></td>
            <td class="detail-cell" :title="r.description">{{ r.description || '-' }}</td>
            <td class="mono muted">{{ r.ip || '-' }}</td>
            <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
          </tr>
          <tr v-if="showListEmpty"><td colspan="6" class="empty-row"><div class="empty-state"><icon-file :size="36" /><span>{{ t('user_logs.empty_data') }}</span></div></td></tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0"><span class="total-text">{{ t('user_logs.total_count', { n: total }) }}</span><a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" /></div>
  </div>
</template>
<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconFile } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getUserLogsList } from '@/api/user_logs'
const { t } = useI18n()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '', action: '' })
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const onPageChange = (p) => { page.value = p; loadData() }
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
const getActionBadgeClass = (a) => ({ login: 'badge-info', logout: 'badge-secondary', order: 'badge-success', payment: 'badge-success' }[a] ?? 'badge-secondary')
const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k]===''||params[k]===undefined||params[k]===null) delete params[k] }); const res = await getUserLogsList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('user_logs.msg_operation_failed')) } finally { loading.value = false } }
onMounted(() => loadData())
</script>
<style scoped>
.page-content .col-id { padding-left: 20px; width: 100px; }
.page-content .col-user, .page-content .col-action, .page-content .col-ip, .page-content .col-time { text-align: center; }
.page-content .col-detail { max-width: 200px; }
.page-content .user-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
.page-content .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.page-content .detail-cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-on-surface-variant); }
.user-link { color: var(--color-primary); font-weight: 500; cursor: pointer; }
.user-link:hover { text-decoration: underline; }
</style>
