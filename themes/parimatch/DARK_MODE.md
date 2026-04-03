# Поддержка темного режима в теме Parimatch

## Обзор

Тема Parimatch поддерживает темный режим через два механизма:
1. **Класс `.dark-mode`** - программное управление темой
2. **System Preference** - автоматическое определение системной настройки (`prefers-color-scheme: dark`)

## CSS переменные для темного режима

### Основные цвета
```css
--primary-dark: #D4E800              /* Основной цвет в темном режиме */
--background-dark: #0a0a0a           /* Фон в темном режиме */
--background-secondary-dark: #1a1a1a /* Вторичный фон */
--text-primary-dark: #e0e0e0         /* Основной текст */
--text-inverse-dark: #000000         /* Инверсный текст */
--border-dark: #333333               /* Границы */
```

## Использование

### Метод 1: Программное управление

Добавьте класс `.dark-mode` к корневому элементу:

```javascript
// Включить темный режим
document.documentElement.classList.add('dark-mode')

// Выключить темный режим
document.documentElement.classList.remove('dark-mode')
```

### Метод 2: Системная настройка

Темный режим автоматически включается на основе системных настроек пользователя.
Чтобы отключить это поведение, добавьте класс `.light-mode`:

```javascript
// Принудительно использовать светлую тему
document.documentElement.classList.add('light-mode')
```

## Компоненты с поддержкой темного режима

### TableOfContent

Компонент оглавления полностью поддерживает темный режим:

```vue
<TableOfContent :items="tocItems" />
```

**Темный режим применяется к:**
- Заголовку (`.toc-header`)
- Контенту (`.toc-content`)
- Элементам списка (`.toc-item`)
- Иконкам (`.toc-icon`)
- Значкам типа (`.toc-type-badge`)
- Нумерации (`.toc-number`)
- Счетчику (`.toc-counter`)

## Добавление поддержки темного режима в новые компоненты

### Шаг 1: Использование CSS переменных

```vue
<style scoped>
.my-component {
  background: var(--background-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}
</style>
```

### Шаг 2: Добавление специфичных стилей для темного режима

```vue
<style scoped>
/* Базовые стили */
.my-component {
  background: var(--background-primary);
  color: var(--text-primary);
}

/* Темный режим */
@media (prefers-color-scheme: dark) {
  .dark-mode .my-component,
  :root:not(.light-mode) .my-component {
    /* Специфичные стили для темного режима */
    box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
  }
}
</style>
```

## Тестирование

### В браузере

1. **Тест системных настроек:**
   - macOS: System Preferences → General → Appearance → Dark
   - Windows: Settings → Personalization → Colors → Choose your mode → Dark

2. **Тест программного управления:**
   ```javascript
   // В консоли браузера
   document.documentElement.classList.toggle('dark-mode')
   ```

### В DevTools

Chrome/Edge DevTools:
1. Откройте DevTools (F12)
2. Нажмите `Ctrl+Shift+P` (Windows/Linux) или `Cmd+Shift+P` (macOS)
3. Введите "Render"
4. Найдите "Emulate CSS media feature prefers-color-scheme"
5. Выберите "dark"

## Рекомендации

1. **Всегда используйте CSS переменные** для цветов вместо жестко заданных значений
2. **Тестируйте в обоих режимах** при добавлении новых компонентов
3. **Учитывайте контраст** - темный режим должен быть комфортен для глаз
4. **Используйте fallback значения** в var() для обратной совместимости:
   ```css
   color: var(--text-primary-dark, #e0e0e0);
   ```

## Известные ограничения

- Изображения могут потребовать специальной обработки для темного режима
- Некоторые inline стили могут не поддерживать темный режим автоматически
- Сторонние компоненты могут требовать дополнительной настройки

## Будущие улучшения

- [ ] Автоматическое переключение темы с анимацией
- [ ] Сохранение предпочтений пользователя в localStorage
- [ ] Поддержка пользовательских цветовых схем
- [ ] Оптимизация изображений для темного режима
