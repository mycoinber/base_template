<!--
  Parimatch Theme - Footer Component
  Дизайн: scratch_23.html (Figma footer 1440px)
  Только Tailwind CSS, без <style>
-->

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { resolveMediaPath } from '@core/utils/mediaPath';
import type { SiteNavigation, WebsiteManifestPayload, PageOffer } from '@/core/types/page';

const { t } = useI18n();

interface Props {
  data: SiteNavigation | null;
  siteManifest?: WebsiteManifestPayload | null;
  offers?: PageOffer[];
}

const props = defineProps<Props>();

// ============================================================================
// Logo
// ============================================================================

const sharedLogo = useState('siteLogo', () => []);

const resolvedLogo = computed(() => {
  const fromState = Array.isArray(sharedLogo.value) ? sharedLogo.value : [];
  if (fromState.length) return fromState[0];
  const fallback = (props.data as any)?.logo;
  if (Array.isArray(fallback) && fallback.length) return fallback[0];
  return null;
});

// ============================================================================
// Navigation — split into 2 columns
// ============================================================================

const navigationLinks = computed(() => {
  if (!props.data?.pages) return [];
  return props.data.pages
    .map((page) => {
      let title = page.title || '';
      if (title.match(/[-–:|]/)) title = title.split(/[-–:|]/)[0].trim();
      return {
        name: page.homePage ? t('home') : title,
        slug: page.homePage ? '' : page.slug,
      };
    })
    .sort((a, b) => (a.name === t('home') ? -1 : b.name === t('home') ? 1 : 0));
});

// Разбиваем ссылки на две колонки
const leftColumn = computed(() => navigationLinks.value.slice(0, Math.ceil(navigationLinks.value.length / 2)));
const rightColumn = computed(() => navigationLinks.value.slice(Math.ceil(navigationLinks.value.length / 2)));

// ============================================================================
// Footer offer (placement === 'footer')
// ============================================================================

const sharedOffers = useState<PageOffer[]>('pageOffers', () => []);

const footerOffer = computed<PageOffer | null>(() => {
  const source = props.offers?.length ? props.offers : sharedOffers.value;
  return source.find(
    (o) => o.placement === 'footer' && o.data?.state !== 'inactive'
  ) ?? null;
});

const ctaLink = computed(() => footerOffer.value?.data?.link || '');
const ctaText = computed(() => footerOffer.value?.data?.ctaText || t('registration'));
const footerImage = computed(() => {
  const path = footerOffer.value?.data?.imageMedia?.path;
  return path ? resolveMediaPath(path) : '';
});
const footerOfferTitle = computed(() => footerOffer.value?.data?.title || '');

// ============================================================================
// Author
// ============================================================================

const sharedAuthor = useState<any>('pageAuthor', () => null);

const authorName = computed(() => sharedAuthor.value?.name || '');
const authorBio = computed(() => sharedAuthor.value?.bio || '');
const authorRole = computed(() => sharedAuthor.value?.role || '');
const authorAvatar = computed(() => {
  const path = sharedAuthor.value?.avatarMedia?.path;
  return path ? resolveMediaPath(path) : '';
});

// ============================================================================
// Meta
// ============================================================================

const url = useRequestURL();
const siteDomain = `${url.protocol}//${url.host}`;

const siteTitle = computed(() => props.siteManifest?.title || siteDomain);
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="w-full bg-black text-pm-grey text-[14px] font-['Parimatch_Sans']">
    <div class="container">


      <!-- ====== Main Footer Grid ====== -->
      <div class="flex flex-wrap items-start justify-between gap-8 py-10 md:py-16">

        <!-- Left: Logo + Nav Columns -->
        <div class="flex flex-col gap-8">

          <!-- Logo -->
          <NuxtLink to="/" class="relative w-[168px] h-[27px] md:w-[217px] md:h-[35px] shrink-0 block">
            <NuxtImg
              v-if="resolvedLogo"
              :src="resolvedLogo?.path || ''"
              :alt="resolvedLogo?.alt || 'logo'"
              class="absolute inset-0 w-full h-full object-contain"
            />
          </NuxtLink>

          <!-- Navigation: 2 columns -->
          <div class="flex gap-16 sm:gap-24">
            <!-- Column 1 -->
            <nav class="flex flex-col gap-2">
              <NuxtLink
                v-for="link in leftColumn"
                :key="link.slug"
                :to="`/${link.slug}`"
                class="text-[#c8c3c7] font-medium hover:text-white transition-colors duration-200"
              >
                {{ link.name }}
              </NuxtLink>
            </nav>

            <!-- Column 2 -->
            <nav v-if="rightColumn.length" class="flex flex-col gap-2">
              <NuxtLink
                v-for="link in rightColumn"
                :key="link.slug"
                :to="`/${link.slug}`"
                class="text-[#c8c3c7] font-medium hover:text-white transition-colors duration-200"
              >
                {{ link.name }}
              </NuxtLink>
            </nav>
          </div>
        </div>

        <!-- Right: CTA + Social icons placeholder -->
        <div class="flex flex-col items-end gap-6 shrink-0">
          <!-- CTA Button -->
          <ThemeButton
            v-if="footerOffer && ctaLink"
            variant="tertiary"
            size="sm"
            :data="{ link: ctaLink, title: ctaText, target: '_blank', rel: 'noopener noreferrer' }"
          />

          <!-- Social Icons placeholder (3 icons like in design) -->
          <div class="flex items-center gap-1.5">
            <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <Icon name="carbon:logo-youtube" class="w-5 h-5 text-pm-grey" />
            </div>
            <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <Icon name="carbon:logo-twitter" class="w-5 h-5 text-pm-grey" />
            </div>
            <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
              <Icon name="carbon:logo-instagram" class="w-5 h-5 text-pm-grey" />
            </div>
          </div>
        </div>

      </div>

      <!-- ====== Footer Offer Banner (imageMedia из placement=footer) ====== -->
      <a
        v-if="footerOffer && footerImage && ctaLink"
        :href="ctaLink"
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full overflow-hidden mb-6 hover:opacity-90 transition-opacity duration-200"
      >
        <img
          :src="footerImage"
          :alt="footerOfferTitle || 'Offer'"
          class="w-full h-auto object-cover"
          loading="lazy"
        />
      </a>

      <!-- ====== Bottom Bar: Copyright + Legal links ====== -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-white/10">
        <span class="font-medium opacity-60">
          &copy; Copyright {{ currentYear }}. {{ siteTitle }}
        </span>
        <div class="flex items-center gap-4">
          <NuxtLink to="/privacy-policy" class="text-pm-grey font-medium hover:text-white transition-colors duration-200">
            Privacy Policy
          </NuxtLink>
          <NuxtLink to="/terms-of-use" class="text-pm-grey font-medium hover:text-white transition-colors duration-200">
            Terms of Use
          </NuxtLink>
        </div>
      </div>

    </div>
  </footer>
</template>
