<!--
  Parimatch Theme - Article Layout
  Специализированный layout для страниц со статьями
  Наследует функциональность от default layout
-->

<script setup lang="ts">
import { useNavigation, useSiteManifest } from '@/core/composables';
import type { ArticleImage } from '@/core/types/page';

// ============================================================================
// Site Data
// ============================================================================

// Используем Core navigation composable
const { navigation, isLoading: navLoading, error: navError } = await useNavigation();

// Используем Core site manifest composable
const {
  data: siteManifest,
  isLoading: manifestLoading,
  error: manifestError,
  favicon,
  logoImage,
  title: siteTitle,
  description: siteDescription,
} = await useSiteManifest();

// Shared logo state (legacy support for components that use useState)
const sharedLogo = useState<ArticleImage[]>("siteLogo", () => []);

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

const hasError = computed(() => Boolean(navError.value || manifestError.value));
const isLoading = computed(() => navLoading.value || manifestLoading.value);

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
    () => ({ nav: navigation.value, manifest: siteManifest.value }),
    ({ nav, manifest }) => {
      console.info('[ArticleLayout] Navigation data:', nav);
      console.info('[ArticleLayout] Site manifest:', manifest);
    },
    { immediate: true }
  );
}
</script>

<template>
  <article class="layout-article layout-article--article-page">
    <!-- Error State -->
    <div v-if="hasError" class="error-message">
      <p>Произошла ошибка при загрузке данных</p>
      <button @click="$router.go(0)" class="retry-button">
        Попробовать снова
      </button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-message">
      <p>Загрузка...</p>
    </div>

    <!-- Main Layout -->
    <template v-else>
      <!-- Theme Header Component -->
      <ThemeHeader
        v-if="navigation"
        :data="navigation"
        :site-manifest="siteManifest"
        :logo-image="logoImage"
      />

      <!-- Article Content Wrapper -->
      <main class="article-main">
        <slot />
      </main>

      <!-- Theme Footer Component -->
      <ThemeFooter
        v-if="navigation"
        :data="navigation"
        :site-manifest="siteManifest"
      />
    </template>
  </article>
</template>

<style lang="scss" scoped>
.layout-article {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-primary, #000000);
  color: var(--text-primary, #C8C3C7);

  &--article-page {
    // Article-specific layout styles
  }
}

.article-main {
  flex: 1;
  width: 100%;
  max-width: 85.125rem; // 1362px
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 1rem;
  padding: 2rem;
  text-align: center;

  p {
    color: var(--text-primary);
  }

  .retry-button {
    background: var(--primary, #F8FF13);
    color: var(--text-inverse, #000000);
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }
}

.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;

  p {
    color: var(--text-primary);
  }
}
</style>
