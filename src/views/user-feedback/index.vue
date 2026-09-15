<template>
  <div class="page-content">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('user_feedback.title') }}</h1>
        <p class="page-subtitle">{{ t('user_feedback.subtitle') }}</p>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('user_feedback.search_placeholder')" :aria-label="t('user_feedback.search_placeholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.feedback_type" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('user_feedback.filter_all_type') }}</option>
        <option value="1">{{ t('user_feedback.type_suggestion') }}</option>
        <option value="2">{{ t('user_feedback.type_bug') }}</option>
        <option value="3">{{ t('user_feedback.type_complaint') }}</option>
        <option value="4">{{ t('user_feedback.type_other') }}</option>
      </select>
      <select v-model="filters.status" class="filter-select" @change="page = 1; loadData()">
        <option value="">{{ t('user_feedback.filter_all_status') }}</option>
        <option value="0">{{ t('user_feedback.status_pending') }}</option>
        <option value="1">{{ t('user_feedback.status_replied') }}</option>
        <option value="2">{{ t('user_feedback.status_closed') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <colgroup>
            <col style="width:40px" />
            <col style="width:60px" />
            <col style="width:100px" />
            <col style="width:90px" />
            <col />
            <col style="width:120px" />
            <col style="width:90px" />
            <col style="width:140px" />
            <col style="width:160px" />
          </colgroup>
          <thead>
            <tr>
              <th class="col-check"><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
              <th>ID</th>
              <th>{{ t('user_feedback.th_user') }}</th>
              <th>{{ t('user_feedback.th_type') }}</th>
              <th>{{ t('user_feedback.th_content') }}</th>
              <th>{{ t('user_feedback.th_contact') }}</th>
              <th>{{ t('user_feedback.th_status') }}</th>
              <th>{{ t('user_feedback.th_time') }}</th>
              <th class="col-actions">{{ t('user_feedback.th_actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in list" :key="record.id" :class="{ selected: selectedIds.includes(record.id) }">
              <td class="col-check" @click.stop><input type="checkbox" :checked="selectedIds.includes(record.id)" @change="toggleSelect(record.id)" /></td>
              <td class="mono">{{ record.id }}</td>
              <td><router-link v-if="record.user" :to="'/users/list?id=' + record.user_id" class="link-primary">{{ record.user.nickname || record.user.username || record.user_id }}</router-link><span v-else class="mono">{{ record.user_id }}</span></td>
              <td><span class="badge-info">{{ feedbackTypeText(record.feedback_type) }}</span></td>
              <td class="content-cell" :title="record.content">{{ record.content }}</td>
              <td class="muted">{{ record.contact || '-' }}</td>
              <td><span :class="statusBadgeClass(record.status)">{{ statusText(record.status) }}</span></td>
              <td class="mono muted">{{ formatTime(record.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="viewDetail(record)">{{ t('common.detail') }}</button>
                <button v-if="record.status === 0 || record.status === 1" class="btn-primary btn-sm" @click="openReplyDrawer(record)">{{ t('user_feedback.btn_reply') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(record.id)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showListEmpty"><td colspan="9" class="empty-state"><icon-empty class="empty-icon" /><span class="empty-text">{{ t('user_feedback.empty_data') }}</span></td></tr>
          </tbody>
        </table>
      </div>
      <div class="table-loading" v-if="loading"><div class="spinner"></div></div>
    </div>

    <a-pagination
      v-if="total > 0"
      :current="page"
      :total="total"
      :page-size="pageSize"
      @change="onPageChange"
      class="arco-pagination-md3"
      show-total
      :total-text="t('user_feedback.total_count', { n: total })"
    />

    <div class="batch-bar" v-if="selectedIds.length > 0">
      <span>{{ t('user_feedback.selected_count', { n: selectedIds.length }) }}</span>
      <button class="btn-danger btn-sm" @click="batchDelete">{{ t('user_feedback.btn_batch_delete') }}</button>
      <button class="btn-ghost btn-sm" @click="selectedIds = []; selectAll = false">{{ t('user_feedback.btn_cancel_select') }}</button>
    </div>

    <a-drawer
      :visible="showDetailDrawer"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="t('user_feedback.detail_title')"
      @cancel="showDetailDrawer = false"
      :footer="false"
      unmount-on-close
    >
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">{{ t('user_feedback.detail_user_id') }}</span>
          <span class="detail-value"><router-link v-if="detailData.user" :to="'/users/list?id=' + detailData.user_id" class="link-primary">{{ detailData.user.nickname || detailData.user.username || detailData.user_id }}</router-link><span v-else class="mono">{{ detailData.user_id }}</span></span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t('user_feedback.detail_type') }}</span>
          <span class="detail-value"><span class="badge-info">{{ feedbackTypeText(detailData.feedback_type) }}</span></span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t('user_feedback.detail_contact') }}</span>
          <span class="detail-value">{{ detailData.contact || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t('user_feedback.detail_status') }}</span>
          <span class="detail-value"><span :class="statusBadgeClass(detailData.status)">{{ statusText(detailData.status) }}</span></span>
        </div>
        <div class="detail-item">
          <span class="detail-label">{{ t('user_feedback.detail_time') }}</span>
          <span class="detail-value mono">{{ formatTime(detailData.created_at) || '-' }}</span>
        </div>
        <div class="detail-item" v-if="detailData.images">
          <span class="detail-label">{{ t('user_feedback.detail_screenshots') }}</span>
          <span class="detail-value">{{ detailData.images }}</span>
        </div>
      </div>
      <div class="detail-section">
        <h4>{{ t('user_feedback.detail_content') }}</h4>
        <div class="content-box">{{ detailData.content || '-' }}</div>
      </div>
      <div class="detail-section" v-if="detailData.reply_content">
        <h4>{{ t('user_feedback.detail_reply') }}</h4>
        <div class="content-box reply">{{ detailData.reply_content }}</div>
        <div class="reply-info" v-if="detailData.replier">{{ t('user_feedback.detail_replier', { name: detailData.replier?.username || '-', time: detailData.reply_at || '' }) }}</div>
      </div>
    </a-drawer>

    <a-drawer
      :visible="showReplyDrawer"
      :width="drawerWidth"
      class="arco-drawer-md3"
      :title="t('user_feedback.reply_title')"
      @cancel="showReplyDrawer = false"
      :footer="true"
      unmount-on-close
    >
      <div class="form-group">
        <label>{{ t('user_feedback.reply_label_content') }}</label>
        <div class="content-preview">{{ replyRecord?.content }}</div>
      </div>
      <div class="form-group">
        <label>{{ t('user_feedback.reply_label_reply') }} <span class="required">*</span></label>
        <textarea v-model="replyForm.reply_content" class="form-textarea" :placeholder="t('user_feedback.reply_placeholder')" rows="4"></textarea>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="showReplyDrawer = false">{{ t('user_feedback.btn_cancel') }}</button>
        <button class="btn-primary" @click="submitReply" :disabled="submitting">
          {{ submitting ? t('user_feedback.btn_submitting') : t('user_feedback.btn_submit') }}
        </button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getUserFeedbackList, getUserFeedbackDetail, replyUserFeedback, deleteUserFeedback, batchDeleteUserFeedback } from '@/api/user-feedback'

const { t } = useI18n()

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts) ? new Date(Number(ts) * 1000) : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const selectedIds = ref([])
const selectAll = ref(false)
const showDetailDrawer = ref(false)
const showReplyDrawer = ref(false)
const detailData = ref({})
const replyRecord = ref(null)
const submitting = ref(false)
const drawerWidth = 'min(480px, 90vw)'

const filters = ref({ keyword: '', feedback_type: '', status: '' })

const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)

const showListEmpty = computed(() => !list.value.length && !loading.value)

let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { page.value = 1; loadData() }, 400) }

const onPageChange = (newPage) => {
  page.value = newPage
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getUserFeedbackList(params)
    list.value = res.data?.list || res.data?.data || (Array.isArray(res.data) ? res.data : [])
    total.value = res.data?.total || 0
  } catch (e) { Message.error(t('user_feedback.msg_load_failed')) }
  finally { loading.value = false }
}

const toggleSelectAll = () => { selectedIds.value = selectAll.value ? list.value.map(i => i.id) : [] }
const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const feedbackTypeText = (v) => ({ 1: t('user_feedback.type_suggestion'), 2: t('user_feedback.type_bug'), 3: t('user_feedback.type_complaint'), 4: t('user_feedback.type_other') }[v] ?? t('user_feedback.type_unknown'))
const statusText = (s) => ({ 0: t('user_feedback.status_pending'), 1: t('user_feedback.status_replied'), 2: t('user_feedback.status_closed') }[s] ?? t('user_feedback.status_unknown'))
const statusBadgeClass = (s) => ({ 0: 'badge-warning', 1: 'badge-success', 2: 'badge-info' }[s] ?? 'badge-info')

const viewDetail = async (record) => {
  try {
    const res = await getUserFeedbackDetail(record.id)
    detailData.value = res.data || {}
    showDetailDrawer.value = true
  } catch (error) { Message.error(t('user_feedback.msg_detail_failed')) }
}

const replyForm = ref({ reply_content: '' })

const openReplyDrawer = (record) => {
  replyRecord.value = record
  replyForm.value = { reply_content: '' }
  showReplyDrawer.value = true
}

const submitReply = async () => {
  if (!replyForm.value.reply_content) { Message.warning(t('user_feedback.msg_enter_reply')); return }
  submitting.value = true
  try {
    await replyUserFeedback(replyRecord.value.id, replyForm.value)
    Message.success(t('user_feedback.msg_reply_success'))
    showReplyDrawer.value = false
    loadData()
  } catch (error) { Message.error(t('user_feedback.msg_reply_failed')) }
  finally { submitting.value = false }
}

const handleDelete = (id) => {
  Modal.warning({ title: t('user_feedback.confirm_delete_title'), content: t('user_feedback.confirm_delete_msg'), hideCancel: false, onOk: async () => { try { await deleteUserFeedback(id); Message.success(t('user_feedback.msg_delete_success')); loadData() } catch (error) { Message.error(t('user_feedback.msg_delete_failed')) } } })
}

const batchDelete = () => {
  Modal.warning({ title: t('user_feedback.confirm_batch_delete_title'), content: t('user_feedback.confirm_batch_delete_msg', { n: selectedIds.value.length }), hideCancel: false, onOk: async () => { try { await batchDeleteUserFeedback(selectedIds.value); Message.success(t('user_feedback.msg_batch_delete_success')); selectedIds.value = []; selectAll.value = false; loadData() } catch (error) { Message.error(t('user_feedback.msg_batch_delete_failed')) } } })
}

onMounted(() => { loadData() })
</script>

<style scoped>
.content-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-primary {
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
}
.link-primary:hover {
  text-decoration: underline;
}



.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: var(--color-on-surface-variant);
}

.detail-value {
  font-size: 13px;
  color: var(--color-on-surface);
}

.detail-section {
  margin-top: 16px;
}

.detail-section h4 {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  margin: 0 0 8px;
}

.content-box {
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 13px;
  color: var(--color-on-surface);
  line-height: 1.6;
  white-space: pre-wrap;
}

.content-box.reply {
  background: rgba(var(--color-primary-rgb), 0.08);
}

.reply-info {
  font-size: 12px;
  color: var(--color-on-surface-variant);
  margin-top: 8px;
}

.content-preview {
  background: var(--color-surface-container-low);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 13px;
  color: var(--color-on-surface-variant);
  line-height: 1.6;
  max-height: 100px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-on-surface-variant);
  margin-bottom: 6px;
}

.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-md);
  background: var(--color-surface-container-lowest);
  color: var(--color-on-surface);
  font-size: 14px;
  outline: none;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;
}
</style>
