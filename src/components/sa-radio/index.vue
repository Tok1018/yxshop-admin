<template>
  <div>
    <a-radio-group v-model="value" :direction="props.direction" :type="props.type" :disabled="props.disabled" @change="handleChangeEvent($event)">
      <a-radio v-for="(item, index) in currentDictList" :key="index" :value="item.value">{{ item.label }}</a-radio>
    </a-radio-group>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useDictStore } from '@/store'
import * as commonApi from '@/api/common'

const dictList = useDictStore().data
const emit = defineEmits(['update:modelValue', 'change'])
const value = ref()
const localDictData = ref({})

const props = defineProps({
  modelValue: { type: [String, Number] },
  type: { type: String, default: 'radio' },
  dict: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  direction: { type: String, default: 'horizontal' },
})

const currentDictList = computed(() => {
  if (dictList && props.dict && dictList[props.dict]) {
    return dictList[props.dict]
  }

  if (localDictData.value && props.dict && localDictData.value[props.dict]) {
    return localDictData.value[props.dict]
  }

  if (props.dict === 'data_status') {
    return [
      { label: '正常', value: '1' },
      { label: '停用', value: '2' }
    ]
  }

  return []
})

const checkDictLoaded = () => {
  const hasStoreData = dictList && props.dict && dictList[props.dict]
  const hasLocalData = localDictData.value && props.dict && localDictData.value[props.dict]
  const hasDefaultData = props.dict === 'data_status'

  if (hasStoreData || hasLocalData || hasDefaultData) {
    return true
  }
  return false
}

const loadDictFromAPI = async () => {
  try {
    const response = await commonApi.dictAll()
    if (response && response.data) {
      localDictData.value = response.data
    }
  } catch (error) {
    // silently fail, will use fallback data
  }
}

onMounted(async () => {
  if (!checkDictLoaded() && !dictList) {
    const dictStore = useDictStore()
    try {
      await dictStore.initData()
    } catch (err) {
      // fallback to API
    }
  }

  if (!checkDictLoaded() && (!dictList || !dictList[props.dict])) {
    await loadDictFromAPI()
  }

  const dictStore = useDictStore()
  watch(() => dictStore.data, () => {
    checkDictLoaded()
  }, { immediate: true })
})

watch(
  () => props.modelValue,
  (vl) => {
    if (props.dict !== '') {
      value.value = vl + ''
    } else {
      value.value = vl
    }
  },
  { immediate: true }
)

watch(
  () => value.value,
  (v) => {
    emit('update:modelValue', value.value)
  }
)

const handleChangeEvent = async (value) => {
  emit('change', value)
}
</script>
