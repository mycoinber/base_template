import { defineEventHandler, createError, setResponseHeader } from "h3";
import { resolveSiteRuntime } from "../utils/site-runtime";

export const runtime = "nodejs";

export default defineEventHandler(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "s-maxage=120, stale-while-revalidate=60"
  );

  const { siteId, backendBase } = resolveSiteRuntime(event);

  try {
    const endpoint = `${backendBase}/pages/nav`;
    const result = await $fetch(endpoint, {
      params: { siteId },
    });

    if (process.dev) {
      console.info("[nav] fetched", { endpoint });
    }

    return result;
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status || 500;
    console.error("[Proxy Error] /nav", {
      endpoint: `${backendBase}/pages/nav`,
      siteId,
      statusCode,
      data: error?.data || error?.response?.data || error?.message,
    });
    throw createError({ statusCode, statusMessage: "Failed to fetch navigation" });
  }
});
