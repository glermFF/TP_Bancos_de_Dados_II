import * as distilleryModel from '../models/distilleryModel';
import { pathLength, solve, type Matrix } from '../lib/tsp';
import { ApiError } from '../middlewares/errorHandler';
import type { RouteAlgorithm, RouteLeg, RouteSolution } from '../types';

// Minas highways wind through mountains: geodesic km × 1.27 ≈ road km.
const ROAD_FACTOR = 1.27;
const AVG_SPEED_KMH = 65;
const TASTING_STOP_MIN = 45;

export async function solveRoute(input: {
  stopIds?: string[];
  startId?: string;
  algorithm?: string;
}): Promise<RouteSolution> {
  const stopIds = [...new Set(input.stopIds ?? [])];
  const startId = input.startId ?? stopIds[0];
  const algorithm: RouteAlgorithm = input.algorithm === 'nearest' ? 'nearest' : 'two-opt';

  if (stopIds.length < 2) throw new ApiError(400, 'Escolha pelo menos duas paradas');
  if (stopIds.length > 20) throw new ApiError(400, 'No máximo 20 paradas por rota');
  if (!startId || !stopIds.includes(startId)) {
    throw new ApiError(400, 'O ponto de partida precisa estar entre as paradas selecionadas');
  }

  const stops = await distilleryModel.findByIds(stopIds);
  if (stops.length !== stopIds.length) {
    throw new ApiError(404, 'Uma ou mais paradas não foram encontradas no grafo');
  }

  stops.sort((a, b) => stopIds.indexOf(a.id) - stopIds.indexOf(b.id));

  const pairs = await distilleryModel.pairwiseDistances(stopIds);
  const index = new Map(stops.map((s, i) => [s.id, i]));
  const n = stops.length;
  const matrix: Matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (const { aId, bId, meters } of pairs) {
    const i = index.get(aId)!;
    const j = index.get(bId)!;
    const km = (meters / 1000) * ROAD_FACTOR;
    matrix[i]![j] = km;
    matrix[j]![i] = km;
  }

  const startIndex = index.get(startId)!;
  const order = solve(matrix, startIndex, algorithm);
  const totalKm = pathLength(order, matrix);

  // savedKm baseline: visiting in the order the stops were selected
  const naiveOrder = [startIndex, ...stops.map((_, i) => i).filter((i) => i !== startIndex)];
  const naiveKm = pathLength(naiveOrder, matrix);

  const orderedStops = order.map((i) => stops[i]!);
  const legs: RouteLeg[] = [];
  for (let i = 0; i < order.length - 1; i++) {
    legs.push({
      fromId: orderedStops[i]!.id,
      toId: orderedStops[i + 1]!.id,
      km: round1(matrix[order[i]!]![order[i + 1]!]!),
    });
  }

  return {
    algorithm,
    stops: orderedStops,
    legs,
    totalKm: round1(totalKm),
    savedKm: round1(Math.max(0, naiveKm - totalKm)),
    estimatedMinutes: Math.round((totalKm / AVG_SPEED_KMH) * 60 + TASTING_STOP_MIN * (n - 1)),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
