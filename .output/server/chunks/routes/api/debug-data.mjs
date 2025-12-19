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

const debugData = defineEventHandler(() => {
  return {
    message: "This is test data from the server!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { debugData as default };
//# sourceMappingURL=debug-data.mjs.map
