import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';

// CSP allowlist covers everything the web build loads: Google Fonts,
// Leaflet CSS (unpkg), CARTO tiles, OSRM routing and the inline styles
// react-native-web generates.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.basemaps.cartocdn.com",
  "connect-src 'self' https://router.project-osrm.org",
  "frame-ancestors 'none'",
].join('; ');

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  if (env.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    if (process.env.CSP_DISABLED !== 'true') res.setHeader('Content-Security-Policy', CSP);
  }
  next();
}
