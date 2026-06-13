export type DistilleryStatus = 'VERIFIED' | 'IN_VALIDATION' | 'BLOCKED';

export interface Distillery {
  id: string;
  name: string;
  city: string;
  region: string;
  category: string;
  status: DistilleryStatus;
  rating: number;
  reviewCount: number;
  founded: number | null;
  signature: string | null;
  tags: string[];
  latitude: number;
  longitude: number;
}

export interface Review {
  id: string;
  title: string;
  body: string;
  rating: number;
  createdAt: string;
  author: { id: string; name: string; username: string };
  distillery: { id: string; name: string; city: string };
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  reputation: number;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type RouteAlgorithm = 'nearest' | 'two-opt';

export interface RouteLeg { fromId: string; toId: string; km: number; }

export interface RouteSolution {
  algorithm: RouteAlgorithm;
  stops: Distillery[];
  legs: RouteLeg[];
  totalKm: number;
  savedKm: number;
  estimatedMinutes: number;
}

export interface GraphStats { distilleries: number; cities: number; reviews: number; regions: number; }

export interface LatLng { latitude: number; longitude: number; }
