import neo4j, { type Driver, type Session } from 'neo4j-driver';
import { env } from './env';

export const driver: Driver = neo4j.driver(
  env.neo4jUri,
  neo4j.auth.basic(env.neo4jUser, env.neo4jPassword),
  { disableLosslessIntegers: true },
);

export function getSession(): Session {
  return driver.session();
}

export async function run<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {},
): Promise<T[]> {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => r.toObject() as T);
  } finally {
    await session.close();
  }
}

export async function verifyConnection(retries = 10, delayMs = 3000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await run('RETURN 1');
      console.log('Neo4j connection established.');
      return;
    } catch (error) {
      if (attempt === retries) {
        console.error('Fatal: could not connect to Neo4j.', error);
        process.exit(1);
      }
      console.log(`Neo4j not ready (attempt ${attempt}/${retries}), retrying in ${delayMs / 1000}s...`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

export async function closeDriver(): Promise<void> {
  await driver.close();
}
