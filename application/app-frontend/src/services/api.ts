import axios from 'axios';
import type { Alambique } from '../data/types';

/**
 * Axios client pointing at the Express backend, which talks to Neo4j.
 * Base URL comes from EXPO_PUBLIC_API_URL (set per-platform); falls back to
 * localhost for web dev. Screens use the typed helpers below and degrade to
 * mock data when the API is unreachable, so the UI works offline too.
 */
const baseURL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({ baseURL, timeout: 8000 });

export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await api.get('/health');
    return data?.status === 'online';
  } catch {
    return false;
  }
}

// Backend node (:Adega/:Alambique) shape — loose, server still evolving.
interface AdegaDTO {
  id?: string;
  name?: string;
  nome?: string;
  type?: string;
  category?: string;
  nota?: number;
  rate?: number;
  city?: string;
  cidade?: string;
  region?: string;
  regiao?: string;
  reviews?: number;
}

function toAlambique(dto: AdegaDTO, i: number): Alambique {
  return {
    id: dto.id ?? `srv-${i}`,
    idx: String(i + 1).padStart(2, '0'),
    name: dto.nome ?? dto.name ?? 'Alambique sem nome',
    label: ':Alambique',
    props: [],
    city: dto.cidade ?? dto.city ?? '—',
    region: dto.regiao ?? dto.region ?? '—',
    category: dto.category ?? dto.type ?? '—',
    rate: dto.rate ?? dto.nota ?? 0,
    reviews: dto.reviews ?? 0,
  };
}

/** GET /adegas — list alambique nodes from the graph. */
export async function fetchAlambiques(): Promise<Alambique[]> {
  const { data } = await api.get<AdegaDTO[]>('/adegas');
  return Array.isArray(data) ? data.map(toAlambique) : [];
}

/** POST /adegas/new — create a node. */
export async function createAlambique(props: Partial<AdegaDTO>): Promise<void> {
  await api.post('/adegas/new', props);
}
