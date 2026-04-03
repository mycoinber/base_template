# Migration Status

## What Is True Now

The frontend runtime is consolidated around the new architecture:
- routes: `pages/index.vue` and `pages/[...slug].vue`
- core logic: `core/composables/*`
- document/head setup: `core/composables/usePageDocument.ts`
- UI layer: `themes/<active-theme>/*`
- backend integration: Nitro routes under `server/api/*`

The old top-level runtime folders `components/*` and `composables/*` have been removed.
The transition file `pages/[...slug]-new.vue` has also been removed.

## What Was Completed

- core composables became the canonical source for page data, SEO, navigation, and manifest handling
- page-level head/meta assembly was centralized into `usePageDocument`
- the canonical catch-all route is now only `pages/[...slug].vue`
- top-level legacy frontend folders were removed from runtime
- Tailwind content scanning was aligned with the new structure
- active theme selection was moved to `.env` via `ACTIVE_THEME`
- theme color overrides were moved to `NUXT_PUBLIC_COLOR_*`
- desktop header uses a fixed logo asset from `public/icon/logo.svg`
- gallery can switch to a carousel layout when offers do not fit the available desktop width

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
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── tokens/
│       ├── nuxt.config.ts
│       ├── tailwind.preset.ts
│       └── theme.config.ts
├── pages/
│   ├── index.vue
│   └── [...slug].vue
├── server/
│   └── utils/
├── assets/
├── plugins/
├── public/
└── docs/
```

## What Still Remains

The repository is cleaner, but not yet at the final ideal state:
- only one active theme is validated in practice: `parimatch`
- some theme fallback values still remain in SCSS token/style files
- theme selection is build/deploy-time, not an in-browser runtime theme switcher
- some documents intentionally remain as migration history rather than current architecture reference

## Source Of Truth

Use these files when reasoning about the current frontend architecture:
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/HOW_TO_RUN.md`
- `pages/index.vue`
- `pages/[...slug].vue`
- `core/composables/usePageDocument.ts`

`docs/MIGRATION.md` should be read as historical migration context only.
