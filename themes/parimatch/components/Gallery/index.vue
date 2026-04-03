<!--
  Parimatch Theme - Gallery Component
  Рендерит карточки офферов с placement === 'gallery'
  Desktop @ 1440px: карточки в grid
  Mobile: горизонтальная прокрутка
-->

<script setup lang="ts">
import { resolveMediaPath } from '@/utils/mediaPath';
import type { PageData, PageOffer } from '@/core/types/page';

interface Props {
  data: PageData | null;
}

const props = defineProps<Props>();

const galleryOffers = computed((): PageOffer[] => {
  return (props.data?.offers ?? []).filter(
    (item) => item.placement === 'gallery' && item.data?.state !== 'inactive',
  );
});

const hasGallery = computed(() => galleryOffers.value.length > 0);

const getImageSrc = (offer: PageOffer): string => {
  return resolveMediaPath(offer.data?.imageMedia?.path ?? null);
};
</script>

<template>
  <section v-if="hasGallery" class="gallery-section">
    <!-- Убираем .container на мобилке — скролл на всю ширину экрана -->
    <div class="gallery-scroll">

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
  background: #c8c3c7;

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
  color: #000;
  font-family: 'Parimatch Sans', sans-serif;
  background: #c8c3c7;
}

.gallery-card__title {
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--bg-primary);
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
  background: #6c00e7;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #fff;
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
