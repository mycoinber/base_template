<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
const { t } = useI18n();

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
});

// proxy images via same-origin route to hide backend

const { offer } = useOffer(computed(() => props.data.offer?._id))

const heroSections = computed(() => {
  return offer.value?.sections?.filter(section => section.type === 'hero') || [];
});
</script>

<template>
  <div v-if="offer" class="grid grid-cols-[75%_25%] gap-8 max-[541px]:flex max-[541px]:flex-col">
    <div class="flex flex-col gap-4 p-4 border border-border rounded-[0.625rem] bg-background-02">
      <div class="flex items-center justify-between gap-4 w-full">
        <span class="font-font-02 text-2xl font-semibold uppercase whitespace-nowrap max-w-full text-ellipsis overflow-hidden m-0 p-0 max-[541px]:text-xl max-[541px]:mx-auto max-[541px]:text-center">{{ offer.label }}</span>

        <div class="flex items-center gap-4 max-[541px]:hidden">
          <span class="text-sm opacity-50">{{ offer.title }}</span>

          <GeneralButton :data="{
            link: offer.link || '',
            title: offer.button1 || t('play'),
            target: '_blank',
            rel: 'noopener noreferrer',
          }" />
        </div>
      </div>

      <div class="flex items-center justify-center w-full h-[40rem] relative rounded-[0.625rem] overflow-hidden max-[541px]:h-80">
        <div class="absolute top-0 left-0 w-full h-full">
          <NuxtImg
            v-if="data.offer?.background?.[0]?.path"
            :src="data.offer.background[0].path"
            class="w-full h-full object-cover"
          />
          <NuxtImg
            v-else
            :src="data.hero[0]?.path || ''"
            class="w-full h-full object-cover"
          />
        </div>

        <GeneralButtonThree :data="{
          link: offer.link || '',
          title: offer.button2 || t('play'),
          target: '_blank',
          rel: 'noopener noreferrer',
        }" class="w-1/4" />
      </div>
    </div>

    <div class="flex flex-col gap-[2.35rem]">
      <template v-for="section in heroSections" :key="section._id">
      <div class="flex flex-col w-full p-4 relative border border-border rounded-[0.625rem] bg-background-02">
        <div class="absolute -left-4 -top-4 w-14 h-14 rounded-full border border-border overflow-hidden max-[541px]:-left-2 max-[541px]:-top-2 max-[541px]:w-12 max-[541px]:h-12">
          <NuxtImg
            v-if="section.images?.[0]?.path"
            :src="section.images[0].path"
            :alt="section.headline"
            class="w-full h-full object-cover"
          />
          <NuxtImg v-else src="/bg.png" :alt="section.headline" class="w-full h-full object-cover" />
        </div>

        <span class="font-font-02 text-lg font-medium uppercase text-center whitespace-nowrap max-w-full text-ellipsis overflow-hidden pl-8 mb-4">{{ section.headline }}</span>

        <div class="flex flex-col items-center gap-4">
          <span class="font-font-02 text-lg font-medium leading-[120%] text-color-03 text-center uppercase pt-4 border-t border-border">{{ section.headline }}</span>

          <GeneralButton :data="{
            link: section.link || '/go',
            title: section.cta || t('bonus'),
            target: '_blank',
            rel: 'noopener noreferrer',
          }" class="w-full" />

          <div class="flex items-center gap-4">
            <span class="text-sm opacity-50 pr-2 border-r-2 border-border text-center last:border-r-0">18+</span>

            <span class="text-sm opacity-50 pr-2 border-r-2 border-border text-center last:border-r-0">{{ $t('terms_apply') }}</span>

            <span class="text-sm opacity-50 pr-2 border-r-2 border-border text-center last:border-r-0">{{ $t('play_responsibility') }}</span>
          </div>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>
