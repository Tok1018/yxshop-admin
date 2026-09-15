<template>
  <div class="page-content">
    <div class="edit-header">
      <button class="btn-ghost" @click="goBack"><icon-left /> {{ t('deliveries.btn_back') }}</button>
      <h1 class="edit-title">{{ isNew ? t('deliveries.create_title') : t('deliveries.edit_title') }}</h1>
      <div class="header-spacer"></div>
      <button class="btn-primary" :disabled="saving" @click="handleSave">
        <icon-check v-if="!saving" />
        {{ saving ? '...' : t('deliveries.btn_save') }}
      </button>
    </div>

    <div class="edit-body">
      <div class="card-section">
        <h3 class="section-title">{{ t('deliveries.section_basic') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ t('deliveries.label_name') }} <span class="required">*</span></label>
            <input v-model="form.name" class="form-input" :placeholder="t('deliveries.label_name')" />
          </div>
          <div class="form-group">
            <label>{{ t('deliveries.label_method') }}</label>
            <select v-model="form.method" class="form-input">
              <option :value="10">{{ t('deliveries.method_quantity') }}</option>
              <option :value="20">{{ t('deliveries.method_weight') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ t('deliveries.label_sort') }}</label>
            <input v-model.number="form.sort" type="number" :min="0" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ t('deliveries.label_status') }}</label>
            <div class="switch-row">
              <sa-switch v-model="form.status" :checked-value="1" :unchecked-value="0" />
              <span class="switch-label">{{ form.status === 1 ? t('deliveries.status_enabled') : t('deliveries.status_disabled') }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-section">
        <div class="section-header">
          <h3 class="section-title">{{ t('deliveries.section_rules') }}</h3>
          <button class="btn-ghost" @click="addRule"><icon-plus /> {{ t('deliveries.add_rule') }}</button>
        </div>

        <div class="rules-list">
          <div v-for="(rule, idx) in rules" :key="idx" class="rule-card">
            <div class="rule-card-header">
              <span class="rule-label">{{ t('deliveries.rule_label_n', { n: idx + 1 }) }}</span>
              <button class="btn-danger btn-sm" @click="removeRule(idx)">{{ t('deliveries.remove_rule') || '删除' }}</button>
            </div>

            <div class="rule-card-body">
              <div class="form-group">
                <label>{{ t('deliveries.label_region') }} <span class="required">*</span></label>
                <div class="region-select-wrapper">
                  <a-tree-select
                    v-model="rule.regionIds"
                    :data="regionTreeData"
                    :placeholder="t('deliveries.region_placeholder')"
                    multiple
                    allow-clear
                    tree-checkable
                    :tree-check-strictly="false"
                    :disable-check="getDisabledRegionIds(idx)"
                    :field-names="{ key: 'id', title: 'name', children: 'children' }"
                    :max-tag-count="1"
                    class="region-tree-select"
                    style="width: 100%"
                  />
                  <div v-if="rule.regionIds && rule.regionIds.length > 0" class="region-summary">
                    {{ getRegionSummary(rule.regionIds) }}
                  </div>
                </div>
              </div>

              <div class="fee-row">
                <div class="fee-item">
                  <label>{{ form.method === 20 ? t('deliveries.label_first_weight') : t('deliveries.label_first') }} ({{ form.method === 20 ? t('deliveries.unit_kg') : t('deliveries.unit_piece') }})</label>
                  <input v-model.number="rule.first" type="number" :min="0.01" step="0.01" class="form-input" />
                </div>
                <div class="fee-item">
                  <label>{{ t('deliveries.label_first_fee') }} ({{ t('deliveries.unit_yuan') }})</label>
                  <input v-model.number="rule.first_fee" type="number" :min="0" step="0.01" class="form-input" />
                </div>
                <div class="fee-item">
                  <label>{{ form.method === 20 ? t('deliveries.label_additional_weight') : t('deliveries.label_additional') }} ({{ form.method === 20 ? t('deliveries.unit_kg') : t('deliveries.unit_piece') }})</label>
                  <input v-model.number="rule.additional" type="number" :min="0.01" step="0.01" class="form-input" />
                </div>
                <div class="fee-item">
                  <label>{{ t('deliveries.label_additional_fee') }} ({{ t('deliveries.unit_yuan') }})</label>
                  <input v-model.number="rule.additional_fee" type="number" :min="0" step="0.01" class="form-input" />
                </div>
              </div>

              <div class="free-shipping-row">
                <div class="form-group free-type-group">
                  <label>{{ t('deliveries.label_free_type') }}</label>
                  <select v-model="rule.delivery_type" class="form-input">
                    <option :value="0">{{ t('deliveries.free_type_none') }}</option>
                    <option :value="20">{{ t('deliveries.free_type_amount') }}</option>
                    <option :value="10">{{ t('deliveries.free_type_quantity') }}</option>
                    <option :value="30">{{ t('deliveries.free_type_both') }}</option>
                  </select>
                </div>
                <div v-if="rule.delivery_type === 20 || rule.delivery_type === 30" class="form-group free-value-group">
                  <label>{{ t('deliveries.label_min_price') }} ({{ t('deliveries.unit_yuan') }})</label>
                  <input v-model.number="rule.min_price" type="number" :min="0" step="0.01" class="form-input" />
                </div>
                <div v-if="rule.delivery_type === 10 || rule.delivery_type === 30" class="form-group free-value-group">
                  <label>{{ t('deliveries.label_min_num') }} ({{ t('deliveries.unit_piece') }})</label>
                  <input v-model.number="rule.min_num" type="number" :min="0" class="form-input" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="rules.length === 0" class="empty-rules">
            <span class="empty-text">{{ t('deliveries.empty_rules') }}</span>
            <button class="btn-ghost" @click="addRule"><icon-plus /> {{ t('deliveries.add_rule') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { IconLeft, IconPlus, IconDelete, IconCheck } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getDeliveriesDetail, createDeliveries, updateDeliveries } from '@/api/deliveries'
import { getRegionsTree } from '@/api/regions'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isNew = computed(() => !route.params.id || route.params.id === 'new')
const saving = ref(false)
const loading = ref(false)

const form = reactive({ id: null, name: '', method: 10, sort: 0, status: 1 })

const rules = ref([])

const regionTreeData = ref([])

const ALL_REGION_ID = '0'

const provinceCityMap = {}
const cityProvinceMap = {}
const provinceNameMap = {}
const cityNameMap = {}

const getRegionSummary = (ids) => {
  if (!ids || ids.length === 0) return ''
  if (ids.includes(ALL_REGION_ID)) return t('deliveries.region_all')
  const provinceIds = new Set()
  const partialProvinces = new Map()
  ids.forEach(id => {
    const pid = cityProvinceMap[id]
    if (pid) {
      if (!partialProvinces.has(pid)) partialProvinces.set(pid, new Set())
      partialProvinces.get(pid).add(id)
    } else if (provinceCityMap[id]) {
      provinceIds.add(id)
    }
  })
  partialProvinces.forEach((cityIds, pid) => {
    const allCities = provinceCityMap[pid]
    if (allCities && cityIds.size >= allCities.length) {
      provinceIds.add(pid)
    }
  })
  const names = []
  provinceIds.forEach(pid => names.push(provinceNameMap[pid] || pid))
  partialProvinces.forEach((cityIds, pid) => {
    if (!provinceIds.has(pid)) {
      cityIds.forEach(cid => names.push(cityNameMap[cid] || cid))
    }
  })
  return names.join('、')
}

const collapseRegionIds = (ids) => {
  if (!ids || ids.length === 0) return []
  if (ids.includes(ALL_REGION_ID)) return [ALL_REGION_ID]
  const result = new Set()
  const provinceAllCities = new Set()
  ids.forEach(id => {
    const pid = cityProvinceMap[id]
    if (pid) {
      if (!provinceAllCities.has(pid)) {
        const allCities = provinceCityMap[pid] || []
        const selectedCities = ids.filter(i => cityProvinceMap[i] === pid)
        if (selectedCities.length >= allCities.length) {
          provinceAllCities.add(pid)
          result.add(pid)
        } else {
          result.add(id)
        }
      }
    } else {
      result.add(id)
    }
  })
  return [...result]
}

const getDisabledRegionIds = (currentIdx) => {
  const ids = []
  rules.value.forEach((r, idx) => {
    if (idx !== currentIdx && r.regionIds && r.regionIds.length > 0) {
      ids.push(...r.regionIds)
    }
  })
  return ids
}

const addRule = () => {
  rules.value.push({
    id: null,
    regionIds: [],
    first: 1,
    first_fee: 0,
    additional: 1,
    additional_fee: 0,
    min_price: 0,
    min_num: 0,
    delivery_type: 0
  })
}

const removeRule = (idx) => {
  rules.value.splice(idx, 1)
}

const goBack = () => router.push('/logistics/deliveries')

const validate = () => {
  if (!form.name.trim()) { Message.warning(t('deliveries.msg_name_required')); return false }
  if (rules.value.length === 0) { Message.warning(t('deliveries.msg_no_rules')); return false }
  for (let i = 0; i < rules.value.length; i++) {
    const rule = rules.value[i]
    if (!rule.regionIds || rule.regionIds.length === 0) {
      Message.warning(t('deliveries.msg_region_required_n', { n: i + 1 })); return false
    }
    if (!rule.first || rule.first <= 0) { Message.warning(t('deliveries.msg_first_must_gt_0')); return false }
    if (!rule.additional || rule.additional <= 0) { Message.warning(t('deliveries.msg_additional_must_gt_0')); return false }
    if (rule.first_fee < 0 || rule.additional_fee < 0) { Message.warning(t('deliveries.msg_fee_no_negative')); return false }
  }
  return true
}

const buildRulesPayload = () => {
  return rules.value.map(r => {
    const regionIds = collapseRegionIds(r.regionIds)
    return {
      id: r.id || undefined,
      region: JSON.stringify(regionIds),
      first: r.first,
      first_fee: r.first_fee,
      additional: r.additional,
      additional_fee: r.additional_fee,
      min_price: r.delivery_type === 0 ? 0 : r.min_price,
      min_num: r.delivery_type === 0 ? 0 : r.min_num,
      delivery_type: r.delivery_type === 0 ? 10 : r.delivery_type
    }
  })
}

const handleSave = async () => {
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...form, rules: buildRulesPayload() }
    delete payload.id
    if (isNew.value) {
      await createDeliveries(payload)
      Message.success(t('deliveries.msg_create_success'))
    } else {
      await updateDeliveries(route.params.id, payload)
      Message.success(t('deliveries.msg_update_success'))
    }
    goBack()
  } catch (error) {
    Message.error(error.response?.data?.message || t('deliveries.msg_operation_failed'))
  } finally {
    saving.value = false
  }
}

const REGIONS_CACHE_KEY = 'shipping_regions_tree'
const REGIONS_CACHE_TTL = 86400000

const loadRegions = async () => {
  try {
    const cached = localStorage.getItem(REGIONS_CACHE_KEY)
    if (cached) {
      const { data, ts } = JSON.parse(cached)
      if (data && Date.now() - ts < REGIONS_CACHE_TTL) {
        buildRegionTree(data)
        return
      }
    }
    const res = await getRegionsTree()
    const tree = res.data || []
    localStorage.setItem(REGIONS_CACHE_KEY, JSON.stringify({ data: tree, ts: Date.now() }))
    buildRegionTree(tree)
  } catch (e) {
    console.error('Failed to load regions', e)
  }
}

const buildRegionTree = (tree) => {
  const children = tree.map(province => {
    const pid = String(province.id)
    provinceNameMap[pid] = province.name
    const cityChildren = (province.children || []).map(city => {
      const cid = String(city.id)
      cityNameMap[cid] = city.name
      cityProvinceMap[cid] = pid
      return { id: cid, name: city.name }
    })
    provinceCityMap[pid] = cityChildren.map(c => c.id)
    return { id: pid, name: province.name, children: cityChildren }
  })
  regionTreeData.value = [
    { id: ALL_REGION_ID, name: t('deliveries.region_all'), children }
  ]
}

const loadDetail = async () => {
  if (isNew.value) {
    rules.value = []
    return
  }
  loading.value = true
  try {
    const res = await getDeliveriesDetail(route.params.id)
    const data = res.data
    Object.assign(form, {
      id: data.id,
      name: data.name,
      method: data.method,
      sort: data.sort,
      status: data.status
    })
    rules.value = (data.rules || []).map(r => {
      let regionIds = []
      if (r.region && r.region !== '' && r.region !== '0' && r.region !== '[]') {
        try { regionIds = JSON.parse(r.region) } catch (e) { regionIds = [] }
        regionIds = regionIds.map(String)
      } else if (r.region === '0' || r.region === '["0"]') {
        regionIds = [ALL_REGION_ID]
      }
      return {
        id: r.id,
        regionIds,
        first: r.first,
        first_fee: Number(r.first_fee),
        additional: r.additional,
        additional_fee: Number(r.additional_fee),
        min_price: Number(r.min_price),
        min_num: r.min_num,
        delivery_type: r.min_price > 0 || r.min_num > 0 ? r.delivery_type : 0
      }
    })
  } catch (error) {
    Message.error(t('deliveries.msg_operation_failed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRegions()
  loadDetail()
})
</script>

<style scoped>
.page-content { min-height: 100vh; padding: 0; }

.edit-header { display: flex; align-items: center; gap: 16px; padding: 16px 24px; background: var(--color-surface-container-lowest); border-bottom: 1px solid var(--color-outline-variant); position: sticky; top: 0; z-index: 10; }
.edit-title { font-size: 18px; font-weight: 600; color: var(--color-on-surface); margin: 0; }
.header-spacer { flex: 1; }

.edit-body { padding: 24px; max-width: 960px; margin: 0 auto; }

.card-section { background: var(--color-surface-container-lowest); border-radius: var(--radius-xl); padding: 24px; margin-bottom: 20px; }
.section-title { font-size: 15px; font-weight: 600; color: var(--color-on-surface); margin: 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }

.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { margin-bottom: 0; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--color-on-surface-variant); margin-bottom: 6px; }
.form-input { box-sizing: border-box; }

.form-hint { font-size: 12px; color: var(--color-tertiary); margin: 4px 0 0; }

.switch-row { display: flex; align-items: center; gap: 10px; }
.switch-label { font-size: 13px; color: var(--color-on-surface-variant); }

.rules-list { display: flex; flex-direction: column; gap: 12px; }

.rule-card { border: 1px solid var(--color-outline-variant); border-radius: var(--radius-lg); overflow: hidden; }
.rule-card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--color-surface-container-low); border-bottom: 1px solid var(--color-outline-variant); }
.rule-label { font-size: 13px; font-weight: 500; color: var(--color-on-surface); }
.rule-card-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

.fee-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
.fee-item label { display: block; font-size: 12px; color: var(--color-on-surface-variant); margin-bottom: 4px; }

.free-shipping-row { display: flex; gap: 12px; align-items: flex-start; }
.free-type-group { min-width: 160px; }
.free-value-group { flex: 1; }

.empty-rules { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; }
.empty-text { font-size: 13px; color: var(--color-on-surface-variant); }

.region-select-wrapper { position: relative; }
.region-summary { margin-top: 6px; font-size: 13px; color: var(--color-primary); line-height: 1.5; word-break: break-all; }


@media (max-width: var(--breakpoint-md)) {
  .form-grid { grid-template-columns: 1fr; }
  .fee-row { grid-template-columns: 1fr 1fr; }
  .free-shipping-row { flex-direction: column; }
}
</style>

<style>
.region-tree-select .arco-tag { display: none !important; }
.region-tree-select .arco-tree-select-view-value { display: none !important; }
.region-tree-select .arco-tree-select-view-inner { flex-wrap: nowrap; overflow: hidden; min-height: 32px; }
.region-tree-select .arco-tree-select-suffix { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); }
</style>
