/**
 * Parimatch Theme - Nuxt Layer Configuration
 * Этот файл позволяет теме работать как Nuxt Layer
 */

export default defineNuxtConfig({
  // Компоненты темы с префиксом Theme
  components: [
    {
      path: './components',
      pathPrefix: false,
      prefix: 'Theme',
    },
  ],

  // CSS стили темы
  css: [
    './assets/scss/main.scss',
  ],

  // Composables темы (если есть)
  // imports: {
  //   dirs: ['./composables'],
  // },
});
