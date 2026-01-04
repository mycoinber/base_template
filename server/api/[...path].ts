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

  const { path: rawPath, queryString: headerQueryString } =
    resolveRawRequestParts(event);
  const headerQuery = headerQueryString
    ? (parseQuery(headerQueryString) as Record<string, unknown>)
    : {};
  const query = mergeQuery(event, headerQuery);
  const slug = String(query.slug || "");

  // params из пути (если роут с параметрами)
  // но в твоём случае у тебя wildcard /api/**:path, поэтому:
  const path = event.context.params?.path; // "pages/6952ddd87f09a9449cf24f3f"

  console.log("[debug] url=", event.node.req.url);
  console.log("[debug] path=", path);
  console.log("[debug] query=", query);
  console.log("[debug] slug=", slug);
  console.log("[debug] headers=", event.node.req.headers);

  const upstreamPath = rawPath.replace(/^\/api/, "") || "/";
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

const mergeQuery = (
  event: H3Event,
  headerQuery: Record<string, unknown>
) => {
  const primaryQuery = getQuery(event) as Record<string, unknown>;
  const fallbackQuery = extractRouteMatchQuery(event);
  return { ...fallbackQuery, ...headerQuery, ...primaryQuery };
};

const extractRouteMatchQuery = (event: H3Event) => {
  const headerValue = getHeader(event, "x-now-route-matches");
  if (headerValue) {
    console.log("[debug] x-now-route-matches=", headerValue);
  }
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

const RAW_URL_HEADER_CANDIDATES = [
  "x-forwarded-url",
  "x-forwarded-uri",
  "x-original-url",
  "x-original-uri",
  "x-request-url",
  "x-request-uri",
  "x-rewrite-url",
  "x-now-url",
  "x-vercel-forwarded-url",
];

const resolveRawRequestParts = (event: H3Event) => {
  const baseUrl = event.node?.req?.url || "/";
  let resolved =
    parseRawSource(baseUrl) || ({ path: baseUrl, queryString: "" } as const);

  const pickHeaderValue = (name: string) => {
    const value = getHeader(event, name);
    if (!value) return "";
    return Array.isArray(value) ? value[0] || "" : value;
  };

  const applyCandidate = (raw: string) => {
    if (!raw) return false;
    const parsed = parseRawSource(raw);
    if (!parsed) return false;
    if (parsed.queryString) {
      resolved = parsed;
      return true;
    }
    if (!resolved.path && parsed.path) {
      resolved = { ...parsed, queryString: resolved.queryString };
    }
    return false;
  };

  for (const headerName of RAW_URL_HEADER_CANDIDATES) {
    const headerValue = pickHeaderValue(headerName);
    if (!headerValue) continue;
    if (applyCandidate(headerValue)) {
      break;
    }
  }

  const invokePath = pickHeaderValue("x-invoke-path");
  const invokeQuery = pickHeaderValue("x-invoke-query");
  if (invokePath) {
    resolved = {
      path: invokePath.startsWith("/") ? invokePath : `/${invokePath}`,
      queryString: invokeQuery ? invokeQuery.replace(/^\?/, "") : resolved.queryString,
    };
  } else if (invokeQuery && !resolved.queryString) {
    resolved = { ...resolved, queryString: invokeQuery.replace(/^\?/, "") };
  }

  return resolved;
};

const parseRawSource = (value: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsedUrl = new URL(trimmed);
      return {
        path: parsedUrl.pathname || "/",
        queryString: parsedUrl.search.replace(/^\?/, ""),
      };
    }
  } catch (error) {
    // ignore invalid absolute URL
  }

  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const questionIndex = normalized.indexOf("?");
  if (questionIndex === -1) {
    return { path: normalized, queryString: "" };
  }
  return {
    path: normalized.slice(0, questionIndex) || "/",
    queryString: normalized.slice(questionIndex + 1),
  };
};
