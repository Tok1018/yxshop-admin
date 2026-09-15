<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('sms_logs.title') }}</h1>
        <p class="page-subtitle">{{ t('sms_logs.subtitle') }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('sms_logs.search_placeholder')" :aria-label="t('sms_logs.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('sms_logs.th_id') }}</th>
              <th>{{ t('sms_logs.th_phone') }}</th>
              <th>{{ t('sms_logs.th_content') }}</th>
              <th>{{ t('sms_logs.th_status') }}</th>
              <th>{{ t('sms_logs.th_time') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td class="mono muted">{{ r.id }}</td>
              <td class="mono"><span class="phone-link">{{ r.phone || '-' }}</span></td>
              <td class="content-cell" :title="r.content">{{ r.content || '-' }}</td>
              <td><span :class="r.status === 1 ? 'badge-success' : 'badge-error'">{{ r.status === 1 ? t('sms_logs.status_success') : t('sms_logs.status_failed') }}</span></td>
              <td class="mono muted">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <icon-phone :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('sms_logs.empty_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading">
        <div class="spinner"></div>
      </div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('sms_logs.total_count', { n: total }) }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconPhone } from '@arco-design/web-vue/es/icon'
import { getSmsLogsList } from '@/api/sms_logs'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })

const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts.length > 12 ? ts : ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getSmsLogsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('sms_logs.msg_operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.phone-link {
  color: var(--color-primary);
  font-weight: 600;
}

.content-cell {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-on-surface-variant);
}
</style>
