<!--
  Parimatch Theme - Gallery Component
  Рендерит карточки офферов с placement === 'gallery'
  Desktop @ 1440px: карточки в grid
  Mobile: горизонтальная прокрутка
-->

<script setup lang="ts">
import { resolveMediaPath } from '@core/utils/mediaPath';
import type { PageData, PageOffer } from '@/core/types/page';

interface Props {
  data: PageData | null;
}

const props = defineProps<Props>();
const galleryScrollRef = ref<HTMLElement | null>(null);
const isCarousel = ref(false);

const DESKTOP_CARD_WIDTH = 332;
const DESKTOP_GAP = 16;
const DESKTOP_CONTAINER_RATIO = 0.8;
const DESKTOP_CONTAINER_HORIZONTAL_PADDING = 32;

const galleryOffers = computed((): PageOffer[] => {
  return (props.data?.offers ?? []).filter(
    (item) => item.placement === 'gallery' && item.data?.state !== 'inactive',
  );
});

const hasGallery = computed(() => galleryOffers.value.length > 0);

const getImageSrc = (offer: PageOffer): string => {
  return resolveMediaPath(offer.data?.imageMedia?.path ?? null);
};

function updateLayoutMode() {
  if (!import.meta.client) return;

  if (window.innerWidth <= 640) {
    isCarousel.value = true;
    return;
  }

  const sectionWidth = galleryScrollRef.value?.parentElement?.clientWidth || window.innerWidth;
  const availableWidth = Math.max(
    0,
    (sectionWidth * DESKTOP_CONTAINER_RATIO) - DESKTOP_CONTAINER_HORIZONTAL_PADDING
  );
  const cardsCount = galleryOffers.value.length;
  const requiredWidth = cardsCount > 0
    ? (cardsCount * DESKTOP_CARD_WIDTH) + ((cardsCount - 1) * DESKTOP_GAP)
    : 0;

  isCarousel.value = requiredWidth > availableWidth;
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  nextTick(() => {
    updateLayoutMode();

    if (galleryScrollRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateLayoutMode());
      resizeObserver.observe(galleryScrollRef.value);
    }

    window.addEventListener('resize', updateLayoutMode);
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener('resize', updateLayoutMode);
});

watch(() => galleryOffers.value.length, () => nextTick(updateLayoutMode));
</script>

<template>
  <section v-if="hasGallery" class="gallery-section">
    <!-- Убираем .container на мобилке — скролл на всю ширину экрана -->
    <div
      ref="galleryScrollRef"
      class="gallery-scroll"
      :class="{ 'is-carousel': isCarousel }"
    >

      <!-- Карточка оффера -->
      <div
        v-for="item in galleryOffers"
        :key="item.offer"
        class="gallery-card"
      >
        <!-- Картинка — адаптивная высота под фото -->
        <div class="gallery-card__image">
          <img
            v-if="getImageSrc(item)"
            :src="getImageSrc(item)"
            :alt="item.data?.title || ''"
            loading="lazy"
          />
        </div>

        <!-- Инфо-блок — показываем только если есть хоть что-то -->
        <div v-if="item.data?.title || item.data?.description" class="gallery-card__info">
          <span v-if="item.data?.title" class="gallery-card__title">
            {{ item.data.title }}
          </span>
          <p v-if="item.data?.description" class="gallery-card__desc">
            {{ item.data.description }}
          </p>
        </div>

        <!-- Щель 4px — видно фон страницы -->
        <div class="gallery-card__gap"></div>

        <!-- CTA-кнопка — визуально отделена от инфо-блока -->
        <a
          :href="item.data?.link || '#'"
          target="_blank"
          rel="noopener noreferrer"
          class="gallery-card__cta"
        >
          <span>{{ item.data?.ctaText || 'Play Now' }}</span>
        </a>
      </div>

    </div>
  </section>
</template>

<style lang="scss">
/* ==========================================================================
   Gallery — карточки офферов
   ========================================================================== */

.gallery-section {
  margin: 2rem 0;
}

/* Desktop: grid по центру, ширина контейнера (80%).
   Mobile: горизонтальный скролл на всю ширину экрана */
.gallery-scroll {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  /* Desktop: ограничиваем как container */
  width: 80%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;

  &.is-carousel {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    justify-content: flex-start;
    padding: 0 16px 8px 16px;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  @media (max-width: 640px) {
    width: 100%;
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    gap: 12px;
    justify-content: flex-start;
    padding: 0 16px 8px 16px;

    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

/* Карточка — адаптивная ширина */
.gallery-card {
  width: 332px;
  display: flex;
  flex-direction: column;
  overflow: visible; /* чтобы gap-щель показывала фон страницы */
  flex-shrink: 0;
  scroll-snap-align: start;

  @media (max-width: 640px) {
    width: 324px;
    min-width: 324px;
  }
}

/* Картинка — натуральная высота, фото не обрезается */
.gallery-card__image {
  width: 100%;
  overflow: hidden;
  background: var(--text-primary, #C8C3C7);

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

/* Инфо-блок */
.gallery-card__info {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--text-inverse, #000000);
  font-family: 'Parimatch Sans', sans-serif;
  background: var(--text-primary, #C8C3C7);
}

.gallery-card__title {
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--background-primary, #000000);
}

.gallery-card__desc {
  font-weight: 500;
  font-size: 12px;
  line-height: 1.3;
  color: var(--text-inverse);
  opacity: 0.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Щель 4px — прозрачная, показывает фон страницы */
.gallery-card__gap {
  height: 4px;
  width: 100%;
  flex-shrink: 0;
  /* прозрачный — фон страницы просвечивает */
  background: transparent;
}

/* CTA-кнопка — визуально отделена от карточки */
.gallery-card__cta {
  width: 100%;
  height: 48px;
  background: var(--accent, #2b8ef9);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--text-contrast, #ffffff);
  flex-shrink: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  span {
    font-family: 'Parimatch Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
}
</style>
