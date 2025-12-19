<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const navigationLinks = computed(() => {
  return props.data?.pages
    .map((page) => {
      let title = page.head.title;
      if (title.match(/[-–:|]/)) {
        title = title.split(/[-–:|]/)[0].trim();
      }

      return {
        name: page.homePage ? t('home') : title,
        slug: page.homePage ? "" : page.slug,
      };
    })
    .sort((a, b) => {
      if (a.name === t('home')) return -1;
      if (b.name === t('home')) return 1;
      return 0;
    });
});

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Buttons now resolve offer link themselves via useOffer

</script>

<template>
  <header :class="['absolute top-0 left-0 z-10 w-full', { 'max-[541px]:bg-background-01': isMenuOpen }]">
    <div class="container">
      <div class="flex items-center justify-between gap-4 py-4">
        <div class="min-w-12 h-12 min-h-12 rounded overflow-hidden max-[541px]:min-w-8 max-[541px]:h-8 max-[541px]:min-h-8">
          <NuxtLink to="/" class="w-full h-full block">
            <img v-if="data.logo?.length" :src="`/media${data.logo[0]?.path || ''}`" :alt="data.logo[0]?.alt || 'logo'" class="w-full h-full object-contain" />
          </NuxtLink>
        </div>

        <nav class="max-w-[60%] max-[541px]:hidden">
          <ul class="flex items-center gap-8 list-none m-0 overflow-hidden">
            <li v-for="(link, index) in navigationLinks" :key="index">
              <NuxtLink :to="`/${link.slug}`" external class="block text-base font-medium text-color-white transition-colors duration-300 text-center hover:text-color-01 router-link-active:text-color-01">{{ link.name }}</NuxtLink>
            </li>
          </ul>
        </nav>

        <ClientOnly>
          <div class="flex items-center gap-4 max-[541px]:hidden">
            <GeneralButton :data="{
              offerId: data.offer?._id,
              title: t('login'),
              rel: 'noopener noreferrer',
            }" />

            <GeneralButtonTwo :data="{
              offerId: data.offer?._id,
              title: t('registration'),
              rel: 'noopener noreferrer',
            }" />
          </div>
        </ClientOnly>

        <div class="hidden max-[541px]:flex flex-col justify-between w-6 h-[1.125rem] cursor-pointer" @click="toggleMenu">
          <span :class="['h-0.5 bg-white transition-all duration-300 rounded-sm', { 'rotate-45 translate-y-[0.65rem]': isMenuOpen }]"></span>
          <span :class="['h-0.5 bg-white transition-all duration-300 rounded-sm', { 'opacity-0': isMenuOpen }]"></span>
          <span :class="['h-0.5 bg-white transition-all duration-300 rounded-sm', { '-rotate-45 -translate-y-[0.65rem]': isMenuOpen }]"></span>
        </div>


        <nav v-if="isMenuOpen" class="absolute top-full left-0 w-full h-screen bg-background-01 pt-20 px-4 opacity-100 translate-y-0 transition-all duration-300 ease-in-out flex flex-col max-[541px]:flex">
          <ul class="list-none m-0 p-0">
            <li v-for="(link, i) in navigationLinks" :key="i" class="mb-4">
              <NuxtLink :to="`/${link.slug}`" class="text-white text-base font-medium">{{ link.name }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>

