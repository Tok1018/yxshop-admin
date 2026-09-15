<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_detail.title') }}</h1>
        <p class="page-subtitle">{{ t('user_detail.subtitle') }}</p>
      </div>
      <button class="btn-ghost" @click="$router.back()">
        <icon-left />
        {{ t('user_detail.back') }}
      </button>
    </div>

    <div class="detail-grid" v-if="detail.id">
      <div class="profile-card">
        <div class="profile-avatar" :class="getAvatarColorClass(detail.id)">
          {{ (detail.nickname || detail.username || '?')[0] }}
        </div>
        <h2 class="profile-name">{{ detail.nickname || detail.username || '-' }}</h2>
        <span class="profile-username" v-if="detail.username">@{{ detail.username }}</span>
        <span :class="detail.status === 1 ? 'badge-success' : 'badge-error'">{{ detail.status === 1 ? t('user_detail.status_active') : t('user_detail.status_disabled') }}</span>
        <div class="profile-stats">
          <div class="p-stat">
            <span class="p-stat-value mono">¥{{ Number(detail.money || detail.balance || 0).toFixed(2) }}</span>
            <span class="p-stat-label">{{ t('user_detail.balance') }}</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-value mono">{{ detail.score || detail.points || 0 }}</span>
            <span class="p-stat-label">{{ t('user_detail.points') }}</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-value mono">{{ detail.order_count || 0 }}</span>
            <span class="p-stat-label">{{ t('user_detail.orders') }}</span>
          </div>
        </div>
      </div>

      <div class="info-card">
        <h3>{{ t('user_detail.basic_info') }}</h3>
        <div class="info-grid">
          <div class="info-item"><span class="info-label">{{ t('user_detail.user_id') }}</span><span class="info-value mono">{{ detail.id }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.username') }}</span><span class="info-value">{{ detail.username || '-' }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.nickname') }}</span><span class="info-value">{{ detail.nickname || '-' }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.phone') }}</span><span class="info-value mono">{{ detail.phone || '-' }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.email') }}</span><span class="info-value">{{ detail.email || '-' }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.level') }}</span><span class="info-value">{{ detail.level_name || '-' }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.register_time') }}</span><span class="info-value">{{ formatTime(detail.created_at) }}</span></div>
          <div class="info-item"><span class="info-label">{{ t('user_detail.last_login') }}</span><span class="info-value">{{ formatTime(detail.last_login_at) }}</span></div>
        </div>
      </div>
    </div>

    <div class="empty-state" v-if="isDetailMissing">
      <icon-empty class="empty-icon" />
      <span class="empty-text">{{ t('user_detail.not_found') }}</span>
    </div>

    <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconEmpty } from '@arco-design/web-vue/es/icon'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getUserDetail } from '@/api/user'

const route = useRoute()
const { t } = useI18n()
const detail = ref({})
const loading = ref(false)
const isDetailMissing = computed(() => !detail.value.id && !loading.value)

const avatarColorClasses = ['avatar-color-0', 'avatar-color-1', 'avatar-color-2', 'avatar-color-3', 'avatar-color-4', 'avatar-color-5', 'avatar-color-6', 'avatar-color-7']
const getAvatarColorClass = (id) => avatarColorClasses[(id || 0) % avatarColorClasses.length]

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = new Date(typeof ts === 'number' ? ts * 1000 : ts)
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  const id = route.params.id || route.query.id
  if (id) {
    loading.value = true
    try {
      const res = await getUserDetail(id)
      detail.value = res.data?.user || res.data || {}
    } catch (error) { Message.error(t('user.operationFailed')) } finally { loading.value = false }
  }
})
</script>

<style scoped>

.profile-card {
  flex-direction: column;
  text-align: center;
  padding: 28px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-on-primary);
  margin: 0 auto 16px;
}

.avatar-color-0 { background: var(--color-secondary); }
.avatar-color-1 { background: var(--color-primary); }
.avatar-color-2 { background: var(--color-tertiary); }
.avatar-color-3 { background: var(--color-secondary-container); }
.avatar-color-4 { background: var(--color-error); }
.avatar-color-5 { background: var(--color-primary-container); }
.avatar-color-6 { background: var(--color-tertiary-container); }
.avatar-color-7 { background: var(--color-secondary); }

.profile-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--color-on-surface);
}

.profile-username {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  display: block;
  margin-bottom: 8px;
}

.profile-stats {
  display: flex;
  gap: 0;
  margin-top: 20px;
  border-top: 1px solid var(--color-outline-variant);
  padding-top: 16px;
}

.p-stat {
  flex: 1;
  text-align: center;
}

.p-stat-value {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-on-surface);
}

.p-stat-label {
  display: block;
  font-size: 11px;
  color: var(--color-on-surface-variant);
  margin-top: 4px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}



.page-content {
  position: relative;
}

@media (max-width: var(--breakpoint-md)) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
