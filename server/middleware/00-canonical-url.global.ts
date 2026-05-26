import { defineEventHandler, getRequestURL, sendRedirect } from "h3";

const HAS_FILE_EXTENSION_RE = /\.[a-z0-9]{1,8}$/i;
const MULTI_SLASH_RE = /\/{2,}/g;

const SKIP_PREFIXES = [
  "/_nuxt",
  "/api",
  "/media",
  "/siteid",
];

const SKIP_EXACT = new Set([
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

const normalizePathname = (pathname: string): string => {
  if (!pathname) return "/";
  if (/^\/+$/.test(pathname)) return "/";
  const collapsed = pathname.replace(MULTI_SLASH_RE, "/");
  return collapsed || "/";
};

const isLocalHost = (host: string): boolean => {
  const value = host.toLowerCase();
  return (
    value === "localhost" ||
    value.startsWith("localhost:") ||
    value === "127.0.0.1" ||
    value.startsWith("127.0.0.1:") ||
    value === "::1" ||
    value.startsWith("[::1]:")
  );
};

const shouldSkipTrailingSlash = (pathname: string): boolean => {
  if (SKIP_EXACT.has(pathname)) return true;
  if (SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  const lastSegment = pathname.split("/").filter(Boolean).pop() || "";
  return HAS_FILE_EXTENSION_RE.test(lastSegment);
};

const withTrailingSlash = (pathname: string): string => {
  if (pathname === "/") return pathname;
  if (pathname.endsWith("/")) return pathname;
  return `${pathname}/`;
};

export default defineEventHandler((event) => {
  const method = event.node?.req?.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    return;
  }

  const url = getRequestURL(event);
  const runtimeConfig = useRuntimeConfig(event);
  const originalPathname = url.pathname || "/";
  const rawRequestUrl = event.node?.req?.url || "";
  const rawPathname = (rawRequestUrl.split("?")[0] || originalPathname || "/") as string;
  const hadMultipleSlashes = /\/{2,}/.test(rawPathname);
  const normalizedPathname = normalizePathname(rawPathname || originalPathname);

  const rawHostHeader = event.node?.req?.headers?.host;
  const hostHeader = Array.isArray(rawHostHeader) ? rawHostHeader[0] : rawHostHeader || url.host;
  const lowerHost = String(hostHeader || "").toLowerCase();

  let targetHost = String(hostHeader || "");
  let targetProtocol = url.protocol;
  let changed = false;

  const configuredSiteUrl =
    typeof runtimeConfig.server?.siteUrl === "string" && runtimeConfig.server.siteUrl
      ? runtimeConfig.server.siteUrl
      : typeof runtimeConfig.public?.siteUrl === "string"
        ? runtimeConfig.public.siteUrl
        : "";

  let configuredHost = "";
  let configuredProtocol = "";
  if (configuredSiteUrl) {
    try {
      const parsed = new URL(configuredSiteUrl);
      configuredHost = parsed.host || "";
      configuredProtocol = parsed.protocol || "";
    } catch {
      configuredHost = "";
      configuredProtocol = "";
    }
  }

  if (configuredHost) {
    if (targetHost.toLowerCase() !== configuredHost.toLowerCase()) {
      targetHost = configuredHost;
      changed = true;
    }
    if (configuredProtocol && targetProtocol !== configuredProtocol) {
      targetProtocol = configuredProtocol;
      changed = true;
    }
  } else if (!isLocalHost(lowerHost) && lowerHost.startsWith("www.")) {
    targetHost = String(hostHeader || "").slice(4);
    changed = true;
  }

  let finalPathname = normalizedPathname;

  if (normalizedPathname !== originalPathname || hadMultipleSlashes) {
    changed = true;
  }

  if (!shouldSkipTrailingSlash(finalPathname)) {
    const trailed = withTrailingSlash(finalPathname);
    if (trailed !== finalPathname) {
      finalPathname = trailed;
      changed = true;
    }
  }

  if (!changed) {
    return;
  }

  const redirectUrl = new URL(url.toString());
  if (targetProtocol) {
    redirectUrl.protocol = targetProtocol;
  }
  if (targetHost) {
    redirectUrl.host = targetHost;
  }
  redirectUrl.pathname = finalPathname;

  return sendRedirect(event, redirectUrl.toString(), 301);
});
