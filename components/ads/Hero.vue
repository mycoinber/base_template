<script setup>
import { computed } from 'vue'

const props = defineProps({
  offer: {
    type: Object,
    required: true,
  },
});

const data = computed(() => props.offer?.data || {});
const image = computed(() => data.value.imageMedia || data.value.image || null);
const title = computed(() => data.value.title || data.value.label || '');
const description = computed(() => data.value.description || '');
const link = computed(() => data.value.link || '#');
const buttonText = computed(() => {
  if (typeof data.value.ctaText === 'string' && data.value.ctaText.trim()) {
    return data.value.ctaText.trim();
  }
  return data.value.button || 'Learn more';
});
</script>

<template>
  <div class="ad-hero">
    <div class="ad-hero__media" v-if="image">
      <NuxtImg
        :src="image?.path || image"
        :alt="title || 'Offer'"
        class="ad-hero__image"
      />
    </div>
    <div class="ad-hero__content">
      <p class="ad-hero__badge">Advertisement</p>
      <h2 class="ad-hero__title">{{ title }}</h2>
      <p v-if="description" class="ad-hero__description">{{ description }}</p>
      <NuxtLink
        v-if="data.ctaText || data.button"
        :href="link"
        target="_blank"
        rel="noopener"
        class="ad-hero__cta"
      >
        {{ buttonText }}
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.ad-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.75rem;
  border: 1px solid var(--border, rgba(148, 163, 184, 0.3));
  border-radius: 1rem;
  background: radial-gradient(circle at top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.6));
  color: white;
}

.ad-hero__media {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  min-height: 320px;
}

.ad-hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.ad-hero__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ad-hero__badge {
  font-size: 0.85rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
}

.ad-hero__title {
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 700;
  margin: 0;
}

.ad-hero__description {
  font-size: 1rem;
  line-height: 1.5;
  opacity: 0.85;
}

.ad-hero__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  background: white;
  color: #0f172a;
  text-decoration: none;
  transition: transform 0.15s ease;
}

.ad-hero__cta:hover {
  transform: translateY(-1px);
}
</style>
