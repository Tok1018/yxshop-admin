<template>
  <div class="point-exchange-preview">
    <div class="pe-header">
      <MpIcon name="gift" :size="16" color="#6b21a8" />
      <span class="section-title">{{ t('mini_page.point_exchange_title') }}</span>
    </div>
    <div class="pe-list">
      <div class="pe-card">
        <div class="pe-cover">
          <MpIcon name="package" :size="24" color="#8b5cf6" />
        </div>
        <div class="pe-info">
          <div class="pe-name">{{ t('mini_page.point_item_sample') }}</div>
          <div class="pe-points">500 {{ t('mini_page.points_unit') }}</div>
        </div>
      </div>
      <div class="pe-card">
        <div class="pe-cover">
          <MpIcon name="package" :size="24" color="#8b5cf6" />
        </div>
        <div class="pe-info">
          <div class="pe-name">{{ t('mini_page.point_item_sample') }}</div>
          <div class="pe-points">1000 {{ t('mini_page.points_unit') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()
defineProps({ props: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.point-exchange-preview { background: linear-gradient(135deg, #faf5ff, #f5f3ff); padding: 12px; border-radius: 8px; }
.pe-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
.section-title { font-size: 15px; font-weight: 600; color: #6b21a8; }
.pe-list { display: flex; flex-direction: column; gap: 8px; }
.pe-card { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fff; border-radius: 8px; }
.pe-cover { width: 40px; height: 40px; background: #f3e8ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
.pe-info { flex: 1; }
.pe-name { font-size: 12px; color: #333; }
.pe-points { font-size: 14px; font-weight: 600; color: #6366f1; margin-top: 2px; }
</style>
