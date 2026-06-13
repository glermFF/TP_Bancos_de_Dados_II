import { randomUUID } from 'crypto';
import { run } from '../config/neo4j';
import type { PublicUser } from '../types';

interface UserRecord extends PublicUser {
  passwordHash: string;
}

interface RawUser {
  u: { properties: Record<string, unknown> };
}

function mapUser(props: Record<string, unknown>): UserRecord {
  return {
    id: String(props.id),
    name: String(props.name),
    username: String(props.username),
    email: String(props.email),
    reputation: Number(props.reputation ?? 0),
    createdAt: String(props.createdAt ?? ''),
    passwordHash: String(props.passwordHash ?? ''),
  };
}

export function toPublic(user: UserRecord): PublicUser {
  const { passwordHash: _hash, ...publicUser } = user;
  return publicUser;
}

export async function createUser(input: { name: string; username: string; email: string; passwordHash: string }): Promise<UserRecord> {
  const rows = await run<RawUser>(
    `CREATE (u:User {
       id: $id,
       name: $name,
       username: $username,
       email: $email,
       passwordHash: $passwordHash,
       reputation: 0.0,
       createdAt: toString(datetime()),
       updatedAt: toString(datetime())
     })
     RETURN u`,
    { id: randomUUID(), ...input },
  );
  return mapUser(rows[0]!.u.properties);
}

export async function findByEmailOrUsername(identifier: string): Promise<UserRecord | null> {
  const rows = await run<RawUser>(
    `MATCH (u:User)
     WHERE u.email = $identifier OR u.username = $identifier
     RETURN u LIMIT 1`,
    { identifier },
  );
  return rows.length ? mapUser(rows[0]!.u.properties) : null;
}

export async function findById(id: string): Promise<UserRecord | null> {
  const rows = await run<RawUser>('MATCH (u:User {id: $id}) RETURN u LIMIT 1', { id });
  return rows.length ? mapUser(rows[0]!.u.properties) : null;
}
