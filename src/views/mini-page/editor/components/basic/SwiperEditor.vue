<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_images')">
      <div class="image-list">
        <div v-for="(img, index) in formData.images" :key="index" class="image-item">
          <sa-upload-image v-model="formData.images[index].url" @update:modelValue="emitUpdate" />
          <a-input v-model="formData.images[index].link" :placeholder="t('mini_page.image_link_placeholder')" @change="emitUpdate" style="margin-top: 4px" />
          <a-button size="mini" status="danger" @click="removeImage(index)">{{ t('mini_page.btn_remove') }}</a-button>
        </div>
        <a-button size="small" type="dashed" long @click="addImage">{{ t('mini_page.btn_add_image') }}</a-button>
      </div>
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_autoplay')">
      <a-switch v-model="formData.autoplay" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_interval')">
      <a-input-number v-model="formData.interval" :min="1000" :step="500" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_circular')">
      <a-switch v-model="formData.circular" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_indicator_dots')">
      <a-switch v-model="formData.indicator_dots" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({
  images: [],
  autoplay: true,
  interval: 3000,
  circular: true,
  indicator_dots: true,
  ...props.props
})

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const addImage = () => {
  formData.images.push({ url: '', link: '' })
  emitUpdate()
}

const removeImage = (index) => {
  formData.images.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => { emit('update:props', { ...formData, images: [...formData.images] }) }
</script>

<style scoped>
.image-list { display: flex; flex-direction: column; gap: 8px; }
.image-item { padding: 8px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
</style>