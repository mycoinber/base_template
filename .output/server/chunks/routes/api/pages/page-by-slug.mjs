import { d as defineEventHandler, s as setResponseHeader, a as getQuery, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
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

const runtime = "nodejs";
const pageBySlug = defineEventHandler(async (event) => {
  setResponseHeader(
    event,
    "Cache-Control",
    "s-maxage=3600, stale-while-revalidate=600"
  );
  const query = getQuery(event);
  const siteId = query.siteId;
  const slug = query.slug || void 0;
  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: "siteId is required" });
  }
  const config = useRuntimeConfig(event);
  const backendBase = config.server.backHost;
  try {
    const baseUrl = (backendBase == null ? void 0 : backendBase.replace(/\/$/, "")) || "";
    const response = await $fetch(`${baseUrl}/pages/${siteId}`, {
      method: "GET",
      params: slug ? { slug } : void 0
    });
    return response;
  } catch (error) {
    console.error(
      "[Proxy Error] /pages/page-by-slug:",
      (error == null ? void 0 : error.data) || (error == null ? void 0 : error.message)
    );
    throw createError({
      statusCode: (error == null ? void 0 : error.statusCode) || 500,
      statusMessage: (error == null ? void 0 : error.statusMessage) || "Failed to fetch page from backend"
    });
  }
});

export { pageBySlug as default, runtime };
//# sourceMappingURL=page-by-slug.mjs.map
