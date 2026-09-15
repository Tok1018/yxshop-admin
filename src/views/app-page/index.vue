<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('app_page.title') }}</h1>
        <p class="page-subtitle">{{ t('app_page.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('app_page.add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('app_page.search_placeholder')" :aria-label="t('app_page.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('app_page.col_name') }}</th>
              <th>{{ t('app_page.col_path') }}</th>
              <th>{{ t('app_page.col_sort') }}</th>
              <th class="col-actions">{{ t('app_page.col_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in filteredList" :key="record.id">
              <td class="name-cell">{{ record.name || '-' }}</td>
              <td class="mono"><span class="path-tag">{{ record.path || '-' }}</span></td>
              <td class="mono muted">{{ record.sort || 0 }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="4" class="empty-row">
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

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="(form.id ? t('common.edit') : t('app_page.add')) + t('app_page.page_suffix')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('app_page.title') }}</h4>
        <div class="form-group">
          <label>{{ t('app_page.col_name') }} <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :placeholder="t('app_page.name_placeholder')" />
        </div>
        <div class="form-group">
          <label>{{ t('app_page.col_path') }} <span class="required">*</span></label>
          <input v-model="form.path" class="form-input" placeholder="/pages/index/index" />
        </div>
        <div class="form-group">
          <label>{{ t('app_page.col_sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('common.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit" :disabled="submitting">{{ submitting ? t('common.submit') : (form.id ? t('app_page.save_changes') : t('app_page.create')) }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { getAppPageList, createAppPage, updateAppPage, deleteAppPage } from '@/api/app-page'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const submitting = ref(false)
const formVisible = ref(false)
const filters = ref({ keyword: '' })
const form = reactive({ id: null, name: '', path: '', sort: 0 })
const drawerWidth = 'min(480px, 90vw)'

const showListEmpty = computed(() => !filteredList.value.length && !loading.value)

const filteredList = computed(() => {
  if (!filters.value.keyword) return list.value
  const kw = filters.value.keyword.toLowerCase()
  return list.value.filter(r => (r.name || '').toLowerCase().includes(kw) || (r.path || '').toLowerCase().includes(kw))
})

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { /* filteredList is computed */ }, 400) }

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', path: '', sort: 0 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name || !form.path) { Message.warning(t('app_page.name_placeholder')); return }
  submitting.value = true
  try {
    if (form.id) { await updateAppPage(form.id, form); Message.success(t('app_page.update_success')) }
    else { await createAppPage(form); Message.success(t('app_page.create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('app_page.operation_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('common.delete'),
    content: t('app_page.delete_confirm_content'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteAppPage(record.id); Message.success(t('app_page.delete_success')); loadData() }
      catch (error) { Message.error(t('app_page.operation_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAppPageList()
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
  } catch (error) { Message.error(t('app_page.operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.path-tag {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-size: 12px;
  background: rgba(var(--color-secondary-rgb), 0.1);
  color: var(--color-secondary);
  padding: 2px 8px;
  border-radius: 4px;
}
</style>
