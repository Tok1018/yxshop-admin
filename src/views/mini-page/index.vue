<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('mini_page.title') }}</h1>
        <p class="page-subtitle">{{ t('mini_page.subtitle') }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-ghost" @click="openTemplateModal">
          <icon-layout />
          从模板创建
        </button>
        <button class="btn-primary" @click="openCreateModal">
          <icon-plus />
          {{ t('mini_page.create_page') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('mini_page.search_placeholder')" :aria-label="t('mini_page.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.page_type" class="filter-select" @change="loadData">
        <option value="">{{ t('mini_page.all_type') }}</option>
        <option value="home">{{ t('mini_page.type_home') }}</option>
        <option value="custom">{{ t('mini_page.type_custom') }}</option>
      </select>
      <select v-model="filters.status" class="filter-select" @change="loadData">
        <option value="">{{ t('common.allStatus') }}</option>
        <option value="draft">{{ t('mini_page.status_draft') }}</option>
        <option value="published">{{ t('mini_page.status_published') }}</option>
        <option value="offline">{{ t('mini_page.status_offline') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('mini_page.col_page_name') }}</th>
              <th>{{ t('mini_page.col_page_type') }}</th>
              <th>{{ t('mini_page.col_status') }}</th>
              <th>{{ t('mini_page.col_updated_at') }}</th>
              <th class="col-actions">{{ t('mini_page.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="title-cell">{{ record.page_name || '-' }}</td>
              <td><span :class="record.page_type === 'home' ? 'badge-info' : 'badge-warning'">{{ record.page_type === 'home' ? t('mini_page.type_home') : t('mini_page.type_custom') }}</span></td>
              <td><span :class="statusBadgeClass(record.status)">{{ statusLabel(record.status) }}</span></td>
              <td class="mono muted">{{ formatTime(record.updated_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="goEditor(record)">{{ t('mini_page.btn_decorate') }}</button>
                <button v-if="record.status !== 'published'" class="btn-primary btn-sm" @click="handlePublish(record)">{{ t('mini_page.btn_publish') }}</button>
                <button v-if="record.status === 'published'" class="btn-ghost btn-sm" @click="handleUnpublish(record)">{{ t('mini_page.btn_unpublish') }}</button>
                <button class="btn-danger btn-sm" :disabled="record.status === 'published'" @click="handleDeleteConfirm(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('common.noData') }}</span>
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
      <span class="total-text">{{ t('common.total', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>

    <a-modal v-model:visible="createVisible" :title="t('mini_page.create_page')" @ok="handleCreate" :ok-loading="createLoading">
      <a-form :model="createForm" layout="vertical">
        <a-form-item :label="t('mini_page.col_page_name')" required>
          <a-input v-model="createForm.page_name" :placeholder="t('mini_page.page_name_placeholder')" />
        </a-form-item>
        <a-form-item :label="t('mini_page.col_page_type')" required>
          <a-select v-model="createForm.page_type" :placeholder="t('mini_page.page_type_placeholder')">
            <a-option value="home">{{ t('mini_page.type_home') }}</a-option>
            <a-option value="custom">{{ t('mini_page.type_custom') }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="templateVisible" title="从模板创建页面" :footer="false" width="600px">
      <div v-if="templateLoading" style="padding: 40px; text-align: center;">
        <a-spin />
      </div>
      <div v-else-if="builtinTemplates.length" class="template-list">
        <div v-for="tpl in builtinTemplates" :key="tpl.template_id" class="template-card">
          <div class="tpl-info">
            <div class="tpl-name">{{ tpl.template_name }}</div>
            <div class="tpl-desc">{{ tpl.description }}</div>
            <div class="tpl-meta">
              <a-tag size="small" color="blue">{{ tpl.page_type === 'home' ? '首页' : '自定义' }}</a-tag>
              <a-tag size="small">{{ tpl.component_count }} 个组件</a-tag>
            </div>
          </div>
          <a-button type="primary" size="small" :loading="applyLoading" @click="handleApplyTemplate(tpl)">使用此模板</a-button>
        </div>
      </div>
      <div v-else style="padding: 40px; text-align: center; color: #999;">
        暂无内置模板
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconLayout } from '@arco-design/web-vue/es/icon'
import { getMiniPageList, createMiniPage, deleteMiniPage, publishMiniPage, unpublishMiniPage, getBuiltinTemplates, createPageFromBuiltin } from '@/api/mini-page'

const { t } = useI18n()
const router = useRouter()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const createVisible = ref(false)
const createLoading = ref(false)
const filters = ref({ keyword: '', page_type: '', status: '' })
const createForm = reactive({ page_name: '', page_type: 'custom' })
const templateVisible = ref(false)
const templateLoading = ref(false)
const builtinTemplates = ref([])
const applyLoading = ref(false)

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const statusBadgeClass = (status) => {
  const map = { draft: 'badge-info', published: 'badge-success', offline: 'badge-error' }
  return map[status] || 'badge-info'
}

const statusLabel = (status) => {
  const map = { draft: t('mini_page.status_draft'), published: t('mini_page.status_published'), offline: t('mini_page.status_offline') }
  return map[status] || status
}

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const openCreateModal = () => {
  createForm.page_name = ''
  createForm.page_type = 'custom'
  createVisible.value = true
}

const handleCreate = async () => {
  if (!createForm.page_name) { Message.warning(t('mini_page.page_name_required')); return }
  createLoading.value = true
  try {
    await createMiniPage(createForm)
    Message.success(t('mini_page.create_success'))
    createVisible.value = false
    loadData()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { createLoading.value = false }
}

const goEditor = (record) => {
  router.push({ name: 'miniPageEditor', params: { id: record.id } })
}

const handlePublish = async (record) => {
  try { await publishMiniPage(record.id); Message.success(t('mini_page.publish_success')); loadData() }
  catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const handleUnpublish = async (record) => {
  try { await unpublishMiniPage(record.id); Message.success(t('mini_page.unpublish_success')); loadData() }
  catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const handleDeleteConfirm = (record) => {
  if (record.status === 'published') return
  Modal.warning({
    title: t('common.delete'),
    content: t('mini_page.delete_confirm'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteMiniPage(record.id); Message.success(t('mini_page.delete_success')); loadData() }
      catch (e) { Message.error(t('mini_page.operation_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getMiniPageList(params)
    const data = res.data?.data || res.data || {}
    list.value = data.list || []
    total.value = data.total || 0
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())

const openTemplateModal = async () => {
  templateVisible.value = true
  templateLoading.value = true
  try {
    const res = await getBuiltinTemplates()
    builtinTemplates.value = res.data?.data || res.data || []
  } catch (e) { Message.error('加载模板失败') }
  finally { templateLoading.value = false }
}

const handleApplyTemplate = async (tpl) => {
  applyLoading.value = true
  try {
    const res = await createPageFromBuiltin(tpl.template_id, { page_name: tpl.template_name, page_type: tpl.page_type })
    Message.success('从模板创建页面成功')
    templateVisible.value = false
    const page = res.data?.data?.page || res.data?.page
    if (page && page.id) {
      router.push({ name: 'miniPageEditor', params: { id: page.id } })
    } else {
      loadData()
    }
  } catch (e) { Message.error('创建失败: ' + (e.message || '')) }
  finally { applyLoading.value = false }
}
</script>

<style scoped>
.title-cell {
  color: var(--color-on-surface);
  font-weight: 500;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.template-list { display: flex; flex-direction: column; gap: 12px; }
.template-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--color-outline-variant); border-radius: 12px; transition: all 0.2s; }
.template-card:hover { border-color: var(--color-secondary); background: var(--color-surface-container-low); }
.tpl-info { flex: 1; }
.tpl-name { font-size: 15px; font-weight: 600; color: var(--color-on-surface); }
.tpl-desc { font-size: 12px; color: var(--color-on-surface-variant); margin-top: 4px; line-height: 1.5; }
.tpl-meta { margin-top: 8px; display: flex; gap: 4px; }
</style>
