<template>
  <a-drawer
    :visible="visible"
    :title="title"
    :width="width"
    :mask-closable="false"
    unmount-on-close
    @cancel="handleClose"
  >
    <a-form ref="formRef" :model="formModel" :rules="rules" layout="vertical">
      <a-form-item v-for="field in fields" :key="field.key" :field="field.key" :label="field.label" :required="field.required">
        <slot :name="`form-${field.key}`" :model="formModel" :field="field">
          <a-input v-if="field.type === 'input' || !field.type" v-model="formModel[field.key]" :placeholder="field.placeholder || `请输入${field.label}`" :max-length="field.maxLength" />
          <a-textarea v-else-if="field.type === 'textarea'" v-model="formModel[field.key]" :placeholder="field.placeholder || `请输入${field.label}`" :max-length="field.maxLength" />
          <a-input-number v-else-if="field.type === 'number'" v-model="formModel[field.key]" :placeholder="field.placeholder" :min="field.min" :max="field.max" :precision="field.precision" />
          <a-select v-else-if="field.type === 'select'" v-model="formModel[field.key]" :placeholder="field.placeholder || `请选择${field.label}`" :options="field.options" />
          <a-date-picker v-else-if="field.type === 'date'" v-model="formModel[field.key]" :placeholder="field.placeholder" style="width: 100%" />
          <a-switch v-else-if="field.type === 'switch'" v-model="formModel[field.key]" />
        </slot>
      </a-form-item>
    </a-form>
    <template #footer>
      <slot name="footer">
        <a-space>
          <a-button @click="handleClose">取消</a-button>
          <a-button type="primary" :loading="submitting" @click="handleSubmit">{{ submitText }}</a-button>
        </a-space>
      </slot>
    </template>
  </a-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: [String, Number], default: 500 },
  fields: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) },
  rules: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
  submitText: { type: String, default: '提交' },
})

const emit = defineEmits(['update:visible', 'submit', 'close'])

const formRef = ref(null)
const formModel = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => { formModel.value = { ...val } }, { deep: true })

function handleClose() {
  emit('update:visible', false)
  emit('close')
}

async function handleSubmit() {
  try {
    const valid = await formRef.value?.validate()
    if (valid) return
    emit('submit', { ...formModel.value })
  } catch {
    // validation failed
  }
}
</script>