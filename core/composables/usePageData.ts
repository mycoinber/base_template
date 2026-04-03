/**
 * Core usePageData Composable
 * Headless data fetching для страниц (без UI зависимостей)
 */

import { useNuxtApp, useAsyncData } from "#app";
import { createError } from "#imports";
import { watch, computed, type Ref } from "vue";
import type {
  PageData,
  ArticleBlock,
  ArticleImage,
  ApiResponse,
  PaginatedResponse,
  PageError,
  PageStatus,
  PageType
} from '@/core/types/page';

// ============================================================================
// Utility Functions
// ============================================================================

const ensureArray = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) return value;
  return value != null ? [value] : [];
};

const normalizeMediaArray = (value: any): ArticleImage[] => {
  return ensureArray(value)
    .map((entry) => (entry && typeof entry === "object" ? entry : null))
    .filter((entry): entry is ArticleImage => Boolean(entry?.path))
    .map(entry => ({
      path: entry.path,
      alt: entry.alt || '',
      title: entry.title,
      width: entry.width,
      height: entry.height,
    }));
};

const normalizeFaqs = (faqs: any, blockId: string) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return [];

  return faqs
    .map((faq, index) => ({
      _id: faq?._id || `${blockId}-faq-${index}`,
      question: faq?.question || "",
      answer: faq?.answer || "",
    }))
    .filter((faq) => faq.question && faq.answer);
};

const stripHtml = (value: unknown): string =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";

const normalizeReviews = (reviews: any, blockId: string) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return [];

  return reviews
    .map((review, index) => {
      const avatarPictures = normalizeMediaArray(
        review?.author?.picture || review?.authorAvatar || review?.authorAvatarMedia,
      );
      const comment = review?.comment || review?.content || "";

      return {
        ...review,
        _id: review?._id || `${blockId}-review-${index}`,
        name: review?.name || review?.authorBio || review?.author || `Reviewer ${index + 1}`,
        comment,
        rating: review?.rating ?? null,
        date: review?.date || review?.updatedAt || review?.createdAt || new Date().toISOString(),
        author: {
          ...(review?.author || {}),
          picture: avatarPictures,
        },
      };
    })
    .filter((review) => Boolean(stripHtml(review.comment)));
};

const normalizeBlocks = (blocks: any[] | undefined): ArticleBlock[] => {
  if (!Array.isArray(blocks)) return [];

  return blocks.map((block, index) => {
    const blockId = block?._id || block?.id || `block-${index}`;
    const imageCandidates = block?.imageUrl || block?.imageMedia || block?.image || block?.hero || [];

    return {
      _id: blockId,
      type: block?.type || 'default',
      H2: block?.H2 || block?.headline || block?.title || "",
      content: block?.content || "",
      headline: block?.headline || block?.H2 || "",
      images: normalizeMediaArray(imageCandidates),
      link: block?.link || "",
      cta: block?.cta || "",
      order: block?.order ?? index,
      // Extended properties for complex blocks
      faqs: normalizeFaqs(block?.faqs, blockId),
      reviews: normalizeReviews(block?.reviews, blockId),
    };
  });
};

const normalizePageResponse = (payload: any, slug: string | null): PageData => {
  if (!payload || typeof payload !== "object") {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
    });
  }

  const article = payload.article || {};
  const normalizedBlocks = normalizeBlocks(article.blocks);

  // Find intro block for hero images
  const introBlock = normalizedBlocks.find(
    (block) => block.type.toLowerCase() === "intro"
  );

  const heroImages = Array.isArray(payload.hero) && payload.hero.length
    ? normalizeMediaArray(payload.hero)
    : introBlock?.images?.length
      ? introBlock.images
      : [];

  return {
    _id: payload._id || payload.id || '',
    slug: payload.slug || slug || "",
    type: payload.type || "page",
    domain: payload.domain || '',
    siteName: payload.siteName || '',
    siteId: payload.siteId || '',
    lang: payload.lang || 'en',
    locale: payload.locale || 'en',

    // SEO & Meta
    head: {
      title: payload.head?.title || article.H1 || '',
      description: payload.head?.description || '',
      keywords: payload.head?.keywords || '',
      canonical: payload.head?.canonical || '',
      meta: payload.head?.meta || [],
      robots: payload.head?.robots,
    },

    // Content
    article: {
      H1: article.H1 || article.h1 || payload.head?.title || "",
      intro: article.intro || introBlock?.content || "",
      blocks: normalizedBlocks,
      introImage: heroImages,
      author: article.author,
      publishedAt: article.publishedAt || payload.createdAt,
      updatedAt: article.updatedAt || payload.updatedAt,
    },

    // Features
    offer: payload.offer,
    offers: Array.isArray(payload.offers) ? payload.offers : [],
    hero: heroImages,

    // Timestamps
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,

    // Author (full object from API, includes avatarMedia, bio, role)
    author: payload.author || null,

    // Custom fields
    customFields: payload.customFields || {},
  };
};

const buildPageEndpoint = (slug: string | null): string => {
  const segments = typeof slug === "string" && slug.trim()
    ? slug.split("/").filter(Boolean).map((segment) => encodeURIComponent(segment))
    : [];

  if (!segments.length) {
    return "/pages";
  }
  return `/pages/${segments.join("/")}`;
};

// ============================================================================
// Main Composable Interfaces
// ============================================================================

export interface UsePageDataReturn {
  data: Ref<PageData | null>;
  pending: Ref<boolean>;
  error: Ref<PageError | null>;
  refresh: () => Promise<void>;
  status: Ref<'idle' | 'pending' | 'success' | 'error'>;
}

export interface UsePageDataOptions {
  immediate?: boolean;
  server?: boolean;
  client?: boolean;
  transform?: (data: ApiResponse<PageData>) => PageData;
}

export function usePageData(
  siteId: string,
  slug: string | null,
  options: UsePageDataOptions = {}
): UsePageDataReturn {
  const { $axios } = useNuxtApp() as any;

  // Global state for logo
  const siteLogo = useState<ArticleImage[]>("siteLogo", () => []);

  const updateLogoState = (logo: any) => {
    siteLogo.value = normalizeMediaArray(logo);
  };

  const fetchPage = async (): Promise<PageData> => {
    try {
      const endpoint = buildPageEndpoint(slug);

      if (process.dev) {
        console.info(`[usePageData] Fetching: ${endpoint}`, { siteId, slug });
      }

      const response = await $axios.get(endpoint);
      const payload = response.data || {};

      if (process.dev) {
        console.info('[usePageData] Fetched page payload:', payload);
      }

      const normalized = normalizePageResponse(payload, slug);

      // Update logo state on client
      if (import.meta.client && normalized.customFields?.logo) {
        updateLogoState(normalized.customFields.logo);
      }

      return normalized;
    } catch (error: any) {
      const status = Number(error?.response?.status) || 500;
      const message = error?.response?.data?.message || error?.message || "Failed to fetch page";

      if (process.dev) {
        console.warn('[usePageData] Request failed:', { status, message, error });
      }

      throw createError({
        statusCode: status,
        statusMessage: message,
        data: { siteId, slug, endpoint: buildPageEndpoint(slug) }
      });
    }
  };

  const asyncData = useAsyncData(
    `page-${slug || "home"}-${siteId}`,
    fetchPage,
    {
      server: true,
      default: () => null,
    }
  );

  // Global state management
  const currentOfferId = useState<string | null>("currentOfferId", () => null);

  // Watch for offer changes
  watch(
    () => asyncData.data.value?.offer?._id,
    (id) => {
      currentOfferId.value = id || null;
    },
    { immediate: true }
  );

  // Watch for logo changes (client only)
  if (import.meta.client) {
    watch(
      () => asyncData.data.value?.customFields?.logo,
      (logo) => updateLogoState(logo),
      { immediate: true }
    );
  }

  // Convert NuxtError to PageError
  const convertedError = computed<PageError | null>(() => {
    const nuxtError = asyncData.error.value;
    if (!nuxtError) return null;

    return {
      statusCode: nuxtError.statusCode || 500,
      statusMessage: nuxtError.statusMessage || 'Unknown Error',
      message: nuxtError.message,
      stack: nuxtError.stack,
    };
  });

  return {
    data: asyncData.data,
    pending: asyncData.pending,
    error: convertedError,
    refresh: asyncData.refresh,
    status: asyncData.status,
  };
}

// ============================================================================
// Helper Functions (exported for testing and reuse)
// ============================================================================

export {
  normalizeBlocks,
  normalizeMediaArray,
  buildPageEndpoint,
  normalizePageResponse,
};
