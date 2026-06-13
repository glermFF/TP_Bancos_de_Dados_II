import type { LatLng } from '../data/types';
import { roadKm } from './geo';

export interface TspPoint extends LatLng { id: string; }

export function pathLength(order: TspPoint[]): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) total += roadKm(order[i], order[i + 1]);
  return total;
}

export function cycleLength(order: TspPoint[]): number {
  if (order.length < 2) return 0;
  return pathLength(order) + roadKm(order[order.length - 1], order[0]);
}

export function nearestNeighbor<T extends TspPoint>(points: T[], start: T): T[] {
  const pool = points.filter((p) => p.id !== start.id);
  const order: T[] = [start];
  let current: T = start;
  while (pool.length) {
    let bestIdx = 0;
    let best = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = roadKm(current, pool[i]);
      if (d < best) { best = d; bestIdx = i; }
    }
    current = pool.splice(bestIdx, 1)[0];
    order.push(current);
  }
  return order;
}

export function twoOpt<T extends TspPoint>(order: T[]): T[] {
  let best = order.slice();
  let bestLen = cycleLength(best);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best.slice(0, i).concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        const len = cycleLength(candidate);
        if (len < bestLen - 1e-6) { best = candidate; bestLen = len; improved = true; }
      }
    }
  }
  return best;
}

export type Algo = 'nearest' | 'two-opt';

export interface SolveResult<T extends TspPoint> { order: T[]; totalKm: number; savedKm: number; }

export function solveRoute<T extends TspPoint>(points: T[], start: T, algo: Algo): SolveResult<T> {
  let order = nearestNeighbor(points, start);
  if (algo === 'two-opt') order = twoOpt(order);
  const naive = cycleLength([start, ...points.filter((p) => p.id !== start.id)]);
  const totalKm = cycleLength(order);
  return { order, totalKm, savedKm: Math.max(0, naive - totalKm) };
}
