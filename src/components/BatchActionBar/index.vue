<template>
  <div v-if="selectedCount > 0" class="batch-action-bar">
    <span class="batch-info">已选择 <strong>{{ selectedCount }}</strong> 项</span>
    <a-space>
      <a-button v-for="action in actions" :key="action.key" :type="action.type || 'outline'" :status="action.status" size="small" @click="handleAction(action)">
        {{ action.label }}
      </a-button>
      <a-button size="small" @click="emit('clear-selection')">取消选择</a-button>
    </a-space>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedCount: { type: Number, default: 0 },
  actions: { type: Array, default: () => [] },
})

const emit = defineEmits(['action', 'clear-selection'])

function handleAction(action) {
  emit('action', action.key)
}
</script>

<style scoped>
.batch-action-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: var(--color-fill-1);
  border-radius: 4px;
  margin-bottom: 12px;
}
.batch-info {
  color: var(--color-text-2);
  font-size: 13px;
}
</style>