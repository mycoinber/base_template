import {
  defineEventHandler,
  createError,
  proxyRequest,
  getProxyRequestHeaders,
  getQuery,
  getHeader,
} from "h3";
import type { H3Event } from "h3";
import { parseQuery } from "ufo";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const backendBase =
    runtimeConfig.server?.backHost || runtimeConfig.public?.backHost;

  if (!backendBase) {
    throw createError({
      statusCode: 500,
      statusMessage: "BACKEND_URL is not configured",
    });
  }

  const query = mergeQuery(event);
  const slug = String(query.slug || "");

  // params из пути (если роут с параметрами)
  // но в твоём случае у тебя wildcard /api/**:path, поэтому:
  const path = event.context.params?.path; // "pages/6952ddd87f09a9449cf24f3f"

  console.log("[debug] url=", event.node.req.url);
  console.log("[debug] path=", path);
  console.log("[debug] query=", query);
  console.log("[debug] slug=", slug);

  const rawRequestUrl = event.node?.req?.url || "/";
  const upstreamPath =
    rawRequestUrl.split("?")[0]?.replace(/^\/api/, "") || "/";
  const sanitizedBase = backendBase.replace(/\/$/, "");
  const targetUrl = `${sanitizedBase}${
    upstreamPath.startsWith("/") ? "" : "/"
  }${upstreamPath}`;
  const queryString = serializeQueryParams(query);
  const finalUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

  console.log("[...] finalUrl=", finalUrl);
  console.log("[...] event=", event);
  return proxyRequest(event, finalUrl, {
    fetchOptions: {
      headers: getProxyRequestHeaders(event, {
        exclude: ["host", "connection", "content-length"],
      }),
    },
  });
});

const mergeQuery = (event: H3Event) => {
  const primaryQuery = getQuery(event) as Record<string, unknown>;
  const fallbackQuery = extractRouteMatchQuery(event);
  return { ...fallbackQuery, ...primaryQuery };
};

const extractRouteMatchQuery = (event: H3Event) => {
  const headerValue = getHeader(event, "x-now-route-matches");
  if (!headerValue || typeof headerValue !== "string") {
    return {} as Record<string, unknown>;
  }
  const parsed = parseQuery(headerValue);
  const fallback: Record<string, unknown> = {};
  const urlMatch = typeof parsed.url === "string" ? parsed.url : "";
  if (urlMatch && urlMatch.includes("?")) {
    const queryString = urlMatch.split("?")[1] || "";
    Object.assign(fallback, parseQuery(queryString));
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (key === "url" || value === undefined || value === null) {
      continue;
    }
    if (fallback[key] === undefined) {
      fallback[key] = value;
    }
  }
  return fallback;
};

const serializeQueryParams = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null) {
          params.append(key, String(entry));
        }
      });
      continue;
    }
    params.append(key, String(value));
  }
  return params.toString();
};
