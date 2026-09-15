<template>
  <div class="dashboard-page">
    <div class="page-loading" v-if="loading">
      <a-spin size="32" />
    </div>
    <template v-else>
      <div class="stats-row">
        <div class="stats-card sales-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.sales.title') }}</h3>
            <div class="tab-group">
              <button :class="['tab-btn', { 'tab-btn-active': salesPeriod === 'month' }]" @click="salesPeriod = 'month'">{{ t('dashboard.sales.byMonth') }}</button>
              <button :class="['tab-btn', { 'tab-btn-active': salesPeriod === 'week' }]" @click="salesPeriod = 'week'">{{ t('dashboard.sales.byWeek') }}</button>
            </div>
          </div>
          <div class="sales-body">
            <div class="sales-stats">
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t('dashboard.sales.netSales') }}</span>
                  <icon-info-circle class="stat-info-icon" />
                </div>
                <div class="stat-value">{{ formatCurrency(stats.total_payment) }}</div>
                <div :class="['stat-trend', getTrendClass(stats.sales_trend)]">
                  <icon-arrow-rise v-if="stats.sales_trend >= 0" />
                  <icon-arrow-fall v-else />
                  <span>{{ formatTrend(stats.sales_trend) }}</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t('dashboard.sales.orders') }}</span>
                  <icon-info-circle class="stat-info-icon" />
                </div>
                <div class="stat-value">{{ formatNumber(stats.today_orders) }}</div>
                <div :class="['stat-trend', getTrendClass(stats.orders_trend)]">
                  <icon-arrow-rise v-if="stats.orders_trend >= 0" />
                  <icon-arrow-fall v-else />
                  <span>{{ formatTrend(stats.orders_trend) }}</span>
                </div>
              </div>
            </div>
            <div class="mini-chart">
              <div v-for="(bar, idx) in salesBars" :key="idx" class="bar-group">
                <div :class="['bar', { 'bar-active': bar.active }]" :style="{ height: bar.height + '%' }"></div>
                <span class="bar-label">{{ bar.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stats-card visitors-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.visitors.title') }}</h3>
            <div class="tab-group">
              <button :class="['tab-btn', { 'tab-btn-active': visitorsPeriod === 'month' }]" @click="visitorsPeriod = 'month'">{{ t('dashboard.visitors.byMonth') }}</button>
              <button :class="['tab-btn', { 'tab-btn-active': visitorsPeriod === 'week' }]" @click="visitorsPeriod = 'week'">{{ t('dashboard.visitors.byWeek') }}</button>
            </div>
          </div>
          <div class="visitors-body">
            <div class="visitors-stats">
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t('dashboard.visitors.newUsers') }}</span>
                  <icon-info-circle class="stat-info-icon" />
                </div>
                <div class="stat-value">{{ formatNumber(stats.total_customer) }}</div>
                <div :class="['stat-trend', getTrendClass(stats.new_users_trend)]">
                  <icon-arrow-rise v-if="stats.new_users_trend >= 0" />
                  <icon-arrow-fall v-else />
                  <span>{{ formatTrend(stats.new_users_trend) }}</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-label-row">
                  <span class="stat-label">{{ t('dashboard.visitors.returningUsers') }}</span>
                  <icon-info-circle class="stat-info-icon" />
                </div>
                <div class="stat-value">{{ formatNumber(stats.returning_users || 0) }}</div>
                <div :class="['stat-trend', getTrendClass(stats.returning_trend)]">
                  <icon-arrow-rise v-if="stats.returning_trend >= 0" />
                  <icon-arrow-fall v-else />
                  <span>{{ formatTrend(stats.returning_trend) }}</span>
                </div>
              </div>
            </div>
            <div class="visitors-chart">
              <svg class="area-chart" viewBox="0 0 400 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="visitorGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.2"></stop>
                    <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"></stop>
                  </linearGradient>
                </defs>
                <line stroke="var(--color-surface-container)" x1="0" x2="400" y1="40" y2="40"></line>
                <line stroke="var(--color-surface-container)" x1="0" x2="400" y1="80" y2="80"></line>
                <line stroke="var(--color-surface-container)" x1="0" x2="400" y1="120" y2="120"></line>
                <path :d="visitorAreaPath" fill="url(#visitorGrad)"></path>
                <path :d="visitorLinePath" fill="none" stroke="var(--color-primary)" stroke-width="3"></path>
              </svg>
              <div class="chart-labels">
                <span v-for="d in weekDays" :key="d">{{ d }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bento-row">
        <div class="bento-card traffic-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.traffic.title') }}</h3>
            <div class="tab-group">
              <button :class="['tab-btn', { 'tab-btn-active': trafficPeriod === 'month' }]" @click="trafficPeriod = 'month'">{{ t('dashboard.sales.byMonth') }}</button>
              <button :class="['tab-btn', { 'tab-btn-active': trafficPeriod === 'week' }]" @click="trafficPeriod = 'week'">{{ t('dashboard.sales.byWeek') }}</button>
            </div>
          </div>
          <div class="traffic-list">
            <div v-for="item in trafficSources" :key="item.label" class="traffic-item">
              <div class="traffic-label-row">
                <span class="traffic-label">{{ item.label }}</span>
                <span class="traffic-value">{{ formatNumber(item.value) }}</span>
              </div>
              <div class="progress-bar">
                <div :class="['progress-fill', item.color]" :style="{ width: item.percent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="bento-card customer-card">
          <div class="card-header">
            <div class="card-title-row">
              <h3 class="card-title">{{ t('dashboard.customer.title') }}</h3>
              <icon-info-circle class="stat-info-icon" />
            </div>
          </div>
          <div class="customer-stat">
            <p class="stat-label">{{ t('dashboard.customer.today') }}</p>
            <div class="stat-value">{{ formatNumber(stats.today_orders) }}</div>

          </div>
          <div class="customer-chart">
            <svg class="area-chart" viewBox="0 0 200 100" preserveAspectRatio="none">
              <path :d="customerAreaPath" fill="var(--color-primary)" fill-opacity="0.06"></path>
              <path :d="customerLinePath" fill="none" stroke="var(--color-primary)" stroke-width="2"></path>
            </svg>
          </div>
        </div>

        <div class="bento-card gender-card">
          <div class="card-header">
            <div class="card-title-row">
              <h3 class="card-title">{{ t('dashboard.gender.title') }}</h3>
              <icon-info-circle class="stat-info-icon" />
            </div>
          </div>
          <div class="gender-body">
            <div class="gender-donut">
              <svg viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--color-surface-container-low)" stroke-width="4"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--color-primary)" :stroke-dasharray="genderMale + ' ' + (100 - genderMale)" stroke-dashoffset="25" stroke-width="4"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--color-tertiary-fixed-dim)" :stroke-dasharray="genderFemale + ' ' + (100 - genderFemale)" :stroke-dashoffset="-(genderMale - 25)" stroke-width="4"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.915" stroke="var(--color-secondary)" :stroke-dasharray="genderOther + ' ' + (100 - genderOther)" :stroke-dashoffset="-(genderMale + genderFemale - 25)" stroke-width="4"></circle>
              </svg>
            </div>
            <div class="gender-legend">
              <div class="legend-item">
                <div class="legend-row">
                  <span class="legend-dot primary"></span>
                  <span class="legend-label">{{ t('dashboard.gender.male') }}</span>
                </div>
                <span class="legend-value">{{ genderMale }}%</span>
              </div>
              <div class="legend-item">
                <div class="legend-row">
                  <span class="legend-dot tertiary"></span>
                  <span class="legend-label">{{ t('dashboard.gender.female') }}</span>
                </div>
                <span class="legend-value">{{ genderFemale }}%</span>
              </div>
              <div class="legend-item">
                <div class="legend-row">
                  <span class="legend-dot secondary"></span>
                  <span class="legend-label">{{ t('dashboard.gender.unknown') }}</span>
                </div>
                <span class="legend-value">{{ genderOther }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="region-row">
        <div class="region-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.region.title') }}</h3>
            <div class="region-trend-badge">
              <icon-arrow-rise />
              <span>{{ formatTrend(stats.region_trend || 0) }}</span>
            </div>
          </div>
          <div class="region-body">
            <div class="region-stats">
              <div class="region-total">
                <div class="stat-value">{{ formatNumber(stats.region_total || 0) }}</div>
                <div class="stat-sublabel">{{ t('dashboard.region.vsLastMonth') }}</div>
              </div>
              <div class="region-list">
                <div v-for="r in regionData" :key="r.name" class="region-item">
                  <div class="region-item-left">
                    <span :class="['region-dot', r.color]"></span>
                    <span class="region-name">{{ r.name }}</span>
                  </div>
                  <span class="region-value">{{ formatNumber(r.value) }}</span>
                </div>
              </div>
            </div>
            <div class="region-map">
              <div class="map-placeholder">
                <div v-for="pin in mapPins" :key="pin.name" class="map-pin" :style="{ top: pin.top, left: pin.left }">
                  <div class="pin-badge">
                    <span>{{ formatNumber(pin.value) }}</span>
                    <icon-location class="pin-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="new-customers-card">
          <div class="card-header">
            <h3 class="card-title">{{ t('dashboard.newCustomers.title') }}</h3>
          </div>
          <div class="customer-list custom-scrollbar">
            <div v-for="c in recentCustomers" :key="c.id" class="customer-item">
              <div class="customer-info">
                <div class="customer-avatar">{{ c.name?.charAt(0) || '?' }}</div>
                <div>
                  <p class="customer-name">{{ c.name }}</p>
                  <p class="customer-location">{{ c.location }}</p>
                </div>
              </div>
              <button class="chat-btn" @click="navigateTo('/user/list')">
                <icon-message />
              </button>
            </div>
            <div v-if="!recentCustomers.length" class="empty-state">
              <p class="empty-text">{{ t('common.noData') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import {
  IconInfoCircle, IconArrowRise, IconArrowFall,
  IconLocation, IconMessage
} from '@arco-design/web-vue/es/icon'
import { getDashboardStatistics, getDashboardCharts, getDashboardRecentCustomers } from '@/api/dashboard'
import { navigateTo } from '@/utils/router'
import { formatCurrency, formatNumber, formatTrend } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const stats = ref({})
const chartData = ref([])
const recentCustomers = ref([])

const salesPeriod = ref('week')
const visitorsPeriod = ref('week')
const trafficPeriod = ref('week')

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const getTrendClass = (val) => (typeof val === 'number' && val >= 0 ? 'up' : typeof val === 'number' ? 'down' : '')

const salesBars = computed(() => {
  const data = chartData.value.length ? chartData.value : []
  if (!data.length) return []
  const max = Math.max(...data, 1)
  return data.map((v, i) => ({
    height: (v / max) * 100,
    active: i === data.length - 1,
    label: weekDays[i] || '',
  }))
})

const trafficSources = computed(() => {
  const sources = stats.value.traffic_sources || []
  if (!sources.length) return []
  const colorMap = { search: 'primary', cart: 'tertiary', subscribe: 'secondary', direct: 'primary' }
  return sources.map(s => ({
    label: t(`dashboard.traffic.${s.label}`),
    value: s.value,
    percent: s.percent,
    color: colorMap[s.label] || 'primary',
  }))
})

const genderMale = computed(() => stats.value.gender_male || 0)
const genderFemale = computed(() => stats.value.gender_female || 0)
const genderOther = computed(() => Math.round(Math.max(0, 100 - genderMale.value - genderFemale.value) * 10) / 10)

const regionData = computed(() => {
  const data = stats.value.region_data || []
  const colors = ['secondary-container', 'secondary', 'tertiary', 'tertiary-fixed-dim']
  return data.map((r, i) => ({ name: r.name, value: r.value, color: colors[i % colors.length] }))
})

const mapPins = computed(() => {
  const data = stats.value.region_data || []
  const positions = [
    { top: '60%', left: '35%' },
    { top: '75%', left: '60%' },
    { top: '65%', left: '70%' },
  ]
  return data.slice(0, 3).map((r, i) => ({ name: r.name, value: r.value, ...positions[i] }))
})

const generatePath = (points, baseY = 160) => {
  if (!points.length) return ''
  let d = `M0,${baseY - points[0]}`
  for (let i = 1; i < points.length; i++) {
    const x = (i / (points.length - 1)) * 400
    d += ` L${x},${baseY - points[i]}`
  }
  return d
}

const visitorLinePath = computed(() => {
  const pts = chartData.value.length ? chartData.value : []
  if (!pts.length) return ''
  return generatePath(pts, 140)
})

const visitorAreaPath = computed(() => {
  const line = visitorLinePath.value
  if (!line) return ''
  return line + ` V140 H0 Z`
})

const customerLinePath = computed(() => {
  const trend = stats.value.customer_trend || []
  if (!trend.length) return ''
  const pts = trend.map(t => t.count)
  let d = `M0,${100 - pts[0]}`
  for (let i = 1; i < pts.length; i++) {
    const x = (i / (pts.length - 1)) * 200
    d += ` L${x},${100 - pts[i]}`
  }
  return d
})

const customerAreaPath = computed(() => {
  const line = customerLinePath.value
  if (!line) return ''
  return line + ' V100 H0 Z'
})

onMounted(async () => {
  loading.value = true
  try {
    const [statsRes, customersRes, chartsRes] = await Promise.allSettled([
      getDashboardStatistics(),
      getDashboardRecentCustomers({ limit: 5 }),
      getDashboardCharts(),
    ])
    if (statsRes.status === 'fulfilled' && statsRes.value?.data) stats.value = statsRes.value.data
    if (customersRes.status === 'fulfilled' && customersRes.value?.data) {
      const raw = customersRes.value.data
      recentCustomers.value = (Array.isArray(raw) ? raw : raw.list || []).map(c => ({
        id: c.id,
        name: c.name || c.nickname || '-',
        location: c.location || c.region || c.city || '-',
      }))
    }
    if (chartsRes.status === 'fulfilled' && chartsRes.value?.data) {
      const cd = chartsRes.value.data
      const epm = cd.earning_per_months
      if (Array.isArray(epm)) chartData.value = epm
    }
  } catch {
    Message.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard-page {
  padding: var(--spacing-xl);
  min-height: 100%;
  background: var(--color-surface);
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stats-card {
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(187, 203, 186, 0.2);
}

.card-header {
  align-items: flex-start;
}

.card-title {
  font-family: var(--font-headline-md);
  line-height: 28px;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.stat-info-icon {
  font-size: 14px;
  color: var(--color-on-surface-variant);
}

.sales-body {
  display: flex;
  gap: var(--spacing-xl);
}

.sales-stats {
  width: 33.3%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.stat-label-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 24px;
  line-height: 32px;
  letter-spacing: -0.01em;
}

.stat-trend {
  margin-top: var(--spacing-xs);
}

.mini-chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  padding-top: var(--spacing-base);
}

.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
}

.bar {
  width: 20px;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  background: var(--color-primary-container);
  opacity: 0.3;
  transition: opacity 0.2s;
}

.bar-active { opacity: 1; }

.bar-label {
  font-size: 10px;
  color: var(--color-on-surface-variant);
}

.visitors-body {
  display: flex;
  gap: var(--spacing-xl);
}

.visitors-stats {
  width: 33.3%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.visitors-chart {
  flex: 1;
  position: relative;
  height: 160px;
}

.area-chart { width: 100%; height: 100%; }

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-on-surface-variant);
  margin-top: var(--spacing-sm);
  padding: 0 4px;
}

.bento-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.bento-card {
  background: var(--color-surface-container-lowest);
  padding: var(--spacing-xl);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
}

.traffic-card { grid-column: span 4; }
.customer-card { grid-column: span 4; }
.gender-card { grid-column: span 4; }

.traffic-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.traffic-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.traffic-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.01em;
  font-weight: 500;
}

.traffic-label { font-weight: 700; color: var(--color-on-surface); }
.traffic-value { color: var(--color-on-surface-variant); }

.customer-stat { margin-bottom: var(--spacing-base); }
.customer-chart { height: 96px; }

.gender-body {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
  flex: 1;
}

.gender-donut {
  width: 128px;
  height: 128px;
  flex-shrink: 0;
}

.gender-donut svg { width: 100%; height: 100%; }

.gender-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-dot.primary { background: var(--color-primary); }
.legend-dot.tertiary { background: var(--color-tertiary-fixed-dim); }
.legend-dot.secondary { background: var(--color-secondary); }

.legend-label { font-size: 14px; color: var(--color-on-surface-variant); }
.legend-value { font-size: 14px; font-weight: 700; color: var(--color-on-surface); }

.region-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
}

.region-card {
  grid-column: span 8;
  background: var(--color-surface-container-lowest);
  padding: var(--spacing-xl);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
  position: relative;
  overflow: hidden;
}

.region-trend-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: rgba(0, 109, 52, 0.1);
  color: var(--color-primary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
}

.region-body { display: flex; }

.region-stats {
  width: 33.3%;
  padding-top: var(--spacing-base);
}

.region-total { margin-bottom: var(--spacing-xl); }

.stat-sublabel {
  font-size: 11px;
  color: var(--color-on-surface-variant);
}

.region-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-base);
}

.region-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.region-item-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.region-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.region-dot.secondary-container { background: var(--color-secondary-container); }
.region-dot.secondary { background: var(--color-secondary); }
.region-dot.tertiary { background: var(--color-tertiary); }
.region-dot.tertiary-fixed-dim { background: var(--color-tertiary-fixed-dim); }

.region-name { font-size: 14px; color: var(--color-on-surface-variant); }
.region-value { font-size: 14px; font-weight: 700; color: var(--color-on-surface); }

.region-map {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-base);
}

.map-placeholder {
  position: relative;
  width: 100%;
  height: 300px;
  background: var(--color-surface-container-low);
  border-radius: var(--radius-lg);
}

.map-pin {
  position: absolute;
  cursor: pointer;
}

.pin-badge {
  display: flex;
  align-items: center;
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-full);
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  transition: transform 0.2s;
}

.map-pin:hover .pin-badge { transform: scale(1.1); }

.pin-icon {
  font-size: 14px;
  color: var(--color-primary);
  margin-left: 4px;
}

.new-customers-card {
  grid-column: span 4;
  background: var(--color-surface-container-lowest);
  padding: var(--spacing-xl);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(187, 203, 186, 0.2);
  display: flex;
  flex-direction: column;
}

.customer-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding-right: var(--spacing-sm);
}

.customer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm);
  border-radius: var(--radius-xl);
  transition: background 0.15s;
  cursor: pointer;
}

.customer-item:hover { background: var(--color-surface-container-low); }

.customer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.customer-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary-container);
  color: var(--color-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  border: 2px solid var(--color-surface-container-lowest);
  box-shadow: var(--shadow-card);
  flex-shrink: 0;
}

.customer-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-on-surface);
  margin: 0;
}

.customer-location {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  margin: 0;
}

.chat-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-on-surface-variant);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
}

.chat-btn:hover {
  background: var(--color-surface-container-lowest);
  box-shadow: var(--shadow-card);
}

@media (max-width: var(--breakpoint-lg)) {
  .stats-row { grid-template-columns: 1fr; }
  .bento-row { grid-template-columns: 1fr; }
  .traffic-card, .customer-card, .gender-card { grid-column: span 1; }
  .region-row { grid-template-columns: 1fr; }
  .region-card, .new-customers-card { grid-column: span 1; }
}

@media (max-width: var(--breakpoint-md)) {
  .dashboard-page { padding: var(--spacing-base); }
  .sales-body, .visitors-body { flex-direction: column; }
  .sales-stats, .visitors-stats { width: 100%; }
  .gender-body { flex-direction: column; align-items: flex-start; }
}
</style>
