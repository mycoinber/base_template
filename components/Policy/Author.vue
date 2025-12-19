<script setup>
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

const publishedDateISO = computed(() => {
  const date = new Date(props.data.pubDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`; // 2001-05-15 19:00
});

const formattedDate = computed(() => {
  return new Date(props.data.pubDate).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
});

</script>

<template>
  <section>
    <div class="container">
      <div class="flex flex-col gap-4 p-4 rounded-[0.625rem] bg-background-02 max-[541px]:flex-col max-[541px]:gap-2" style="border: 1px solid var(--border);">
        <div class="flex gap-4 w-full max-[541px]:gap-2">
          <div class="block w-20 min-w-20 h-20 min-h-20 bg-background-02 rounded-full overflow-hidden" style="border: 1px solid var(--border);">
            <img v-for="(image, imgIndex) in data.aiauthor.images" :key="imgIndex" :src="`/media${image?.path || ''}`" :alt="image?.alt || 'author'" class="w-full h-full object-cover" />
          </div>

          <div class="flex flex-col gap-2 w-full">
            <div class="flex justify-between gap-8 w-full max-[541px]:flex-col-reverse max-[541px]:justify-start max-[541px]:gap-0">
              <h3 class="m-0 p-0">{{ data.aiauthor.name }}</h3>

              <time :datetime="publishedDateISO" class="text-sm text-right opacity-50">{{ formattedDate }}</time>
            </div>

            <div class="flex flex-col gap-2">
              <span class="font-font-02 opacity-50">{{ $t('author') }}</span>
            </div>
          </div>
        </div>

        <p class="text-sm opacity-50">{{ data.aiauthor.bio }}</p>
      </div>
    </div>
  </section>
</template>

