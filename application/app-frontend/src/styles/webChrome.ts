/**
 * Web-only page chrome: editorial Google Fonts, paper-grain overlay, cream
 * background, and the Leaflet stylesheet + skin that makes the real map look
 * like a plate from an old road almanac. No-op on native (Platform guard).
 */
import { Platform } from 'react-native';
import { colors } from '../theme';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,500;0,6..96,700;1,6..96,400;1,6..96,500;1,6..96,700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500;600&display=swap';

const LEAFLET_CSS_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

// fractalNoise grain, identical recipe to the original print templates
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='5'/><feColorMatrix values='0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0 0.06  0 0 0 0.08 0'/></filter><rect width='240' height='240' filter='url(%23n)'/></svg>\")";

let installed = false;

export function installWebChrome(): void {
  if (Platform.OS !== 'web' || installed || typeof document === 'undefined') return;
  installed = true;

  for (const href of [FONTS_HREF, LEAFLET_CSS_HREF]) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

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

    /* ---- Leaflet skin: aged map plate ---- */
    .cv-map { width: 100%; height: 100%; background: ${colors.paper}; }
    .cv-map .leaflet-tile-pane {
      filter: sepia(.30) saturate(.78) contrast(.93) brightness(1.04);
    }
    .cv-map .leaflet-control-zoom a {
      background: ${colors.paper};
      color: ${colors.ink};
      border: 1px solid ${colors.rule};
      font-family: "JetBrains Mono", monospace;
    }
    .cv-map .leaflet-control-zoom a:hover { background: ${colors.cream}; color: ${colors.red}; }
    .cv-map .leaflet-control-attribution {
      background: rgba(251,246,235,.85);
      color: ${colors.inkSoft};
      font-family: "JetBrains Mono", monospace;
      font-size: 8.5px;
      letter-spacing: .4px;
    }
    .cv-map .leaflet-control-attribution a { color: ${colors.copperDeep}; }

    .cv-pin {
      display: flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 50%;
      background: ${colors.cream};
      border: 1.6px solid ${colors.ink};
      color: ${colors.ink};
      font-family: "JetBrains Mono", monospace;
      font-size: 11px; font-weight: 600;
      box-shadow: 0 1px 4px rgba(42,24,16,.35);
      cursor: pointer;
      transition: transform .12s ease, background .12s ease, color .12s ease;
      box-sizing: border-box;
    }
    .cv-pin:hover { transform: scale(1.18); border-color: ${colors.red}; color: ${colors.red}; }
    .cv-pin--selected { background: ${colors.ink}; color: ${colors.cream}; }
    .cv-pin--selected:hover { color: ${colors.cream}; background: ${colors.red}; border-color: ${colors.redDeep}; }
    .cv-pin--start {
      background: ${colors.red}; border-color: ${colors.redDeep}; color: ${colors.cream};
      font-family: "Bodoni Moda", serif; font-style: italic; font-size: 13px;
    }
    .cv-pin--ordered {
      background: ${colors.ink}; color: ${colors.cream};
      font-family: "Bodoni Moda", serif; font-style: italic; font-size: 13px;
    }
    .cv-pin--muted { opacity: .55; }
    .cv-pin--draft {
      background: ${colors.copper}; border-color: ${colors.copperDeep}; color: ${colors.cream};
      font-size: 14px;
    }

    .cv-tip {
      position: absolute; left: 50%; bottom: 130%;
      transform: translateX(-50%);
      background: ${colors.ink}; color: ${colors.cream};
      font-family: "JetBrains Mono", monospace;
      font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase;
      padding: 4px 8px; border-radius: 3px;
      white-space: nowrap; pointer-events: none;
      opacity: 0; transition: opacity .12s ease;
    }
    .cv-pin:hover .cv-tip { opacity: 1; }
  `;
  document.head.appendChild(style);
}
