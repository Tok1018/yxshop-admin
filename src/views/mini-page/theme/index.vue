<template>
  <div class="page-content">
    <div class="page-header">
      <div><h1 class="page-title">{{ t('mini_page.theme_title') }}</h1><p class="page-subtitle">{{ t('mini_page.theme_subtitle') }}</p></div>
      <div class="page-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('mini_page.create_theme') }}
        </button>
      </div>
    </div>

    <div class="theme-grid">
      <div v-for="theme in list" :key="theme.id" class="theme-card">
        <div class="theme-colors">
          <div class="color-swatch" :style="{ background: theme.primary_color }" :title="t('mini_page.primary_color')"></div>
          <div class="color-swatch" :style="{ background: theme.secondary_color }" :title="t('mini_page.secondary_color')"></div>
          <div class="color-swatch" :style="{ background: theme.nav_background_color }" :title="t('mini_page.nav_bg_color')"></div>
          <div class="color-swatch" :style="{ background: theme.nav_text_color }" :title="t('mini_page.nav_text_color')"></div>
        </div>
        <div class="theme-info">
          <span class="theme-name">{{ theme.theme_name }}</span>
        </div>
        <div class="theme-actions">
          <button class="btn-ghost btn-sm" @click="openForm(theme)">{{ t('common.edit') }}</button>
          <button class="btn-primary btn-sm" @click="openApplyModal(theme)">{{ t('mini_page.btn_apply') }}</button>
          <button class="btn-danger btn-sm" :disabled="theme.is_referenced" @click="handleDelete(theme)">{{ t('common.delete') }}</button>
        </div>
      </div>
      <div v-if="list.length === 0 && !loading" class="theme-empty">
        {{ t('mini_page.no_themes') }}
      </div>
    </div>

    <a-modal v-model:visible="formVisible" :title="form.id ? t('mini_page.edit_theme') : t('mini_page.create_theme')" @ok="handleSubmit" :ok-loading="submitting">
      <a-form :model="form" layout="vertical">
        <a-form-item :label="t('mini_page.theme_name')" required>
          <a-input v-model="form.theme_name" />
        </a-form-item>
        <a-form-item :label="t('mini_page.primary_color')">
          <a-input v-model="form.primary_color" />
        </a-form-item>
        <a-form-item :label="t('mini_page.secondary_color')">
          <a-input v-model="form.secondary_color" />
        </a-form-item>
        <a-form-item :label="t('mini_page.nav_bg_color')">
          <a-input v-model="form.nav_background_color" />
        </a-form-item>
        <a-form-item :label="t('mini_page.nav_text_color')">
          <a-input v-model="form.nav_text_color" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="applyVisible" :title="t('mini_page.apply_theme')" @ok="handleApply" :ok-loading="applyLoading">
      <a-form layout="vertical">
        <a-form-item :label="t('mini_page.select_page')" required>
          <a-select v-model="applyForm.page_id" :placeholder="t('mini_page.select_page_placeholder')">
            <a-option v-for="p in pages" :key="p.id" :value="p.id">{{ p.page_name }}</a-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Message } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { getMiniThemeList, createMiniTheme, updateMiniTheme, deleteMiniTheme, applyMiniTheme, getMiniPageList } from '@/api/mini-page'

const { t } = useI18n()

const list = ref([])
const pages = ref([])
const loading = ref(false)
const formVisible = ref(false)
const submitting = ref(false)
const applyVisible = ref(false)
const applyLoading = ref(false)
const form = reactive({ id: null, theme_name: '', primary_color: '#6366F1', secondary_color: '#818CF8', nav_background_color: '#ffffff', nav_text_color: '#333333' })
const applyForm = reactive({ page_id: null, theme_id: null })

const openForm = (record) => {
  Object.assign(form, { id: null, theme_name: '', primary_color: '#6366F1', secondary_color: '#818CF8', nav_background_color: '#ffffff', nav_text_color: '#333333' }, record || {})
  formVisible.value = true
}

const openApplyModal = (theme) => {
  applyForm.theme_id = theme.id
  applyForm.page_id = null
  applyVisible.value = true
}

const handleSubmit = async () => {
  if (!form.theme_name) { Message.warning(t('mini_page.theme_name_required')); return }
  submitting.value = true
  try {
    if (form.id) { await updateMiniTheme(form.id, form); Message.success(t('mini_page.update_success')) }
    else { await createMiniTheme(form); Message.success(t('mini_page.create_success')) }
    formVisible.value = false
    loadData()
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { submitting.value = false }
}

const handleApply = async () => {
  if (!applyForm.page_id) { Message.warning(t('mini_page.select_page_required')); return }
  applyLoading.value = true
  try {
    await applyMiniTheme(applyForm.theme_id, { page_id: applyForm.page_id })
    Message.success(t('mini_page.apply_success'))
    applyVisible.value = false
  } catch (e) { Message.error(t('mini_page.operation_failed')) }
  finally { applyLoading.value = false }
}

const handleDelete = async (theme) => {
  try { await deleteMiniTheme(theme.id); Message.success(t('mini_page.delete_success')); loadData() }
  catch (e) { Message.error(t('mini_page.operation_failed')) }
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMiniThemeList()
    list.value = res.data?.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
  } catch (e) { }
  finally { loading.value = false }
}

const loadPages = async () => {
  try {
    const res = await getMiniPageList({ page_size: 100 })
    const data = res.data?.data || res.data || {}
    pages.value = Array.isArray(data) ? data : (data.list || [])
  } catch (e) { }
}

onMounted(() => { loadData(); loadPages() })
</script>

<style scoped>


.theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.theme-card { background: var(--color-surface-container-lowest); border: 1px solid var(--color-outline-variant); border-radius: var(--radius-xl); padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.theme-colors { display: flex; gap: 8px; }
.color-swatch { width: 36px; height: 36px; border-radius: var(--radius-md); border: 1px solid var(--color-outline-variant); }
.theme-info { display: flex; justify-content: space-between; align-items: center; }
.theme-name { font-size: 14px; font-weight: 500; color: var(--color-on-surface); }
.theme-actions { display: flex; gap: 6px; }
.theme-empty { grid-column: 1 / -1; text-align: center; color: var(--color-on-surface-variant); font-size: 13px; padding: 60px; }
</style>
