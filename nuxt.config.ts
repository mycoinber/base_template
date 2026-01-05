import { readFileSync } from "fs";
import { resolve } from "path";
import {
  SITE_ID,
  SITEMAP_API_BASE,
  BACKEND_BASE_URL,
} from "./utils/remote-sitemap";

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  routeRules: {
    "/**": { isr: 7200 },
  },
  css: ["~/assets/css/tailwind.css", "~/assets/scss/main.scss"],
  modules: [
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
    preset: "cloudflare_pages",
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },
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
  runtimeConfig: {
    public: {
      siteId: SITE_ID,
      globalHead: JSON.parse(
        readFileSync(resolve("site.json"), "utf-8")
      ) as any,
      mediaStorageUrl: process.env.MEDIA_STORAGE_URL,
      sitemapApiBase: SITEMAP_API_BASE,
      backHost: BACKEND_BASE_URL || undefined,
    },
    server: {
      siteId: SITE_ID,
      backHost: BACKEND_BASE_URL || undefined,
      globalHead: JSON.parse(
        readFileSync(resolve("site.json"), "utf-8")
      ) as any,
      mediaStorageUrl: process.env.MEDIA_STORAGE_URL,
      sitemapApiBase: SITEMAP_API_BASE,
    },
  },
  plugins: ["~/plugins/vue-query.ts"],
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
