/**
 * SEO Types
 * Типы для SEO и Schema.org в PBN Template System
 */

// ============================================================================
// Schema.org Types
// ============================================================================

export interface SchemaOrgBase {
  '@context': 'https://schema.org';
  '@type': string;
}

export interface ArticleSchema extends SchemaOrgBase {
  '@type': 'Article';
  headline: string;
  description?: string;
  image?: string | string[];
  datePublished?: string;
  dateModified?: string;
  author?: OrganizationSchema | PersonSchema;
  publisher?: OrganizationSchema;
  mainEntityOfPage?: string;
}

export interface OrganizationSchema extends SchemaOrgBase {
  '@type': 'Organization';
  name: string;
  logo?: ImageObjectSchema;
  url?: string;
}

export interface PersonSchema extends SchemaOrgBase {
  '@type': 'Person';
  name: string;
  url?: string;
}

export interface ImageObjectSchema extends SchemaOrgBase {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
}

export interface BreadcrumbListSchema extends SchemaOrgBase {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItemSchema[];
}

export interface BreadcrumbItemSchema extends SchemaOrgBase {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface FAQPageSchema extends SchemaOrgBase {
  '@type': 'FAQPage';
  mainEntity: QuestionSchema[];
}

export interface QuestionSchema extends SchemaOrgBase {
  '@type': 'Question';
  name: string;
  acceptedAnswer: AnswerSchema;
}

export interface AnswerSchema extends SchemaOrgBase {
  '@type': 'Answer';
  text: string;
}

export interface WebSiteSchema extends SchemaOrgBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: SearchActionSchema;
}

export interface SearchActionSchema extends SchemaOrgBase {
  '@type': 'SearchAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
  };
  'query-input': string;
}

// ============================================================================
// SEO Configuration
// ============================================================================

export interface SeoConfig {
  title: {
    template?: string;
    separator?: string;
    default?: string;
  };
  meta: {
    description?: string;
    keywords?: string;
    author?: string;
    viewport?: string;
    robots?: string;
  };
  openGraph: {
    type?: string;
    siteName?: string;
    locale?: string;
    image?: string;
  };
  twitter: {
    card?: string;
    site?: string;
    creator?: string;
  };
  canonical?: {
    baseUrl: string;
    trailingSlash?: boolean;
  };
}

// ============================================================================
// Head Management
// ============================================================================

export interface HeadTag {
  tag: string;
  attributes?: Record<string, string | number | boolean>;
  content?: string;
}

export interface ComputedHead {
  title?: string;
  meta: Array<{
    name?: string;
    property?: string;
    content: string;
    key?: string;
  }>;
  link: Array<{
    rel: string;
    href: string;
    [key: string]: any;
  }>;
  script?: Array<{
    type?: string;
    src?: string;
    innerHTML?: string;
    [key: string]: any;
  }>;
  htmlAttrs?: Record<string, string>;
  bodyAttrs?: Record<string, string>;
}

// ============================================================================
// Core Web Vitals
// ============================================================================

export interface CoreWebVitals {
  lcp?: number;  // Largest Contentful Paint
  cls?: number;  // Cumulative Layout Shift
  inp?: number;  // Interaction to Next Paint
  fcp?: number;  // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  bundleSize?: number;
  imageOptimization?: boolean;
  lazyLoading?: boolean;
}

// ============================================================================
// Sitemap & Robots
// ============================================================================

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface RobotsRule {
  userAgent: string;
  allow?: string[];
  disallow?: string[];
}

export interface RobotsConfig {
  rules: RobotsRule[];
  sitemap?: string[];
  host?: string;
}

// ============================================================================
// Analytics & Tracking
// ============================================================================

export interface AnalyticsConfig {
  googleAnalytics?: {
    id: string;
    debug?: boolean;
  };
  googleTagManager?: {
    id: string;
    debug?: boolean;
  };
  yandexMetrica?: {
    id: string;
    debug?: boolean;
  };
  facebook?: {
    pixelId: string;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export type SchemaType =
  | 'Article'
  | 'Organization'
  | 'Person'
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'WebSite';

export type SeoStrategy = 'static' | 'dynamic' | 'hybrid';