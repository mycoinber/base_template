<script setup>
import { computed } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: () => ({}),
    },
});

const explicitOfferId = computed(() => props.data?.offerId || props.data?.offer?._id || props.data?.offer?.id)
const globalOfferId = useState('currentOfferId', () => null)
const offerId = computed(() => explicitOfferId.value || (!props.data?.link ? globalOfferId.value : null))
const { openOffer } = useOfferNavigation(offerId)
const resolvedLink = computed(() => props.data?.link || '')
const isOfferAction = computed(() => Boolean(offerId.value))
</script>

<template>
    <button v-if="isOfferAction" type="button" class="font-font-02 text-base font-medium text-color-white text-center uppercase w-fit min-w-32 px-6 py-4 rounded-[0.4rem] relative z-10 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-color-02 before:z-[-1] before:transition-[filter] before:duration-300 hover:before:brightness-[0.7]" @click="openOffer(null, data.target || '_blank')">
        {{ data.title }}
    </button>
    <NuxtLink v-else-if="resolvedLink" :to="resolvedLink" class="font-font-02 text-base font-medium text-color-white text-center uppercase w-fit min-w-32 px-6 py-4 rounded-[0.4rem] relative z-10 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-color-02 before:z-[-1] before:transition-[filter] before:duration-300 hover:before:brightness-[0.7]" :target="data.target || '_self'" :rel="data.rel || ''">
        {{ data.title }}
    </NuxtLink>
    <button v-else type="button" class="font-font-02 text-base font-medium text-color-white text-center uppercase w-fit min-w-32 px-6 py-4 rounded-[0.4rem] relative z-10 overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-color-02 before:z-[-1] before:transition-[filter] before:duration-300 hover:before:brightness-[0.7]">
        {{ data.title }}
    </button>
</template>
