import type { H3Event } from "h3";

const envSiteId = process.env.SITE_ID;
if (!envSiteId) {
  throw new Error(
    "SITE_ID environment variable is required for sitemap/robots generation"
  );
}

const envBackendBase = (
  process.env.BACKEND_URL ||
  process.env.BACK_HOST ||
  process.env.BACK_HOST_SV ||
  ""
)
  .trim()
  .replace(/\/+$/, "");

const envSitemapBase =
  process.env.SITEMAP_API_BASE ||
  envBackendBase ||
  "https://api.pbnmaster.online";
const SITE_ORIGIN_PLACEHOLDER = "{{SITE_ORIGIN}}";

export const SITE_ID = envSiteId;
export const BACKEND_BASE_URL = envBackendBase;
export const SITEMAP_API_BASE = envSitemapBase;

export interface RemoteSitemapImage {
  loc: string;
  title?: string | null;
}

export interface RemoteSitemapEntry {
  loc: string;
  lastmod?: string | null;
  images?: RemoteSitemapImage[];
}

export interface RemoteSitemapPayload {
  siteId: string | null;
  baseUrl: string | null;
  urls: RemoteSitemapEntry[];
}

const endpointBase = SITEMAP_API_BASE.replace(/\/+$/, "");

export const fetchRemoteSitemap =
  async (): Promise<RemoteSitemapPayload | null> => {
    const endpoint = `${endpointBase}/sites/sitemap?siteId=${SITE_ID}`;
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(
          "Failed to fetch sitemap payload",
          endpoint,
          response.status
        );
        return null;
      }
      return (await response.json()) as RemoteSitemapPayload;
    } catch (error) {
      console.error("Failed to fetch sitemap payload", endpoint, error);
      return null;
    }
  };

export const buildSitemapFromPayload = (
  payload: RemoteSitemapPayload | null,
  event?: H3Event
) => {
  if (!payload || !Array.isArray(payload.urls) || payload.urls.length === 0) {
    return buildEmptySitemap();
  }

  const baseUrl = resolveBaseUrl(payload.baseUrl, event);
  const urlsXml = payload.urls
    .map((entry) => serializeUrlEntry(entry, baseUrl))
    .filter((entry): entry is string => Boolean(entry))
    .join("\n");

  return buildSitemapXml(urlsXml);
};

export const shouldHandleSitemapEvent = (event?: H3Event) => {
  const rawPath = event?.path || event?.node?.req?.url || "";
  if (!rawPath) {
    return false;
  }
  const normalized = rawPath.split("?")[0]?.toLowerCase() || "";
  if (!normalized || normalized.includes("sitemap_index")) {
    return false;
  }
  return normalized.includes("sitemap.xml");
};

const buildEmptySitemap = () =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    "</urlset>",
  ].join("\n");

const buildSitemapXml = (urlsXml: string) => {
  const body = urlsXml ? `\n${urlsXml}\n` : "\n";
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    body.trimEnd(),
    "</urlset>",
  ].join("\n");
};

const resolveBaseUrl = (rawBaseUrl?: string | null, event?: H3Event) => {
  const sanitized = sanitizeBaseUrl(rawBaseUrl);
  if (sanitized && sanitized !== SITE_ORIGIN_PLACEHOLDER) {
    return sanitized;
  }

  const eventBase = sanitizeBaseUrl(extractBaseUrlFromEvent(event));
  if (eventBase) {
    return eventBase;
  }

  return sanitized === SITE_ORIGIN_PLACEHOLDER ? "" : sanitized;
};

const sanitizeBaseUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") {
    return "";
  }
  let trimmed = value.trim();
  while (trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed;
};

const extractBaseUrlFromEvent = (event?: H3Event) => {
  const req = event?.node?.req;
  if (!req) {
    return "";
  }
  const host =
    pickHeaderValue(req.headers?.["x-forwarded-host"]) ||
    pickHeaderValue(req.headers?.host);
  if (!host) {
    return "";
  }
  const protoHeader = pickHeaderValue(req.headers?.["x-forwarded-proto"]);
  const protocol =
    protoHeader?.split(",")[0]?.trim() ||
    (isEventSecure(event) ? "https" : "http");
  return `${protocol}://${host.split(",")[0]?.trim()}`;
};

const pickHeaderValue = (value?: string | string[]) => {
  if (!value) {
    return "";
  }
  return Array.isArray(value) ? value[0] || "" : value;
};

const isEventSecure = (event?: H3Event) => {
  const socket = event?.node?.req?.socket as
    | { encrypted?: boolean }
    | undefined;
  return Boolean(socket && socket.encrypted);
};

const serializeUrlEntry = (entry: RemoteSitemapEntry, baseUrl: string) => {
  const loc = resolveEntryLoc(entry.loc, baseUrl);
  if (!loc) {
    return null;
  }

  const pieces = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];

  if (entry.lastmod) {
    pieces.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }

  if (Array.isArray(entry.images)) {
    for (const img of entry.images) {
      const imgLoc = normalizeImageLoc(img.loc, baseUrl);
      if (!imgLoc) continue;
      pieces.push("    <image:image>");
      pieces.push(`      <image:loc>${escapeXml(imgLoc)}</image:loc>`);
      if (img.title) {
        pieces.push(`      <image:title>${escapeXml(img.title)}</image:title>`);
      }
      pieces.push("    </image:image>");
    }
  }

  pieces.push("  </url>");
  return pieces.join("\n");
};

const resolveEntryLoc = (loc?: string | null, baseUrl?: string) => {
  const normalized = typeof loc === "string" ? loc.trim() : "";
  if (!normalized) {
    return null;
  }
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return baseUrl ? `${baseUrl}${path}` : path;
};

const normalizeImageLoc = (loc?: string | null, baseUrl?: string) => {
  const normalized = typeof loc === "string" ? loc.trim() : "";
  if (!normalized) {
    return null;
  }
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  if (normalized.startsWith("/")) {
    return baseUrl ? `${baseUrl}${normalized}` : normalized;
  }
  return baseUrl ? `${baseUrl}/${normalized}` : normalized;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
