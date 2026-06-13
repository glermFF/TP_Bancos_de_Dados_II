import { cycleLength, nearestNeighbor, solveRoute, twoOpt, type TspPoint } from '../tsp';
import { haversineKm } from '../geo';

// Real towns from the dataset (coordinates are town-level accurate).
const P = {
  salinas: { id: 'salinas', latitude: -16.1703, longitude: -42.2914 },
  diamantina: { id: 'diamantina', latitude: -18.2419, longitude: -43.6027 },
  novaUniao: { id: 'novaUniao', latitude: -19.6864, longitude: -43.5807 },
  betim: { id: 'betim', latitude: -19.9668, longitude: -44.1983 },
  tiradentes: { id: 'tiradentes', latitude: -21.1106, longitude: -44.1771 },
  perdoes: { id: 'perdoes', latitude: -21.0911, longitude: -45.0911 },
} satisfies Record<string, TspPoint>;

const ALL = Object.values(P);

describe('haversineKm', () => {
  it('matches the known Salinas → Diamantina distance (~265 km geodesic)', () => {
    const d = haversineKm(P.salinas, P.diamantina);
    expect(d).toBeGreaterThan(240);
    expect(d).toBeLessThan(290);
  });

  it('is symmetric and zero on identity', () => {
    expect(haversineKm(P.betim, P.perdoes)).toBeCloseTo(haversineKm(P.perdoes, P.betim), 10);
    expect(haversineKm(P.betim, P.betim)).toBe(0);
  });
});

describe('nearestNeighbor', () => {
  it('starts at the start node and visits every node once', () => {
    const order = nearestNeighbor(ALL, P.salinas);
    expect(order[0].id).toBe('salinas');
    expect(order).toHaveLength(ALL.length);
    expect(new Set(order.map((n) => n.id)).size).toBe(ALL.length);
  });

  it('picks the geographically nearest first hop (Salinas → Diamantina)', () => {
    const order = nearestNeighbor(ALL, P.salinas);
    expect(order[1].id).toBe('diamantina');
  });
});

describe('twoOpt', () => {
  it('never makes the round-trip longer', () => {
    const greedy = nearestNeighbor(ALL, P.betim);
    expect(cycleLength(twoOpt(greedy))).toBeLessThanOrEqual(cycleLength(greedy) + 1e-9);
  });

  it('returns to the start node (closed loop fixed at index 0)', () => {
    const order = twoOpt(nearestNeighbor(ALL, P.betim));
    expect(order[0].id).toBe('betim');
  });
});

describe('solveRoute', () => {
  it('keeps the fixed start and reports non-negative savings', () => {
    const { order, totalKm, savedKm } = solveRoute(ALL, P.novaUniao, 'two-opt');
    expect(order[0].id).toBe('novaUniao');
    expect(totalKm).toBeGreaterThan(0);
    expect(savedKm).toBeGreaterThanOrEqual(0);
  });

  it('two-opt is at least as short as nearest-neighbour', () => {
    const nn = solveRoute(ALL, P.salinas, 'nearest');
    const opt = solveRoute(ALL, P.salinas, 'two-opt');
    expect(opt.totalKm).toBeLessThanOrEqual(nn.totalKm + 1e-9);
  });
});
