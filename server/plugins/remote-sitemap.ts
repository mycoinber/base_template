import { defineNitroPlugin } from "#imports";
import {
  createRemoteSitemapHandlers,
  shouldHandleSitemapEvent,
} from "../../utils/remote-sitemap";

export default defineNitroPlugin((nitroApp) => {
  const { fetchRemoteSitemap, buildSitemapFromPayload } =
    createRemoteSitemapHandlers();

  nitroApp.hooks.hook('sitemap:output', async (ctx) => {
    if (!shouldHandleSitemapEvent(ctx.event)) {
      return;
    }

    const payload = await fetchRemoteSitemap();
    ctx.sitemap = buildSitemapFromPayload(payload, ctx.event);
  });
});
