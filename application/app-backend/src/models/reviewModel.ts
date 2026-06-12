import { randomUUID } from 'crypto';
import neo4j from 'neo4j-driver';
import { run } from '../config/neo4j';
import type { Review } from '../types';

interface RawReview {
  r: { properties: Record<string, unknown> };
  authorId: string;
  authorName: string;
  authorUsername: string;
  distilleryId: string;
  distilleryName: string;
  distilleryCity: string;
}

function mapReview(row: RawReview): Review {
  const props = row.r.properties;
  return {
    id: String(props.id),
    title: String(props.title),
    body: String(props.body),
    rating: Number(props.rating ?? 0),
    createdAt: String(props.createdAt ?? ''),
    author: { id: row.authorId, name: row.authorName, username: row.authorUsername },
    distillery: { id: row.distilleryId, name: row.distilleryName, city: row.distilleryCity },
  };
}

const RETURN_SHAPE = `
  RETURN r,
         u.id AS authorId, u.name AS authorName, u.username AS authorUsername,
         d.id AS distilleryId, d.name AS distilleryName,
         coalesce(c.name, '') AS distilleryCity
`;

export async function listLatest(limit = 12): Promise<Review[]> {
  const rows = await run<RawReview>(
    `MATCH (u:User)-[:WROTE]->(r:Review)-[:ABOUT]->(d:Distillery)
     OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
     ${RETURN_SHAPE}
     ORDER BY r.createdAt DESC
     LIMIT $limit`,
    { limit: neo4j.int(Math.floor(limit)) },
  );
  return rows.map(mapReview);
}

export async function listByDistillery(distilleryId: string): Promise<Review[]> {
  const rows = await run<RawReview>(
    `MATCH (u:User)-[:WROTE]->(r:Review)-[:ABOUT]->(d:Distillery {id: $distilleryId})
     OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
     ${RETURN_SHAPE}
     ORDER BY r.createdAt DESC`,
    { distilleryId },
  );
  return rows.map(mapReview);
}

/**
 * Creates the review and refreshes the distillery's denormalized
 * rating/reviewCount in the same transaction.
 */
export async function createReview(input: {
  userId: string;
  distilleryId: string;
  title: string;
  body: string;
  rating: number;
}): Promise<Review> {
  const rows = await run<RawReview>(
    `MATCH (u:User {id: $userId}), (d:Distillery {id: $distilleryId})
     CREATE (u)-[:WROTE]->(r:Review {
       id: $id,
       title: $title,
       body: $body,
       rating: $rating,
       createdAt: toString(datetime())
     })-[:ABOUT]->(d)
     WITH u, r, d
     CALL {
       WITH d
       MATCH (:User)-[:WROTE]->(other:Review)-[:ABOUT]->(d)
       RETURN avg(other.rating) AS newRating, count(other) AS newCount
     }
     SET d.rating = round(newRating * 10) / 10.0,
         d.reviewCount = newCount,
         d.updatedAt = toString(datetime())
     WITH u, r, d
     OPTIONAL MATCH (d)-[:LOCATED_IN]->(c:City)
     ${RETURN_SHAPE}`,
    { id: randomUUID(), ...input },
  );
  return mapReview(rows[0]!);
}
