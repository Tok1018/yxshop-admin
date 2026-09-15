<template>
  <div class="data-table-wrapper">
    <a-table
      :columns="columns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
      :row-selection="selectable ? { type: 'checkbox', showCheckedAll: true, selectedRowKeys, onSelect: handleSelect } : undefined"
      :pagination="false"
      :bordered="bordered"
      v-bind="$attrs"
    >
      <template #empty>
        <a-empty :description="emptyText">
          <template v-if="emptyHint">
            <div class="empty-hint">{{ emptyHint }}</div>
          </template>
        </a-empty>
      </template>
    </a-table>
    <div v-if="total > 0" class="table-pagination">
      <a-pagination
        :total="total"
        :current="page"
        :page-size="pageSize"
        :page-size-options="[10, 20, 50, 100]"
        show-total
        show-jumper
        show-page-size
        @change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 20 },
  selectable: { type: Boolean, default: false },
  selectedRowKeys: { type: Array, default: () => [] },
  rowKey: { type: String, default: 'id' },
  emptyText: { type: String, default: '暂无数据' },
  emptyHint: { type: String, default: '' },
  bordered: { type: Boolean, default: false },
})

const emit = defineEmits(['page-change', 'select'])

function handlePageChange(page) {
  emit('page-change', { page, pageSize: props.pageSize })
}

function handlePageSizeChange(pageSize) {
  emit('page-change', { page: 1, pageSize })
}

function handleSelect(keys) {
  emit('select', keys)
}
</script>

<style scoped>
.data-table-wrapper {
  width: 100%;
}
.table-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.empty-hint {
  color: var(--color-text-3);
  font-size: 13px;
  margin-top: 4px;
}
</style>