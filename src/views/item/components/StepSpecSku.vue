<template>
  <div class="step-spec-sku">
    <div class="form-card">
      <h3 class="card-title">{{ t('item.edit.specManagement') }}</h3>

      <!-- 已选规格区块 -->
      <div v-for="(spec, si) in formData.specs" :key="si" class="spec-block">
        <div class="spec-header">
          <span class="spec-name">{{ spec.name }}</span>
          <a-button type="text" status="danger" size="small" @click="removeSpec(si)">
            <template #icon><icon-delete /></template>
            {{ t('item.edit.deleteSpec') }}
          </a-button>
        </div>
        <div class="spec-values">
          <a-tag
            v-for="(val, vi) in spec.values"
            :key="vi"
            closable
            @close="removeSpecValue(si, vi)"
          >{{ val }}</a-tag>
          <!-- 可选规格值快捷添加 -->
          <a-select
            v-if="getAvailablePresetValues(si).length"
            size="small"
            :style="{ width: '140px' }"
            :placeholder="t('item.edit.addSpecValue')"
            allow-clear
            @change="(val) => addPresetValue(si, val)"
          >
            <a-option v-for="pv in getAvailablePresetValues(si)" :key="pv" :value="pv">{{ pv }}</a-option>
          </a-select>
          <!-- 自定义输入 -->
          <a-input
            size="small"
            :style="{ width: '120px' }"
            :placeholder="t('item.edit.addSpecValue')"
            allow-clear
            @keydown.enter="addSpecValue(si, $event)"
          />
        </div>
      </div>

      <!-- 添加规格按钮 -->
      <div class="spec-add-area">
        <!-- 从字典中选择 -->
        <a-select
          v-if="availableSpecs.length"
          :style="{ width: '200px' }"
          :placeholder="t('item.edit.selectSpecFromDict')"
          allow-clear
          @change="onSelectSpecFromDict"
        >
          <a-option v-for="s in availableSpecs" :key="s.id" :value="s.id">{{ s.name }}</a-option>
        </a-select>
        <!-- 手动添加 -->
        <a-button type="dashed" @click="showAddSpecModal = true">
          <template #icon><icon-plus /></template>
          {{ t('item.edit.addSpec') }}
        </a-button>
      </div>
    </div>

    <div class="form-card">
      <div class="sku-header">
        <h3 class="card-title" style="margin-bottom:0;border-bottom:none;padding-bottom:0">{{ t('item.edit.skuList') }}</h3>
        <div class="sku-actions">
          <a-button size="small" @click="showBatchPrice = true">{{ t('item.edit.batchSetPrice') }}</a-button>
          <a-button size="small" @click="showBatchStock = true">{{ t('item.edit.batchSetStock') }}</a-button>
        </div>
      </div>

      <div v-if="formData.skus.length === 0" class="sku-empty">
        {{ t('item.edit.skuEmptyTip') }}
      </div>

      <a-table
        v-else
        :data="formData.skus"
        :pagination="false"
        size="small"
        :bordered="true"
      >
        <template #columns>
          <a-table-column :title="t('item.edit.specCombo')" data-index="spec_label" :width="160" />
          <a-table-column :title="t('item.edit.skuCode')" :width="120">
            <template #cell="{ record }">
              <a-input v-model="record.sku_code" size="small" :placeholder="t('item.edit.skuCode')" />
            </template>
          </a-table-column>
          <a-table-column :title="t('item.edit.originalPrice')" :width="120">
            <template #cell="{ record }">
              <a-input-number v-model="record.price" size="small" :min="0" :precision="2" :step="1" placeholder="0.00" style="width:100%">
                <template #prefix>¥</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column :title="t('item.edit.costPrice')" :width="120">
            <template #cell="{ record }">
              <a-input-number v-model="record.cost_price" size="small" :min="0" :precision="2" :step="1" placeholder="0.00" style="width:100%">
                <template #prefix>¥</template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column :title="t('item.edit.totalStock')" :width="100">
            <template #cell="{ record }">
              <a-input-number v-model="record.stock" size="small" :min="0" :step="1" placeholder="0" style="width:100%" />
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>


    <a-modal v-model:visible="showAddSpecModal" :title="t('item.edit.addSpec')" @ok="confirmAddSpec" :mask-closable="false">
      <a-form :model="{}" layout="vertical">
        <a-form-item :label="t('item.edit.specName')">
          <a-input v-model="newSpecName" :placeholder="t('item.edit.specNamePlaceholder')" />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showBatchPrice" :title="t('item.edit.batchSetPrice')" @ok="confirmBatchPrice" :mask-closable="false">
      <a-form :model="{}" layout="vertical">
        <a-form-item :label="t('item.edit.uniformPrice')">
          <a-input-number v-model="batchPrice" :min="0" :precision="2" :step="1" placeholder="0.00" style="width:100%">
            <template #prefix>¥</template>
          </a-input-number>
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showBatchStock" :title="t('item.edit.batchSetStock')" @ok="confirmBatchStock" :mask-closable="false">
      <a-form :model="{}" layout="vertical">
        <a-form-item :label="t('item.edit.uniformStock')">
          <a-input-number v-model="batchStock" :min="0" :step="1" placeholder="0" style="width:100%" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
import { IconDelete, IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getEnabledSpecs } from '@/api/specs'

const { t } = useI18n()

const props = defineProps({
  formData: { type: Object, required: true },
})

const showAddSpecModal = ref(false)
const newSpecName = ref('')
const showBatchPrice = ref(false)
const batchPrice = ref(0)
const showBatchStock = ref(false)
const batchStock = ref(0)

// 规格字典（从后端加载）
const specDict = ref([])

let specIdCounter = 0
let skuIdCounter = 0

// 已选规格名集合
const usedSpecNames = computed(() => new Set(props.formData.specs.map(s => s.name)))

// 可选的规格列表（已选的不再出现）
const availableSpecs = computed(() => specDict.value.filter(s => !usedSpecNames.value.has(s.name)))

onMounted(() => {
  loadSpecDict()
})

const loadSpecDict = async () => {
  try {
    const res = await getEnabledSpecs()
    specDict.value = res.data?.list || res.data || []
  } catch (e) {
    specDict.value = []
  }
}

/**
 * 从字典中选择规格 — 自动带入预设值
 */
const onSelectSpecFromDict = (specId) => {
  if (!specId) return
  const spec = specDict.value.find(s => s.id === specId)
  if (!spec) return
  if (props.formData.specs.some(s => s.name === spec.name)) {
    Message.warning(t('item.spec_name_exists'))
    return
  }
  const presetValues = (spec.values || []).map(v => v.name)
  props.formData.specs.push({
    id: `spec_${++specIdCounter}`,
    name: spec.name,
    values: [...presetValues]
  })
  generateSkus()
}

const confirmAddSpec = () => {
  const name = newSpecName.value.trim()
  if (!name) { Message.warning(t('item.spec_name_required')); return }
  if (props.formData.specs.some(s => s.name === name)) { Message.warning(t('item.spec_name_exists')); return }
  props.formData.specs.push({ id: `spec_${++specIdCounter}`, name, values: [] })
  newSpecName.value = ''
  showAddSpecModal.value = false
}

const removeSpec = (idx) => {
  props.formData.specs.splice(idx, 1)
  generateSkus()
}

const addSpecValue = (specIdx, e) => {
  const val = e.target.value?.trim()
  if (!val) return
  const spec = props.formData.specs[specIdx]
  if (spec.values.includes(val)) { Message.warning(t('item.spec_value_exists')); return }
  spec.values.push(val)
  e.target.value = ''
  generateSkus()
}

const addPresetValue = (specIdx, val) => {
  if (!val) return
  const spec = props.formData.specs[specIdx]
  if (spec.values.includes(val)) { Message.warning(t('item.spec_value_exists')); return }
  spec.values.push(val)
  generateSkus()
}

/**
 * 获取某个规格尚未选中的预设值
 */
const getAvailablePresetValues = (specIdx) => {
  const spec = props.formData.specs[specIdx]
  if (!spec) return []
  // 找到字典中对应规格的预设值
  const dictSpec = specDict.value.find(s => s.name === spec.name)
  if (!dictSpec || !dictSpec.values) return []
  return dictSpec.values
    .map(v => v.name)
    .filter(name => !spec.values.includes(name))
}

const removeSpecValue = (specIdx, valIdx) => {
  props.formData.specs[specIdx].values.splice(valIdx, 1)
  generateSkus()
}

const generateSkus = () => {
  const specs = props.formData.specs.filter(s => s.values.length > 0)
  const oldSkuMap = {}
  const skuKey = (sv) => {
    const obj = sv || {}
    return Object.keys(obj).length === 0 ? '{}' : JSON.stringify(obj)
  }
  props.formData.skus.forEach(s => {
    oldSkuMap[skuKey(s.spec_values)] = s
  })

  if (specs.length === 0) {
    if (props.formData.skus.length === 0) {
      props.formData.skus = [{
        id: `sku_${++skuIdCounter}`,
        spec_values: {},
        spec_label: t('item.edit.defaultSpec'),
        sku_code: 'SKU-001',
        price: props.formData.price || 0,
        stock: props.formData.stock || 0,
        image: ''
      }]
    }
    return
  }

  const valueLists = specs.map(s => s.values)
  const combos = cartesian(valueLists)

  if (combos.length > 100) {
    Message.warning(t('item.sku_count_warning', { n: combos.length }))
  }

  const skus = combos.map((combo, idx) => {
    const specValues = {}
    specs.forEach((spec, i) => {
      specValues[spec.name] = combo[i]
    })
    const key = skuKey(specValues)
    const old = oldSkuMap[key]
    return {
      id: `sku_${++skuIdCounter}`,
      spec_values: specValues,
      spec_label: Object.values(specValues).join(' / '),
      sku_code: old?.sku_code || `SKU-${String(idx + 1).padStart(3, '0')}`,
      price: old?.price ?? props.formData.price ?? 0,
      stock: old?.stock ?? props.formData.stock ?? 0,
      image: old?.image || ''
    }
  })

  props.formData.skus = skus
}

const cartesian = (arrays) => {
  return arrays.reduce((acc, arr) => {
    const result = []
    acc.forEach(combo => {
      arr.forEach(val => {
        result.push([...combo, val])
      })
    })
    return result
  }, [[]])
}

const confirmBatchPrice = () => {
  props.formData.skus.forEach(s => { s.price = batchPrice.value })
  showBatchPrice.value = false
  Message.success(t('item.batch_price_set'))
}

const confirmBatchStock = () => {
  props.formData.skus.forEach(s => { s.stock = batchStock.value })
  showBatchStock.value = false
  Message.success(t('item.batch_stock_set'))
}

watch(() => props.formData.specs, () => {
  generateSkus()
}, { deep: true })

const validate = () => {
  for (const spec of props.formData.specs) {
    if (!spec.name.trim()) {
      Message.warning(t('item.spec_name_empty'))
      return false
    }
  }
  const names = props.formData.specs.map(s => s.name)
  if (new Set(names).size !== names.length) {
    Message.warning(t('item.spec_name_duplicate'))
    return false
  }
  for (const sku of props.formData.skus) {
    if (sku.price === undefined || sku.price === null || sku.price < 0) {
      Message.warning(t('item.sku_price_invalid'))
      return false
    }
    if (sku.stock === undefined || sku.stock === null || sku.stock < 0) {
      Message.warning(t('item.sku_stock_invalid'))
      return false
    }
  }
  return true
}

defineExpose({ validate })
</script>

<style scoped>
.step-spec-sku {
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

.spec-block {
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 12px;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.spec-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-surface);
}

.spec-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.spec-add-area {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sku-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-outline-variant);
}

.sku-actions {
  display: flex;
  gap: 8px;
}

.sku-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-on-surface-variant);
  font-size: 13px;
}
</style>
