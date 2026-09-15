<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_money_logs.title') }}</h1>
        <p class="page-subtitle">{{ t('user_money_logs.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('user_money_logs.search_placeholder')" :aria-label="t('user_money_logs.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>ID</th><th>{{ t('user_money_logs.th_user') }}</th><th>{{ t('user_money_logs.th_amount') }}</th><th>{{ t('user_money_logs.th_type') }}</th><th>{{ t('user_money_logs.th_note') }}</th><th>{{ t('user_money_logs.th_time') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono">{{ record.id }}</td>
              <td><span class="user-link" @click="$router.push({ path: '/user/detail/' + record.user_id })">{{ record.user?.nickname || record.user_id || '-' }}</span></td>
              <td class="mono" :class="record.money >= 0 ? 'amount-positive' : 'amount-negative'">{{ record.money >= 0 ? '+' : '' }}{{ Number(record.money || 0).toFixed(2) }}</td>
              <td><span :class="record.type === 1 ? 'badge badge-success' : 'badge badge-error'">{{ record.type === 1 ? t('user_money_logs.type_income') : t('user_money_logs.type_expense') }}</span></td>
              <td class="desc-cell">{{ record.note || '-' }}</td>
              <td class="mono">{{ formatTime(record.created_at) }}</td>
            </tr>
            <tr v-if="showEmpty"><td colspan="6" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('user_money_logs.empty_data') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <a-pagination
      v-if="total > 0"
      :current="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
      class="arco-pagination-md3"
      show-total
      :total-text="t('user_money_logs.total_count', { n: total })"
    />
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getUserMoneyLogsList } from '@/api/user_money_logs'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showEmpty = computed(() => !list.value.length && !loading.value)
const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

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
    const res = await getUserMoneyLogsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('user_money_logs.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.user-link { color: var(--color-primary); font-weight: 500; cursor: pointer; }
.user-link:hover { text-decoration: underline; }
</style>


