<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('currencies.title') }}</h1>
        <p class="page-subtitle">{{ t('currencies.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('currencies.add_currency') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('currencies.search_placeholder')" :aria-label="t('currencies.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('currencies.th_name') }}</th>
              <th>{{ t('currencies.th_code') }}</th>
              <th>{{ t('currencies.th_symbol') }}</th>
              <th>{{ t('currencies.th_rate') }}</th>
              <th>{{ t('currencies.th_status') }}</th>
              <th class="col-actions">{{ t('currencies.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.name }}</td>
              <td class="mono"><span class="badge-tertiary">{{ record.code }}</span></td>
              <td class="mono symbol-cell">{{ record.symbol }}</td>
              <td class="mono muted">{{ record.rate }}</td>
              <td><span :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('currencies.status_enabled') : t('currencies.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <icon-swap :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('currencies.empty_data') }}</span>
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
      <span class="total-text">{{ t('currencies.total_count', { n: total }) }}</span>
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
      :title="form.id ? t('currencies.edit_title') : t('currencies.add_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('currencies.section_basic') }}</h4>
        <div class="form-group">
          <label>{{ t('currencies.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :placeholder="t('currencies.placeholder_name')" />
        </div>
        <div class="form-group">
          <label>{{ t('currencies.label_code') }}</label>
          <input v-model="form.code" class="form-input" :placeholder="t('currencies.placeholder_code')" />
        </div>
        <div class="form-group">
          <label>{{ t('currencies.label_symbol') }}</label>
          <input v-model="form.symbol" class="form-input" :placeholder="t('currencies.placeholder_symbol')" />
        </div>
        <div class="form-group">
          <label>{{ t('currencies.label_rate') }}</label>
          <input v-model.number="form.rate" type="number" class="form-input" :placeholder="t('currencies.placeholder_rate')" />
        </div>
        <div class="form-group">
          <label>{{ t('currencies.label_status') }}</label>
          <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('currencies.status_enabled')" :unchecked-text="t('currencies.status_disabled')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('currencies.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('currencies.btn_save') : t('currencies.btn_create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconPlus, IconSwap } from '@arco-design/web-vue/es/icon'
import { getCurrenciesList, createCurrencies, updateCurrencies, deleteCurrencies } from '@/api/currencies'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, name: '', code: '', symbol: '', rate: 1, status: 1 })
const drawerWidth = 'min(480px, 90vw)'

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', code: '', symbol: '', rate: 1, status: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateCurrencies(form.id, form); Message.success(t('currencies.msg_update_success')) }
    else { await createCurrencies(form); Message.success(t('currencies.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('currencies.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('currencies.confirm_delete_title'),
    content: t('currencies.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteCurrencies(record.id); Message.success(t('currencies.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('currencies.msg_delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getCurrenciesList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('currencies.msg_operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.symbol-cell {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-tertiary);
}
</style>
