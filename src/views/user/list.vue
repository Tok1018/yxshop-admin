<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user.list.title') }}</h1>
        <p class="page-subtitle">{{ t('user.list.subtitle') }}</p>
      </div>
    </div>
    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('user.searchPlaceholder')" :aria-label="t('user.searchPlaceholder')" @input="debouncedSearch" />
      </div>
    </div>
    <div class="table-card card-shadow">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-user">{{ t('user.list.th_user') }}</th>
            <th class="col-phone">{{ t('user.phone') }}</th>
            <th class="col-level">{{ t('user.level') }}</th>
            <th class="col-balance">{{ t('user.balance') }}</th>
            <th class="col-status">{{ t('user.status') }}</th>
            <th class="col-time">{{ t('user.registerTime') }}</th>
            <th class="col-actions">{{ t('user.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in list" :key="u.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar" v-if="u.avatar_url">
                  <img :src="u.avatar_url" alt="" />
                </div>
                <div class="user-avatar" v-else :style="{ background: getAvatarColor(u.id) }">
                  {{ (u.nickname || u.username || '?')[0]?.toUpperCase() }}
                </div>
                <div class="user-info">
                  <span class="user-name">{{ u.nickname || u.username || '-' }}</span>
                  <span class="user-sub mono">ID: {{ u.id }}</span>
                </div>
              </div>
            </td>
            <td class="mono">{{ u.phone || '-' }}</td>
            <td>{{ u.level_name || (u.level && u.level.name) || '-' }}</td>
            <td class="mono">¥{{ Number(u.money || 0).toFixed(2) }}</td>
            <td>
              <span :class="u.deleted_at > 0 ? 'badge-error' : 'badge-success'">
                {{ u.deleted_at > 0 ? t('user.disabled') : t('user.active') }}
              </span>
            </td>
            <td class="td-muted">{{ formatTime(u.created_at) }}</td>
            <td class="actions-cell" @click.stop>
              <button class="btn-ghost btn-sm" @click="goDetail(u)">{{ t('common.detail') }}</button>
            </td>
          </tr>
          <tr v-if="showListEmpty">
            <td colspan="7" class="empty-row">
              <div class="empty-state">
                <icon-user-group :size="36" />
                <span>{{ t('user.noData') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>
    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('user.total', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconSearch, IconUserGroup } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getUserList } from '@/api/user'

const { t } = useI18n()
const router = useRouter()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const filters = ref({ keyword: '' })

const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)
const onPageChange = (p) => { page.value = p; loadData() }

const avatarColors = ['#6366F1', '#10B981', '#F59E0B', '#06B6D4', '#F43F5E', '#8B5CF6', '#EC4899', '#14B8A6']
const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length]

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

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
    const res = await getUserList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('user.operationFailed')) } finally {
    loading.value = false
  }
}

const goDetail = (record) => {
  router.push({ name: 'userDetail', params: { id: record.id } })
}

onMounted(() => loadData())
</script>

<style scoped>
.page-content .col-user { padding-left: 20px; }
.page-content .col-phone, .page-content .col-level, .page-content .col-balance, .page-content .col-status, .page-content .col-time { text-align: left; }
.page-content .td-muted { color: var(--color-on-surface-variant); font-size: 13px; }
.page-content .user-cell { display: flex; align-items: center; gap: 10px; }
.page-content .user-avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; overflow: hidden; }
.page-content .user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.page-content .user-info { display: flex; flex-direction: column; min-width: 0; }
.page-content .user-name { font-size: 14px; font-weight: 600; color: var(--color-on-surface); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.page-content .user-sub { font-size: 12px; color: var(--color-on-surface-variant); }
</style>
