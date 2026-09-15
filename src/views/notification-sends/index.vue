<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('notification_sends.title') }}</h1><p class="page-subtitle">{{ t('notification_sends.subtitle') }}</p></div>
    </div>
    <div class="search-strip">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('notification_sends.search_receiver')" :aria-label="t('notification_sends.search_receiver')" @input="debouncedSearch" /></div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-id">{{ t('notification_sends.id') }}</th><th class="col-receiver">{{ t('notification_sends.receiver') }}</th><th class="col-title">{{ t('notification_sends.title_field') }}</th><th class="col-channel">{{ t('notification_sends.channel') }}</th><th class="col-status">{{ t('notification_sends.status') }}</th><th class="col-time">{{ t('notification_sends.time') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono muted">{{ record.id }}</td>
              <td class="name-cell">{{ record.send_to || record.receiver || '-' }}</td>
              <td class="muted">{{ record.send_title || '-' }}</td>
              <td><span class="badge-secondary">{{ channelText(record.send_type || record.channel) }}</span></td>
              <td><span :class="statusClass(record.send_status ?? record.status)">{{ statusText(record.send_status ?? record.status) }}</span></td>
              <td class="mono muted">{{ (record.send_time || record.created_at) ? formatTime(record.send_time || record.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="6" class="empty-state"><icon-notification :size="36" style="opacity:0.3" /><span>{{ t('notification_sends.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0"><span class="total-text">{{ t('notification_sends.total_count', { count: total }) }}</span><a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" /></div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconNotification } from '@arco-design/web-vue/es/icon'
import { getNotificationSendsList } from '@/api/notification_sends'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (p) => { page.value = p; loadData() }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts.length > 12 ? ts : ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const channelText = (c) => ({
  sms: t('notification_sends.sms'),
  email: t('notification_sends.email'),
  wechat: t('notification_sends.wechat'),
  push: t('notification_sends.push'),
  system: t('notification_sends.system')
}[c] || c || '-')

const statusClass = (s) => {
  if (s === 1) return 'badge-success'
  if (s === 2) return 'badge-error'
  return 'badge-info'
}

const statusText = (s) => {
  if (s === 1) return t('notification_sends.success')
  if (s === 2) return t('notification_sends.failed')
  return t('notification_sends.pending')
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getNotificationSendsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('notification_sends.operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content { height: 100%; display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
.search-strip { position: relative; z-index: 1; }
.card-shadow { flex: 1; min-height: 0; position: relative; z-index: 1; }
.table-scroll { overflow-y: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 72px 20px; color: var(--color-on-surface-variant); font-size: 13px; }
.col-id { padding-left: 20px; width: 80px; }
.col-channel, .col-status, .col-time { text-align: center; }
.col-actions { text-align: right; padding-right: 20px; }
.name-cell { color: var(--color-on-surface); font-weight: 500; }
</style>
