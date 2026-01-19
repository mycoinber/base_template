<script setup>
import { computed } from 'vue'

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
})

const data = computed(() => props.offer?.data || {})
const image = computed(() => data.value.imageMedia || data.value.image || null)
const title = computed(() => data.value.title || data.value.label || '')
const description = computed(() => data.value.description || '')
const link = computed(() => data.value.link || '#')
const buttonText = computed(() => {
  if (typeof data.value.ctaText === 'string' && data.value.ctaText.trim()) {
    return data.value.ctaText.trim()
  }
  return data.value.button || 'Learn more'
})
</script>

<template>
  <div
    class="grid grid-cols-1 gap-6 rounded-[0.625rem] border border-border bg-background-02 p-4 text-color-white md:grid-cols-2"
  >
    <div
      v-if="image"
      class="relative max-h-[22rem] min-h-[14rem] overflow-hidden rounded-[0.625rem] md:min-h-[20rem]"
    >
      <NuxtImg
        :src="image?.path || image"
        :alt="title || 'Offer'"
        sizes="(max-width: 768px) 100vw, 50vw"
        class="block h-full w-full object-cover"
      />
    </div>
    <div class="flex flex-col items-center justify-between text-center">
      <div class="flex flex-col gap-2">
        <h2 class="font-font-02 text-2xl font-semibold leading-tight max-[541px]:text-xl">
          {{ title }}
        </h2>
        <p v-if="description" class="text-base leading-relaxed opacity-80">
          {{ description }}
        </p>
      </div>
      <NuxtLink
        v-if="data.ctaText || data.button"
        :href="link"
        target="_blank"
        rel="noopener"
        class="font-font-02 inline-flex w-full items-center justify-center rounded-[0.4rem] bg-color-01 px-6 py-4 text-base font-medium uppercase text-color-white no-underline transition-[filter] duration-300 hover:brightness-[0.7]"
      >
        {{ buttonText }}
      </NuxtLink>
    </div>
  </div>
</template>
