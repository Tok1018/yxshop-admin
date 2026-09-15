<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item label="布局">
      <a-select v-model="formData.layout" @change="emitUpdate">
        <a-option value="one_big_two_small">1大2小</a-option>
        <a-option value="two_col">两列</a-option>
        <a-option value="three_col">三列</a-option>
      </a-select>
    </a-form-item>
    <a-form-item label="推广卡片">
      <div class="card-list">
        <div v-for="(card, index) in formData.cards" :key="index" class="card-editor">
          <a-input v-model="formData.cards[index].title" placeholder="卡片标题" @change="emitUpdate" />
          <a-input v-model="formData.cards[index].subtitle" placeholder="副标题" @change="emitUpdate" style="margin-top: 4px" />
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <a-input v-model="formData.cards[index].bg_color1" placeholder="背景色1" style="flex:1" @change="emitUpdate" />
            <a-input v-model="formData.cards[index].bg_color2" placeholder="背景色2" style="flex:1" @change="emitUpdate" />
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <a-input v-model="formData.cards[index].text_color" placeholder="文字颜色" style="flex:1" @change="emitUpdate" />
            <a-input v-model="formData.cards[index].icon" placeholder="装饰图标" style="flex:1" @change="emitUpdate" />
          </div>
          <div style="display: flex; gap: 8px; margin-top: 4px;">
            <a-input v-model="formData.cards[index].btn_text" placeholder="按钮文字" style="flex:1" @change="emitUpdate" />
            <a-input v-model="formData.cards[index].link" placeholder="跳转链接" style="flex:1" @change="emitUpdate" />
          </div>
          <a-button size="mini" status="danger" @click="removeCard(index)" style="margin-top: 4px">删除卡片</a-button>
        </div>
        <a-button size="small" type="dashed" long @click="addCard">添加卡片</a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])
const formData = reactive({ layout: 'one_big_two_small', cards: [], ...props.props })
watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })
const addCard = () => {
  formData.cards.push({ title: '', subtitle: '', bg_color1: '#fef3c7', bg_color2: '#fde68a', text_color: '#92400e', icon: '', btn_text: '', link: '' })
  emitUpdate()
}
const removeCard = (index) => { formData.cards.splice(index, 1); emitUpdate() }
const emitUpdate = () => { emit('update:props', { ...formData, cards: [...formData.cards] }) }
</script>

<style scoped>
.card-list { display: flex; flex-direction: column; gap: 8px; }
.card-editor { padding: 8px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
</style>
