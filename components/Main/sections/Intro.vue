<script setup>
import MainHero from '../Hero.client.vue';

const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
  page: {
    type: Object,
    default: () => ({}),
  },
  isBot: {
    type: Boolean,
    default: false,
  },
  isLoaded: {
    type: Boolean,
    default: false,
  },
});

const heroImages = computed(() => {
  if (Array.isArray(props.page.hero) && props.page.hero.length) return props.page.hero;
  if (Array.isArray(props.block?.imageUrl) && props.block.imageUrl.length) return props.block.imageUrl;
  return props.block?.image ? [props.block.image] : [];
});

const heroImage = computed(() => heroImages.value[0] || null);
</script>

<template>
  <section
    :id="block._id"
    class="relative z-[2] mb-16 max-[541px]:min-h-[120vh] max-[541px]:h-fit"
    :class="{ 'w-full h-[65rem]': page.offer }"
  >
    <div class="container">
      <DelayHydration>
        <MainHero v-if="!isBot" :data="page" />
      </DelayHydration>

      <div
        class="absolute top-0 left-0 w-full h-full -z-[2] opacity-0 transition-opacity duration-300 max-[541px]:opacity-100"
        :class="{ 'opacity-100': page.offer }"
      >
        <img
          v-if="heroImage?.path"
          :src="`/media${heroImage.path}`"
          :alt="heroImage?.alt || 'hero'"
          class="w-full h-full object-cover max-[541px]:object-contain max-[541px]:object-top"
        />
      </div>
    </div>
    <div class="absolute top-0 left-0 w-full h-[20%] -z-[1] bg-gradient-to-b from-transparent via-black/68 to-transparent pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-full h-[70%] -z-[1] bg-gradient-to-b from-transparent to-background-01 pointer-events-none"></div>
  </section>
</template>
