<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item label="标题">
      <a-input v-model="formData.title" placeholder="品牌专区" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="查看全部文字">
      <a-input v-model="formData.more_text" placeholder="查看全部" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="查看全部链接">
      <a-input v-model="formData.more_link" placeholder="/pages/search/search" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="列数">
      <a-input-number v-model="formData.columns" :min="3" :max="6" @change="emitUpdate" />
    </a-form-item>

    <a-divider />

    <a-form-item label="数据来源">
      <a-radio-group v-model="formData.source_type" @change="emitUpdate">
        <a-radio value="system">系统品牌</a-radio>
        <a-radio value="custom">自定义</a-radio>
      </a-radio-group>
    </a-form-item>

    <!-- 系统品牌模式配置 -->
    <template v-if="formData.source_type === 'system'">
      <a-form-item label="品牌筛选">
        <a-radio-group v-model="formData.is_hot" @change="emitUpdate">
          <a-radio :value="0">全部品牌</a-radio>
          <a-radio :value="1">热门品牌</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="显示数量">
        <a-input-number v-model="formData.limit" :min="1" :max="20" @change="emitUpdate" />
      </a-form-item>
      <div class="system-hint">
        选择「系统品牌」时，前端将自动从数据库读取已启用的品牌，按排序字段展示。
      </div>
    </template>

    <!-- 自定义模式配置 -->
    <template v-if="formData.source_type === 'custom'">
      <a-form-item label="品牌列表">
        <div class="brand-list">
          <div v-for="(item, index) in formData.items" :key="index" class="brand-editor">
            <a-input v-model="formData.items[index].name" placeholder="品牌名称" @change="emitUpdate" />
            <sa-upload-image v-model="formData.items[index].logo" @update:modelValue="emitUpdate" style="margin-top: 4px" />
            <a-input v-model="formData.items[index].link" placeholder="跳转链接" @change="emitUpdate" style="margin-top: 4px" />
            <a-button size="mini" status="danger" @click="removeItem(index)">删除</a-button>
          </div>
          <a-button size="small" type="dashed" long @click="addItem">添加品牌</a-button>
        </div>
      </a-form-item>
    </template>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])
const formData = reactive({
  title: '品牌专区',
  more_text: '查看全部',
  more_link: '',
  columns: 4,
  source_type: 'system',
  is_hot: 0,
  limit: 8,
  items: [],
  ...props.props
})
watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })
const addItem = () => { formData.items.push({ name: '', logo: '', link: '' }); emitUpdate() }
const removeItem = (index) => { formData.items.splice(index, 1); emitUpdate() }
const emitUpdate = () => { emit('update:props', { ...formData, items: [...formData.items] }) }
</script>

<style scoped>
.brand-list { display: flex; flex-direction: column; gap: 8px; }
.brand-editor { padding: 8px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
.system-hint { padding: 8px 12px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); font-size: 12px; color: var(--color-on-surface-variant); line-height: 1.6; }
</style>
