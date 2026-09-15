<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item label="样式风格">
      <a-select v-model="formData.style" @change="emitUpdate">
        <a-option value="solid">纯色渐变</a-option>
        <a-option value="glass">毛玻璃(会员卡)</a-option>
        <a-option value="dark">深色(直播)</a-option>
      </a-select>
    </a-form-item>
    <a-form-item label="渐变起始色">
      <a-input v-model="formData.bg_color1" placeholder="#2563eb" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="渐变结束色">
      <a-input v-model="formData.bg_color2" placeholder="#3b82f6" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="图标">
      <a-select v-model="formData.icon" placeholder="选择图标" allow-clear @change="emitUpdate">
        <a-option v-for="name in iconNames" :key="name" :value="name">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <MpIcon :name="name" :size="16" color="#64748b" />
            {{ name }}
          </span>
        </a-option>
      </a-select>
    </a-form-item>
    <a-form-item label="图标背景色">
      <a-input v-model="formData.icon_bg" placeholder="留空使用默认色" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="标题">
      <a-input v-model="formData.title" placeholder="企业会员 PRO" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="副标题">
      <a-input v-model="formData.subtitle" placeholder="尊享专属价 · 月结 · 专属客服" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="按钮文字">
      <a-input v-model="formData.btn_text" placeholder="立即开通" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="按钮链接">
      <a-input v-model="formData.btn_link" placeholder="/pages/profile/profile" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示直播脉冲点">
      <a-switch v-model="formData.show_pulse" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import MpIcon from '@/components/MpIcon.vue'

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const iconNames = [
  'crown', 'gift', 'video', 'zap', 'users', 'ticket', 'truck', 'shield',
  'recycle', 'trophy', 'flame', 'star', 'heart', 'bell', 'volume', 'tag',
]

const formData = reactive({
  style: 'solid', bg_color1: '#2563eb', bg_color2: '#3b82f6',
  icon: '', icon_bg: '', title: '', subtitle: '',
  btn_text: '', btn_link: '', show_pulse: false,
  ...props.props
})
watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })
const emitUpdate = () => { emit('update:props', { ...formData }) }
</script>
