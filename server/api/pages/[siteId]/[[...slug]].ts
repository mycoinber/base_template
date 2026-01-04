import { defineEventHandler, createError, setResponseHeader } from "h3";

interface PageResponse {
  [key: string]: any;
}

const normalizeSlug = (rawSlug: string | string[] | undefined) => {
  if (Array.isArray(rawSlug)) {
    return rawSlug.filter(Boolean).join("/");
  }
  return typeof rawSlug === "string" ? rawSlug.trim() : "";
};

export const runtime = "nodejs";

export default defineEventHandler(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "s-maxage=3600, stale-while-revalidate=600"
  );

  const params = event.context.params || {};
  const siteId = params.siteId as string | undefined;
  const slugParam = params.slug as string | string[] | undefined;
  const slug = normalizeSlug(slugParam);
  console.log("[pages/[siteId]/[[...slug]]] slug=", slug);
  console.log("[pages/[siteId]/[[...slug]]] siteId=", siteId);
  console.log("[pages/[siteId]/[[...slug]]] params=", params);
  console.log("[pages/[siteId]/[[...slug]]] event=", event);

  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: "siteId is required" });
  }

  const config = useRuntimeConfig(event);
  const backendBase = config.server?.backHost?.replace(/\/$/, "");

  if (!backendBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACKEND_URL/BACK_HOST is not configured",
    });
  }

  try {
    const endpoint = `${backendBase}/pages/${siteId}`;
    const response: PageResponse = await $fetch(endpoint, {
      method: "GET",
      params: slug ? { slug } : undefined,
    });

    return response;
  } catch (error: any) {
    console.error("[Proxy Error] /pages/:siteId", {
      siteId,
      slug,
      status: error?.statusCode || error?.response?.status,
      message: error?.statusMessage || error?.response?.data || error?.message,
    });
    throw createError({
      statusCode: error?.statusCode || error?.response?.status || 500,
      statusMessage: "Failed to fetch page",
    });
  }
});
