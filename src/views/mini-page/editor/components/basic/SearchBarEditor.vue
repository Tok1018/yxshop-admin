<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_placeholder')">
      <a-input v-model="formData.placeholder" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_style')">
      <a-select v-model="formData.style" @change="emitUpdate">
        <a-option value="round">{{ t('mini_page.style_round') }}</a-option>
        <a-option value="square">{{ t('mini_page.style_square') }}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item label="显示城市定位">
      <a-switch v-model="formData.show_city" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="城市名称" v-if="formData.show_city">
      <a-input v-model="formData.city_name" placeholder="如：上海·浦东" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示扫码图标">
      <a-switch v-model="formData.show_scan" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示消息图标">
      <a-switch v-model="formData.show_msg" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="消息红点" v-if="formData.show_msg">
      <a-switch v-model="formData.msg_dot" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({ placeholder: '', style: 'round', show_scan: true, show_msg: false, msg_dot: false, show_city: false, city_name: '', ...props.props })

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const emitUpdate = () => { emit('update:props', { ...formData }) }
</script>
