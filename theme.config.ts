/**
 * Theme Registry
 * Единая точка правды для доступных тем и выбора активной темы через ENV.
 *
 * Важно: активная тема выбирается на этапе запуска/build Nuxt.
 * Это не runtime switcher для одного и того же bundle, а deployment-level выбор темы.
 */

export const themeRegistry = {
  parimatch: {
    displayName: "Parimatch Theme",
    path: "./themes/parimatch",
  },
  // minimal: {
  //   displayName: "Minimal Theme",
  //   path: "./themes/minimal",
  // },
  // corporate: {
  //   displayName: "Corporate Theme",
  //   path: "./themes/corporate",
  // },
} as const;

export type ThemeName = keyof typeof themeRegistry;

export const availableThemes = Object.keys(themeRegistry) as ThemeName[];
export const defaultTheme: ThemeName = "parimatch";

function resolveConfiguredTheme(): string {
  return (
    process.env.ACTIVE_THEME
    || process.env.THEME
    || defaultTheme
  ).trim();
}

export const activeTheme = resolveConfiguredTheme() as ThemeName;

if (!availableThemes.includes(activeTheme)) {
  throw new Error(
    `Invalid active theme "${activeTheme}". Available themes: ${availableThemes.join(", ")}`
  );
}

export const activeThemeConfig = themeRegistry[activeTheme];

export default {
  activeTheme,
  activeThemeConfig,
  availableThemes,
  defaultTheme,
  themeRegistry,
};
