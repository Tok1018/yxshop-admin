<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_html_content')">
      <a-textarea v-model="formData.content" :auto-size="{ minRows: 4, maxRows: 12 }" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({ content: '', ...props.props })

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const emitUpdate = () => { emit('update:props', { ...formData }) }
</script>