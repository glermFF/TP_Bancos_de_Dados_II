/**
 * Open-path Travelling Salesman heuristics over a symmetric distance matrix.
 * The route starts at a fixed index and visits every node exactly once
 * (it does not return to the start — road-trip style).
 */

export type Matrix = number[][];

export function pathLength(order: number[], matrix: Matrix): number {
  let total = 0;
  for (let i = 0; i < order.length - 1; i++) {
    total += matrix[order[i]!]![order[i + 1]!]!;
  }
  return total;
}

/** Greedy nearest-neighbour starting from `start`. */
export function nearestNeighbor(matrix: Matrix, start: number): number[] {
  const n = matrix.length;
  const visited = new Set<number>([start]);
  const order = [start];
  let current = start;
  while (order.length < n) {
    let best = -1;
    let bestDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (visited.has(j)) continue;
      const d = matrix[current]![j]!;
      if (d < bestDist) {
        bestDist = d;
        best = j;
      }
    }
    visited.add(best);
    order.push(best);
    current = best;
  }
  return order;
}

/** 2-opt refinement: reverse segments while doing so shortens the path. */
export function twoOpt(order: number[], matrix: Matrix): number[] {
  let best = order.slice();
  let bestLen = pathLength(best, matrix);
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < best.length - 1; i++) {
      for (let k = i + 1; k < best.length; k++) {
        const candidate = best
          .slice(0, i)
          .concat(best.slice(i, k + 1).reverse(), best.slice(k + 1));
        const len = pathLength(candidate, matrix);
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

export function solve(matrix: Matrix, start: number, algorithm: 'nearest' | 'two-opt'): number[] {
  const greedy = nearestNeighbor(matrix, start);
  return algorithm === 'two-opt' ? twoOpt(greedy, matrix) : greedy;
}
