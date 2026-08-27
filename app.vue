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
// The offer layer is always compiled into a site revision. Whether it is
// rendered depends on the live referral selection returned by Frontback.
const offerLayoutActive = useState<boolean>("fastgenOfferLayoutActive", () => false);
const layoutName = computed(() => {
  const configured = String(useRuntimeConfig().public.offerLayoutName || "").trim();
  return offerLayoutActive.value && configured ? configured : "default";
});
</script>
