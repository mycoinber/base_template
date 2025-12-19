import { d as defineEventHandler } from '../../nitro/nitro.mjs';
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

const sitemap = defineEventHandler(async (event) => {
  try {
    const response = await fetch(
      `https://api.pbnmaster.online/sites/sitemap?siteId=67dff14b046e62b3966676dd`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return [];
  }
});

export { sitemap as default };
//# sourceMappingURL=sitemap.mjs.map
