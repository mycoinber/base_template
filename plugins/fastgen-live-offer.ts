/**
 * Resolve the offer branch before the root Nuxt layout renders.  Page async
 * data can be omitted from Cloudflare hydration even when SSR fetched it, so
 * the layout cannot rely exclusively on usePageData's watcher.
 */
export default defineNuxtPlugin({ name: 'fastgen-live-offer', async setup(nuxtApp) {
  const rawUrl = import.meta.server
    ? String(nuxtApp.ssrContext?.event?.node?.req?.url || '')
    : window.location.href;
  const mode = new URL(rawUrl, 'http://preview.local').searchParams
    .get('offerPreview')?.trim().toLowerCase();
  const active = useState<boolean>('fastgenOfferLayoutActive', () => false);
  const config = useRuntimeConfig();
  if (!String(config.public.offerLayoutName || '').trim()) return;
  if (['off', '0', 'false'].includes(mode || '')) { active.value = false; return; }
  if (['on', '1', 'true'].includes(mode || '')) { active.value = true; return; }

  try {
    const page = import.meta.server
      ? await $fetch<any>(`${String(config.server.backHost || '').replace(/\/+$/, '')}/pages/${config.server.siteId}`)
      : await $fetch<any>('/api/pages', { cache: 'no-cache' });
    active.value = Boolean(String(page?.offer?.id || '').trim());
  } catch {
    active.value = false;
  }
} });
