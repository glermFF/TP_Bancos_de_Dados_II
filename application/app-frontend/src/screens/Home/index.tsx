import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Line, Circle, Polyline, G, Text as SvgText, Defs, Pattern, Rect } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { Tag } from '../../components/Tag';
import { colors, fonts } from '../../theme';
import { FALLBACK_DISTILLERIES, FALLBACK_STATS } from '../../data/fallback';
import { fetchAllDistilleries, fetchStats } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { solveRoute } from '../../lib/tsp';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ---- hero plate: real coordinates, linear projection over the MG bbox ----
const VIEW_W = 600;
const VIEW_H = 500;
const PAD = 56;
const LAT_MAX = -14.2; // north edge
const LAT_MIN = -22.6; // south edge
const LON_MIN = -47.6; // west edge (route bbox, not the whole state)
const LON_MAX = -41.2; // east edge

function project(lat: number, lon: number): { x: number; y: number } {
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (VIEW_W - PAD * 2);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (VIEW_H - PAD * 2);
  return { x, y };
}

function HeroPlate() {
  const sketch = useMemo(() => {
    // one stop per town keeps the plate legible
    const seen = new Set<string>();
    const stops = FALLBACK_DISTILLERIES.filter((d) => {
      if (seen.has(d.city) || d.status !== 'VERIFIED') return false;
      seen.add(d.city);
      return true;
    });
    const start = stops.find((s) => s.id === 'germana') ?? stops[0];
    const { order } = solveRoute(
      stops.map((s) => ({ id: s.id, latitude: s.latitude, longitude: s.longitude })),
      { id: start.id, latitude: start.latitude, longitude: start.longitude },
      'two-opt',
    );
    const byId = new Map(stops.map((s) => [s.id, s]));
    return order.map((p, i) => {
      const stop = byId.get(p.id)!;
      return { ...stop, ...project(stop.latitude, stop.longitude), n: i + 1 };
    });
  }, []);

  const points = sketch.map((s) => `${s.x},${s.y}`).join(' ');
  const lats = [-16, -18, -20, -22];
  const lons = [-46, -44, -42];

  return (
    <View style={styles.heroBoard}>
      <Text style={[styles.corner, styles.tl]}>FIG. 01 — TERRAS DA CACHAÇA · MG</Text>
      <Text style={[styles.corner, styles.tr]}>N ↑</Text>
      <Text style={[styles.corner, styles.bl]}>{sketch.length} PARADAS · ORDEM TWO-OPT</Text>
      <Text style={[styles.corner, styles.br]}>RESOLVIDO NUM GRAFO NEO4J</Text>
      <View style={styles.heroBoardInner}>
        <Svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" height="100%">
          <Defs>
            <Pattern id="plateHatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
              <Line x1={0} y1={0} x2={0} y2={6} stroke="rgba(158,42,43,.07)" strokeWidth={1} />
            </Pattern>
          </Defs>
          <Rect x={18} y={18} width={VIEW_W - 36} height={VIEW_H - 36} fill="url(#plateHatch)" stroke={colors.rule} strokeWidth={1} />
          {/* graticule */}
          {lats.map((lat) => {
            const { y } = project(lat, LON_MIN);
            return (
              <G key={`lat${lat}`}>
                <Line x1={18} y1={y} x2={VIEW_W - 18} y2={y} stroke={colors.rule} strokeWidth={0.7} strokeDasharray="2 5" />
                <SvgText x={26} y={y - 5} fill={colors.inkSoft} fontSize={8} fontFamily={fonts.mono}>{`${lat}°`}</SvgText>
              </G>
            );
          })}
          {lons.map((lon) => {
            const { x } = project(LAT_MAX, lon);
            return (
              <G key={`lon${lon}`}>
                <Line x1={x} y1={18} x2={x} y2={VIEW_H - 18} stroke={colors.rule} strokeWidth={0.7} strokeDasharray="2 5" />
                <SvgText x={x + 5} y={VIEW_H - 26} fill={colors.inkSoft} fontSize={8} fontFamily={fonts.mono}>{`${lon}°`}</SvgText>
              </G>
            );
          })}
          {/* the route */}
          <Polyline points={points} stroke="rgba(158,42,43,.16)" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Polyline points={points} stroke={colors.red} strokeWidth={2.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {sketch.map((s) => {
            const isStart = s.n === 1;
            const labelAbove = s.y > VIEW_H - 90;
            return (
              <G key={s.id}>
                <Circle cx={s.x} cy={s.y} r={isStart ? 9.5 : 8} fill={isStart ? colors.red : colors.ink} stroke={colors.paper} strokeWidth={1.6} />
                <SvgText x={s.x} y={s.y + 3.4} fill={colors.cream} fontSize={9.5} fontFamily={fonts.display} fontStyle="italic" textAnchor="middle">{s.n}</SvgText>
                <SvgText x={s.x} y={labelAbove ? s.y - 14 : s.y + 21} fill={colors.inkSoft} fontSize={7.6} fontFamily={fonts.mono} textAnchor="middle" letterSpacing={0.6}>
                  {s.city.toUpperCase()}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const narrow = width <= 1080;
  const nav = useNavigation<Nav>();
  const h1 = Math.max(52, Math.min(112, width * 0.072));

  const { data: stats, live } = useFetch(fetchStats, FALLBACK_STATS);
  const { data: distilleries } = useFetch(fetchAllDistilleries, FALLBACK_DISTILLERIES);
  const featured = distilleries.slice(0, 3);

  const statItems = [
    { v: String(stats.distilleries), k: 'ALAMBIQUES' },
    { v: String(stats.cities), k: 'CIDADES MINEIRAS' },
    { v: String(stats.reviews), k: 'NOTAS DE CAMPO' },
    { v: String(stats.regions), k: 'REGIÕES' },
  ];

  return (
    <Screen active="Home">
      {/* HERO */}
      <View style={[styles.hero, narrow && styles.col]}>
        <View style={{ flex: 1.05 }}>
          <Text style={styles.kicker}>GUIA DE CAMPO DA CACHAÇA · MINAS GERAIS · {live ? 'GRAFO AO VIVO' : 'DADOS DE EXEMPLO'}</Text>
          <Text style={[styles.h1, { fontSize: h1, lineHeight: h1 * 0.92 }]}>
            A rota mais rápida{'\n'}pelas terras da <Text style={styles.h1Em}>cachaça.</Text>
          </Text>
          <Text style={styles.lede}>
            Escolha os alambiques que quer conhecer e o guia calcula a
            <Text style={styles.em}> ordem mais esperta</Text> de visitar todos — estradas reais,
            alambiques reais, o mínimo de asfalto entre você e o próximo gole.
          </Text>
          <View style={styles.heroBtns}>
            <Button label="Montar minha rota" onPress={() => nav.navigate('RoutePlanner')} />
            <Button label="Explorar alambiques" ghost onPress={() => nav.navigate('Distilleries')} />
          </View>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <HeroPlate />
        </View>
      </View>

      {/* STATS STRIP */}
      <View style={styles.statsRow}>
        {statItems.map((s, i) => (
          <View key={s.k} style={[styles.stat, i < statItems.length - 1 && styles.statBorder]}>
            <Text style={styles.statV}>{s.v}</Text>
            <Text style={styles.statK}>{s.k}</Text>
          </View>
        ))}
      </View>

      {/* FEATURED */}
      <View style={styles.section}>
        <View style={styles.featHead}>
          <Text style={styles.featTitle}>Garrafas que valem a estrada.</Text>
          <Hoverable onPress={() => nav.navigate('Distilleries')}>
            {(h: boolean) => <Text style={[styles.featLink, h && { color: colors.red }]}>VER TODOS OS {stats.distilleries} →</Text>}
          </Hoverable>
        </View>
        <View style={[styles.featGrid, narrow && styles.col]}>
          {featured.map((a) => (
            <Hoverable key={a.id} style={styles.featCard} hoverStyle={styles.featCardHover} onPress={() => nav.navigate('Distilleries')}>
              {(h: boolean) => (
                <>
                  <View style={styles.featCardTop}>
                    <Tag variant="label">{a.category}</Tag>
                    <Text style={styles.featRate}>{a.rating.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.featName, h && { color: colors.red }]}>{a.name}</Text>
                  <Text style={styles.featCity}>{a.city.toUpperCase()} · {a.region.toUpperCase()}</Text>
                  {a.signature ? <Text style={styles.featSig}>“{a.signature}”</Text> : null}
                  <View style={styles.featProps}>
                    {a.tags.slice(0, 2).map((p) => <Tag key={p}>{p}</Tag>)}
                  </View>
                </>
              )}
            </Hoverable>
          ))}
        </View>
      </View>

      {/* HOW IT WORKS */}
      <View style={styles.how}>
        {[
          { n: '01', t: 'Escolha os alambiques', p: 'Navegue pelo catálogo ou toque nos pinos do mapa real — cada alambique é um nó num grafo Neo4j de Minas Gerais.' },
          { n: '02', t: 'O grafo resolve', p: 'As distâncias vêm do motor espacial do banco; uma heurística de caixeiro-viajante acha a ordem que desperdiça menos estrada.' },
          { n: '03', t: 'Pé na estrada', p: 'Receba o roteiro trecho a trecho, desenhado sobre as rodovias reais do OpenStreetMap, com tempo de direção e paradas de prova.' },
        ].map((step, i) => (
          <View key={step.n} style={[styles.howItem, i < 2 && !narrow && styles.howBorder]}>
            <Text style={styles.howN}>{step.n}</Text>
            <Text style={styles.howT}>{step.t}</Text>
            <Text style={styles.howP}>{step.p}</Text>
          </View>
        ))}
      </View>

      {/* TEASER */}
      <View style={styles.teaser}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.teaserH}>Você escolhe.{'\n'}O grafo traça.</Text>
          <Text style={styles.teaserP}>
            Marque os alambiques que te tentam e o Cachaceiro Viajante calcula a
            ordem mais curta de visita em segundos — pronta pro para-brisa.
          </Text>
          <Button label="Abrir o planejador" ghost onDark onPress={() => nav.navigate('RoutePlanner')} />
        </View>
        <Text style={styles.teaserBig}>ESCOLHA.{'\n'}RESOLVA.{'\n'}RODE.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column' },

  hero: { flexDirection: 'row', columnGap: 48, rowGap: 36, paddingTop: 56, paddingBottom: 48, alignItems: 'center' },
  kicker: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2.2, color: colors.inkSoft, marginBottom: 22 },
  h1: { fontFamily: fonts.display, fontStyle: 'italic', color: colors.ink, letterSpacing: -1.5 },
  h1Em: { color: colors.red },
  lede: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 30, color: colors.inkSoft, maxWidth: 540, marginTop: 24 },
  em: { fontStyle: 'italic', color: colors.ink },
  heroBtns: { flexDirection: 'row', columnGap: 14, rowGap: 14, flexWrap: 'wrap', marginTop: 30 },

  heroBoard: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 24, width: '100%' },
  heroBoardInner: { width: '100%', aspectRatio: 6 / 5 },
  corner: { position: 'absolute', fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.inkSoft, zIndex: 3 },
  tl: { top: 14, left: 18 },
  tr: { top: 14, right: 18 },
  bl: { bottom: 14, left: 18 },
  br: { bottom: 14, right: 18 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.rule },
  stat: { flexGrow: 1, flexBasis: '25%', minWidth: 140, paddingVertical: 26, paddingHorizontal: 8 },
  statBorder: { borderRightWidth: 1, borderRightColor: colors.rule },
  statV: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 38, color: colors.ink },
  statK: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.6, color: colors.inkSoft, marginTop: 6 },

  section: { paddingVertical: 56 },
  featHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', rowGap: 12 },
  featTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 44, color: colors.ink, letterSpacing: -1 },
  featLink: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.8, color: colors.inkSoft },
  featGrid: { flexDirection: 'row', columnGap: 24, rowGap: 24 },
  featCard: { flex: 1, minWidth: 240, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 26, backgroundColor: colors.paper },
  featCardHover: { borderColor: colors.ink },
  featCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  featRate: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink },
  featName: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 25, color: colors.ink, lineHeight: 28, marginBottom: 8 },
  featCity: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft, marginBottom: 10 },
  featSig: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 14.5, color: colors.copperDeep, marginBottom: 14 },
  featProps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  how: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: colors.rule, paddingVertical: 14, marginBottom: 56 },
  howItem: { flexGrow: 1, flexBasis: '30%', minWidth: 230, paddingVertical: 26, paddingHorizontal: 22 },
  howBorder: { borderRightWidth: 1, borderRightColor: colors.rule },
  howN: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.copper, marginBottom: 10 },
  howT: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink, marginBottom: 10 },
  howP: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 23, color: colors.inkSoft, maxWidth: 330 },

  teaser: {
    backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 48, paddingHorizontal: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 40, rowGap: 28, flexWrap: 'wrap',
  },
  teaserH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.cream, marginBottom: 16 },
  teaserP: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.onInkSoft, maxWidth: 460, marginBottom: 24 },
  teaserBig: { fontFamily: fonts.mono, fontSize: 22, lineHeight: 34, color: colors.copper, letterSpacing: 1 },
});
