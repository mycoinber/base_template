/**
 * Parimatch Theme - Design Tokens Index
 * Экспорт всех токенов темы
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing, border, shadow, breakpoints } from './spacing';

// Объединенный экспорт для удобства
import { colors } from './colors';
import { typography } from './typography';
import { spacing, border, shadow, breakpoints } from './spacing';

import type { DesignTokens } from '@/core/types/theme';

export const tokens: DesignTokens = {
  colors,
  typography,
  spacing,
  border,
  shadow,
  breakpoints,
};

export default tokens;
