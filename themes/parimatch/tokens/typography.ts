/**
 * Parimatch Theme - Typography Tokens
 * Типографика темы Parimatch
 */

import type { TypographyTokens } from '@/core/types/theme';

export const typography: TypographyTokens = {
  fontFamily: {
    primary: "'ParimatchSans', sans-serif",
    heading: "'ParimatchSans', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1.125rem',   // 18px (базовый текст)
    lg: '1.25rem',      // 20px
    xl: '1.5rem',       // 24px
    '2xl': '2rem',      // 32px
    '3xl': '3.125rem',  // 50px (H1, H2)
    '4xl': '4rem',      // 64px
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  lineHeight: {
    tight: '80%',       // для больших заголовков
    snug: '100%',       // для заголовков
    normal: '130%',     // для текста
    relaxed: '150%',    // для длинного текста
  },

  letterSpacing: {
    tight: '-0.02em',   // -2% для заголовков
    normal: '0',        // 0 для текста
    wide: '0.02em',     // 2% для капса
  },
} as const;

export default typography;
