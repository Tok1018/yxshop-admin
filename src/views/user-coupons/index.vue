<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_coupons.title') }}</h1>
        <p class="page-subtitle">{{ t('user_coupons.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('user_coupons.search_placeholder')" :aria-label="t('user_coupons.search_placeholder')" @input="debouncedSearch" /></div>
      <select v-model="filters.status" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('user_coupons.filter_all_status') }}</option>
        <option value="1">{{ t('user_coupons.status_unused') }}</option>
        <option value="2">{{ t('user_coupons.status_used') }}</option>
        <option value="3">{{ t('user_coupons.status_expired') }}</option>
      </select>
    </div>
    <div class="table-card card-shadow">
      <table class="data-table">
        <thead><tr><th class="col-id">{{ t('user_coupons.th_id') }}</th><th class="col-user">{{ t('user_coupons.th_user') }}</th><th class="col-coupon">{{ t('user_coupons.th_coupon') }}</th><th class="col-status">{{ t('user_coupons.th_status') }}</th><th class="col-get">{{ t('user_coupons.th_get_time') }}</th><th class="col-use" v-if="hasUsedAt">{{ t('user_coupons.th_use_time') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td class="mono muted">{{ r.id }}</td>
            <td><div class="user-cell"><div class="user-avatar">{{ (r.user?.nickname || r.user_id || '?')[0]?.toUpperCase() }}</div><span class="user-link" @click="$router.push({ path: '/user/detail/' + r.user_id })">{{ r.user?.nickname || (r.user_id ? t('user_coupons.user_prefix', { id: r.user_id }) : '-') }}</span></div></td>
            <td><div class="coupon-cell"><div class="coupon-icon"><icon-file :size="12" /></div><span>{{ t('user_coupons.coupon_prefix') }} #{{ r.coupon_id }}</span></div></td>
            <td><span :class="statusBadgeClass(r.status)">{{ statusText(r.status) }}</span></td>
            <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            <td class="mono muted" v-if="hasUsedAt">{{ r.used_at ? formatTime(r.used_at) : '-' }}</td>
          </tr>
          <tr v-if="showListEmpty"><td :colspan="hasUsedAt ? 6 : 5" class="empty-row"><div class="empty-state"><icon-file :size="36" /><span>{{ t('user_coupons.empty_data') }}</span></div></td></tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0"><span class="total-text">{{ t('user_coupons.total_count', { n: total }) }}</span><a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" /></div>
  </div>
</template>
<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconFile } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getUserCouponsList } from '@/api/user_coupons'
const { t } = useI18n()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20; const filters = ref({ keyword: '', status: '' })
const hasUsedAt = computed(() => list.value.some(r => r.used_at))
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const onPageChange = (p) => { page.value = p; loadData() }
let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const formatTime = (ts) => { if (!ts) return '-'; const d = new Date(ts.length > 12 ? ts : ts * 1000); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
const statusText = (s) => ({ 1: t('user_coupons.status_unused'), 2: t('user_coupons.status_used'), 3: t('user_coupons.status_expired') }[s] ?? t('user_coupons.status_unknown'))
const statusBadgeClass = (s) => ({ 1: 'badge-success', 2: 'badge-secondary', 3: 'badge-error' }[s] ?? 'badge-error')
const loadData = async () => { loading.value = true; try { const params = { page: page.value, page_size: pageSize, ...filters.value }; Object.keys(params).forEach(k => { if (params[k]===''||params[k]===undefined||params[k]===null) delete params[k] }); const res = await getUserCouponsList(params); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('user_coupons.msg_operation_failed')) } finally { loading.value = false } }
onMounted(() => loadData())
</script>
<style scoped>
.page-content .col-id { padding-left: 20px; width: 100px; }
.page-content .col-user, .page-content .col-coupon, .page-content .col-status, .page-content .col-get, .page-content .col-use { text-align: center; }
.page-content .user-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
.page-content .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--color-error-rgb), 0.1); color: var(--color-error); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.page-content .coupon-cell { display: flex; align-items: center; gap: 6px; justify-content: center; color: var(--color-on-surface); font-size: 12px; }
.page-content .coupon-icon { width: 24px; height: 24px; border-radius: 4px; background: rgba(var(--color-error-rgb), 0.1); color: var(--color-error); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.user-link { color: var(--color-primary); font-weight: 500; cursor: pointer; }
.user-link:hover { text-decoration: underline; }
</style>
