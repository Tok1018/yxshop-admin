<template>
  <div class="editor-page">
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <a-button type="text" @click="goBack">
          <template #icon><icon-left /></template>
          {{ t('mini_page.btn_back') }}
        </a-button>
        <span class="toolbar-divider"></span>
        <span class="page-name-label">{{ pageName }}</span>
        <a-tag v-if="dirty" color="orangered" size="small">{{ t('mini_page.unsaved') }}</a-tag>
      </div>
      <div class="toolbar-right">
        <a-button @click="handleSave" :loading="saving" type="primary">{{ t('mini_page.btn_save') }}</a-button>
        <a-button @click="handlePublish" :loading="publishing" status="success">{{ t('mini_page.btn_publish') }}</a-button>
        <a-button @click="showVersionPanel = true" type="outline">{{ t('mini_page.btn_version') }}</a-button>
        <a-button v-if="isEnterprise" @click="showTemplatePanel = true" type="outline">{{ t('mini_page.btn_template') }}</a-button>
      </div>
    </div>

    <div class="editor-body">
      <div class="editor-left">
        <component-panel :schemas="componentSchemas" />
      </div>
      <div class="editor-center">
        <canvas-area
          :page-data="pageData"
          :selected-component-id="selectedComponentId"
          @select="selectComponent"
          @delete="deleteComponent"
          @sort-change="handleSortChange"
        />
      </div>
      <div class="editor-right">
        <props-editor
          :selected-component="selectedComponent"
          @update:props="updateComponentProps"
        />
      </div>
    </div>

    <a-modal v-model:visible="conflictVisible" :title="t('mini_page.conflict_title')" :hide-cancel="true" :closable="false">
      <div>{{ t('mini_page.conflict_message') }}</div>
      <template #footer>
        <a-button type="primary" @click="handleConflictRefresh">{{ t('mini_page.btn_refresh') }}</a-button>
      </template>
    </a-modal>

    <a-drawer
      v-model:visible="showVersionPanel"
      :title="t('mini_page.version_management')"
      :width="380"
      placement="right"
    >
      <version-panel :page-id="pageId" />
    </a-drawer>

    <a-drawer
      v-if="isEnterprise"
      v-model:visible="showTemplatePanel"
      :title="t('mini_page.template_management')"
      :width="380"
      placement="right"
    >
      <div class="template-section">
        <a-button type="primary" long @click="handleSaveAsTemplate">{{ t('mini_page.save_as_template') }}</a-button>
        <a-modal v-model:visible="saveTemplateVisible" :title="t('mini_page.save_as_template')" @ok="confirmSaveTemplate">
          <a-input v-model="templateName" :placeholder="t('mini_page.template_name_placeholder')" />
        </a-modal>
      </div>
      <div class="template-list" style="margin-top: 16px;">
        <div v-for="tpl in templateList" :key="tpl.id" class="template-card" @click="handleUseTemplate(tpl)">
          <div class="template-name">{{ tpl.template_name }}</div>
          <div class="template-time">{{ tpl.created_at }}</div>
        </div>
        <a-empty v-if="!templateList.length" />
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import { getMiniPageDetail, updateMiniPage, publishMiniPage, getComponentSchemas, createTemplate, getTemplateList, createPageFromTemplate } from '@/api/mini-page'
import { componentRegistry } from './components/registry'
import ComponentPanel from './components/ComponentPanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import PropsEditor from './components/PropsEditor.vue'
import VersionPanel from './components/VersionPanel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const pageId = computed(() => route.params.id)
const pageName = ref('')
const pageData = ref([])
const selectedComponentId = ref(null)
const dirty = ref(false)
const saving = ref(false)
const publishing = ref(false)
const conflictVisible = ref(false)
const showVersionPanel = ref(false)
const showTemplatePanel = ref(false)
const templateList = ref([])
const templateName = ref('')
const isEnterprise = ref(false)
const version = ref(0)
const componentSchemas = ref([])

let autoSaveTimer = null

const selectedComponent = computed(() => {
  if (!selectedComponentId.value) return null
  return pageData.value.find(c => c.component_id === selectedComponentId.value) || null
})

const selectComponent = (id) => { selectedComponentId.value = id }

const deleteComponent = (id) => {
  pageData.value = pageData.value.filter(c => c.component_id !== id)
  if (selectedComponentId.value === id) selectedComponentId.value = null
  dirty.value = true
}

const updateComponentProps = (props) => {
  if (!selectedComponent.value) return
  selectedComponent.value.props = { ...selectedComponent.value.props, ...props }
  dirty.value = true
}

const handleSortChange = (newList) => {
  pageData.value = newList.map((item, index) => ({ ...item, sort: index }))
  dirty.value = true
}

const handleSave = async () => {
  saving.value = true
  try {
    const data = {
      page_name: pageName.value,
      page_data: pageData.value,
      version: version.value
    }
    const res = await updateMiniPage(pageId.value, data)
    version.value = res.data?.data?.version || res.data?.version || version.value + 1
    dirty.value = false
    Message.success(t('mini_page.save_success'))
  } catch (e) {
    if (e.response?.status === 409) {
      conflictVisible.value = true
    } else {
      Message.error(t('mini_page.operation_failed'))
    }
  } finally { saving.value = false }
}

const handlePublish = async () => {
  publishing.value = true
  try {
    await handleSave()
    await publishMiniPage(pageId.value)
    Message.success(t('mini_page.publish_success'))
    await loadPageData()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { publishing.value = false }
}

const handleConflictRefresh = async () => {
  conflictVisible.value = false
  await loadPageData()
}

const goBack = () => {
  if (dirty.value) {
    const ok = window.confirm(t('mini_page.unsaved_confirm'))
    if (!ok) return
  }
  router.push({ name: 'miniPage' })
}

const loadPageData = async () => {
  try {
    const res = await getMiniPageDetail(pageId.value)
    const data = res.data?.data || res.data || {}
    pageName.value = data.page_name || ''
    pageData.value = data.page_data || []
    version.value = data.version || 0
    dirty.value = false
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const loadSchemas = async () => {
  try {
    const res = await getComponentSchemas()
    const schemas = res.data?.data || res.data || []
    componentSchemas.value = schemas
    isEnterprise.value = schemas.some(s => s.edition === 'enterprise')
  } catch (e) { /* ignore */ }
}

const startAutoSave = () => {
  autoSaveTimer = setInterval(() => {
    if (dirty.value) handleSave()
  }, 30000)
}

const saveTemplateVisible = ref(false)

const handleSaveAsTemplate = () => {
  templateName.value = ''
  saveTemplateVisible.value = true
}

const confirmSaveTemplate = async () => {
  if (!templateName.value.trim()) {
    Message.warning(t('mini_page.template_name_required'))
    return
  }
  try {
    await createTemplate({ template_name: templateName.value, page_id: pageId.value })
    Message.success(t('mini_page.save_template_success'))
    saveTemplateVisible.value = false
    await loadTemplates()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const loadTemplates = async () => {
  try {
    const res = await getTemplateList()
    templateList.value = res.data?.data || res.data || []
  } catch (e) { /* ignore */ }
}

const handleUseTemplate = async (tpl) => {
  const ok = window.confirm(t('mini_page.use_template_confirm'))
  if (!ok) return
  try {
    await createPageFromTemplate(tpl.id, { page_name: pageName.value, page_type: 10 })
    Message.success(t('mini_page.use_template_success'))
    await loadPageData()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
}

onMounted(async () => {
  await Promise.all([loadPageData(), loadSchemas()])
  startAutoSave()
})

onBeforeUnmount(() => {
  if (autoSaveTimer) clearInterval(autoSaveTimer)
})
</script>

<style scoped>
.editor-page { height: 100vh; display: flex; flex-direction: column; background: var(--color-surface-container-lowest); color: var(--color-on-surface); }
.editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: var(--color-surface-container-low); border-bottom: 1px solid var(--color-outline-variant); flex-shrink: 0; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.toolbar-divider { width: 1px; height: 20px; background: var(--color-outline-variant); }
.page-name-label { font-size: 14px; font-weight: 500; }
.editor-body { flex: 1; display: flex; min-height: 0; overflow: hidden; }
.editor-left { width: 260px; flex-shrink: 0; border-right: 1px solid var(--color-outline-variant); background: var(--color-surface-container-low); overflow-y: auto; }
.editor-center { flex: 1; display: flex; justify-content: center; align-items: flex-start; padding: 24px; overflow-y: auto; background: var(--color-surface-container-lowest); }
.editor-right { width: 320px; flex-shrink: 0; border-left: 1px solid var(--color-outline-variant); background: var(--color-surface-container-low); overflow-y: auto; }
</style>