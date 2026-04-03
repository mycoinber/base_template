<!--
  HeadlessButton - Core button logic without styles
  Обеспечивает логику кнопки, состояния и accessibility
-->

<script setup lang="ts">
import { ref, computed, type HTMLAttributes } from 'vue';

// ============================================================================
// Types
// ============================================================================

export interface Props {
  // Button type and behavior
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // State
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean; // For toggle buttons

  // Link behavior
  href?: string;
  to?: string;
  target?: string;
  rel?: string;

  // Accessibility
  ariaLabel?: string;
  ariaDescribedby?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;

  // HTML attributes passthrough
  htmlAttrs?: HTMLAttributes;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  pressed: false,
  target: undefined,
  rel: undefined,
});

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  click: [event: MouseEvent];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  'update:pressed': [pressed: boolean];
}>();

// ============================================================================
// State
// ============================================================================

const buttonRef = ref<HTMLElement>();
const isFocused = ref(false);
const isHovered = ref(false);
const isActive = ref(false);

// ============================================================================
// Computed Properties
// ============================================================================

const isLink = computed(() => Boolean(props.href || props.to));
const isDisabled = computed(() => props.disabled || props.loading);

const buttonComponent = computed(() => {
  if (props.to) return 'NuxtLink';
  if (props.href) return 'a';
  return 'button';
});

const buttonAttrs = computed(() => {
  const baseAttrs = {
    ...props.htmlAttrs,
    'aria-label': props.ariaLabel,
    'aria-describedby': props.ariaDescribedby,
    'aria-expanded': props.ariaExpanded,
    'aria-pressed': props.ariaPressed ?? (props.pressed ? 'true' : undefined),
    'aria-disabled': isDisabled.value ? 'true' : undefined,
    'data-variant': props.variant,
    'data-size': props.size,
    'data-loading': props.loading,
    'data-focused': isFocused.value,
    'data-hovered': isHovered.value,
    'data-active': isActive.value,
  };

  if (isLink.value) {
    return {
      ...baseAttrs,
      href: props.href || undefined,
      to: props.to || undefined,
      target: props.target,
      rel: props.rel,
      tabindex: isDisabled.value ? -1 : 0,
    };
  }

  return {
    ...baseAttrs,
    type: props.type,
    disabled: isDisabled.value,
    tabindex: isDisabled.value ? -1 : 0,
  };
});

// ============================================================================
// Event Handlers
// ============================================================================

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // Toggle pressed state for toggle buttons
  if (props.ariaPressed !== undefined || typeof props.pressed === 'boolean') {
    emit('update:pressed', !props.pressed);
  }

  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  if (isDisabled.value) return;

  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
};

const handleMouseEnter = () => {
  if (isDisabled.value) return;
  isHovered.value = true;
};

const handleMouseLeave = () => {
  isHovered.value = false;
  isActive.value = false;
};

const handleMouseDown = () => {
  if (isDisabled.value) return;
  isActive.value = true;
};

const handleMouseUp = () => {
  isActive.value = false;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (isDisabled.value) return;

  // Handle space and enter for button-like behavior on links
  if (isLink.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    handleClick(event as unknown as MouseEvent);
  }

  emit('keydown', event);
};

// ============================================================================
// Public Methods
// ============================================================================

const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

const click = () => {
  buttonRef.value?.click();
};

// ============================================================================
// Expose
// ============================================================================

defineExpose({
  focus,
  blur,
  click,
  buttonRef,
  isDisabled,
  isFocused,
  isHovered,
  isActive,
});
</script>

<template>
  <component
    :is="buttonComponent"
    ref="buttonRef"
    v-bind="buttonAttrs"
    class="headless-button"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @mousedown="handleMouseDown"
    @mouseup="handleMouseUp"
    @keydown="handleKeyDown"
  >
    <slot
      :disabled="isDisabled"
      :loading="loading"
      :focused="isFocused"
      :hovered="isHovered"
      :active="isActive"
      :pressed="pressed"
      :variant="variant"
      :size="size"
    >
      <!-- Default slot content -->
    </slot>
  </component>
</template>

<style>
/* No visual styles - this is headless */
.headless-button {
  /* Only functional styles that don't affect appearance */
  cursor: pointer;
  outline: none;
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-decoration: none;
}

.headless-button[aria-disabled="true"] {
  cursor: not-allowed;
}
</style>
