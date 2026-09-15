<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('article_category.title') }}</h1>
        <p class="page-subtitle">{{ t('article_category.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus :size="14" />
          {{ t('article_category.add_category') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('article_category.search_placeholder')" :aria-label="t('article_category.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('article_category.th_name') }}</th>
              <th>{{ t('article_category.th_sort') }}</th>
              <th>{{ t('article_category.th_status') }}</th>
              <th class="col-actions">{{ t('article_category.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.name }}</td>
              <td class="mono muted">{{ record.sort }}</td>
              <td><span :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('article_category.status_enabled') : t('article_category.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="4" class="empty-row">
                <div class="empty-state">
                  <icon-folder :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('article_category.empty_data') }}</span>
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
      <span class="total-text">{{ t('article_category.total_count', { n: total }) }}</span>
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
      :title="form.id ? t('article_category.edit_title') : t('article_category.add_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('article_category.section_basic') }}</h4>
        <div class="form-group">
          <label>{{ t('article_category.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" class="form-input" :placeholder="t('article_category.placeholder_name')" />
        </div>
        <div class="form-group">
          <label>{{ t('article_category.label_sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('article_category.label_status') }}</label>
          <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('article_category.status_enabled')" :unchecked-text="t('article_category.status_disabled')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('article_category.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('article_category.btn_save') : t('article_category.btn_create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconFolder } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getArticleCategoryList, createArticleCategory, updateArticleCategory, deleteArticleCategory } from '@/api/article'

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
const form = reactive({ id: null, name: '', sort: 0, status: 1 })
const drawerWidth = 'min(480px, 90vw)'

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', sort: 0, status: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateArticleCategory(form.id, form); Message.success(t('article_category.msg_update_success')) }
    else { await createArticleCategory(form); Message.success(t('article_category.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('article_category.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('article_category.confirm_delete_title'),
    content: t('article_category.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteArticleCategory(record.id); Message.success(t('article_category.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('article_category.msg_delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getArticleCategoryList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('article_category.msg_operation_failed')) }
  finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}
</style>
