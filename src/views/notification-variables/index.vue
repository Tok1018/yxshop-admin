<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('notification_variables.title') }}</h1><p class="page-subtitle">{{ t('notification_variables.subtitle') }}</p></div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus :size="14" />
          {{ t('notification_variables.add') }}
        </button>
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-name">{{ t('notification_variables.name') }}</th><th class="col-code">{{ t('notification_variables.code') }}</th><th class="col-desc">{{ t('notification_variables.desc') }}</th><th class="col-status">{{ t('notification_variables.status') }}</th><th class="col-actions">{{ t('notification_variables.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.variable_name || record.name || '-' }}</td>
              <td class="mono"><span class="badge-secondary">{{ record.variable_code || record.code || '-' }}</span></td>
              <td class="muted">{{ record.variable_desc || '-' }}</td>
              <td><span :class="(record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? 'badge-success' : 'badge-error'">{{ (record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? t('notification_variables.enabled') : t('notification_variables.disabled') }}</span></td>
              <td class="actions-cell">
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="5" class="empty-state"><icon-file :size="36" style="opacity:0.3" /><span>{{ t('notification_variables.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('notification_variables.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-drawer v-model:visible="formVisible" :width="'min(480px, 90vw)'" :title="form.id ? t('notification_variables.edit') + t('notification_variables.variable') : t('notification_variables.add') + t('notification_variables.variable')" class="arco-drawer-md3" unmount-on-close>
      <div class="form-group"><label>{{ t('notification_variables.name') }} <span class="required">*</span></label><input v-model="form.variable_name" class="form-input" :placeholder="t('notification_variables.placeholder_name')" /></div>
      <div class="form-group"><label>{{ t('notification_variables.code') }} <span class="required">*</span></label><input v-model="form.variable_code" class="form-input" :placeholder="t('notification_variables.placeholder_code_example')" /></div>
      <div class="form-group"><label>{{ t('notification_variables.desc') }}</label><input v-model="form.variable_desc" class="form-input" :placeholder="t('notification_variables.placeholder_desc')" /></div>
      <div class="form-group"><label>{{ t('notification_variables.status') }}</label><div class="switch-row"><sa-switch v-model="form.is_active" :checked-value="1" :unchecked-value="0" /><span class="switch-label">{{ form.is_active === 1 ? t('notification_variables.enabled') : t('notification_variables.disabled') }}</span></div></div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('notification_variables.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('notification_variables.save_changes') : t('notification_variables.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconPlus, IconFile } from '@arco-design/web-vue/es/icon'
import { getNotificationVariablesList, createNotificationVariables, updateNotificationVariables, deleteNotificationVariables } from '@/api/notification_variables'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const formVisible = ref(false)
const form = reactive({ id: null, variable_name: '', variable_code: '', variable_desc: '', is_active: 1 })

const openForm = (record) => {
  Object.assign(form, { id: null, variable_name: '', variable_code: '', variable_desc: '', is_active: 1 }, record || {})
  // 兼容旧字段
  if (!form.variable_name && record?.name) form.variable_name = record.name
  if (!form.variable_code && record?.code) form.variable_code = record.code
  // is_active 可能是 boolean，转为 int
  if (typeof form.is_active === 'boolean') form.is_active = form.is_active ? 1 : 0
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.variable_name || !form.variable_code) { Message.warning(t('notification_variables.please_input_name_and_code')); return }
  try {
    if (form.id) { await updateNotificationVariables(form.id, form); Message.success(t('notification_variables.update_success')) }
    else { await createNotificationVariables(form); Message.success(t('notification_variables.create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('notification_variables.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('notification_variables.delete'), content: t('notification_variables.confirm_delete'), hideCancel: false, onOk: async () => { try { await deleteNotificationVariables(record.id); Message.success(t('notification_variables.delete_success')); loadData() } catch (error) { Message.error(t('notification_variables.delete_failed')) } } })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try { const res = await getNotificationVariablesList({ page: page.value, page_size: pageSize }); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('notification_variables.operation_failed')) } finally { loading.value = false }
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
.switch-row { display: flex; align-items: center; gap: 10px; }
.switch-label { font-size: 13px; color: var(--color-on-surface-variant); }
.pagination-bar { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 13px; }
.total-text { color: var(--color-on-surface-variant); }
</style>
