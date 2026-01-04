import {
  defineEventHandler,
  createError,
  proxyRequest,
  getProxyRequestHeaders,
} from "h3";
import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
  console.log("[...] event=", event);
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

  const rawRequestUrl = event.node?.req?.url || "/";
  const queryIndex = rawRequestUrl.indexOf("?");
  const rawPath =
    queryIndex === -1 ? rawRequestUrl : rawRequestUrl.slice(0, queryIndex);
  const rawQuery = queryIndex === -1 ? "" : rawRequestUrl.slice(queryIndex + 1);
  const searchParams = new URLSearchParams(rawQuery);
  const existingSiteId = searchParams.get("siteId")?.trim();
  if (resolvedSiteId && !existingSiteId) {
    searchParams.set("siteId", resolvedSiteId);
  }
  const upstreamPath = rawPath.replace(/^\/api/, "") || "/";
  console.log("[...] upstreamPath=", upstreamPath);
  const targetURL = new URL(
    joinURL(backendBase.replace(/\/$/, ""), upstreamPath)
  );
  const queryString = searchParams.toString();
  targetURL.search = queryString ? `?${queryString}` : "";

  console.log("[...] path=", targetURL.toString());
  return proxyRequest(event, targetURL.toString(), {
    fetchOptions: {
      headers: getProxyRequestHeaders(event, {
        exclude: ["host", "connection", "content-length"],
      }),
    },
  });
});
