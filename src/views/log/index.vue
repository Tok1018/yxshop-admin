<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('log.title') }}</h1>
        <p class="page-subtitle">{{ t('log.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost btn-sm" @click="showClearModal = true">{{ t('log.btn_clear') }}</button>
        <button class="btn-ghost btn-sm" @click="handleExport">{{ t('log.btn_export') }}</button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="tab-group">
        <button v-for="tab in tabs" :key="tab.key" class="tab-btn" :class="{ 'tab-btn-active': activeTab === tab.key }" @click="activeTab = tab.key; page = 1; loadData()">{{ tab.label }}</button>
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ t('log.col_operator') }}</th>
              <th>{{ t('log.col_module') }}</th>
              <th>{{ t('log.col_action') }}</th>
              <th>{{ t('log.col_ip') }}</th>
              <th>{{ t('log.col_time') }}</th>
              <th class="col-actions">{{ t('log.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="mono">{{ record.id }}</td>
              <td>{{ getOperator(record) }}</td>
              <td>{{ getModule(record) }}</td>
              <td>{{ getAction(record) }}</td>
              <td class="mono">{{ record.ip || record.login_ip || record.login_ip || '-' }}</td>
              <td class="mono">{{ formatTime(record.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="hasNoData">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('log.no_data') }}</span>
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
      <span class="total-text">{{ t('log.total_count', { count: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <a-modal v-model:visible="showClearModal" :title="t('log.btn_clear')" :ok-text="t('log.btn_clear')" @ok="handleClear" :mask-closable="false">
      <a-form :model="clearForm" layout="vertical">
        <a-form-item :label="t('log.clear_days_label')">
          <a-input-number v-model="clearForm.days" :min="1" :max="365" :placeholder="t('log.clear_days_placeholder')" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { getLoginLogList, getAdminLogList, getUserLogList, getSystemLogList, getApiLogList, deleteLog, clearLogs, exportLogs } from '@/api/log'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const hasNoData = computed(() => !list.value.length && !loading.value)
const activeTab = ref('login')
const showClearModal = ref(false)
const clearForm = ref({ days: 30 })

const tabs = computed(() => [
  { key: 'login', label: t('log.tab_login') },
  { key: 'admin', label: t('log.tab_admin') },
  { key: 'user', label: t('log.tab_user') },
  { key: 'system', label: t('log.tab_system') },
  { key: 'api', label: t('log.tab_api') },
])

const apiMap = { login: getLoginLogList, admin: getAdminLogList, user: getUserLogList, system: getSystemLogList, api: getApiLogList }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  if (isNaN(d.getTime())) return ts
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const getOperator = (r) => {
  return r.admin_name || r.user_name || r.operator_name || (r.admin_id ? '#' + r.admin_id : '') || (r.user_id ? '#' + r.user_id : '') || '-'
}
const getModule = (r) => {
  if (r.module) return r.module
  if (r.log_level !== undefined && r.log_level !== '') {
    const levelMap = { 10: 'DEBUG', 20: 'INFO', 30: 'WARNING', 40: 'ERROR', 50: 'CRITICAL' }
    return levelMap[r.log_level] || 'Level ' + r.log_level
  }
  if (r.log_type) return r.log_type
  return '-'
}
const getAction = (r) => {
  return r.action || r.request_method || r.operation_type || r.login_result || r.login_status || '-'
}

const onPageChange = (p) => { page.value = p; loadData() }

const handleDelete = (record) => {
  Modal.warning({
    title: t('log.btn_delete'), content: t('log.delete_confirm_content'), hideCancel: false,
    onOk: async () => {
      try { await deleteLog(activeTab.value, record.id); Message.success(t('log.delete_success')); loadData() }
      catch (error) { Message.error(t('log.delete_failed')) }
    }
  })
}

const handleClear = async () => {
  try {
    await clearLogs({ type: activeTab.value, days: clearForm.value.days })
    Message.success(t('log.clear_success'))
    showClearModal.value = false
    loadData()
  } catch (error) {
    Message.error(t('log.clear_failed'))
  }
}

const handleExport = () => {
  const url = `/admin/api/logs/export?type=${activeTab.value}&format=csv`
  const link = document.createElement('a')
  link.href = url
  link.download = `${activeTab.value}_logs.csv`
  link.click()
}

const loadData = async () => {
  loading.value = true
  try {
    const api = apiMap[activeTab.value]
    const res = await api({ page: page.value, page_size: pageSize })
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || list.value.length
  } catch (error) { Message.error(t('log.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
:deep(.arco-input-number) { width: 100%; }
</style>
