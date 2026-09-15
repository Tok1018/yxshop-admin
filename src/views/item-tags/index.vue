<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('item_tags.title') }}</h1>
        <p class="page-subtitle">{{ t('item_tags.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('item_tags.add') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('item_tags.search_placeholder')" :aria-label="t('item_tags.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('item_tags.name') }}</th>
              <th>{{ t('item_tags.color') }}</th>
              <th>{{ t('item_tags.sort') }}</th>
              <th>{{ t('item_tags.status') }}</th>
              <th class="col-actions">{{ t('item_tags.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td>
                <span class="tag-badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.tag_name }}</span>
              </td>
              <td>
                <span class="color-dot" :class="record.tag_color || 'default'"></span>
                {{ record.tag_color || '#ff6b6b' }}
              </td>
              <td class="mono">{{ record.sort }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('item_tags.enabled') : t('item_tags.disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button v-if="record.status === 1" class="btn-ghost btn-sm" @click="handleDisable(record)">{{ t('common.disabled') }}</button>
                <button v-else class="btn-ghost btn-sm" @click="handleEnable(record)">{{ t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('item_tags.no_data') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('item_tags.total', { count: total }) }}</span>
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
      :title="(form.id ? t('item_tags.edit') : t('item_tags.add')) + t('item_tags.tag')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('item_tags.basic_info') }}</h4>
        <div class="form-group">
          <label>{{ t('item_tags.name') }} <span class="required">*</span></label>
          <input v-model="form.tag_name" :placeholder="t('item_tags.name_placeholder')" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('item_tags.color') }}</label>
          <div class="color-picker-row">
            <input type="color" v-model="form.tag_color" class="color-input" />
            <input v-model="form.tag_color" placeholder="#ff6b6b" class="form-input color-text" />
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('item_tags.sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('item_tags.status') }}</label>
          <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('item_tags.enabled')" :unchecked-text="t('item_tags.disabled')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('item_tags.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('item_tags.save_modify') : t('item_tags.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { getItemTagsList, createItemTags, updateItemTags, deleteItemTags, updateItemTagsStatus } from '@/api/item_tags'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const showListEmpty = computed(() => !list.value.length && !loading.value)
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, tag_name: '', tag_color: '#ff6b6b', sort: 0, status: 1 })

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const openForm = (record) => {
  Object.assign(form, { id: null, tag_name: '', tag_color: '#ff6b6b', sort: 0, status: 1 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateItemTags(form.id, form); Message.success(t('item_tags.update_success')) }
    else { await createItemTags(form); Message.success(t('item_tags.create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('item_tags.operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('item_tags.delete'),
    content: t('item_tags.confirm_delete'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteItemTags(record.id); Message.success(t('item_tags.delete_success')); loadData() }
      catch (error) { Message.error(t('item_tags.delete_failed')) }
    }
  })
}

const handleEnable = (record) => {
  Modal.warning({
    title: t('item_tags.enable_tag'),
    content: t('item_tags.confirm_enable', { name: record.tag_name }),
    hideCancel: false,
    onOk: async () => {
      try { await updateItemTagsStatus(record.id, 1); Message.success(t('item_tags.enabled')); loadData() }
      catch (error) { Message.error(t('item_tags.operation_failed')) }
    }
  })
}

const handleDisable = (record) => {
  Modal.warning({
    title: t('item_tags.disable_tag'),
    content: t('item_tags.confirm_disable', { name: record.tag_name }),
    hideCancel: false,
    onOk: async () => {
      try { await updateItemTagsStatus(record.id, 0); Message.success(t('item_tags.disabled')); loadData() }
      catch (error) { Message.error(t('item_tags.operation_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getItemTagsList(params)
    list.value = res.data?.data || res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('item_tags.operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content {
  min-height: 100%;
  background: var(--color-surface);
}

.table-card {
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
}


.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 500;
}

.color-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 4px;
  border: 1px solid var(--color-outline-variant);
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 36px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: transparent;
}

.color-text {
  flex: 1;
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
</style>
