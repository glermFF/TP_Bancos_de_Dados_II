import express from 'express';
import path from 'path';
import cors from 'cors';
import routes from './routes';
import { env } from './config/env';
import { securityHeaders } from './middlewares/securityHeaders';
import { rateLimit } from './middlewares/rateLimit';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true); // behind the Cloudflare tunnel
app.use(securityHeaders);
app.use(cors(env.allowedOrigins.length ? { origin: env.allowedOrigins } : {}));
app.use(express.json({ limit: '100kb' }));
app.use('/auth', rateLimit(20, 60_000));

app.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'API do Cachaceiro Viajante no ar.',
  });
});

app.use(routes);

// Production: serve the exported web app, with SPA fallback for client routes.
if (env.webDist) {
  app.use(express.static(env.webDist, { maxAge: '1h', index: 'index.html' }));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(env.webDist, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
