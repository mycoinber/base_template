import {
  defineEventHandler,
  createError,
  getRequestURL,
  proxyRequest,
  getProxyRequestHeaders,
} from "h3";
import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const backendBase =
    runtimeConfig.server?.backHost || runtimeConfig.public?.backHost;
  const resolvedSiteId =
    (typeof runtimeConfig.server?.siteId === "string"
      ? runtimeConfig.server.siteId.trim()
      : "") ||
    (typeof runtimeConfig.public?.siteId === "string"
      ? runtimeConfig.public.siteId.trim()
      : "");

  if (!backendBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACKEND_URL is not configured",
    });
  }

  const requestURL = getRequestURL(event);
  const existingSiteId = requestURL.searchParams.get("siteId")?.trim();
  if (resolvedSiteId && !existingSiteId) {
    requestURL.searchParams.set("siteId", resolvedSiteId);
  }
  const upstreamPath = requestURL.pathname.replace(/^\/api/, "") || "/";
  const targetURL = new URL(
    joinURL(backendBase.replace(/\/$/, ""), upstreamPath)
  );
  targetURL.search = requestURL.search;

  return proxyRequest(event, targetURL.toString(), {
    fetchOptions: {
      headers: getProxyRequestHeaders(event, {
        exclude: ["host", "connection", "content-length"],
      }),
    },
  });
});
