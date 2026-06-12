export interface MapStop {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  selected: boolean;
  isStart: boolean;
  /** 1-based visit order once a route is solved; null before that. */
  order: number | null;
}

export interface RouteMapProps {
  stops: MapStop[];
  /** Road-snapped geometry ([lat, lng]) from OSRM, when available. */
  routeLatLngs: [number, number][] | null;
  /** Straight-line fallback path through the ordered stops. */
  straightPath: [number, number][] | null;
  onTogglePin?: (id: string) => void;
  /** When set, clicking the map reports coordinates (used to pin a new place). */
  onMapClick?: (latitude: number, longitude: number) => void;
  /** Draft marker for a place being suggested. */
  draftPin?: { latitude: number; longitude: number } | null;
}
