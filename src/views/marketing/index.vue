<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('marketing.title') }}</h1>
        <p class="page-subtitle">{{ t('marketing.stats.summary', { n: stats.activeCampaigns, reach: formatNumber(stats.totalReach) }) }}</p>
      </div>
      <div class="page-actions">
        <button class="btn-ghost" @click="handleExport"><icon-export /> {{ t('marketing.stats.export') }}</button>
        <button class="btn-primary" @click="openForm()"><icon-plus /> {{ t('marketing.add_activity') }}</button>
      </div>
    </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon-wrap primary"><icon-user-group /></div>
            <span class="stat-trend up"><icon-arrow-rise /> {{ formatTrend(stats.reachGrowth) }}</span>
          </div>
          <p class="stat-label">{{ t('marketing.stats.totalReach') }}</p>
          <p class="stat-value">{{ formatNumber(stats.totalReach) }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon-wrap secondary"><icon-thumb-up /></div>
            <span class="stat-trend up"><icon-arrow-rise /> {{ formatTrend(stats.conversionGrowth) }}</span>
          </div>
          <p class="stat-label">{{ t('marketing.stats.conversionRate') }}</p>
          <p class="stat-value">{{ stats.conversionRate }}%</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon-wrap tertiary"><icon-tag /></div>
            <span class="stat-trend down"><icon-arrow-fall /> {{ formatTrend(stats.couponUsageGrowth) }}</span>
          </div>
          <p class="stat-label">{{ t('marketing.stats.couponUsage') }}</p>
          <p class="stat-value">{{ formatNumber(stats.couponUsage) }}</p>
        </div>
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon-wrap primary"><icon-safe /></div>
            <span class="stat-trend up"><icon-arrow-rise /> {{ formatTrend(stats.roiGrowth) }}</span>
          </div>
          <p class="stat-label">{{ t('marketing.stats.roi') }}</p>
          <p class="stat-value">{{ stats.roi }}x</p>
        </div>
      </div>

      <div class="tab-nav">
        <button v-for="tab in tabs" :key="tab.key" :class="['tab-item', { active: activeTab === tab.key }]" @click="activeTab = tab.key; page = 1; loadData()">{{ tab.label }}</button>
      </div>

      <div v-if="activeTab === 'promotion'">
        <div class="filter-bar">
          <div class="search-box">
            <icon-search />
            <input v-model="filters.keyword" :placeholder="t('marketing.search_promotion')" :aria-label="t('marketing.search_promotion')" @input="debouncedSearch" />
          </div>
        </div>
        <div class="table-card card-shadow">
          <div class="table-scroll custom-scrollbar">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ t('marketing.activity_name') }}</th>
                  <th>{{ t('marketing.type') }}</th>
                  <th>{{ t('marketing.status') }}</th>
                  <th>{{ t('marketing.stats.goalProgress') }}</th>
                  <th class="col-actions">{{ t('marketing.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in list" :key="record.id">
                  <td>
                    <div class="promo-cell">
                      <span class="body-md font-bold">{{ record.title || record.name || '-' }}</span>
                      <span class="label-sm text-on-surface-variant">ID: {{ record.id }}</span>
                    </div>
                  </td>
                  <td><span :class="['type-badge', 'type-' + record.type]">{{ activityTypeText(record.type) }}</span></td>
                  <td>
                    <span :class="['status-badge', record.status === 1 ? 'status-on' : 'status-off']">
                      <span class="status-dot"></span>
                      {{ record.status === 1 ? t('marketing.ongoing') : t('marketing.ended') }}
                    </span>
                  </td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-bar"><div class="progress-fill primary" :style="{ width: (record.progress || 0) + '%' }"></div></div>
                      <span class="label-sm font-bold">{{ record.progress || 0 }}%</span>
                    </div>
                  </td>
                  <td class="actions-cell" @click.stop>
                    <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                    <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
                  </td>
                </tr>
                <tr v-if="showListEmpty">
                  <td colspan="5" class="empty-state">
                    <icon-empty class="empty-icon" />
                    <span class="empty-text">{{ t('marketing.no_promotion') }}</span>
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
          <span class="total-text">{{ t('marketing.total', { count: total }) }}</span>
          <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" show-page-size @change="onPageChange" />
        </div>
      </div>

      <div v-if="activeTab === 'notification'">
        <div class="info-card card-shadow">
          <h3>{{ t('marketing.send_notification') }}</h3>
          <div class="form-section">
            <div class="form-group">
              <label>{{ t('marketing.msg_title') }} <span class="required">*</span></label>
              <input v-model="notifyForm.title" class="form-input" :placeholder="t('marketing.msg_title_placeholder')" />
            </div>
            <div class="form-group">
              <label>{{ t('marketing.msg_content') }} <span class="required">*</span></label>
              <textarea v-model="notifyForm.content" class="form-textarea" rows="4" :placeholder="t('marketing.msg_content_placeholder')"></textarea>
            </div>
            <div class="form-group">
              <label>{{ t('marketing.push_scope') }}</label>
              <select v-model="notifyForm.scope" class="form-input">
                <option value="all">{{ t('marketing.all_users') }}</option>
                <option value="vip">{{ t('marketing.vip_users') }}</option>
              </select>
            </div>
            <button class="btn-primary" @click="sendNotify">{{ t('marketing.send_notify') }}</button>
          </div>
        </div>
      </div>

    <a-drawer :visible="formVisible" :width="'min(480px, 90vw)'" class="arco-drawer-md3" :title="(form.id ? t('marketing.edit') : t('marketing.add')) + t('marketing.activity')" @cancel="formVisible = false" :footer="true" unmount-on-close>
      <div class="form-group">
        <label>{{ t('marketing.activity_name') }} <span class="required">*</span></label>
        <input v-model="form.name" class="form-input" :placeholder="t('marketing.activity_name_placeholder')" />
      </div>
      <div class="form-group">
        <label>{{ t('marketing.activity_type') }}</label>
        <select v-model="form.type" class="form-input">
          <option :value="1">{{ t('marketing.type_discount') }}</option>
          <option :value="2">{{ t('marketing.type_percent') }}</option>
          <option :value="3">{{ t('marketing.type_special') }}</option>
        </select>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('marketing.cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('marketing.save_modify') : t('marketing.create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message, Modal } from '@arco-design/web-vue'
import {
  IconSearch, IconPlus, IconExport,
  IconArrowRise, IconArrowFall, IconUserGroup, IconThumbUp, IconTag, IconSafe, IconEmpty
} from '@arco-design/web-vue/es/icon'
import { getPromotionList, createPromotion, updatePromotion, deletePromotion, sendPromotionNotification as sendNotification } from '@/api/promotions'
import { getMarketingStatistics, exportMarketingData } from '@/api/marketing'
import { formatNumber, formatTrend } from '@/utils/format'

const { t } = useI18n()

const tabs = computed(() => [
  { key: 'promotion', label: t('marketing.promotion') },
  { key: 'notification', label: t('marketing.notification') },
])
const activeTab = ref('promotion')
const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const filters = ref({ keyword: '' })
const showListEmpty = computed(() => list.value.length === 0 && loading.value === false)

const stats = ref({ activeCampaigns: 0, totalReach: 0, reachGrowth: 0, conversionRate: 0, conversionGrowth: 0, couponUsage: 0, couponUsageGrowth: 0, roi: 0, roiGrowth: 0 })

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }
const onPageChange = (p) => { page.value = p; loadData() }

const formVisible = ref(false)
const form = reactive({ id: null, name: '', type: 1 })
const notifyForm = reactive({ title: '', content: '', scope: 'all' })

const activityTypeText = (type) => ({ 1: t('marketing.type_discount'), 2: t('marketing.type_percent'), 3: t('marketing.type_special') }[type] ?? t('marketing.unknown'))

const openForm = (record) => { Object.assign(form, { id: null, name: '', type: 1 }, record || {}); formVisible.value = true }

const handleSubmit = async () => {
  try { if (form.id) { await updatePromotion(form.id, form); Message.success(t('marketing.update_success')) } else { await createPromotion(form); Message.success(t('marketing.create_success')) }; formVisible.value = false; loadData() } catch (error) { Message.error(t('marketing.operation_failed')) }
}

const handleDelete = (record) => { Modal.warning({ title: t('marketing.delete'), content: t('marketing.confirm_delete'), hideCancel: false, onOk: async () => { try { await deletePromotion(record.id); Message.success(t('marketing.delete_success')); loadData() } catch (error) { Message.error(t('marketing.delete_failed')) } } }) }

const sendNotify = async () => { try { await sendNotification(notifyForm); Message.success(t('marketing.send_success')) } catch (error) { Message.error(t('marketing.operation_failed')) } }

const handleExport = async () => {
  try {
    const res = await exportMarketingData()
    const blob = new Blob([res], { type: 'text/csv;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `marketing_export_${Date.now()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    Message.success(t('marketing.stats.exporting'))
  } catch (error) { Message.error(t('marketing.operation_failed')) }
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getPromotionList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || list.value.length
  } catch (error) { Message.error(t('marketing.operation_failed')) } finally { loading.value = false }
}

onMounted(() => { loadData(); loadStats() })

const loadStats = async () => {
  try {
    const res = await getMarketingStatistics()
    if (res.data) {
      stats.value = { ...stats.value, ...res.data }
    }
  } catch (error) { /* use defaults */ }
}
</script>

<style scoped>
.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.text-on-surface-variant { color: var(--color-on-surface-variant); }
.font-bold { font-weight: 700; }
.body-md { font-size: 14px; line-height: 20px; }
.label-sm { font-size: 12px; line-height: 16px; letter-spacing: 0.01em; font-weight: 500; }

.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-lg);
}

.stat-card-header {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-base);
}
.stat-trend {
  font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; gap: 2px;
  padding: 2px 8px; border-radius: var(--radius-full);
}
.stat-trend.up { color: var(--color-primary); background: rgba(var(--color-primary-rgb), 0.1); }
.stat-trend.down { color: var(--color-error); background: rgba(var(--color-error-rgb), 0.1); }

.tab-nav {
  display: flex; gap: var(--spacing-2xl);
  border-bottom: 1px solid var(--color-outline-variant);
}
.tab-item {
  padding-bottom: var(--spacing-base);
  font-size: 20px; font-weight: 600;
  color: var(--color-on-surface-variant);
  border-bottom: 2px solid transparent;
  background: none; border-top: none; border-left: none; border-right: none;
  cursor: pointer; white-space: nowrap; transition: all 0.2s;
}
.tab-item:hover { color: var(--color-on-surface); }
.tab-item.active { color: var(--color-primary); border-bottom-color: var(--color-primary); }

.promo-cell { display: flex; flex-direction: column; gap: 2px; }

.type-badge {
  display: inline-flex; padding: 2px 8px; border-radius: var(--radius-full);
  font-size: 11px; font-weight: 600;
}
.type-badge.type-1 { background: rgba(var(--color-primary-rgb), 0.1); color: var(--color-primary); }
.type-badge.type-2 { background: rgba(var(--color-secondary-rgb), 0.1); color: var(--color-secondary); }
.type-badge.type-3 { background: rgba(var(--color-tertiary-rgb), 0.1); color: var(--color-tertiary); }

.progress-cell { display: flex; align-items: center; gap: var(--spacing-sm); }
.progress-cell .progress-bar { width: 80px; }

@media (max-width: var(--breakpoint-lg)) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: var(--breakpoint-md)) {
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
