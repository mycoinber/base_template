# Frontend Architecture

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
- `themes/parimatch/*`

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
│   └── parimatch/
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

## Remaining Gaps

The repo is cleaner now, but not fully “ideal” yet:
- only one real theme is active and validated: `parimatch`
- some docs and changelog entries still refer to migration history
