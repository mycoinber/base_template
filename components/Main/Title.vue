<script setup>

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });
</script>

<template>
  <section class="my-8 max-[541px]:my-4">
    <div class="container">
      <!-- Frame 9: flex-direction: column, align-items: flex-start, gap: 32px, width: 675px -->
      <div class="flex flex-col items-center gap-8 w-full max-w-[42.188rem] mx-auto">
        <!-- Frame 35: flex-direction: column, align-items: center, gap: 32px -->
        <div class="flex flex-col items-center gap-8 w-full">
          <!-- Title: centered, pm-yellow -->
          <h1 class="text-center w-full">{{ data.article.H1 }}</h1>
          <!-- Description: centered, pm-grey color (#C8C3C7) - applied globally -->
          <div v-html="data.article.intro" class="w-full text-center"></div>
        </div>
      </div>
    </div>
  </section>
</template>

