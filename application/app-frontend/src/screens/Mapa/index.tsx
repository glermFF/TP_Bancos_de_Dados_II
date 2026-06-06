import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Polyline, G, Text as SvgText, Defs, Pattern } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { Tag } from '../../components/Tag';
import { colors, fonts } from '../../theme';
import { NODES, NODE_BY_ID } from '../../data/nodes';
import { ALAMBIQUES } from '../../data/alambiques';
import { distance, solveRoute } from '../../lib/tsp';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MG_OUTLINE =
  'M 80 200 C 70 160, 110 110, 170 95 L 250 85 C 300 78, 340 95, 380 90 L 460 95 C 510 100, 540 130, 540 170 L 520 235 C 510 280, 520 320, 495 360 L 440 410 C 400 440, 350 450, 305 445 L 230 430 C 180 420, 140 400, 115 360 L 95 305 C 78 270, 75 235, 80 200 Z';

const SAMPLE = ['bh', 'cipo', 'dia', 'op', 'tir', 'sjr', 'cax'];

const STATS = [
  { v: '147', k: 'ALAMBIQUES' },
  { v: '23', k: 'CIDADES MINEIRAS' },
  { v: '9.842', k: 'AVALIAÇÕES' },
  { v: '5', k: 'REGIÕES DE MINAS' },
];

function HeroGraph() {
  const route = useMemo(() => {
    const nodes = NODES.filter((n) => SAMPLE.includes(n.id));
    return solveRoute(nodes, NODE_BY_ID.bh, '2opt').order;
  }, []);
  const points = route.map((n) => `${n.x},${n.y}`).join(' ');
  const edges = useMemo(() => {
    const nodes = NODES.filter((n) => SAMPLE.includes(n.id));
    const drawn = new Set<string>();
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    nodes.forEach((a) => {
      [...nodes].filter((b) => b.id !== a.id).sort((p, q) => distance(a, p) - distance(a, q)).slice(0, 3).forEach((b) => {
        const key = [a.id, b.id].sort().join('-');
        if (drawn.has(key)) return; drawn.add(key);
        out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      });
    });
    return out;
  }, []);

  return (
    <View style={styles.heroBoard}>
      <Text style={[styles.corner, styles.tl]}>MINAS GERAIS · ROTEIRO</Text>
      <Text style={[styles.corner, styles.tr]}>N ↑</Text>
      <View style={styles.heroBoardInner}>
        <Svg viewBox="0 0 600 500" width="100%" height="100%">
          <Defs>
            <Pattern id="hatchHome" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
              <Line x1={0} y1={0} x2={0} y2={6} stroke="rgba(158,42,43,.10)" strokeWidth={1} />
            </Pattern>
          </Defs>
          <Path d={MG_OUTLINE} fill="url(#hatchHome)" stroke={colors.red} strokeWidth={1.1} strokeLinejoin="round" opacity={0.5} />
          {edges.map((e, i) => (
            <Line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={colors.ink} strokeWidth={1} opacity={0.12} />
          ))}
          <Polyline points={points} stroke="rgba(158,42,43,.16)" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          <Polyline points={points} stroke={colors.red} strokeWidth={2.8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {NODES.filter((n) => SAMPLE.includes(n.id)).map((n) => {
            const ord = route.findIndex((r) => r.id === n.id) + 1;
            const isStart = n.id === 'bh';
            return (
              <G key={n.id}>
                <Circle cx={n.x} cy={n.y} r={isStart ? 9 : 7} fill={isStart ? colors.red : colors.ink} stroke={isStart ? colors.redDeep : colors.ink} strokeWidth={1.4} />
                <SvgText x={n.x} y={n.y > 410 ? n.y + 20 : n.y - 13} fill={colors.ink} fontSize={7.5} fontFamily={fonts.mono} textAnchor="middle">{n.name}</SvgText>
                <SvgText x={n.x} y={n.y + 3.4} fill={colors.cream} fontSize={10} fontFamily={fonts.display} fontStyle="italic" textAnchor="middle">{ord}</SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

export default function MapaScreen() {
  const { width } = useWindowDimensions();
  const narrow = width <= 1080;
  const nav = useNavigation<Nav>();
  const h1 = Math.max(52, Math.min(112, width * 0.075));
  const featured = ALAMBIQUES.slice(0, 3);

  return (
    <Screen active="Mapa">
      {/* HERO */}
      <View style={[styles.hero, narrow && styles.col]}>
        <View style={{ flex: 1.05 }}>
          <Text style={styles.kicker}>GUIA DE ROTEIROS DE CACHAÇA · MINAS GERAIS</Text>
          <Text style={[styles.h1, { fontSize: h1, lineHeight: h1 * 0.92 }]}>
            A melhor{'\n'}rota da <Text style={styles.h1Em}>cachaça.</Text>
          </Text>
          <Text style={styles.lede}>
            Escolha os alambiques que quer conhecer e a gente monta o <Text style={styles.em}>roteiro mais esperto</Text> entre eles — a ordem que cobre todos rodando o mínimo de estrada. Mais tempo de prosa, prova e paisagem; menos tempo no volante.
          </Text>
          <View style={styles.heroBtns}>
            <Button label="Montar minha rota" onPress={() => nav.navigate('Rotas')} />
            <Button label="Explorar alambiques" ghost onPress={() => nav.navigate('Alambiques')} />
          </View>
        </View>
        <View style={{ flex: 1, width: '100%' }}>
          <HeroGraph />
        </View>
      </View>

      {/* STATS STRIP */}
      <View style={styles.statsRow}>
        {STATS.map((s, i) => (
          <View key={s.k} style={[styles.stat, i < STATS.length - 1 && styles.statBorder]}>
            <Text style={styles.statV}>{s.v}</Text>
            <Text style={styles.statK}>{s.k}</Text>
          </View>
        ))}
      </View>

      {/* FEATURED */}
      <View style={styles.section}>
        <View style={styles.featHead}>
          <Text style={styles.featTitle}>Alambiques em destaque.</Text>
          <Hoverable onPress={() => nav.navigate('Alambiques')}>
            {(h: boolean) => <Text style={[styles.featLink, h && { color: colors.red }]}>VER TODOS OS 147 →</Text>}
          </Hoverable>
        </View>
        <View style={[styles.featGrid, narrow && styles.col]}>
          {featured.map((a) => (
            <Hoverable key={a.id} style={styles.featCard} hoverStyle={styles.featCardHover} onPress={() => nav.navigate('Alambiques')}>
              {(h: boolean) => (
                <>
                  <View style={styles.featCardTop}>
                    <Tag variant="label">{a.category}</Tag>
                    <Text style={styles.featRate}>{a.rate.toFixed(1)}</Text>
                  </View>
                  <Text style={[styles.featName, h && { color: colors.red }]}>{a.name}</Text>
                  <Text style={styles.featCity}>{a.city.toUpperCase()} · {a.region.toUpperCase()}</Text>
                  <View style={styles.featProps}>
                    {a.props.map((p) => <Tag key={p}>{p}</Tag>)}
                  </View>
                </>
              )}
            </Hoverable>
          ))}
        </View>
      </View>

      {/* MODEL TEASER */}
      <View style={styles.teaser}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.teaserH}>Você escolhe.{'\n'}A gente traça.</Text>
          <Text style={styles.teaserP}>
            Marque os alambiques que te interessam e o Cachaceiro Viajante desenha a ordem mais curta de visitar todos. Em segundos você tem o roteiro pronto pra pegar a estrada.
          </Text>
          <Button label="Como funciona" ghost onDark onPress={() => nav.navigate('Sobre')} />
        </View>
        <Text style={styles.teaserBig}>ESCOLHA.{'\n'}A GENTE{'\n'}TRAÇA{'\n'}A ROTA.</Text>
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
  featName: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink, lineHeight: 28, marginBottom: 8 },
  featCity: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft, marginBottom: 16 },
  featProps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  teaser: {
    backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 48, paddingHorizontal: 44,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 40, rowGap: 28, flexWrap: 'wrap',
  },
  teaserH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.cream, marginBottom: 16 },
  teaserP: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.onInkSoft, maxWidth: 460, marginBottom: 24 },
  teaserBig: { fontFamily: fonts.mono, fontSize: 22, lineHeight: 34, color: colors.copper, letterSpacing: 1 },
});
