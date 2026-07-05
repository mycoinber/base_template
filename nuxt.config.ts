const normalizeBaseUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }
  return value.trim().replace(/\/+$/, "");
};

const toOrigin = (value?: string | null) => {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return "";
  try {
    return new URL(normalized).origin;
  } catch {
    return "";
  }
};

const SITE_ID = (process.env.SITE_ID || "").trim();
const MEDIA_STORAGE_URL = (process.env.MEDIA_STORAGE_URL || "").trim();
const BACKEND_BASE_URL = normalizeBaseUrl(process.env.BACKEND_URL);
const GSC_BACKEND_URL = normalizeBaseUrl(process.env.GSC_BACKEND_URL);
const SAFE_BROWSING_API_KEY = (process.env.SAFE_BROWSING_API_KEY || "").trim();
const CSS_SLUG = (process.env.SLUG || "site").trim() || "site";
const SITE_URL = normalizeBaseUrl(process.env.SITE_URL);
const SITE_NAME = (process.env.SITE_NAME || "").trim();

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: true,
  experimental: {
    appManifest: true,
  },
  routeRules: {
    "/**": { isr: 7200 },
  },
  css: ["~/assets/css/tailwind.css", "~/assets/scss/main.scss"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
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
  site: {
    url: SITE_URL || undefined,
    name: SITE_NAME || undefined,
  },

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
      style: [
        {
          children:
            "html,body{background:#18181d;color:#fff;min-height:100%;}",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        ...(toOrigin(MEDIA_STORAGE_URL)
          ? [{ rel: "preconnect", href: toOrigin(MEDIA_STORAGE_URL) }]
          : []),
      ],
    },
  },
  nitro: {
    logLevel: "debug",
    // node: true,
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
        generateScopedName: `[local]-${CSS_SLUG}_[hash:base64:5]`,
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
      watch: {
        usePolling: true,
      },
    },
  },
  runtimeConfig: {
    public: {
      siteId: SITE_ID,
      mediaStorageUrl: MEDIA_STORAGE_URL || undefined,
      sitemapApiBase: BACKEND_BASE_URL,
      backHost: BACKEND_BASE_URL || undefined,
      gscBackendUrl: GSC_BACKEND_URL || undefined,
      vercelAnalytics:
        process.env.VERCEL === "1" || process.env.VERCEL === "true",
      siteUrl: SITE_URL || undefined,
      siteName: SITE_NAME || undefined,
    },
    server: {
      siteId: SITE_ID,
      backHost: BACKEND_BASE_URL || undefined,
      mediaStorageUrl: MEDIA_STORAGE_URL || undefined,
      sitemapApiBase: BACKEND_BASE_URL,
      siteUrl: SITE_URL || undefined,
      siteName: SITE_NAME || undefined,
      gscBackendUrl: GSC_BACKEND_URL || undefined,
      safeBrowsingApiKey: SAFE_BROWSING_API_KEY || undefined,
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
    preconnect: true,
    preload: true,
    useStylesheet: true,
  },
  compatibilityDate: "2024-11-26",
});
