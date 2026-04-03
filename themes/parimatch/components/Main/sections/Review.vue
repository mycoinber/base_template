<!--
  Parimatch Theme - Review Section Component
-->

<script setup lang="ts">
interface Props {
  block: any;
  page?: any;
  isBot?: boolean;
  isLoaded?: boolean;
}

const props = defineProps<Props>();

const reviews = computed(() => props.block?.reviews || []);
</script>

<template>
  <section class="my-8 max-[541px]:my-4">
    <div class="container">
      <div v-if="block?.H2" class="mb-6 text-center">
        <h2 :id="block._id" class="text-2xl font-semibold">{{ block.H2 }}</h2>
      </div>

      <div v-if="reviews.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="review in reviews"
          :key="review._id"
          class="border border-border rounded-lg p-4 bg-background-02"
        >
          <div class="flex items-center mb-3">
            <div v-if="review.author?.picture?.[0]" class="w-10 h-10 rounded-full mr-3 overflow-hidden">
              <NuxtImg
                :src="review.author.picture[0].path"
                :alt="review.name"
                class="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 class="font-semibold text-sm">{{ review.name }}</h4>
              <div v-if="review.rating" class="flex text-yellow-400">
                <span v-for="i in 5" :key="i">
                  {{ i <= review.rating ? '★' : '☆' }}
                </span>
              </div>
            </div>
          </div>
          <div v-html="review.comment" class="text-sm"></div>
        </div>
      </div>

      <div v-else-if="block?.content" v-html="block.content" class="prose"></div>
    </div>
  </section>
</template>
