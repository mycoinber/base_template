import { defineEventHandler, getQuery, createError } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const config = useRuntimeConfig(event);
  const querySiteId = Array.isArray(query.siteId) ? query.siteId[0] : query.siteId;
  const trimmedQueryId = typeof querySiteId === "string" ? querySiteId.trim() : "";
  const siteId =
    trimmedQueryId ||
    (typeof config.server?.siteId === "string" ? config.server.siteId : "") ||
    (typeof config.public?.siteId === "string" ? config.public.siteId : "");

  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: "siteId is required" });
  }
  const backendBase = (config.server as any).backHost?.replace(/\/$/, "") || "";
  if (!backendBase) {
    console.error("[proxy] /pages/nav missing backend host", {
      siteId,
      configuredBackHost: (config.server as any).backHost,
      envBackHost:
        process.env.BACKEND_URL ||
        process.env.BACK_HOST ||
        process.env.BACK_HOST_SV ||
        null,
    });
    throw createError({
      statusCode: 500,
      statusMessage: "BACKEND_URL/BACK_HOST is not configured",
    });
  }
  try {
    const endpoint = `${backendBase}/pages/nav`;
    const result = await $fetch(endpoint, {
      params: { siteId },
    });

    if (process.dev) {
      console.info("[proxy] /pages/nav result:", { endpoint, result });
    }

    return result;
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.response?.status || 500;
    console.error("[Proxy Error] /pages/nav:", {
      endpoint: `${backendBase}/pages/nav`,
      statusCode,
      siteId,
      data: error?.data || error?.response?.data || error?.message,
    });
    throw createError({ statusCode, statusMessage: "Failed to fetch nav" });
  }
});
