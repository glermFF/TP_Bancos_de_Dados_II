import type { LatLng } from '../data/types';

export interface RoadGeometry {
  latlngs: [number, number][];
  km: number;
  minutes: number;
}

export async function fetchRoadRoute(points: LatLng[]): Promise<RoadGeometry | null> {
  if (points.length < 2) return null;
  const coords = points.map((p) => `${p.longitude},${p.latitude}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      code?: string;
      routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[];
    };
    const route = data.code === 'Ok' ? data.routes?.[0] : undefined;
    if (!route) return null;
    return {
      latlngs: route.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
      km: route.distance / 1000,
      minutes: route.duration / 60,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
