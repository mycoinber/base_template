/**
 * Parimatch Theme Configuration
 * Полная конфигурация темы Parimatch для PBN Template System
 */

import type { ThemeConfig } from '@/core/types/theme';
import { tokens } from './tokens';

export const themeConfig: ThemeConfig = {
  // Metadata
  name: 'parimatch',
  displayName: 'Parimatch Theme',
  version: '1.0.0',
  author: 'PBN Team',
  description: 'Official Parimatch brand theme with yellow accent and dark background',

  // Design tokens
  tokens,

  // Component mapping - lazy loaded
  components: {
    // Layout components
    Header: () => import('./components/Header/index.vue'),
    Footer: () => import('./components/Footer/index.vue'),

    // Content components
    Main: () => import('./components/Main/index.vue'),
    Hero: () => import('./components/Hero/index.vue'),
    Title: () => import('./components/Title/index.vue'),
    Gallery: () => import('./components/Gallery/index.vue'),
    TableOfContent: () => import('./components/TableOfContent/index.vue'),
    Author: () => import('./components/Author/index.vue'),
    Loader: () => import('./components/Loader/index.vue'),

    // Section components
    SectionDefault: () => import('./components/Main/sections/Default.vue'),
    SectionHeading: () => import('./components/Main/sections/Heading.vue'),
    SectionIntro: () => import('./components/Main/sections/Intro.vue'),
    SectionFaq: () => import('./components/Main/sections/Faq.vue'),
    SectionReview: () => import('./components/Main/sections/Review.vue'),

    // UI components
    Button: () => import('./components/Button/index.vue'),
  },

  // Layout mapping
  layouts: {
    default: () => import('./layouts/default.vue'),
    article: () => import('./layouts/article.vue'),
  },

  // Theme features
  features: {
    darkMode: false,      // Тема уже темная
    rtl: false,           // RTL не поддерживается
    animations: true,     // Анимации включены
    customFonts: true,    // Используются кастомные шрифты
  },

  // Assets
  assets: {
    fonts: [
      '/fonts/ParimatchSans-Regular.ttf',
      '/fonts/ParimatchSans-Medium.ttf',
      '/fonts/ParimatchSans-Bold.ttf',
      '/fonts/ParimatchSans-Black.ttf',
    ],
    stylesheets: [
      './assets/scss/main.scss',
    ],
  },

  // Tailwind preset
  tailwindPreset: './tailwind.preset.ts',

  // Base design width
  baseWidth: 1440,
};

export default themeConfig;
