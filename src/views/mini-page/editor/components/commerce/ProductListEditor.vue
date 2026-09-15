<template>
  <a-form :model="formData" layout="vertical" size="small">
    <!-- 区块标题配置 -->
    <a-form-item label="区块标题">
      <a-input v-model="formData.title" placeholder="如：新品首发" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="区块图标">
      <a-select v-model="formData.icon" placeholder="选择图标" allow-clear @change="emitUpdate">
        <a-option v-for="name in iconNames" :key="name" :value="name">
          <span style="display: inline-flex; align-items: center; gap: 6px;">
            <MpIcon :name="name" :size="16" color="#64748b" />
            {{ name }}
          </span>
        </a-option>
      </a-select>
    </a-form-item>
    <a-form-item label="标签文字">
      <a-input v-model="formData.tag_text" placeholder="如：本周上新" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示列数">
      <a-radio-group v-model="formData.columns" @change="emitUpdate">
        <a-radio :value="1">单列</a-radio>
        <a-radio :value="2">双列</a-radio>
        <a-radio :value="3">三列</a-radio>
      </a-radio-group>
    </a-form-item>

    <a-divider />

    <a-form-item :label="t('mini_page.prop_source_type')">
      <a-select v-model="formData.source_type" @change="emitUpdate">
        <a-option value="manual">{{ t('mini_page.source_manual') }}</a-option>
        <a-option value="category">{{ t('mini_page.source_category') }}</a-option>
        <a-option value="tag">{{ t('mini_page.source_tag') }}</a-option>
      </a-select>
    </a-form-item>

    <a-form-item v-if="formData.source_type === 'manual'" :label="t('mini_page.prop_select_items')">
      <a-select
        v-model="formData.item_ids"
        multiple
        allow-search
        :loading="itemLoading"
        :placeholder="t('mini_page.select_items_placeholder')"
        :filter-option="false"
        @search="handleItemSearch"
        @change="emitUpdate"
      >
        <a-option v-for="it in itemOptions" :key="it.id" :value="it.id">{{ it.name || it.item_name }}</a-option>
      </a-select>
    </a-form-item>

    <a-form-item v-if="formData.source_type === 'category'" :label="t('mini_page.prop_select_category')">
      <a-select
        v-model="formData.category_id"
        allow-search
        :loading="categoryLoading"
        :placeholder="t('mini_page.select_category_placeholder')"
        @change="emitUpdate"
      >
        <a-option v-for="c in categoryOptions" :key="c.id" :value="c.id">{{ c.name || c.category_name }}</a-option>
      </a-select>
    </a-form-item>

    <a-form-item v-if="formData.source_type === 'tag'" :label="t('mini_page.prop_select_tag')">
      <a-select
        v-model="formData.tag_id"
        allow-search
        :loading="tagLoading"
        :placeholder="t('mini_page.select_tag_placeholder')"
        @change="emitUpdate"
      >
        <a-option v-for="tag in tagOptions" :key="tag.id" :value="tag.id">{{ tag.name || tag.tag_name }}</a-option>
      </a-select>
    </a-form-item>

    <a-form-item :label="t('mini_page.prop_display_count')">
      <a-input-number v-model="formData.display_count" :min="1" :max="50" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_display_style')">
      <a-select v-model="formData.display_style" @change="emitUpdate">
        <a-option value="two_small">{{ t('mini_page.style_two_small') }}</a-option>
        <a-option value="one_big">{{ t('mini_page.style_one_big') }}</a-option>
        <a-option value="one_big_two_small">{{ t('mini_page.style_one_big_two_small') }}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_sort_by')">
      <a-select v-model="formData.sort_by" @change="emitUpdate">
        <a-option value="newest">{{ t('mini_page.sort_newest') }}</a-option>
        <a-option value="sales">{{ t('mini_page.sort_sales') }}</a-option>
        <a-option value="price_asc">{{ t('mini_page.sort_price_asc') }}</a-option>
        <a-option value="price_desc">{{ t('mini_page.sort_price_desc') }}</a-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_show_sales')">
      <a-switch v-model="formData.show_sales" @change="emitUpdate" />
    </a-form-item>
    <a-form-item :label="t('mini_page.prop_show_tags')">
      <a-switch v-model="formData.show_tags" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示加购按钮">
      <a-switch v-model="formData.show_cart" @change="emitUpdate" />
    </a-form-item>
    <a-form-item label="显示查看更多">
      <a-switch v-model="formData.show_more" @change="emitUpdate" />
    </a-form-item>
    <a-form-item v-if="formData.show_more" label="更多跳转链接">
      <a-input v-model="formData.more_link" placeholder="/pages/item-list/item-list" @change="emitUpdate" />
    </a-form-item>
  </a-form>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getItemList } from '@/api/item'
import { getCategoryList } from '@/api/category'
import { getItemTagsList } from '@/api/item_tags'
import MpIcon from '@/components/MpIcon.vue'

const { t } = useI18n()

const iconNames = [
  'flame', 'star', 'heart', 'zap', 'crown', 'trophy', 'gift', 'tag',
  'trending-up', 'package', 'layers', 'gem', 'briefcase', 'shopping-cart',
]

const props = defineProps({ props: { type: Object, default: () => ({}) } })
const emit = defineEmits(['update:props'])

const formData = reactive({
  source_type: 'manual', item_ids: [], category_id: '', tag_id: '',
  display_count: 6, sort_by: 'newest', display_style: 'two_small',
  show_sales: true, show_tags: false, show_cart: true,
  title: '', icon: '', tag_text: '', show_more: true, more_link: '', columns: 2,
  ...props.props
})

watch(() => props.props, (val) => { Object.assign(formData, val) }, { deep: true })

const emitUpdate = () => { emit('update:props', { ...formData, item_ids: [...formData.item_ids] }) }

const itemOptions = ref([])
const categoryOptions = ref([])
const tagOptions = ref([])
const itemLoading = ref(false)
const categoryLoading = ref(false)
const tagLoading = ref(false)

const pickList = (res) => {
  const d = res?.data
  const candidates = [
    d?.list,
    d?.data?.data,
    d?.data?.list,
    d?.data,
    d?.categories?.data,
    d
  ]
  const raw = candidates.find(c => Array.isArray(c)) || []
  return raw.filter(item => item && item.id != null)
}

const loadItems = async (keyword = '') => {
  itemLoading.value = true
  try {
    const res = await getItemList({ page: 1, page_size: 50, name: keyword })
    itemOptions.value = pickList(res)
  } catch (e) { /* ignore */ }
  finally { itemLoading.value = false }
}

let searchTimer = null
const handleItemSearch = (keyword) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadItems(keyword), 300)
}

const loadCategories = async () => {
  categoryLoading.value = true
  try {
    const res = await getCategoryList({ page: 1, page_size: 999 })
    categoryOptions.value = pickList(res)
  } catch (e) { /* ignore */ }
  finally { categoryLoading.value = false }
}

const loadTags = async () => {
  tagLoading.value = true
  try {
    const res = await getItemTagsList({ page: 1, page_size: 999 })
    tagOptions.value = pickList(res)
  } catch (e) { /* ignore */ }
  finally { tagLoading.value = false }
}

onMounted(() => {
  loadItems()
  loadCategories()
  loadTags()
})
</script>