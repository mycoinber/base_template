/**
 * Parimatch Theme - Tailwind Preset
 * Tailwind CSS конфигурация для темы Parimatch
 */

import type { Config } from 'tailwindcss';
import { colors } from './tokens/colors';
import { typography } from './tokens/typography';
import { spacing, border, breakpoints } from './tokens/spacing';

const preset: Partial<Config> = {
  theme: {
    extend: {
      // Colors
      colors: {
        // Primary palette
        primary: colors.primary,
        secondary: colors.secondary,
        accent: colors.accent ?? '#2b8ef9',

        // Background
        'background-01': colors.background.primary,
        'background-02': colors.background.secondary,

        // Text
        'pm-grey': colors.text.primary,
        'pm-yellow': colors.text.heading,

        // Semantic
        'color-01': colors.secondary,
        'color-02': colors.accent ?? '#2b8ef9',
        'color-03': colors.primary,

        // Legacy support
        'color-white': '#ffffff',
        'color-black': '#000000',

        // Border
        border: colors.border.default,
      },

      // Typography
      fontFamily: {
        'font-01': [typography.fontFamily.primary],
        'font-02': [typography.fontFamily.heading],
        sans: [typography.fontFamily.primary],
        heading: [typography.fontFamily.heading],
      },

      fontSize: {
        xs: typography.fontSize.xs,
        sm: typography.fontSize.sm,
        base: typography.fontSize.base,
        lg: typography.fontSize.lg,
        xl: typography.fontSize.xl,
        '2xl': typography.fontSize['2xl'],
        '3xl': typography.fontSize['3xl'],
        ...(typography.fontSize['4xl'] ? { '4xl': typography.fontSize['4xl'] } : {}),
      },

      fontWeight: {
        regular: typography.fontWeight.regular.toString(),
        medium: typography.fontWeight.medium.toString(),
        semibold: typography.fontWeight.semibold.toString(),
        bold: typography.fontWeight.bold.toString(),
        black: typography.fontWeight.black?.toString() || '900',
      },

      lineHeight: {
        tight: typography.lineHeight.tight,
        snug: typography.lineHeight.snug,
        normal: typography.lineHeight.normal,
        relaxed: typography.lineHeight.relaxed,
      },

      letterSpacing: {
        tight: typography.letterSpacing.tight,
        normal: typography.letterSpacing.normal,
        wide: typography.letterSpacing.wide,
      },

      // Spacing
      spacing: {
        ...spacing,
      },

      // Border radius
      borderRadius: {
        ...border.radius,
      },

      // Breakpoints
      screens: {
        xs: `${breakpoints.xs}px`,
        sm: `${breakpoints.sm}px`,
        md: `${breakpoints.md}px`,
        lg: `${breakpoints.lg}px`,
        xl: `${breakpoints.xl}px`,
        '2xl': `${breakpoints['2xl']}px`,
      },

      // Custom utilities
      maxWidth: {
        'container': '85.125rem', // 1362px
      },

      height: {
        'toc': '4.063rem', // 65px
      },
    },
  },

  plugins: [],
};

export default preset;
