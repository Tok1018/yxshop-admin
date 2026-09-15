<template>
  <div class="step-basic-info">
    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.productType') }}</h3>
      <div class="type-switch">
        <div
          class="type-card"
          :class="{ active: formData.type === 'physical' }"
          @click="formData.type = 'physical'"
        >
          <div class="type-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <div class="type-text">
            <span class="type-name">{{ t('item.edit.physicalProduct') }}</span>
            <span class="type-desc">{{ t('item.edit.physicalDesc') }}</span>
          </div>
        </div>
        <div
          class="type-card"
          :class="{ active: formData.type === 'virtual' }"
          @click="formData.type = 'virtual'"
        >
          <div class="type-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div class="type-text">
            <span class="type-name">{{ t('item.edit.virtualProduct') }}</span>
            <span class="type-desc">{{ t('item.edit.virtualDesc') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.basicInfo') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-form-item field="name" :label="t('item.edit.productTitle')" required>
          <a-input v-model="formData.name" :placeholder="t('item.edit.enterTitle')" :max-length="200" show-word-limit />
        </a-form-item>
        <a-form-item field="subtitle" :label="t('item.edit.subtitle')">
          <a-input v-model="formData.subtitle" :placeholder="t('item.edit.enterSubtitle')" :max-length="500" show-word-limit />
        </a-form-item>
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="category_id" :label="t('item.edit.primaryCategory')" required>
              <a-select v-model="formData.category_id" :placeholder="t('item.edit.selectPrimaryCategory')" allow-clear @change="onCategoryChange('1')">
                <a-option v-for="c in topLevelCategories" :key="c.id" :value="c.id">{{ c.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="sub_category_id" :label="t('item.edit.secondaryCategory')" required>
              <a-select v-model="formData.sub_category_id" :placeholder="t('item.edit.selectSecondaryCategory')" allow-clear :disabled="!formData.category_id" @change="onCategoryChange('2')">
                <a-option v-for="c in secondLevelCategories" :key="c.id" :value="c.id">{{ c.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item field="third_category_id" :label="t('item.edit.tertiaryCategory')">
              <a-select v-model="formData.third_category_id" :placeholder="t('item.edit.selectTertiaryCategory')" allow-clear :disabled="!formData.sub_category_id">
                <a-option v-for="c in thirdLevelCategories" :key="c.id" :value="c.id">{{ c.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item field="brand_id" :label="t('item.edit.brand')">
              <a-select v-model="formData.brand_id" :placeholder="t('item.edit.searchBrand')" allow-clear allow-search :filter-option="filterBrand">
                <a-option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</a-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item field="tag_ids" :label="t('item.edit.productTags')">
              <a-select v-model="formData.tag_ids" :placeholder="t('item.edit.selectTags')" multiple allow-clear>
                <a-option v-for="t in itemTags" :key="t.id" :value="t.id">
                  <span :style="{ display:'inline-flex', alignItems:'center', gap:'6px' }">
                    <span :style="{ width:'10px', height:'10px', borderRadius:'50%', background: t.tag_color || '#ff6b6b', display:'inline-block' }"></span>
                    {{ t.tag_name }}
                  </span>
                </a-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="form-card" v-if="formData.type === 'physical'">
      <h3 class="card-title">{{ t('item.edit.logisticsInfo') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="6">
            <a-form-item field="weight" :label="t('item.edit.weight')">
              <a-input-number v-model="formData.weight" :min="0" :precision="2" :step="0.1" placeholder="0.00" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="length" :label="t('item.edit.length')">
              <a-input-number v-model="formData.length" :min="0" :precision="1" :step="1" placeholder="0" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="width" :label="t('item.edit.width')">
              <a-input-number v-model="formData.width" :min="0" :precision="1" :step="1" placeholder="0" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item field="height" :label="t('item.edit.height')">
              <a-input-number v-model="formData.height" :min="0" :precision="1" :step="1" placeholder="0" style="width:100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="form-card" v-if="formData.type === 'virtual'">
      <h3 class="card-title">{{ t('item.edit.virtualInfo') }}</h3>
      <a-form :model="formData" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item field="valid_days" :label="t('item.edit.validDays')">
              <a-input-number v-model="formData.valid_days" :min="1" :step="1" :placeholder="t('item.edit.validDaysPlaceholder')" style="width:100%" />
            </a-form-item>
          </a-col>
          <a-col :span="16">
            <a-form-item field="usage_note" :label="t('item.edit.usageNote')">
              <a-textarea v-model="formData.usage_note" :placeholder="t('item.edit.enterUsageNote')" :max-length="1000" :auto-size="{ minRows: 2, maxRows: 4 }" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.productDescription') }}</h3>
      <ma-wang-editor v-model="formData.description" :height="350" />
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
  categories: { type: Array, default: () => [] },
  brands: { type: Array, default: () => [] },
  itemTags: { type: Array, default: () => [] },
})

const topLevelCategories = computed(() => {
  return (props.categories || []).filter(c => !c.parent_id || c.parent_id == 0)
})

const secondLevelCategories = computed(() => {
  if (!props.formData.category_id) return []
  const parent = (topLevelCategories.value || []).find(c => String(c.id) === String(props.formData.category_id))
  return parent?.children || []
})

const thirdLevelCategories = computed(() => {
  if (!props.formData.sub_category_id) return []
  const parent = (secondLevelCategories.value || []).find(c => String(c.id) === String(props.formData.sub_category_id))
  return parent?.children || []
})

const onCategoryChange = (level) => {
  if (level === '1') {
    props.formData.sub_category_id = ''
    props.formData.third_category_id = ''
  } else if (level === '2') {
    props.formData.third_category_id = ''
  }
}

const filterBrand = (input, option) => {
  const brand = props.brands.find(b => b.id === option.value)
  return brand ? brand.name.toLowerCase().includes(input.toLowerCase()) : false
}

const validate = () => {
  if (!props.formData.name || !props.formData.name.trim()) {
    Message.warning(t('item.title_required'))
    return false
  }
  if (props.formData.name.length > 200) {
    Message.warning(t('item.title_length_limit'))
    return false
  }
  if (!props.formData.category_id) {
    Message.warning(t('item.category_required'))
    return false
  }
  if (!props.formData.sub_category_id) {
    Message.warning(t('item.sub_category_required'))
    return false
  }
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.step-basic-info {
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

.type-switch {
  display: flex;
  gap: 16px;
}

.type-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border: 2px solid var(--color-outline-variant);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-surface-container-low);
}

.type-card:hover {
  border-color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 4%, transparent);
}

.type-card.active {
  border-color: var(--color-secondary);
  background: color-mix(in srgb, var(--color-secondary) 8%, transparent);
}

.type-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-secondary) 10%, transparent);
  color: var(--color-secondary);
  flex-shrink: 0;
}

.type-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.type-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-on-surface);
}

.type-desc {
  font-size: 12px;
  color: var(--color-on-surface-variant);
}
</style>