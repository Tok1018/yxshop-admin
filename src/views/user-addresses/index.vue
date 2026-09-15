<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_addresses.title') }}</h1>
        <p class="page-subtitle">{{ t('user_addresses.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('user_addresses.search_placeholder')" :aria-label="t('user_addresses.search_placeholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-user">{{ t('user_addresses.th_user') }}</th>
            <th class="col-contact">{{ t('user_addresses.th_contact') }}</th>
            <th class="col-phone">{{ t('user_addresses.th_phone') }}</th>
            <th class="col-addr">{{ t('user_addresses.th_address') }}</th>
            <th class="col-default">{{ t('user_addresses.th_default') }}</th>
            <th class="col-actions">{{ t('user_addresses.th_actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ (r.user?.nickname || r.user_id || '?')[0]?.toUpperCase() }}</div>
                <span class="user-link" @click="$router.push({ path: '/user/detail/' + r.user_id })">{{ r.user?.nickname || t('user_addresses.user_prefix', { id: r.user_id }) }}</span>
              </div>
            </td>
            <td class="name-col">{{ r.name || '-' }}</td>
            <td class="mono">{{ r.phone || '-' }}</td>
            <td class="addr-cell" :title="r.detail">{{ r.detail || '-' }}</td>
            <td>
              <span class="badge-success" v-if="r.is_default === 1">
                {{ t('user_addresses.default_yes') }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="actions-cell" @click.stop>
              <button class="btn-danger btn-sm" @click="handleDelete(r)">{{ t('common.delete') }}</button>
            </td>
          </tr>
          <tr v-if="showListEmpty">
            <td colspan="6" class="empty-row">
              <div class="empty-state">
                <icon-location :size="36" />
                <span>{{ t('user_addresses.empty_data') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('user_addresses.total_count', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconLocation } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getUserAddressesList, deleteUserAddresses } from '@/api/user_addresses'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })

const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const onPageChange = (p) => { page.value = p; loadData() }

let searchTimer = null
const debouncedSearch = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400)
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => {
      if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k]
    })
    const res = await getUserAddressesList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('user_addresses.msg_operation_failed')) } finally {
    loading.value = false
  }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('user_addresses.confirm_delete_title'),
    content: t('user_addresses.confirm_delete_msg'),
    hideCancel: false,
    onOk: async () => {
      try {
        await deleteUserAddresses(record.id)
        Message.success(t('user_addresses.msg_delete_success'))
        loadData()
      } catch (error) { Message.error(t('user_addresses.msg_delete_failed'))
      }
    }
  })
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content .col-user { padding-left: 20px; }
.page-content .col-contact, .page-content .col-phone, .page-content .col-default { text-align: center; }
.col-actions { text-align: right; }
.page-content .col-addr { max-width: 240px; }
.page-content .user-cell { display: flex; align-items: center; gap: 8px; }
.page-content .user-avatar { width: 28px; height: 28px; border-radius: 50%; background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
.page-content .name-col { color: var(--color-on-surface); font-weight: 500; }
.page-content .addr-cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 240px; }
.user-link { color: var(--color-primary); font-weight: 500; cursor: pointer; }
.user-link:hover { text-decoration: underline; }
</style>
