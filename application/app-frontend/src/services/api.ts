import axios from 'axios';
import type {
  Distillery,
  GraphStats,
  Paginated,
  Review,
  RouteAlgorithm,
  RouteSolution,
  User,
} from '../data/types';

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const api = axios.create({ baseURL, timeout: 8000 });

let authToken: string | null = null;

/** Set (or clear) the JWT attached to subsequent requests. */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

/** Normalized API error message (server-provided when available). */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { error?: string } | undefined)?.error;
    if (serverMessage) return serverMessage;
    if (error.code === 'ECONNABORTED') return 'A API demorou demais para responder.';
    if (!error.response) return 'Não foi possível falar com a API. O backend está rodando?';
  }
  return 'Algo deu errado. Tente de novo.';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function register(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { identifier, password });
  return data;
}

export async function fetchProfile(): Promise<User> {
  const { data } = await api.get<User>('/auth/me');
  return data;
}

export async function fetchDistilleries(page = 1, pageSize = 100): Promise<Paginated<Distillery>> {
  const { data } = await api.get<Paginated<Distillery>>('/distilleries', { params: { page, pageSize } });
  return data;
}

export async function fetchAllDistilleries(): Promise<Distillery[]> {
  return (await fetchDistilleries()).items;
}

export async function fetchLatestReviews(limit = 12): Promise<Review[]> {
  const { data } = await api.get<Review[]>('/reviews', { params: { limit } });
  return data;
}

export async function createReview(input: {
  distilleryId: string;
  title: string;
  body: string;
  rating: number;
}): Promise<Review> {
  const { data } = await api.post<Review>('/reviews', input);
  return data;
}

/** Suggest a new distillery (auth required) — enters the graph as IN_VALIDATION. */
export async function suggestDistillery(input: {
  name: string;
  category: string;
  city: string;
  latitude: number;
  longitude: number;
}): Promise<Distillery> {
  const { data } = await api.post<Distillery>('/distilleries', input);
  return data;
}

export async function solveRoute(
  stopIds: string[],
  startId: string,
  algorithm: RouteAlgorithm,
): Promise<RouteSolution> {
  const { data } = await api.post<RouteSolution>('/routes/solve', { stopIds, startId, algorithm });
  return data;
}

export async function fetchStats(): Promise<GraphStats> {
  const { data } = await api.get<GraphStats>('/stats');
  return data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const { data } = await api.get<{ status: string }>('/health', { timeout: 3000 });
    return data?.status === 'online';
  } catch {
    return false;
  }
}
