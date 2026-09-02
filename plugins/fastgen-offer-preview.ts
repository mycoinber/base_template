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
  if (!['on', '1', 'true'].includes(mode || '')) return;

  const forceOfferPreview = () => { active.value = true; };
  forceOfferPreview();
  nuxtApp.hook('page:finish', forceOfferPreview);
  if (import.meta.client) nuxtApp.hook('app:mounted', forceOfferPreview);
} });
