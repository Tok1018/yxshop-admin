<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('page_seo.title') }}</h1>
        <p class="page-subtitle">{{ t('page_seo.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('page_seo.btn_add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('page_seo.search_placeholder')" :aria-label="t('page_seo.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.lang_code" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('page_seo.filter_all_lang') }}</option>
        <option value="zh-CN">{{ t('page_seo.lang_zh') }}</option>
        <option value="en">{{ t('page_seo.lang_en') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>{{ t('page_seo.th_id') }}</th>
              <th>{{ t('page_seo.th_page_key') }}</th>
              <th>{{ t('page_seo.th_lang') }}</th>
              <th>{{ t('page_seo.th_title') }}</th>
              <th>{{ t('page_seo.th_keywords') }}</th>
              <th class="col-actions">{{ t('page_seo.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id" :class="{ selected: selectedIds.includes(record.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" /></td>
              <td class="mono">{{ record.id }}</td>
              <td><span class="badge-secondary">{{ record.page_key }}</span></td>
              <td><span class="badge-info">{{ langText(record.lang_code) }}</span></td>
              <td class="title-cell" :title="record.title">{{ record.title }}</td>
              <td class="muted keywords-cell" :title="record.keywords">{{ record.keywords || '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <icon-search :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('page_seo.empty_data') }}</span>
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
      <span class="total-text">{{ t('page_seo.total_count', { n: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('page_seo.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-danger btn-sm" @click="batchDelete">{{ t('page_seo.batch_delete') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []; selectAll = false">{{ t('page_seo.cancel_select') }}</button>
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="editingRecord ? t('page_seo.drawer_edit') : t('page_seo.drawer_add')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('page_seo.title') }}</h4>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('page_seo.label_page_key') }} <span class="required">*</span></label>
            <input v-model="form.page_key" type="text" class="form-input" :placeholder="t('page_seo.placeholder_page_key')" />
          </div>
          <div class="form-group">
            <label>{{ t('page_seo.label_lang') }}</label>
            <select v-model="form.lang_code" class="form-input">
              <option value="zh-CN">{{ t('page_seo.lang_zh') }}</option>
              <option value="en">{{ t('page_seo.lang_en') }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('page_seo.label_title') }}</label>
          <input v-model="form.title" type="text" class="form-input" :placeholder="t('page_seo.placeholder_seo_title')" />
        </div>
        <div class="form-group">
          <label>{{ t('page_seo.label_description') }}</label>
          <textarea v-model="form.description" class="form-textarea" :placeholder="t('page_seo.placeholder_seo_desc')" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('page_seo.label_keywords') }}</label>
          <input v-model="form.keywords" type="text" class="form-input" :placeholder="t('page_seo.placeholder_keywords')" />
        </div>
        <div class="form-group">
          <label>{{ t('page_seo.label_og_tags') }}</label>
          <textarea v-model="form.og_tags" class="form-textarea" :placeholder="t('page_seo.placeholder_og')" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>{{ t('page_seo.label_structured_data') }}</label>
          <textarea v-model="form.structured_data" class="form-textarea" :placeholder="t('page_seo.placeholder_jsonld')" rows="3"></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('page_seo.btn_cancel') }}</button>
        <button class="btn-primary" @click="submitForm" :disabled="submitting">
          {{ submitting ? t('page_seo.btn_submitting') : t('page_seo.btn_confirm') }}
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getPageSeoList, createPageSeo, updatePageSeo, deletePageSeo, batchDeletePageSeo } from '@/api/page-seo'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const formVisible = ref(false)
const editingRecord = ref(null)
const submitting = ref(false)
const drawerWidth = 'min(640px, 90vw)'

const filters = ref({ keyword: '', lang_code: '' })

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getPageSeoList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('page_seo.msg_load_failed')) }
  finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(i => i.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const langText = (l) => ({ 'zh-CN': t('page_seo.lang_zh'), 'en': t('page_seo.lang_en') }[l] ?? l)

const form = reactive({ page_key: '', lang_code: 'zh-CN', title: '', description: '', keywords: '', og_tags: '', structured_data: '' })

const openForm = (record = null) => {
  editingRecord.value = record
  if (record) {
    Object.assign(form, {
      page_key: record.page_key || '',
      lang_code: record.lang_code || 'zh-CN',
      title: record.title || '',
      description: record.description || '',
      keywords: record.keywords || '',
      og_tags: record.og_tags || '',
      structured_data: record.structured_data || '',
    })
  } else {
    Object.assign(form, { page_key: '', lang_code: 'zh-CN', title: '', description: '', keywords: '', og_tags: '', structured_data: '' })
  }
  formVisible.value = true
}

const submitForm = async () => {
  if (!form.page_key) { Message.warning(t('page_seo.msg_input_page_key')); return }
  submitting.value = true
  try {
    const data = { ...form }
    if (editingRecord.value) {
      await updatePageSeo(editingRecord.value.id, data)
      Message.success(t('page_seo.msg_update_success'))
    } else {
      await createPageSeo(data)
      Message.success(t('page_seo.msg_create_success'))
    }
    formVisible.value = false
    loadData()
  } catch (e) { Message.error(editingRecord.value ? t('page_seo.msg_update_failed') : t('page_seo.msg_create_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (id) => {
  Modal.warning({
    title: t('page_seo.confirm_delete_title'),
    content: t('page_seo.confirm_delete'),
    hideCancel: false,
    onOk: async () => {
      try { await deletePageSeo(id); Message.success(t('page_seo.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('page_seo.msg_delete_failed')) }
    }
  })
}

const batchDelete = () => {
  Modal.warning({
    title: t('page_seo.confirm_batch_delete_title'),
    content: t('page_seo.confirm_batch_delete', { n: selectedIds.value.length }),
    hideCancel: false,
    onOk: async () => {
      try { await batchDeletePageSeo(selectedIds.value); Message.success(t('page_seo.msg_batch_delete_success')); selectedIds.value = []; selectAll.value = false; loadData() }
      catch (error) { Message.error(t('page_seo.msg_batch_delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

onMounted(() => { loadData() })
</script>

<style scoped>
.title-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.keywords-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}
</style>
