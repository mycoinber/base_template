<script setup>

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  });

</script>

<template>
  <section v-if="data?.reviews?.data.length" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div class="flex flex-col gap-8 overflow-hidden max-[541px]:gap-0">
        <h2 v-if="data.reviews?.headline" class="text-2xl font-bold mb-4">
          {{ data.reviews?.headline }}
        </h2>

        <div class="grid grid-cols-4 gap-8 max-[541px]:flex max-[541px]:gap-4 max-[541px]:min-w-full max-[541px]:w-full max-[541px]:overflow-y-hidden max-[541px]:overflow-x-scroll max-[541px]:pb-4">
          <div
            v-for="(review, index) in data?.reviews?.data"
            :key="index"
            class="flex flex-col gap-2 p-4 rounded-[0.625rem] bg-background-02 w-full max-[541px]:w-80 max-[541px]:min-w-80"
            style="border: 1px solid var(--border);"
            itemscope
            itemtype="http://schema.org/Review"
          >
            <div class="flex gap-4">
              <div class="w-20 h-20 rounded-full overflow-hidden" style="border: 1px solid var(--border);">
                <img
                  v-for="(image, imgIndex) in review.images"
                  :key="imgIndex"
                  :src="`/media${image?.path || ''}`"
                  :alt="image?.alt || 'review'"
                  itemprop="image"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="flex flex-col flex-1">
                <span class="text-sm opacity-50 w-full text-right" itemprop="datePublished">
                  {{ new Date(review.date).toLocaleDateString("ru-RU") }}
                </span>

                <span class="font-font-02 text-[1.35rem] font-bold" itemprop="author">
                  {{ review.name }}
                </span>
              </div>
            </div>

            <div
              class="flex items-center gap-1"
              itemprop="reviewRating"
              itemscope
              itemtype="http://schema.org/Rating"
            >
              <Icon
                name="material-symbols:star-rounded"
                style="color: #ffb800"
              />
              <span class="text-sm" itemprop="ratingValue"> {{ review.rating }}/5 </span>
            </div>

            <p class="text-sm opacity-50" itemprop="reviewBody">
              {{ review.review }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

