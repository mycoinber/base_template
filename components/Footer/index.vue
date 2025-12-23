<script setup>
import { useRequestURL } from "#app";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const sharedLogo = useState("siteLogo", () => []);

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

const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;

const resolvedLogo = computed(() => {
  const fromState = Array.isArray(sharedLogo.value) ? sharedLogo.value : [];
  return fromState.length ? fromState[0] : null;
});
</script>

<template>
  <footer>
    <div class="container">
      <div class="flex flex-col gap-8 py-12 pb-4 max-[541px]:items-start max-[541px]:py-4">
        <div class="flex items-center gap-20 max-[541px]:flex-col max-[541px]:items-start max-[541px]:gap-4">
          <div class="min-w-12 h-12 min-h-12 rounded overflow-hidden max-[541px]:min-w-8 max-[541px]:h-8 max-[541px]:min-h-8 max-[541px]:mb-4">
            <NuxtLink to="/" class="w-full h-full block">
              <img v-if="resolvedLogo" :src="`/media${resolvedLogo?.path || ''}`" :alt="resolvedLogo?.alt || 'logo'" class="w-full h-full object-contain" />
            </NuxtLink>
          </div>

          <nav>
            <ul class="flex gap-4 list-none m-0 p-0 max-[541px]:flex-col max-[541px]:items-start max-[541px]:gap-[0.675rem]">
              <li v-for="(link, index) in navigationLinks" :key="index" class="m-0">
                <NuxtLink :to="`/${link.slug}`" external class="block text-base font-medium leading-[120%] transition-colors duration-300 text-color-white text-center max-[541px]:text-left max-[541px]:text-sm hover:text-color-01">{{ link.name }}</NuxtLink>
              </li>
            </ul>
          </nav>
        </div>

        <div class="w-full text-center opacity-50 text-base max-[541px]:text-sm">
          &#169; Copyright 2025. {{ siteDomain }}
        </div>
      </div>
    </div>
  </footer>
</template>
