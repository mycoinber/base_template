<!--
  Parimatch Theme - Title Component
  Дизайн как Heading.vue (без фото), текст по центру
-->

<script setup lang="ts">
import type { PageData } from '@/core/types/page';

interface Props {
  data: PageData | null;
}

const props = defineProps<Props>();
</script>

<template>
  <section class="heading-section title-section">
    <div class="container">
      <div class="heading-wrapper no-image title-centered">
        <div class="heading-content">
          <div class="heading-text">
            <!-- H1 — жёлтый, uppercase, 50px, по центру -->
            <h1 v-if="data?.article?.H1" class="heading-title">
              {{ data.article.H1 }}
            </h1>
            <!-- Intro/description — серый, 18px, по центру -->
            <div
              v-if="data?.article?.intro"
              v-html="data.article.intro"
              class="heading-description title-description"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
/* Title-специфичные переопределения поверх стилей Heading */

.title-section {
  /* Контент по центру */
  .heading-wrapper.no-image {
    justify-content: center;
    align-items: center;
  }

  .heading-content {
    max-width: 675px;
    width: 100%;
  }

  .heading-text {
    align-items: center;
  }

  .heading-title {
    text-align: center !important;
    width: 100%;
  }
}

/* Текст description по центру */
.title-description {
  text-align: center !important;

  p, li {
    text-align: center !important;
  }
}
</style>
