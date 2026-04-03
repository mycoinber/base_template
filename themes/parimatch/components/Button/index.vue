<!--
  Parimatch Theme - Button Component
  Унифицированный компонент на основе Button.vue, ButtonTwo.vue
-->

<script setup lang="ts">
import { computed } from 'vue';
import HeadlessButton from '@/core/components/HeadlessButton.vue';
import { useOffer } from '@/core/composables';

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  data?: {
    offerId?: string;
    offer?: { _id: string };
    title?: string;
    link?: string;
    target?: string;
    rel?: string;
  };
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  data: () => ({}),
});

// Логика получения оффера (из старых компонентов)
const explicitOfferId = computed(() => props.data?.offerId || props.data?.offer?._id);
const globalOfferId = useState('currentOfferId', () => null);
const offerId = computed(() => explicitOfferId.value || globalOfferId.value);
const { offer } = useOffer(offerId);

// Разрешение ссылки
const resolvedLink = computed(() =>
  props.data?.link ? props.data.link : (offer.value?.link || '')
);

const buttonTitle = computed(() => props.data?.title || 'Button');
const buttonTarget = computed(() => props.data?.target || '_self');
const buttonRel = computed(() => props.data?.rel || '');

// Классы в зависимости от варианта
const variantClasses = computed(() => {
  const base = "font-font-02 font-bold text-center uppercase relative hover:brightness-95 transition-all duration-200 cursor-pointer inline-flex items-center justify-center";

  switch (props.variant) {
    case 'primary':
      return `${base} bg-color-01 text-white`;
    case 'secondary':
      return `${base} bg-color-02 text-white`;
    case 'tertiary':
      return `${base} btn-tertiary`;
    default:
      return `${base} bg-color-01 text-white`;
  }
});

// Размеры — tertiary по дизайну: padding 10px 16px, font-size 14px
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-[16px] py-[10px] text-[14px]';
    case 'lg':
      return 'px-[16px] py-[10px] text-[14px]';
    default:
      return 'px-[16px] py-[10px] text-[14px]';
  }

});

const finalClasses = computed(() => `${variantClasses.value} ${sizeClasses.value}`);
</script>

<template>
  <HeadlessButton
    :href="resolvedLink"
    :target="buttonTarget"
    :rel="buttonRel"
    :class="finalClasses"
  >
    {{ buttonTitle }}
  </HeadlessButton>
</template>

<style lang="scss">
.btn-tertiary {
  background-color: var(--color-primary, #F8FF13);
  color: var(--color-text-inverse, #000000);
  font-family: 'Parimatch Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  padding: 10px 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(0.95);
  }
}
</style>

