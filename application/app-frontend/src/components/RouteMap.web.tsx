import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { colors } from '../theme';
import type { MapStop, RouteMapProps } from './RouteMap.types';

// Sepia grading that blends the tiles into the paper theme: webChrome .cv-map
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const MINAS_CENTER: [number, number] = [-19.2, -44.3];

function pinHtml(stop: MapStop): string {
  const label = stop.order != null ? String(stop.order) : stop.selected ? '●' : '+';
  const tip = `${stop.name} · ${stop.city}`;
  return `${label}<span class="cv-tip">${tip}</span>`;
}

function pinClass(stop: MapStop, hasSolution: boolean): string {
  const parts = ['cv-pin'];
  if (stop.isStart && stop.order != null) parts.push('cv-pin--start');
  else if (stop.order != null) parts.push('cv-pin--ordered');
  else if (stop.selected) parts.push('cv-pin--selected');
  if (hasSolution && !stop.selected) parts.push('cv-pin--muted');
  return parts.join(' ');
}

/** Real Leaflet map of Minas Gerais, skinned as an aged road-almanac plate. */
export default function RouteMap({
  stops,
  routeLatLngs,
  straightPath,
  onTogglePin,
  onMapClick,
  draftPin,
}: RouteMapProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeRef = useRef<L.LayerGroup | null>(null);
  const draftRef = useRef<L.LayerGroup | null>(null);
  const didInitialFit = useRef(false);
  const toggleRef = useRef(onTogglePin);
  toggleRef.current = onTogglePin;
  const clickRef = useRef(onMapClick);
  clickRef.current = onMapClick;

  useEffect(() => {
    if (!hostRef.current || mapRef.current) return;
    const map = L.map(hostRef.current, {
      center: MINAS_CENTER,
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    markersRef.current = L.layerGroup().addTo(map);
    routeRef.current = L.layerGroup().addTo(map);
    draftRef.current = L.layerGroup().addTo(map);
    map.on('click', (event: L.LeafletMouseEvent) => {
      clickRef.current?.(event.latlng.lat, event.latlng.lng);
    });
    mapRef.current = map;

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(hostRef.current);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const hasSolution = routeLatLngs != null || straightPath != null;

  // Markers
  useEffect(() => {
    const layer = markersRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    for (const stop of stops) {
      const icon = L.divIcon({
        className: pinClass(stop, hasSolution),
        html: pinHtml(stop),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const marker = L.marker([stop.latitude, stop.longitude], {
        icon,
        keyboard: false,
        title: '',
      });
      marker.on('click', () => toggleRef.current?.(stop.id));
      layer.addLayer(marker);
    }
    if (!didInitialFit.current && stops.length) {
      didInitialFit.current = true;
      map.fitBounds(L.latLngBounds(stops.map((s) => [s.latitude, s.longitude])), {
        padding: [42, 42],
      });
    }
  }, [stops, hasSolution]);

  // Route polyline (road geometry when available, dashed straight legs otherwise)
  useEffect(() => {
    const layer = routeRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const path = routeLatLngs ?? straightPath;
    if (!path || path.length < 2) return;
    const isRoad = routeLatLngs != null;
    L.polyline(path, {
      color: colors.red,
      weight: 9,
      opacity: 0.16,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(layer);
    L.polyline(path, {
      color: colors.red,
      weight: 3,
      opacity: 0.95,
      lineJoin: 'round',
      lineCap: 'round',
      ...(isRoad ? {} : { dashArray: '7 9' }),
    }).addTo(layer);
    map.fitBounds(L.latLngBounds(path), { padding: [46, 46] });
  }, [routeLatLngs, straightPath]);

  // Draft pin for a place being suggested
  useEffect(() => {
    const layer = draftRef.current;
    if (!layer) return;
    layer.clearLayers();
    if (!draftPin) return;
    const icon = L.divIcon({
      className: 'cv-pin cv-pin--draft',
      html: `✛<span class="cv-tip">novo alambique aqui</span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });
    L.marker([draftPin.latitude, draftPin.longitude], { icon, keyboard: false }).addTo(layer);
  }, [draftPin]);

  return <div ref={hostRef} className="cv-map" />;
}
