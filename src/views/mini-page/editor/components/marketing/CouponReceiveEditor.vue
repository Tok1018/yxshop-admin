<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_coupon_ids')">
      <a-input v-model="couponIdsText" :placeholder="t('mini_page.coupon_ids_placeholder')" @change="handleIdsChange" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = ref({ coupon_ids: [], ...props.props })
const couponIdsText = ref((props.props?.coupon_ids || []).join(','))

watch(() => props.props, (val) => {
  formData.value = { coupon_ids: [], ...val }
  couponIdsText.value = (val?.coupon_ids || []).join(',')
}, { deep: true })

const handleIdsChange = () => {
  formData.value.coupon_ids = couponIdsText.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('update:props', { ...formData.value })
}
</script>