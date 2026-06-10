import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Line, Circle, Polyline, G, Text as SvgText, Defs, Pattern } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { colors, fonts } from '../../theme';
import { NODES, NODE_BY_ID } from '../../data/nodes';
import { distance, solveRoute, type Algo } from '../../lib/tsp';
import { formatDriveTime, km } from '../../lib/format';

const MG_OUTLINE =
  'M 80 200 C 70 160, 110 110, 170 95 L 250 85 C 300 78, 340 95, 380 90 L 460 95 C 510 100, 540 130, 540 170 L 520 235 C 510 280, 520 320, 495 360 L 440 410 C 400 440, 350 450, 305 445 L 230 430 C 180 420, 140 400, 115 360 L 95 305 C 78 270, 75 235, 80 200 Z';

const DEFAULT_SEL = ['bh', 'op', 'tir', 'sjr', 'cax', 'cipo', 'dia'];

export default function RotasScreen() {
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;

  const [selected, setSelected] = useState<Set<string>>(new Set(DEFAULT_SEL));
  const [start, setStart] = useState('bh');
  const [algo, setAlgo] = useState<Algo>('nn');
  const [solved, setSolved] = useState(false);

  const selectedNodes = useMemo(() => NODES.filter((n) => selected.has(n.id)), [selected]);
  const startNode = NODE_BY_ID[selected.has(start) ? start : selectedNodes[0]?.id] ?? NODE_BY_ID[start];

  const result = useMemo(
    () => (selected.size >= 2 ? solveRoute(selectedNodes, startNode, algo) : null),
    [selectedNodes, startNode, algo, selected.size],
  );
  const order = solved && result ? result.order : null;
  const orderIndex = useMemo(() => {
    const m: Record<string, number> = {};
    order?.forEach((n, i) => { m[n.id] = i + 1; });
    return m;
  }, [order]);

  // faint edges: each selected node to its 3 nearest selected
  const edges = useMemo(() => {
    const drawn = new Set<string>();
    const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
    selectedNodes.forEach((a) => {
      [...selectedNodes]
        .filter((b) => b.id !== a.id)
        .sort((p, q) => distance(a, p) - distance(a, q))
        .slice(0, 3)
        .forEach((b) => {
          const key = [a.id, b.id].sort().join('-');
          if (drawn.has(key)) return;
          drawn.add(key);
          out.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        });
    });
    return out;
  }, [selectedNodes]);

  const routePoints = order?.map((n) => `${n.x},${n.y}`).join(' ') ?? '';

  function toggle(id: string) {
    if (id === start) return; // can't deselect start
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSolved(false);
  }

  return (
    <Screen active="Rotas">
      <PageHead
        crumbs={[{ label: 'Mapa' }, { label: 'Rotas' }, { label: 'monte seu roteiro', current: true }]}
        title={['A rota ', { em: 'perfeita.' }]}
        lede="Escolha os alambiques que quer visitar e de onde você parte. A gente monta a ordem mais esperta de conhecer todos — a que cobre o roteiro inteiro rodando o mínimo de estrada."
      />

      <View style={[styles.solver, stacked && styles.col]}>
        {/* GRAPH BOARD */}
        <View style={[styles.board, !stacked && { flex: 1.5 }]}>
          <View style={styles.boardInner}>
            <Text style={[styles.corner, styles.tl]}>{selected.size} PARADAS</Text>
            <Text style={[styles.corner, styles.tr]}>{solved ? 'ROTA PRONTA' : 'MONTE SEU ROTEIRO'}</Text>
            <Svg viewBox="0 0 600 500" width="100%" height="100%">
              <Defs>
                <Pattern id="hatch" patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                  <Line x1={0} y1={0} x2={0} y2={6} stroke="rgba(158,42,43,.10)" strokeWidth={1} />
                </Pattern>
              </Defs>
              <Path d={MG_OUTLINE} fill="url(#hatch)" stroke={colors.red} strokeWidth={1.1} strokeLinejoin="round" opacity={0.5} />

              {edges.map((e, i) => (
                <Line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={colors.ink} strokeWidth={1} opacity={0.12} />
              ))}

              {routePoints ? (
                <>
                  <Polyline points={routePoints} stroke="rgba(158,42,43,.16)" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                  <Polyline points={routePoints} stroke={colors.red} strokeWidth={2.8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                </>
              ) : null}

              {NODES.map((n) => {
                const on = selected.has(n.id);
                const isStart = n.id === start;
                const ord = orderIndex[n.id];
                return (
                  <G key={n.id} onPress={() => toggle(n.id)}>
                    <Circle cx={n.x} cy={n.y} r={isStart ? 9 : 7}
                      fill={isStart ? colors.red : on ? colors.ink : colors.cream}
                      stroke={isStart ? colors.redDeep : colors.ink} strokeWidth={1.4} />
                    {/* larger transparent hit target */}
                    <Circle cx={n.x} cy={n.y} r={16} fill="transparent" />
                    <SvgText x={n.x} y={n.y > 410 ? n.y + 20 : n.y - 13} fill={on ? colors.ink : colors.inkSoft}
                      fontSize={7.5} fontFamily={fonts.mono} textAnchor="middle">{n.name}</SvgText>
                    {ord ? (
                      <SvgText x={n.x} y={n.y + 3.4} fill={colors.cream} fontSize={10} fontFamily={fonts.display} fontStyle="italic" textAnchor="middle">{ord}</SvgText>
                    ) : null}
                  </G>
                );
              })}
            </Svg>
          </View>
        </View>

        {/* CONTROL PANEL */}
        <View style={[styles.panel, !stacked && { flex: 1 }]}>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.mv}>{solved && result ? km(result.total) : '—'}</Text>
              <Text style={styles.mk}>DISTÂNCIA TOTAL</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.mv}>{solved && result ? formatDriveTime(result.total, selected.size) : '—'}</Text>
              <Text style={styles.mk}>TEMPO DE VIAGEM</Text>
            </View>
            <View style={[styles.metric, styles.metricLast]}>
              <Text style={[styles.mv, styles.mvSaved]}>{solved && result ? `−${result.saved}` : '—'}</Text>
              <Text style={styles.mk}>VOCÊ ECONOMIZA</Text>
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}>
              <Text style={styles.lblText}>ALAMBIQUES NO ROTEIRO</Text>
              <Text style={styles.lblText}>{selected.size} paradas</Text>
            </View>
            <View style={styles.pick}>
              {NODES.map((n) => {
                const on = selected.has(n.id);
                const isStart = n.id === start;
                return (
                  <Hoverable key={n.id} onPress={() => toggle(n.id)}
                    style={[styles.nchip, on && styles.nchipOn, isStart && styles.nchipStart]}>
                    <Text style={[styles.nchipText, (on || isStart) && styles.nchipTextOn]}>
                      {n.name}{isStart ? '  ·partida' : ''}
                    </Text>
                  </Hoverable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}><Text style={styles.lblText}>PONTO DE PARTIDA</Text></View>
            <View style={styles.pick}>
              {selectedNodes.map((n) => (
                <Hoverable key={n.id} onPress={() => { setStart(n.id); setSolved(false); }}
                  style={[styles.nchip, n.id === start && styles.nchipStart]}>
                  <Text style={[styles.nchipText, n.id === start && styles.nchipTextOn]}>{n.name}</Text>
                </Hoverable>
              ))}
            </View>
          </View>

          <View style={styles.block}>
            <View style={styles.lbl}><Text style={styles.lblText}>TIPO DE ROTA</Text></View>
            <View style={styles.radioRow}>
              {(['nn', '2opt'] as Algo[]).map((a, i) => (
                <Hoverable key={a} onPress={() => { setAlgo(a); }}
                  style={[styles.radioBtn, i === 0 && styles.radioBtnBorder, algo === a && styles.radioBtnOn]}>
                  <Text style={[styles.radioText, algo === a && styles.radioTextOn]}>
                    {a === 'nn' ? 'Rota simples' : 'Rota mais curta'}
                  </Text>
                </Hoverable>
              ))}
            </View>
          </View>

          <Button label="Montar minha rota" full disabled={selected.size < 2} onPress={() => setSolved(true)} />

          <View style={styles.itinHead}>
            <Text style={styles.itinTitle}>Roteiro</Text>
            {solved && result ? (
              <Text style={styles.algotag}>ordem de visita</Text>
            ) : null}
          </View>

          {order ? (
            <View>
              {order.map((n, i) => {
                const leg = i === 0 ? 0 : Math.round(distance(order[i - 1], n));
                const cum = order.slice(1, i + 1).reduce((s, m, j) => s + distance(order[j], m), 0);
                return (
                  <View key={n.id} style={styles.itinRow}>
                    <View style={[styles.ord, i === 0 && styles.ordStart]}><Text style={styles.ordText}>{i + 1}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itinName}>{n.name}</Text>
                      <Text style={styles.itinSub}>{(i === 0 ? 'partida' : n.city).toUpperCase()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.legSmall}>{i === 0 ? 'início' : `+${leg} km`}</Text>
                      <Text style={styles.legBig}>{Math.round(cum)} km</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIc}>⁂</Text>
              <Text style={styles.emptyText}>Selecione ao menos dois alambiques e calcule para ver a ordem de visita.</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  solver: { flexDirection: 'row', columnGap: 40, rowGap: 28, paddingTop: 40, alignItems: 'flex-start' },
  col: { flexDirection: 'column' },

  board: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 24, width: '100%' },
  boardInner: { width: '100%', aspectRatio: 6 / 5 },
  corner: { position: 'absolute', fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.inkSoft, zIndex: 3 },
  tl: { top: 0, left: 0 },
  tr: { top: 0, right: 0 },

  panel: { width: '100%' },
  metrics: { flexDirection: 'row', borderWidth: 1, borderColor: colors.rule, borderRadius: 8, overflow: 'hidden', marginBottom: 18 },
  metric: { flex: 1, paddingVertical: 16, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: colors.rule, backgroundColor: colors.paper },
  metricLast: { borderRightWidth: 0 },
  mv: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink },
  mvSaved: { color: colors.moss },
  mk: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 6 },

  block: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, paddingVertical: 20, paddingHorizontal: 22, marginBottom: 18, backgroundColor: colors.paper },
  lbl: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  lblText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, textTransform: 'uppercase' },

  pick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nchip: { borderWidth: 1, borderColor: colors.rule, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: colors.cream },
  nchipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  nchipStart: { backgroundColor: colors.red, borderColor: colors.redDeep },
  nchipText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.8, color: colors.inkSoft, textTransform: 'uppercase' },
  nchipTextOn: { color: colors.cream },

  radioRow: { flexDirection: 'row', borderWidth: 1, borderColor: colors.rule, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.cream },
  radioBtn: { flex: 1, paddingVertical: 11, paddingHorizontal: 8, alignItems: 'center' },
  radioBtnBorder: { borderRightWidth: 1, borderRightColor: colors.rule },
  radioBtnOn: { backgroundColor: colors.ink },
  radioText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft, textTransform: 'uppercase' },
  radioTextOn: { color: colors.cream },

  itinHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 30, marginBottom: 6 },
  itinTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 24, color: colors.ink },
  algotag: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.moss, textTransform: 'uppercase' },

  itinRow: { flexDirection: 'row', alignItems: 'center', columnGap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.rule },
  ord: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center' },
  ordStart: { backgroundColor: colors.ink },
  ordText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 14, color: colors.cream },
  itinName: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 17, color: colors.ink, fontWeight: '500' },
  itinSub: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 3 },
  legSmall: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.inkSoft },
  legBig: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 18, color: colors.ink },

  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIc: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 44, color: colors.copper, marginBottom: 10 },
  emptyText: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft, maxWidth: 260, textAlign: 'center' },
});
