<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('recharge_package.title') }}</h1>
        <p class="page-subtitle">{{ t('recharge_package.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openModal()">
          <icon-plus />
          {{ t('recharge_package.btn_add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('recharge_package.search_placeholder')" :aria-label="t('recharge_package.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.status" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('recharge_package.filter_all_status') }}</option>
        <option value="1">{{ t('recharge_package.status_enabled') }}</option>
        <option value="0">{{ t('recharge_package.status_disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>{{ t('recharge_package.th_id') }}</th>
              <th>{{ t('recharge_package.th_name') }}</th>
              <th>{{ t('recharge_package.th_amount') }}</th>
              <th>{{ t('recharge_package.th_bonus') }}</th>
              <th>{{ t('recharge_package.th_points') }}</th>
              <th>{{ t('recharge_package.th_sort') }}</th>
              <th>{{ t('recharge_package.th_status') }}</th>
              <th class="col-actions">{{ t('recharge_package.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id" :class="{ selected: selectedIds.includes(record.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" /></td>
              <td class="mono">{{ record.id }}</td>
              <td>{{ record.package_name }}</td>
              <td class="mono text-primary">¥{{ Number(record.recharge_amount || 0).toFixed(2) }}</td>
              <td class="mono text-success">+¥{{ Number(record.bonus_amount || 0).toFixed(2) }}</td>
              <td class="mono muted">{{ record.bonus_points || 0 }}</td>
              <td class="mono">{{ record.sort || 0 }}</td>
              <td><span :class="record.status === 1 ? 'badge-success' : 'badge-info'">{{ record.status === 1 ? t('recharge_package.status_enabled') : t('recharge_package.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openModal(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="9" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('recharge_package.empty_data') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <a-pagination
      v-if="total > 0"
      :current="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
      class="arco-pagination-md3"
      show-total
      :total-text="t('recharge_package.total_count', { n: total })"
    />

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('recharge_package.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-danger btn-sm" @click="batchDelete">{{ t('recharge_package.batch_delete') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []; selectAll = false">{{ t('recharge_package.cancel_select') }}</button>
    </div>

    <a-drawer
      :visible="showModal"
      class="arco-drawer-md3"
      :width="'min(480px, 90vw)'"
      :unmount-on-close="true"
      @cancel="showModal = false"
      :title="editingRecord ? t('recharge_package.drawer_edit') : t('recharge_package.drawer_add')"
    >
      <div class="form-group">
        <label>{{ t('recharge_package.label_name') }} <span class="required">*</span></label>
        <input v-model="form.package_name" type="text" class="form-input" :placeholder="t('recharge_package.placeholder_name')" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>{{ t('recharge_package.label_amount') }} <span class="required">*</span></label>
          <input v-model="form.recharge_amount" type="number" step="0.01" class="form-input" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>{{ t('recharge_package.label_bonus') }}</label>
          <input v-model="form.bonus_amount" type="number" step="0.01" class="form-input" placeholder="0.00" />
        </div>
      </div>
      <div class="form-group">
        <label>{{ t('recharge_package.label_points') }}</label>
        <input v-model="form.bonus_points" type="number" class="form-input" placeholder="0" />
      </div>
      <div class="form-group">
        <label>{{ t('recharge_package.label_sort') }}</label>
        <input v-model="form.sort" type="number" class="form-input" placeholder="0" />
      </div>
      <div class="form-group">
        <label>{{ t('recharge_package.label_status') }}</label>
        <select v-model="form.status" class="form-select">
          <option value="1">{{ t('recharge_package.status_enabled') }}</option>
          <option value="0">{{ t('recharge_package.status_disabled') }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="showModal = false">{{ t('recharge_package.btn_cancel') }}</button>
        <button class="btn-primary" @click="submitForm" :disabled="submitting">
          {{ submitting ? t('recharge_package.btn_submitting') : t('recharge_package.btn_confirm') }}
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getRechargePackageList, createRechargePackage, updateRechargePackage, deleteRechargePackage, batchDeleteRechargePackage } from '@/api/recharge-package'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const showModal = ref(false)
const editingRecord = ref(null)
const submitting = ref(false)

const filters = ref({ keyword: '', status: '' })

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getRechargePackageList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('recharge_package.msg_load_failed')) }
  finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(i => i.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const form = ref({ package_name: '', recharge_amount: '', bonus_amount: '', bonus_points: 0, sort: 0, status: 1 })

const openModal = (record = null) => {
  editingRecord.value = record
  if (record) {
    form.value = {
      package_name: record.package_name || '',
      recharge_amount: record.recharge_amount || '',
      bonus_amount: record.bonus_amount || '',
      bonus_points: record.bonus_points ?? 0,
      sort: record.sort ?? 0,
      status: record.status ?? 1,
    }
  } else {
    form.value = { package_name: '', recharge_amount: '', bonus_amount: '', bonus_points: 0, sort: 0, status: 1 }
  }
  showModal.value = true
}

const submitForm = async () => {
  if (!form.value.package_name) { Message.warning(t('recharge_package.msg_input_name')); return }
  if (!form.value.recharge_amount) { Message.warning(t('recharge_package.msg_input_amount')); return }
  submitting.value = true
  try {
    const data = { ...form.value }
    if (editingRecord.value) {
      await updateRechargePackage(editingRecord.value.id, data)
      Message.success(t('recharge_package.msg_update_success'))
    } else {
      await createRechargePackage(data)
      Message.success(t('recharge_package.msg_create_success'))
    }
    showModal.value = false
    loadData()
  } catch (e) { Message.error(editingRecord.value ? t('recharge_package.msg_update_failed') : t('recharge_package.msg_create_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (id) => {
  Modal.warning({ title: t('recharge_package.confirm_delete_title'), content: t('recharge_package.confirm_delete'), hideCancel: false, onOk: async () => { try { await deleteRechargePackage(id); Message.success(t('recharge_package.msg_delete_success')); loadData() } catch (error) { Message.error(t('recharge_package.msg_delete_failed')) } } })
}

const batchDelete = () => {
  Modal.warning({ title: t('recharge_package.confirm_batch_delete_title'), content: t('recharge_package.confirm_batch_delete', { n: selectedIds.value.length }), hideCancel: false, onOk: async () => { try { await batchDeleteRechargePackage(selectedIds.value); Message.success(t('recharge_package.msg_batch_delete_success')); selectedIds.value = []; selectAll.value = false; loadData() } catch (error) { Message.error(t('recharge_package.msg_batch_delete_failed')) } } })
}

onMounted(() => { loadData() })
</script>

<style scoped>
.text-primary { color: var(--color-on-surface); font-weight: 600; }
.text-success { color: var(--color-primary); }

.batch-bar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; padding: 10px 20px; background: rgba(var(--color-secondary-rgb), 0.1); backdrop-filter: blur(16px); border: 1px solid rgba(var(--color-secondary-rgb), 0.3); border-radius: 10px; font-size: 13px; color: var(--color-on-surface); z-index: 100; }
</style>
