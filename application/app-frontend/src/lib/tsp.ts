import type { GraphNode } from '../data/types';
import { KM_PER_UNIT } from '../data/nodes';

/**
 * Open-path Travelling Salesman heuristics with a fixed start node.
 * Ported from the rotas template; pure functions so they unit-test cleanly
 * and can later be swapped for Neo4j GDS calls on the backend.
 */

export function distance(a: GraphNode, b: GraphNode): number {
  return Math.hypot(a.x - b.x, a.y - b.y) * KM_PER_UNIT;
}

export function pathLength(order: GraphNode[]): number {
  let sum = 0;
  for (let i = 0; i < order.length - 1; i++) sum += distance(order[i], order[i + 1]);
  return sum;
}

/** Greedy nearest-neighbour from `start` over `nodes`. */
export function nearestNeighbor(nodes: GraphNode[], start: GraphNode): GraphNode[] {
  const pool = nodes.filter((n) => n.id !== start.id);
  const order: GraphNode[] = [start];
  let cur = start;
  while (pool.length) {
    let bestIdx = 0;
    let best = Infinity;
    for (let i = 0; i < pool.length; i++) {
      const d = distance(cur, pool[i]);
      if (d < best) { best = d; bestIdx = i; }
    }
    cur = pool.splice(bestIdx, 1)[0];
    order.push(cur);
  }
  return order;
}

/** 2-opt refinement: keeps reversing segments while it shortens the path. */
export function twoOpt(order: GraphNode[]): GraphNode[] {
  let best = order.slice();
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best
          .slice(0, i)
          .concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        if (pathLength(candidate) < pathLength(best) - 1e-4) {
          best = candidate;
          improved = true;
        }
      }
    }
  }
  return best;
}

export type Algo = 'nn' | '2opt';

export interface SolveResult {
  order: GraphNode[];
  total: number; // km
  saved: number; // km vs naive selection order
}

export function solveRoute(nodes: GraphNode[], start: GraphNode, algo: Algo): SolveResult {
  let order = nearestNeighbor(nodes, start);
  const naive = pathLength([start, ...nodes.filter((n) => n.id !== start.id)]);
  if (algo === '2opt') order = twoOpt(order);
  const total = pathLength(order);
  return { order, total, saved: Math.max(0, Math.round(naive - total)) };
}
