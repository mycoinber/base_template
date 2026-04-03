/**
 * Core useNavigation Composable
 * Headless navigation management
 */

import { computed, type Ref } from 'vue';
import type { SiteNavigation, NavigationItem } from '@/core/types/page';

// ============================================================================
// Types
// ============================================================================

interface AxiosInstance {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>;
}


export interface NavigationError {
  message: string;
  code?: string;
}

export interface UseNavigationReturn {
  navigation: Ref<SiteNavigation | null>;
  pages: Ref<NavigationItem[]>;
  homePage: Ref<NavigationItem | null>;
  currentPage: Ref<NavigationItem | null>;
  breadcrumbs: Ref<NavigationItem[]>;
  isLoading: Ref<boolean>;
  error: Ref<NavigationError | null>;
  refresh: () => Promise<void>;
  findPage: (slug: string) => NavigationItem | null;
  getPageParents: (slug: string) => NavigationItem[];
  getPageChildren: (slug: string) => NavigationItem[];
}

export interface NavigationOptions {
  autoRefresh?: boolean;
  cacheTime?: number;
  includeHidden?: boolean;
}

// ============================================================================
// Main Composable
// ============================================================================

export async function useNavigation(
  siteId?: string,
  options: NavigationOptions = {}
): Promise<UseNavigationReturn> {
  const nuxtApp = useNuxtApp();
  const route = useRoute();
  const $axios = (nuxtApp as any).$axios as AxiosInstance;
  const runtimeConfig = useRuntimeConfig();
  const resolvedSiteId = siteId
    || (import.meta.server ? runtimeConfig.server.siteId : runtimeConfig.public.siteId)
    || undefined;

  if (!$axios) {
    console.warn('[useNavigation] $axios is not available');
  }

  // Default options
  const defaultOptions: Required<NavigationOptions> = {
    autoRefresh: false,
    cacheTime: 5 * 60 * 1000, // 5 minutes
    includeHidden: false,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  // State
  const navigation = useState<SiteNavigation | null>('siteNavigation', () => null);
  const isLoading = useState<boolean>('navigationLoading', () => false);
  const error = useState<NavigationError | null>('navigationError', () => null);

  // Fetch navigation data
  const fetchNavigation = async (): Promise<void> => {
    if (!resolvedSiteId && !import.meta.server) {
      if (process.dev) {
        console.warn('[useNavigation] No siteId provided');
      }
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      if (process.dev) {
        console.info(`[useNavigation] Fetching navigation for site: ${resolvedSiteId || 'runtime-config'}`);
      }

      const response = await $axios.get('/nav', {
        params: resolvedSiteId ? { siteId: resolvedSiteId } : undefined,
      });

      const navData = response.data;

      if (process.dev) {
        console.info('[useNavigation] Fetched navigation data:', navData);
      }

      // Normalize navigation data
      navigation.value = normalizeNavigation(navData);
    } catch (err: any) {
      error.value = {
        message: err instanceof Error ? err.message : 'Failed to fetch navigation',
        code: 'FETCH_ERROR',
      };
      if (process.dev) {
        console.error('[useNavigation] Failed to fetch navigation:', err);
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Initial fetch — await на сервере для SSR, fire-and-forget на клиенте
  if (!navigation.value) {
    if (import.meta.server) {
      await fetchNavigation();
    } else {
      fetchNavigation();
    }
  }

  // Auto refresh
  if (mergedOptions.autoRefresh) {
    const interval = setInterval(fetchNavigation, mergedOptions.cacheTime);

    onUnmounted(() => {
      clearInterval(interval);
    });
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const pages = computed<NavigationItem[]>(() => {
    return navigation.value?.pages || [];
  });

  const homePage = computed<NavigationItem | null>(() => {
    return pages.value.find(page => page.homePage === true) || null;
  });

  const currentPage = computed<NavigationItem | null>(() => {
    const currentSlug = route.params.slug;
    const slug = Array.isArray(currentSlug)
      ? currentSlug.join('/')
      : currentSlug || '';

    return findPageBySlug(slug) || homePage.value;
  });

  const breadcrumbs = computed<NavigationItem[]>(() => {
    if (!currentPage.value) return [];

    const parents = getPageParents(currentPage.value.slug);
    return [homePage.value, ...parents, currentPage.value].filter(Boolean) as NavigationItem[];
  });

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const findPage = (slug: string): NavigationItem | null => {
    return findPageBySlug(slug);
  };

  const findPageBySlug = (slug: string): NavigationItem | null => {
    if (!slug || !pages.value.length) return null;

    // Direct match
    const directMatch = pages.value.find(page => page.slug === slug);
    if (directMatch) return directMatch;

    // Search in children (recursive)
    for (const page of pages.value) {
      if (page.children?.length) {
        const childMatch = findInChildren(page.children, slug);
        if (childMatch) return childMatch;
      }
    }

    return null;
  };

  const findInChildren = (children: NavigationItem[], slug: string): NavigationItem | null => {
    for (const child of children) {
      if (child.slug === slug) return child;

      if (child.children?.length) {
        const nestedMatch = findInChildren(child.children, slug);
        if (nestedMatch) return nestedMatch;
      }
    }

    return null;
  };

  const getPageParents = (slug: string): NavigationItem[] => {
    const parents: NavigationItem[] = [];

    const findParents = (items: NavigationItem[], targetSlug: string, currentParents: NavigationItem[]): boolean => {
      for (const item of items) {
        if (item.slug === targetSlug) {
          parents.push(...currentParents);
          return true;
        }

        if (item.children?.length) {
          const found = findParents(item.children, targetSlug, [...currentParents, item]);
          if (found) return true;
        }
      }

      return false;
    };

    findParents(pages.value, slug, []);

    return parents;
  };

  const getPageChildren = (slug: string): NavigationItem[] => {
    const page = findPageBySlug(slug);
    return page?.children || [];
  };

  const refresh = async (): Promise<void> => {
    await fetchNavigation();
  };

  return {
    navigation,
    pages,
    homePage,
    currentPage,
    breadcrumbs,
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh,
    findPage,
    getPageParents,
    getPageChildren,
  };
}

// ============================================================================
// Navigation Normalization
// ============================================================================

function normalizeNavigation(rawNav: any): SiteNavigation {
  if (!rawNav || typeof rawNav !== 'object') {
    throw new Error('Invalid navigation data');
  }

  return {
    siteId: rawNav.siteId || '',
    pages: normalizeNavigationPages(rawNav.pages || []),
  };
}

function normalizeNavigationPages(rawPages: any[]): NavigationItem[] {
  if (!Array.isArray(rawPages)) return [];

  return rawPages
    .map((page, index) => ({
      slug: page.slug || '',
      title: page.title || `Page ${index + 1}`,
      homePage: Boolean(page.homePage),
      order: page.order ?? index,
      parent: page.parent || undefined,
      children: page.children ? normalizeNavigationPages(page.children) : undefined,
    }))
    .filter(page => page.slug && page.title)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

// ============================================================================
// Navigation State Helpers
// ============================================================================

/**
 * Get navigation state without triggering a fetch
 */
export function getNavigationState(): SiteNavigation | null {
  return useState<SiteNavigation | null>('siteNavigation', () => null).value;
}

/**
 * Clear navigation state
 */
export function clearNavigationState(): void {
  const navigationState = useState<SiteNavigation | null>('siteNavigation', () => null);
  navigationState.value = null;
}

/**
 * Update navigation state
 */
export function updateNavigationState(navigation: SiteNavigation): void {
  const navigationState = useState<SiteNavigation | null>('siteNavigation', () => null);
  navigationState.value = navigation;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if current route matches navigation item
 */
export function isActivePage(page: NavigationItem, currentSlug?: string): boolean {
  const route = useRoute();
  const slug = currentSlug || (Array.isArray(route.params.slug)
    ? route.params.slug.join('/')
    : route.params.slug || '');

  return page.slug === slug ||
         (page.homePage === true && (!slug || slug === ''));
}

/**
 * Get page URL for navigation
 */
export function getPageUrl(page: NavigationItem, includeHome: boolean = true): string {
  if (page.homePage === true && includeHome) {
    return '/';
  }

  return page.slug ? `/${page.slug}` : '/';
}

/**
 * Build navigation tree from flat array
 */
export function buildNavigationTree(flatPages: NavigationItem[]): NavigationItem[] {
  const pageMap = new Map<string, NavigationItem>();
  const rootPages: NavigationItem[] = [];

  // Create map for quick lookup
  flatPages.forEach(page => {
    pageMap.set(page.slug, { ...page, children: [] });
  });

  // Build tree structure
  flatPages.forEach(page => {
    const pageItem = pageMap.get(page.slug)!;

    if (page.parent) {
      const parent = pageMap.get(page.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(pageItem);
      } else {
        rootPages.push(pageItem);
      }
    } else {
      rootPages.push(pageItem);
    }
  });

  return rootPages.sort((a, b) => (a.order || 0) - (b.order || 0));
}
