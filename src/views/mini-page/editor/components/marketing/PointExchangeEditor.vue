<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_point_item_ids')">
      <a-input v-model="pointItemIdsText" :placeholder="t('mini_page.point_item_ids_placeholder')" @change="handleIdsChange" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = ref({ point_item_ids: [], ...props.props })
const pointItemIdsText = ref((props.props?.point_item_ids || []).join(','))

watch(() => props.props, (val) => {
  formData.value = { point_item_ids: [], ...val }
  pointItemIdsText.value = (val?.point_item_ids || []).join(',')
}, { deep: true })

const handleIdsChange = () => {
  formData.value.point_item_ids = pointItemIdsText.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('update:props', { ...formData.value })
}
</script>