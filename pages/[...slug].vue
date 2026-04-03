<template>
  <main class="m-0 p-0">
    <ThemeMain v-if="data?.type" :data="data" />
  </main>
  <div v-for="(code, i) in bodyHtmlCodes" :key="'bh-' + i" v-html="code" />
  <component v-for="(code, i) in bodyJsCodes" :key="'bjs-' + i" :is="'script'" type="text/javascript">{{ code }}</component>
</template>

<script setup lang="ts">
import { usePageData, usePageDocument } from '@/core/composables';

const config = useRuntimeConfig();
const route = useRoute();

const siteId = import.meta.server ? config.server.siteId : config.public.siteId;

const rawSlug = route.params.slug;
const slugArray = Array.isArray(rawSlug)
  ? rawSlug
  : typeof rawSlug === 'string'
    ? rawSlug.split('/')
    : [];
const slug = slugArray.length ? slugArray.join('/') : '';

const staticFileExtensions = ['.svg', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt', '.xml'];
if (slug && staticFileExtensions.some((ext) => slug.endsWith(ext))) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    fatal: false,
  });
}

const { data, error } = await usePageData(siteId, slug);

if (error.value) {
  throw error.value;
}

const sharedOffers = useState('pageOffers', () => []);
watch(() => data.value?.offers, (offers) => {
  if (Array.isArray(offers)) sharedOffers.value = offers;
}, { immediate: true });

const sharedAuthor = useState('pageAuthor', () => null);
watch(() => data.value?.author, (author) => {
  if (author) sharedAuthor.value = author;
}, { immediate: true });

const { bodyHtmlCodes, bodyJsCodes } = await usePageDocument(data, {
  slugFallback: slug,
  includeBreadcrumbs: true,
  includeFAQ: true,
  logLabel: 'Page',
});

if ((data.value as any)?.redirect?.to && import.meta.server) {
  await navigateTo((data.value as any).redirect.to, {
    redirectCode: (data.value as any).redirect.statusCode || 301,
  });
}
</script>
