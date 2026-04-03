<!--
  Parimatch Theme — Author Bar
  Дизайн: scratch_23.html / Figma node 4042:10736
  Жёлтый бар 57px: аватар | имя+роль | иконки соцсетей
-->

<script setup lang="ts">
import { resolveMediaPath } from '@core/utils/mediaPath';

interface Props {
  data: any;
}

const props = defineProps<Props>();

const sharedAuthor = useState<any>('pageAuthor', () => null);

const authorName = computed(() => sharedAuthor.value?.name || '');
const authorRole = computed(() => sharedAuthor.value?.role || 'Author');
const authorAvatar = computed(() => {
  const path = sharedAuthor.value?.avatarMedia?.path;
  return path ? resolveMediaPath(path) : '';
});

const hasAuthor = computed(() => Boolean(authorName.value));

</script>

<template>
  <section v-if="hasAuthor" class="author-bar-section">
    <div class="container">
      <div class="author-bar">

        <!-- Avatar: отступ 3px сверху/снизу/слева -->
        <div class="author-bar__avatar">
          <img
            v-if="authorAvatar"
            :src="authorAvatar"
            :alt="authorName"
            class="author-bar__avatar-img"
            loading="lazy"
          />
          <div v-else class="author-bar__avatar-placeholder" />
        </div>

        <!-- Name + Role -->
        <div class="author-bar__info">
          <b class="author-bar__name">{{ authorName }}</b>
          <div class="author-bar__role">{{ authorRole }}</div>
        </div>

        <!-- Social icons: youtube, inst, tiktok — из public/icon/24 -->
        <div class="author-bar__socials">
          <img src="/icon/24/youtube.svg" alt="YouTube" class="author-bar__social-icon" />
          <img src="/icon/24/inst.svg" alt="Instagram" class="author-bar__social-icon" />
          <img src="/icon/24/tiktok.svg" alt="TikTok" class="author-bar__social-icon" />
        </div>

      </div>
    </div>
  </section>
</template>

<style lang="scss">
/* ==========================================================================
   Author Bar — scratch_23.html
   Высота 57px, жёлтый фон, flex-layout
   ========================================================================== */

.author-bar-section {
  margin: 0;
  padding: 0;
  margin-top: clamp(60px, 8.33vw, 120px);
}

.author-bar {
  width: 100%;
  height: 57px;
  display: flex;
  align-items: center;
  position: relative;
  font-family: 'Parimatch Sans', sans-serif;
  font-size: 14px;
  color: var(--text-inverse, #000000);
  background: var(--primary, #F8FF13);
  padding: 0;

  @media (max-width: 640px) {
    height: 57px;
    min-height: 57px;
  }
}

/* Avatar — 3px отступ сверху/снизу/слева ВСЕГДА, размер 49x51 ВСЕГДА */
.author-bar__avatar {
  flex-shrink: 0;
  width: 49px;
  height: 51px;
  overflow: hidden;
  margin: 3px 0 3px 3px !important;
  align-self: auto; /* не растягиваем — фиксированная высота */
}

.author-bar__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.author-bar__avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.15);
}

/* Name + Role — отступ слева 12px, сверху и снизу 11px — ВСЕГДА */
.author-bar__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 12px;
  padding: 11px 0;
}

.author-bar__name {
  font-weight: 700;
  font-size: 14px;
  line-height: 1;
  text-transform: uppercase;
  display: block;
}

.author-bar__role {
  font-weight: 500;
  font-size: 14px;
  line-height: 130%;
  display: block;
  color: var(--text-secondary, #9a9a9a);
}

/* Social icons — gap: 6px, отступ от правого края 32px, сверху 13px, снизу 12px */
.author-bar__socials {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin: 13px 32px 12px 0; /* desktop @ 1440px */

  @media (max-width: 640px) {
    margin: 15px 12px 14px 0; /* mobile */
  }
}

.author-bar__social-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: opacity 0.2s ease;
  display: block;

  &:hover {
    opacity: 0.6;
  }
}
</style>
