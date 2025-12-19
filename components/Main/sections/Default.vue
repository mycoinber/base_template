<script setup>
const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
});
</script>

<template>
  <section :id="block._id" class="my-8 max-[541px]:my-4">
    <div class="container">
      <h2 v-if="block.headline" class="mb-4">{{ block.headline }}</h2>
      <div v-if="block.content" v-html="block.content" class="prose prose-invert" />
    </div>
  </section>
</template>
