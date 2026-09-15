<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('notification_blacklists.title') }}</h1><p class="page-subtitle">{{ t('notification_blacklists.subtitle') }}</p></div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus :size="14" />
          {{ t('notification_blacklists.add') }}
        </button>
      </div>
    </div>
    <div class="search-strip">
      <div class="search-box"><icon-search /><input v-model="filters.keyword" :placeholder="t('notification_blacklists.search_value')" :aria-label="t('notification_blacklists.search_value')" @input="debouncedSearch" /></div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-id">{{ t('notification_blacklists.id') }}</th><th class="col-value">{{ t('notification_blacklists.value') }}</th><th class="col-type">{{ t('notification_blacklists.type') }}</th><th class="col-reason">{{ t('notification_blacklists.reason') }}</th><th class="col-time">{{ t('notification_blacklists.time') }}</th><th class="col-actions">{{ t('notification_blacklists.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono muted">{{ record.id }}</td>
              <td class="name-cell">{{ record.blacklist_value || record.receiver || '-' }}</td>
              <td><span class="badge-secondary">{{ typeText(record.blacklist_type || record.channel) }}</span></td>
              <td class="muted">{{ record.blacklist_reason || '-' }}</td>
              <td class="mono muted">{{ record.created_at ? formatTime(record.created_at) : '-' }}</td>
              <td class="actions-cell">
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('notification_blacklists.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="6" class="empty-state"><icon-close :size="36" style="opacity:0.3" /><span>{{ t('notification_blacklists.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0"><span class="total-text">{{ t('notification_blacklists.total_count', { count: total }) }}</span><a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" /></div>

    <a-drawer v-model:visible="formVisible" :width="'min(480px, 90vw)'" :title="t('notification_blacklists.add_blacklist')" class="arco-drawer-md3" unmount-on-close>
      <div class="form-group"><label>{{ t('notification_blacklists.type') }}</label>
        <a-select v-model="form.blacklist_type" :placeholder="t('notification_blacklists.placeholder_type')">
          <a-option value="phone">{{ t('notification_blacklists.phone') }}</a-option>
          <a-option value="email">{{ t('notification_blacklists.email') }}</a-option>
          <a-option value="wechat">{{ t('notification_blacklists.wechat') }}</a-option>
          <a-option value="ip">{{ t('notification_blacklists.ip') }}</a-option>
          <a-option value="user">{{ t('notification_blacklists.user_id') }}</a-option>
        </a-select>
      </div>
      <div class="form-group"><label>{{ t('notification_blacklists.value') }} <span class="required">*</span></label><input v-model="form.blacklist_value" class="form-input" :placeholder="t('notification_blacklists.placeholder_value')" /></div>
      <div class="form-group"><label>{{ t('notification_blacklists.reason') }}</label><input v-model="form.blacklist_reason" class="form-input" :placeholder="t('notification_blacklists.placeholder_reason')" /></div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('notification_blacklists.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ t('notification_blacklists.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconPlus, IconClose } from '@arco-design/web-vue/es/icon'
import { getNotificationBlacklistsList, createNotificationBlacklists, deleteNotificationBlacklists } from '@/api/notification_blacklists'

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
const formVisible = ref(false)
const form = reactive({ blacklist_type: 'phone', blacklist_value: '', blacklist_reason: '' })

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts.length > 12 ? ts : ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const typeText = (c) => ({
  phone: t('notification_blacklists.phone'),
  email: t('notification_blacklists.email'),
  wechat: t('notification_blacklists.wechat'),
  ip: t('notification_blacklists.ip'),
  user: t('notification_blacklists.user_id'),
  sms: t('notification_blacklists.phone'),
  push: t('notification_blacklists.wechat')
}[c] || c || '-')

const openForm = () => { Object.assign(form, { blacklist_type: 'phone', blacklist_value: '', blacklist_reason: '' }); formVisible.value = true }

const handleSubmit = async () => {
  if (!form.blacklist_value) { Message.warning(t('notification_blacklists.please_input_value')); return }
  try { await createNotificationBlacklists(form); Message.success(t('notification_blacklists.create_success')); formVisible.value = false; loadData() } catch (error) { Message.error(t('notification_blacklists.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('notification_blacklists.delete'), content: t('notification_blacklists.confirm_delete'), hideCancel: false, onOk: async () => { try { await deleteNotificationBlacklists(record.id); Message.success(t('notification_blacklists.delete_success')); loadData() } catch (error) { Message.error(t('notification_blacklists.delete_failed')) } } })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getNotificationBlacklistsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('notification_blacklists.operation_failed')) } finally { loading.value = false }
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
.col-type, .col-time, .col-actions { text-align: center; }
.col-actions { padding-right: 20px; }
.name-cell { color: var(--color-on-surface); font-weight: 500; }
</style>
