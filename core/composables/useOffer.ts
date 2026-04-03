/**
 * Core useOffer Composable
 * Headless data fetching для офферов
 */

import { computed, unref, type Ref } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { OfferData } from '@/core/types/page';

type MaybeRef<T> = T | Ref<T>;

// ============================================================================
// Types
// ============================================================================

interface AxiosInstance {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>;
}

export interface UseOfferReturn {
  offer: Ref<OfferData | null | undefined>;
  isPending: Ref<boolean>;
  isError: Ref<boolean>;
  error: Ref<Error | null>;
  refetch: () => Promise<any>;
  isLoading: Ref<boolean>;
  isSuccess: Ref<boolean>;
}

export interface OfferQueryOptions {
  enabled?: MaybeRef<boolean>;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
}

// ============================================================================
// Main Composable
// ============================================================================

export function useOffer(
  offerId: MaybeRef<string | null | undefined>,
  options: OfferQueryOptions = {}
): UseOfferReturn {
  const nuxtApp = useNuxtApp();
  const $axios = (nuxtApp as any).$axios as AxiosInstance;

  // Default options - исправляем enabled для правильной типизации
  const defaultOptions: OfferQueryOptions = {
    enabled: computed(() => {
      const hasId = Boolean(unref(offerId));
      const isClient = Boolean(import.meta.client);
      return hasId && isClient;
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const fetchOffer = async (): Promise<OfferData | null> => {
    const id = unref(offerId);

    if (!id) {
      if (process.dev) {
        console.warn('[useOffer] No offer ID provided');
      }
      return null;
    }

    try {
      if (process.dev) {
        console.info(`[useOffer] Fetching offer: ${id}`);
      }

      const response = await $axios.get(`/public/offer/${id}`);
      const offerData = response.data;

      if (process.dev) {
        console.info('[useOffer] Fetched offer data:', offerData);
      }

      // Normalize offer data
      return normalizeOfferData(offerData);
    } catch (error: any) {
      if (process.dev) {
        console.error('[useOffer] Failed to fetch offer:', error);
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: computed(() => ['offer', unref(offerId) || null]),
    queryFn: fetchOffer,
    enabled: mergedOptions.enabled,
    staleTime: mergedOptions.staleTime,
    gcTime: mergedOptions.gcTime,
    refetchOnWindowFocus: mergedOptions.refetchOnWindowFocus,
    retry: mergedOptions.retry,
  });

  return {
    offer: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isLoading: query.isPending, // Alias for better DX
    isSuccess: query.isSuccess,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

const normalizeOfferData = (rawOffer: any): OfferData => {
  if (!rawOffer || typeof rawOffer !== 'object') {
    throw new Error('Invalid offer data received');
  }

  return {
    _id: rawOffer._id || rawOffer.id || '',
    label: rawOffer.label || rawOffer.title || '',
    title: rawOffer.title || rawOffer.label || '',
    button1: rawOffer.button1 || rawOffer.primaryButton || 'Play Now',
    button2: rawOffer.button2 || rawOffer.secondaryButton || 'Play',
    link: rawOffer.link || rawOffer.url || '#',
    background: normalizeOfferBackground(rawOffer.background),
    sections: normalizeOfferSections(rawOffer.sections),
  };
};

const normalizeOfferBackground = (background: any) => {
  if (!background) return [];

  const backgrounds = Array.isArray(background) ? background : [background];

  return backgrounds
    .filter((bg) => bg && typeof bg === 'object' && bg.path)
    .map((bg) => ({
      path: bg.path,
      alt: bg.alt || 'Offer background',
    }));
};

const normalizeOfferSections = (sections: any) => {
  if (!Array.isArray(sections)) return [];

  return sections
    .map((section, index) => ({
      _id: section._id || `section-${index}`,
      type: section.type || 'hero',
      headline: section.headline || section.title || '',
      content: section.content || '',
      images: normalizeOfferBackground(section.images || section.image),
      link: section.link || '',
      cta: section.cta || section.button || '',
      order: section.order ?? index,
    }))
    .filter((section) => section.headline || section.content);
};

// ============================================================================
// Offer State Management
// ============================================================================

/**
 * Global offer state management
 * Используется для синхронизации активного оффера между компонентами
 */
export function useOfferState() {
  const currentOfferId = useState<string | null>('currentOfferId', () => null);
  const currentOffer = useState<OfferData | null>('currentOffer', () => null);

  const setCurrentOffer = (offerId: string | null, offerData?: OfferData | null) => {
    currentOfferId.value = offerId;
    if (offerData !== undefined) {
      currentOffer.value = offerData;
    }
  };

  const clearCurrentOffer = () => {
    currentOfferId.value = null;
    currentOffer.value = null;
  };

  return {
    currentOfferId: readonly(currentOfferId),
    currentOffer: readonly(currentOffer),
    setCurrentOffer,
    clearCurrentOffer,
  };
}

// ============================================================================
// Multiple Offers Support
// ============================================================================

/**
 * Fetch multiple offers at once
 * Полезно для страниц с несколькими офферами
 */
export function useMultipleOffers(
  offerIds: MaybeRef<string[]>,
  options: OfferQueryOptions = {}
) {
  const nuxtApp = useNuxtApp();
  const $axios = (nuxtApp as any).$axios as AxiosInstance;

  const enabled = computed(() => {
    const ids = unref(offerIds);
    const hasIds = Array.isArray(ids) && ids.length > 0;
    const isClient = Boolean(import.meta.client);
    return hasIds && isClient;
  });

  const fetchOffers = async (): Promise<OfferData[]> => {
    const ids = unref(offerIds);

    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }

    try {
      // Fetch all offers in parallel
      const responses = await Promise.all(
        ids.map(id => $axios.get(`/public/offer/${id}`))
      );

      return responses
        .map((response: { data: any }) => normalizeOfferData(response.data))
        .filter(Boolean) as OfferData[];
    } catch (error: any) {
      if (process.dev) {
        console.error('[useMultipleOffers] Failed to fetch offers:', error);
      }
      throw error;
    }
  };

  const query = useQuery({
    queryKey: computed(() => ['offers', unref(offerIds)]),
    queryFn: fetchOffers,
    enabled,
    staleTime: options.staleTime || 5 * 60 * 1000,
    gcTime: options.gcTime || 10 * 60 * 1000,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    retry: options.retry || 2,
  });

  return {
    offers: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export {
  normalizeOfferData,
  normalizeOfferBackground,
  normalizeOfferSections,
};
