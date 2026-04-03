/**
 * Active Theme Configuration
 * Определяет активную тему для проекта
 */

// Список доступных тем
export const availableThemes = [
  'parimatch',
  // 'minimal',
  // 'corporate',
] as const;

export type ThemeName = typeof availableThemes[number];

// Активная тема (можно переопределить через ENV)
export const activeTheme: ThemeName = (process.env.THEME as ThemeName) || 'parimatch';

// Валидация темы
if (!availableThemes.includes(activeTheme)) {
  throw new Error(`Invalid theme: ${activeTheme}. Available themes: ${availableThemes.join(', ')}`);
}

export default {
  activeTheme,
  availableThemes,
};
