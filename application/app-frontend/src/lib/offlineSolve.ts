import type { Distillery, RouteAlgorithm, RouteSolution } from '../data/types';
import { solveRoute } from './tsp';
import { roadKm } from './geo';
import { AVG_SPEED_KMH, TASTING_STOP_MIN } from './format';

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Same heuristics the API runs on the Neo4j graph, for offline mode. */
export function solveOffline(
  stops: Distillery[],
  startId: string,
  algorithm: RouteAlgorithm,
): RouteSolution {
  const start = stops.find((s) => s.id === startId) ?? stops[0];
  const { order, totalKm, savedKm } = solveRoute(stops, start, algorithm);
  return {
    algorithm,
    stops: order,
    legs: order.slice(1).map((stop, i) => ({
      fromId: order[i].id,
      toId: stop.id,
      km: round1(roadKm(order[i], stop)),
    })),
    totalKm: round1(totalKm),
    savedKm: round1(savedKm),
    estimatedMinutes: Math.round((totalKm / AVG_SPEED_KMH) * 60 + TASTING_STOP_MIN * (order.length - 1)),
  };
}
