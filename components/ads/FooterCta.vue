<script setup>
import { computed } from "vue";

const props = defineProps({
  offers: {
    type: Array,
    default: () => [],
  },
});

const storedFooterOfferData = useState("currentFooterOfferData", () => null);

const footerOffer = computed(() => {
  const offers = Array.isArray(props.offers) ? props.offers : [];
  return offers.find((entry) => entry?.placement === "footer") || null;
});

const footerOfferData = computed(() => footerOffer.value?.data || storedFooterOfferData.value || {});

const footerOfferId = computed(() =>
  footerOffer.value?.offer || footerOfferData.value?.id || footerOfferData.value?._id || "",
);
const { openOffer } = useOfferNavigation(footerOfferId);

const footerPrimaryLabel = computed(() => {
  const data = footerOfferData.value || {};
  if (typeof data.ctaText === "string" && data.ctaText.trim()) {
    return data.ctaText.trim();
  }
  return "";
});

const footerOfferEnabled = computed(() =>
  Boolean(footerOfferId.value && footerPrimaryLabel.value),
);
</script>

<template>
  <button
    v-if="footerOfferEnabled"
    type="button"
    class="font-font-02 inline-flex w-full items-center justify-center rounded-[0.4rem] bg-color-01 px-6 py-4 text-base font-medium uppercase text-color-white no-underline transition-[filter] duration-300 hover:brightness-[0.7]"
    @click="openOffer()"
  >
    {{ footerPrimaryLabel }}
  </button>
</template>
