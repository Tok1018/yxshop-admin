<template>
  <div class="page-content">
    <div class="page-head">
      <div><h1 class="page-title">{{ t('notification_configs.title') }}</h1><p class="page-subtitle">{{ t('notification_configs.subtitle') }}</p></div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-name">{{ t('notification_configs.name') }}</th><th class="col-type">{{ t('notification_configs.type') }}</th><th class="col-status">{{ t('notification_configs.status') }}</th><th class="col-actions">{{ t('notification_configs.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.config_key || record.config_desc || record.name || '-' }}</td>
              <td><span class="badge-secondary">{{ record.config_type || record.type || '-' }}</span></td>
              <td><span :class="(record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? 'badge-success' : 'badge-info'">{{ (record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? t('notification_configs.enabled') : t('notification_configs.disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="4" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('notification_configs.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('notification_configs.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-drawer v-model:visible="formVisible" :title="t('notification_configs.edit_config')" class="arco-drawer-md3" :width="'min(480px, 90vw)'" unmount-on-close>
      <div class="form-group"><label>{{ t('notification_configs.name') }}</label><input v-model="form.config_key" class="form-input" :placeholder="t('notification_configs.placeholder_name')" /></div>
      <div class="form-group"><label>{{ t('notification_configs.type') }}</label>
      <a-select v-model="form.config_type" :placeholder="t('notification_configs.placeholder_type')" allow-create>
        <a-option value="sms">{{ t('notification_configs.type_sms') }}</a-option>
        <a-option value="email">{{ t('notification_configs.type_email') }}</a-option>
        <a-option value="wechat">{{ t('notification_configs.type_wechat') }}</a-option>
        <a-option value="push">{{ t('notification_configs.type_push') }}</a-option>
        <a-option value="system">{{ t('notification_configs.type_system') }}</a-option>
      </a-select>
      </div>
      <div class="form-group"><label>{{ t('notification_configs.config_content') }}</label><textarea v-model="form.config_value" class="form-input form-textarea" rows="5" :placeholder="t('notification_configs.placeholder_json_config')"></textarea></div>
      <div class="form-group"><label>{{ t('notification_configs.status') }}</label><div class="switch-row"><sa-switch v-model="form.is_active" :checked-value="1" :unchecked-value="0" /><span class="switch-label">{{ form.is_active === 1 ? t('notification_configs.enabled') : t('notification_configs.disabled') }}</span></div></div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('notification_configs.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ t('notification_configs.save_changes') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getNotificationConfigsList, updateNotificationConfigs } from '@/api/notification_configs'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const formVisible = ref(false)
const form = reactive({ id: null, config_key: '', config_type: '', config_value: '', is_active: 1 })

const openForm = (record) => {
  Object.assign(form, { id: null, config_key: '', config_type: '', config_value: '', is_active: 1 }, record || {})
  // 兼容旧字段
  if (!form.config_key && record?.name) form.config_key = record.name
  if (!form.config_type && record?.type) form.config_type = record.type
  if (!form.config_value && record?.config) form.config_value = record.config
  if (record?.status !== undefined && form.is_active === 1) form.is_active = record.status
  // is_active 可能是 boolean，转为 int
  if (typeof form.is_active === 'boolean') form.is_active = form.is_active ? 1 : 0
  // config_value 可能是对象/数组，转为字符串
  if (typeof form.config_value === 'object' && form.config_value !== null) {
    form.config_value = JSON.stringify(form.config_value, null, 2)
  }
  formVisible.value = true
}

const handleSubmit = async () => {
  try { await updateNotificationConfigs(form.id, form); Message.success(t('notification_configs.update_success')); formVisible.value = false; loadData() } catch (error) { Message.error(t('notification_configs.operation_failed')) }
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try { const res = await getNotificationConfigsList({ page: page.value, page_size: pageSize }); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('notification_configs.operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.card-shadow {
  flex: 1;
  min-height: 0;
  position: relative;
  z-index: 1;
}

.table-scroll {
  overflow-y: auto;
}

.table-spin {
  width: 100%;
}

.col-name {
  padding-left: 20px;
}

.col-actions {
  text-align: right;
  padding-right: 20px;
}

.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.badge-secondary {
font-size: 12px;
background: var(--color-secondary-fixed);
color: var(--color-on-secondary-fixed);
padding: 2px 10px;
border-radius: var(--radius-sm);
font-weight: 700;
}

.badge-success {
display: inline-flex;
padding: 3px 10px;
border-radius: var(--radius-sm);
font-size: 11px;
font-weight: 700;
background: var(--color-primary-fixed);
color: var(--color-on-primary-fixed);
}

.badge-info {
display: inline-flex;
padding: 3px 10px;
border-radius: var(--radius-sm);
font-size: 11px;
font-weight: 700;
background: var(--color-secondary-fixed);
color: var(--color-on-secondary-fixed);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 72px 20px;
  color: var(--color-on-surface-variant);
  font-size: 13px;
}

.empty-icon {
  font-size: 36px;
  opacity: 0.3;
}

.empty-text {
  font-size: 13px;
}

.form-textarea {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 12px;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-label { font-size: 13px; color: var(--color-on-surface-variant); }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px; }
.total-text { color: var(--color-on-surface-variant); }
</style>
