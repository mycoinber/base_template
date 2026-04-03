/**
 * Theme Resolver Plugin
 * Автоматически регистрирует компоненты активной темы
 */

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig();
  const activeTheme = config.public.activeTheme || 'parimatch';

  if (process.dev) {
    console.info(`[ThemeResolver] Loading theme: ${activeTheme}`);
  }

  try {
    // Динамический импорт конфигурации темы
    const themeConfigModule = await import(`~/themes/${activeTheme}/theme.config.ts`);
    const themeConfig = themeConfigModule.default || themeConfigModule.themeConfig;

    if (!themeConfig) {
      throw new Error('Theme config not found');
    }

    // Регистрируем theme components глобально
    const components = themeConfig.components || {};

    // Создаем алиасы для theme компонентов
    const themeComponents: Record<string, any> = {};

    for (const [name, loader] of Object.entries(components)) {
      try {
        // Создаем ленивый компонент с префиксом Theme
        const componentName = `Theme${name}`;

        themeComponents[componentName] = defineAsyncComponent({
          loader: loader as () => Promise<any>,
          loadingComponent: () => h('div', { class: 'theme-loading' }, 'Loading...'),
          errorComponent: () => h('div', { class: 'theme-error' }, `Failed to load ${name}`),
          delay: 100,
          timeout: 3000,
        });

        if (process.dev) {
          console.info(`[ThemeResolver] Registered component: ${componentName}`);
        }
      } catch (error) {
        console.error(`[ThemeResolver] Failed to register component ${name}:`, error);
      }
    }

    // Предоставляем theme components через provide
    const nuxtApp = useNuxtApp();
    nuxtApp.provide('themeComponents', themeComponents);
    nuxtApp.provide('themeConfig', themeConfig);

    if (process.dev) {
      console.info('[ThemeResolver] Theme loaded successfully:', {
        name: themeConfig.name,
        displayName: themeConfig.displayName,
        version: themeConfig.version,
        componentsCount: Object.keys(components).length,
      });
    }

  } catch (error) {
    console.error('[ThemeResolver] Failed to load theme:', error);

    // Fallback - можно загрузить дефолтную тему или показать ошибку
    if (process.dev) {
      console.warn('[ThemeResolver] Using fallback theme configuration');
    }
  }
});
