<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_levels.title') }}</h1>
        <p class="page-subtitle">{{ t('user_levels.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('user_levels.add_level') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('user_levels.search_placeholder')" :aria-label="t('user_levels.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-name">{{ t('user_levels.th_name') }}</th>
              <th class="col-center">{{ t('user_levels.th_level') }}</th>
              <th class="col-center">{{ t('user_levels.th_exp') }}</th>
              <th class="col-center">{{ t('user_levels.th_discount') }}</th>
              <th class="col-center">{{ t('user_levels.th_status') }}</th>
              <th class="col-center">{{ t('user_levels.th_time') }}</th>
              <th class="col-actions">{{ t('user_levels.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in list" :key="r.id">
              <td>
                <div class="name-cell">
                  <div class="level-icon">
                    <icon-star />
                  </div>
                  <span class="level-name">{{ r.name }}</span>
                </div>
              </td>
              <td class="mono muted col-center">LV.{{ r.level ?? 0 }}</td>
              <td class="mono muted col-center">{{ r.experience ?? 0 }}</td>
              <td class="col-center"><span class="discount-tag">{{ r.discount ?? 100 }}%</span></td>
              <td class="col-center"><span :class="r.status === 1 ? 'badge-success' : 'badge-error'">{{ r.status === 1 ? t('user_levels.status_enabled') : t('user_levels.status_disabled') }}</span></td>
              <td class="mono muted col-center">{{ r.created_at ? formatTime(r.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(r)">{{ t('common.edit') }}</button>
                <button :class="r.status === 1 ? 'btn-ghost btn-sm' : 'btn-primary btn-sm'" @click="toggleStatus(r)">{{ r.status === 1 ? t('user_levels.status_disabled') : t('user_levels.status_enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="7" class="empty-state">
                <icon-empty class="empty-icon" />
                <span class="empty-text">{{ t('user_levels.empty_data') }}</span>
              </td>
            </tr>
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
      :total-text="t('user_levels.total_count', { n: total })"
    />

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('user_levels.edit_level') : t('user_levels.add_level_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('user_levels.section_basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('user_levels.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('user_levels.placeholder_name')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('user_levels.label_level') }}</label>
            <input v-model.number="form.level" type="number" :min="0" placeholder="1" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('user_levels.label_experience') }}</label>
            <input v-model.number="form.experience" type="number" :min="0" placeholder="0" class="form-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('user_levels.label_discount') }}</label>
            <input v-model.number="form.discount" type="number" :min="0" :max="100" placeholder="100" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('user_levels.label_status') }}</label>
            <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('user_levels.status_enabled')" :unchecked-text="t('user_levels.status_disabled')" />
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('user_levels.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">
          <span v-if="submitting">{{ t('user_levels.btn_saving') }}</span>
          <span v-else>{{ form.id ? t('user_levels.btn_save_changes') : t('user_levels.btn_create_level') }}</span>
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconStar, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getUserLevelsList, createUserLevels, updateUserLevels, deleteUserLevels, updateUserLevelsStatus } from '@/api/user_levels'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })
const formVisible = ref(false)
const form = reactive({ id: null, name: '', level: 1, experience: 0, discount: 100, status: 1 })
const drawerWidth = 'min(480px, 90vw)'

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
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
    const res = await getUserLevelsList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('user_levels.msg_load_failed')) }
  finally { loading.value = false }
}

const openForm = (record) => {
  if (record) Object.assign(form, { id: null, name: '', level: 1, experience: 0, discount: 100, status: 1 }, record)
  else Object.assign(form, { id: null, name: '', level: 1, experience: 0, discount: 100, status: 1 })
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name?.trim()) { Message.warning(t('user_levels.msg_enter_name')); return }
  submitting.value = true
  try {
    if (form.id) { await updateUserLevels(form.id, form); Message.success(t('user_levels.msg_update_success')) }
    else { await createUserLevels(form); Message.success(t('user_levels.msg_create_success')) }
    formVisible.value = false; loadData()
  } catch (e) { Message.error(t('user_levels.msg_operation_failed')) }
  finally { submitting.value = false }
}

const toggleStatus = async (record) => {
  try {
    await updateUserLevelsStatus(record.id, record.status === 1 ? 0 : 1)
    Message.success(record.status === 1 ? t('user_levels.msg_disabled') : t('user_levels.msg_enabled'))
    loadData()
  } catch (error) { Message.error(t('user_levels.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({ title: t('user_levels.confirm_delete_title'), content: t('user_levels.confirm_delete_msg', { name: record.name }), hideCancel: false, onOk: async () => { try { await deleteUserLevels(record.id); Message.success(t('user_levels.msg_delete_success')); loadData() } catch (error) { Message.error(t('user_levels.msg_delete_failed')) } } })
}

onMounted(() => loadData())
</script>

<style scoped>



.col-center {
  text-align: center;
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.level-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.level-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface);
}

.discount-tag {
  color: var(--color-primary);
  font-weight: 600;
}



.form-section {
  margin-bottom: 20px;
}

.form-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  margin-bottom: 6px;
}

.form-row {
  display: flex;
  gap: 12px;
}

@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
}
</style>
