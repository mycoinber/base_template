/**
 * Parimatch Theme - Spacing Tokens
 * Отступы и размеры темы Parimatch
 */

import type { SpacingTokens, BorderTokens, ShadowTokens, BreakpointTokens } from '@/core/types/theme';

export const spacing: SpacingTokens = {
  px: '1px',
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
} as const;

export const border: BorderTokens = {
  radius: {
    none: '0',
    sm: '0.25rem',     // 4px
    md: '0.5rem',      // 8px
    lg: '0.625rem',    // 10px (основной)
    xl: '1rem',        // 16px
    full: '9999px',    // круглый
  },

  width: {
    default: '1px',
    thin: '0.5px',
    thick: '2px',
  },
} as const;

export const shadow: ShadowTokens = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
} as const;

export const breakpoints: BreakpointTokens = {
  xs: 320,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1440,  // базовая ширина дизайна
} as const;

export default spacing;
