<script setup>
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { resolveMediaPath } from '~/utils/mediaPath';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const hasOfferLayout = useState<boolean>('fastgenOfferLayoutActive', () => false);

const blocks = computed(() =>
  Array.isArray(props.data.article?.blocks) ? props.data.article.blocks : [],
);

const monolithHtml = computed(() =>
  typeof props.data?.article?.monolithHtml === 'string' ? props.data.article.monolithHtml.trim() : '',
);

const monolithReviews = computed(() =>
  Array.isArray(props.data?.article?.reviews) ? props.data.article.reviews : [],
);

const monolithReviewBlock = computed(() => ({
  _id: 'article-reviews',
  type: 'review',
  headline: props.data?.article?.reviewsTitle || '',
  reviews: monolithReviews.value,
}));

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

const heroMediaSrc = computed(() => {
  const media = heroMedia.value;
  if (!media) return '';
  const variants = Array.isArray(media.variants) ? media.variants : [];
  if (variants.length) {
    const sorted = [...variants].sort((a, b) => (b?.width || 0) - (a?.width || 0));
    const best = sorted[0];
    if (best?.path) return resolveMediaPath(best.path);
  }
  const fallback = media.originalPath || media.path || '';
  return fallback ? resolveMediaPath(fallback) : '';
});

const sectionComponents = {
  intro: defineAsyncComponent(() => import('./sections/Intro.vue')),
  h2: defineAsyncComponent(() => import('./sections/Heading.vue')),
  section: defineAsyncComponent(() => import('./sections/Heading.vue')),
  review: defineAsyncComponent(() => import('./sections/Review.vue')),
  product_review: defineAsyncComponent(() => import('./sections/ProductReview.vue')),
  faq: defineAsyncComponent(() => import('./sections/Faq.vue')),
  default: defineAsyncComponent(() => import('./sections/Default.vue')),
};

const resolveSection = (type) => {
  if (!type) return sectionComponents.default;
  const key = type.toLowerCase();
  return sectionComponents[key] || sectionComponents.default;
};

const hasAuthor = computed(() => Boolean(props.data?.author || props.data?.aiauthor));

const isLoaded = ref(import.meta.server);
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
    v-if="!hasOfferLayout && heroMedia"
    class="relative w-full mb-8 overflow-hidden rounded-[0.625rem] border border-border h-[40rem] max-[541px]:min-h-[24rem]"
  >
    <img
      :src="heroMediaSrc"
      :alt="heroAlt"
      class="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
    />
    <div class="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-b from-transparent via-black/50 to-background-01 pointer-events-none"></div>
  </section>

  <MainTitle v-if="data.article?.H1" :data="data" />

  <MainTableOfContent v-if="blocks.length && !monolithHtml" :data="data" />

  <section v-if="monolithHtml" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div
        class="prose prose-invert max-w-none overflow-hidden max-[541px]:[&_table]:block max-[541px]:[&_table]:w-full max-[541px]:[&_table]:max-w-full max-[541px]:[&_table]:overflow-x-auto max-[541px]:[&_table]:pb-2 max-[541px]:[&_table]:pr-2"
        v-html="monolithHtml"
      ></div>
    </div>
  </section>

  <component
    v-if="monolithReviews.length"
    :is="sectionComponents.review"
    :block="monolithReviewBlock"
  />

  <component
    v-if="!monolithHtml"
    v-for="block in blocks"
    :key="block._id"
    :is="resolveSection(block.type)"
    :block="block"
    :page="data"
    :is-bot="isBot"
    :is-loaded="isLoaded"
  />

  <MainAuthor v-if="hasAuthor" :data="data" />
</template>
