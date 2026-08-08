/**
 * Preview-only Offer switch.
 *
 * The selected offer layer remains mounted in a site revision. In the admin
 * sandbox, `offerPreview=off` renders the same page with its default layout
 * so users can compare both states without restarting the development server.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const rawUrl = import.meta.server
    ? String(nuxtApp.ssrContext?.event?.node?.req?.url || '')
    : window.location.href;
  const mode = new URL(rawUrl, 'http://preview.local').searchParams.get('offerPreview')?.trim().toLowerCase();
  if (!['off', '0', 'false'].includes(mode || '')) return;

  nuxtApp.$config.public.offerLayoutName = '';
  nuxtApp.$config.public.offerLayoutOfferId = '';
});
