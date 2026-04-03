<!--
  Parimatch Theme - Default Section Component
  Заглушка для всех неопознанных секций
-->

<script setup lang="ts">
interface Props {
  block: any;
  page?: any;
  isBot?: boolean;
  isLoaded?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <section class="my-8 max-[541px]:my-4">
    <div class="container">
      <div v-if="block?.H2" class="mb-6">
        <h2 :id="block._id" class="text-2xl font-semibold">{{ block.H2 }} </h2>
      </div>
      <div v-if="block?.content" v-html="block.content" class="prose"></div>
    </div>
  </section>
</template>
