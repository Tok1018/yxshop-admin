<template>
  <div class="page-content">
    <div class="page-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <icon-left />
          {{ t('common.backToList') }}
        </button>
        <h1 class="page-title">{{ isEdit ? t('item.edit.title') : t('item.edit.createTitle') }}</h1>
      </div>
      <div class="page-actions">
        <button class="btn-ghost" @click="goBack">{{ t('common.cancel') }}</button>
        <button class="btn-primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? t('item.edit.saveChanges') : t('item.edit.publishItem') }}
        </button>
      </div>
    </div>

    <div class="step-bar">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-item"
        :class="{
          active: currentStep === idx + 1,
          done: currentStep > idx + 1
        }"
        @click="handleStepClick(idx + 1)"
      >
        <span class="step-dot">
          <icon-check v-if="currentStep > idx + 1" />
          <span v-else>{{ idx + 1 }}</span>
        </span>
        <span class="step-label">{{ step }}</span>
      </div>
    </div>

    <div class="edit-body" v-if="isPageReady">
      <div class="step-content">
        <step-basic-info
          v-show="currentStep === 1"
          ref="step1Ref"
          :form-data="form"
          :categories="categories"
          :brands="brands"
          :item-tags="itemTags"
        />
        <step-spec-sku
          v-show="currentStep === 2"
          ref="step2Ref"
          :form-data="form"
        />
        <step-media-upload
          v-show="currentStep === 3"
          ref="step3Ref"
          :form-data="form"
        />
        <step-price-stock
          v-show="currentStep === 4"
          ref="step4Ref"
          :form-data="form"
        />
      </div>
    </div>

    <div class="table-loading" v-if="!isPageReady"><div class="spinner"></div></div>

    <div class="step-footer" v-if="isPageReady">
      <a-button v-if="currentStep > 1" @click="handlePrev">{{ t('item.edit.prevStep') }}</a-button>
      <div v-else></div>
      <a-button v-if="currentStep < 4" type="primary" @click="handleNext">{{ t('item.edit.nextStep') }}</a-button>
      <a-button v-else type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? t('item.edit.saveChanges') : t('item.edit.publishItem') }}
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { useI18n } from 'vue-i18n'
import { safeBack } from '@/utils/router'
import { getItemDetail, createItem, updateItem } from '@/api/item'
import { getCategoryList } from '@/api/category'
import { getBrandList } from '@/api/brand'
import { getItemTagsList } from '@/api/item_tags'
import StepBasicInfo from './components/StepBasicInfo.vue'
import StepSpecSku from './components/StepSpecSku.vue'
import StepMediaUpload from './components/StepMediaUpload.vue'
import StepPriceStock from './components/StepPriceStock.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const isEdit = computed(() => !!route.params.id)
const pageLoading = ref(false)
const isPageReady = computed(() => !pageLoading.value)
const submitting = ref(false)
const currentStep = ref(1)

const steps = [
  t('item.edit.stepBasicInfo'),
  t('item.edit.stepSpecSku'),
  t('item.edit.stepMedia'),
  t('item.edit.stepPriceStock')
]

const categories = ref([])
const brands = ref([])
const itemTags = ref([])

const step1Ref = ref(null)
const step2Ref = ref(null)
const step3Ref = ref(null)
const step4Ref = ref(null)

const stepRefs = [step1Ref, step2Ref, step3Ref, step4Ref]

const form = reactive({
  id: null,
  type: 'physical',
  name: '',
  subtitle: '',
  category_id: '',
  sub_category_id: '',
  third_category_id: '',
  brand_id: '',
  tag_ids: [],
  weight: null,
  length: null,
  width: null,
  height: null,
  valid_days: null,
  usage_note: '',
  description: '',
  specs: [],
  skus: [],
  images: [],
  video: '',
  price: 0,
  sale_price: null,
  cost_price: null,
  stock: 0,
  stock_warning: null,
  status: 1,
  sort: 0,
  created_at: '',
  updated_at: '',
})

const goBack = () => {
  if (hasUnsavedChanges.value) {
    Modal.warning({
      title: t('item.edit.leaveTitle'),
      content: t('item.edit.leaveConfirm'),
      hideCancel: false,
      onOk: () => safeBack('/product/items'),
    })
    return
  }
  safeBack('/product/items')
}

const hasUnsavedChanges = ref(false)
const markDirty = () => { hasUnsavedChanges.value = true }

onBeforeRouteLeave((to, from, next) => {
  if (!hasUnsavedChanges.value) return next()
  Modal.warning({
    title: t('item.edit.leaveTitle'),
    content: t('item.edit.leaveConfirm'),
    hideCancel: false,
    onOk: () => { hasUnsavedChanges.value = false; next() },
    onCancel: () => next(false),
  })
})

const handleNext = async () => {
  const refEl = stepRefs[currentStep.value - 1].value
  if (refEl && refEl.validate) {
    const valid = await refEl.validate()
    if (!valid) return
  }
  if (currentStep.value < 4) currentStep.value++
}

const handlePrev = () => {
  if (currentStep.value > 1) currentStep.value--
}

const handleStepClick = (step) => {
  if (step < currentStep.value) currentStep.value = step
}

const handleSubmit = async () => {
  for (let i = 0; i < 4; i++) {
    const refEl = stepRefs[i].value
    if (refEl && refEl.validate) {
      const valid = await refEl.validate()
      if (!valid) {
        currentStep.value = i + 1
        return
      }
    }
  }

  submitting.value = true
  try {
    const payload = buildPayload()
    if (isEdit.value) {
      await updateItem(form.id, payload)
      Message.success(t('item.update_success'))
    } else {
      await createItem(payload)
      Message.success(t('item.create_success'))
    }
    hasUnsavedChanges.value = false
    goBack()
  } catch (error) { Message.error(t('item.operationFailed')) } finally { submitting.value = false }
}

const buildPayload = () => {
  const data = { ...form }
  delete data.id
  delete data.created_at
  delete data.updated_at

  if (data.skus && data.skus.length > 0) {
    data.skus = data.skus.map(s => ({
      sku_code: s.sku_code || '',
      spec_values: s.spec_values,
      price: s.price,
      cost_price: s.cost_price ?? null,
      market_price: s.market_price ?? null,
      stock: s.stock,
      weight: s.weight ?? null,
      image: s.image || ''
    }))
    delete data.stock
  }

  if (data.specs && data.specs.length > 0) {
    data.specs = data.specs.map(s => ({
      name: s.name,
      values: s.values
    }))
  }

  if (data.images && data.images.length > 0) {
    data.images = data.images.map((img, idx) => ({
      url: img.url,
      is_cover: img.is_cover,
      sort: idx
    }))
  }

  return data
}

onMounted(async () => {
  pageLoading.value = true
  try {
    const [catRes, brandRes, tagRes] = await Promise.all([
      getCategoryList(),
      getBrandList(),
      getItemTagsList().catch(() => ({ data: [] }))
    ])
    categories.value = Array.isArray(catRes.data?.top_categories) ? catRes.data.top_categories : Array.isArray(catRes.data?.data) ? catRes.data.data : Array.isArray(catRes.data) ? catRes.data : []
    brands.value = Array.isArray(brandRes.data?.list) ? brandRes.data.list : Array.isArray(brandRes.data) ? brandRes.data : []
    itemTags.value = Array.isArray(tagRes.data?.data) ? tagRes.data.data : Array.isArray(tagRes.data?.list) ? tagRes.data.list : Array.isArray(tagRes.data) ? tagRes.data : []

    if (isEdit.value) {
      const res = await getItemDetail(route.params.id)
      const d = res.data || {}
      Object.assign(form, {
        id: d.id || null,
        type: d.type || 'physical',
        name: d.name || '',
        subtitle: d.subtitle || '',
        category_id: d.category_id ? String(d.category_id) : '',
        sub_category_id: d.sub_category_id ? String(d.sub_category_id) : '',
        third_category_id: d.third_category_id ? String(d.third_category_id) : '',
        brand_id: d.brand_id ? String(d.brand_id) : '',
        tag_ids: Array.isArray(d.tag_ids) ? d.tag_ids.map(id => String(id)) : [],
        weight: d.weight ? Number(d.weight) : null,
        length: d.length ? Number(d.length) : null,
        width: d.width ? Number(d.width) : null,
        height: d.height ? Number(d.height) : null,
        valid_days: d.valid_days ? Number(d.valid_days) : null,
        usage_note: d.usage_note || '',
        description: d.description || '',
        specs: d.specs || [],
        skus: d.skus || [],
        images: d.images || [],
        video: d.video || '',
        price: d.price ? Number(d.price) : 0,
        sale_price: d.sale_price ? Number(d.sale_price) : null,
        cost_price: d.cost_price ? Number(d.cost_price) : null,
        stock: d.stock || 0,
        stock_warning: d.stock_warning ? Number(d.stock_warning) : null,
        status: d.status ?? 1,
        sort: d.sort || 0,
        created_at: d.created_at || '',
        updated_at: d.updated_at || '',
      })
    }
  } catch (error) { Message.error(t('item.load_data_failed')) } finally { pageLoading.value = false }
})
</script>

<style scoped>
.page-content {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-base);
}

.edit-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.step-content {
  max-width: 960px;
  margin: 0 auto;
}

.step-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-base) 0 0;
  border-top: 1px solid var(--color-outline-variant);
  margin-top: var(--spacing-base);
  flex-shrink: 0;
}
</style>
