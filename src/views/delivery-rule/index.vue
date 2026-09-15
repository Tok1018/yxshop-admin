<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('delivery_rule.title') }}</h1>
        <p class="page-subtitle">{{ t('delivery_rule.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openForm()">
          <icon-plus />
          {{ t('delivery_rule.btn_add') }}
        </button>
      </div>
    </div>
    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead><tr><th>{{ t('delivery_rule.th_name') }}</th><th>{{ t('delivery_rule.th_type') }}</th><th>{{ t('delivery_rule.th_sort') }}</th><th class="col-actions">{{ t('delivery_rule.th_actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in list" :key="record.id">
              <td>{{ record.name || '-' }}</td>
              <td><span class="badge-info">{{ record.type || '-' }}</span></td>
              <td class="mono">{{ record.sort || 0 }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openForm(record)">{{ t('common.edit') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="hasNoData"><td colspan="4" class="empty-row"><div class="empty-state"><span class="empty-text">{{ t('delivery_rule.empty_data') }}</span></div></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <a-drawer
      :visible="formVisible"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="form.id ? t('delivery_rule.drawer_edit') : t('delivery_rule.drawer_add')"
      @cancel="formVisible = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-section">
        <div class="form-group"><label>{{ t('delivery_rule.label_name') }} <span class="required">*</span></label><input v-model="form.name" class="form-input" /></div>
        <div class="form-group"><label>{{ t('delivery_rule.label_type') }}</label><select v-model="form.type" class="form-input"><option value="weight">{{ t('delivery_rule.type_weight') }}</option><option value="quantity">{{ t('delivery_rule.type_quantity') }}</option><option value="fixed">{{ t('delivery_rule.type_fixed') }}</option></select></div>
        <div class="form-group"><label>{{ t('delivery_rule.label_sort') }}</label><input v-model.number="form.sort" type="number" class="form-input" /></div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="formVisible = false">{{ t('delivery_rule.btn_cancel') }}</button>
        <button class="btn-primary" @click="handleSubmit">{{ form.id ? t('delivery_rule.btn_save') : t('delivery_rule.btn_create') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconPlus } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getDeliveryRuleList, createDeliveryRule, updateDeliveryRule, deleteDeliveryRule } from '@/api/delivery-rule'

const { t } = useI18n()
const list = ref([])
const loading = ref(false)
const hasNoData = computed(() => !list.value.length && !loading.value)
const formVisible = ref(false)
const drawerWidth = 'min(480px, 90vw)'
const form = reactive({ id: null, name: '', type: 'weight', sort: 0 })

const openForm = (record) => {
  Object.assign(form, { id: null, name: '', type: 'weight', sort: 0 }, record || {})
  formVisible.value = true
}

const handleSubmit = async () => {
  try {
    if (form.id) { await updateDeliveryRule(form.id, form); Message.success(t('delivery_rule.msg_update_success')) }
    else { await createDeliveryRule(form); Message.success(t('delivery_rule.msg_create_success')) }
    formVisible.value = false; loadData()
  } catch (error) { Message.error(t('delivery_rule.msg_operation_failed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('delivery_rule.confirm_delete_title'), content: t('delivery_rule.confirm_delete'), hideCancel: false,
    onOk: async () => {
      try { await deleteDeliveryRule(record.id); Message.success(t('delivery_rule.msg_delete_success')); loadData() }
      catch (error) { Message.error(t('delivery_rule.msg_delete_failed')) }
    }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDeliveryRuleList()
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
  } catch (error) { Message.error(t('delivery_rule.msg_operation_failed')) } finally { loading.value = false }
}

onMounted(() => loadData())
</script>


