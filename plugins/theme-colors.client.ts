/**
 * Theme Colors Plugin
 * Применяет цвета из .env (NUXT_PUBLIC_COLOR_*) как CSS-переменные на :root
 *
 * Использование в .env:
 *   NUXT_PUBLIC_COLOR_PRIMARY=#FF0000
 *   NUXT_PUBLIC_COLOR_BG_PRIMARY=#111111
 *   ...
 *
 * Это перезаписывает дефолтные значения из _tokens.scss / main.scss
 */
export default defineNuxtPlugin(() => {
  const pub = useRuntimeConfig().public

  const get = (key: string): string => (pub as any)[key] || ''

  const colorMap: [string, string][] = [
    ['--primary',              get('colorPrimary')],
    ['--secondary',            get('colorSecondary')],
    ['--accent',               get('colorAccent')],
    ['--background-primary',   get('colorBgPrimary')],
    ['--background-secondary', get('colorBgSecondary')],
    ['--text-primary',         get('colorTextPrimary')],
    ['--text-heading',         get('colorTextHeading')],
    ['--text-inverse',         get('colorTextInverse')],
    ['--border-default',       get('colorBorder')],
  ]

  const root = document.documentElement
  colorMap.forEach(([cssVar, value]) => {
    if (value.trim()) {
      root.style.setProperty(cssVar, value.trim())
    }
  })
})
