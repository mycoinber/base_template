# Migration Plan (Historical)

This document is kept as migration history and implementation notes.
It does not describe the current runtime structure exactly.
For the current architecture, use `README.md`, `docs/ARCHITECTURE.md`, and `docs/HOW_TO_RUN.md`.

# 🔄 Миграция на новую архитектуру

## Обзор миграции

Этот документ описывает пошаговый план миграции текущего проекта на новую двухслойную архитектуру (Core + Theme).

---

## 📋 План миграции

### Фаза 1: Подготовка структуры (1-2 дня)

#### 1.1 Создание директорий

```bash
# Core layer
mkdir -p core/{composables,components,types,utils,plugins,stores}
mkdir -p core/server/{api,middleware,utils}

# Themes
mkdir -p themes/parimatch/{components,layouts,assets,tokens}
mkdir -p themes/parimatch/components/{Header,Footer,Hero,Title,Button,Card,sections}

# Shared
mkdir -p shared/{constants,interfaces,helpers}

# Docs
mkdir -p docs
```

#### 1.2 Создание базовых типов

- [x] `core/types/theme.ts` - типы для системы тем
- [ ] `core/types/page.ts` - типы для данных страниц
- [ ] `core/types/article.ts` - типы для статей
- [ ] `core/types/offer.ts` - типы для офферов

---

### Фаза 2: Выделение Core Layer (3-5 дней)

#### 2.1 Перенос composables

```
composables/usePageData.ts    → core/composables/usePageData.ts
composables/useOffer.ts       → core/composables/useOffer.ts
composables/useSiteManifest.ts → core/composables/useSiteManifest.ts
```

**Изменения:**
- Убрать любые стили и UI-логику
- Оставить только бизнес-логику и data fetching
- Добавить TypeScript типы

#### 2.2 Перенос утилит

```
utils/headUtils.ts     → core/utils/headUtils.ts
utils/manifestHead.ts  → core/utils/manifestHead.ts
utils/mediaPath.ts     → core/utils/mediaPath.ts
```

**Новые утилиты:**
- `core/utils/seoUtils.ts` - SEO helpers
- `core/utils/schemaOrg.ts` - Schema.org generators

#### 2.3 Перенос серверной логики

```
server/api/*           → core/server/api/*
server/middleware/*    → core/server/middleware/*
server/utils/*         → core/server/utils/*
```

#### 2.4 Создание Headless компонентов

Новые файлы:
- `core/components/HeadlessAccordion.vue`
- `core/components/HeadlessModal.vue`
- `core/components/HeadlessDropdown.vue`
- `core/components/HeadlessTabs.vue`
- `core/components/HeadlessButton.vue`

---

### Фаза 3: Создание Theme Layer (5-7 дней)

#### 3.1 Настройка токенов

- [x] `themes/parimatch/tokens/colors.ts`
- [x] `themes/parimatch/tokens/typography.ts`
- [x] `themes/parimatch/tokens/spacing.ts`
- [x] `themes/parimatch/tokens/index.ts`

#### 3.2 Конфигурация темы

- [x] `themes/parimatch/theme.config.ts`
- [x] `themes/parimatch/tailwind.preset.ts`

#### 3.3 Перенос компонентов

```
components/Header/index.vue           → themes/parimatch/components/Header/index.vue
components/Footer/index.vue           → themes/parimatch/components/Footer/index.vue
components/Main/Hero.vue              → themes/parimatch/components/Hero/index.vue
components/Main/Title.vue             → themes/parimatch/components/Title/index.vue
components/Main/TableOfContent.vue    → themes/parimatch/components/TableOfContent/index.vue
components/Main/Author.vue            → themes/parimatch/components/Author/index.vue
components/Main/sections/Default.vue  → themes/parimatch/components/sections/Default.vue
components/Main/sections/Heading.vue  → themes/parimatch/components/sections/Heading.vue
components/Main/sections/Intro.vue    → themes/parimatch/components/sections/Intro.vue
components/Main/sections/Faq.vue      → themes/parimatch/components/sections/Faq.vue
components/Main/sections/Review.vue   → themes/parimatch/components/sections/Review.vue
components/General/Button.vue         → themes/parimatch/components/Button/index.vue
```

**При переносе:**
1. Компонент должен использовать Headless компоненты из Core
2. Стили должны использовать Design Tokens
3. Логика data fetching через Core composables

#### 3.4 Перенос layouts

```
layouts/default.vue → themes/parimatch/layouts/default.vue
```

#### 3.5 Перенос assets

```
assets/scss/*           → themes/parimatch/assets/scss/*
assets/css/*            → themes/parimatch/assets/css/*
public/fonts/*          → themes/parimatch/assets/fonts/*
```

---

### Фаза 4: Интеграция (2-3 дня)

#### 4.1 Обновление nuxt.config.ts

```typescript
import { activeTheme } from './theme.config';

export default defineNuxtConfig({
  alias: {
    '@core': './core',
    '@theme': `./themes/${activeTheme}`,
    '@shared': './shared',
  },
  
  css: [
    `./themes/${activeTheme}/assets/scss/main.scss`,
  ],
  
  // ... остальная конфигурация
});
```

#### 4.2 Создание Theme Resolver

```typescript
// app/plugins/theme-resolver.ts
export default defineNuxtPlugin(async () => {
  const themeConfig = await import(`@theme/theme.config`);
  
  // Register components globally
  for (const [name, loader] of Object.entries(themeConfig.components)) {
    defineAsyncComponent({
      loader: loader as () => Promise<any>,
      loadingComponent: LoadingSpinner,
    });
  }
});
```

#### 4.3 Обновление pages

```vue
<!-- pages/[...slug].vue -->
<script setup lang="ts">
// Импорт из Core
import { usePageData } from '@core/composables/usePageData';
import { useSeo } from '@core/composables/useSeo';

// Компоненты будут разрешаться через Theme Resolver
</script>
```

---

### Фаза 5: Тестирование и оптимизация (2-3 дня)

#### 5.1 Проверка функциональности

- [ ] Все страницы загружаются корректно
- [ ] Data fetching работает
- [ ] SEO meta генерируется
- [ ] Schema.org разметка валидна
- [ ] Responsive работает
- [ ] Анимации работают

#### 5.2 Performance тестирование

- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] Bundle size оптимален

#### 5.3 SEO проверка

- [ ] Meta tags корректны
- [ ] Canonical URLs правильные
- [ ] Sitemap генерируется
- [ ] Robots.txt корректен

---

## 🔧 Пример миграции компонента

### До миграции (текущий код)

```vue
<!-- components/Main/TableOfContent.vue -->
<script setup>
import { ref } from 'vue';

const props = defineProps({
  data: Object,
});

const isOpen = ref(false);
const toggle = () => { isOpen.value = !isOpen.value; };
</script>

<template>
  <section class="my-8 max-[541px]:my-4">
    <div class="container">
      <nav class="w-full">
        <div class="flex items-center justify-between bg-pm-yellow h-[4.063rem] px-6"
             @click="toggle">
          <span class="text-[0.875rem] font-bold uppercase text-black">
            {{ $t('table_of_content') }}
          </span>
          <Icon name="carbon:add" :class="{ 'rotate-45': isOpen }" />
        </div>
        <!-- ... -->
      </nav>
    </div>
  </section>
</template>
```

### После миграции

#### Core Headless Component

```vue
<!-- core/components/HeadlessAccordion.vue -->
<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  defaultOpen?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
});

const isOpen = ref(props.defaultOpen);
const toggle = () => { isOpen.value = !isOpen.value; };

defineExpose({ isOpen, toggle });
</script>

<template>
  <div role="region">
    <slot :is-open="isOpen" :toggle="toggle" />
  </div>
</template>
```

#### Theme Styled Component

```vue
<!-- themes/parimatch/components/TableOfContent/index.vue -->
<script setup lang="ts">
import HeadlessAccordion from '@core/components/HeadlessAccordion.vue';
import { tokens } from '@theme/tokens';

interface Props {
  data: {
    article?: {
      blocks: Array<{ _id: string; H2: string }>;
    };
  };
}

const props = defineProps<Props>();
</script>

<template>
  <section v-if="data.article?.blocks.length" class="toc-section">
    <div class="container">
      <HeadlessAccordion v-slot="{ isOpen, toggle }">
        <nav class="toc-nav">
          <div class="toc-header" @click="toggle">
            <span class="toc-title">{{ $t('table_of_content') }}</span>
            <span :class="['toc-icon', { 'is-open': isOpen }]">
              <Icon name="carbon:add" />
            </span>
          </div>
          
          <div :class="['toc-content', { 'is-open': isOpen }]">
            <ul class="toc-list">
              <li v-for="(item, index) in data.article.blocks" :key="item._id">
                <a :href="'#' + item._id">
                  <span class="toc-number">{{ index + 1 }}.</span>
                  {{ item.H2 }}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </HeadlessAccordion>
    </div>
  </section>
</template>

<style scoped>
.toc-section {
  @apply my-8 max-[541px]:my-4;
}

.toc-nav {
  @apply w-full max-w-container mx-auto overflow-hidden;
}

.toc-header {
  @apply flex items-center justify-between cursor-pointer select-none;
  @apply bg-primary h-toc px-6 transition-colors duration-300;
}

.toc-title {
  @apply text-sm leading-[1.063rem] font-bold font-heading uppercase;
  color: var(--text-inverse);
}

.toc-icon {
  @apply inline-flex items-center justify-center transition-transform duration-300;
  @apply text-2xl;
  color: var(--text-inverse);
}

.toc-icon.is-open {
  @apply rotate-45;
}

.toc-content {
  @apply overflow-hidden transition-all duration-300 bg-background-02;
  @apply max-h-0 opacity-0;
}

.toc-content.is-open {
  @apply max-h-[25rem] opacity-100;
}

.toc-list {
  @apply flex flex-col gap-2 list-none py-4 m-0;
}

.toc-list li {
  @apply relative pl-8 transition-all duration-300 text-sm m-0;
  color: var(--text-primary);
}

.toc-list li:hover {
  color: var(--primary);
}

.toc-number {
  @apply absolute left-0 top-1/2 -translate-y-1/2;
}
</style>
```

---

## 📊 Чек-лист миграции

### Core Layer
- [ ] Типы созданы
- [ ] Composables перенесены
- [ ] Utils перенесены
- [ ] Server логика перенесена
- [ ] Headless компоненты созданы
- [ ] Stores созданы

### Theme Layer (Parimatch)
- [x] Tokens определены
- [x] Theme config создан
- [x] Tailwind preset создан
- [ ] Компоненты перенесены
- [ ] Layouts перенесены
- [ ] Assets перенесены

### Integration
- [ ] nuxt.config.ts обновлен
- [ ] Theme resolver создан
- [ ] Aliases настроены
- [ ] CSS подключен

### Testing
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] SEO audit

---

## ⏱️ Оценка времени

| Фаза | Задачи | Время |
|------|--------|-------|
| Фаза 1 | Подготовка структуры | 1-2 дня |
| Фаза 2 | Core Layer | 3-5 дней |
| Фаза 3 | Theme Layer | 5-7 дней |
| Фаза 4 | Интеграция | 2-3 дня |
| Фаза 5 | Тестирование | 2-3 дня |
| **Итого** | | **13-20 дней** |

---

## 🚀 Следующие шаги

1. **Сегодня:** Завершить создание базовых типов и токенов
2. **Завтра:** Начать перенос composables в Core
3. **Эта неделя:** Создать все Headless компоненты
4. **Следующая неделя:** Перенести все themed компоненты
5. **Финал:** Интеграция и тестирование

---

## 📝 Примечания

- Миграция должна происходить поэтапно без прерывания работы сайта
- Каждая фаза должна быть протестирована перед переходом к следующей
- Документация должна обновляться по мере продвижения
- После миграции создать вторую тему для валидации архитектуры
