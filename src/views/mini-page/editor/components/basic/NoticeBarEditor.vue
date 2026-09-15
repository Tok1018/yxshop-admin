<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_content')">
      <a-textarea v-model="formData.content" :auto-size="{ minRows: 2 }" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_scrollable')">
      <a-switch v-model="formData.scrollable" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_text_color')">
      <a-input v-model="formData.text_color" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_background_color')">
      <a-input v-model="formData.background_color" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({ content: '', scrollable: true, icon: 'volume', text_color: '#FF6B35', background_color: '#FFF7E6', ...props.props })

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const emitUpdate = () => { emit('update:props', { ...formData }) }
</script>