<template>
  <div class="coupon-preview">
    <div class="coupon-header">
      <span class="section-title">{{ t('mini_page.coupon_title') }}</span>
    </div>
    <div class="coupon-list">
      <div class="coupon-card">
        <div class="coupon-left">
          <span class="coupon-amount">¥10</span>
          <span class="coupon-condition">{{ t('mini_page.coupon_condition_sample') }}</span>
        </div>
        <div class="coupon-right">
          <span class="coupon-btn">{{ t('mini_page.coupon_receive') }}</span>
        </div>
      </div>
      <div class="coupon-card">
        <div class="coupon-left">
          <span class="coupon-amount">¥20</span>
          <span class="coupon-condition">{{ t('mini_page.coupon_condition_sample') }}</span>
        </div>
        <div class="coupon-right">
          <span class="coupon-btn">{{ t('mini_page.coupon_receive') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({ props: { type: Object, default: () => ({}) } })
</script>

<style scoped>
.coupon-preview { background: #fff; padding: 12px; }
.section-title { font-size: 15px; font-weight: 600; color: #333; }
.coupon-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.coupon-card { display: flex; border: 1px dashed #e4393c; border-radius: 6px; overflow: hidden; }
.coupon-left { flex: 1; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff5f5; }
.coupon-amount { font-size: 20px; font-weight: 700; color: #e4393c; }
.coupon-condition { font-size: 10px; color: #999; }
.coupon-right { width: 50px; display: flex; align-items: center; justify-content: center; background: #e4393c; }
.coupon-btn { color: #fff; font-size: 11px; writing-mode: vertical-lr; }
</style>