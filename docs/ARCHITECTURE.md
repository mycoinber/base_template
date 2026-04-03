# Frontend Architecture

## Theme Model

The repo is designed for many themes, but one active theme per app instance.

Theme activation is env-driven:
- `ACTIVE_THEME=<name>` in `.env`
- resolved in root `theme.config.ts`
- used by Nuxt `extends`, `@theme` alias, auto-imported `Theme*` components, and Tailwind scanning

This is a deployment/build-time choice, not a runtime browser theme toggle.

## Canonical Runtime Layer

The current working frontend path is:
- `pages/index.vue`
- `pages/[...slug].vue`
- `core/composables/usePageData.ts`
- `core/composables/usePageDocument.ts`
- `core/composables/useSeo.ts`
- `core/composables/useNavigation.ts`
- `core/composables/useSiteManifest.ts`
- `core/components/*`
- `themes/<active-theme>/*`

Old top-level frontend folders `components/*` and `composables/*` have been removed from runtime.

## Runtime Flow

```text
Nuxt page
  -> usePageData()
  -> usePageDocument()
      -> useSeo()
      -> useSiteManifest()
      -> manifest/global head merge
      -> custom head/body code blocks
  -> theme layout/components
  -> Nitro proxy routes /api/pages and /api/nav
```

## Current Structure

```text
/base_template
├── core/
│   ├── composables/
│   ├── components/
│   ├── stores/
│   └── types/
├── themes/
│   └── <theme-name>/
│       ├── components/
│       ├── layouts/
│       ├── tokens/
│       ├── assets/
│       ├── nuxt.config.ts
│       ├── tailwind.preset.ts
│       └── theme.config.ts
├── pages/
│   ├── index.vue
│   └── [...slug].vue
├── server/
│   ├── api/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── plugins/
├── assets/
├── public/
└── docs/
```

## Responsibility Split

Core:
- data fetching
- normalization
- navigation
- manifest handling
- SEO/schema
- final page document assembly

Theme:
- layouts
- visual components
- design tokens
- theme SCSS and Tailwind preset

## Env Contract

Required environment:
- `SITE_ID`
- `BACKEND_URL`
- `SITEMAP_API_BASE`
- `MEDIA_STORAGE_URL`
- `SLUG`
- `ACTIVE_THEME`

Optional theme repainting:
- `NUXT_PUBLIC_COLOR_PRIMARY`
- `NUXT_PUBLIC_COLOR_SECONDARY`
- `NUXT_PUBLIC_COLOR_ACCENT`
- `NUXT_PUBLIC_COLOR_BG_PRIMARY`
- `NUXT_PUBLIC_COLOR_BG_SECONDARY`
- `NUXT_PUBLIC_COLOR_TEXT_PRIMARY`
- `NUXT_PUBLIC_COLOR_TEXT_HEADING`
- `NUXT_PUBLIC_COLOR_TEXT_INVERSE`
- `NUXT_PUBLIC_COLOR_BORDER`

## Adding A Theme

1. Create `themes/<name>/`
2. Implement `theme.config.ts`, `nuxt.config.ts`, `tailwind.preset.ts`, theme components/layouts/tokens
3. Register `<name>` in root `theme.config.ts`
4. Set `ACTIVE_THEME=<name>` in `.env`
5. Restart dev/build

## Current Limitation

The architecture now supports many themes structurally, but only registered themes can be activated, and each running app instance still uses one selected theme at a time.
