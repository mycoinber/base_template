<!--
  Parimatch Theme - FAQ Section Component
-->

<script setup lang="ts">
interface Props {
  block: any;
  page?: any;
  isBot?: boolean;
  isLoaded?: boolean;
}

const props = defineProps<Props>();

const faqs = computed(() => props.block?.faqs || []);
</script>

<template>
  <section class="my-8 max-[541px]:my-4">
    <div class="container">
      <div v-if="block?.H2" class="mb-6 text-center">
        <h2 :id="block._id" class="text-2xl font-semibold">{{ block.H2 }}</h2>
      </div>

      <div v-if="faqs.length" class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="faq._id"
          class="border border-border rounded-lg p-4 bg-background-02"
        >
          <h3 class="font-semibold mb-2">{{ faq.question }}</h3>
          <div v-html="faq.answer" class="text-sm opacity-90"></div>
        </div>
      </div>

      <div v-else-if="block?.content" v-html="block.content" class="prose"></div>
    </div>
  </section>
</template>
