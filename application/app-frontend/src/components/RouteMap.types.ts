export interface MapStop {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  selected: boolean;
  isStart: boolean;
  order: number | null;
}

export interface RouteMapProps {
  stops: MapStop[];
  routeLatLngs: [number, number][] | null;
  straightPath: [number, number][] | null;
  onTogglePin?: (id: string) => void;
  onMapClick?: (latitude: number, longitude: number) => void;
  draftPin?: { latitude: number; longitude: number } | null;
}
