<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('article.title') }}</h1>
        <p class="page-subtitle">{{ t('article.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="$router.push({ name: 'articleEdit' })">
          <icon-plus />
          {{ t('article.add_article') }}
        </button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('article.search_placeholder')" :aria-label="t('article.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.status" class="filter-select" @change="loadData">
        <option value="">{{ t('article.all_status') }}</option>
        <option value="1">{{ t('article.option_enabled') }}</option>
        <option value="0">{{ t('article.option_disabled') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('article.th_title') }}</th>
              <th>{{ t('article.th_category') }}</th>
              <th>{{ t('article.th_sort') }}</th>
              <th>{{ t('article.th_status') }}</th>
              <th>{{ t('article.th_time') }}</th>
              <th class="col-actions">{{ t('article.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="title-cell">{{ record.title }}</td>
              <td>{{ record.category?.name || record.category_name || '-' }}</td>
              <td class="mono">{{ record.sort || 0 }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('article.status_enabled') : t('article.status_disabled') }}</span></td>
              <td class="mono muted">{{ record.created_at ? formatTime(record.created_at) : '-' }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="$router.push({ name: 'articleEdit', params: { id: record.id } })">{{ t('common.edit') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(record)">{{ record.status === 1 ? t('common.disabled') : t('common.enabled') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty">
              <td colspan="6" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('article.empty_data') }}</span>
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
      <span class="total-text">{{ t('article.total_count', { n: total }) }}</span>
      <a-pagination
        class="arco-pagination-md3"
        :current="page"
        :total="total"
        :page-size="pageSize"
        show-page-size
        @change="onPageChange"
      />
    </div>

    <a-modal
      :visible="confirmVisible"
      :title="t('article.confirm_delete_title')"
      :ok-text="t('article.btn_confirm_delete')"
      :cancel-text="t('article.cancel')"
      ok-button-props="{ class: 'btn-danger' }"
      @ok="confirmDelete"
      @cancel="confirmVisible = false"
      simple
    >
      <p>{{ t('article.confirm_delete_msg') }}</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getArticleList, deleteArticle, updateArticleStatus } from '@/api/article'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const confirmVisible = ref(false)
const deleteId = ref(null)

const filters = ref({ keyword: '', status: '' })
const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts.length > 12 ? ts : ts * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getArticleList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('article.msg_operation_failed')) } finally { loading.value = false }
}

const toggleStatus = async (record) => {
  try {
    await updateArticleStatus(record.id, { status: record.status === 1 ? 0 : 1 })
    Message.success(record.status === 1 ? t('article.msg_disabled') : t('article.msg_enabled'))
    loadData()
  } catch (error) { Message.error(t('article.msg_operation_failed')) }
}

const handleDelete = (record) => { deleteId.value = record.id; confirmVisible.value = true }
const confirmDelete = async () => {
  try { await deleteArticle(deleteId.value); Message.success(t('article.msg_delete_success')); confirmVisible.value = false; loadData() }
  catch (error) { Message.error(t('article.msg_delete_failed')) }
}

onMounted(() => loadData())
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


</style>
