<template>
  <main class="m-0 p-0">
    <ThemeMain :data="data" />
  </main>
  <div v-for="(code, i) in bodyHtmlCodes" :key="'bh-' + i" v-html="code" />
  <component v-for="(code, i) in bodyJsCodes" :key="'bjs-' + i" :is="'script'" type="text/javascript">{{ code }}</component>
</template>

<script setup>
import { usePageData, usePageDocument } from '@/core/composables';

const config = useRuntimeConfig();
const route = useRoute();

const siteId = import.meta.server ? config.server.siteId : config.public.siteId;
const slug = route.params.slug || null;

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
  slugFallback: '',
  includeBreadcrumbs: true,
  includeFAQ: true,
  logLabel: 'HomePage',
});
</script>
