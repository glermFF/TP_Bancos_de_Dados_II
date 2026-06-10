import { ROAD_SPEED, STOP_MIN } from '../data/nodes';

/** Drive time for `km` plus a fixed stop cost per parada (mirrors template). */
export function formatDriveTime(km: number, stops: number): string {
  const mins = Math.round((km / ROAD_SPEED) * 60) + STOP_MIN * Math.max(0, stops - 1);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h ? `${h}h ` : '') + `${m}min`;
}

export function km(n: number): string {
  return `${Math.round(n)} km`;
}

/** "★★★★☆" for a 0..5 (half-star rounds down to filled). */
export function stars(n: number): string {
  const full = Math.round(n);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}
