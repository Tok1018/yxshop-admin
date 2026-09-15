<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('friendly_link.title') }}</h1>
        <p class="page-subtitle">{{ t('friendly_link.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('friendly_link.add_link') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('friendly_link.search_placeholder')" :aria-label="t('friendly_link.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.status" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('friendly_link.filter_all_status') }}</option>
        <option value="1">{{ t('friendly_link.status_enabled') }}</option>
        <option value="0">{{ t('friendly_link.status_disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>{{ t('friendly_link.th_id') }}</th>
              <th>{{ t('friendly_link.th_name') }}</th>
              <th>{{ t('friendly_link.th_url') }}</th>
              <th>{{ t('friendly_link.th_logo') }}</th>
              <th>{{ t('friendly_link.th_sort') }}</th>
              <th>{{ t('friendly_link.th_status') }}</th>
              <th class="col-actions">{{ t('friendly_link.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id" :class="{ selected: selectedIds.includes(record.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" /></td>
              <td class="mono muted">{{ record.id }}</td>
              <td class="name-cell">{{ record.link_name }}</td>
              <td><a :href="record.link_url" target="_blank" class="link-url">{{ record.link_url }}</a></td>
              <td><div class="logo-cell" v-if="record.link_logo"><img :src="record.link_logo" class="link-logo" alt="Logo" /></div><span v-else class="muted">-</span></td>
              <td class="mono muted">{{ record.sort || 0 }}</td>
              <td><span :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('friendly_link.status_enabled') : t('friendly_link.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="8" class="empty-row">
                <div class="empty-state">
                  <icon-link :size="36" style="opacity:0.3" />
                  <span class="empty-text">{{ t('friendly_link.empty_data') }}</span>
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
      <span class="total-text">{{ t('friendly_link.total_count', { n: total }) }}</span>
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
      <span>{{ t('friendly_link.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-danger btn-sm" @click="batchDelete">{{ t('friendly_link.btn_batch_delete') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []; selectAll = false">{{ t('friendly_link.btn_cancel_select') }}</button>
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="editingRecord ? t('friendly_link.edit_title') : t('friendly_link.add_title')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('friendly_link.title') }}</h4>
        <div class="form-group">
          <label>{{ t('friendly_link.label_name') }} <span class="required">*</span></label>
          <input v-model="form.link_name" type="text" class="form-input" :placeholder="t('friendly_link.placeholder_name')" />
        </div>
        <div class="form-group">
          <label>{{ t('friendly_link.label_url') }} <span class="required">*</span></label>
          <input v-model="form.link_url" type="url" class="form-input" placeholder="https://example.com" />
        </div>
        <div class="form-group">
          <label>{{ t('friendly_link.label_logo') }}</label>
          <input v-model="form.link_logo" type="text" class="form-input" :placeholder="t('friendly_link.placeholder_logo')" />
        </div>
        <div class="form-group">
          <label>{{ t('friendly_link.label_sort') }}</label>
          <input v-model.number="form.sort" type="number" class="form-input" placeholder="0" />
        </div>
        <div class="form-group">
          <label>{{ t('friendly_link.label_status') }}</label>
          <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('friendly_link.status_enabled')" :unchecked-text="t('friendly_link.status_disabled')" />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('friendly_link.btn_cancel') }}</button>
        <button class="btn-primary" @click="submitForm" :disabled="submitting">{{ submitting ? t('friendly_link.btn_submitting') : t('friendly_link.btn_submit') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus, IconLink } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getFriendlyLinkList, createFriendlyLink, updateFriendlyLink, deleteFriendlyLink, batchDeleteFriendlyLink } from '@/api/friendly-link'

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
const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '', status: '' })
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getFriendlyLinkList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('friendly_link.msg_load_failed')) }
  finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(i => i.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const form = reactive({ link_name: '', link_url: '', link_logo: '', sort: 0, status: 1 })
const openForm = (record = null) => {
  editingRecord.value = record
  if (record) {
    Object.assign(form, { link_name: record.link_name || '', link_url: record.link_url || '', link_logo: record.link_logo || '', sort: record.sort ?? 0, status: record.status ?? 1 })
  } else {
    Object.assign(form, { link_name: '', link_url: '', link_logo: '', sort: 0, status: 1 })
  }
  formVisible.value = true
}

const submitForm = async () => {
  if (!form.link_name) { Message.warning(t('friendly_link.msg_enter_name')); return }
  if (!form.link_url) { Message.warning(t('friendly_link.msg_enter_url')); return }
  submitting.value = true
  try {
    const data = { ...form }
    if (editingRecord.value) { await updateFriendlyLink(editingRecord.value.id, data); Message.success(t('friendly_link.msg_update_success')) }
    else { await createFriendlyLink(data); Message.success(t('friendly_link.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (e) { Message.error(editingRecord.value ? t('friendly_link.msg_update_failed') : t('friendly_link.msg_create_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (id) => {
  Modal.warning({
    title: t('friendly_link.confirm_delete_title'),
    content: t('friendly_link.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteFriendlyLink(id); Message.success(t('friendly_link.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('friendly_link.msg_delete_failed')) }
    }
  })
}

const batchDelete = () => {
  Modal.warning({
    title: t('friendly_link.confirm_batch_delete_title'),
    content: t('friendly_link.confirm_batch_delete_msg', { n: selectedIds.value.length }),
    hideCancel: false,
    onOk: async () => {
      try { await batchDeleteFriendlyLink(selectedIds.value); Message.success(t('friendly_link.msg_batch_delete_success')); selectedIds.value = []; selectAll.value = false; loadData() }
      catch (error) { Message.error(t('friendly_link.msg_batch_delete_failed')) }
    }
  })
}

const onPageChange = (p) => { page.value = p; loadData() }

onMounted(() => loadData())
</script>

<style scoped>
.name-cell {
  color: var(--color-on-surface);
  font-weight: 500;
}

.link-url {
  color: var(--color-secondary);
  text-decoration: none;
  font-size: 12px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.link-url:hover {
  text-decoration: underline;
}

.logo-cell {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: inline-block;
}

.link-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
