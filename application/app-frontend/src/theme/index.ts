export { colors } from './colors';
export type { ColorName } from './colors';
export { fonts, letterSpacing } from './typography';

// Shell layout constants (mirror .shell in base.css)
export const layout = {
  maxWidth: 1440,
  padX: 56,
  padXTablet: 28,
  padXPhone: 18,
} as const;

export const radius = { sm: 4, md: 6, lg: 8, pill: 999 } as const;
