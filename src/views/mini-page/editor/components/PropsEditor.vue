<template>
  <div class="props-editor">
    <template v-if="selectedComponent && registryEntry">
      <div class="editor-header">
        <span class="editor-title">{{ registryEntry.name }}</span>
      </div>
      <div class="editor-body">
        <component
          :is="registryEntry.editor"
          :props="selectedComponent.props"
          @update:props="updateProps"
        />
        <div class="style-divider"></div>
        <style-editor
          :model-value="selectedComponent.props._style || {}"
          @update:modelValue="updateStyle"
        />
      </div>
    </template>
    <div v-else class="editor-empty">
      <icon-info-circle :size="28" style="opacity: 0.3" />
      <span>{{ t('mini_page.select_component_hint') }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconInfoCircle } from '@arco-design/web-vue/es/icon'
import { componentRegistry } from './registry'
import StyleEditor from './StyleEditor.vue'

const { t } = useI18n()

const props = defineProps({
  selectedComponent: { type: Object, default: null }
})

const emit = defineEmits(['update:props'])

const registryEntry = computed(() => {
  if (!props.selectedComponent) return null
  return componentRegistry[props.selectedComponent.component_type] || null
})

const updateProps = (newProps) => { emit('update:props', newProps) }

const updateStyle = (styleObj) => { emit('update:props', { _style: styleObj }) }
</script>

<style scoped>
.props-editor { height: 100%; display: flex; flex-direction: column; }
.editor-header { padding: 12px 16px; border-bottom: 1px solid var(--color-outline-variant); flex-shrink: 0; }
.editor-title { font-size: 14px; font-weight: 600; color: var(--color-on-surface); }
.editor-body { flex: 1; overflow-y: auto; padding: 16px; }
.style-divider { height: 1px; background: var(--color-outline-variant); margin: 16px 0; }
.editor-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 80px 20px; color: var(--color-on-surface-variant); font-size: 13px; }
</style>