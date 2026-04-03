/**
 * Core useSeo Composable
 * ============================================================================
 *
 * Headless SEO management для PBN Template System.
 *
 * Этот composable является частью Core Layer и отвечает за:
 * - Генерацию meta tags (title, description, OG, Twitter)
 * - Создание Schema.org structured data
 * - Управление canonical URLs
 * - Core Web Vitals оптимизацию
 *
 * Theme Layer использует этот composable для:
 * - Применения SEO настроек к страницам
 * - Добавления structured data
 * - Динамического обновления meta tags
 *
 * @example
 * ```typescript
 * // В page компоненте:
 * const { head, structuredData, updateMeta } = useSeo(pageData);
 *
 * // Для простых страниц:
 * const { head } = useSimpleSeo('Page Title', 'Description');
 * ```
 */

import { computed, ref, readonly, type Ref, type ComputedRef } from 'vue';
import type { PageData, ArticleBlock, ArticleFaq } from '@/core/types/page';
import type {
  SeoConfig,
  ComputedHead,
  HeadTag,
  ArticleSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  WebSiteSchema,
  OrganizationSchema,
  PersonSchema,
  ImageObjectSchema,
  QuestionSchema,
  AnswerSchema,
  BreadcrumbItemSchema,
  CoreWebVitals,
  PerformanceMetrics,
  SchemaType,
  SeoStrategy,
  SitemapUrl,
  RobotsConfig,
  RobotsRule,
  AnalyticsConfig,
} from '@/core/types/seo';

// ============================================================================
// Types
// ============================================================================

/**
 * Return type для useSeo composable
 */
export interface UseSeoReturn {
  /** Computed head object для useHead */
  head: ComputedRef<ComputedHead>;

  /** Structured data для Schema.org */
  structuredData: ComputedRef<SchemaOrgItem[]>;

  /** Canonical URL */
  canonicalUrl: ComputedRef<string>;

  /** Title for the page */
  pageTitle: ComputedRef<string>;

  // Meta manipulation methods
  updateMeta: (key: string, content: string) => void;
  addMeta: (meta: MetaItem) => void;
  removeMeta: (key: string) => void;

  // Structured data methods
  addSchema: (schema: SchemaOrgItem) => void;
  removeSchema: (type: SchemaType) => void;
}

export interface SeoOptions {
  /** Generate structured data */
  generateStructuredData?: boolean;
  /** Include OpenGraph meta tags */
  includeOpenGraph?: boolean;
  /** Include Twitter meta tags */
  includeTwitter?: boolean;
  /** Include breadcrumbs in structured data */
  includeBreadcrumbs?: boolean;
  /** Include FAQ schema if available */
  includeFAQ?: boolean;
  /** Custom title template */
  titleTemplate?: string;
  /** Custom title separator */
  titleSeparator?: string;
  /** Apply head tags automatically via useHead */
  applyHead?: boolean;
}

export interface MetaItem {
  name?: string;
  property?: string;
  content: string;
  key?: string;
}

type SchemaOrgItem = ArticleSchema | BreadcrumbListSchema | FAQPageSchema | WebSiteSchema | OrganizationSchema;

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_SEO_CONFIG: SeoConfig = {
  title: {
    template: '%s',
    separator: ' | ',
    default: 'PBN Site',
  },
  meta: {
    description: '',
    keywords: '',
    author: 'PBN Team',
    viewport: 'width=device-width, initial-scale=1',
    robots: 'index, follow',
  },
  openGraph: {
    type: 'website',
    siteName: 'PBN Site',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  canonical: {
    baseUrl: '',
    trailingSlash: false,
  },
};

const DEFAULT_OPTIONS: Required<SeoOptions> = {
  generateStructuredData: true,
  includeOpenGraph: true,
  includeTwitter: true,
  includeBreadcrumbs: true,
  includeFAQ: true,
  titleTemplate: '%s',
  titleSeparator: ' | ',
  applyHead: true,
};

// ============================================================================
// Main Composable
// ============================================================================

/**
 * Headless SEO composable для страниц.
 *
 * Автоматически генерирует meta tags и structured data
 * на основе PageData.
 */
export function useSeo(
  pageData: Ref<PageData | null>,
  options: SeoOptions = {}
): UseSeoReturn {
  const url = useRequestURL();
  const siteDomain = computed(() => `${url.protocol}//${url.host}`);

  // Merge with default options
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Dynamic meta storage
  const dynamicMeta = ref<Record<string, string>>({});

  // Additional schemas storage
  const additionalSchemas = ref<SchemaOrgItem[]>([]);

  // ========================================
  // Computed Properties
  // ========================================

  const canonicalUrl = computed<string>(() => {
    if (!pageData.value) return siteDomain.value;

    const page = pageData.value;
    const domain = page.domain || siteDomain.value;
    const slug = page.slug || '';

    return normalizeUrl(`${domain}/${slug}`);
  });

  const pageTitle = computed<string>(() => {
    if (!pageData.value) return DEFAULT_SEO_CONFIG.title.default || '';

    const page = pageData.value;
    const title = page.head?.title || page.article?.H1 || '';
    const siteName = page.siteName;

    return buildTitle(title, siteName, mergedOptions.titleSeparator);
  });

  const head = computed<ComputedHead>(() => {
    if (!pageData.value) {
      return createDefaultHead();
    }

    const page = pageData.value;
    const pageHead = page.head;
    const article = page.article;

    // Build meta tags
    const meta: MetaItem[] = [
      // Basic meta
      { name: 'description', content: pageHead?.description || '' },
      { name: 'keywords', content: pageHead?.keywords || '' },
      { name: 'author', content: article?.author || DEFAULT_SEO_CONFIG.meta.author || '' },
      { name: 'robots', content: buildRobotsMeta(pageHead?.robots) },
    ];

    // OpenGraph meta
    if (mergedOptions.includeOpenGraph) {
      meta.push(...buildOpenGraphMeta(page, canonicalUrl.value, pageTitle.value));
    }

    // Twitter meta
    if (mergedOptions.includeTwitter) {
      meta.push(...buildTwitterMeta(page, pageTitle.value));
    }

    // Add custom meta from page
    if (pageHead?.meta) {
      meta.push(...pageHead.meta.map(m => ({
        name: m.name,
        property: m.property,
        content: m.content,
      })));
    }

    // Add dynamic meta
    Object.entries(dynamicMeta.value).forEach(([key, content]) => {
      meta.push({ name: key, content });
    });

    return {
      title: pageTitle.value,
      meta: deduplicateMeta(meta),
      link: [
        { rel: 'canonical', href: canonicalUrl.value },
      ],
      htmlAttrs: {
        lang: page.lang || 'en',
      },
    };
  });

  const structuredData = computed<SchemaOrgItem[]>(() => {
    if (!mergedOptions.generateStructuredData || !pageData.value) {
      return [];
    }

    const page = pageData.value;
    const schemas: SchemaOrgItem[] = [];

    // Article schema
    schemas.push(createArticleSchema(page, canonicalUrl.value));

    // Website schema
    schemas.push(createWebSiteSchema(page));

    // Breadcrumb schema
    if (mergedOptions.includeBreadcrumbs && page.breadcrumbs?.length) {
      schemas.push(createBreadcrumbSchema(page));
    }

    // FAQ schema
    if (mergedOptions.includeFAQ && page.article?.blocks) {
      const faqSchema = createFAQSchema(page.article.blocks);
      if (faqSchema) {
        schemas.push(faqSchema);
      }
    }

    // Add additional schemas
    schemas.push(...additionalSchemas.value);

    return schemas;
  });

  // ========================================
  // Apply to Document
  // ========================================

  if (mergedOptions.applyHead) {
    useHead(head);
  }

  // Apply structured data via Schema.org module
  useSchemaOrg(structuredData);

  // ========================================
  // Meta Manipulation Methods
  // ========================================

  const updateMeta = (key: string, content: string): void => {
    dynamicMeta.value[key] = content;
  };

  const addMeta = (meta: MetaItem): void => {
    const key = meta.name || meta.property || `meta-${Date.now()}`;
    dynamicMeta.value[key] = meta.content;
  };

  const removeMeta = (key: string): void => {
    delete dynamicMeta.value[key];
  };

  // ========================================
  // Schema Manipulation Methods
  // ========================================

  const addSchema = (schema: SchemaOrgItem): void => {
    additionalSchemas.value.push(schema);
  };

  const removeSchema = (type: SchemaType): void => {
    additionalSchemas.value = additionalSchemas.value.filter(
      s => s['@type'] !== type
    );
  };

  // ========================================
  // Return Interface
  // ========================================

  return {
    head,
    structuredData,
    canonicalUrl,
    pageTitle,
    updateMeta,
    addMeta,
    removeMeta,
    addSchema,
    removeSchema,
  };
}

// ============================================================================
// Simple SEO Composable
// ============================================================================

/**
 * Упрощенный SEO composable для статических страниц.
 *
 * @param title - Page title
 * @param description - Meta description
 * @param options - SEO options
 */
export function useSimpleSeo(
  title: string,
  description: string,
  options?: SeoOptions
): UseSeoReturn {
  const pageData = ref<PageData>({
    _id: `simple-${Date.now()}`,
    slug: '',
    type: 'page',
    domain: '',
    siteName: '',
    siteId: '',
    head: {
      title,
      description,
    },
    article: {
      H1: title,
      intro: description,
      blocks: [],
    },
  });

  return useSeo(pageData, {
    generateStructuredData: false,
    ...options,
  });
}

// ============================================================================
// SEO State Management
// ============================================================================

/**
 * Глобальное состояние SEO для sharing между компонентами.
 */
export function useGlobalSeo() {
  const currentHead = useState<ComputedHead | null>('globalSeoHead', () => null);
  const currentSchemas = useState<SchemaOrgItem[]>('globalSeoSchemas', () => []);

  const setHead = (head: ComputedHead): void => {
    currentHead.value = head;
  };

  const addGlobalSchema = (schema: SchemaOrgItem): void => {
    currentSchemas.value.push(schema);
  };

  const clearGlobalSchemas = (): void => {
    currentSchemas.value = [];
  };

  return {
    currentHead: readonly(currentHead),
    currentSchemas: readonly(currentSchemas),
    setHead,
    addGlobalSchema,
    clearGlobalSchemas,
  };
}

/**
 * Получить текущее SEO состояние (для отладки).
 */
export function getCurrentSeo() {
  const seoState = useState<ComputedHead | null>('currentSeo', () => null);

  return {
    currentSeo: readonly(seoState),
    updateCurrentSeo: (head: ComputedHead) => {
      seoState.value = head;
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildTitle(pageTitle: string, siteName?: string, separator?: string): string {
  if (!pageTitle) return siteName || DEFAULT_SEO_CONFIG.title.default || '';
  if (!siteName) return pageTitle;

  const sep = separator || DEFAULT_SEO_CONFIG.title.separator || ' | ';
  return `${pageTitle}${sep}${siteName}`;
}

function buildRobotsMeta(robots?: any): string {
  if (typeof robots === 'string') return robots;
  if (!robots || typeof robots !== 'object') return 'index, follow';

  const index = robots.index !== false ? 'index' : 'noindex';
  const follow = robots.follow !== false ? 'follow' : 'nofollow';

  return `${index}, ${follow}`;
}

function buildOpenGraphMeta(page: PageData, canonicalUrl: string, title: string): MetaItem[] {
  const meta: MetaItem[] = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: page.head?.description || '' },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: page.siteName || '' },
    { property: 'og:locale', content: page.locale || 'en_US' },
  ];

  // Add image if available
  const heroImage = page.article?.introImage?.[0];
  if (heroImage?.path) {
    meta.push({ property: 'og:image', content: heroImage.path });
    meta.push({ property: 'og:image:alt', content: heroImage.alt || title });

    if (heroImage.width) {
      meta.push({ property: 'og:image:width', content: String(heroImage.width) });
    }
    if (heroImage.height) {
      meta.push({ property: 'og:image:height', content: String(heroImage.height) });
    }
  }

  return meta;
}

function buildTwitterMeta(page: PageData, title: string): MetaItem[] {
  const meta: MetaItem[] = [
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: page.head?.description || '' },
  ];

  const heroImage = page.article?.introImage?.[0];
  if (heroImage?.path) {
    meta.push({ name: 'twitter:image', content: heroImage.path });
    meta.push({ name: 'twitter:image:alt', content: heroImage.alt || title });
  }

  return meta;
}

function deduplicateMeta(meta: MetaItem[]): MetaItem[] {
  const seen = new Set<string>();
  return meta.filter(item => {
    const key = item.name || item.property || '';
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/+/g, '/').replace(':/', '://');
}

function createDefaultHead(): ComputedHead {
  return {
    title: DEFAULT_SEO_CONFIG.title.default || '',
    meta: [
      { name: 'description', content: DEFAULT_SEO_CONFIG.meta.description || '' },
      { name: 'robots', content: DEFAULT_SEO_CONFIG.meta.robots || 'index, follow' },
    ],
    link: [],
  };
}

// ============================================================================
// Schema.org Generation Functions
// ============================================================================

function createArticleSchema(page: PageData, canonicalUrl: string): ArticleSchema {
  const article = page.article;
  const author = article?.author || 'PBN Team';
  const publishedAt = article?.publishedAt || page.createdAt || new Date().toISOString();
  const updatedAt = article?.updatedAt || page.updatedAt || publishedAt;

  const authorSchema: PersonSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author,
  };

  const publisherSchema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: page.siteName || 'PBN Site',
  };

  // Add logo if available
  if (article?.introImage?.[0]?.path) {
    publisherSchema.logo = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: article.introImage[0].path,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article?.H1 || 'Article',
    description: page.head?.description,
    author: authorSchema,
    publisher: publisherSchema,
    datePublished: publishedAt,
    dateModified: updatedAt,
    mainEntityOfPage: canonicalUrl,
    image: article?.introImage?.map(img => img.path),
  };
}

function createBreadcrumbSchema(page: PageData): BreadcrumbListSchema {
  const items: BreadcrumbItemSchema[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: page.domain || '/',
    },
  ];

  // Add breadcrumbs from page data
  if (page.breadcrumbs) {
    page.breadcrumbs.forEach((crumb, index) => {
      items.push({
        '@context': 'https://schema.org',
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.name,
        item: crumb.url,
      });
    });
  } else if (page.article?.H1) {
    // Fallback: add current page
    items.push({
      '@context': 'https://schema.org',
      '@type': 'ListItem',
      position: 2,
      name: page.article.H1,
      item: `${page.domain}/${page.slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function createFAQSchema(blocks: ArticleBlock[]): FAQPageSchema | null {
  const faqBlocks = blocks.filter(
    block => block.type === 'faq' && block.faqs && block.faqs.length > 0
  );

  if (!faqBlocks.length) return null;

  const allFaqs = faqBlocks.flatMap(block => block.faqs || []);

  if (!allFaqs.length) return null;

  const questions: QuestionSchema[] = allFaqs.map(faq => ({
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@context': 'https://schema.org',
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions,
  };
}

function createWebSiteSchema(page: PageData): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: page.siteName || 'PBN Site',
    url: page.domain || '/',
  };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Создать Organization schema.
 */
export function createOrganizationSchema(
  name: string,
  url?: string,
  logoUrl?: string
): OrganizationSchema {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
  };

  if (logoUrl) {
    schema.logo = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: logoUrl,
    };
  }

  return schema;
}

/**
 * Создать Person schema.
 */
export function createPersonSchema(name: string, url?: string): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
  };
}

/**
 * Проверить, готов ли head для рендеринга.
 */
export function isHeadReady(head: ComputedHead): boolean {
  return Boolean(head.title && head.meta?.length);
}

/**
 * Извлечь FAQ данные из blocks.
 */
export function extractFAQsFromBlocks(blocks: ArticleBlock[]): ArticleFaq[] {
  return blocks
    .filter(block => block.type === 'faq' && block.faqs)
    .flatMap(block => block.faqs || []);
}

// ============================================================================
// HeadTag Utilities
// ============================================================================

/**
 * Создать HeadTag из атрибутов.
 */
export function createHeadTag(
  tag: string,
  attributes?: Record<string, string | number | boolean>,
  content?: string
): HeadTag {
  return {
    tag,
    attributes,
    content,
  };
}

/**
 * Конвертировать HeadTag в HTML строку.
 */
export function headTagToHtml(headTag: HeadTag): string {
  const { tag, attributes, content } = headTag;
  
  const attrs = attributes
    ? Object.entries(attributes)
        .map(([key, value]) => {
          if (typeof value === 'boolean') {
            return value ? key : '';
          }
          return `${key}="${String(value)}"`;
        })
        .filter(Boolean)
        .join(' ')
    : '';

  const openTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  if (content) {
    return `${openTag}${content}</${tag}>`;
  }

  // Self-closing tags
  const selfClosingTags = ['meta', 'link', 'base', 'br', 'hr', 'img', 'input'];
  if (selfClosingTags.includes(tag)) {
    return attrs ? `<${tag} ${attrs} />` : `<${tag} />`;
  }

  return `${openTag}</${tag}>`;
}

/**
 * Парсить массив HeadTag в объект для useHead.
 */
export function parseHeadTags(headTags: HeadTag[]): Partial<ComputedHead> {
  const result: Partial<ComputedHead> = {
    meta: [],
    link: [],
    script: [],
  };

  for (const headTag of headTags) {
    switch (headTag.tag) {
      case 'meta':
        if (headTag.attributes) {
          result.meta!.push({
            name: headTag.attributes.name as string | undefined,
            property: headTag.attributes.property as string | undefined,
            content: (headTag.attributes.content as string) || '',
          });
        }
        break;
      case 'link':
        if (headTag.attributes) {
          result.link!.push({
            rel: (headTag.attributes.rel as string) || '',
            href: (headTag.attributes.href as string) || '',
            ...headTag.attributes,
          });
        }
        break;
      case 'script':
        result.script!.push({
          type: headTag.attributes?.type as string | undefined,
          src: headTag.attributes?.src as string | undefined,
          innerHTML: headTag.content,
        });
        break;
      case 'title':
        result.title = headTag.content;
        break;
    }
  }

  return result;
}

// ============================================================================
// Sitemap Utilities
// ============================================================================

/**
 * Создать SitemapUrl из данных страницы.
 */
export function createSitemapUrl(
  loc: string,
  options?: {
    lastmod?: string | Date;
    changefreq?: SitemapUrl['changefreq'];
    priority?: number;
  }
): SitemapUrl {
  return {
    loc,
    lastmod: options?.lastmod instanceof Date
      ? options.lastmod.toISOString().split('T')[0]
      : options?.lastmod,
    changefreq: options?.changefreq,
    priority: options?.priority,
  };
}

/**
 * Генерировать sitemap URL для страницы.
 */
export function pagesToSitemapUrls(
  pages: Array<{ slug: string; updatedAt?: string; priority?: number }>,
  baseUrl: string
): SitemapUrl[] {
  return pages.map(page => createSitemapUrl(
    normalizeUrl(`${baseUrl}/${page.slug}`),
    {
      lastmod: page.updatedAt,
      changefreq: 'weekly',
      priority: page.priority ?? 0.8,
    }
  ));
}

/**
 * Генерировать XML для sitemap.
 */
export function sitemapUrlsToXml(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    let entry = `  <url>\n    <loc>${url.loc}</loc>`;
    if (url.lastmod) {
      entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
    }
    if (url.changefreq) {
      entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
    }
    if (url.priority !== undefined) {
      entry += `\n    <priority>${url.priority}</priority>`;
    }
    entry += '\n  </url>';
    return entry;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

// ============================================================================
// Robots.txt Utilities
// ============================================================================

/**
 * Создать правило robots.txt.
 */
export function createRobotsRule(
  userAgent: string,
  options?: {
    allow?: string[];
    disallow?: string[];
  }
): RobotsRule {
  return {
    userAgent,
    allow: options?.allow,
    disallow: options?.disallow,
  };
}

/**
 * Создать конфигурацию robots.txt по умолчанию.
 */
export function createDefaultRobotsConfig(sitemapUrl?: string): RobotsConfig {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api/', '/_nuxt/', '/admin/', '/private/'],
      },
    ],
    sitemap: sitemapUrl ? [sitemapUrl] : undefined,
  };
}

/**
 * Генерировать robots.txt из конфигурации.
 */
export function robotsConfigToText(config: RobotsConfig): string {
  const lines: string[] = [];

  for (const rule of config.rules) {
    lines.push(`User-agent: ${rule.userAgent}`);
    
    if (rule.allow) {
      for (const path of rule.allow) {
        lines.push(`Allow: ${path}`);
      }
    }
    
    if (rule.disallow) {
      for (const path of rule.disallow) {
        lines.push(`Disallow: ${path}`);
      }
    }
    
    lines.push(''); // Empty line between rules
  }

  if (config.sitemap) {
    for (const sitemap of config.sitemap) {
      lines.push(`Sitemap: ${sitemap}`);
    }
  }

  if (config.host) {
    lines.push(`Host: ${config.host}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Analytics Configuration Utilities
// ============================================================================

/**
 * Создать конфигурацию аналитики.
 */
export function createAnalyticsConfig(options: {
  googleAnalytics?: string;
  googleTagManager?: string;
  yandexMetrica?: string;
  facebookPixel?: string;
  debug?: boolean;
}): AnalyticsConfig {
  const config: AnalyticsConfig = {};

  if (options.googleAnalytics) {
    config.googleAnalytics = {
      id: options.googleAnalytics,
      debug: options.debug,
    };
  }

  if (options.googleTagManager) {
    config.googleTagManager = {
      id: options.googleTagManager,
      debug: options.debug,
    };
  }

  if (options.yandexMetrica) {
    config.yandexMetrica = {
      id: options.yandexMetrica,
      debug: options.debug,
    };
  }

  if (options.facebookPixel) {
    config.facebook = {
      pixelId: options.facebookPixel,
    };
  }

  return config;
}

/**
 * Генерировать скрипты аналитики из конфигурации.
 */
export function analyticsConfigToHeadTags(config: AnalyticsConfig): HeadTag[] {
  const tags: HeadTag[] = [];

  // Google Analytics
  if (config.googleAnalytics?.id) {
    tags.push(createHeadTag('script', {
      async: true,
      src: `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.id}`,
    }));
    
    tags.push(createHeadTag('script', undefined, `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${config.googleAnalytics.id}'${config.googleAnalytics.debug ? ", { 'debug_mode': true }" : ''});
    `));
  }

  // Google Tag Manager
  if (config.googleTagManager?.id) {
    tags.push(createHeadTag('script', undefined, `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${config.googleTagManager.id}');
    `));
  }

  // Yandex Metrica
  if (config.yandexMetrica?.id) {
    tags.push(createHeadTag('script', undefined, `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();
      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(${config.yandexMetrica.id}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
    `));
  }

  // Facebook Pixel
  if (config.facebook?.pixelId) {
    tags.push(createHeadTag('script', undefined, `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.facebook.pixelId}');
      fbq('track', 'PageView');
    `));
  }

  return tags;
}

/**
 * Composable для управления аналитикой.
 */
export function useAnalytics(config: AnalyticsConfig) {
  const isInitialized = ref(false);
  const headTags = computed(() => analyticsConfigToHeadTags(config));

  const init = (): void => {
    if (isInitialized.value) return;
    
    // Apply analytics scripts
    const parsedHead = parseHeadTags(headTags.value);
    if (parsedHead.script?.length) {
      useHead({ script: parsedHead.script });
    }
    
    isInitialized.value = true;
  };

  const trackEvent = (eventName: string, params?: Record<string, any>): void => {
    // Google Analytics
    if (config.googleAnalytics?.id && typeof window !== 'undefined') {
      (window as any).gtag?.('event', eventName, params);
    }
    
    // Yandex Metrica
    if (config.yandexMetrica?.id && typeof window !== 'undefined') {
      (window as any).ym?.(config.yandexMetrica.id, 'reachGoal', eventName, params);
    }
    
    // Facebook Pixel
    if (config.facebook?.pixelId && typeof window !== 'undefined') {
      (window as any).fbq?.('track', eventName, params);
    }
  };

  const trackPageView = (path?: string): void => {
    // Google Analytics
    if (config.googleAnalytics?.id && typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'page_view', { page_path: path || window.location.pathname });
    }
    
    // Yandex Metrica
    if (config.yandexMetrica?.id && typeof window !== 'undefined') {
      (window as any).ym?.(config.yandexMetrica.id, 'hit', path || window.location.pathname);
    }
    
    // Facebook Pixel
    if (config.facebook?.pixelId && typeof window !== 'undefined') {
      (window as any).fbq?.('track', 'PageView');
    }
  };

  return {
    isInitialized: readonly(isInitialized),
    headTags,
    init,
    trackEvent,
    trackPageView,
  };
}

// ============================================================================
// Image & Answer Schema Utilities
// ============================================================================

/**
 * Создать ImageObjectSchema из URL.
 */
export function createImageObjectSchema(
  url: string,
  options?: { width?: number; height?: number }
): ImageObjectSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url,
    width: options?.width,
    height: options?.height,
  };
}

/**
 * Создать AnswerSchema из текста.
 */
export function createAnswerSchema(text: string): AnswerSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Answer',
    text,
  };
}

// ============================================================================
// Core Web Vitals & Performance Utilities
// ============================================================================

/**
 * Создать объект Core Web Vitals.
 */
export function createCoreWebVitals(metrics: {
  lcp?: number;
  cls?: number;
  inp?: number;
  fcp?: number;
  ttfb?: number;
}): CoreWebVitals {
  return {
    lcp: metrics.lcp,
    cls: metrics.cls,
    inp: metrics.inp,
    fcp: metrics.fcp,
    ttfb: metrics.ttfb,
  };
}

/**
 * Проверить, соответствуют ли Core Web Vitals рекомендуемым значениям Google.
 */
export function validateCoreWebVitals(vitals: CoreWebVitals): {
  lcp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  cls: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  inp: 'good' | 'needs-improvement' | 'poor' | 'unknown';
  overallScore: 'good' | 'needs-improvement' | 'poor';
} {
  const lcpStatus = vitals.lcp
    ? vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'needs-improvement' : 'poor'
    : 'unknown';

  const clsStatus = vitals.cls
    ? vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'needs-improvement' : 'poor'
    : 'unknown';

  const inpStatus = vitals.inp
    ? vitals.inp <= 200 ? 'good' : vitals.inp <= 500 ? 'needs-improvement' : 'poor'
    : 'unknown';

  const statuses = [lcpStatus, clsStatus, inpStatus].filter(s => s !== 'unknown');
  const overallScore = statuses.includes('poor')
    ? 'poor'
    : statuses.includes('needs-improvement')
      ? 'needs-improvement'
      : 'good';

  return { lcp: lcpStatus, cls: clsStatus, inp: inpStatus, overallScore };
}

/**
 * Создать объект PerformanceMetrics.
 */
export function createPerformanceMetrics(options: {
  coreWebVitals: CoreWebVitals;
  bundleSize?: number;
  imageOptimization?: boolean;
  lazyLoading?: boolean;
}): PerformanceMetrics {
  return {
    coreWebVitals: options.coreWebVitals,
    bundleSize: options.bundleSize,
    imageOptimization: options.imageOptimization ?? true,
    lazyLoading: options.lazyLoading ?? true,
  };
}

/**
 * Composable для отслеживания Core Web Vitals.
 */
export function useCoreWebVitals() {
  const vitals = ref<CoreWebVitals>({});
  const isCollecting = ref(false);

  const startCollecting = (): void => {
    if (typeof window === 'undefined' || isCollecting.value) return;

    isCollecting.value = true;

    // LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          vitals.value.lcp = lastEntry?.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch { /* LCP not supported */ }

      // CLS
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              vitals.value.cls = clsValue;
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch { /* CLS not supported */ }

      // INP (via first-input as approximation)
      try {
        const inpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries() as any[];
          const lastEntry = entries[entries.length - 1];
          vitals.value.inp = lastEntry?.processingStart - lastEntry?.startTime;
        });
        inpObserver.observe({ type: 'first-input', buffered: true });
      } catch { /* INP not supported */ }
    }

    // FCP
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        vitals.value.fcp = fcpEntry.startTime;
      }
    }

    // TTFB
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length) {
        vitals.value.ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
      }
    }
  };

  const getValidation = () => validateCoreWebVitals(vitals.value);

  return {
    vitals: readonly(vitals),
    isCollecting: readonly(isCollecting),
    startCollecting,
    getValidation,
  };
}

// ============================================================================
// SEO Strategy Utilities
// ============================================================================

/**
 * Определить оптимальную SEO стратегию на основе данных страницы.
 */
export function determineSeoStrategy(page: PageData): SeoStrategy {
  // Static: для страниц без динамического контента
  if (!page.offer && !page.article?.blocks?.some(b => b.type === 'dynamic')) {
    return 'static';
  }

  // Hybrid: для страниц с offer контентом
  if (page.offer) {
    return 'hybrid';
  }

  // Dynamic: для полностью динамических страниц
  return 'dynamic';
}

/**
 * Получить рекомендации по SEO стратегии.
 */
export function getSeoStrategyRecommendations(strategy: SeoStrategy): {
  caching: string;
  rendering: string;
  preload: boolean;
  prefetch: boolean;
} {
  switch (strategy) {
    case 'static':
      return {
        caching: 'max-age=3600, stale-while-revalidate=86400',
        rendering: 'SSG (Static Site Generation)',
        preload: true,
        prefetch: true,
      };
    case 'hybrid':
      return {
        caching: 'max-age=60, stale-while-revalidate=3600',
        rendering: 'ISR (Incremental Static Regeneration)',
        preload: true,
        prefetch: false,
      };
    case 'dynamic':
      return {
        caching: 'no-cache, must-revalidate',
        rendering: 'SSR (Server Side Rendering)',
        preload: false,
        prefetch: false,
      };
  }
}
