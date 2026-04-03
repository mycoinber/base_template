/**
 * Tailwind Configuration with Theme Support
 * Поддержка динамических тем через presets
 */

import type { Config } from 'tailwindcss';
import { activeThemeConfig } from './theme.config';

// Базовая конфигурация с поддержкой preset'ов
const config: Config = {
  content: [
    // Core components
    "./core/components/**/*.{js,vue,ts}",

    // Theme components
    `${activeThemeConfig.path}/components/**/*.{js,vue,ts}`,
    `${activeThemeConfig.path}/layouts/**/*.vue`,

    // App files
    "./app/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],

  theme: {
    extend: {
      // Legacy color support (for backward compatibility)
      colors: {
        'background-01': 'var(--background-01)',
        'background-02': 'var(--background-02)',
        'color-white': 'var(--color-white)',
        'color-black': 'var(--color-black)',
        'color-01': 'var(--color-01)',
        'color-02': 'var(--color-02)',
        'color-03': 'var(--color-03)',
        'pm-yellow': 'var(--pm-yellow)',
        'pm-grey': 'var(--pm-grey)',
        'border': 'var(--border)',

        // New theme-based colors
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'accent': 'var(--accent)',
      },

      // Legacy border colors
      borderColor: {
        'border': 'var(--border)',
        'primary': 'var(--primary)',
      },

      // Legacy font families
      fontFamily: {
        'font-01': ['var(--font-01)', 'sans-serif'],
        'font-02': ['var(--font-02)', 'sans-serif'],
        'primary': ['var(--font-primary)', 'sans-serif'],
        'heading': ['var(--font-heading)', 'sans-serif'],
      },

      // Animation utilities for theme components
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Core utilities
      spacing: {
        'container': '1rem',
      },

      maxWidth: {
        'container': '80%',
      },
    },
  },

  plugins: [
    // Add any additional plugins here
  ],

  // Dark mode (if themes support it)
  darkMode: 'class',

  // Important for CSS precedence with theme styles
  important: false,
};

export default config;
