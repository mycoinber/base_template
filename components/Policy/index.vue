<script setup>

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const faqs = computed(() => {
  return (
    props.data.article.blocks?.find(
      (item) => item.faqs && Array.isArray(item.faqs) && item.faqs.length > 0
    ) || null
  );
});

const reviews = computed(() => {
  return (
    props.data.article.blocks?.find(
      (item) =>
        item.reviews && Array.isArray(item.reviews) && item.reviews.length > 0
    ) || null
  );
});

const sections = computed(() => {
  return (
    props.data.article.blocks?.filter(
      (item) =>
        !(
          (item.faqs && Array.isArray(item.faqs) && item.faqs.length > 0) ||
          (item.reviews &&
            Array.isArray(item.reviews) &&
            item.reviews.length > 0)
        )
    ) || []
  );
});

const isLoaded = ref(false);
const isBot = useState("isBot", () => false);

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
  <section class="w-full h-[65rem] relative z-[2] mb-16 max-[541px]:h-fit">
    <div class="container">
      <ClientOnly>
        <DelayHydration>
          <MainHero v-if="!isBot" :data="data" />
        </DelayHydration>
      </ClientOnly>
      <div class="absolute top-0 left-0 w-full h-full -z-[2]">
        <img :src="`/media${data.hero[0]?.path || ''}`" :alt="data.hero[0]?.alt || 'hero'" class="w-full h-full object-cover max-[541px]:object-contain max-[541px]:object-top" />
      </div>
    </div>
    <div class="absolute bottom-0 left-0 w-full h-[70%] -z-[1] bg-gradient-to-b from-transparent to-background-01 pointer-events-none"></div>
  </section>
  <MainTitle v-if="data.H1" :data="data" />

  <MainTableOfContent v-if="data.sections && data.sections.length" :data="data" />

  <MainSection v-for="(item, index) in sections" :data="item" />

  <ClientOnly>
    <DelayHydration>
      <MainFaq v-if="faqs" :data="faqs" />
    </DelayHydration>
  </ClientOnly>

  <MainAuthor v-if="data.aiauthor" :data="data" />

  <MainReview v-if="reviews" :data="reviews" />
</template>
