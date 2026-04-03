<!--
  Parimatch Theme - Table Of Content Component
  Стилизованная версия с использованием HeadlessAccordion из Core
-->

<script setup lang="ts">
import HeadlessAccordion from '@/core/components/HeadlessAccordion.vue';
import type { PageData, ArticleBlock, ArticleBlockType } from '@/core/types/page';

// ============================================================================
// Props & Types
// ============================================================================

interface Props {
  data: PageData | null;
}

interface TocItem {
  id: string;
  title: string;
  content: string;
  type: ArticleBlockType;
  order: number;
  hasContent: boolean;
}

const props = defineProps<Props>();

// ============================================================================
// Computed Properties
// ============================================================================

const blocks = computed((): ArticleBlock[] => {
  return props.data?.article?.blocks || [];
});

const items = computed((): TocItem[] => {
  if (!blocks.value.length) return [];

  return blocks.value
    .filter((block: ArticleBlock) => block.H2 || block.headline)
    .map((block: ArticleBlock, index: number) => ({
      id: block._id,
      title: block.H2 || block.headline || `Section ${index + 1}`,
      content: block.content || '',
      type: block.type,
      order: block.order ?? index,
      hasContent: Boolean(block.content?.trim()),
    }))
    .sort((a, b) => a.order - b.order);
});

const hasItems = computed(() => items.value.length > 0);

const totalSections = computed(() => items.value.length);

// Плавный скролл к секции по id
function scrollToSection(id: string, toggle: (id: string) => void) {
  // Закрываем TOC
  toggle(items.value[0]?.id);

  nextTick(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 80; // отступ для фиксированного хедера
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
}
</script>

<template>
  <section v-if="hasItems" class="theme-toc">
    <div class="container">
      <HeadlessAccordion
        :items="items"
        :allow-multiple="false"
        :collapsible="true"
        v-slot="{ isOpen, toggle }"
      >
        <nav class="toc-nav">
          <div class="toc-header" @click="() => toggle(items[0]?.id)">
            <span class="toc-title">
              {{ $t('table_of_content') }}
            </span>
            <span class="toc-icon" :class="{ 'is-open': isOpen(items[0]?.id) }">
              <img src="/icon/plus.svg" alt="toggle" class="toc-icon-svg" />
            </span>
          </div>

          <div class="toc-content" :class="{ 'is-open': isOpen(items[0]?.id) }">
            <ul class="toc-list" itemscope itemtype="https://schema.org/ItemList">
            <li
              v-for="(item, index) in items"
              :key="item.id"
              class="toc-item"
              :class="{
                'toc-item--has-content': item.hasContent,
                [`toc-item--${item.type}`]: item.type
              }"
              itemprop="itemListElement"
              itemscope
              itemtype="https://schema.org/ListItem"
            >
              <span class="toc-number">{{ index + 1 }}.</span>
              <a
                :href="'#' + item.id"
                class="toc-link"
                itemprop="url"
                :title="item.title"
                @click.prevent="scrollToSection(item.id, toggle)"
              >
                <meta itemprop="position" :content="String(index + 1)" />
                <span itemprop="name">{{ item.title }}</span>
                <span v-if="item.type !== 'default' && item.type !== 'h2'" class="toc-type-badge">
                  {{ item.type }}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      </HeadlessAccordion>
    </div>
  </section>
</template>

<style lang="scss">
.theme-toc {
  margin-top: 2rem;
  margin-bottom: 2rem;

  .toc-nav {
    width: 100%;
    overflow: hidden;
  }

  // Жёлтая полоска — Desktop: h=65px, Mobile: h=49px
  .toc-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
    flex-shrink: 0;
    background: var(--primary, #F8FF13);
    transition: opacity 0.2s ease;

    /* Desktop @ 1440px: высота 65px, отступы 24px */
    height: 65px;
    padding: 0 24px;

    &:hover {
      opacity: 0.92;
    }
  }

  // "Table of Content" — 14px, bold, uppercase, black
  .toc-title {
    display: flex;
    align-items: center;
    font-family: 'Parimatch Sans', sans-serif;
    font-weight: 700;
    font-size: 14px;
    line-height: 17px;
    text-transform: uppercase;
    color: #000000;
    white-space: nowrap;
  }

  // Иконка plus.svg — 17x17px
  .toc-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    transition: transform 0.3s ease;

    &.is-open {
      transform: rotate(45deg);
    }
  }

  .toc-icon-svg {
    width: 17px;
    height: 17px;
    object-fit: cover;
    display: block;
  }

  // Выпадающий список
  .toc-content {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transition: max-height 0.35s ease, opacity 0.3s ease;
    background: var(--background-secondary, #2d3345);

    &.is-open {
      max-height: 40rem;
      opacity: 1;
    }
  }

  .toc-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    list-style: none;
    margin: 0;
    padding: 1rem 1.5rem;
  }

  .toc-item {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    font-family: 'Parimatch Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--text-primary, #C8C3C7);
    transition: color 0.2s ease;

    &:hover {
      color: var(--primary, #F8FF13);
    }
  }

  .toc-number {
    flex-shrink: 0;
    font-size: 0.875rem;
    opacity: 0.6;
    color: inherit;
  }

  .toc-link {
    color: inherit;
    text-decoration: none;
    font-size: 0.875rem;
    line-height: 1.4;

    &:hover {
      color: inherit;
    }
  }

  .toc-type-badge {
    font-size: 0.6rem;
    opacity: 0.6;
    margin-left: 0.5rem;
    padding: 0.1rem 0.25rem;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.1);
    text-transform: uppercase;
    font-weight: 600;
  }

  // Мобильная адаптация
  @media (max-width: 640px) {
    .toc-header {
      /* Mobile: высота 49px, отступы 16px */
      height: 49px;
      padding: 0 16px;
    }

    .toc-list {
      padding: 0.75rem 1rem;
    }

    .toc-title {
      font-size: 14px; /* остаётся 14px */
    }
  }
}
</style>
