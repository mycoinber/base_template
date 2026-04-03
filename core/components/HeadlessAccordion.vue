<!--
  HeadlessAccordion - Core accordion logic without styles
  Обеспечивает логику управления состоянием accordion без UI
-->

<!-- Отдельный script для экспортов (типы и injection key) -->
<script lang="ts">
import type { InjectionKey, Ref } from 'vue';

// ============================================================================
// Types (exported for external use)
// ============================================================================

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
  disabled?: boolean;
}

export interface AccordionContext {
  openItems: Readonly<Ref<ReadonlySet<string>>>;
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  open: (id: string) => void;
  close: (id: string) => void;
  closeAll: () => void;
  openAll: () => void;
}

// Injection key for child components
export const AccordionKey: InjectionKey<AccordionContext> = Symbol('accordion');
</script>

<script setup lang="ts">
import { ref, provide, readonly } from 'vue';

// ============================================================================
// Props & Emits
// ============================================================================

export interface Props {
  items?: AccordionItem[];
  defaultOpen?: string | string[];
  allowMultiple?: boolean;
  collapsible?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  defaultOpen: () => [],
  allowMultiple: false,
  collapsible: true,
  disabled: false,
});

const emit = defineEmits<{
  'update:open': [openItems: string[]];
  'item-toggle': [id: string, isOpen: boolean];
  'item-open': [id: string];
  'item-close': [id: string];
}>();

// ============================================================================
// State Management
// ============================================================================

const openItems = ref<Set<string>>(new Set());

// Initialize default open items
const initDefaultOpen = () => {
  const defaultItems = Array.isArray(props.defaultOpen)
    ? props.defaultOpen
    : props.defaultOpen ? [props.defaultOpen] : [];

  openItems.value = new Set(defaultItems);
};

// Initialize on mount
onMounted(initDefaultOpen);

// Watch for defaultOpen changes
watch(() => props.defaultOpen, initDefaultOpen, { deep: true });

// ============================================================================
// Methods
// ============================================================================

const isOpen = (id: string): boolean => {
  return openItems.value.has(id);
};

const open = (id: string): void => {
  if (props.disabled) return;

  const item = props.items.find(item => item.id === id);
  if (item?.disabled) return;

  if (!props.allowMultiple && openItems.value.size > 0) {
    // Close all others if multiple not allowed
    const wasOpen = openItems.value.has(id);
    openItems.value.clear();
    if (!wasOpen) {
      openItems.value.add(id);
    }
  } else {
    openItems.value.add(id);
  }

  emit('item-open', id);
  emit('update:open', Array.from(openItems.value));
};

const close = (id: string): void => {
  if (props.disabled) return;

  const item = props.items.find(item => item.id === id);
  if (item?.disabled) return;

  openItems.value.delete(id);

  emit('item-close', id);
  emit('update:open', Array.from(openItems.value));
};

const toggle = (id: string): void => {
  if (props.disabled) return;

  const item = props.items.find(item => item.id === id);
  if (item?.disabled) return;

  const wasOpen = isOpen(id);

  if (wasOpen) {
    // Only close if collapsible or multiple items allowed
    if (props.collapsible || props.allowMultiple || openItems.value.size > 1) {
      close(id);
    }
  } else {
    open(id);
  }

  emit('item-toggle', id, !wasOpen);
};

const closeAll = (): void => {
  if (props.disabled) return;

  openItems.value.clear();
  emit('update:open', []);
};

const openAll = (): void => {
  if (props.disabled || !props.allowMultiple) return;

  props.items
    .filter(item => !item.disabled)
    .forEach(item => openItems.value.add(item.id));

  emit('update:open', Array.from(openItems.value));
};

// ============================================================================
// Context Provider
// ============================================================================

const accordionContext: AccordionContext = {
  openItems: readonly(openItems),
  isOpen,
  toggle,
  open,
  close,
  closeAll,
  openAll,
};

// Provide context to child components
provide(AccordionKey, accordionContext);

// ============================================================================
// Expose for template refs
// ============================================================================

defineExpose({
  openItems: readonly(openItems),
  isOpen,
  toggle,
  open,
  close,
  closeAll,
  openAll,
});
</script>

<template>
  <div
    role="region"
    :aria-disabled="disabled"
    class="headless-accordion"
  >
    <!--
      Slot with context provided to children
      Theme components can use this context to build styled accordion
    -->
    <slot
      :items="items"
      :open-items="Array.from(openItems)"
      :is-open="isOpen"
      :toggle="toggle"
      :open="open"
      :close="close"
      :close-all="closeAll"
      :open-all="openAll"
      :disabled="disabled"
      :allow-multiple="allowMultiple"
      :collapsible="collapsible"
    />
  </div>
</template>

<style>
/* No styles - this is headless */
.headless-accordion {
  /* Only functional styles that don't affect appearance */
}
</style>
