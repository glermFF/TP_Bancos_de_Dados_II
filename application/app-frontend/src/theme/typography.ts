import { Platform } from 'react-native';

const serifFallback = Platform.select({ web: 'Georgia, "Times New Roman", serif', default: 'serif' });
const monoFallback = Platform.select({ web: 'ui-monospace, Menlo, monospace', default: 'monospace' });

export const fonts = {
  display: Platform.select({ web: `"Fraunces", ${serifFallback}`, default: 'serif' }) as string,
  serif: Platform.select({ web: `"Newsreader", ${serifFallback}`, default: 'serif' }) as string,
  mono: Platform.select({ web: `"JetBrains Mono", ${monoFallback}`, default: 'monospace' }) as string,
};

export const letterSpacing = { label: 2.2 } as const;
