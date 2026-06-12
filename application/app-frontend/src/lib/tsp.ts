import type { LatLng } from '../data/types';
import { roadKm } from './geo';

// Open-path TSP heuristics with a fixed start, over real coordinates.

export interface TspPoint extends LatLng {
  id: string;
}

export function pathLength(order: TspPoint[]): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) total += roadKm(order[i], order[i + 1]);
  return total;
}

/** Greedy nearest-neighbour from `start` over `points`. */
export function nearestNeighbor<T extends TspPoint>(points: T[], start: T): T[] {
  const pool = points.filter((p) => p.id !== start.id);
  const order: T[] = [start];
  let current: T = start;
  while (pool.length) {
    let bestIdx = 0;
    let best = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = roadKm(current, pool[i]);
      if (d < best) {
        best = d;
        bestIdx = i;
      }
    }
    current = pool.splice(bestIdx, 1)[0];
    order.push(current);
  }
  return order;
}

/** 2-opt refinement: keeps reversing segments while it shortens the path. */
export function twoOpt<T extends TspPoint>(order: T[]): T[] {
  let best = order.slice();
  let bestLen = pathLength(best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best
          .slice(0, i)
          .concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        const len = pathLength(candidate);
        if (len < bestLen - 1e-6) {
          best = candidate;
          bestLen = len;
          improved = true;
        }
      }
    }
  }
  return best;
}

export type Algo = 'nearest' | 'two-opt';

export interface SolveResult<T extends TspPoint> {
  order: T[];
  totalKm: number;
  savedKm: number; // vs visiting in the given selection order
}

export function solveRoute<T extends TspPoint>(points: T[], start: T, algo: Algo): SolveResult<T> {
  let order = nearestNeighbor(points, start);
  if (algo === 'two-opt') order = twoOpt(order);
  const naive = pathLength([start, ...points.filter((p) => p.id !== start.id)]);
  const totalKm = pathLength(order);
  return { order, totalKm, savedKm: Math.max(0, naive - totalKm) };
}
