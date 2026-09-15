<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('app.title') }}</h1>
        <p class="page-subtitle">{{ t('app.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('app.add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('app.search_placeholder')" :aria-label="t('app.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('app.col_app_name') }}</th>
              <th>AppKey</th>
              <th>{{ t('app.col_type') }}</th>
              <th>{{ t('app.col_status') }}</th>
              <th class="col-actions">{{ t('app.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td>{{ record.app_name || '-' }}</td>
              <td class="mono">{{ record.app_key || '-' }}</td>
              <td><span class="badge-info">{{ record.app_type === 1 ? t('app.type_miniapp') : record.app_type === 2 ? 'H5' : 'APP' }}</span></td>
              <td><span :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('app.status_active') : t('app.status_inactive') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(record)">{{ record.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-ghost btn-sm" @click="handleResetKey(record)">{{ t('app.btn_reset_key') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('app.no_data') }}</span>
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
      <span class="total-text">{{ t('app.total_count', { count: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="(form.id ? t('app.btn_edit') : t('app.add')) + t('app.app_suffix')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('app.title') }}</h4>
        <div class="form-group">
          <label>{{ t('app.col_app_name') }} <span class="required">*</span></label>
          <input v-model="form.app_name" :placeholder="t('app.name_placeholder')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('app.col_type') }}</label>
          <select v-model="form.app_type" class="form-input">
            <option :value="1">{{ t('app.type_miniapp') }}</option>
            <option :value="2">H5</option>
            <option :value="3">APP</option>
          </select>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('app.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('app.save_changes') : t('app.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus, IconSearch } from '@arco-design/web-vue/es/icon'
import { getAppList, createApp, updateApp, deleteApp, updateAppStatus, resetAppKey } from '@/api/app'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showEmpty = computed(() => !list.value.length && !loading.value)
const filters = ref({ keyword: '' })
const drawerWidth = 'min(480px, 90vw)'

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, app_name: '', app_type: 1 })

const openForm = (record) => {
  Object.assign(form, { id: null, app_name: '', app_type: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateApp(form.id, form); Message.success(t('app.update_success')) }
    else { await createApp(form); Message.success(t('app.create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('app.operation_failed')) }
}

const toggleStatus = async (record) => {
  try { await updateAppStatus(record.id, { status: record.status === 1 ? 0 : 1 }); Message.success(t('app.operation_success')); loadData() }
  catch (error) { Message.error(t('app.operation_failed')) }
}

const handleResetKey = async (record) => {
  try { await resetAppKey(record.id); Message.success(t('app.key_reset')); loadData() }
  catch (error) { Message.error(t('app.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('app.btn_delete'),
    content: t('app.delete_confirm_content'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteApp(record.id); Message.success(t('app.delete_success')); loadData() }
      catch (error) { Message.error(t('app.delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getAppList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('app.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>
