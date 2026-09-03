/**
 * Preview-only Offer switch.
 *
 * The selected offer layer remains mounted in a site revision. In the admin
 * sandbox, `offerPreview=on|off` explicitly selects its render branch so a
 * preview works even when the page has no current Frontback referral.
 */
export default defineNuxtPlugin({ name: 'fastgen-offer-preview', enforce: 'post', setup(nuxtApp) {
  const rawUrl = import.meta.server
    ? String(nuxtApp.ssrContext?.event?.node?.req?.url || '')
    : window.location.href;
  const previewParams = new URL(rawUrl, 'http://preview.local').searchParams;
  // `offerPreview` is the canonical preview URL parameter. Accept the former
  // snake_case version too so already-created sandbox links do not regress.
  const mode = (previewParams.get('offerPreview') || previewParams.get('offer_preview'))?.trim().toLowerCase();
  const active = useState<boolean>('fastgenOfferLayoutActive', () => false);
  if (['off', '0', 'false'].includes(mode || '')) {
    active.value = false;
    nuxtApp.$config.public.offerLayoutName = '';
    nuxtApp.$config.public.offerLayoutOfferId = '';
    return;
  }
  if (['on', '1', 'true'].includes(mode || '')) {
    const forceOfferPreview = () => { active.value = true; };
    forceOfferPreview();
    // A legacy page-data watcher can still run after this plugin and reset the
    // branch when no live referral is attached. A forced preview owns the state.
    watch(active, (isActive) => {
      if (!isActive) forceOfferPreview();
    }, { flush: 'sync' });
    nuxtApp.hook('page:finish', forceOfferPreview);
    if (import.meta.client) nuxtApp.hook('app:mounted', forceOfferPreview);
    return;
  }

  // Cloudflare can hydrate a server-rendered page with an empty async-data
  // entry.  Resolve the live Frontback selection independently so that this
  // layout still follows a referral without requiring `offerPreview=on`.
  if (!import.meta.client || !String(nuxtApp.$config.public.offerLayoutName || '').trim()) return;
  const syncLiveReferral = async () => {
    const segments = window.location.pathname.split('/').filter(Boolean).map(encodeURIComponent);
    const endpoint = segments.length ? `/api/pages/${segments.join('/')}` : '/api/pages';
    try {
      const page = await $fetch<{ offer?: { id?: unknown } }>(endpoint, { cache: 'no-cache' });
      active.value = Boolean(String(page?.offer?.id || '').trim());
    } catch {
      active.value = false;
    }
  };
  void syncLiveReferral();
  nuxtApp.hook('page:finish', () => { void syncLiveReferral(); });
} });
