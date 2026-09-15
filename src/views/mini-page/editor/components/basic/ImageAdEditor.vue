<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_layout')">
      <a-select v-model="formData.layout" @change="emitUpdate">
        <a-option value="single">{{ t('mini_page.layout_single') }}</a-option>
        <a-option value="double">{{ t('mini_page.layout_double') }}</a-option>
        <a-option value="triple">{{ t('mini_page.layout_triple') }}</a-option>
        <a-option value="l_r">{{ t('mini_page.layout_lr') }}</a-option>
      </a-select>
    </a-form-item>
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
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({ layout: 'single', images: [], ...props.props })

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const addImage = () => { formData.images.push({ url: '', link: '' }); emitUpdate() }
const removeImage = (index) => { formData.images.splice(index, 1); emitUpdate() }
const emitUpdate = () => { emit('update:props', { ...formData, images: [...formData.images] }) }
</script>

<style scoped>
.image-list { display: flex; flex-direction: column; gap: 8px; }
.image-item { padding: 8px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
</style>