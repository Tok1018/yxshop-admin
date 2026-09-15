<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('notification_scenes.title') }}</h1><p class="page-subtitle">{{ t('notification_scenes.subtitle') }}</p></div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus :size="14" />
          {{ t('notification_scenes.add') }}
        </button>
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th class="col-name">{{ t('notification_scenes.name') }}</th><th class="col-code">{{ t('notification_scenes.code') }}</th><th class="col-status">{{ t('notification_scenes.status') }}</th><th class="col-actions">{{ t('notification_scenes.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.scene_name || record.name || '-' }}</td>
              <td class="mono"><span class="badge-secondary">{{ record.scene_code || record.code || '-' }}</span></td>
              <td><span :class="(record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? 'badge-success' : 'badge-error'">{{ (record.is_active ?? record.status) === 1 || (record.is_active ?? record.status) === true ? t('notification_scenes.enabled') : t('notification_scenes.disabled') }}</span></td>
              <td class="actions-cell">
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="4" class="empty-state"><icon-notification :size="36" style="opacity:0.3" /><span>{{ t('notification_scenes.empty') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('notification_scenes.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-drawer v-model:visible="formVisible" :width="'min(480px, 90vw)'" :title="form.id ? t('notification_scenes.edit') + t('notification_scenes.scene') : t('notification_scenes.add') + t('notification_scenes.scene')" class="arco-drawer-md3" unmount-on-close>
      <div class="form-group"><label>{{ t('notification_scenes.name') }} <span class="required">*</span></label><input v-model="form.scene_name" class="form-input" :placeholder="t('notification_scenes.placeholder_name')" /></div>
      <div class="form-group"><label>{{ t('notification_scenes.code') }} <span class="required">*</span></label><input v-model="form.scene_code" class="form-input" :placeholder="t('notification_scenes.placeholder_code')" /></div>
      <div class="form-group"><label>{{ t('notification_scenes.status') }}</label><div class="switch-row"><sa-switch v-model="form.is_active" :checked-value="1" :unchecked-value="0" /><span class="switch-label">{{ form.is_active === 1 ? t('notification_scenes.enabled') : t('notification_scenes.disabled') }}</span></div></div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('notification_scenes.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('notification_scenes.save_changes') : t('notification_scenes.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconNotification } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getNotificationScenesList, createNotificationScenes, updateNotificationScenes, deleteNotificationScenes } from '@/api/notification_scenes'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const formVisible = ref(false)
const form = reactive({ id: null, scene_name: '', scene_code: '', is_active: 1 })

const openForm = (record) => {
  Object.assign(form, { id: null, scene_name: '', scene_code: '', is_active: 1 }, record || {})
  // 兼容旧字段
  if (!form.scene_name && record?.name) form.scene_name = record.name
  if (!form.scene_code && record?.code) form.scene_code = record.code
  if (record?.status !== undefined && form.is_active === 1) form.is_active = record.status
  // is_active 可能是 boolean，转为 int
  if (typeof form.is_active === 'boolean') form.is_active = form.is_active ? 1 : 0
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateNotificationScenes(form.id, form); Message.success(t('notification_scenes.update_success')) }
    else { await createNotificationScenes(form); Message.success(t('notification_scenes.create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('notification_scenes.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('notification_scenes.delete'), content: t('notification_scenes.confirm_delete'), hideCancel: false, onOk: async () => { try { await deleteNotificationScenes(record.id); Message.success(t('notification_scenes.delete_success')); loadData() } catch (error) { Message.error(t('notification_scenes.delete_failed')) } } })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try { const res = await getNotificationScenesList({ page: page.value, page_size: pageSize }); list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : []); total.value = res.data?.total || 0 } catch (error) { Message.error(t('notification_scenes.operation_failed')) } finally { loading.value = false }
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
