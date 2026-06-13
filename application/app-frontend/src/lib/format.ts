export const AVG_SPEED_KMH = 65;
export const TASTING_STOP_MIN = 45;

export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h ? `${h}h ` : '') + `${m}min`;
}

export function km(n: number): string {
  return `${Math.round(n)} km`;
}

export function stars(n: number): string {
  const full = Math.round(n);
  return '★'.repeat(full) + '☆'.repeat(Math.max(0, 5 - full));
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
}
