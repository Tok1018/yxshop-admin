<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('notification_template.title') }}</h1><p class="page-subtitle">{{ t('notification_template.subtitle') }}</p></div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus :size="14" />
          {{ t('notification_template.add') }}
        </button>
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-name">{{ t('notification_template.name') }}</th><th class="col-type">{{ t('notification_template.type') }}</th><th class="col-status">{{ t('notification_template.status') }}</th><th class="col-actions">{{ t('notification_template.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.template_name || '-' }}</td>
              <td><span class="badge-secondary">{{ typeText(record.template_type) }}</span></td>
              <td><span :class="record.is_active === 1 || record.is_active === true ? 'badge-success' : 'badge-error'">{{ record.is_active === 1 || record.is_active === true ? t('notification_template.enabled') : t('notification_template.disabled') }}</span></td>
              <td class="actions-cell">
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="4" class="empty-state"><icon-file :size="36" style="opacity:0.3" /><span>{{ t('notification_template.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('notification_template.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-drawer v-model:visible="formVisible" :width="'min(480px, 90vw)'" :title="form.id ? t('notification_template.edit') + t('notification_template.template') : t('notification_template.add') + t('notification_template.template')" class="arco-drawer-md3" unmount-on-close>
      <div class="form-group"><label>{{ t('notification_template.name') }} <span class="required">*</span></label><input v-model="form.template_name" class="form-input" :placeholder="t('notification_template.placeholder_name')" /></div>
      <div class="form-group"><label>{{ t('notification_template.type') }}</label>
        <a-select v-model="form.template_type" :placeholder="t('notification_template.type')">
          <a-option value="sms">{{ t('notification_template.sms') }}</a-option>
          <a-option value="email">{{ t('notification_template.email') }}</a-option>
          <a-option value="wechat">{{ t('notification_template.wechat') }}</a-option>
          <a-option value="push">{{ t('notification_template.push') }}</a-option>
          <a-option value="system">{{ t('notification_template.system') }}</a-option>
        </a-select>
      </div>
      <div class="form-group"><label>{{ t('notification_template.content') }}</label><textarea v-model="form.template_content" class="form-input form-textarea" rows="6" :placeholder="t('notification_template.placeholder_content')"></textarea></div>
      <div class="form-group"><label>{{ t('notification_template.status') }}</label><div class="switch-row"><sa-switch v-model="form.is_active" :checked-value="1" :unchecked-value="0" /><span class="switch-label">{{ form.is_active === 1 ? t('notification_template.enabled') : t('notification_template.disabled') }}</span></div></div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('notification_template.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('notification_template.save_changes') : t('notification_template.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconPlus, IconFile } from '@arco-design/web-vue/es/icon'
import { getNotificationTemplateList, createNotificationTemplate, updateNotificationTemplate, deleteNotificationTemplate } from '@/api/notification'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const formVisible = ref(false)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const form = reactive({ id: null, template_name: '', template_type: 'sms', template_content: '', is_active: 1 })

const typeText = (c) => ({
  sms: t('notification_template.sms'),
  email: t('notification_template.email'),
  wechat: t('notification_template.wechat'),
  push: t('notification_template.push'),
  system: t('notification_template.system')
}[c] || c || '-')

const openForm = (record) => {
  Object.assign(form, { id: null, template_name: '', template_type: 'sms', template_content: '', is_active: 1 }, record || {})
  if (typeof form.is_active === 'boolean') form.is_active = form.is_active ? 1 : 0
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateNotificationTemplate(form.id, form); Message.success(t('notification_template.update_success')) }
    else { await createNotificationTemplate(form); Message.success(t('notification_template.create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('notification_template.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('notification_template.delete'), content: t('notification_template.confirm_delete'), hideCancel: false, onOk: async () => { try { await deleteNotificationTemplate(record.id); Message.success(t('notification_template.delete_success')); loadData() } catch (error) { Message.error(t('notification_template.delete_failed')) } } })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try { const res = await getNotificationTemplateList({ page: page.value, page_size: pageSize }); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('notification_template.operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content { height: 100%; display: flex; flex-direction: column; gap: 20px; overflow: hidden; }
.card-shadow { flex: 1; min-height: 0; position: relative; z-index: 1; }
.table-scroll { overflow-y: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 72px 20px; color: var(--color-on-surface-variant); font-size: 13px; }
.col-name { padding-left: 20px; }
.col-actions { text-align: right; padding-right: 20px; }
.name-cell { color: var(--color-on-surface); font-weight: 500; }
.form-textarea { font-family: 'SF Mono', 'Cascadia Code', monospace; font-size: 12px; }
.switch-row { display: flex; align-items: center; gap: 10px; }
.switch-label { font-size: 13px; color: var(--color-on-surface-variant); }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px; }
.total-text { color: var(--color-on-surface-variant); }
</style>
