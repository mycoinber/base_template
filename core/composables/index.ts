/**
 * Core Composables Index
 * Экспорт всех Core composables для удобного импорта
 */

// Data fetching composables
export { usePageData, normalizeBlocks, normalizeMediaArray, buildPageEndpoint } from './usePageData';
export { useOffer, useOfferState, useMultipleOffers } from './useOffer';
export {
  useSiteManifest,
  getAssetFromManifest,
  getFaviconFromManifest,
  getLogoFromManifest,
  isManifestLoaded,
  getManifestState,
  clearManifestState
} from './useSiteManifest';

// Navigation composables
export {
  useNavigation,
  getNavigationState,
  clearNavigationState,
  updateNavigationState,
  isActivePage,
  getPageUrl,
  buildNavigationTree
} from './useNavigation';

// SEO composables
export {
  useSeo,
  useSimpleSeo,
  useGlobalSeo,
  getCurrentSeo,
  createOrganizationSchema,
  createPersonSchema,
  isHeadReady,
  extractFAQsFromBlocks,
  // HeadTag utilities
  createHeadTag,
  headTagToHtml,
  parseHeadTags,
  // Sitemap utilities
  createSitemapUrl,
  pagesToSitemapUrls,
  sitemapUrlsToXml,
  // Robots utilities
  createRobotsRule,
  createDefaultRobotsConfig,
  robotsConfigToText,
  // Analytics utilities
  createAnalyticsConfig,
  analyticsConfigToHeadTags,
  useAnalytics,
  // Image & Answer Schema utilities
  createImageObjectSchema,
  createAnswerSchema,
  // Core Web Vitals utilities
  createCoreWebVitals,
  validateCoreWebVitals,
  createPerformanceMetrics,
  useCoreWebVitals,
  // SEO Strategy utilities
  determineSeoStrategy,
  getSeoStrategyRecommendations,
} from './useSeo';

// Re-export types for convenience
export type { UsePageDataReturn } from './usePageData';
export type { UseOfferReturn, OfferQueryOptions } from './useOffer';
export type { UseSiteManifestReturn } from './useSiteManifest';
export type { UseNavigationReturn, NavigationOptions } from './useNavigation';
export type { UseSeoReturn, SeoOptions, MetaItem } from './useSeo';
