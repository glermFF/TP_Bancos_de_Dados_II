export const AVG_SPEED_KMH = 65; // average Minas highway speed
export const TASTING_STOP_MIN = 45; // tasting + chat per stop

/** Drive time for `km` plus a fixed tasting stop per intermediate visit. */
export function formatDriveTime(km: number, stops: number): string {
  const mins = Math.round((km / AVG_SPEED_KMH) * 60) + TASTING_STOP_MIN * Math.max(0, stops - 1);
  return formatMinutes(mins);
}

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h ? `${h}h ` : '') + `${m}min`;
}

export function km(n: number): string {
  return `${Math.round(n)} km`;
}

/** "★★★★☆" for a 0..5 rating. */
export function stars(n: number): string {
  const full = Math.round(n);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

/** "2026-06-12T..." → "12 de jun. de 2026". */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
}
