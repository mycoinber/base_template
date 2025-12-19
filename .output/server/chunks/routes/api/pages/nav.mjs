import { d as defineEventHandler, a as getQuery, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
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

const nav = defineEventHandler(async (event) => {
  var _a;
  const { siteId } = getQuery(event);
  if (!siteId) {
    throw createError({ statusCode: 400, statusMessage: "siteId is required" });
  }
  const config = useRuntimeConfig(event);
  const backendBase = ((_a = config.server.backHost) == null ? void 0 : _a.replace(/\/$/, "")) || "";
  try {
    const page = await $fetch(`${backendBase}/pages/${siteId}`);
    const head = (page == null ? void 0 : page.head) || {};
    const logo = (head == null ? void 0 : head.ogImage) ? [head.ogImage] : [];
    const pages = [
      {
        slug: (page == null ? void 0 : page.slug) || "",
        homePage: Boolean(page == null ? void 0 : page.homePage),
        head
      }
    ];
    return {
      pages,
      logo,
      offer: (page == null ? void 0 : page.offer) || null
    };
  } catch (error) {
    console.error("[Proxy Error] /pages/nav:", (error == null ? void 0 : error.data) || (error == null ? void 0 : error.message));
    throw createError({ statusCode: (error == null ? void 0 : error.statusCode) || 500, statusMessage: "Failed to fetch nav" });
  }
});

export { nav as default };
//# sourceMappingURL=nav.mjs.map
