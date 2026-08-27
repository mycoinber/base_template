/**
 * Turns interactive elements of an active offer layout into an affiliate
 * redirect. The redirect stays same-origin first, so the server can resolve
 * the current site's approved offer link through Frontback before returning a
 * safe 302 to the visitor.
 *
 * To opt an element out (for example an account menu), add
 * `data-fastgen-offer-navigation="off"`. Non-semantic custom controls can opt
 * in explicitly with `data-fastgen-offer-click`.
 */
const CLICKABLE_SELECTOR = [
  "a[href]",
  "button",
  "input[type='button']",
  "input[type='submit']",
  "input[type='image']",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "summary",
  "[onclick]",
  "[data-fastgen-offer-click]",
].join(",");

const normalizeOfferId = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return String(record._id || record.id || record.offer || record.offerId || "").trim();
  }
  return "";
};

export default defineNuxtPlugin({
  name: "fastgen-offer-clickthrough",
  setup() {
    const offerLayoutActive = useState<boolean>("fastgenOfferLayoutActive", () => false);
    const currentOfferId = useState<string | null>("currentOfferId", () => null);

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !offerLayoutActive.value
      ) {
        return;
      }

      const source = event.target;
      if (!(source instanceof Element)) return;

      const clickable = source.closest(CLICKABLE_SELECTOR);
      if (!clickable || clickable.closest("[data-fastgen-offer-navigation='off']")) return;
      if (clickable.matches("[disabled], [aria-disabled='true']")) return;

      const offerId = normalizeOfferId(currentOfferId.value);
      if (!offerId) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.assign(`/go/offer/${encodeURIComponent(offerId)}`);
    };

    // Capture phase ensures that an offer-layout CTA cannot navigate to a
    // placeholder URL before the referral redirect has been resolved.
    document.addEventListener("click", onClick, true);
    return {
      provide: {
        fastgenOfferClickthrough: true,
      },
    };
  },
});
