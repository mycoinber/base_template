import { resolve } from "path";
import {
  SITE_ID,
  SITEMAP_API_BASE,
  BACKEND_BASE_URL,
} from "./server/utils/remote-sitemap";
import { activeTheme, activeThemeConfig, availableThemes } from "./theme.config";

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,

  // Расширение темой как Nuxt Layer (компоненты, layouts, composables темы будут приоритетнее)
  extends: [
    activeThemeConfig.path,
  ],

  // Алиасы для новой архитектуры
  alias: {
    '@core': resolve(__dirname, './core'),
    '@theme': resolve(__dirname, activeThemeConfig.path),
    '@shared': resolve(__dirname, './shared'),
  },

  // Конфигурация компонентов: приоритет темы > core
  components: [
    // 1. Компоненты активной темы с префиксом Theme (наивысший приоритет)
    {
      path: `~/themes/${activeTheme}/components`,
      pathPrefix: false,
      prefix: 'Theme',
      priority: 10,
    },
    // 2. Core компоненты (headless)
    {
      path: '~/core/components',
      pathPrefix: false,
      prefix: 'Headless',
      priority: 5,
    },
  ],

  // Директория layouts (приоритет темы через extends)
  // Layouts из темы будут использоваться благодаря extends ниже

  routeRules: {
    // Статические файлы не должны обрабатываться как страницы
    '/ornament.svg': { prerender: true },
    '/site-manifest.json': { prerender: true },
    '/**/*.svg': { prerender: true },
    '/**/*.json': { prerender: true },
    '/**/*.ico': { prerender: true },
    '/**/*.txt': { prerender: true },
    '/**/*.xml': { prerender: true },
    '/media/**': { prerender: true },
    // Остальные страницы используют ISR
    "/**": { isr: 7200 },
  },
  css: [
    "~/assets/scss/main.scss",
    "~/assets/css/tailwind.css",
    // Стили темы подключаются автоматически через extends
  ],
  modules: [
    "@pinia/nuxt",
    "@nuxt/image-edge",
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "nuxt-schema-org",
    "nuxt-og-image",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "nuxt-vitalizer",
  ],
  schemaOrg: {
    defaults: false,
  },
  site: {},

  sitemap: {
    xsl: false,
    cacheMaxAgeSeconds: 0,
    excludeAppSources: true,
    sources: [],
  },
  vitalizer: {
    delayHydration: {
      hydrateOnEvents: [
        "mousemove",
        "scroll",
        "keydown",
        "click",
        "touchstart",
        "wheel",
      ],
      idleCallbackTimeout: 10000,
      postIdleTimeout: 4000,
    },
  },
  app: {
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  nitro: {
    logLevel: "debug",
    node: true,
    prerender: {
      // crawlLinks: true,
      ignore: ["/yandex-browser-manifest.json"],
    },
  },
  vite: {
    css: {
      modules: {
        generateScopedName: `[local]-${process.env.SLUG}_[hash:base64:5]`,
      },
      preprocessorOptions: {
        scss: {
          additionalData:
            '@use "~/assets/scss/variables/_variables.scss" as *; ' +
            '@use "~/assets/scss/variables/_breakpoints.scss" as *;',
        },
      },
    },
    server: {
      fs: {
        allow: ["../pbn/*", "./"],
      },
      watch: {
        usePolling: true,
      },
    },
  },

  // TypeScript конфигурация - отключена для dev режима
  // typescript: {
  //   strict: true,
  //   typeCheck: false,
  // },

  // PostCSS конфигурация (перемещено из postcss.config.js)
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      siteId: SITE_ID,
      activeTheme: activeTheme,
      availableThemes,
      mediaStorageUrl: process.env.MEDIA_STORAGE_URL,
      sitemapApiBase: SITEMAP_API_BASE,
      backHost: BACKEND_BASE_URL || undefined,
      // Theme color overrides from .env (NUXT_PUBLIC_COLOR_*)
      colorPrimary:        process.env.NUXT_PUBLIC_COLOR_PRIMARY        || '',
      colorSecondary:      process.env.NUXT_PUBLIC_COLOR_SECONDARY      || '',
      colorAccent:         process.env.NUXT_PUBLIC_COLOR_ACCENT         || '',
      colorBgPrimary:      process.env.NUXT_PUBLIC_COLOR_BG_PRIMARY     || '',
      colorBgSecondary:    process.env.NUXT_PUBLIC_COLOR_BG_SECONDARY   || '',
      colorTextPrimary:    process.env.NUXT_PUBLIC_COLOR_TEXT_PRIMARY   || '',
      colorTextSecondary:  process.env.NUXT_PUBLIC_COLOR_TEXT_SECONDARY || '',
      colorTextHeading:    process.env.NUXT_PUBLIC_COLOR_TEXT_HEADING   || '',
      colorTextInverse:    process.env.NUXT_PUBLIC_COLOR_TEXT_INVERSE   || '',
      colorTextContrast:   process.env.NUXT_PUBLIC_COLOR_TEXT_CONTRAST  || '',
      colorBorder:         process.env.NUXT_PUBLIC_COLOR_BORDER         || '',
      colorStateHover:     process.env.NUXT_PUBLIC_COLOR_STATE_HOVER    || '',
    },
    server: {
      siteId: SITE_ID,
      activeTheme: activeTheme,
      backHost: BACKEND_BASE_URL || undefined,
      mediaStorageUrl: process.env.MEDIA_STORAGE_URL,
      sitemapApiBase: SITEMAP_API_BASE,
    },
  },
  plugins: [
    "~/plugins/vue-query.ts",
    "~/plugins/theme-colors.client.ts",
  ],
  image: {
    provider: "mediaProxy",
    dir: "public",
    providers: {
      mediaProxy: {
        provider: "~/providers/mediaProxy",
        options: {
          baseURL: "/media",
        },
      },
    },
    alias: {
      unsplash: BACKEND_BASE_URL || "http://localhost:3077",
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
  googleFonts: {
    families: {
      Oswald: [400, 500, 700],
      Inter: [400, 500, 700],
    },
    display: "swap",
  },
  compatibilityDate: "2024-11-26",
});
