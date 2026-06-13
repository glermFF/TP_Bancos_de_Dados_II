import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (isProduction) {
      console.error(`Fatal: missing required environment variable ${name}`);
      process.exit(1);
    }
    return `dev-only-${name.toLowerCase()}`;
  }
  return value;
}

export const env = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? (isProduction ? '0.0.0.0' : '127.0.0.1'),
  neo4jUri: process.env.NEO4J_URI ?? 'bolt://localhost:7687',
  neo4jUser: process.env.NEO4J_USER ?? 'neo4j',
  neo4jPassword: required('NEO4J_PASSWORD'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  webDist: process.env.WEB_DIST ?? '',
} as const;
