/**
 * Core Theme Store
 * Управление состоянием темы и runtime switching
 */

import { defineStore } from 'pinia';
import type { ThemeConfig } from '@/core/types/theme';
import { activeTheme as configuredTheme, availableThemes as configuredThemes } from '@/theme.config';

export interface ThemeState {
  activeTheme: string;
  config: ThemeConfig | null;
  isLoaded: boolean;
  isDark: boolean;
  availableThemes: string[];
  error: string | null;
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    activeTheme: configuredTheme,
    config: null,
    isLoaded: false,
    isDark: false,
    availableThemes: [...configuredThemes],
    error: null,
  }),

  getters: {
    currentTheme: (state): ThemeConfig | null => state.config,

    isThemeLoaded: (state): boolean => state.isLoaded && state.config !== null,

    themeTokens: (state) => state.config?.tokens || null,

    themeComponents: (state) => state.config?.components || {},

    themeLayouts: (state) => state.config?.layouts || {},

    hasTheme: (state) => (themeName: string) =>
      state.availableThemes.includes(themeName),
  },

  actions: {
    /**
     * Загрузка конфигурации темы
     */
    async loadTheme(themeName: string): Promise<void> {
      try {
        this.error = null;

        if (process.dev) {
          console.info(`[ThemeStore] Loading theme: ${themeName}`);
        }

        // Динамический импорт конфигурации темы
        const themeModule = await import(`../../themes/${themeName}/theme.config.ts`);
        const themeConfig = themeModule.default || themeModule.themeConfig;

        if (!themeConfig) {
          throw new Error(`Theme config not found for: ${themeName}`);
        }

        // Валидация конфигурации
        this.validateThemeConfig(themeConfig);

        // Применение темы
        await this.applyTheme(themeConfig);

        this.activeTheme = themeName;
        this.config = themeConfig;
        this.isLoaded = true;

        if (process.dev) {
          console.info('[ThemeStore] Theme loaded successfully:', themeConfig);
        }

      } catch (error: any) {
        this.error = error.message;
        this.isLoaded = false;

        console.error('[ThemeStore] Failed to load theme:', error);
        throw error;
      }
    },

    /**
     * Применение темы (CSS переменные, классы)
     */
    async applyTheme(themeConfig: ThemeConfig): Promise<void> {
      if (!import.meta.client) return;

      const root = document.documentElement;
      const tokens = themeConfig.tokens;

      // Применяем цветовые токены как CSS переменные
      if (tokens.colors) {
        this.applyCSSVariables(root, tokens.colors, '--');
      }

      // Применяем типографические токены
      if (tokens.typography) {
        Object.entries(tokens.typography.fontFamily).forEach(([key, value]) => {
          root.style.setProperty(`--font-${key}`, value);
        });
      }

      // Применяем spacing токены
      if (tokens.spacing) {
        Object.entries(tokens.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--spacing-${key}`, value);
        });
      }

      // Применяем border токены
      if (tokens.border) {
        Object.entries(tokens.border.radius).forEach(([key, value]) => {
          root.style.setProperty(`--radius-${key}`, value);
        });
      }

      // Добавляем класс темы
      root.setAttribute('data-theme', themeConfig.name);

      if (process.dev) {
        console.info('[ThemeStore] CSS variables applied');
      }
    },

    /**
     * Рекурсивное применение CSS переменных
     */
    applyCSSVariables(element: HTMLElement, obj: any, prefix: string): void {
      Object.entries(obj).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          this.applyCSSVariables(element, value, `${prefix}${key}-`);
        } else {
          element.style.setProperty(`${prefix}${key}`, String(value));
        }
      });
    },

    /**
     * Переключение темы
     */
    async setTheme(themeName: string): Promise<void> {
      if (themeName === this.activeTheme) {
        if (process.dev) {
          console.info(`[ThemeStore] Theme ${themeName} already active`);
        }
        return;
      }

      if (!this.hasTheme(themeName)) {
        throw new Error(`Theme ${themeName} is not available`);
      }

      await this.loadTheme(themeName);

      // Сохраняем в localStorage для персистентности
      if (import.meta.client) {
        localStorage.setItem('activeTheme', themeName);
      }
    },

    /**
     * Переключение темной темы
     */
    toggleDarkMode(): void {
      this.isDark = !this.isDark;

      if (import.meta.client) {
        document.documentElement.classList.toggle('dark', this.isDark);
        localStorage.setItem('isDark', String(this.isDark));
      }

      if (process.dev) {
        console.info(`[ThemeStore] Dark mode: ${this.isDark}`);
      }
    },

    /**
     * Инициализация из localStorage
     */
    initializeFromStorage(): void {
      if (!import.meta.client) return;

      try {
        const savedTheme = localStorage.getItem('activeTheme');
        const savedDarkMode = localStorage.getItem('isDark');

        if (savedTheme && this.hasTheme(savedTheme)) {
          this.activeTheme = savedTheme;
        }

        if (savedDarkMode) {
          this.isDark = savedDarkMode === 'true';
          document.documentElement.classList.toggle('dark', this.isDark);
        }

      } catch (error) {
        console.warn('[ThemeStore] Failed to load from localStorage:', error);
      }
    },

    /**
     * Валидация конфигурации темы
     */
    validateThemeConfig(config: any): void {
      if (!config || typeof config !== 'object') {
        throw new Error('Theme config must be an object');
      }

      if (!config.name || typeof config.name !== 'string') {
        throw new Error('Theme config must have a valid name');
      }

      if (!config.tokens || typeof config.tokens !== 'object') {
        throw new Error('Theme config must have tokens');
      }

      if (!config.components || typeof config.components !== 'object') {
        throw new Error('Theme config must have components mapping');
      }
    },

    /**
     * Получение токена по пути
     */
    getToken(path: string): any {
      if (!this.config?.tokens) return null;

      const keys = path.split('.');
      let value: any = this.config.tokens;

      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return null;
        }
      }

      return value;
    },

    /**
     * Получение компонента темы
     */
    getComponent(name: string): (() => Promise<any>) | null {
      return this.config?.components?.[name] || null;
    },

    /**
     * Получение layout темы
     */
    getLayout(name: string): (() => Promise<any>) | null {
      return this.config?.layouts?.[name] || null;
    },

    /**
     * Сброс состояния
     */
    reset(): void {
      this.$reset();
    },
  },
});

// Composable для удобного использования
export function useTheme() {
  const store = useThemeStore();

  return {
    // State
    activeTheme: computed(() => store.activeTheme),
    config: computed(() => store.config),
    isLoaded: computed(() => store.isLoaded),
    isDark: computed(() => store.isDark),
    error: computed(() => store.error),

    // Actions
    setTheme: store.setTheme,
    toggleDarkMode: store.toggleDarkMode,
    getToken: store.getToken,
    getComponent: store.getComponent,
    getLayout: store.getLayout,

    // Convenience methods
    isThemeActive: (themeName: string) => store.activeTheme === themeName,
    hasTheme: store.hasTheme,
  };
}
