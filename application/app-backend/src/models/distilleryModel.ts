import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';
import { run } from '../config/neo4j';
import type { Distillery } from '../types';

interface RawDistillery {
  d: { properties: Record<string, unknown> };
  city?: string;
  region?: string;
}

interface RawPoint {
  x: number;
  y: number;
}

function mapDistillery(props: Record<string, unknown>, city?: string, region?: string): Distillery {
  const location = props.location as RawPoint | undefined;
  return {
    id: String(props.id),
    name: String(props.name),
    city: city ?? String(props.city ?? ''),
    region: region ?? String(props.region ?? ''),
    category: String(props.category ?? 'White'),
    status: (props.status as Distillery['status']) ?? 'IN_VALIDATION',
    rating: Number(props.rating ?? 0),
    reviewCount: Number(props.reviewCount ?? 0),
    founded: props.founded != null ? Number(props.founded) : null,
    signature: props.signature != null ? String(props.signature) : null,
    tags: Array.isArray(props.tags) ? (props.tags as string[]) : [],
    latitude: location ? location.y : Number(props.latitude ?? 0),
    longitude: location ? location.x : Number(props.longitude ?? 0),
  };
}

export async function listDistilleries(skip: number, limit: number): Promise<Distillery[]> {
  const rows = await run<RawDistillery>(
    `MATCH (d:Distillery)
     WHERE d.status <> 'BLOCKED'
     OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
     RETURN d, c.name AS city, c.region AS region
     ORDER BY d.rating DESC, d.reviewCount DESC
     SKIP $skip LIMIT $limit`,
    { skip: neo4j.int(skip), limit: neo4j.int(limit) },
  );
  return rows.map((r) => mapDistillery(r.d.properties, r.city, r.region));
}

export async function countDistilleries(): Promise<number> {
  const rows = await run<{ total: number }>(
    `MATCH (d:Distillery) WHERE d.status <> 'BLOCKED' RETURN count(d) AS total`,
  );
  return rows[0]?.total ?? 0;
}

export async function findByIds(ids: string[]): Promise<Distillery[]> {
  const rows = await run<RawDistillery>(
    `MATCH (d:Distillery)
     WHERE d.id IN $ids AND d.status <> 'BLOCKED'
     OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
     RETURN d, c.name AS city, c.region AS region`,
    { ids },
  );
  return rows.map((r) => mapDistillery(r.d.properties, r.city, r.region));
}

export async function findById(id: string): Promise<Distillery | null> {
  const all = await findByIds([id]);
  return all[0] ?? null;
}

export async function pairwiseDistances(ids: string[]): Promise<{ aId: string; bId: string; meters: number }[]> {
  return run(
    `MATCH (a:Distillery), (b:Distillery)
     WHERE a.id IN $ids AND b.id IN $ids AND a.id < b.id
     RETURN a.id AS aId, b.id AS bId, point.distance(a.location, b.location) AS meters`,
    { ids },
  );
}

export async function suggestDistillery(input: { name: string; category: string; latitude: number; longitude: number; city: string; userId: string }): Promise<Distillery> {
  const rows = await run<RawDistillery>(
    `MATCH (u:User {id: $userId})
     MERGE (c:City {name: $city})
       ON CREATE SET c.region = 'Uncharted', c.location = point({latitude: $latitude, longitude: $longitude})
     CREATE (d:Distillery {
       id: $id,
       name: $name,
       category: $category,
       status: 'IN_VALIDATION',
       rating: 0.0,
       reviewCount: 0,
       tags: [],
       location: point({latitude: $latitude, longitude: $longitude}),
       createdAt: toString(datetime()),
       updatedAt: toString(datetime())
     })
     CREATE (u)-[:SUGGESTED {at: datetime()}]->(d)
     CREATE (d)-[:LOCATED_IN]->(c)
     RETURN d, c.name AS city, c.region AS region`,
    { id: randomUUID(), ...input },
  );
  return mapDistillery(rows[0]!.d.properties, rows[0]!.city, rows[0]!.region);
}

export interface GraphStats {
  distilleries: number;
  cities: number;
  reviews: number;
  regions: number;
}

export async function getStats(): Promise<GraphStats> {
  const rows = await run<GraphStats>(
    `MATCH (d:Distillery) WITH count(d) AS distilleries
     MATCH (c:City) WITH distilleries, count(c) AS cities, count(DISTINCT c.region) AS regions
     OPTIONAL MATCH (r:Review)
     RETURN distilleries, cities, regions, count(r) AS reviews`,
  );
  return rows[0] ?? { distilleries: 0, cities: 0, reviews: 0, regions: 0 };
}
