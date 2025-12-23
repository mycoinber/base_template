<script setup>
const props = defineProps({
  block: {
    type: Object,
    default: () => ({}),
  },
});

const placeholderAvatar = '/avatar-placeholder.svg';

const resolveAvatar = (review) => {
  if (Array.isArray(review?.author?.picture) && review.author.picture.length) {
    return review.author.picture[0].path;
  }
  if (review?.authorAvatarMedia?.path) {
    return review.authorAvatarMedia.path;
  }
  if (review?.authorAvatar?.path) {
    return review.authorAvatar.path;
  }
  return placeholderAvatar;
};

const formatDate = (raw) => {
  if (!raw) return '';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return '';
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
};
</script>

<template>
  <section :id="block._id" v-if="block?.reviews?.length" class="my-8 max-[541px]:my-4">
    <div class="container">
      <div class="flex flex-col gap-4 overflow-hidden max-[541px]:gap-0">
        <h2>{{ block?.headline || block?.H2 }}</h2>
        <div class="grid grid-cols-4 gap-8 max-[541px]:flex max-[541px]:gap-4 max-[541px]:min-w-full max-[541px]:w-full max-[541px]:overflow-y-hidden max-[541px]:overflow-x-scroll max-[541px]:py-4">
          <div
            v-for="(review, index) in block?.reviews"
            :key="review._id || index"
            class="flex flex-col gap-2 p-4 rounded-[0.625rem] bg-background-02 w-full max-[541px]:w-80 max-[541px]:min-w-80"
            style="border: 1px solid var(--border);"
            itemscope
            itemtype="http://schema.org/Review"
          >
            <div class="flex gap-4">
              <div class="w-20 h-20 rounded-full overflow-hidden" style="border: 1px solid var(--border);">
                <NuxtImg
                  :src="resolveAvatar(review)"
                  alt="author"
                  itemprop="image"
                  class="w-full h-full object-cover"
                />
              </div>

              <div class="flex flex-col flex-1">
                <span class="text-sm opacity-50 w-full text-right" itemprop="datePublished">
                  {{ formatDate(review.date) }}
                </span>

                <span class="font-font-02 text-[1.35rem] font-bold" itemprop="author">
                  {{ review.authorBio || review.name }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-1" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">
              <Icon name="material-symbols:star-rounded" style="color: #ffb800" />
              <span class="text-sm" itemprop="ratingValue"> {{ review.rating }}/5 </span>
            </div>

            <div
              class="text-sm opacity-50"
              itemprop="reviewBody"
              v-html="review.comment || review.content"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
