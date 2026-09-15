<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('regions.title') }}</h1>
        <p class="page-subtitle">{{ t('regions.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('regions.add_region') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('regions.search_placeholder')" :aria-label="t('regions.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('regions.th_name') }}</th>
              <th>{{ t('regions.th_code') }}</th>
              <th>{{ t('regions.th_level') }}</th>
              <th>{{ t('regions.th_pinyin') }}</th>
              <th>{{ t('regions.th_zip_code') }}</th>
              <th class="col-actions">{{ t('regions.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.name }}</td>
              <td class="mono"><span class="badge-tertiary" v-if="record.code">{{ record.code }}</span><span v-else class="muted">-</span></td>
              <td><span :class="['badge', levelClass(record.level)]">{{ levelText(record.level) }}</span></td>
              <td class="mono muted">{{ record.pinyin || '-' }}</td>
              <td class="mono muted">{{ record.zip_code || '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <icon-location :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('regions.empty_data') }}</span>
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
      <span class="total-text">{{ t('regions.total_count', { n: total }) }}</span>
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
      :title="form.id ? t('regions.edit_title') : t('regions.add_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('regions.section_basic') }}</h4>
        <div class="form-group">
          <label>{{ t('regions.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :placeholder="t('regions.placeholder_name')" />
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_shortname') }}</label>
          <input v-model="form.shortname" class="form-input" :placeholder="t('regions.placeholder_shortname')" />
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_pid') }}</label>
          <a-tree-select
            v-model="form.pid"
            :data="regionTreeData"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            allow-clear
            :placeholder="t('regions.placeholder_pid')"
            style="width: 100%"
          />
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_level') }}</label>
          <a-select v-model="form.level" :placeholder="t('regions.placeholder_level')">
            <a-option :value="1">{{ t('regions.level_province') }}</a-option>
            <a-option :value="2">{{ t('regions.level_city') }}</a-option>
            <a-option :value="3">{{ t('regions.level_district') }}</a-option>
          </a-select>
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_code') }}</label>
          <input v-model="form.code" class="form-input" :placeholder="t('regions.placeholder_code')" />
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_pinyin') }}</label>
          <input v-model="form.pinyin" class="form-input" :placeholder="t('regions.placeholder_pinyin')" />
        </div>
        <div class="form-group">
          <label>{{ t('regions.label_zip_code') }}</label>
          <input v-model="form.zip_code" class="form-input" :placeholder="t('regions.placeholder_zip_code')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('regions.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('regions.btn_save') : t('regions.btn_create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { IconSearch, IconPlus, IconLocation } from '@arco-design/web-vue/es/icon'
import { getRegionsList, getRegionsTree, createRegion, updateRegion, deleteRegion } from '@/api/regions'

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
const form = reactive({ id: null, name: '', shortname: '', pid: 0, level: 1, code: '', pinyin: '', zip_code: '' })
const drawerWidth = 'min(480px, 90vw)'
const regionTreeData = ref([])

const levelText = (level) => {
  if (level === 1) return t('regions.level_province')
  if (level === 2) return t('regions.level_city')
  if (level === 3) return t('regions.level_district')
  return '-'
}

const levelClass = (level) => {
  if (level === 1) return 'badge-primary'
  if (level === 2) return 'badge-tertiary'
  if (level === 3) return 'badge-secondary'
  return 'badge-tertiary'
}

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', shortname: '', pid: 0, level: 1, code: '', pinyin: '', zip_code: '' }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { Message.warning(t('regions.placeholder_name')); return }
  try {
    if (form.id) { await updateRegion(form.id, form); Message.success(t('regions.msg_update_success')) }
    else { await createRegion(form); Message.success(t('regions.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('regions.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('regions.confirm_delete_title'),
    content: t('regions.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteRegion(record.id); Message.success(t('regions.msg_delete_success')); loadData() }
      catch (error) { Message.error(error?.response?.data?.message || t('regions.msg_delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getRegionsList(params)
    list.value = res.data?.list || res.data?.data || []
    total.value = res.data?.total || res.data?.meta?.total || 0
  } catch (error) { Message.error(t('regions.msg_operation_failed')) }
  finally { loading.value = false }
}

const loadRegionTree = async () => {
  try {
    const res = await getRegionsTree()
    regionTreeData.value = res.data?.data || res.data || []
  } catch (error) { /* ignore */ }
}

onMounted(() => {
  loadData()
  loadRegionTree()
})
</script>

<style scoped>
.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.badge-primary {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}
.badge-secondary {
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
}
.badge-tertiary {
  background: rgba(var(--color-tertiary-rgb), 0.1);
  color: var(--color-tertiary);
}
</style>
