<template>
  <div class="step-price-stock">
    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.priceSettings') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="price" :label="t('item.edit.originalPrice')" required>
              <a-input-number v-model="formData.price" :min="0.01" :precision="2" :step="1" placeholder="0.00" style="width:100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="sale_price" :label="t('item.edit.salePrice')">
              <a-input-number v-model="formData.sale_price" :min="0.01" :precision="2" :step="1" placeholder="0.00" style="width:100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="cost_price" :label="t('item.edit.costPrice')">
              <a-input-number v-model="formData.cost_price" :min="0" :precision="2" :step="1" placeholder="0.00" style="width:100%">
                <template #prefix>¥</template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <div v-if="formData.sale_price && formData.sale_price >= formData.price" class="price-error">
          {{ t('item.edit.salePriceMustLower') }}
        </div>
        <div v-if="profitMargin !== null" class="profit-preview">
          <div class="profit-row">
            <span class="profit-label">{{ t('item.edit.profitMargin') }}</span>
            <span :class="['profit-value', profitMargin < 0 ? 'profit-negative' : 'profit-positive']">{{ profitMargin.toFixed(1) }}%</span>
          </div>
          <div class="profit-row">
            <span class="profit-label">{{ t('item.edit.profitAmount') }}</span>
            <span :class="['profit-value', profitAmount < 0 ? 'profit-negative' : 'profit-positive']">¥{{ profitAmount.toFixed(2) }}</span>
          </div>
        </div>
        <a-alert v-if="formData.skus.length > 0" type="info" style="margin-top:8px">
          {{ t('item.edit.priceBasedOnSku') }}
        </a-alert>
      </a-form>
    </div>

    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.stockSettings') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="stock" :label="t('item.edit.totalStock')">
              <a-input-number
                v-model="totalStock"
                :min="0"
                :step="1"
                placeholder="0"
                style="width:100%"
                :disabled="formData.skus.length > 0"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="stock_warning" :label="t('item.edit.stockWarning')">
              <a-input-number v-model="formData.stock_warning" :min="0" :step="1" placeholder="0" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-alert v-if="formData.skus.length > 0" type="info" style="margin-top:8px">
          {{ t('item.edit.stockAutoBySku') }}
        </a-alert>
      </a-form>
    </div>

    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.publishSettings') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="status" :label="t('item.edit.listingStatus')">
              <a-switch v-model="formData.status" :checked-value="1" :unchecked-value="0">
                <template #checked>{{ t('item.edit.onShelf') }}</template>
                <template #unchecked>{{ t('item.edit.offShelf') }}</template>
              </a-switch>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="sort" :label="t('item.edit.sort')">
              <a-input-number v-model="formData.sort" :min="0" :step="1" placeholder="0" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  formData: { type: Object, required: true },
})

const totalStock = computed({
  get() {
    if (props.formData.skus.length > 0) {
      return props.formData.skus.reduce((sum, s) => sum + (s.stock || 0), 0)
    }
    return props.formData.stock
  },
  set(val) {
    if (props.formData.skus.length === 0) {
      props.formData.stock = val
    }
  }
})

const effectivePrice = computed(() => {
  return props.formData.sale_price || props.formData.price || 0
})

const profitAmount = computed(() => {
  const cost = props.formData.cost_price || 0
  return effectivePrice.value - cost
})

const profitMargin = computed(() => {
  if (!effectivePrice.value || effectivePrice.value <= 0) return null
  const cost = props.formData.cost_price || 0
  return ((effectivePrice.value - cost) / effectivePrice.value) * 100
})

const validate = () => {
  if (!props.formData.price || props.formData.price <= 0) {
    Message.warning(t('item.price_required'))
    return false
  }
  if (props.formData.sale_price && props.formData.sale_price >= props.formData.price) {
    Message.warning(t('item.sale_price_must_lower'))
    return false
  }
  if (props.formData.skus.length === 0 && (props.formData.stock === undefined || props.formData.stock === null || props.formData.stock < 0)) {
    Message.warning(t('item.stock_required'))
    return false
  }
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.step-price-stock {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 20px 24px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.price-error {
  color: rgb(var(--danger-6));
  font-size: 12px;
  margin-top: 4px;
}

.profit-preview {
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-outline-variant);
}

.profit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.profit-label {
  font-size: 13px;
  color: var(--color-on-surface-variant);
}

.profit-value {
  font-size: 15px;
  font-weight: 700;
}

.profit-positive {
  color: rgb(var(--success-6));
}

.profit-negative {
  color: rgb(var(--danger-6));
}
</style>