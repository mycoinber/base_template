// composables/usePageData.ts
import { useNuxtApp, useAsyncData } from "#app";
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

  return {
    ...payload,
    type: payload.type || "page",
    slug: payload.slug || slug || "",
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

export function usePageData(siteId: string, slug: string | null) {
  const { $axios } = useNuxtApp() as any;

  const siteLogo = useState<any[]>("siteLogo", () => []);

  const updateLogoState = (logo: any) => {
    siteLogo.value = Array.isArray(logo) ? logo : [];
  };

  const fetchPage = async () => {
    const params: Record<string, any> = {};
    if (slug) params.slug = slug;
    try {
      const response = await $axios.get(`/pages/${siteId}`, { params: Object.keys(params).length ? params : undefined });
      const payload = response.data || {};
      if (process.dev) {
        console.info('[usePageData] Fetched page payload:', payload);
      }
      const normalized = normalizePageResponse(payload, slug);
      if (import.meta.client) {
        updateLogoState(normalized.logo);
      }
      return normalized;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status && status !== 404) {
        const message = error?.response?.data?.message || error?.message || String(error);
        console.warn("Ошибка запроса:", message);
      }
      return {};
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
  if (import.meta.client) {
    watch(
      () => asyncData.data.value?.logo,
      (logo) => updateLogoState(logo),
      { immediate: true },
    );
  }
  return asyncData;
}
