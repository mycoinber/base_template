<!--
  Parimatch Theme - Loader Component
-->

<script setup lang="ts">
// No props needed for loader
</script>

<template>
  <div class="loader-container">
    <div class="spinner"></div>
    <p class="loader-text">Loading...</p>
  </div>
</template>

<style scoped>
.loader-container {
  @apply flex flex-col items-center justify-center;
  @apply min-h-[50vh];
}

.spinner {
  @apply w-12 h-12 border-4 border-transparent rounded-full animate-spin;
  border-color: var(--primary, #F8FF13);
  border-right-color: transparent;
}

.loader-text {
  @apply mt-4 text-lg;
  color: var(--text-primary, #C8C3C7);
}
</style>
