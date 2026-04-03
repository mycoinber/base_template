/**
 * Page Data Types
 * Типы для данных страниц в PBN Template System
 */

// ============================================================================
// Basic Page Data
// ============================================================================

export interface PageHead {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  meta?: MetaTag[];
  robots?: RobotsConfig;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
  key?: string;
  type?: 'name' | 'property' | 'http-equiv';
}

export interface RobotsConfig {
  index?: boolean;
  follow?: boolean;
  metaTags?: MetaTag[];
}

// ============================================================================
// Article Data
// ============================================================================

export interface ArticleImage {
  path: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

export interface ArticleBlock {
  _id: string;
  type: string;
  H2?: string;
  content?: string;
  headline?: string;
  images?: ArticleImage[];
  link?: string;
  cta?: string;
  order?: number;

  // Extended properties for complex blocks
  faqs?: ArticleFaq[];
  reviews?: ArticleReview[];
}

export interface ArticleFaq {
  _id?: string;
  question: string;
  answer: string;
}

export interface ArticleReview {
  _id?: string;
  name: string;
  comment: string;
  rating?: number;
  date?: string;
  author?: {
    picture?: ArticleImage[];
    [key: string]: any;
  };
}

export interface Article {
  H1: string;
  intro: string;
  blocks: ArticleBlock[];
  introImage?: ArticleImage[];
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
}

// ============================================================================
// Offer Data
// ============================================================================

export interface OfferBackground {
  path: string;
  alt?: string;
}

export interface OfferData {
  _id: string;
  label: string;
  title: string;
  button1?: string;
  button2?: string;
  link?: string;
  background?: OfferBackground[];
  sections?: ArticleBlock[];
}

// ============================================================================
// Hero Data
// ============================================================================

export interface HeroImage {
  path: string;
  alt?: string;
  title?: string;
}

// ============================================================================
// Gallery Data
// ============================================================================

export interface GalleryImage {
  id?: string;
  path: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
}

// ============================================================================
// Page Offers (placement-based)
// ============================================================================

export interface PageOfferData {
  _id?: string;
  title?: string;
  label?: string;
  description?: string;
  link?: string;
  ctaText?: string;
  lang?: string;
  imageMedia?: { path: string; alt?: string };
  logo?: Array<{ path: string; alt?: string }>;
  [key: string]: any;
}

export interface PageOffer {
  offer: string;
  placement: string;
  data: PageOfferData;
}

// ============================================================================
// Page Data (Complete)
// ============================================================================

export interface PageData {
  _id: string;
  slug: string;
  type: string;
  domain: string;
  siteName: string;
  siteId: string;
  lang?: string;
  locale?: string;

  // SEO & Meta
  head: PageHead;

  // Content
  article: Article;

  // Features
  offer?: OfferData;
  offers?: PageOffer[];
  hero?: HeroImage[];
  gallery?: GalleryImage[];

  // Timestamps
  createdAt?: string;
  updatedAt?: string;

  // Navigation
  breadcrumbs?: Breadcrumb[];

  // Custom fields
  customFields?: Record<string, any>;
}

// ============================================================================
// Navigation & Breadcrumbs
// ============================================================================

export interface Breadcrumb {
  name: string;
  url: string;
  position?: number;
}

export interface NavigationItem {
  slug: string;
  title: string;
  homePage?: boolean;
  order?: number;
  parent?: string;
  children?: NavigationItem[];
}

export interface SiteNavigation {
  siteId: string;
  pages: NavigationItem[];
}

// ============================================================================
// Site Manifest
// ============================================================================

export interface SiteAsset {
  type: string;
  url: string;
  path: string;
  size?: number;
  mimeType?: string;
}

export interface WebsiteManifestPayload {
  siteId: string;
  title: string;
  description: string;
  domain: string;
  favicon?: string;
  logo?: string;
  assets: SiteAsset[];
  metadata?: Record<string, any>;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface PageError {
  statusCode: number;
  statusMessage: string;
  message?: string;
  stack?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type PageStatus = 'draft' | 'published' | 'archived';
export type PageType = 'article' | 'landing' | 'home' | 'category';

// Extract article block types
export type ArticleBlockType = ArticleBlock['type'];

// Extract meta tag types
export type MetaTagType = MetaTag['type'];

// Note: Removed export default to comply with verbatimModuleSyntax
// Use named import: import { PageData } from './page'
