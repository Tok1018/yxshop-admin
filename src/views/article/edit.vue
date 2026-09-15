<template>
  <div class="article-edit-page">
    <div class="edit-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <icon-left />
          {{ t('article.back_to_list') }}
        </button>
        <h2 class="page-title">{{ isEdit ? t('article.edit_article') : t('article.new_article') }}</h2>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="goBack">{{ t('article.cancel') }}</button>
        <button class="btn-primary" :disabled="submitting" @click="handleSubmit">
          {{ isEdit ? t('article.save_changes') : t('article.publish_article') }}
        </button>
      </div>
    </div>

    <div class="edit-body" v-if="!pageLoading">
      <div class="form-card">
        <div class="form-section-title">{{ t('article.basic_info') }}</div>
        <div class="form-row">
          <div class="form-group flex-2">
            <label>{{ t('article.title') }} <span class="required">*</span></label>
            <input v-model="form.title" class="form-input" :placeholder="t('article.title_placeholder')" />
          </div>
          <div class="form-group flex-1">
            <label>{{ t('article.category') }}</label>
            <select v-model="form.category_id" class="form-input">
              <option value="">{{ t('article.select_category') }}</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group flex-1">
            <label>{{ t('article.sort') }}</label>
            <input v-model.number="form.sort" type="number" class="form-input" :placeholder="t('article.sort_placeholder')" />
          </div>
          <div class="form-group flex-1">
            <label>{{ t('article.status') }}</label>
            <div class="switch-row">
              <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" />
              <span class="switch-label">{{ form.status === 1 ? t('article.status_enabled') : t('article.status_disabled') }}</span>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label>{{ t('article.content') }}</label>
          <div class="editor-wrap">
            <ma-wang-editor v-model="form.content" :height="400" />
          </div>
        </div>
      </div>
    </div>

    <div class="page-loading" v-else>
      <a-spin :size="32" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getArticleDetail, createArticle, updateArticle } from '@/api/article'
import { getArticleCategoryList } from '@/api/article'
import MaWangEditor from '@/components/ma-wangEditor/index.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const isEdit = computed(() => !!route.params.id)
const pageLoading = ref(false)
const submitting = ref(false)
const categories = ref([])

const form = reactive({
  id: null,
  title: '',
  category_id: '',
  content: '',
  sort: 0,
  status: 1,
})

const goBack = () => {
  router.back()
}

const handleSubmit = async () => {
  if (!form.title) { Message.warning(t('article.title_required')); return }
  submitting.value = true
  try {
    const data = { ...form }
    delete data.id
    if (isEdit.value) {
      await updateArticle(form.id, data)
      Message.success(t('article.update_success'))
    } else {
      await createArticle(data)
      Message.success(t('article.create_success'))
    }
    goBack()
  } catch (error) { Message.error(t('article.msg_operation_failed')) } finally { submitting.value = false }
}

onMounted(async () => {
  pageLoading.value = true
  try {
    const catRes = await getArticleCategoryList({ page_size: 200 }).catch(() => ({ data: [] }))
    categories.value = catRes.data?.list || catRes.data?.data || (Array.isArray(catRes.data) ? catRes.data : [])

    if (isEdit.value) {
      const res = await getArticleDetail(route.params.id)
      const d = res.data || {}
      Object.assign(form, {
        id: d.id || null,
        title: d.title || '',
        category_id: d.category_id || '',
        content: d.content || '',
        sort: d.sort ?? 0,
        status: d.status ?? 1,
      })
    }
  } catch (error) { Message.error(t('article.load_data_failed')) } finally { pageLoading.value = false }
})
</script>

<style scoped>
.article-edit-page {
  padding: var(--spacing-xl);
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--color-on-surface);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}


.edit-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.form-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 900px;
}

.form-section-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-on-surface-variant);
  font-weight: 600;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-group.flex-2 { flex: 2; }
.form-group.flex-1 { flex: 1; }

.form-group label {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  font-weight: 500;
}


.form-input { background: var(--color-surface-container-low); padding: 10px 12px; box-sizing: border-box; }


.editor-wrap {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.switch-row { display: flex; align-items: center; gap: 10px; }
.switch-label { font-size: 13px; color: var(--color-on-surface-variant); }

.page-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
