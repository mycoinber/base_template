<!--
  Parimatch Theme - Hero Component
  Данные берутся из offers с placement: "hero"
  Layout: 50% текст (слева) + 50% картинка (справа)
  Если hero-офферов несколько — чередуем при перезагрузке
-->

<script setup lang="ts">
import { resolveMediaPath } from '@core/utils/mediaPath';
import type { PageData, PageOffer } from '@/core/types/page';

interface Props {
  data: PageData | null;
}

const props = defineProps<Props>();

// Фильтруем офферы с placement: "hero"
const heroOffers = computed((): PageOffer[] => {
  return (props.data?.offers ?? []).filter(
    (item) => item.placement === 'hero' && item.data && item.data.state !== 'inactive',
  );
});

// Если несколько hero-офферов — выбираем случайный при загрузке страницы
const randomIndex = Math.floor(Math.random() * Math.max(heroOffers.value.length, 1));

const activeOffer = computed(() => {
  if (!heroOffers.value.length) return null;
  return heroOffers.value[randomIndex % heroOffers.value.length];
});

const hasHero = computed(() => Boolean(activeOffer.value));

const heroImage = computed(() => {
  const path = activeOffer.value?.data?.imageMedia?.path;
  return path ? resolveMediaPath(path) : '';
});

const heroAlt = computed(() => {
  return activeOffer.value?.data?.imageMedia?.alt
    || activeOffer.value?.data?.title
    || 'hero';
});

const heroTitle = computed(() => activeOffer.value?.data?.title || '');
const heroCtaText = computed(() => activeOffer.value?.data?.ctaText || '');
const heroCtaLink = computed(() => activeOffer.value?.data?.link || '');
const heroDescription = computed(() => activeOffer.value?.data?.description || '');

// Env colors
const config = useRuntimeConfig();
const pmGrey = computed(() => String(config.public.pmGrey || '#C8C3C7'));
</script>

<template>
  <section v-if="hasHero" class="hero-section">
    <div class="hero-wrapper">

      <!-- Левая часть 50% — текст -->
      <div class="hero-text">
        <!-- Title по центру -->
        <h2 v-if="heroTitle" class="hero-title">
          {{ heroTitle }}
        </h2>

        <!-- CTA кнопка — 32px под title -->
        <ThemeButton
          v-if="heroCtaText && heroCtaLink"
          variant="tertiary"
          size="md"
          :data="{ link: heroCtaLink, title: heroCtaText, target: '_blank', rel: 'noopener noreferrer' }"
          class="hero-cta"
        />

        <!-- Description — 155px ниже кнопки -->
        <p v-if="heroDescription" class="hero-description" :style="{ color: pmGrey }">
          {{ heroDescription }}
        </p>
      </div>

      <!-- Правая часть 50% — картинка -->
      <div class="hero-image">
        <NuxtImg
          v-if="heroImage"
          :src="heroImage"
          :alt="heroAlt"
          class="hero-image__img"
          loading="eager"
        />
      </div>

    </div>
  </section>
</template>

<style lang="scss">
/* ==========================================================================
   Hero Section — 50/50 layout: текст слева, картинка справа
   ========================================================================== */

.hero-section {
  width: 100%;
  margin: 0;
}

.hero-wrapper {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 400px;

  @media (max-width: 768px) {
    flex-direction: column;
    min-height: auto;
  }
}

/* Левая часть — текст */
.hero-text {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 32px;
  padding: 48px 40px;
  box-sizing: border-box;
  text-align: left;

  @media (max-width: 768px) {
    width: 100%;
    padding: 32px 16px;
  }
}

/* Title — дизайн: 107px, grey, uppercase, letter-spacing -2% */
.hero-title {
  font-family: 'Parimatch Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(36px, 7.43vw, 107px);
  line-height: 80%;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  text-align: left;
  color: var(--pm-grey, #c8c3c7);
  margin: 0;
  font-feature-settings: 'pnum' on, 'lnum' on;
}

/* CTA кнопка — gap 32px задан на контейнере */
.hero-cta {
  margin: 0;
}

/* Description */
.hero-description {
  margin: 0;
  max-width: 405px;
  font-family: 'Parimatch Sans', sans-serif;
  font-size: 18px;
  line-height: 130%;
  font-weight: 500;
  text-align: left;

  @media (max-width: 768px) {
    max-width: 100%;
  }
}

/* Правая часть — картинка */
.hero-image {
  width: 50%;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
    min-height: 250px;
  }
}

.hero-image__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
