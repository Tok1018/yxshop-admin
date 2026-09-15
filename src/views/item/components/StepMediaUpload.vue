<template>
  <div class="step-media-upload">
    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.productImages') }}</h3>
      <a-upload
        :custom-request="handleImageUpload"
        :file-list="[]"
        accept="image/jpeg,image/png,image/gif,image/webp"
        :limit="20"
        list-type="text"
        :show-file-list="false"
        :disabled="uploading"
        drag
      >
        <template #upload-button>
          <div class="upload-drag-area">
            <div class="upload-icon">
              <a-spin v-if="uploading" size="24" />
              <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="upload-text">{{ uploading ? t('item.edit.uploading') : t('item.edit.dragOrClick') }}</div>
            <div class="upload-hint">{{ t('item.edit.imageHint') }}</div>
          </div>
        </template>
      </a-upload>

      <div class="image-grid" v-if="formData.images.length > 0">
        <div
          v-for="(img, idx) in formData.images"
          :key="img.uid"
          class="image-item"
          :class="{ 'is-cover': img.is_cover }"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragover.prevent
          @drop="onDrop(idx)"
        >
          <img :src="img.url" :alt="t('item.edit.image') + ' ' + (idx + 1)" />
          <div class="image-overlay">
            <span v-if="img.is_cover" class="cover-badge">{{ t('item.edit.cover') }}</span>
            <div class="image-actions">
              <a-button size="mini" type="primary" @click="setCover(idx)" v-if="isNotCover(img)">{{ t('item.edit.setCover') }}</a-button>
              <a-button size="mini" status="danger" @click="removeImage(idx)">{{ t('item.edit.delete') }}</a-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.productVideo') }} <span class="optional-tag">{{ t('item.edit.optional') }}</span></h3>
      <div v-if="formData.video" class="video-preview">
        <video :src="formData.video" controls style="width:100%;max-height:240px;border-radius:var(--radius-md)"></video>
        <a-button type="text" status="danger" size="small" @click="formData.video = ''">{{ t('item.edit.deleteVideo') }}</a-button>
      </div>
      <a-upload
        v-else
        :custom-request="handleVideoUpload"
        :file-list="[]"
        accept="video/mp4,video/webm"
        :limit="1"
        list-type="text"
        :show-file-list="false"
        :disabled="videoUploading"
      >
        <template #upload-button>
          <div class="upload-video-area">
            <a-spin v-if="videoUploading" size="20" />
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>{{ videoUploading ? t('item.edit.uploading') : t('item.edit.clickUploadVideo') }}</span>
            <span class="upload-hint">{{ t('item.edit.videoHint') }}</span>
          </div>
        </template>
      </a-upload>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { request } from '@/utils/request'

const { t } = useI18n()

const props = defineProps({
  formData: { type: Object, required: true },
})

let imgUidCounter = 0
const dragIdx = ref(null)
const uploading = ref(false)
const videoUploading = ref(false)

const handleImageUpload = async (option) => {
  const file = option.fileItem?.file || option.file
  if (!file) return

  if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
    Message.error(t('item.upload_image_format_error'))
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    Message.error(t('item.image_size_limit'))
    return
  }
  if (props.formData.images.length >= 20) {
    Message.error(t('item.image_count_limit'))
    return
  }

  try {
    uploading.value = true
    const fd = new FormData()
    fd.append('file', file)
    const res = await request({ url: '/admin/api/upload/image', method: 'post', data: fd, headers: { 'Content-Type': 'multipart/form-data' } })
    const url = res.data?.url || res.data?.file_url || ''
    if (!url) { Message.error(t('item.upload_failed')); return }

    const isFirst = props.formData.images.length === 0
    props.formData.images.push({
      uid: `img_${++imgUidCounter}`,
      url,
      is_cover: isFirst,
      sort: props.formData.images.length
    })
  } catch (error) { Message.error(t('item.image_upload_failed')) } finally { uploading.value = false }
}

const handleVideoUpload = async (option) => {
  const file = option.fileItem?.file || option.file
  if (!file) return

  if (!['video/mp4', 'video/webm'].includes(file.type)) {
    Message.error(t('item.upload_video_format_error'))
    return
  }
  if (file.size > 50 * 1024 * 1024) {
    Message.error(t('item.video_size_limit'))
    return
  }

  try {
    videoUploading.value = true
    const fd = new FormData()
    fd.append('file', file)
    const res = await request({ url: '/admin/api/upload/image', method: 'post', data: fd, headers: { 'Content-Type': 'multipart/form-data' } })
    props.formData.video = res.data?.url || res.data?.file_url || ''
  } catch (error) { Message.error(t('item.video_upload_failed')) } finally { videoUploading.value = false }
}

const setCover = (idx) => {
  props.formData.images.forEach((img, i) => { img.is_cover = i === idx })
}

const isNotCover = (img) => !img.is_cover

const removeImage = (idx) => {
  props.formData.images.splice(idx, 1)
  if (props.formData.images.length > 0 && !props.formData.images.some(img => img.is_cover)) {
    props.formData.images[0].is_cover = true
  }
}

const onDragStart = (idx) => { dragIdx.value = idx }
const onDrop = (idx) => {
  if (dragIdx.value === null || dragIdx.value === idx) return
  const list = [...props.formData.images]
  const [item] = list.splice(dragIdx.value, 1)
  list.splice(idx, 0, item)
  list.forEach((img, i) => { img.sort = i })
  props.formData.images = list
  dragIdx.value = null
}

const validate = () => true

defineExpose({ validate })
</script>

<style scoped>
.step-media-upload {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 20px 24px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-on-surface);
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.optional-tag {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-on-surface-variant);
  margin-left: 4px;
}

.upload-drag-area {
  border: 2px dashed var(--color-outline-variant);
  border-radius: 10px;
  padding: 32px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background: var(--color-surface-container-low);
}

.upload-drag-area:hover {
  border-color: var(--color-secondary);
}

.upload-icon {
  color: var(--color-on-surface-variant);
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: var(--color-on-surface-variant);
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: var(--color-on-surface-variant);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.image-item {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1;
  border: 2px solid transparent;
  cursor: grab;
}

.image-item.is-cover {
  border-color: var(--color-secondary);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay-darker);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.cover-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--color-secondary);
  color: var(--color-on-secondary);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.image-actions {
  display: flex;
  gap: 4px;
}

.upload-video-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 2px dashed var(--color-outline-variant);
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-on-surface-variant);
  transition: border-color 0.2s;
  background: var(--color-surface-container-low);
}

.upload-video-area:hover {
  border-color: var(--color-secondary);
}

.video-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>