<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('specs.title') }}</h1>
        <p class="page-subtitle">{{ t('specs.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('specs.add_spec') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('specs.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-name">{{ t('specs.th_name') }}</th>
              <th>规格值</th>
              <th class="col-sort">{{ t('specs.th_sort') }}</th>
              <th class="col-status">{{ t('specs.th_status') }}</th>
              <th class="col-time">{{ t('specs.th_time') }}</th>
              <th class="col-actions">{{ t('specs.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>
                <span class="spec-name">{{ r.name }}</span>
              </td>
              <td>
                <div class="values-wrap">
                  <span v-for="(v, i) in (r.values || [])" :key="i" class="value-tag">{{ v.name }}</span>
                  <span v-if="!r.values?.length" class="muted">-</span>
                </div>
              </td>
              <td class="mono">{{ r.sort_order ?? 0 }}</td>
              <td>
                <span :class="['badge', r.status === 1 ? 'badge-success' : 'badge-muted']">
                  {{ r.status === 1 ? t('specs.status_enabled') : t('specs.status_disabled') }}
                </span>
              </td>
              <td class="mono">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(r)">{{ t('specs.btn_edit') }}</button>
                <button class="btn-ghost btn-sm" @click="handleToggleStatus(r)">
                  {{ r.status === 1 ? t('specs.btn_disable') : t('specs.btn_enable') }}
                </button>
                <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('specs.btn_delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('specs.empty_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('specs.total_count', { n: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <!-- 新增/编辑抽屉 -->
    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('specs.edit_spec') : t('specs.add_spec_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('specs.section_basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('specs.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('specs.placeholder_name')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('specs.label_sort') }}</label>
          <input v-model.number="form.sort_order" type="number" :min="0" placeholder="0" class="form-input" />
        </div>
        <div class="form-group" v-if="!form.id">
          <label>{{ t('specs.label_status') }}</label>
          <select v-model="form.status" class="form-input">
            <option :value="1">{{ t('specs.status_enabled') }}</option>
            <option :value="0">{{ t('specs.status_disabled') }}</option>
          </select>
        </div>
      </div>

      <div class="form-section">
        <h4>规格值</h4>
        <div class="spec-values-editor">
          <div v-for="(v, i) in form.values" :key="i" class="spec-value-row">
            <input v-model="v.name" class="form-input spec-value-input" placeholder="如：500ml" />
            <button class="btn-icon-danger" @click="removeValue(i)"><icon-delete /></button>
          </div>
          <button class="btn-dashed-full" @click="addValue">
            <icon-plus />
            {{ t('specs.add_spec_value') }}
          </button>
        </div>
      </div>

      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('specs.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting">{{ t('specs.btn_saving') }}</span>
          <span v-else>{{ form.id ? t('specs.btn_save_changes') : t('specs.btn_create_spec') }}</span>
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconDelete } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getSpecsList, createSpecs, updateSpecs, deleteSpecs, updateSpecsStatus } from '@/api/specs'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })
const formVisible = ref(false)
const form = reactive({ id: null, name: '', sort_order: 0, status: 1, values: [] })
const drawerWidth = 'min(480px, 90vw)'

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts)
    ? new Date(Number(ts) * 1000)
    : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getSpecsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('specs.msg_load_failed')) } finally { loading.value = false }
}

const openForm = (record) => {
  if (record) {
    Object.assign(form, {
      id: record.id,
      name: record.name,
      sort_order: record.sort_order ?? 0,
      status: record.status ?? 1,
      values: (record.values || []).map(v => ({ name: v.name }))
    })
  } else {
    Object.assign(form, { id: null, name: '', sort_order: 0, status: 1, values: [] })
  }
  formVisible.value = true
}

const addValue = () => {
  form.values.push({ name: '' })
}

const removeValue = (idx) => {
  form.values.splice(idx, 1)
}

const handleSubmit = async () => {
  if (!form.name?.trim()) { Message.warning(t('specs.msg_enter_name')); return }
  const cleanValues = form.values.filter(v => v.name?.trim())
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      sort_order: form.sort_order,
      status: form.status,
      values: cleanValues.map(v => ({ name: v.name.trim() }))
    }
    if (form.id) {
      await updateSpecs(form.id, payload)
      Message.success(t('specs.msg_update_success'))
    } else {
      await createSpecs(payload)
      Message.success(t('specs.msg_create_success'))
    }
    formVisible.value = false
    loadData()
  } catch (e) { Message.error(t('specs.msg_operation_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('specs.confirm_delete_title'),
    content: t('specs.confirm_delete_msg', { name: record.name }),
    hideCancel: false,
    onOk: async () => {
      try { await deleteSpecs(record.id); Message.success(t('specs.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('specs.msg_delete_failed')) }
    }
  })
}

const handleToggleStatus = async (record) => {
  try {
    const newStatus = record.status === 1 ? 0 : 1
    await updateSpecsStatus(record.id, { status: newStatus })
    Message.success(newStatus === 1 ? t('specs.msg_enabled') : t('specs.msg_disabled'))
    loadData()
  } catch (error) { Message.error(t('specs.msg_operation_failed')) }
}

onMounted(() => loadData())
</script>

<style scoped>
.col-name { padding-left: 20px; }
.col-sort, .col-status, .col-time { text-align: center; }

.values-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.value-tag {
  display: inline-block;
  padding: 2px 10px;
  background: rgba(var(--color-secondary-rgb), 0.16);
  color: var(--color-on-surface);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.spec-name {
  color: var(--color-on-surface);
  font-size: 13px;
  font-weight: 500;
}

.muted { color: var(--color-on-surface-variant); font-size: 12px; }

.spec-values-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spec-value-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.spec-value-input {
  flex: 1;
}

.btn-icon-danger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-error);
  cursor: pointer;
  flex-shrink: 0;
}

.btn-dashed-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px;
  border: 1px dashed var(--color-outline-variant);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-on-surface-variant);
  cursor: pointer;
  font-size: 13px;
}

.btn-dashed-full:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.badge-success {
background: var(--color-primary-fixed);
color: var(--color-on-primary-fixed);
}

.badge-muted {
  background: rgba(var(--color-on-surface-variant-rgb, 128, 128, 128), 0.16);
  color: var(--color-on-surface-variant, #888);
}
</style>
