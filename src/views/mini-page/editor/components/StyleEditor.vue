<template>
  <a-collapse :default-active-key="[]" :bordered="false">
    <a-collapse-item :header="t('mini_page.style_section')" key="style">
      <a-form :model="style" layout="vertical" size="small">
        <a-form-item :label="t('mini_page.style_margin')">
          <div class="box-row">
            <a-input-number v-model="style.margin_top" :min="0" :placeholder="t('mini_page.style_top')" @change="emitUpdate" />
            <a-input-number v-model="style.margin_right" :min="0" :placeholder="t('mini_page.style_right')" @change="emitUpdate" />
            <a-input-number v-model="style.margin_bottom" :min="0" :placeholder="t('mini_page.style_bottom')" @change="emitUpdate" />
            <a-input-number v-model="style.margin_left" :min="0" :placeholder="t('mini_page.style_left')" @change="emitUpdate" />
          </div>
          <div class="box-hint">{{ t('mini_page.style_box_hint') }}</div>
        </a-form-item>

        <a-form-item :label="t('mini_page.style_padding')">
          <div class="box-row">
            <a-input-number v-model="style.padding_top" :min="0" :placeholder="t('mini_page.style_top')" @change="emitUpdate" />
            <a-input-number v-model="style.padding_right" :min="0" :placeholder="t('mini_page.style_right')" @change="emitUpdate" />
            <a-input-number v-model="style.padding_bottom" :min="0" :placeholder="t('mini_page.style_bottom')" @change="emitUpdate" />
            <a-input-number v-model="style.padding_left" :min="0" :placeholder="t('mini_page.style_left')" @change="emitUpdate" />
          </div>
          <div class="box-hint">{{ t('mini_page.style_box_hint') }}</div>
        </a-form-item>

        <a-form-item :label="t('mini_page.style_border_width')">
          <a-input-number v-model="style.border_width" :min="0" :max="20" @change="emitUpdate" />
        </a-form-item>
        <a-form-item :label="t('mini_page.style_border_style')">
          <a-select v-model="style.border_style" @change="emitUpdate">
            <a-option value="solid">{{ t('mini_page.style_border_solid') }}</a-option>
            <a-option value="dashed">{{ t('mini_page.style_border_dashed') }}</a-option>
            <a-option value="dotted">{{ t('mini_page.style_border_dotted') }}</a-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('mini_page.style_border_color')">
          <a-input v-model="style.border_color" placeholder="#e5e5e5" @change="emitUpdate" />
        </a-form-item>
        <a-form-item :label="t('mini_page.style_border_radius')">
          <a-input-number v-model="style.border_radius" :min="0" :max="200" @change="emitUpdate" />
        </a-form-item>
        <a-form-item :label="t('mini_page.style_background_color')">
          <a-input v-model="style.background_color" :placeholder="t('mini_page.style_bg_placeholder')" @change="emitUpdate" />
        </a-form-item>
      </a-form>
    </a-collapse-item>
  </a-collapse>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultStyle } from './styleHelper'

const { t } = useI18n()

const props = defineProps({ modelValue: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:modelValue'])

const style = reactive({ ...defaultStyle(), ...(props.modelValue || {}) })

watch(() => props.modelValue, (val) => { Object.assign(style, defaultStyle(), val || {}) }, { deep: true })

const emitUpdate = () => { emit('update:modelValue', { ...style }) }
</script>

<style scoped>
.box-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
.box-hint { font-size: 11px; color: var(--color-on-surface-variant); margin-top: 4px; }
:deep(.arco-input-number) { width: 100%; }
</style>
