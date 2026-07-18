import * as distilleryModel from '../models/distilleryModel';
import { env } from '../config/env';
import { ApiError } from '../middlewares/errorHandler';
import type { CommunityResult } from '../types';

// ponytail: kNN fixo em 3 vizinhos; vire parâmetro se o grafo passar de algumas centenas de nós
const K_NEIGHBORS = 3;
const CACHE_MS = 5 * 60_000;

let cache: { at: number; data: CommunityResult } | null = null;

export async function detectCommunities(): Promise<CommunityResult> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  const distilleries = await distilleryModel.listDistilleries(0, 500);
  if (distilleries.length < 3) {
    throw new ApiError(422, 'Poucos alambiques no grafo para detectar circuitos');
  }
  const pairs = await distilleryModel.pairwiseDistances(distilleries.map((d) => d.id));
  const neighbors = new Map<string, { other: string; meters: number }[]>();
  for (const { aId, bId, meters } of pairs) {
    if (!neighbors.has(aId)) neighbors.set(aId, []);
    if (!neighbors.has(bId)) neighbors.set(bId, []);
    neighbors.get(aId)!.push({ other: bId, meters });
    neighbors.get(bId)!.push({ other: aId, meters });
  }
  const edgeSet = new Set<string>();
  for (const [id, list] of neighbors) {
    list.sort((a, b) => a.meters - b.meters);
    for (const { other } of list.slice(0, K_NEIGHBORS)) {
      edgeSet.add(id < other ? `${id}|${other}` : `${other}|${id}`);
    }
  }
  const edges = [...edgeSet].map((e) => e.split('|'));

  const response = await fetch(`${env.communityUrl}/communities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ edges }),
  }).catch(() => null);
  if (!response?.ok) {
    throw new ApiError(503, 'Serviço de detecção de comunidades indisponível');
  }
  const body = (await response.json()) as { communities: Record<string, number> };

  const groups = new Map<number, string[]>();
  for (const [id, comm] of Object.entries(body.communities)) {
    if (!groups.has(comm)) groups.set(comm, []);
    groups.get(comm)!.push(id);
  }
  const data: CommunityResult = {
    algorithm: 'HP-MOCD',
    communities: body.communities,
    groups: [...groups.entries()]
      .map(([id, distilleryIds]) => ({ id, distilleryIds }))
      .sort((a, b) => b.distilleryIds.length - a.distilleryIds.length),
  };
  cache = { at: Date.now(), data };
  return data;
}
