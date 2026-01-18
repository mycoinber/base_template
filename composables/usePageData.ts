// composables/usePageData.ts
import { useNuxtApp, useAsyncData } from "#app";
import { createError } from "#imports";
import { watch } from "vue";

type AnyObject = Record<string, any>;

const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  return value != null ? [value] : [];
};

const normalizeMediaArray = (value: any): AnyObject[] => {
  return ensureArray(value)
    .map((entry) => (entry && typeof entry === "object" ? entry : null))
    .filter((entry): entry is AnyObject => Boolean(entry && entry.path));
};

const normalizeFaqs = (faqs: any, blockId: string) => {
  if (!Array.isArray(faqs) || faqs.length === 0) return null;
  const mapped = faqs
    .map((faq, index) => ({
      _id: faq?._id || `${blockId}-faq-${index}`,
      question: faq?.question || "",
      answer: faq?.answer || "",
    }))
    .filter((faq) => faq.question && faq.answer);
  return mapped.length ? mapped : null;
};

const stripHtml = (value: unknown) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, "").trim() : "";

const normalizeReviews = (reviews: any, blockId: string) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return null;
  const mapped = reviews
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
  return mapped.length ? mapped : null;
};

const normalizeBlocks = (blocks: any[] | undefined) => {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block, index) => {
    const blockId = block?._id || block?.id || `block-${index}`;
    const imageCandidates =
      block?.imageUrl || block?.imageMedia || block?.image || block?.hero || [];
    return {
      ...block,
      _id: blockId,
      H2: block?.H2 || block?.headline || block?.title || "",
      imageUrl: normalizeMediaArray(imageCandidates),
      faqs: normalizeFaqs(block?.faqs, blockId),
      reviews: normalizeReviews(block?.reviews, blockId),
    };
  });
};

const normalizePageResponse = (payload: AnyObject, slug: string | null) => {
  if (!payload || typeof payload !== "object") return {} as AnyObject;

  const article = payload.article || {};
  const normalizedBlocks = normalizeBlocks(article.blocks);
  const introBlock = normalizedBlocks.find(
    (block) => typeof block?.type === "string" && block.type.toLowerCase() === "intro",
  );
  const heroImages = Array.isArray(payload.hero) && payload.hero.length
    ? payload.hero
    : introBlock?.imageUrl && introBlock.imageUrl.length
      ? introBlock.imageUrl
      : [];

  const payloadFullSlug = typeof payload.fullSlug === "string" ? payload.fullSlug : null;
  const payloadCanonicalSlug = typeof payload.canonicalSlug === "string" ? payload.canonicalSlug : null;
  const payloadLocalePrefix = typeof payload.localePrefix === "string" ? payload.localePrefix : null;
  const fallbackSlug = slug || "";
  const canonicalFallback = payloadCanonicalSlug ?? payload.slug ?? fallbackSlug;
  const normalizedFullSlug = payloadFullSlug ?? canonicalFallback;

  return {
    ...payload,
    type: payload.type || "page",
    slug: normalizedFullSlug || "",
    fullSlug: normalizedFullSlug || "",
    canonicalSlug: canonicalFallback || "",
    localePrefix: payloadLocalePrefix,
    article: {
      ...article,
      H1: article.H1 || article.h1 || payload.head?.title || "",
      intro: article.intro || introBlock?.content || "",
      introImage: heroImages,
      blocks: normalizedBlocks,
    },
    hero: heroImages,
  };
};

const buildPageEndpoint = (slug: string | null) => {
  const segments = typeof slug === "string" && slug.trim()
    ? slug.split("/").filter(Boolean).map((segment) => encodeURIComponent(segment))
    : [];
  if (!segments.length) {
    return "/pages";
  }
  return `/pages/${segments.join("/")}`;
};

export function usePageData(siteId: string, slug: string | null) {
  const { $axios } = useNuxtApp() as any;

  const siteLogo = useState<any[]>("siteLogo", () => []);
  const langPrefixState = useState<string>("siteLangPrefix", () => "");

  const updateLogoState = (logo: any) => {
    siteLogo.value = Array.isArray(logo) ? logo : [];
  };

  const fetchPage = async () => {
    try {
      const endpoint = buildPageEndpoint(slug);
      const response = await $axios.get(endpoint);
      const payload = response.data || {};
      const normalized = normalizePageResponse(payload, slug);
      langPrefixState.value = normalized.localePrefix || "";
      if (import.meta.client) {
        updateLogoState(normalized.logo);
      }
      return normalized;
    } catch (error: any) {
      const status = Number(error?.response?.status) || 500;
      const message = error?.response?.data?.message || error?.message || "Failed to fetch page";
      throw createError({ statusCode: status, statusMessage: message });
    }
  };

  const asyncData = useAsyncData(
    `page-${slug || "home"}-${siteId}`,
    fetchPage,
    { server: true },
  );

  const currentOfferId = useState<string | null>("currentOfferId", () => null);
  watch(
    () => asyncData.data.value?.offer?._id as string | undefined,
    (id) => { currentOfferId.value = id || null; },
    { immediate: true },
  );

  watch(
    () => asyncData.data.value?.localePrefix,
    (prefix) => {
      langPrefixState.value = prefix || "";
    },
    { immediate: true },
  );

  if (import.meta.client) {
    watch(
      () => asyncData.data.value?.logo,
      (logo) => updateLogoState(logo),
      { immediate: true },
    );
  }
  return asyncData;
}
