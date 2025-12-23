<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const blocks = computed(() =>
  Array.isArray(props.data.article?.blocks) ? props.data.article.blocks : [],
);

const introBlock = computed(() =>
  blocks.value.find(
    (block) => typeof block?.type === 'string' && block.type.toLowerCase() === 'intro',
  ) || null,
);

const heroMedia = computed(() => {
  const intro = introBlock.value || null;
  if (intro) {
    if (Array.isArray(intro.imageUrl) && intro.imageUrl.length && intro.imageUrl[0]?.path) {
      return intro.imageUrl[0];
    }
    if (intro.image && intro.image.path) {
      return intro.image;
    }
  }
  const heroArray = Array.isArray(props.data?.hero) ? props.data.hero : [];
  if (heroArray.length && heroArray[0]?.path) {
    return heroArray[0];
  }
  return null;
});

const heroAlt = computed(() => {
  if (heroMedia.value?.alt) return heroMedia.value.alt;
  if (introBlock.value?.headline) return introBlock.value.headline;
  return props.data?.article?.H1 || 'hero';
});

const sectionComponents = {
  intro: defineAsyncComponent(() => import('./sections/Intro.vue')),
  h2: defineAsyncComponent(() => import('./sections/Heading.vue')),
  section: defineAsyncComponent(() => import('./sections/Heading.vue')),
  review: defineAsyncComponent(() => import('./sections/Review.vue')),
  faq: defineAsyncComponent(() => import('./sections/Faq.vue')),
  default: defineAsyncComponent(() => import('./sections/Default.vue')),
};

const resolveSection = (type) => {
  if (!type) return sectionComponents.default;
  const key = type.toLowerCase();
  return sectionComponents[key] || sectionComponents.default;
};

const isLoaded = ref(false);
const isBot = useState('isBot', () => false);

if (import.meta.server) {
  const event = useRequestEvent();
  isBot.value = event.context.isBot || false;
} else {
  onMounted(() => {
    setTimeout(() => {
      isLoaded.value = true;
    }, 100);
  });
}
</script>

<template>
  <div v-if="!isLoaded" class="fixed top-0 left-0 w-full h-screen flex items-center justify-center bg-background-01 z-[9999]">
    <MainLoader />
  </div>

  <section
    v-if="heroMedia"
    class="relative w-full mb-8 overflow-hidden rounded-[0.625rem] border border-border"
  >
    <NuxtImg
      :src="heroMedia?.path || ''"
      :alt="heroAlt"
      class="w-full h-full object-cover"
      loading="lazy"
    />
  </section>

  <MainTitle v-if="data.article?.H1" :data="data" />

  <MainTableOfContent v-if="blocks.length" :data="data" />

  <component
    v-for="block in blocks"
    :key="block._id"
    :is="resolveSection(block.type)"
    :block="block"
    :page="data"
    :is-bot="isBot"
    :is-loaded="isLoaded"
  />

  <MainAuthor v-if="data.aiauthor" :data="data" />
</template>
