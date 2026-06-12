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
import type { RouteAlgorithm, RouteSolution } from '../../data/types';
import * as apiService from '../../services/api';
import { fetchRoadRoute, type RoadGeometry } from '../../services/osrm';
import { useFetch } from '../../hooks/useFetch';
import { solveOffline } from '../../lib/offlineSolve';
import { TASTING_STOP_MIN, formatMinutes, km } from '../../lib/format';

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
  const [startId, setStartId] = useState('germana');
  const [algorithm, setAlgorithm] = useState<RouteAlgorithm>('two-opt');
  const [solution, setSolution] = useState<RouteSolution | null>(null);
  const [solving, setSolving] = useState(false);
  const [roadGeo, setRoadGeo] = useState<RoadGeometry | null>(null);
  const [roadPending, setRoadPending] = useState(false);
  const solveSeq = useRef(0);

  // Live data has fresh UUIDs: remap the default trip by name, via fallback slugs.
  useEffect(() => {
    if (!live) return;
    const nameBySlug = new Map(FALLBACK_DISTILLERIES.map((f) => [f.id, f.name]));
    setSelected((previous) => {
      const next = new Set<string>();
      for (const slug of previous) {
        const match = distilleries.find((d) => d.name === nameBySlug.get(slug) || d.id === slug);
        if (match) next.add(match.id);
      }
      const start = distilleries.find((d) => d.name === nameBySlug.get('germana'));
      setStartId(start?.id ?? [...next][0] ?? distilleries[0]?.id ?? '');
      return next.size >= 2 ? next : new Set(distilleries.slice(0, 5).map((d) => d.id));
    });
  }, [live]);

  useEffect(() => {
    const preselect = route.params?.preselect;
    if (!preselect) return;
    setSelected((previous) => new Set(previous).add(preselect));
    invalidate();
  }, [route.params?.preselect]);

  const selectedStops = useMemo(
    () => distilleries.filter((d) => selected.has(d.id)),
    [distilleries, selected],
  );

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
      })),
    [distilleries, selected, startId, orderIndex],
  );

  const straightPath = useMemo(
    () => solution?.stops.map((s) => [s.latitude, s.longitude] as [number, number]) ?? null,
    [solution],
  );

  const invalidate = useCallback(() => {
    setSolution(null);
    setRoadGeo(null);
    setRoadPending(false);
  }, []);

  const toggleStop = useCallback(
    (id: string) => {
      setSelected((previous) => {
        const next = new Set(previous);
        if (next.has(id)) {
          next.delete(id);
          if (id === startId) setStartId([...next][0] ?? '');
        } else {
          next.add(id);
        }
        return next;
      });
      invalidate();
    },
    [startId, invalidate],
  );

  async function handleSolve() {
    if (selected.size < 2 || solving) return;
    const seq = ++solveSeq.current;
    setSolving(true);
    setRoadGeo(null);
    try {
      const stopIds = selectedStops.map((s) => s.id);
      const start = selected.has(startId) ? startId : stopIds[0];
      const result = live
        ? await apiService.solveRoute(stopIds, start, algorithm).catch(() => solveOffline(selectedStops, start, algorithm))
        : solveOffline(selectedStops, start, algorithm);
      if (seq !== solveSeq.current) return;
      setSolution(result);
      setRoadPending(true);
      const geometry = await fetchRoadRoute(result.stops);
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
    ? 'AJUSTANDO ÀS ESTRADAS (OSRM)…'
    : roadGeo
      ? 'ESTRADAS REAIS · OSRM'
      : solution
        ? 'TRAÇADO EM LINHA RETA — — —'
        : 'TILES © OPENSTREETMAP · CARTO';

  return (
    <Screen active="RoutePlanner">
      <PageHead
        crumbs={[{ label: 'Guia' }, { label: 'Monte sua rota', current: true }]}
        title={['A rota mais ', { em: 'rápida.' }]}
        lede="Escolha os alambiques que quer visitar e de onde você parte. O grafo calcula a ordem de visita que cobre todos rodando o mínimo de estrada — e desenha o trajeto sobre as rodovias reais do OpenStreetMap."
      />

      <View style={[styles.solver, stacked && styles.col]}>
        <View style={[{ width: '100%' }, !stacked && { flex: 1.5 }]}>
          <MapBoard
            headLeft={`FIG. 02 — MAPA DE CAMPO · ${selected.size} PARADAS`}
            headRight={`${solution ? 'ROTA TRAÇADA' : 'TOQUE NOS PINOS PARA MONTAR A VIAGEM'} · N ↑`}
            footLeft={`${live ? 'GRAFO NEO4J AO VIVO' : 'DADOS DE EXEMPLO OFFLINE'} · ${distilleries.length} NÓS`}
            footRight={footRight}
            footRightAccent={!!roadGeo}
          >
            <RouteMap
              stops={mapStops}
              routeLatLngs={roadGeo?.latlngs ?? null}
              straightPath={roadGeo ? null : straightPath}
              onTogglePin={toggleStop}
            />
          </MapBoard>
        </View>

        <View style={[{ width: '100%' }, !stacked && { flex: 1 }]}>
          <View style={styles.metrics}>
            <Metric value={solution ? km(displayKm) : '—'} label={roadGeo ? 'DISTÂNCIA RODOVIÁRIA' : 'DISTÂNCIA TOTAL'} />
            <Metric value={solution ? formatMinutes(displayMinutes) : '—'} label="TEMPO DE VIAGEM" />
            <Metric value={solution ? `−${Math.round(solution.savedKm)} km` : '—'} label="VOCÊ ECONOMIZA" saved last />
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}>
              <Text style={styles.lblText}>PARADAS DO ROTEIRO</Text>
              <Text style={styles.lblText}>{selected.size} SELECIONADAS</Text>
            </View>
            <View style={styles.pick}>
              {distilleries.map((d) => {
                const on = selected.has(d.id);
                const isStart = d.id === startId && on;
                return (
                  <Chip
                    key={d.id}
                    label={`${d.city} · ${shortName(d.name)}${isStart ? ' · PARTIDA' : ''}`}
                    on={on && !isStart}
                    accent={isStart}
                    onPress={() => toggleStop(d.id)}
                  />
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}><Text style={styles.lblText}>PONTO DE PARTIDA</Text></View>
            <View style={styles.pick}>
              {selectedStops.map((d) => (
                <Chip
                  key={d.id}
                  label={shortName(d.name)}
                  accent={d.id === startId}
                  onPress={() => { setStartId(d.id); invalidate(); }}
                />
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}><Text style={styles.lblText}>ALGORITMO</Text></View>
            <View style={styles.pick}>
              {(['nearest', 'two-opt'] as RouteAlgorithm[]).map((a) => (
                <Chip
                  key={a}
                  label={a === 'nearest' ? 'Vizinho mais próximo' : 'Two-opt (mais curta)'}
                  on={algorithm === a}
                  onPress={() => { setAlgorithm(a); invalidate(); }}
                />
              ))}
            </View>
          </View>

          <Button
            label={solving ? 'Calculando…' : 'Traçar a rota'}
            full
            disabled={selected.size < 2 || solving}
            onPress={handleSolve}
          />

          <View style={styles.itinHead}>
            <Text style={styles.itinTitle}>Roteiro</Text>
            {solution ? (
              <Text style={styles.algotag}>
                {solution.algorithm === 'two-opt' ? 'TWO-OPT' : 'VIZINHO MAIS PRÓXIMO'} · {live ? 'NEO4J' : 'LOCAL'}
              </Text>
            ) : null}
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
                        {(i === 0 ? `PARTIDA · ${stop.city}` : `${stop.city} · ${stop.region}`).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.legSmall}>{i === 0 ? 'saída' : `+${Math.round(leg)} km`}</Text>
                      <Text style={styles.legBig}>{Math.round(cumulative)} km</Text>
                    </View>
                  </View>
                );
              })}
              <Text style={styles.itinNote}>
                As distâncias por trecho são estimativas do grafo (geodésica × fator rodoviário 1,27).
                {roadGeo ? ' Os totais acima seguem as estradas reais via OSRM.' : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIc}>⁂</Text>
              <Text style={styles.emptyText}>
                Escolha pelo menos dois alambiques — no mapa ou na lista — e trace a rota para ver a ordem de visita.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

function Metric({ value, label, saved, last }: { value: string; label: string; saved?: boolean; last?: boolean }) {
  return (
    <View style={[styles.metric, last && { borderRightWidth: 0 }]}>
      <Text style={[styles.mv, saved && { color: colors.moss }]}>{value}</Text>
      <Text style={styles.mk}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  solver: { flexDirection: 'row', columnGap: 40, rowGap: 28, paddingTop: 40, alignItems: 'flex-start' },
  col: { flexDirection: 'column' },

  metrics: { flexDirection: 'row', borderWidth: 1, borderColor: colors.rule, borderRadius: 8, overflow: 'hidden', marginBottom: 18 },
  metric: { flex: 1, paddingVertical: 16, paddingHorizontal: 14, borderRightWidth: 1, borderRightColor: colors.rule, backgroundColor: colors.paper },
  mv: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink },
  mk: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 6 },

  block: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, paddingVertical: 20, paddingHorizontal: 22, marginBottom: 18, backgroundColor: colors.paper },
  lbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  lblText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, textTransform: 'uppercase' },
  pick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  itinHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 6 },
  itinTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink },
  algotag: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.moss, textTransform: 'uppercase' },

  itinRow: { flexDirection: 'row', alignItems: 'center', columnGap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.rule },
  ord: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  ordStart: { backgroundColor: colors.ink },
  ordText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 14, color: colors.cream },
  itinName: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 16.5, color: colors.ink, fontWeight: '500' },
  itinSub: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 3 },
  legSmall: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.inkSoft },
  legBig: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 18, color: colors.ink },
  itinNote: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.inkSoft, marginTop: 14, lineHeight: 14 },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIc: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 44, color: colors.copper, marginBottom: 10 },
  emptyText: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft, maxWidth: 280, textAlign: 'center' },
});
