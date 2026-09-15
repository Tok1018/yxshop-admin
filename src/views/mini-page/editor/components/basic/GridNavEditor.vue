<template>
  <a-form :model="formData" layout="vertical" size="small">
    <a-form-item :label="t('mini_page.prop_columns')">
      <a-input-number v-model="formData.columns" :min="3" :max="5" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_nav_items')">
      <div class="nav-list">
        <div v-for="(item, index) in formData.items" :key="index" class="nav-item-editor">
          <a-input v-model="formData.items[index].text" :placeholder="t('mini_page.nav_text_placeholder')" @change="emitUpdate" />
          <div class="nav-item-row">
            <sa-upload-image v-model="formData.items[index].icon" @update:modelValue="emitUpdate" style="flex:1" />
          </div>
          <a-select v-model="formData.items[index].icon_name" placeholder="选择图标(可选)" allow-clear @change="emitUpdate" style="margin-top: 4px">
            <a-option v-for="name in iconNames" :key="name" :value="name">
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <MpIcon :name="name" :size="16" color="#64748b" />
                {{ name }}
              </span>
            </a-option>
          </a-select>
          <a-input v-model="formData.items[index].badge" placeholder="角标(HOT/NEW)" @change="emitUpdate" style="margin-top: 4px" />
          <a-input v-model="formData.items[index].link" :placeholder="t('mini_page.nav_link_placeholder')" @change="emitUpdate" style="margin-top: 4px" />
          <a-button size="mini" status="danger" @click="removeItem(index)">{{ t('mini_page.btn_remove') }}</a-button>
        </div>
        <a-button size="small" type="dashed" long @click="addItem">{{ t('mini_page.btn_add_nav') }}</a-button>
      </div>
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const iconNames = [
  'smartphone', 'shirt', 'home', 'utensils', 'heart-pulse', 'car', 'wrench', 'briefcase',
  'gem', 'grid', 'zap', 'users', 'gift', 'ticket', 'truck', 'crown', 'shield', 'recycle',
  'video', 'trophy', 'flame', 'star', 'shopping-cart', 'tag', 'package', 'layers',
]

const formData = reactive({ columns: 4, items: [], ...props.props })

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const addItem = () => { formData.items.push({ text: '', icon: '', icon_name: '', link: '', badge: '' }); emitUpdate() }
const removeItem = (index) => { formData.items.splice(index, 1); emitUpdate() }
const emitUpdate = () => { emit('update:props', { ...formData, items: [...formData.items] }) }
</script>

<style scoped>
.nav-list { display: flex; flex-direction: column; gap: 8px; }
.nav-item-editor { padding: 8px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 4px; }
.nav-item-row { display: flex; align-items: center; }
</style>
