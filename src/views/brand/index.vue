<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('brand.title') }}</h1>
        <p class="page-subtitle">{{ t('brand.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('brand.add_brand') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('brand.search_placeholder')" :aria-label="t('brand.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.status" class="filter-select" @change="loadData">
        <option value="">{{ t('brand.all_status') }}</option>
        <option value="1">{{ t('brand.option_enabled') }}</option>
        <option value="0">{{ t('brand.option_disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>{{ t('brand.th_brand') }}</th>
              <th>{{ t('brand.th_sort') }}</th>
              <th>{{ t('brand.th_status') }}</th>
              <th>{{ t('brand.th_description') }}</th>
              <th class="col-actions">{{ t('brand.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="brand in list" :key="brand.id" :class="{ selected: selectedIds.includes(brand.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(brand.id)" @change="toggleSelect(brand.id)" /></td>
              <td>
                <div class="brand-cell">
                  <div class="brand-logo">
                    <img v-if="brand.logo" :src="brand.logo" alt="品牌Logo" />
                    <span v-else class="no-logo">{{ (brand.name || '?')[0] }}</span>
                  </div>
                  <div class="brand-info">
                    <span class="brand-name">{{ brand.name }}</span>
                    <span class="brand-id mono">ID: {{ brand.id }}</span>
                  </div>
                </div>
              </td>
              <td class="mono">{{ brand.sort || 0 }}</td>
              <td><span class="badge" :class="brand.status === 1 ? 'badge-success' : 'badge-error'">{{ brand.status === 1 ? t('brand.status_enabled') : t('brand.status_disabled') }}</span></td>
              <td class="desc-cell">{{ brand.desc || '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(brand)">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(brand)">{{ brand.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(brand.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="isBrandListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('brand.empty_data') }}</span>
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
      <span class="total-text">{{ t('brand.total_count', { n: total }) }}</span>
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
      <span>{{ t('brand.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-ghost btn-sm" @click="batchToggleStatus(1)">{{ t('brand.batch_enable') }}</button>
      <button class="btn-ghost btn-sm" @click="batchToggleStatus(0)">{{ t('brand.batch_disable') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []">{{ t('brand.cancel_select') }}</button>
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('brand.edit_brand') : t('brand.add_brand')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <h4>{{ t('brand.section_brand_info') }}</h4>
        <div class="form-group">
          <label>{{ t('brand.label_name') }} <span class="required">*</span></label>
          <input v-model="form.name" :placeholder="t('brand.placeholder_name')" class="form-input" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>{{ t('brand.label_sort') }}</label>
            <input v-model.number="form.sort" type="number" :min="0" placeholder="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('brand.label_status') }}</label>
            <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" :checked-text="t('brand.switch_enabled')" :unchecked-text="t('brand.switch_disabled')" />
          </div>
        </div>
      </div>
      <div class="form-section">
        <h4>{{ t('brand.section_brand_logo') }}</h4>
        <sa-upload-image v-model="form.logo" />
      </div>
      <div class="form-section">
        <h4>{{ t('brand.section_brand_desc') }}</h4>
        <textarea v-model="form.desc" :placeholder="t('brand.placeholder_description')" :aria-label="t('brand.placeholder_description')" class="form-textarea" rows="3"></textarea>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('brand.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('brand.btn_save_changes') : t('brand.btn_create_brand') }}</button>
      </template>
    </a-drawer>

    <a-modal
      :visible="confirmVisible"
      :title="t('brand.confirm_delete_title')"
      :ok-text="t('brand.btn_confirm_delete')"
      :cancel-text="t('brand.btn_cancel')"
      ok-button-props="{ class: 'btn-danger' }"
      @ok="confirmDelete"
      @cancel="confirmVisible = false"
      simple
    >
      <p>{{ t('brand.confirm_delete_msg') }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getBrandList, createBrand, updateBrand, deleteBrand, updateBrandStatus, batchBrandStatus } from '@/api/brand'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const confirmVisible = ref(false)
const deleteId = ref(null)

const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '', status: '' })
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const isBrandListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const formVisible = ref(false)
const form = reactive({ id: null, name: '', sort: 0, logo: '', desc: '', status: 1 })

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getBrandList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('brand.msg_operation_failed')) } finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(b => b.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const openForm = (record) => {
  if (record) Object.assign(form, { id: null, name: '', sort: 0, logo: '', desc: '', status: 1 }, record)
  else Object.assign(form, { id: null, name: '', sort: 0, logo: '', desc: '', status: 1 })
  formVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name) { Message.warning(t('brand.msg_enter_name')); return }
  try {
    if (form.id) { await updateBrand(form.id, form); Message.success(t('brand.msg_update_success')) }
    else { await createBrand(form); Message.success(t('brand.msg_create_success')) }
    formVisible.value = false
    loadData()
  } catch (error) { Message.error(t('brand.msg_operation_failed')) }
}

const toggleStatus = async (brand) => {
  try {
    await updateBrandStatus(brand.id, { status: brand.status === 1 ? 0 : 1 })
    Message.success(brand.status === 1 ? t('brand.msg_disabled') : t('brand.msg_enabled'))
    loadData()
  } catch (error) { Message.error(t('brand.msg_operation_failed')) }
}

const handleDelete = (id) => { deleteId.value = id; confirmVisible.value = true }
const confirmDelete = async () => {
  try { await deleteBrand(deleteId.value); Message.success(t('brand.msg_delete_success')); confirmVisible.value = false; loadData() }
  catch (error) { Message.error(t('brand.msg_delete_failed')) }
}

const batchToggleStatus = async (status) => {
  try { await batchBrandStatus({ ids: selectedIds.value, status }); Message.success(status === 1 ? t('brand.msg_batch_enable_success') : t('brand.msg_batch_disable_success')); selectedIds.value = []; loadData() }
  catch (error) { Message.error(t('brand.msg_batch_operation_failed')) }
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



.brand-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-container);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-logo {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-secondary);
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-name {
  color: var(--color-on-surface);
  font-size: 13px;
  font-weight: 500;
}

.brand-id {
  font-size: 11px;
  color: var(--color-on-surface-variant);
}

.desc-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: var(--breakpoint-md)) {
  .form-row {
    flex-direction: column;
  }
}
</style>
