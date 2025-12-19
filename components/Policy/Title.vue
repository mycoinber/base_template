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
      <div>
        <h1 class="text-center">{{ data.h1 }}</h1>
      </div>
    </div>
  </section>
</template>

