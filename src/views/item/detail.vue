<template>
  <div class="page-content">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="$router.back()">
          <icon-left />
          {{ t('common.back') }}
        </button>
        <h1 class="page-title">{{ t('item.detail.title') }}</h1>
        <span class="page-subtitle">{{ detail.name || '' }}</span>
      </div>
      <div class="page-actions">
        <button class="btn-ghost" @click="$router.back()">{{ t('common.backToList') }}</button>
        <button class="btn-primary" @click="router.push({ name: 'itemEdit', params: { id: detail.id } })">{{ t('item.detail.editItem') }}</button>
      </div>
    </div>

    <div class="detail-grid">
      <div class="info-card">
        <h3>{{ t('item.detail.basicInfo') }}</h3>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">{{ t('item.detail.itemId') }}</span><span class="info-value mono">{{ detail.id }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.itemName') }}</span><span class="info-value">{{ detail.name || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.price') }}</span><span class="info-value mono">¥{{ detail.price || 0 }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.stock') }}</span><span class="info-value mono">{{ detail.stock || 0 }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.sales') }}</span><span class="info-value mono">{{ detail.sales || 0 }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.status') }}</span><span class="badge" :class="detail.status === 1 ? 'badge-success' : 'badge-error'">{{ detail.status === 1 ? t('item.detail.statusOn') : t('item.detail.statusOff') }}</span></div>
        </div>
      </div>

      <div class="info-card">
        <h3>{{ t('item.detail.categoryAndBrand') }}</h3>
        <div class="info-grid">
          <div class="info-row"><span class="info-label">{{ t('item.detail.category') }}</span><span class="info-value">{{ detail.category_name || '-' }}</span></div>
          <div class="info-row"><span class="info-label">{{ t('item.detail.brand') }}</span><span class="info-value">{{ detail.brand_name || '-' }}</span></div>
        </div>
      </div>

      <div class="info-card description-card" v-if="detail.description">
        <h3>{{ t('item.detail.description') }}</h3>
        <p class="description-text">{{ detail.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Message } from '@arco-design/web-vue'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getItemDetail } from '@/api/item'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const detail = ref({})

onMounted(async () => {
  const id = route.params.id || route.query.id
  if (id) {
    try {
      const res = await getItemDetail(id)
      detail.value = res.data || {}
    } catch (error) { Message.error(t('item.operationFailed')) }
  }
})
</script>

<style scoped>
.page-content {

  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}


.description-card {
  grid-column: 1 / -1;
}

.description-text {
  color: var(--color-on-surface-variant);
  font-size: 13px;
  margin: 0;
  line-height: 1.6;
}


</style>
