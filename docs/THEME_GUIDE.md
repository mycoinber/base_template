# Theme Guide

Краткий рабочий гайд по созданию новой темы.

## Как создать тему

1. Создай папку `themes/<name>/`.
2. Скопируй за основу структуру `themes/parimatch/`.
3. Замени layout'ы, компоненты, токены и assets под новый дизайн.
4. Зарегистрируй тему в [`theme.config.ts`](../theme.config.ts).
5. Поставь `ACTIVE_THEME=<name>` в `.env`.
6. Перезапусти `npm run dev` или пересобери проект.

## Обязательные файлы

Минимум, без которого тема не считается рабочей:

```text
themes/<name>/
├── theme.config.ts
├── nuxt.config.ts
├── tailwind.preset.ts
├── layouts/
│   ├── default.vue
│   └── article.vue
├── components/
│   ├── Header/index.vue
│   ├── Footer/index.vue
│   ├── Main/index.vue
│   ├── Button/index.vue
│   ├── Loader/index.vue
│   ├── Hero/index.vue
│   ├── Title/index.vue
│   ├── Gallery/index.vue
│   ├── TableOfContent/index.vue
│   ├── Author/index.vue
│   └── Main/sections/
│       ├── Default.vue
│       ├── Heading.vue
│       ├── Intro.vue
│       ├── Faq.vue
│       └── Review.vue
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
└── assets/scss/
    ├── main.scss
    ├── _tokens.scss
    └── _components.scss
```

## Что где настраивается

### `theme.config.ts`

Описывает тему:
- `name`
- `displayName`
- `tokens`
- `components`
- `layouts`
- `assets`
- `tailwindPreset`

Смотри пример: [`themes/parimatch/theme.config.ts`](../themes/parimatch/theme.config.ts)

### `nuxt.config.ts`

Nuxt layer темы.

Сейчас нужен для:
- theme CSS
- auto-import theme components

Смотри пример: [`themes/parimatch/nuxt.config.ts`](../themes/parimatch/nuxt.config.ts)

### `tailwind.preset.ts`

Theme-specific Tailwind mapping.

Смотри пример: [`themes/parimatch/tailwind.preset.ts`](../themes/parimatch/tailwind.preset.ts)

### `tokens/*`

Хранят дефолтные значения темы:
- цвета
- типографика
- spacing / radius / breakpoints

### `assets/scss/main.scss`

Главная точка CSS variables темы.

Здесь должны быть:
- базовые `--primary`, `--secondary`, `--accent`
- `--background-*`
- `--text-*`
- `--border-default`
- backward-compatible aliases, если они еще используются в теме

## Что нужно сделать в root-конфиге

Добавь тему в [`theme.config.ts`](../theme.config.ts):

```ts
export const themeRegistry = {
  parimatch: {
    displayName: "Parimatch Theme",
    path: "./themes/parimatch",
  },
  mytheme: {
    displayName: "My Theme",
    path: "./themes/mytheme",
  },
} as const;
```

Без этого `ACTIVE_THEME=mytheme` не заработает.

## Env-переменные

### Обязательные

```bash
SITE_ID=...
BACKEND_URL=...
SITEMAP_API_BASE=...
MEDIA_STORAGE_URL=...
SLUG=...
ACTIVE_THEME=<name>
```

### Цвета темы

Тема должна уметь читать:

```bash
NUXT_PUBLIC_COLOR_PRIMARY=...
NUXT_PUBLIC_COLOR_SECONDARY=...
NUXT_PUBLIC_COLOR_ACCENT=...
NUXT_PUBLIC_COLOR_BG_PRIMARY=...
NUXT_PUBLIC_COLOR_BG_SECONDARY=...
NUXT_PUBLIC_COLOR_TEXT_PRIMARY=...
NUXT_PUBLIC_COLOR_TEXT_SECONDARY=...
NUXT_PUBLIC_COLOR_TEXT_HEADING=...
NUXT_PUBLIC_COLOR_TEXT_INVERSE=...
NUXT_PUBLIC_COLOR_TEXT_CONTRAST=...
NUXT_PUBLIC_COLOR_BORDER=...
NUXT_PUBLIC_COLOR_STATE_HOVER=...
```

Текущий runtime прокидывает их через:
- [`nuxt.config.ts`](../nuxt.config.ts)
- [`plugins/theme-colors.client.ts`](../plugins/theme-colors.client.ts)

Новая тема должна использовать CSS variables, а не прямые `#hex` в runtime-компонентах.

## Что переиспользовать из core

Тема не должна копировать логику из `core`.

Используем как есть:
- [`core/composables/usePageData.ts`](../core/composables/usePageData.ts)
- [`core/composables/usePageDocument.ts`](../core/composables/usePageDocument.ts)
- [`core/composables/useSeo.ts`](../core/composables/useSeo.ts)
- [`core/composables/useNavigation.ts`](../core/composables/useNavigation.ts)
- [`core/composables/useSiteManifest.ts`](../core/composables/useSiteManifest.ts)
- [`core/components/HeadlessButton.vue`](../core/components/HeadlessButton.vue)
- [`core/components/HeadlessAccordion.vue`](../core/components/HeadlessAccordion.vue)

## Checklist готовности темы

### Конфиг

- есть `themes/<name>/`
- тема зарегистрирована в root [`theme.config.ts`](../theme.config.ts)
- `ACTIVE_THEME=<name>` поднимает тему без ручных правок в runtime

### Обязательные точки взаимодействия

- `default.vue` подключает `ThemeHeader`, `ThemeFooter`, `ThemeMain`
- `article.vue` совместим с текущим page runtime
- `theme.config.ts` содержит корректный mapping компонентов и layout'ов
- `tailwind.preset.ts` не ссылается на старую тему

### Цветовой контракт

- тема использует `NUXT_PUBLIC_COLOR_*`
- кнопки, фон, текст, границы и hover не захардкожены в компонентах
- CSS variables собраны в `assets/scss/main.scss`

### Компоненты

- `Header`
- `Footer`
- `Main`
- `Button`
- `Loader`
- `Hero`
- `Title`
- `Gallery`
- `TableOfContent`
- `Author`
- `Main/sections/*`

### Сборка

- `npm run dev`
- `npm run build`

## Полезные файлы-референсы

- [`theme.config.ts`](../theme.config.ts)
- [`nuxt.config.ts`](../nuxt.config.ts)
- [`plugins/theme-colors.client.ts`](../plugins/theme-colors.client.ts)
- [`themes/parimatch/theme.config.ts`](../themes/parimatch/theme.config.ts)
- [`themes/parimatch/layouts/default.vue`](../themes/parimatch/layouts/default.vue)
- [`themes/parimatch/layouts/article.vue`](../themes/parimatch/layouts/article.vue)
- [`example.env`](../example.env)
