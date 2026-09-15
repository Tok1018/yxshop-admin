<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('language.title') }}</h1>
        <p class="page-subtitle">{{ t('language.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('language.add') }}
        </button>
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('language.col_name') }}</th>
              <th>{{ t('language.col_code') }}</th>
              <th>{{ t('language.col_sort') }}</th>
              <th>{{ t('language.col_status') }}</th>
              <th class="col-actions">{{ t('language.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td>{{ record.name || '-' }}</td>
              <td class="mono">{{ record.code || '-' }}</td>
              <td class="mono">{{ record.sort || 0 }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('language.status_active') : t('language.status_inactive') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(record)">{{ record.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <icon-translate :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('language.no_data') }}</span>
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

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="(form.id ? t('language.btn_edit') : t('language.add')) + t('language.lang_suffix')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('language.title') }}</h4>
        <div class="form-group">
          <label>{{ t('language.col_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('language.name_placeholder')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('language.col_code') }} <span class="required">*</span></label>
          <input v-model="form.code" :placeholder="t('language.code_placeholder')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('language.col_sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('language.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('language.save_changes') : t('language.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconTranslate } from '@arco-design/web-vue/es/icon'
import { getLanguageList, createLanguage, updateLanguage, deleteLanguage, updateLanguageStatus } from '@/api/language'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const formVisible = ref(false)
const form = reactive({ id: null, name: '', code: '', sort: 0 })
const showEmpty = computed(() => !list.value.length && !loading.value)
const drawerWidth = 'min(480px, 90vw)'

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', code: '', sort: 0 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateLanguage(form.id, form); Message.success(t('language.update_success')) }
    else { await createLanguage(form); Message.success(t('language.create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('language.operation_failed')) }
}

const toggleStatus = async (record) => {
  try { await updateLanguageStatus(record.id, { status: record.status === 1 ? 0 : 1 }); Message.success(t('language.operation_success')); loadData() }
  catch (error) { Message.error(t('language.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('language.btn_delete'),
    content: t('language.delete_confirm_content'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteLanguage(record.id); Message.success(t('language.delete_success')); loadData() }
      catch (error) { Message.error(t('language.delete_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getLanguageList()
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
  } catch (error) { Message.error(t('language.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>
