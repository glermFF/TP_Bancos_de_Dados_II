// Font stacks. Web loads the real faces via styles/fonts (Google Fonts link);
// native falls back to platform serif/mono until expo-font is wired.
import { Platform } from 'react-native';

const serifFallback = Platform.select({ web: 'Georgia, "Times New Roman", serif', default: 'serif' });
const monoFallback = Platform.select({ web: 'ui-monospace, Menlo, monospace', default: 'monospace' });

export const fonts = {
  // Bodoni Moda — big italic display
  display: Platform.select({ web: `"Bodoni Moda", ${serifFallback}`, default: 'serif' }) as string,
  // Newsreader — body serif
  serif: Platform.select({ web: `"Newsreader", ${serifFallback}`, default: 'serif' }) as string,
  // JetBrains Mono — labels / metadata
  mono: Platform.select({ web: `"JetBrains Mono", ${monoFallback}`, default: 'monospace' }) as string,
};

export const letterSpacing = {
  label: 2.2,   // ~.22em on 11px
  tag: 1.4,
  wide: 3.2,
} as const;
