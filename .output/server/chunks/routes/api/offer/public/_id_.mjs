import { d as defineEventHandler, g as getRouterParam, c as createError, u as useRuntimeConfig } from '../../../../nitro/nitro.mjs';
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

const _id_ = defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, statusMessage: "id is required" });
  const config = useRuntimeConfig(event);
  const backendBase = config.server.backHost;
  try {
    return await $fetch(`${backendBase}/offer/public/${id}`);
  } catch (error) {
    console.error("[Proxy Error] /offer/public/:id", (error == null ? void 0 : error.data) || (error == null ? void 0 : error.message));
    throw createError({ statusCode: (error == null ? void 0 : error.statusCode) || 500, statusMessage: "Failed to fetch offer" });
  }
});

export { _id_ as default };
//# sourceMappingURL=_id_.mjs.map
