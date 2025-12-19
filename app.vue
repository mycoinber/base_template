<template>
  <NuxtLayout>
    <Analytics />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
</script>

<!-- <script setup>
import { useI18n } from 'vue-i18n';
const { setLocaleMessage, locale } = useI18n();

const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;

const { $axios } = useNuxtApp();
const config = useRuntimeConfig();
const siteId = import.meta.server
  ? config.server.siteId
  : config.public.siteId;

const route = useRoute();
const slug = route.params.slug;

// Получаем страницу и переводы
const fetchPage = async (siteId, slug = null) => {
  const params = { siteId };
  if (slug) params.slug = slug;

  try {
    const response = await $axios.get("/pages/page-by-slug", { params });
    return response.data;
  } catch (error) {
    console.error("Ошибка запроса:", error.message);
    throw error;
  }
};

const { data } = await useAsyncData(
  `app-init-${slug}-${siteId}`,
  () => fetchPage(siteId, slug),
  {
    server: true,
  }
);

const translations = data.value.translations;
const browserLang = ref(data.value.lang);

const fallbackLang = Object.keys(translations)[0] || 'en';

const matchedLang = translations[browserLang.value]
  ? browserLang.value
  : fallbackLang;

setLocaleMessage(matchedLang, translations[matchedLang]);
locale.value = matchedLang;
</script> -->