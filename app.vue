<template>
  <NuxtLayout>
    <Analytics />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';
import { useSiteManifest, useGlobalSeo, createOrganizationSchema } from '@/core/composables';

// ============================================================================
// Global Site Setup
// ============================================================================

// Используем Core site manifest для глобальных настроек
const {
  data: siteManifest,
  favicon,
  logoImage,
  title: siteTitle,
  description: siteDescription,
  domain: siteDomain,
} = await useSiteManifest();

// Используем глобальный SEO state
const { addGlobalSchema } = useGlobalSeo();

// Добавляем Organization schema для всего сайта
watch(() => siteManifest.value, (manifest) => {
  if (manifest) {
    const orgSchema = createOrganizationSchema(
      manifest.title,
      manifest.domain,
      manifest.logo || undefined
    );
    addGlobalSchema(orgSchema);
  }
}, { immediate: true });

// Глобальные head настройки из manifest
useHead(() => {
  const head: any = {};

  if (siteTitle.value) {
    head.titleTemplate = `%s | ${siteTitle.value}`;
    head.title = siteTitle.value;
  }

  if (siteDescription.value) {
    head.meta = [
      { name: 'description', content: siteDescription.value },
      { property: 'og:description', content: siteDescription.value },
      { property: 'og:site_name', content: siteTitle.value },
    ];
  }

  if (favicon.value) {
    head.link = [
      { rel: 'icon', type: 'image/x-icon', href: favicon.value },
      { rel: 'shortcut icon', href: favicon.value },
    ];
  }

  // Add OG image from logo
  if (logoImage.value?.path) {
    head.meta = head.meta || [];
    head.meta.push({ property: 'og:image', content: logoImage.value.path });
  }

  return head;
});

// Development logging
if (process.dev) {
  watch(() => siteManifest.value, (manifest) => {
    console.info('[App] Site manifest loaded:', manifest);
  }, { immediate: true });
}
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