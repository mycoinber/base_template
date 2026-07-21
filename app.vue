<template>
  <NuxtLayout :name="layoutName">
    <Analytics v-if="enableAnalytics" />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt';

const {
  public: { vercelAnalytics },
} = useRuntimeConfig();
const enableAnalytics = Boolean(vercelAnalytics);
const layoutName = computed(() => String(useRuntimeConfig().public.offerLayoutName || "default"));
</script>
