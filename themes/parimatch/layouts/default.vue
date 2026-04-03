<!--
  Parimatch Theme - Default Layout
  Использует Core навигацию, site manifest и Theme компоненты
-->

<script setup lang="ts">
import { useNavigation, useSiteManifest } from '@/core/composables';
import type { ArticleImage, PageData } from '@/core/types/page';

// ============================================================================
// Site Data
// ============================================================================

// Используем Core navigation composable
const { navigation, isLoading: navLoading, error: navError } = await useNavigation();

// Используем Core site manifest composable (без await — данные придут реактивно)
const {
  data: siteManifest,
  favicon,
  logoImage,
  title: siteTitle,
  description: siteDescription,
} = await useSiteManifest().catch(() => ({
  data: ref(null),
  isLoading: ref(false),
  error: ref(null),
  favicon: computed(() => null),
  logoImage: computed(() => null),
  title: computed(() => null),
  description: computed(() => null),
  domain: computed(() => null),
  siteId: computed(() => null),
  logo: computed(() => null),
  refresh: async () => null,
}));

// Shared logo state (legacy support for components that use useState)
const sharedLogo = useState<ArticleImage[]>("siteLogo", () => []);
const route = useRoute();
const config = useRuntimeConfig();
const siteId = import.meta.server ? config.server.siteId : config.public.siteId;
const rawSlug = route.params.slug;
const slugArray = Array.isArray(rawSlug)
  ? rawSlug
  : typeof rawSlug === 'string'
    ? rawSlug.split('/')
    : [];
const slug = slugArray.length ? slugArray.join('/') : '';
const pageDataKey = `page-${slug || 'home'}-${siteId}`;
const pageData = useNuxtData<PageData | null>(pageDataKey);
const pageOffers = computed(() => pageData.data.value?.offers || []);

// Watch for logo changes from manifest
watch(
  () => logoImage.value,
  (logo) => {
    if (logo) {
      sharedLogo.value = [logo];
    }
  },
  { immediate: true }
);

const hasError = computed(() => Boolean(navError.value));

// Apply global head from manifest
useHead(() => ({
  title: siteTitle.value || undefined,
  titleTemplate: siteTitle.value ? `%s | ${siteTitle.value}` : undefined,
  meta: siteDescription.value ? [
    { name: 'description', content: siteDescription.value },
  ] : [],
  link: favicon.value ? [
    { rel: 'icon', href: favicon.value },
  ] : [],
}));

// Development logging
if (process.dev) {
  watch(
    () => ({ nav: navigation?.value, manifest: siteManifest?.value }),
    ({ nav, manifest }) => {
      console.info('[Layout] Navigation data:', nav);
      console.info('[Layout] Site manifest:', manifest);
    },
    { immediate: true }
  );
}
</script>

<template>
  <article class="layout-article">
    <!-- Error State -->
    <div v-if="hasError" class="error-message">
      <p>Произошла ошибка при загрузке данных</p>
      <button @click="$router.go(0)" class="retry-button">
        Попробовать снова
      </button>
    </div>

    <!-- Main Layout (всегда рендерим slot, Header/Footer — реактивно) -->
    <template v-else>
      <!-- Theme Header Component -->
      <ThemeHeader
        v-if="navigation"
        :data="navigation"
        :site-manifest="siteManifest"
        :logo-image="logoImage"
        :offers="pageOffers"
      />

      <!-- Page Content -->
      <slot />

      <!-- Theme Footer Component -->
      <ThemeFooter
        v-if="navigation"
        :data="navigation"
        :site-manifest="siteManifest"
        :offers="pageOffers"
      />
    </template>

    <!-- Background Ornament -->
    <div class="layout-ornament" />
  </article>
</template>

<style lang="scss" scoped>
/*
  Parimatch Theme Layout Styles
  Используем Design Tokens и theme-specific стили
*/

.layout-article {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden; // запрещаем горизонтальный скролл на любом устройстве

  /* Theme background */
  background: var(--background-primary, #000000);
  color: var(--text-primary, #C8C3C7);

  /* Сброс отступов у main — Hero должен прилегать к хедеру */
  > main {
    margin: 0;
    padding: 0;
  }

  /* Typography */
  font-family: var(--font-primary, 'ParimatchSans', sans-serif);
  font-weight: 400;
  font-size: 1.125rem; /* 18px */
  line-height: 130%;
}

/* Error State */
.error-message {
  @apply flex flex-col items-center justify-center;
  @apply min-h-screen p-8 text-center;

  color: var(--text-primary, #C8C3C7);

  p {
    @apply mb-4 text-lg;
  }
}

.retry-button {
  @apply px-6 py-3 rounded-lg font-medium transition-colors;

  background: var(--primary, #F8FF13);
  color: var(--text-inverse, #000000);

  &:hover {
    background: var(--state-hover, #FFE500);
  }
}

/* Loading State */
.loading-message {
  @apply flex items-center justify-center;
  @apply min-h-screen text-center;

  color: var(--text-primary, #C8C3C7);

  p {
    @apply text-lg;
  }
}

/* Background Ornament */
.layout-ornament {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;

  background-image: url("/ornament.svg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;

  /* Subtle opacity to not interfere with content */
  opacity: 0.1;
}

/* Responsive adjustments */
@media (max-width: 541px) {
  .layout-article {
    font-size: 1rem; /* 16px on mobile */
  }

  .error-message,
  .loading-message {
    @apply p-4;

    p {
      @apply text-base;
    }
  }
}

/* Dark mode support (if enabled in theme) */
@media (prefers-color-scheme: dark) {
  .layout-ornament {
    opacity: 0.05; /* Even more subtle in dark mode */
  }
}

/* High contrast mode */
@media (prefers-contrast: more) {
  .layout-ornament {
    display: none; /* Hide ornament for better contrast */
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .retry-button {
    transition: none;
  }
}

/* Print styles */
@media print {
  .layout-ornament {
    display: none;
  }

  .error-message,
  .loading-message {
    display: none;
  }
}
</style>
