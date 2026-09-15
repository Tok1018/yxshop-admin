<template>
  <div class="upload-image flex" :class="props.rounded ? 'rounded-full' : ''">
    <!-- 单图 -->
    <a-space wrap>
      <div :class="'image-list ' + (props.rounded ? 'rounded-full' : '')" v-if="!props.multiple && currentItem?.url">
        <a-button class="delete" @click="removeSignImage()">
          <template #icon>
            <icon-delete />
          </template>
        </a-button>
        <a-image width="130" height="130" :class="props.rounded ? 'rounded-full' : ''" :src="currentItem.url" />
      </div>
      <!-- 多图显示 -->
      <template v-else-if="props.multiple">
        <div :class="'image-list ' + (props.rounded ? 'rounded-full' : '')" v-for="(image, idx) in showImgList" :key="idx">
          <a-button class="delete" @click="removeImage(idx)">
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
          <a-image width="130" height="130" :class="props.rounded ? 'rounded-full' : ''" :src="image.url" />
        </div>
      </template>

      <div 
        :class="'upload-skin ' + (props.rounded ? 'rounded-full' : 'rounded-sm')" 
        v-if="!props.modelValue || props.multiple"
        @click="showImageModal = true"
      >
              <div class="icon text-3xl">
                <component :is="props.icon" />
              </div>
              <div class="title">
                {{ props.title }}
              </div>
            </div>

      <sa-image-selector
        v-model="showImageModal"
        @select="handleImageSelect"
      />
    </a-space>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { isArray } from 'lodash'
import { Message } from '@arco-design/web-vue'
import SaImageSelector from '@/components/sa-image-selector/index.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: () => {},
  },
  rounded: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  title: { type: String, default: '本地上传' },
  icon: { type: String, default: 'icon-plus' },
  limit: { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])

const showImgList = ref([])
const signImage = ref()
const currentItem = ref({})
const showImageModal = ref(false)

const handleImageSelect = async (image) => {
  try {
  if (!props.multiple) {
      signImage.value = image.url
      currentItem.value = { url: image.url }
      emit('update:modelValue', image.url)
    } else {
      if (props.limit > 0 && showImgList.value.length >= props.limit) {
      Message.warning('最多上传' + props.limit + '张图片')
        return
      }
      showImgList.value.push({ url: image.url })
      let files = showImgList.value.map(item => item.url)
        emit('update:modelValue', files)
      }
  } catch (error) {
    console.error('图片选择失败:', error)
    Message.error('图片选择失败')
  }
}

const removeSignImage = () => {
  currentItem.value = {}
  signImage.value = undefined
  emit('update:modelValue', null)
}

const removeImage = (idx) => {
  showImgList.value.splice(idx, 1)
  let files = showImgList.value.map(item => item.url)
  emit('update:modelValue', files)
}

const initData = async () => {
  if (props.multiple) {
    if (isArray(props.modelValue) && props.modelValue.length > 0) {
      showImgList.value = props.modelValue.map((url) => {
        return { url }
      })
    } else {
      showImgList.value = []
    }
  } else if (props.modelValue) {
    signImage.value = props.modelValue
    currentItem.value.url = props.modelValue
  } else {
    removeSignImage()
  }
}

watch(
  () => props.modelValue,
  (val) => {
    initData()
  },
  {
    deep: true,
    immediate: true,
  }
)
</script>

<style lang="less" scoped>
.upload-skin {
  background-color: var(--color-fill-2);
  border: 1px dashed var(--color-fill-4);
  width: 130px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;

  .icon,
  .title {
    color: var(--color-text-3);
  }

  &:hover {
    border: 1px dashed rgb(var(--primary-6));
  }
}

.image-list {
  cursor: pointer;
  position: relative;
  background-color: var(--color-fill-2);
  width: 130px;
  height: 130px;

  .delete {
    position: absolute;
    z-index: 99;
    right: 3px;
    top: 3px;
    display: none;
  }
}

.image-list:hover {
  .delete {
    display: block;
  }
}

:deep(.arco-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
