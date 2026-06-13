import app from './app';
import { env } from './config/env';
import { closeDriver, verifyConnection } from './config/neo4j';

async function start(): Promise<void> {
  await verifyConnection();
  const server = app.listen(env.port, env.host, () => {
    console.log(`API listening on http://${env.host}:${env.port} (${env.isProduction ? 'production' : 'development'})`);
  });
  const shutdown = (): void => {
    server.close(async () => {
      await closeDriver();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
