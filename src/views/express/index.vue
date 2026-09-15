<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('express.title') }}</h1>
        <p class="page-subtitle">{{ t('express.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('express.add_express') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('express.search_placeholder')" :aria-label="t('express.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('express.th_name') }}</th>
              <th>{{ t('express.th_code') }}</th>
              <th>{{ t('express.th_sort') }}</th>
              <th>{{ t('express.th_status') }}</th>
              <th class="col-actions">{{ t('express.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td>{{ record.name }}</td>
              <td class="mono">{{ record.code }}</td>
              <td class="mono">{{ record.sort }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('express.status_enabled') : t('express.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button v-if="record.status === 1" class="btn-ghost btn-sm" @click="handleDisable(record)">{{ t('common.disabled') }}</button>
                <button v-else class="btn-ghost btn-sm" @click="handleEnable(record)">{{ t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="5" class="empty-row"><div class="empty-state"><span class="empty-text">{{ t('express.empty_data') }}</span></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('express.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('express.edit_title') : t('express.add_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('express.section_basic') }}</h4>
        <div class="form-group"><label>{{ t('express.label_name') }} <span class="required">*</span></label><input v-model="form.name" :placeholder="t('express.placeholder_name')" class="form-input" /></div>
        <div class="form-group"><label>{{ t('express.label_code') }}</label><input v-model="form.code" :placeholder="t('express.placeholder_code')" class="form-input" /></div>
        <div class="form-group"><label>{{ t('express.label_sort') }}</label><input v-model.number="form.sort" type="number" class="form-input" /></div>
        <div class="form-group"><label>{{ t('express.label_status') }}</label><sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('express.status_enabled')" :unchecked-text="t('express.status_disabled')" /></div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('express.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('express.btn_save') : t('express.btn_create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getExpressList, createExpress, updateExpress, deleteExpress, updateExpressStatus } from '@/api/express'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => !list.value.length && !loading.value)
const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, name: '', code: '', sort: 0, status: 1 })

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', code: '', sort: 0, status: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateExpress(form.id, form); Message.success(t('express.msg_update_success')) }
    else { await createExpress(form); Message.success(t('express.msg_create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('express.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('express.confirm_delete_title'),
    content: t('express.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteExpress(record.id); Message.success(t('express.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('express.msg_delete_failed')) }
    }
  })
}

const handleEnable = (record) => {
  Modal.warning({
    title: t('express.confirm_enable_title'),
    content: t('express.confirm_enable_msg', { name: record.name }),
    hideCancel: false,
    onOk: async () => {
      try { await updateExpressStatus({ id: record.id, status: 1 }); Message.success(t('express.msg_enabled')); loadData() }
      catch (error) { Message.error(t('express.msg_operation_failed')) }
    }
  })
}

const handleDisable = (record) => {
  Modal.warning({
    title: t('express.confirm_disable_title'),
    content: t('express.confirm_disable_msg', { name: record.name }),
    hideCancel: false,
    onOk: async () => {
      try { await updateExpressStatus({ id: record.id, status: 0 }); Message.success(t('express.msg_disabled')); loadData() }
      catch (error) { Message.error(t('express.msg_operation_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getExpressList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('express.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>


