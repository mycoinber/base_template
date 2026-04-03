<!--
  Dynamic Page Route - Updated for Core/Theme Architecture
  Использует Core composables и Theme components
-->

<template>
  <main v-if="pageData">
    <!-- Theme component будет автоматически резолвиться -->
    <ThemeMain :data="pageData" />
  </main>

  <!-- SSR-rendered body code blocks -->
  <div v-for="(code, i) in bodyHtmlCodes" :key="'bh-'+i" v-html="code" />
  <component
    v-for="(code, i) in bodyJsCodes"
    :key="'bjs-'+i"
    :is="'script'"
    type="text/javascript"
  >
    {{ code }}
  </component>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Core imports
import {
  usePageData,
  useSiteManifest,
  useSeo,
  useNavigation
} from '@/core/composables';
import type { PageData } from '@/core/types/page';

// Utils (will be moved to Core later)
import { manifestToHead } from "~/utils/manifestHead";
import { dedupeLinks, dedupeMeta, toContentString } from "~/utils/headUtils";

// ============================================================================
// Setup
// ============================================================================

const { locale } = useI18n();
const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;
const config = useRuntimeConfig();
const route = useRoute();

const siteId = import.meta.server ? config.server.siteId : config.public.siteId;

// ============================================================================
// Route Processing
// ============================================================================

// Сборка slug-а из catch-all
const rawSlug = route.params.slug;

const slugArray = Array.isArray(rawSlug)
  ? rawSlug
  : typeof rawSlug === "string"
    ? rawSlug.split("/")
    : [];

const slug = slugArray.length ? slugArray.join("/") : "";

// Игнорируем запросы к статическим файлам
const staticFileExtensions = ['.svg', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt', '.xml'];
if (slug && staticFileExtensions.some(ext => slug.endsWith(ext))) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Not Found',
    fatal: false
  });
}

// ============================================================================
// Core Data Fetching
// ============================================================================

// Fetch page data using Core composable
const { data: pageData, error: pageError } = await usePageData(siteId, slug);

if (pageError.value) {
  throw pageError.value;
}

// Fetch site manifest using Core composable
const { data: siteManifest } = await useSiteManifest();

// Setup navigation
const { navigation, currentPage, breadcrumbs } = useNavigation(siteId);

// ============================================================================
// SEO Setup using Core
// ============================================================================

// Setup SEO using Core composable
const { head, structuredData } = useSeo(pageData, {
  generateStructuredData: true,
  includeOpenGraph: true,
  includeTwitter: true,
  includeBreadcrumbs: Boolean(breadcrumbs.value?.length),
  includeFAQ: true,
});

// ============================================================================
// Legacy Head Logic (to be deprecated)
// ============================================================================

// Keep existing head logic for backward compatibility during migration
const manifestHead = computed(() => manifestToHead(siteManifest.value));

// Legacy head computation (will be replaced by Core useSeo)
const pageHead = computed(() => pageData.value?.head || {});
const pageLang = computed(() => pageData.value?.lang || "en");
const pageDomain = computed(() => pageData.value?.domain || siteDomain);
const pageSlug = computed(() => pageData.value?.slug || slug || "");

// Parse global head tags
const globalHeadRaw = import.meta.server ? config.server.globalHead : config.public.globalHead;
const globalHeadSource = Array.isArray(globalHeadRaw) ? globalHeadRaw : [];
const globalHead = {
  link: globalHeadSource
    .filter(tag => tag.startsWith("<link"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
  meta: globalHeadSource
    .filter(tag => tag.startsWith("<meta"))
    .map(tag => Object.fromEntries(Array.from(tag.matchAll(/(\w+)=["'](.*?)["']/g)).map(([_, name, value]) => [name, value]))),
};

// Legacy meta processing
const headMeta = computed(() => {
  const baseMeta = [
    { name: "description", content: toContentString(pageHead.value.description) },
    { name: "keywords", content: toContentString(pageHead.value.keywords) },
    { property: "og:title", content: toContentString(pageHead.value.title) },
    { property: "og:description", content: toContentString(pageHead.value.description) },
    { property: "og:image", content: toContentString(pageData.value?.article?.introImage?.[0]?.path) },
    { property: "og:url", content: toContentString(`${pageDomain.value}/${pageSlug.value}`) },
    { property: "og:type", content: "article" },
    { property: "og:locale", content: toContentString(pageLang.value) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: toContentString(pageHead.value.title) },
    { name: "twitter:description", content: toContentString(pageHead.value.description) },
    { name: "twitter:image", content: toContentString(pageData.value?.article?.introImage?.[0]?.path) },
  ];

  const metaArray = Array.isArray(pageHead.value.meta) ? pageHead.value.meta : [];
  const globalMeta = globalHead.meta || [];
  const manifestMetaEntries = manifestHead.value.meta || [];
  const robotsMetaTags = Array.isArray(pageData.value?.robots?.metaTags) ? pageData.value.robots.metaTags : [];

  let robotsMeta = metaArray.find(m => m.key === "robots" && m.type === "name")
    || robotsMetaTags.find(m => m.name === "robots");

  const metaWithoutRobots = metaArray.filter(m => m.key !== "robots");
  const robotsOtherMeta = robotsMetaTags.filter(m => m.name !== "robots");

  const manifestNames = manifestMetaEntries
    .map(entry => entry?.name)
    .filter(Boolean);

  const usedNames = new Set([
    ...metaWithoutRobots.map(m => m.key),
    ...manifestNames,
    ...(globalMeta.map(m => m.name).filter(Boolean)),
  ]);
  const robotsOtherMetaFiltered = robotsOtherMeta.filter(m => !usedNames.has(m.name));

  const dynamicMeta = [
    ...baseMeta,
    ...metaWithoutRobots.map(m => ({ [m.type || "name"]: m.key, content: toContentString(m.value) })),
    ...manifestMetaEntries.filter(entry => entry?.name && !usedNames.has(entry.name)),
    ...globalMeta,
    ...robotsOtherMetaFiltered,
  ].filter(meta => meta.content !== null && meta.content !== undefined);

  if (robotsMeta) {
    dynamicMeta.push({ name: "robots", content: toContentString(robotsMeta.content || robotsMeta.value) });
  }

  return dedupeMeta(dynamicMeta);
});

// Legacy link processing
const headLink = computed(() => {
  const baseLink = [
    { rel: "canonical", href: `${pageDomain.value}/${pageSlug.value}` }
  ];

  const pageLinks = Array.isArray(pageHead.value.link) ? pageHead.value.link : [];
  const manifestLinks = manifestHead.value.link || [];
  const globalLinks = globalHead.link || [];

  const dynamicLink = [
    ...baseLink,
    ...pageLinks.map(l => ({ rel: l.rel, href: toContentString(l.href) })),
    ...manifestLinks,
    ...globalLinks
  ];

  return dedupeLinks(dynamicLink);
});

// Apply legacy head (TODO: Remove after migration complete)
useHead({
  title: computed(() => toContentString(pageHead.value.title)),
  meta: headMeta,
  link: headLink,
  htmlAttrs: {
    lang: pageLang,
    dir: "ltr"
  }
});

// ============================================================================
// Body Code Processing
// ============================================================================

// Process body HTML and JS codes
const bodyHtmlCodes = computed(() => {
  if (!pageData.value?.customFields?.bodyHtmlCodes) return [];
  return Array.isArray(pageData.value.customFields.bodyHtmlCodes)
    ? pageData.value.customFields.bodyHtmlCodes
    : [];
});

const bodyJsCodes = computed(() => {
  if (!pageData.value?.customFields?.bodyJsCodes) return [];
  return Array.isArray(pageData.value.customFields.bodyJsCodes)
    ? pageData.value.customFields.bodyJsCodes
    : [];
});

// ============================================================================
// Development Info
// ============================================================================

if (process.dev) {
  console.info('[Page] Loaded data:', {
    pageData: pageData.value,
    siteManifest: siteManifest.value,
    navigation: navigation.value,
    currentPage: currentPage.value,
    breadcrumbs: breadcrumbs.value,
  });
}
</script>
