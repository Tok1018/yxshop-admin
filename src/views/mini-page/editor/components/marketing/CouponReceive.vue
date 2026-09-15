<template>
  <div class="coupon-receive-preview">
    <div class="coupon-receive-header">
      <span class="section-title">{{ t('mini_page.coupon_receive_title') }}</span>
    </div>
    <div class="coupon-receive-list">
      <div class="cr-card">
        <div class="cr-amount">¥5</div>
        <div class="cr-info">
          <div class="cr-name">{{ t('mini_page.coupon_name_sample') }}</div>
          <div class="cr-condition">{{ t('mini_page.coupon_condition_sample') }}</div>
        </div>
        <a-button size="mini" type="primary">{{ t('mini_page.coupon_get') }}</a-button>
      </div>
      <div class="cr-card">
        <div class="cr-amount">¥10</div>
        <div class="cr-info">
          <div class="cr-name">{{ t('mini_page.coupon_name_sample') }}</div>
          <div class="cr-condition">{{ t('mini_page.coupon_condition_sample') }}</div>
        </div>
        <a-button size="mini" type="primary">{{ t('mini_page.coupon_get') }}</a-button>
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
.coupon-receive-preview { background: #fff; padding: 12px; }
.section-title { font-size: 15px; font-weight: 600; color: #333; }
.coupon-receive-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.cr-card { display: flex; align-items: center; gap: 10px; padding: 10px; background: #fff9f0; border-radius: 6px; border: 1px solid #ffe0b2; }
.cr-amount { font-size: 20px; font-weight: 700; color: #ff6b35; min-width: 50px; text-align: center; }
.cr-info { flex: 1; }
.cr-name { font-size: 12px; color: #333; }
.cr-condition { font-size: 10px; color: #999; margin-top: 2px; }
</style>