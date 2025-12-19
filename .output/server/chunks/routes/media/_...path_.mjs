import { d as defineEventHandler, u as useRuntimeConfig, c as createError, g as getRouterParam, b as useStorage, e as setHeader, f as setResponseStatus } from '../../nitro/nitro.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import 'unhead';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import 'node:url';
import 'unhead/server';
import 'unhead/plugins';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'unhead/utils';
import '@iconify/utils';
import 'node:module';
import 'ipx';

const sanitizePath = (raw) => {
  return raw.split("/").map((segment) => decodeURIComponent(segment).replace(/[^\w.\-]/g, "")).filter(Boolean).join("/");
};
const ____path_ = defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const baseUrl = config.server.mediaStorageUrl || config.public.mediaStorageUrl;
  if (!baseUrl) {
    throw createError({ statusCode: 500, statusMessage: "MEDIA_STORAGE_URL is not configured" });
  }
  const param = getRouterParam(event, "path") || "";
  const cleanParam = sanitizePath(param);
  if (!cleanParam) {
    throw createError({ statusCode: 400, statusMessage: "Invalid media path" });
  }
  const target = `${baseUrl.replace(/\/$/, "")}/${cleanParam}`;
  const cacheKey = cleanParam.toLowerCase();
  const storage = useStorage("cache:media");
  const cachedMeta = await storage.getItem(`${cacheKey}:meta`).catch(() => null);
  const cachedBody = await storage.getItemRaw(`${cacheKey}:data`).catch(() => null);
  if (cachedMeta && cachedBody) {
    setHeader(event, "content-type", cachedMeta.contentType || "application/octet-stream");
    setHeader(event, "cache-control", "public, max-age=86400, s-maxage=31536000, immutable");
    return cachedBody;
  }
  try {
    const res = await fetch(target, {
      headers: {
        "Accept": event.node.req.headers["accept"] || "*/*",
        "User-Agent": event.node.req.headers["user-agent"] || "nuxt-media-proxy"
      }
    });
    if (!res.ok) {
      setResponseStatus(event, res.status);
      return res.statusText;
    }
    const contentType = res.headers.get("content-type") || "application/octet-stream";
    const buffer = new Uint8Array(await res.arrayBuffer());
    await storage.setItemRaw(`${cacheKey}:data`, buffer);
    await storage.setItem(`${cacheKey}:meta`, { contentType });
    setHeader(event, "content-type", contentType);
    setHeader(event, "cache-control", "public, max-age=86400, s-maxage=31536000, immutable");
    return buffer;
  } catch (err) {
    console.error("[Media Proxy] Failed to fetch", target, err);
    throw createError({ statusCode: 502, statusMessage: "Failed to fetch media" });
  }
});

export { ____path_ as default };
//# sourceMappingURL=_...path_.mjs.map
