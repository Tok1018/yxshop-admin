<template>
  <a-modal
    v-model:visible="visible"
    title="选择图片"
    @cancel="handleCancel"
    :footer="false"
    width="800px"
  >
    <div class="image-selector">
      <div class="image-upload">
        <a-upload
          accept="image/*"
          :show-file-list="false"
          :custom-request="handleUpload"
        >
          <a-button type="primary">
            <template #icon>
              <icon-upload />
            </template>
            上传图片
          </a-button>
        </a-upload>
      </div>
      
      <div class="image-list">
        <div 
          v-for="image in imageList" 
          :key="image.id" 
          class="image-item"
          @click="handleSelect(image)"
        >
          <img :src="image.url" :alt="image.name" />
          <div class="image-name">{{ image.name }}</div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { request } from '@/utils/request'
import { IconUpload } from '@arco-design/web-vue/es/icon'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = ref(false)
const imageList = ref([])

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    getImageList()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getImageList = async () => {
  try {
    const response = await request({
      url: '/admin/api/files',
      method: 'get',
      params: { file_type: 'image', page: 1, page_size: 100 }
    })
    const list = response.data?.list || response.data?.data || response.data || []
    imageList.value = (Array.isArray(list) ? list : []).map(item => ({
      id: item.id,
      name: item.original_name || item.file_name || item.filename || '',
      url: item.file_url || item.url || ''
    }))
  } catch (error) {
    console.error('获取图片列表失败:', error)
    Message.error('获取图片列表失败')
  }
}

const handleUpload = async (option) => {
  const { onSuccess, onError } = option
  const file = option.file || (option.fileItem && option.fileItem.file)

  if (!file) {
    onError && onError()
    Message.error('未获取到图片文件')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const response = await request({
      url: '/admin/api/upload/image',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.code === 200 || response.code === 0) {
      await getImageList()
      onSuccess && onSuccess()
      Message.success('上传成功')
    } else {
      onError && onError()
      Message.error(response.message || '上传失败')
    }
  } catch (error) {
    onError && onError()
    console.error('图片上传失败:', error)
    Message.error('图片上传失败')
  }
}

const handleSelect = (image) => {
  emit('select', image)
  handleCancel()
}

const handleCancel = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
@mixin text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-selector {
  .image-upload {
    margin-bottom: 16px;
    text-align: right;
  }
  
  .image-list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    max-height: 500px;
    overflow-y: auto;
    padding: 8px;
    
    .image-item {
      cursor: pointer;
      border-radius: var(--border-radius-medium);
      overflow: hidden;
      transition: all 0.2s;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      
      img {
        width: 100%;
        height: 160px;
        object-fit: cover;
      }
      
      .image-name {
        padding: 8px;
        font-size: 12px;
        color: var(--color-text-2);
        @include text-ellipsis;
      }
    }
  }
}
</style> 