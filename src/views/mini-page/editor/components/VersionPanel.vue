<template>
  <div class="version-panel">
    <div class="version-header">
      <span class="version-title">{{ t('mini_page.version_list') }}</span>
      <a-button size="small" @click="loadVersions">{{ t('mini_page.btn_refresh') }}</a-button>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="version-list">
        <div v-for="ver in versions" :key="ver.id" class="version-item" @click="viewDetail(ver)">
          <div class="version-info">
            <span class="version-number">v{{ ver.version_number }}</span>
            <span class="version-time">{{ ver.publish_at || '-' }}</span>
          </div>
          <div class="version-summary">{{ ver.summary || '-' }}</div>
          <a-popconfirm :content="t('mini_page.rollback_confirm')" @ok="handleRollback(ver)">
            <a-button size="mini" type="outline" status="warning">{{ t('mini_page.btn_rollback') }}</a-button>
          </a-popconfirm>
        </div>
        <div v-if="versions.length === 0 && !loading" class="version-empty">
          {{ t('mini_page.no_versions') }}
        </div>
      </div>
    </a-spin>

    <a-modal v-model:visible="detailVisible" :title="t('mini_page.version_detail')" :footer="false" :width="500">
      <div v-if="detailData" class="version-detail">
        <div class="detail-row"><span class="detail-label">{{ t('mini_page.version_number') }}:</span> <span>v{{ detailData.version_number }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('mini_page.publish_time') }}:</span> <span>{{ detailData.publish_at || '-' }}</span></div>
        <div class="detail-row"><span class="detail-label">{{ t('mini_page.summary') }}:</span> <span>{{ detailData.summary || '-' }}</span></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { getVersionList, getVersionDetail, rollbackVersion } from '@/api/mini-page'

const { t } = useI18n()

const props = defineProps({ pageId: { type: [String, Number], required: true } })

const versions = ref([])
const loading = ref(false)
const detailVisible = ref(false)
const detailData = ref(null)

const loadVersions = async () => {
  loading.value = true
  try {
    const res = await getVersionList(props.pageId)
    versions.value = res.data?.data?.list || res.data?.data || []
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
}

const viewDetail = async (ver) => {
  try {
    const res = await getVersionDetail(props.pageId, ver.id)
    detailData.value = res.data?.data || res.data || ver
    detailVisible.value = true
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const handleRollback = async (ver) => {
  try {
    await rollbackVersion(props.pageId, ver.id)
    Message.success(t('mini_page.rollback_success'))
    loadVersions()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
}

onMounted(() => loadVersions())
</script>

<style scoped>
.version-panel { padding: 12px; }
.version-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.version-title { font-size: 14px; font-weight: 600; color: var(--color-on-surface); }
.version-list { display: flex; flex-direction: column; gap: 8px; }
.version-item { padding: 10px; background: var(--color-surface-container-low); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s; }
.version-item:hover { background: var(--color-surface-container); }
.version-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.version-number { font-size: 13px; font-weight: 600; color: var(--color-on-surface); }
.version-time { font-size: 11px; color: var(--color-on-surface-variant); }
.version-summary { font-size: 12px; color: var(--color-on-surface-variant); margin-bottom: 6px; }
.version-empty { text-align: center; color: var(--color-on-surface-variant); font-size: 13px; padding: 24px; }
.version-detail { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; gap: 8px; font-size: 13px; }
.detail-label { color: var(--color-on-surface-variant); min-width: 80px; }
</style>