// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/*"
  ],
  exclude: [
    "/__og-image__/static/*",
    "/_nuxt/*",
    "/_robots.txt",
    "/css/nuxt-google-fonts.css",
    "/fonts/Inter-normal-400-cyrillic-ext.woff2",
    "/fonts/Inter-normal-400-cyrillic.woff2",
    "/fonts/Inter-normal-400-greek-ext.woff2",
    "/fonts/Inter-normal-400-greek.woff2",
    "/fonts/Inter-normal-400-latin-ext.woff2",
    "/fonts/Inter-normal-400-latin.woff2",
    "/fonts/Inter-normal-400-vietnamese.woff2",
    "/fonts/Inter-normal-500-cyrillic-ext.woff2",
    "/fonts/Inter-normal-500-cyrillic.woff2",
    "/fonts/Inter-normal-500-greek-ext.woff2",
    "/fonts/Inter-normal-500-greek.woff2",
    "/fonts/Inter-normal-500-latin-ext.woff2",
    "/fonts/Inter-normal-500-latin.woff2",
    "/fonts/Inter-normal-500-vietnamese.woff2",
    "/fonts/Inter-normal-700-cyrillic-ext.woff2",
    "/fonts/Inter-normal-700-cyrillic.woff2",
    "/fonts/Inter-normal-700-greek-ext.woff2",
    "/fonts/Inter-normal-700-greek.woff2",
    "/fonts/Inter-normal-700-latin-ext.woff2",
    "/fonts/Inter-normal-700-latin.woff2",
    "/fonts/Inter-normal-700-vietnamese.woff2",
    "/fonts/Oswald-normal-400-cyrillic-ext.woff2",
    "/fonts/Oswald-normal-400-cyrillic.woff2",
    "/fonts/Oswald-normal-400-latin-ext.woff2",
    "/fonts/Oswald-normal-400-latin.woff2",
    "/fonts/Oswald-normal-400-vietnamese.woff2",
    "/fonts/Oswald-normal-500-cyrillic-ext.woff2",
    "/fonts/Oswald-normal-500-cyrillic.woff2",
    "/fonts/Oswald-normal-500-latin-ext.woff2",
    "/fonts/Oswald-normal-500-latin.woff2",
    "/fonts/Oswald-normal-500-vietnamese.woff2",
    "/fonts/Oswald-normal-700-cyrillic-ext.woff2",
    "/fonts/Oswald-normal-700-cyrillic.woff2",
    "/fonts/Oswald-normal-700-latin-ext.woff2",
    "/fonts/Oswald-normal-700-latin.woff2",
    "/fonts/Oswald-normal-700-vietnamese.woff2"
  ]
};

// ../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/passionfruit/Documents/Projects/base_template/.wrangler/tmp/pages-YvBH7j/bundledWorker-0.5992319792940921.mjs";
import { isRoutingRuleMatch } from "/Users/passionfruit/.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/passionfruit/Documents/Projects/base_template/.wrangler/tmp/pages-YvBH7j/bundledWorker-0.5992319792940921.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=3ixmz7n4tdb.js.map
