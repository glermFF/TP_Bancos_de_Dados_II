import { distance, pathLength, nearestNeighbor, twoOpt, solveRoute } from '../tsp';
import type { GraphNode } from '../../data/types';

// 4 corners of a square (in svg units). Optimal open path from the
// top-left visits the perimeter without crossing.
const square: GraphNode[] = [
  { id: 'a', name: 'A', city: '', x: 0, y: 0 },
  { id: 'b', name: 'B', city: '', x: 0, y: 100 },
  { id: 'c', name: 'C', city: '', x: 100, y: 100 },
  { id: 'd', name: 'D', city: '', x: 100, y: 0 },
];
const byId = Object.fromEntries(square.map((n) => [n.id, n]));

describe('tsp', () => {
  it('distance is symmetric and scaled by km/unit', () => {
    expect(distance(byId.a, byId.b)).toBeCloseTo(distance(byId.b, byId.a));
    expect(distance(byId.a, byId.b)).toBeGreaterThan(0);
  });

  it('nearestNeighbor keeps the fixed start and visits every node once', () => {
    const order = nearestNeighbor(square, byId.a);
    expect(order[0].id).toBe('a');
    expect(new Set(order.map((n) => n.id)).size).toBe(4);
  });

  it('2-opt never lengthens the nearest-neighbor path', () => {
    const nn = nearestNeighbor(square, byId.a);
    const opt = twoOpt(nn);
    expect(pathLength(opt)).toBeLessThanOrEqual(pathLength(nn) + 1e-6);
  });

  it('solveRoute on the square finds the crossing-free perimeter', () => {
    const { order, total } = solveRoute(square, byId.a, '2opt');
    expect(order[0].id).toBe('a');
    // perimeter of an open path over 3 sides of a 100-unit square
    const sideKm = distance(byId.a, byId.b);
    expect(total).toBeCloseTo(sideKm * 3);
  });

  it('reports non-negative savings vs the naive order', () => {
    const { saved } = solveRoute(square, byId.a, '2opt');
    expect(saved).toBeGreaterThanOrEqual(0);
  });
});
