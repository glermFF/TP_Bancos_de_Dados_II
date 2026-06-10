/**
 * Web-only page chrome: loads the editorial Google Fonts and paints the
 * paper-grain overlay + cream background that the static templates had in
 * assets/base.css. No-op on native (Platform guard).
 */
import { Platform } from 'react-native';
import { colors } from '../theme';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400;1,6..96,500;1,6..96,700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500;600&display=swap';

// fractalNoise grain, identical recipe to base.css body::before
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.06  0 0 0 0.08 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")";

let installed = false;

export function installWebChrome(): void {
  if (Platform.OS !== 'web' || installed || typeof document === 'undefined') return;
  installed = true;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = FONTS_HREF;
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.textContent = `
    html, body, #root { height: 100%; }
    body {
      margin: 0;
      background: ${colors.cream};
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    body::before {
      content: "";
      position: fixed; inset: 0;
      pointer-events: none;
      z-index: 9999;
      background-image: ${GRAIN};
      opacity: .5;
      mix-blend-mode: multiply;
    }
    ::selection { background: ${colors.red}; color: ${colors.cream}; }
  `;
  document.head.appendChild(style);
}
