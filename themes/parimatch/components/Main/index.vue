<!--
  Parimatch Theme - Main Component
  Перенесенный из components/Main/index.vue
-->

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import type { PageData } from '@/core/types/page';

interface Props {
  data: PageData | null;
}

const props = defineProps<Props>();

const blocks = computed(() =>
  Array.isArray(props.data?.article?.blocks) ? props.data.article.blocks : [],
);

// Theme section components - используем компоненты из папки темы
const sectionComponents: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  intro: defineAsyncComponent(() => import('./sections/Intro.vue')),
  h2: defineAsyncComponent(() => import('./sections/Heading.vue')),
  section: defineAsyncComponent(() => import('./sections/Heading.vue')),
  review: defineAsyncComponent(() => import('./sections/Review.vue')),
  faq: defineAsyncComponent(() => import('./sections/Faq.vue')),
  default: defineAsyncComponent(() => import('./sections/Default.vue')),
};

const resolveSection = (type: string) => {
  if (!type) return sectionComponents.default;
  const key = type.toLowerCase();
  return sectionComponents[key] || sectionComponents.default;
};

const isLoaded = ref(import.meta.server);
const isBot = useState('isBot', () => false);

if (import.meta.server) {
  const event = useRequestEvent();
  if (event) {
    isBot.value = (event.context as any).isBot || false;
  }
} else {
  onMounted(() => {
    setTimeout(() => {
      isLoaded.value = true;
    }, 100);
  });
}
</script>

<template>
  <!-- Loader -->
  <div v-if="!isLoaded" class="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-background-01 z-[9999]">
    <ThemeLoader />
  </div>

  <!-- Hero Section -->
  <ThemeHero :data="data" />

  <!-- Gallery Section (между Title и TableOfContent) -->
  <ThemeGallery :data="data" />

  <!-- Title Section -->
  <ThemeTitle v-if="data?.article?.H1" :data="data" />

  <!-- Table of Content -->
  <ThemeTableOfContent v-if="blocks.length" :data="data" />

  <!-- Dynamic Sections -->
  <component
    v-for="block in blocks"
    :key="block._id"
    :is="resolveSection(block.type)"
    :block="block"
    :page="data"
    :is-bot="isBot"
    :is-loaded="isLoaded"
  />

  <!-- Author Bar (жёлтый бар после всех секций — дизайн Figma) -->
  <ThemeAuthor :data="data" />
</template>

