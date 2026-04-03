# 🏗️ Frontend Architecture for PBN Template System

## Обзор архитектуры

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   THEME LAYER   │  │   THEME LAYER   │  │    THEME LAYER      │  │
│  │   (Parimatch)   │  │   (Minimal)     │  │    (Corporate)      │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                      │             │
│           └────────────────────┼──────────────────────┘             │
│                                │                                    │
│                    ┌───────────▼───────────┐                        │
│                    │     CORE LAYER        │                        │
│                    │  (Business Logic)     │                        │
│                    └───────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
/base_template
├── core/                          # 🔷 CORE LAYER (неизменяемый)
│   ├── composables/               # Бизнес-логика
│   │   ├── usePageData.ts         # Data fetching для страниц
│   │   ├── useOffer.ts            # Логика офферов
│   │   ├── useSiteManifest.ts     # Site manifest
│   │   ├── useSeo.ts              # SEO meta management
│   │   └── useNavigation.ts       # Навигация
│   │
│   ├── components/                # Headless UI компоненты
│   │   ├── HeadlessAccordion.vue  # Логика accordion без стилей
│   │   ├── HeadlessModal.vue      # Логика modal без стилей
│   │   ├── HeadlessDropdown.vue   # Логика dropdown без стилей
│   │   ├── HeadlessTabs.vue       # Логика tabs без стилей
│   │   └── HeadlessButton.vue     # Логика button без стилей
│   │
│   ├── types/                     # TypeScript типы
│   │   ├── page.ts                # Page data types
│   │   ├── article.ts             # Article types
│   │   ├── offer.ts               # Offer types
│   │   └── theme.ts               # Theme configuration types
│   │
│   ├── utils/                     # Утилиты
│   │   ├── headUtils.ts           # Head/Meta utilities
│   │   ├── seoUtils.ts            # SEO helpers
│   │   ├── mediaPath.ts           # Media path helpers
│   │   └── schemaOrg.ts           # Schema.org generators
│   │
│   ├── plugins/                   # Core plugins
│   │   ├── vue-query.ts           # Data fetching
│   │   ├── i18n.ts                # Internationalization
│   │   └── seo.ts                 # SEO plugin
│   │
│   ├── server/                    # Server-side logic
│   │   ├── api/                   # API routes
│   │   ├── middleware/            # Server middleware
│   │   └── utils/                 # Server utilities
│   │
│   └── stores/                    # Pinia stores
│       ├── site.ts                # Site state
│       ├── theme.ts               # Theme state
│       └── user.ts                # User preferences
│
├── themes/                        # 🎨 THEME LAYER (сменяемый)
│   ├── parimatch/                 # Тема Parimatch
│   │   ├── theme.config.ts        # Конфигурация темы
│   │   ├── tokens/                # Design tokens
│   │   │   ├── colors.ts          # Цветовые токены
│   │   │   ├── typography.ts      # Типографика
│   │   │   ├── spacing.ts         # Отступы
│   │   │   └── index.ts           # Export всех токенов
│   │   │
│   │   ├── components/            # Стилизованные компоненты
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Hero/
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   └── sections/
│   │   │
│   │   ├── layouts/               # Layouts темы
│   │   │   ├── default.vue
│   │   │   └── article.vue
│   │   │
│   │   ├── assets/                # Ресурсы темы
│   │   │   ├── scss/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   │
│   │   └── tailwind.preset.ts     # Tailwind preset для темы
│   │
│   ├── minimal/                   # Минималистичная тема
│   │   └── ... (та же структура)
│   │
│   └── corporate/                 # Корпоративная тема
│       └── ... (та же структура)
│
├── app/                           # 🚀 APPLICATION LAYER
│   ├── pages/                     # Nuxt pages (роутинг)
│   ├── layouts/                   # Layout resolver
│   ├── app.vue                    # Root component
│   └── error.vue                  # Error page
│
├── shared/                        # 📦 SHARED (между core и themes)
│   ├── constants/                 # Константы
│   ├── interfaces/                # Shared interfaces
│   └── helpers/                   # Shared helpers
│
├── nuxt.config.ts                 # Nuxt конфигурация
├── tailwind.config.ts             # Base Tailwind config
└── theme.config.ts                # Active theme selection
```

---

## 🔷 CORE LAYER

### Ответственность:
- ✅ Data fetching (usePageData, useOffer, useSiteManifest)
- ✅ Роутинг и навигация
- ✅ SEO meta management
- ✅ State management (Pinia)
- ✅ Headless UI компоненты (логика без стилей)
- ✅ Server API и middleware
- ✅ Internationalization (i18n)
- ✅ Schema.org structured data
- ✅ Performance optimization

### Принципы:
1. **Zero styling** — Core не содержит никаких стилей
2. **Dependency Inversion** — Core определяет интерфейсы, Theme реализует
3. **Slots & Composition** — Компоненты используют slots для кастомизации
4. **Event-driven** — Компоненты emit события, Theme обрабатывает

---

## 🎨 THEME LAYER

### Ответственность:
- ✅ Visual design (colors, typography, spacing)
- ✅ Layout structure
- ✅ Component styling
- ✅ Animations & transitions
- ✅ Brand-specific assets (fonts, images, icons)
- ✅ Responsive breakpoints
- ✅ Dark/Light mode variants

### Принципы:
1. **Isolated** — Тема полностью изолирована от Core
2. **Composable** — Использует Core composables и headless компоненты
3. **Token-based** — Все значения через Design Tokens
4. **Hot-swappable** — Можно менять без перезагрузки

---

## 🎯 Design Tokens System

### Структура токенов

```typescript
// themes/parimatch/tokens/colors.ts
export const colors = {
  // Semantic tokens
  primary: '#F8FF13',      // pm-yellow
  secondary: '#e00840',    // color-01
  
  // Background tokens
  background: {
    primary: '#000000',    // background-01
    secondary: '#2d3345',  // background-02
  },
  
  // Text tokens
  text: {
    primary: '#C8C3C7',    // pm-grey
    heading: '#F8FF13',    // pm-yellow
    inverse: '#000000',    // black
  },
  
  // Border tokens
  border: {
    default: '#545969',
    light: '#C8C3C7',
  },
  
  // State tokens
  state: {
    hover: '#FFE500',
    active: '#F8FF13',
    disabled: '#545969',
  }
} as const;

// themes/parimatch/tokens/typography.ts
export const typography = {
  fontFamily: {
    primary: "'ParimatchSans', sans-serif",
    heading: "'ParimatchSans', sans-serif",
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1.125rem',  // 18px
    lg: '1.25rem',     // 20px
    xl: '1.5rem',      // 24px
    '2xl': '2rem',     // 32px
    '3xl': '3.125rem', // 50px
  },
  
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  
  lineHeight: {
    tight: '80%',
    snug: '100%',
    normal: '130%',
    relaxed: '150%',
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  }
} as const;

// themes/parimatch/tokens/spacing.ts
export const spacing = {
  px: '1px',
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
} as const;
```

---

## 🔌 Подключение новой темы

### 1. Создание конфигурации темы

```typescript
// themes/minimal/theme.config.ts
import type { ThemeConfig } from '@/core/types/theme';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';

export const themeConfig: ThemeConfig = {
  name: 'minimal',
  displayName: 'Minimal Theme',
  version: '1.0.0',
  
  tokens: {
    colors,
    typography,
    spacing,
  },
  
  // Маппинг компонентов
  components: {
    Header: () => import('./components/Header/index.vue'),
    Footer: () => import('./components/Footer/index.vue'),
    Hero: () => import('./components/Hero/index.vue'),
    Button: () => import('./components/Button/index.vue'),
    // ... остальные компоненты
  },
  
  // Маппинг layouts
  layouts: {
    default: () => import('./layouts/default.vue'),
    article: () => import('./layouts/article.vue'),
  },
  
  // Tailwind preset
  tailwindPreset: './tailwind.preset.ts',
};

export default themeConfig;
```

### 2. Tailwind Preset для темы

```typescript
// themes/minimal/tailwind.preset.ts
import type { Config } from 'tailwindcss';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing } from './tokens/spacing';

export default {
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background,
        text: colors.text,
        border: colors.border,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: spacing,
    },
  },
} satisfies Partial<Config>;
```

### 3. Активация темы

```typescript
// theme.config.ts (корень проекта)
export const activeTheme = process.env.THEME || 'parimatch';

// nuxt.config.ts
import { activeTheme } from './theme.config';

export default defineNuxtConfig({
  // Динамический импорт темы
  alias: {
    '@theme': `./themes/${activeTheme}`,
  },
  
  css: [
    `./themes/${activeTheme}/assets/scss/main.scss`,
  ],
  
  // Подключение Tailwind preset темы
  tailwindcss: {
    config: {
      presets: [
        require(`./themes/${activeTheme}/tailwind.preset.ts`).default,
      ],
    },
  },
});
```

---

## 🧩 Headless Component Pattern

### Core Headless Component

```vue
<!-- core/components/HeadlessAccordion.vue -->
<script setup lang="ts">
import { ref, provide } from 'vue';

interface Props {
  defaultOpen?: boolean;
  allowMultiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  allowMultiple: false,
});

const openItems = ref<Set<string>>(new Set());

const toggle = (id: string) => {
  if (openItems.value.has(id)) {
    openItems.value.delete(id);
  } else {
    if (!props.allowMultiple) {
      openItems.value.clear();
    }
    openItems.value.add(id);
  }
};

const isOpen = (id: string) => openItems.value.has(id);

// Provide context to children
provide('accordion', { toggle, isOpen });

defineExpose({ toggle, isOpen, openItems });
</script>

<template>
  <div role="region">
    <slot :toggle="toggle" :isOpen="isOpen" :openItems="openItems" />
  </div>
</template>
```

### Theme Styled Component

```vue
<!-- themes/parimatch/components/Accordion/index.vue -->
<script setup lang="ts">
import HeadlessAccordion from '@/core/components/HeadlessAccordion.vue';
import AccordionItem from './AccordionItem.vue';

interface Props {
  items: Array<{ id: string; title: string; content: string }>;
  defaultOpen?: boolean;
}

const props = defineProps<Props>();
</script>

<template>
  <HeadlessAccordion 
    v-slot="{ toggle, isOpen }" 
    :default-open="defaultOpen"
    class="accordion"
  >
    <AccordionItem
      v-for="item in items"
      :key="item.id"
      :item="item"
      :is-open="isOpen(item.id)"
      @toggle="toggle(item.id)"
    />
  </HeadlessAccordion>
</template>

<style scoped>
.accordion {
  @apply flex flex-col gap-4;
}
</style>
```

---

## 🚀 SEO Best Practices

### 1. Meta Management

```typescript
// core/composables/useSeo.ts
export function useSeo(pageData: Ref<PageData | null>) {
  const head = computed(() => {
    if (!pageData.value) return {};
    
    const { head: pageHead, article, slug, domain } = pageData.value;
    
    return {
      title: pageHead.title,
      meta: [
        { name: 'description', content: pageHead.description },
        { name: 'keywords', content: pageHead.keywords },
        // Open Graph
        { property: 'og:title', content: pageHead.title },
        { property: 'og:description', content: pageHead.description },
        { property: 'og:image', content: article?.introImage?.[0]?.path },
        { property: 'og:url', content: `${domain}/${slug}` },
        { property: 'og:type', content: 'article' },
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: pageHead.title },
        { name: 'twitter:description', content: pageHead.description },
      ],
      link: [
        { rel: 'canonical', href: `${domain}/${slug}` },
      ],
    };
  });
  
  useHead(head);
  
  return { head };
}
```

### 2. Schema.org Generator

```typescript
// core/utils/schemaOrg.ts
export function generateArticleSchema(page: PageData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.article.H1,
    description: page.head.description,
    image: page.article.introImage?.[0]?.path,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    author: {
      '@type': 'Organization',
      name: page.siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: page.siteName,
      logo: {
        '@type': 'ImageObject',
        url: page.logo,
      },
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
```

### 3. Performance Optimization

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // SSR для SEO
  ssr: true,
  
  // Route rules для ISR
  routeRules: {
    '/**': { isr: 7200 }, // 2 hours cache
    '/api/**': { cache: { maxAge: 60 } },
  },
  
  // Experimental features
  experimental: {
    payloadExtraction: true,
    renderJsonPayloads: true,
    componentIslands: true,
  },
  
  // Image optimization
  image: {
    provider: 'ipx',
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1440,
    },
    presets: {
      hero: {
        modifiers: {
          format: 'webp',
          quality: 80,
          loading: 'eager',
        },
      },
      thumbnail: {
        modifiers: {
          format: 'webp',
          quality: 70,
          width: 400,
          loading: 'lazy',
        },
      },
    },
  },
  
  // Nitro optimization
  nitro: {
    compressPublicAssets: true,
    minify: true,
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },
});
```

---

## 📊 Core Web Vitals Optimization

### LCP (Largest Contentful Paint)

```vue
<!-- themes/parimatch/components/Hero/index.vue -->
<template>
  <section class="hero">
    <!-- Preload hero image for LCP -->
    <NuxtImg
      :src="heroImage"
      alt="Hero"
      loading="eager"
      fetchpriority="high"
      sizes="100vw"
      preload
    />
  </section>
</template>
```

### CLS (Cumulative Layout Shift)

```scss
// Предотвращение CLS через aspect-ratio
.hero-image {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

// Skeleton placeholders
.skeleton {
  @apply animate-pulse bg-background-02 rounded;
}
```

### INP (Interaction to Next Paint)

```typescript
// Lazy loading для non-critical components
const HeavyComponent = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  delay: 200,
  timeout: 3000,
});
```

---

## 🔄 Runtime Theme Switching

```typescript
// core/stores/theme.ts
import { defineStore } from 'pinia';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    activeTheme: 'parimatch',
    isDark: false,
  }),
  
  actions: {
    async setTheme(themeName: string) {
      // Динамическая загрузка токенов темы
      const { tokens } = await import(`@/themes/${themeName}/tokens`);
      
      // Применение CSS переменных
      const root = document.documentElement;
      
      Object.entries(tokens.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value as string);
      });
      
      this.activeTheme = themeName;
    },
    
    toggleDarkMode() {
      this.isDark = !this.isDark;
      document.documentElement.classList.toggle('dark', this.isDark);
    },
  },
});
```

---

## 📋 Чек-лист для новой темы

- [ ] Создать папку `themes/{theme-name}/`
- [ ] Определить Design Tokens (`tokens/`)
- [ ] Создать `theme.config.ts`
- [ ] Создать `tailwind.preset.ts`
- [ ] Реализовать все необходимые компоненты
- [ ] Создать layouts
- [ ] Добавить шрифты и ассеты
- [ ] Протестировать на мобильных устройствах
- [ ] Проверить Core Web Vitals
- [ ] Валидировать SEO meta и Schema.org

---

## 🔍 Core SEO Architecture

### Обзор

Core SEO Layer обеспечивает headless управление SEO без зависимости от визуального слоя:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           SEO LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │   Meta Tags     │  │  Structured     │  │   Analytics &       │  │
│  │   Management    │  │  Data (JSON-LD) │  │   Tracking          │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                      │             │
│           └────────────────────┼──────────────────────┘             │
│                                │                                    │
│                    ┌───────────▼───────────┐                        │
│                    │       useSeo()        │                        │
│                    │  Core Composable      │                        │
│                    └───────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Core SEO Composables

```typescript
// Основной SEO composable
import { useSeo, useGlobalSeo, useSimpleSeo } from '@/core/composables';

// В странице/компоненте:
const { 
  head,           // Computed head object
  structuredData, // Schema.org structured data
  canonicalUrl,   // Canonical URL
  pageTitle,      // Computed page title
  updateMeta,     // Update meta dynamically
  addSchema,      // Add additional schema
} = useSeo(pageData, {
  generateStructuredData: true,
  includeOpenGraph: true,
  includeTwitter: true,
  includeBreadcrumbs: true,
  includeFAQ: true,
});
```

### Structured Data (Schema.org)

Автоматическая генерация Schema.org разметки:

```typescript
// Типы Schema.org, которые генерируются автоматически:
// - Article
// - WebSite
// - BreadcrumbList
// - FAQPage
// - Organization
// - Person

// Доступные helper'ы:
import { 
  createOrganizationSchema,
  createPersonSchema,
  extractFAQsFromBlocks,
} from '@/core/composables';

// Пример создания Organization schema:
const orgSchema = createOrganizationSchema(
  'Site Name',
  'https://example.com',
  'https://example.com/logo.png'
);
```

### Global SEO State

```typescript
// Глобальное SEO состояние (app.vue):
const { 
  currentHead,        // Текущий head
  currentSchemas,     // Текущие schemas
  setHead,            // Установить head
  addGlobalSchema,    // Добавить глобальную schema
  clearGlobalSchemas, // Очистить schemas
} = useGlobalSeo();

// Добавить Organization schema для всего сайта:
addGlobalSchema(createOrganizationSchema(...));
```

### Интеграция с Theme

Theme Layer получает SEO данные из Core:

```vue
<!-- themes/parimatch/layouts/default.vue -->
<script setup lang="ts">
import { useSiteManifest, useNavigation } from '@/core/composables';

// Получаем данные для глобального SEO
const { 
  title: siteTitle, 
  description: siteDescription,
  favicon,
} = await useSiteManifest();

// Применяем глобальные head настройки
useHead(() => ({
  titleTemplate: siteTitle.value ? `%s | ${siteTitle.value}` : undefined,
  meta: siteDescription.value ? [
    { name: 'description', content: siteDescription.value },
  ] : [],
  link: favicon.value ? [
    { rel: 'icon', href: favicon.value },
  ] : [],
}));
</script>
```

### SEO Types

```typescript
// core/types/seo.ts

// Schema.org Types
interface ArticleSchema extends SchemaOrgBase { ... }
interface WebSiteSchema extends SchemaOrgBase { ... }
interface FAQPageSchema extends SchemaOrgBase { ... }
interface BreadcrumbListSchema extends SchemaOrgBase { ... }
interface OrganizationSchema extends SchemaOrgBase { ... }
interface PersonSchema extends SchemaOrgBase { ... }

// SEO Configuration
interface SeoConfig {
  title: { template?: string; separator?: string; default?: string; };
  meta: { description?: string; keywords?: string; author?: string; ... };
  openGraph: { type?: string; siteName?: string; locale?: string; ... };
  twitter: { card?: string; site?: string; creator?: string; };
  canonical?: { baseUrl: string; trailingSlash?: boolean; };
}

// Head Management
interface ComputedHead {
  title?: string;
  meta: MetaItem[];
  link: LinkItem[];
  script?: ScriptItem[];
  htmlAttrs?: Record<string, string>;
}
```

### Best Practices

1. **Всегда используйте Core SEO** — не создавайте SEO логику в Theme
2. **Structured Data** — всегда включайте Schema.org для SEO
3. **OpenGraph & Twitter** — обеспечивают social sharing
4. **Canonical URLs** — предотвращают дублирование контента
5. **Dynamic Meta** — используйте `updateMeta()` для динамических изменений

---

## 🛠️ Рекомендуемый стек

| Категория | Технология | Причина |
|-----------|------------|---------|
| Framework | **Nuxt 3** | SSR, ISR, отличный DX |
| UI | **Vue 3 Composition API** | Реактивность, composables |
| Styling | **Tailwind CSS** | Utility-first, производительность |
| State | **Pinia** | Официальный store для Vue 3 |
| Data | **@tanstack/vue-query** | Кэширование, инвалидация |
| Icons | **@nuxt/icon** | Автоматическая оптимизация |
| Images | **@nuxt/image** | Оптимизация изображений |
| SEO | **@nuxtjs/seo** | Meta, sitemap, robots |
| Schema | **nuxt-schema-org** | Structured data |
| i18n | **@nuxtjs/i18n** | Интернационализация |
| Types | **TypeScript** | Type safety |

---

## 🎯 Итог

Эта архитектура обеспечивает:

1. **Масштабируемость** — добавление новых тем без изменения Core
2. **Maintainability** — четкое разделение ответственности
3. **Performance** — оптимизация для Core Web Vitals
4. **SEO-friendly** — SSR, meta management, Schema.org
5. **Developer Experience** — TypeScript, hot reload, понятная структура
6. **Flexibility** — runtime theme switching, Design Tokens

Следующий шаг — рефакторинг текущего проекта под эту архитектуру.
