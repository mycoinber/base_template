import { defineNitroPlugin, useRuntimeConfig } from "#imports";
import {
  createRemoteSitemapHandlers,
  shouldHandleSitemapEvent,
} from "../../utils/remote-sitemap";

export default defineNitroPlugin((nitroApp) => {
  const runtimeConfig = useRuntimeConfig();
  const { fetchRemoteSitemap, buildSitemapFromPayload } =
    createRemoteSitemapHandlers({
      siteId: runtimeConfig?.server?.siteId || runtimeConfig?.public?.siteId,
      backendBaseUrl: runtimeConfig?.server?.backHost || runtimeConfig?.public?.backHost,
      sitemapApiBase: runtimeConfig?.server?.sitemapApiBase || runtimeConfig?.public?.sitemapApiBase,
    });

  nitroApp.hooks.hook('sitemap:output', async (ctx) => {
    if (!shouldHandleSitemapEvent(ctx.event)) {
      return;
    }

    const payload = await fetchRemoteSitemap();
    ctx.sitemap = buildSitemapFromPayload(payload, ctx.event);
  });
});
