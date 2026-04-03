/**
 * Parimatch Theme - Color Tokens
 * Цветовая палитра темы Parimatch
 */

import type { ColorTokens } from '@/core/types/theme';

export const colors: ColorTokens = {
  // Semantic colors
  primary: '#F8FF13',      // pm-yellow
  secondary: '#e00840',    // color-01 (red)
  accent: '#2b8ef9',       // color-02 (blue)

  // Background colors
  background: {
    primary: '#000000',    // background-01
    secondary: '#2d3345',  // background-02
    tertiary: '#1a1f2e',   // darker variant
  },

  // Text colors
  text: {
    primary: '#C8C3C7',    // pm-grey - основной текст
    secondary: '#9a9a9a',  // muted text
    heading: '#F8FF13',    // pm-yellow - заголовки
    muted: '#545969',      // very muted text
    inverse: '#000000',    // черный (для желтого фона)
  },

  // Border colors
  border: {
    default: '#545969',    // border
    light: '#C8C3C7',      // pm-grey
    dark: '#2d3345',       // background-02
  },

  // State colors
  state: {
    hover: '#FFE500',      // lighter yellow
    active: '#F8FF13',     // pm-yellow
    disabled: '#545969',   // muted
    error: '#e00840',      // red
    success: '#00c853',    // green
    warning: '#ffab00',    // orange
  },
} as const;

export default colors;
