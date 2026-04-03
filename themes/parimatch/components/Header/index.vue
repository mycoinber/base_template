<!--
  Parimatch Theme - Header Component
  Desktop: flex bar с центрированной навигацией
  Mobile:  отдельный бар + жёлтое выпадающее меню
-->

<script setup lang="ts">
import type { SiteNavigation, WebsiteManifestPayload, ArticleImage, PageOffer } from '@/core/types/page';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  data: SiteNavigation | null;
  siteManifest?: WebsiteManifestPayload | null;
  logoImage?: ArticleImage | null;
  offers?: PageOffer[];
}

const props = defineProps<Props>();

const desktopLogoSrc = '/icon/logo.svg';
const desktopLogoAlt = computed(() => props.siteManifest?.title || 'Logo');

// ============================================================================
// Logo
// ============================================================================

const sharedLogo = useState<ArticleImage[]>('siteLogo', () => []);

const resolvedLogo = computed<ArticleImage | null>(() => {
  if (props.logoImage?.path) return props.logoImage;
  if (props.siteManifest?.logo) return { path: props.siteManifest.logo, alt: props.siteManifest.title || 'Logo' };
  const fromState = Array.isArray(sharedLogo.value) ? sharedLogo.value : [];
  if (fromState.length) return fromState[0] as ArticleImage;
  const fallback = (props.data as any)?.logo;
  if (Array.isArray(fallback) && fallback.length) return fallback[0];
  return null;
});

// ============================================================================
// Navigation
// ============================================================================

const navigationLinks = computed(() => {
  if (!props.data?.pages) return [];
  return props.data.pages
    .map((page) => {
      let title = page.title || '';
      if (title.match(/[-–:|]/)) title = title.split(/[-–:|]/)[0].trim();
      return {
        name: page.homePage === true ? t('home') : title,
        slug: page.homePage === true ? '' : page.slug,
      };
    })
    .sort((a, b) => (a.name === t('home') ? -1 : b.name === t('home') ? 1 : 0));
});

// ============================================================================
// Header offer (placement === 'header')
// ============================================================================

const sharedOffers = useState<PageOffer[]>('pageOffers', () => []);

const headerOffer = computed<PageOffer | null>(() => {
  const source = props.offers?.length ? props.offers : sharedOffers.value;
  return source.find((o) => o.placement === 'header' && o.data?.state !== 'inactive') ?? null;
});

const ctaLink = computed(() => headerOffer.value?.data?.link || '');
const ctaText = computed(() => headerOffer.value?.data?.ctaText || t('registration'));

// ============================================================================
// Mobile menu
// ============================================================================

const isOpen = ref(false);
</script>

<template>
  <!-- ============================================================
       DESKTOP HEADER (скрыт на мобилке)
       ============================================================ -->
  <header class="theme-header-desktop hidden lg:block w-full h-[67px] relative">

    <!-- Logo -->
    <NuxtLink to="/" class="theme-header-logo relative block">
      <img
        :src="desktopLogoSrc"
        :alt="desktopLogoAlt"
        class="absolute inset-0 w-full h-full object-contain"
      />
    </NuxtLink>

    <!-- Desktop Navigation (кстрого по центру) -->
    <nav class="theme-header-nav flex items-center gap-[16px] absolute left-1/2 -translate-x-1/2">
      <NuxtLink
        v-for="(link, i) in navigationLinks"
        :key="i"
        :to="`/${link.slug}`"
        class="theme-header-link font-medium cursor-pointer transition-colors duration-200"
      >
        {{ link.name }}
      </NuxtLink>
    </nav>

    <!-- CTA Button -->
    <ThemeButton
      v-if="ctaLink"
      variant="tertiary"
      size="lg"
      :data="{ link: ctaLink, title: ctaText, target: '_blank', rel: 'noopener noreferrer' }"
      class="theme-header-cta"
    />

  </header>

  <!-- ============================================================
       MOBILE BAR (скрыт на десктопе)
       ============================================================ -->
  <header class="theme-header-mobile lg:hidden w-full h-[66px] px-[16px] flex items-center justify-between relative z-50 font-['Parimatch_Sans']">

    <!-- Logo -->
    <NuxtLink to="/" class="relative w-[168px] h-[27px] shrink-0 block">
      <NuxtImg
        v-if="resolvedLogo?.path"
        :src="resolvedLogo.path"
        :alt="resolvedLogo?.alt || 'logo'"
        class="absolute inset-0 w-full h-full object-contain"
      />
    </NuxtLink>

    <!-- Burger Button — асимметричные полоски -->
    <button
      class="flex flex-col items-start justify-center gap-[4px] w-[44px] h-[34px] cursor-pointer bg-transparent border-none p-0"
      aria-label="Toggle menu"
      @click="isOpen = !isOpen"
    >
      <div class="theme-header-burger-line w-[23px] h-[2px] transition-all duration-300" :class="{ 'is-open': isOpen }" />
      <div class="theme-header-burger-line theme-header-burger-line--short w-[14px] h-[2px] transition-all duration-300" :class="{ 'is-open': isOpen }" />
    </button>

  </header>

  <!-- ============================================================
       MOBILE EXPANDED MENU — по дизайну Figma
       Жёлтый блок сверху с навигацией + чёрная кнопка Registration
       Чёрный фон снизу закрывает остаток экрана
       ============================================================ -->
  <Transition
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="lg:hidden fixed inset-0 top-[66px] w-full z-40 flex flex-col overflow-y-auto font-['Parimatch_Sans']"
    >
      <!-- Жёлтая зона: навигация + кнопка Registration -->
      <div class="theme-header-menu w-full flex flex-col items-center pt-8 pb-0 px-[16px]">

        <!-- Ссылки навигации — чёрный текст 21px -->
        <nav class="theme-header-menu-nav flex flex-col items-center gap-[8px] text-[21px] w-full">
          <NuxtLink
            v-for="(link, i) in navigationLinks"
            :key="i"
            :to="`/${link.slug}`"
            class="font-medium cursor-pointer hover:opacity-60 transition-opacity w-full text-center py-1"
            @click="isOpen = false"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <!-- Кнопка Registration — чёрный фон, жёлтый текст -->
        <div class="w-full mt-8 mb-0" @click="isOpen = false">
          <ThemeButton
            v-if="ctaLink"
            variant="tertiary"
            size="sm"
            :data="{ link: ctaLink, title: ctaText, target: '_blank', rel: 'noopener noreferrer' }"
            class="w-full justify-center"
          />
        </div>

      </div>

      <!-- Полупрозрачная зона — закрывает меню по клику -->
      <div class="flex-1 bg-black/60 backdrop-blur-sm" @click="isOpen = false" />

    </div>
  </Transition>

</template>

<style scoped lang="scss">
.theme-header-desktop {
  color: var(--text-primary, #C8C3C7);
  text-align: left;
  font-size: 14px;
  font-family: 'Parimatch Sans', sans-serif;
}

.theme-header-logo {
  position: absolute;
  top: 16px;
  left: 39px;
  width: 217px;
  height: 35px;
}

.theme-header-nav {
  top: 25px;
}

.theme-header-link {
  position: relative;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Parimatch Sans', sans-serif;
  color: var(--text-primary, #C8C3C7);
  text-align: left;

  &:hover {
    color: var(--text-contrast, #ffffff);
  }

  &.router-link-active,
  &.router-link-exact-active,
  &[aria-current="page"] {
    color: var(--text-primary, #C8C3C7);
  }
}

.theme-header-cta {
  position: absolute;
  top: 15px;
  right: 39px;
}

.theme-header-mobile {
  background: var(--background-primary, #000000);
  color: var(--text-primary, #C8C3C7);
}

.theme-header-burger-line {
  background: var(--primary, #F8FF13);

  &.is-open {
    background: var(--text-inverse, #000000);
  }
}

.theme-header-menu {
  background: var(--primary, #F8FF13);
}

.theme-header-menu-nav {
  color: var(--text-inverse, #000000);
}
</style>
