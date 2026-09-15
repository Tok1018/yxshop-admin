<template>
  <div class="page-content">
    <div class="page-header">
      <div class="header-left">
        <h1>{{ t('comment.title') }}</h1>
        <p>{{ t('comment.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="handleExport">{{ t('comment.export') }}</button>
      </div>
    </div>

    <div class="filter-bar">
      <div class="search-box">
        <icon-search />
        <input v-model="filters.keyword" :placeholder="t('comment.searchPlaceholder')" :aria-label="t('comment.searchPlaceholder')" @input="debouncedSearch" />
      </div>
      <select v-model="filters.rating" class="filter-select" @change="loadData">
        <option value="">{{ t('comment.allRating') }}</option>
        <option value="10">{{ t('comment.good') }}</option>
        <option value="20">{{ t('comment.medium') }}</option>
        <option value="30">{{ t('comment.bad') }}</option>
      </select>
      <select v-model="filters.status" class="filter-select" @change="loadData">
        <option value="">{{ t('comment.allStatus') }}</option>
        <option :value="String(COMMENT_STATUS.PENDING)">{{ t('comment.pending') }}</option>
        <option :value="String(COMMENT_STATUS.APPROVED)">{{ t('comment.approved') }}</option>
        <option :value="String(COMMENT_STATUS.REJECTED)">{{ t('comment.rejected') }}</option>
      </select>
    </div>

    <div class="table-card card-shadow">
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('comment.content') }}</th>
              <th>{{ t('comment.rating') }}</th>
              <th>{{ t('comment.status') }}</th>
              <th>{{ t('comment.time') }}</th>
              <th class="col-actions">{{ t('comment.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in list" :key="item.id">
              <td>
                <div class="comment-cell">
                  <span class="comment-text">{{ item.content || '-' }}</span>
                  <span class="comment-meta muted">{{ t('comment.product') }}: {{ item.item_id }} · {{ t('comment.user') }}: {{ item.user_id }}<template v-if="item.reply_content"> · {{ t('comment.reply') }}: {{ item.reply_content }}</template></span>
                </div>
              </td>
              <td>
                <span :class="['badge', item.score >= 4 ? 'badge-success' : item.score >= 3 ? 'badge-warning' : 'badge-error']">
                  {{ item.score }}{{ t('comment.scoreUnit') }}
                </span>
              </td>
              <td>
                <span :class="['badge', item.status === COMMENT_STATUS.PENDING ? 'badge-warning' : item.status === COMMENT_STATUS.APPROVED ? 'badge-success' : 'badge-error']">
                  {{ statusText(item.status) }}
                </span>
              </td>
              <td class="mono muted">{{ formatTime(item.created_at) }}</td>
              <td class="actions-cell" @click.stop>
                <button class="btn-ghost btn-sm" @click="openReply(item)">{{ t('comment.reply') }}</button>
                <button class="btn-ghost btn-sm" @click="toggleStatus(item)">{{ item.status === COMMENT_STATUS.APPROVED ? t('common.reject') : t('common.approve') }}</button>
                <button class="btn-danger btn-sm" @click="handleDelete(item)">{{ t('common.delete') }}</button>
              </td>
            </tr>
            <tr v-if="showEmpty">
              <td colspan="5" class="empty-row">
                <div class="empty-state">
                  <span class="empty-text">{{ t('comment.noData') }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination-bar" v-if="total > 0">
      <span class="total-text">{{ t('comment.total', { n: total }) }}</span>
      <a-pagination class="arco-pagination-md3" :current="page" :total="total" :page-size="pageSize" @change="onPageChange" />
    </div>

    <a-drawer :visible="replyVisible" @cancel="replyVisible = false" class="arco-drawer-md3" :width="'min(480px, 90vw)'" unmountOnClose :title="t('comment.reply')">
      <div class="form-section">
        <h4>{{ t('comment.content') }}</h4>
        <p class="reply-content">{{ currentComment?.content }}</p>
      </div>
      <div class="form-section">
        <h4>{{ t('comment.reply') }}</h4>
        <div class="form-group">
          <label>{{ t('comment.reply') }}</label>
          <textarea v-model="replyForm.reply_content" :placeholder="t('comment.replyPlaceholder')" :aria-label="t('comment.replyPlaceholder')" class="form-textarea" rows="4"></textarea>
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost" @click="replyVisible = false">{{ t('comment.cancel') }}</button>
        <button class="btn-primary" @click="submitReply">{{ t('comment.submitReply') }}</button>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { IconSearch, IconEmpty } from '@arco-design/web-vue/es/icon'
import { useI18n } from 'vue-i18n'
import { getCommentList, replyComment, updateCommentStatus, deleteComment, exportComments } from '@/api/comment'
import { COMMENT_STATUS, COMMENT_STATUS_TEXT } from '@/config/constants'

const { t } = useI18n()

const list = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 20
const totalPages = computed(() => Math.ceil(total.value / pageSize) || 1)
const showEmpty = computed(() => !list.value.length && !loading.value)

const filters = ref({ keyword: '', rating: '', status: '' })
let searchTimer = null
const debouncedSearch = () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadData, 400) }

const replyVisible = ref(false)
const replyLoading = ref(false)
const currentComment = ref(null)
const replyForm = reactive({ id: null, reply_content: '' })

const statusText = (s) => COMMENT_STATUS_TEXT[s] || t('order.unknown')

const formatTime = (ts) => {
  if (!ts) return '-'
  const d = typeof ts === 'number' || /^\d+$/.test(ts)
    ? new Date(Number(ts) * 1000)
    : new Date(String(ts).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return '-'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const onPageChange = (p) => { page.value = p; loadData() }

const loadData = async () => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize, ...filters.value }
    Object.keys(params).forEach(k => { if (params[k] === '' || params[k] === undefined || params[k] === null) delete params[k] })
    const res = await getCommentList(params)
    list.value = res.data?.list || res.data || []
    total.value = res.data?.total || 0
  } catch (error) { Message.error(t('comment.operationFailed')) } finally { loading.value = false }
}

const openReply = (record) => {
  currentComment.value = record
  Object.assign(replyForm, { id: record.id, reply_content: record.reply_content || '' })
  replyVisible.value = true
}

const submitReply = async () => {
  if (!replyForm.reply_content) { Message.warning(t('comment.replyPlaceholder')); return }
  replyLoading.value = true
  try {
    await replyComment(replyForm.id, { reply_content: replyForm.reply_content })
    Message.success(t('comment.replySuccess'))
    replyVisible.value = false
    loadData()
  } catch (error) { Message.error(t('comment.operationFailed')) } finally { replyLoading.value = false }
}

const toggleStatus = async (record) => {
  const newStatus = record.status === COMMENT_STATUS.APPROVED ? COMMENT_STATUS.REJECTED : COMMENT_STATUS.APPROVED
  try {
    await updateCommentStatus(record.id, { status: newStatus })
    Message.success(newStatus === COMMENT_STATUS.APPROVED ? t('comment.approveSuccess') : t('comment.rejectSuccess'))
    loadData()
  } catch (error) { Message.error(t('comment.operationFailed')) }
}

const handleDelete = (record) => {
  Modal.warning({
    title: t('comment.reject'),
    content: t('comment.confirmReject'),
    hideCancel: false,
    onOk: async () => {
      try { await deleteComment(record.id); Message.success(t('comment.rejectSuccess')); loadData() }
      catch (error) { Message.error(t('comment.operationFailed')) }
    }
  })
}

const handleExport = async () => {
  try { await exportComments({}); Message.success(t('comment.export')) } catch (error) { Message.error(t('comment.operationFailed')) }
}

onMounted(() => loadData())
</script>

<style scoped>
.comment-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-text {
  color: var(--color-on-surface);
  font-weight: 500;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-meta {
  font-size: 12px;
}

.reply-content {
  font-size: 13px;
  color: var(--color-on-surface-variant);
  margin: 0;
  line-height: 1.6;
}
</style>
