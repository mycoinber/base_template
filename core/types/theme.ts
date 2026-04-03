/**
 * Theme Configuration Types
 * Определяет структуру конфигурации темы для PBN Template System
 */

import type { Component } from 'vue';

// ============================================================================
// Design Tokens
// ============================================================================

export interface ColorTokens {
  // Semantic colors
  primary: string;
  secondary: string;
  accent?: string;

  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary?: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary?: string;
    heading: string;
    muted?: string;
    inverse: string;
  };

  // Border colors
  border: {
    default: string;
    light?: string;
    dark?: string;
  };

  // State colors
  state: {
    hover: string;
    active: string;
    disabled: string;
    error?: string;
    success?: string;
    warning?: string;
  };
}

export interface TypographyTokens {
  fontFamily: {
    primary: string;
    heading: string;
    mono?: string;
  };

  fontSize: {
    xs: string;      // 12px
    sm: string;      // 14px
    base: string;    // 16-18px
    lg: string;      // 20px
    xl: string;      // 24px
    '2xl': string;   // 32px
    '3xl': string;   // 40-50px
    '4xl'?: string;  // 60px+
  };

  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
    black?: number;
  };

  lineHeight: {
    tight: string;    // 80-100%
    snug: string;     // 100-110%
    normal: string;   // 130%
    relaxed: string;  // 150%
  };

  letterSpacing: {
    tight: string;    // -0.02em
    normal: string;   // 0
    wide: string;     // 0.02em
  };
}

export interface SpacingTokens {
  px: string;
  0: string;
  1: string;   // 4px
  2: string;   // 8px
  3: string;   // 12px
  4: string;   // 16px
  5: string;   // 20px
  6: string;   // 24px
  8: string;   // 32px
  10: string;  // 40px
  12: string;  // 48px
  16: string;  // 64px
  20?: string; // 80px
  24?: string; // 96px
}

export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };

  width: {
    default: string;
    thin: string;
    thick: string;
  };
}

export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface BreakpointTokens {
  xs: number;   // 320px
  sm: number;   // 640px
  md: number;   // 768px
  lg: number;   // 1024px
  xl: number;   // 1280px
  '2xl': number; // 1440px
}

export interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  border?: BorderTokens;
  shadow?: ShadowTokens;
  breakpoints?: BreakpointTokens;
}

// ============================================================================
// Component Mapping
// ============================================================================

export type AsyncComponentLoader = () => Promise<{ default: Component }>;

export interface ThemeComponents {
  // Layout components
  Header: AsyncComponentLoader;
  Footer: AsyncComponentLoader;

  // Content components
  Hero?: AsyncComponentLoader;
  Title?: AsyncComponentLoader;
  TableOfContent?: AsyncComponentLoader;
  Author?: AsyncComponentLoader;

  // Section components
  SectionDefault?: AsyncComponentLoader;
  SectionHeading?: AsyncComponentLoader;
  SectionIntro?: AsyncComponentLoader;
  SectionFaq?: AsyncComponentLoader;
  SectionReview?: AsyncComponentLoader;

  // UI components
  Button?: AsyncComponentLoader;
  ButtonPrimary?: AsyncComponentLoader;
  ButtonSecondary?: AsyncComponentLoader;
  Card?: AsyncComponentLoader;
  Accordion?: AsyncComponentLoader;
  Modal?: AsyncComponentLoader;
  Dropdown?: AsyncComponentLoader;
  Tabs?: AsyncComponentLoader;

  // Allow custom components
  [key: string]: AsyncComponentLoader | undefined;
}

export interface ThemeLayouts {
  default: AsyncComponentLoader;
  article?: AsyncComponentLoader;
  landing?: AsyncComponentLoader;
  error?: AsyncComponentLoader;

  // Allow custom layouts
  [key: string]: AsyncComponentLoader | undefined;
}

// ============================================================================
// Theme Configuration
// ============================================================================

export interface ThemeMetadata {
  name: string;
  displayName: string;
  version: string;
  author?: string;
  description?: string;
  preview?: string; // URL to preview image
}

export interface ThemeFeatures {
  darkMode?: boolean;
  rtl?: boolean;
  animations?: boolean;
  customFonts?: boolean;
}

export interface ThemeAssets {
  fonts?: string[];           // Font file paths
  images?: string[];          // Image paths
  icons?: string[];           // Icon paths
  stylesheets?: string[];     // Additional CSS files
}

export interface ThemeConfig {
  // Metadata
  name: string;
  displayName: string;
  version: string;
  author?: string;
  description?: string;

  // Design tokens
  tokens: DesignTokens;

  // Component mapping
  components: ThemeComponents;

  // Layout mapping
  layouts: ThemeLayouts;

  // Features
  features?: ThemeFeatures;

  // Assets
  assets?: ThemeAssets;

  // Tailwind preset path (relative to theme folder)
  tailwindPreset?: string;

  // Base design width (default: 1440)
  baseWidth?: number;
}

// ============================================================================
// Theme Store State
// ============================================================================

export interface ThemeState {
  activeTheme: string;
  isDark: boolean;
  isLoaded: boolean;
  config: ThemeConfig | null;
}

// ============================================================================
// Theme Registry
// ============================================================================

export interface ThemeRegistry {
  [themeName: string]: {
    config: ThemeConfig;
    path: string;
  };
}

// ============================================================================
// Runtime Theme API
// ============================================================================

export interface ThemeAPI {
  // Get current theme
  getCurrentTheme(): ThemeConfig | null;

  // Switch theme
  setTheme(themeName: string): Promise<void>;

  // Get available themes
  getAvailableThemes(): string[];

  // Get component by name
  getComponent(name: keyof ThemeComponents): AsyncComponentLoader | undefined;

  // Get layout by name
  getLayout(name: keyof ThemeLayouts): AsyncComponentLoader | undefined;

  // Get design token value
  getToken<T extends keyof DesignTokens>(
    category: T,
    path: string
  ): string | number | undefined;

  // Toggle dark mode
  toggleDarkMode(): void;

  // Check if dark mode is active
  isDarkMode(): boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

// Extract component names from theme config
export type ThemeComponentName = keyof ThemeComponents;

// Extract layout names from theme config
export type ThemeLayoutName = keyof ThemeLayouts;

// Color key paths for type-safe access
export type ColorPath =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'background.primary'
  | 'background.secondary'
  | 'text.primary'
  | 'text.heading'
  | 'text.inverse'
  | 'border.default'
  | 'state.hover'
  | 'state.active'
  | 'state.disabled';

// Typography key paths
export type TypographyPath =
  | 'fontFamily.primary'
  | 'fontFamily.heading'
  | 'fontSize.xs'
  | 'fontSize.sm'
  | 'fontSize.base'
  | 'fontSize.lg'
  | 'fontSize.xl'
  | 'fontSize.2xl'
  | 'fontSize.3xl'
  | 'fontWeight.regular'
  | 'fontWeight.medium'
  | 'fontWeight.bold'
  | 'lineHeight.tight'
  | 'lineHeight.normal'
  | 'letterSpacing.tight'
  | 'letterSpacing.normal';

