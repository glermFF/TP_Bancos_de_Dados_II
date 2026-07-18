import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { MapBoard } from '../../components/MapBoard';
import RouteMap from '../../components/RouteMap';
import type { MapStop } from '../../components/RouteMap.types';
import { colors, fonts } from '../../theme';
import { FALLBACK_DISTILLERIES } from '../../data/fallback';
import type { RouteSolution } from '../../data/types';
import * as apiService from '../../services/api';
import { fetchRoadRoute, type RoadGeometry } from '../../services/osrm';
import { useFetch } from '../../hooks/useFetch';
import { solveOffline } from '../../lib/offlineSolve';
import { TASTING_STOP_MIN, formatMinutes, km } from '../../lib/format';
import { copy } from '../../copy/strings';

const DEFAULT_SELECTION = ['germana', 'valeverde', 'milagre', 'cxc', 'espirito', 'tabaroa'];

const shortName = (name: string) =>
  name
    .replace(/^Cachaça /, '')
    .replace(/^Alambique (do |da |de )?/, '')
    .replace(/^Engenho (de |do |da )?/, '')
    .replace(/ — .*$/, '');

export default function RoutePlannerScreen() {
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;
  const route = useRoute<RouteProp<{ params: { preselect?: string } }, 'params'>>();
  const { data: distilleries, live } = useFetch(apiService.fetchAllDistilleries, FALLBACK_DISTILLERIES);
  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SELECTION));
  const [solution, setSolution] = useState<RouteSolution | null>(null);
  const [solving, setSolving] = useState(false);
  const [roadGeo, setRoadGeo] = useState<RoadGeometry | null>(null);
  const [roadPending, setRoadPending] = useState(false);
  const [circuits, setCircuits] = useState<Record<string, number> | null>(null);
  const [showCircuits, setShowCircuits] = useState(false);
  const [circuitsBusy, setCircuitsBusy] = useState(false);
  const [circuitsError, setCircuitsError] = useState(false);
  const solveSeq = useRef(0);

  async function toggleCircuits() {
    if (showCircuits) return setShowCircuits(false);
    setCircuitsError(false);
    setShowCircuits(true);
    if (circuits || circuitsBusy) return;
    setCircuitsBusy(true);
    try {
      setCircuits((await apiService.fetchCommunities()).communities);
    } catch {
      setCircuitsError(true);
      setShowCircuits(false);
    } finally {
      setCircuitsBusy(false);
    }
  }

  useEffect(() => {
    if (!live) return;
    const nameBySlug = new Map(FALLBACK_DISTILLERIES.map((f) => [f.id, f.name]));
    setSelected((previous) => {
      const next = new Set<string>();
      const germana = distilleries.find((d) => d.name === nameBySlug.get('germana'));
      if (germana && previous.has('germana')) next.add(germana.id);
      for (const slug of previous) {
        const match = distilleries.find((d) => d.name === nameBySlug.get(slug) || d.id === slug);
        if (match) next.add(match.id);
      }
      return next.size >= 2 ? next : new Set(distilleries.slice(0, 5).map((d) => d.id));
    });
  }, [live]);

  useEffect(() => {
    const preselect = route.params?.preselect;
    if (!preselect) return;
    setSelected((previous) => new Set(previous).add(preselect));
    invalidate();
  }, [route.params?.preselect]);

  const selectedStops = useMemo(() => distilleries.filter((d) => selected.has(d.id)), [distilleries, selected]);
  const startId = useMemo(() => [...selected][0] ?? '', [selected]);

  const orderIndex = useMemo(() => {
    const map = new Map<string, number>();
    solution?.stops.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [solution]);

  const mapStops: MapStop[] = useMemo(
    () =>
      distilleries.map((d) => ({
        id: d.id,
        name: d.name,
        city: d.city,
        latitude: d.latitude,
        longitude: d.longitude,
        selected: selected.has(d.id),
        isStart: d.id === startId,
        order: orderIndex.get(d.id) ?? null,
        community: showCircuits && circuits ? circuits[d.id] ?? null : null,
      })),
    [distilleries, selected, startId, orderIndex, showCircuits, circuits],
  );

  const straightPath = useMemo(() => {
    if (!solution || solution.stops.length < 2) return null;
    const pts = solution.stops.map((s) => [s.latitude, s.longitude] as [number, number]);
    pts.push(pts[0]);
    return pts;
  }, [solution]);

  const invalidate = useCallback(() => {
    setSolution(null);
    setRoadGeo(null);
    setRoadPending(false);
  }, []);

  const toggleStop = useCallback(
    (id: string) => {
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      invalidate();
    },
    [invalidate],
  );

  async function handleSolve() {
    if (selected.size < 2 || solving) return;
    const seq = ++solveSeq.current;
    setSolving(true);
    setRoadGeo(null);
    try {
      const stopIds = selectedStops.map((s) => s.id);
      const start = startId || stopIds[0];
      const result = live
        ? await apiService.solveRoute(stopIds, start, 'two-opt').catch(() => solveOffline(selectedStops, start, 'two-opt'))
        : solveOffline(selectedStops, start, 'two-opt');
      if (seq !== solveSeq.current) return;
      setSolution(result);
      setRoadPending(true);
      const geometry = await fetchRoadRoute([...result.stops, result.stops[0]]);
      if (seq !== solveSeq.current) return;
      setRoadGeo(geometry);
      setRoadPending(false);
    } finally {
      if (seq === solveSeq.current) setSolving(false);
    }
  }

  const displayKm = roadGeo ? roadGeo.km : solution?.totalKm ?? 0;
  const displayMinutes = roadGeo
    ? Math.round(roadGeo.minutes + TASTING_STOP_MIN * (solution!.stops.length - 1))
    : solution?.estimatedMinutes ?? 0;

  const footRight = roadPending
    ? copy.routePlanner.footOsrmPending
    : roadGeo
      ? copy.routePlanner.footOsrm
      : solution
        ? copy.routePlanner.footStraight
        : copy.routePlanner.footTiles;

  const algoTag = solution
    ? `${solution.algorithm === 'two-opt' ? copy.routePlanner.twoOpt : copy.routePlanner.nearest} · ${live ? 'NEO4J' : 'LOCAL'}`
    : null;

  return (
    <Screen active="RoutePlanner">
      <PageHead
        crumbs={[{ label: copy.crumbGuia }, { label: 'Monte sua rota', current: true }]}
        title={copy.routePlanner.title}
        lede={copy.routePlanner.lede}
      />
      <View style={styles.metrics}>
        <Metric value={solution ? km(displayKm) : '—'} label={roadGeo ? copy.routePlanner.metricRoadKm : copy.routePlanner.metricTotalKm} />
        <Metric value={solution ? formatMinutes(displayMinutes) : '—'} label={copy.routePlanner.metricTime} />
        <Metric value={solution ? `−${Math.round(solution.savedKm)} km` : '—'} label={copy.routePlanner.metricSaved} saved />
        <Metric value={String(selected.size)} label={copy.routePlanner.metricStops} last />
      </View>
      <View style={styles.mapWrap}>
        <MapBoard
          headLeft={copy.routePlanner.mapHeadLeft(selected.size)}
          headRight={`${solution ? copy.routePlanner.mapTraced : copy.routePlanner.mapPrompt} · N ↑`}
          footLeft={copy.routePlanner.mapFootLeft(live, distilleries.length)}
          footRight={footRight}
          footRightAccent={!!roadGeo}
        >
          <RouteMap stops={mapStops} routeLatLngs={roadGeo?.latlngs ?? null} straightPath={roadGeo ? null : straightPath} onTogglePin={toggleStop} />
        </MapBoard>
        <View style={styles.circuitsRow}>
          <Chip
            label={circuitsBusy ? copy.routePlanner.circuitsLoading : showCircuits ? copy.routePlanner.circuitsHide : copy.routePlanner.circuitsShow}
            on={showCircuits}
            onPress={toggleCircuits}
          />
          {circuitsError ? (
            <Text style={styles.circuitsNote}>{copy.routePlanner.circuitsError}</Text>
          ) : showCircuits && circuits ? (
            <Text style={styles.circuitsNote}>{copy.routePlanner.circuitsNote(new Set(Object.values(circuits)).size)}</Text>
          ) : null}
        </View>
      </View>
      <View style={[styles.lower, stacked && styles.col]}>
        <View style={[{ width: '100%' }, !stacked && styles.controlsCol]}>
          <View style={styles.block}>
            <View style={styles.lbl}>
              <Text style={styles.lblText}>{copy.routePlanner.stopsLabel}</Text>
              <Text style={styles.lblCount}>{copy.routePlanner.selectedCount(selected.size)}</Text>
            </View>
            <View style={styles.pick}>
              {distilleries.map((d) => {
                const on = selected.has(d.id);
                const isStart = d.id === startId && on;
                return (
                  <Chip
                    key={d.id}
                    label={`${d.city} · ${shortName(d.name)}${isStart ? copy.routePlanner.partidaSuffix : ''}`}
                    on={on && !isStart}
                    accent={isStart}
                    onPress={() => toggleStop(d.id)}
                  />
                );
              })}
            </View>
            <Text style={styles.startNote}>{copy.routePlanner.startNote}</Text>
          </View>
          <Button label={solving ? copy.routePlanner.solving : copy.routePlanner.solve} full disabled={selected.size < 2 || solving} onPress={handleSolve} />
          {selected.size < 2 ? (
            <Text style={styles.hint}>{copy.routePlanner.needTwo}</Text>
          ) : null}
        </View>
        <View style={[{ width: '100%' }, !stacked && styles.itinCol]}>
          <View style={styles.itinCard}>
            <View style={styles.itinHead}>
              <Text style={styles.itinTitle}>{copy.routePlanner.itinTitle}</Text>
              {algoTag ? <Text style={styles.algotag}>{algoTag}</Text> : null}
            </View>
            {solving && !solution ? (
              <View style={styles.empty}><ActivityIndicator color={colors.red} /></View>
            ) : solution ? (
              <View>
                {solution.stops.map((stop, i) => {
                  const leg = i === 0 ? 0 : solution.legs[i - 1]?.km ?? 0;
                  const cumulative = solution.legs.slice(0, i).reduce((sum, l) => sum + l.km, 0);
                  return (
                    <View key={stop.id} style={styles.itinRow}>
                      <View style={[styles.ord, i === 0 && styles.ordStart]}>
                        <Text style={styles.ordText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itinName}>{stop.name}</Text>
                        <Text style={styles.itinSub}>
                          {(i === 0 ? `${copy.routePlanner.partida} · ${stop.city}` : `${stop.city} · ${stop.region}`).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.legSmall}>{i === 0 ? copy.routePlanner.saida : `+${Math.round(leg)} km`}</Text>
                        <Text style={styles.legBig}>{Math.round(cumulative)} km</Text>
                      </View>
                    </View>
                  );
                })}
                {solution.legs.length >= solution.stops.length ? (
                  <View style={[styles.itinRow, styles.itinReturn]}>
                    <View style={[styles.ord, styles.ordReturn]}>
                      <Text style={styles.ordReturnText}>↩</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itinName}>{solution.stops[0].name}</Text>
                      <Text style={styles.itinSub}>{copy.routePlanner.returnLabel} · {solution.stops[0].city.toUpperCase()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.legSmall}>+{Math.round(solution.legs[solution.legs.length - 1].km)} km</Text>
                      <Text style={styles.legBig}>{Math.round(solution.totalKm)} km</Text>
                    </View>
                  </View>
                ) : null}
                <Text style={styles.itinNote}>
                  {copy.routePlanner.itinNote}
                  {roadGeo ? copy.routePlanner.itinNoteOsrm : ''}
                </Text>
              </View>
            ) : (
              <View style={styles.empty}>
                <Text style={styles.emptyIc}>⁂</Text>
                <Text style={styles.emptyText}>{copy.routePlanner.emptyText}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function Metric({ value, label, saved, last }: { value: string; label: string; saved?: boolean; last?: boolean }) {
  return (
    <View style={[styles.metric, last && { borderRightWidth: 0 }]}>
      <Text style={[styles.mv, saved && { color: colors.red }]}>{value}</Text>
      <Text style={styles.mk}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: colors.rule, borderRadius: 8, overflow: 'hidden', marginTop: 32, marginBottom: 22 },
  metric: { flexGrow: 1, flexBasis: '25%', minWidth: 130, paddingVertical: 20, paddingHorizontal: 18, borderRightWidth: 1, borderRightColor: colors.rule, backgroundColor: colors.paper },
  mv: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.ink },
  mk: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 6 },
  mapWrap: { marginBottom: 36 },
  circuitsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 12 },
  circuitsNote: { flex: 1, minWidth: 240, fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1, lineHeight: 14, color: colors.inkSoft },
  lower: { flexDirection: 'row', columnGap: 40, rowGap: 28, alignItems: 'flex-start' },
  controlsCol: { flex: 1 },
  itinCol: { flex: 1.15 },
  block: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, paddingVertical: 20, paddingHorizontal: 22, marginBottom: 18, backgroundColor: colors.paper },
  lbl: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  lblText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: colors.ink, textTransform: 'uppercase' },
  lblCount: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.red, textTransform: 'uppercase' },
  pick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  startNote: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 13.5, lineHeight: 19, color: colors.inkSoft, marginTop: 14 },
  hint: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1, color: colors.inkSoft, marginTop: 10, textAlign: 'center' },
  itinCard: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, paddingVertical: 22, paddingHorizontal: 24, backgroundColor: colors.paper },
  itinHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  itinTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 28, color: colors.ink },
  algotag: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.red, textTransform: 'uppercase' },
  itinRow: { flexDirection: 'row', alignItems: 'center', columnGap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.rule },
  ord: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  ordStart: { backgroundColor: colors.ink },
  ordText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 14, color: '#fff' },
  itinReturn: { borderBottomWidth: 0, opacity: 0.85 },
  ordReturn: { backgroundColor: colors.paper, borderWidth: 1.5, borderColor: colors.ink },
  ordReturnText: { fontSize: 14, color: colors.ink, lineHeight: 16 },
  itinName: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 16.5, color: colors.ink, fontWeight: '500' },
  itinSub: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 3 },
  legSmall: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.inkSoft },
  legBig: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 18, color: colors.ink },
  itinNote: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.inkSoft, marginTop: 14, lineHeight: 14 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIc: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 44, color: colors.red, marginBottom: 10 },
  emptyText: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft, maxWidth: 320, textAlign: 'center' },
});
