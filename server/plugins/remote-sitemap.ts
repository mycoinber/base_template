import { defineNitroPlugin } from "#imports";
import {
  buildSitemapFromPayload,
  fetchRemoteSitemap,
  shouldHandleSitemapEvent,
} from "../../utils/remote-sitemap";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('sitemap:output', async (ctx) => {
    if (!shouldHandleSitemapEvent(ctx.event)) {
      return;
    }

    const payload = await fetchRemoteSitemap();
    ctx.sitemap = buildSitemapFromPayload(payload, ctx.event);
  });
});
