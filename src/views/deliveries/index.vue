<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('deliveries.title') }}</h1>
        <p class="page-subtitle">{{ t('deliveries.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="goEdit()">
          <icon-plus />
          {{ t('deliveries.btn_add') }}
        </button>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('deliveries.search_placeholder')" :aria-label="t('deliveries.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('deliveries.th_name') }}</th>
              <th>{{ t('deliveries.th_method') }}</th>
              <th>{{ t('deliveries.th_rules_count') }}</th>
              <th>{{ t('deliveries.th_status') }}</th>
              <th class="col-actions">{{ t('deliveries.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td class="name-cell">{{ record.name }}</td>
              <td><span class="badge badge-secondary">{{ record.method === 20 ? t('deliveries.method_weight') : t('deliveries.method_quantity') }}</span></td>
              <td class="mono">{{ record.rules_count || 0 }}</td>
              <td><span class="badge" :class="record.status === 1 ? 'badge-success' : 'badge-error'">{{ record.status === 1 ? t('deliveries.status_enabled') : t('deliveries.status_disabled') }}</span></td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="goEdit(record.id)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="5" class="empty-row"><div class="empty-state"><span class="empty-text">{{ t('deliveries.empty_data') }}</span></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('deliveries.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getDeliveriesList, deleteDeliveries } from '@/api/deliveries'

const { t } = useI18n()
const router = useRouter()
const list = ref([]); const loading = ref(false); const total = ref(0); const page = ref(1); const pageSize = 20
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const filters = ref({ keyword: '' }); let searchTimer = null; const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const goEdit = (id) => {
  if (id) router.push(`/logistics/deliveries/edit/${id}`)
  else router.push('/logistics/deliveries/edit/new')
}

const onPageChange = (newPage) => { page.value = newPage; loadData() }

const handleDelete = (record) => {
  Modal.warning({
    title: t('deliveries.confirm_delete_title'),
    content: t('deliveries.confirm_delete'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteDeliveries(record.id); Message.success(t('deliveries.msg_delete_success')); loadData() }
      catch (error) { Message.error(error.response?.data?.message || t('deliveries.msg_delete_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getDeliveriesList(params); list.value = res.data?.list || res.data || []; total.value = res.data?.total || 0
  } catch (error) { Message.error(t('deliveries.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>

<style scoped>

.name-cell { color: var(--color-on-surface); font-weight: 500; }
</style>
