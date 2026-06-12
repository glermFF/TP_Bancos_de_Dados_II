import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { SectionHead } from '../../components/SectionHead';
import { colors, fonts } from '../../theme';

const STACK = [
  { layer: 'Frontend', tech: 'Expo / React Native Web · TypeScript · Leaflet' },
  { layer: 'Backend', tech: 'Node.js · Express · autenticação JWT · camadas MSC' },
  { layer: 'Banco', tech: 'Neo4j 5 — grafo de propriedades + point.distance espacial' },
  { layer: 'Roteamento', tech: 'Heurísticas de TSP (vizinho mais próximo, 2-opt) · geometria viária OSRM' },
  { layer: 'Infra', tech: 'Docker / Podman compose · Makefile · demo em localhost' },
];

const RULES = [
  { id: 'RN04', text: 'Qualquer viajante logado pode indicar um novo alambique, marcado por coordenadas no mapa.' },
  { id: 'RN05', text: 'Toda indicação entra em quarentena como EM VALIDAÇÃO até ser confirmada.' },
  { id: 'RN06', text: 'O catálogo permite incluir ou esconder paradas em quarentena.' },
  { id: 'RN07', text: 'Os pesos das arestas são recalculados a cada requisição a partir dos dados espaciais do grafo.' },
  { id: 'RN09', text: 'Viajantes constroem reputação; validações de quem tem confiança valem mais.' },
];

/** Diagrama do grafo: (User)-[:WROTE]->(Review)-[:ABOUT]->(Distillery)-[:LOCATED_IN]->(City) */
function GraphFigure() {
  const nodes = [
    { id: 'User', x: 80, y: 70, fill: colors.moss },
    { id: 'Review', x: 240, y: 150, fill: colors.copper },
    { id: 'Distillery', x: 420, y: 70, fill: colors.red },
    { id: 'City', x: 560, y: 160, fill: colors.ink },
  ];
  const edges = [
    { from: 0, to: 1, label: ':WROTE' },
    { from: 1, to: 2, label: ':ABOUT' },
    { from: 2, to: 3, label: ':LOCATED_IN' },
    { from: 0, to: 2, label: ':SUGGESTED' },
  ];
  return (
    <View style={styles.figure}>
      <Text style={[styles.figCorner, { top: 14, left: 18 }]}>FIG. 03 — MODELO DE GRAFO DE PROPRIEDADES</Text>
      <Text style={[styles.figCorner, { top: 14, right: 18 }]}>(:City)-[:ROAD {'{km}'}]-(:City)</Text>
      <View style={{ width: '100%', aspectRatio: 640 / 230 }}>
        <Svg viewBox="0 0 640 230" width="100%" height="100%">
          {edges.map((e, i) => {
            const a = nodes[e.from];
            const b = nodes[e.to];
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            return (
              <G key={i}>
                <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.ink} strokeWidth={1} opacity={0.35} />
                <SvgText x={mx} y={my - 8} fill={colors.inkSoft} fontSize={9} fontFamily={fonts.mono} textAnchor="middle">{e.label}</SvgText>
              </G>
            );
          })}
          {nodes.map((n) => (
            <G key={n.id}>
              <Circle cx={n.x} cy={n.y} r={26} fill={n.fill} stroke={colors.paper} strokeWidth={2} />
              <SvgText x={n.x} y={n.y + 3.5} fill={colors.cream} fontSize={10} fontFamily={fonts.mono} textAnchor="middle">{`:${n.id}`}</SvgText>
            </G>
          ))}
        </Svg>
      </View>
    </View>
  );
}

export default function AboutScreen() {
  const { width } = useWindowDimensions();
  const narrow = width <= 1080;

  return (
    <Screen active="About">
      <PageHead
        crumbs={[{ label: 'Guia' }, { label: 'Sobre', current: true }]}
        title={['Estradas como ', { em: 'relacionamentos.' }]}
        lede="O Cachaceiro Viajante é um trabalho da disciplina de Banco de Dados II (UFOP) que trata uma viagem de cachaça do jeito que um banco de grafos trata o mundo: lugares são nós, estradas são relacionamentos, e o melhor roteiro é uma pergunta feita ao grafo."
      />

      <View style={styles.section}>
        <SectionHead title="O modelo." sub="UM GRAFO, QUATRO RÓTULOS, COORDENADAS REAIS" />
        <GraphFigure />
        <View style={[styles.split, narrow && styles.col]}>
          <Text style={styles.body}>
            Cada alambique é um nó <Text style={styles.codeInk}>(:Distillery)</Text> com uma
            localização <Text style={styles.codeInk}>point</Text> WGS-84 real, ligado por
            <Text style={styles.codeInk}> [:LOCATED_IN]</Text> à sua cidade. As cidades se
            conectam às vizinhas mais próximas por arestas
            <Text style={styles.codeInk}> [:ROAD {'{km}'}]</Text> — uma malha de asfalto
            mineiro vivendo dentro do Neo4j.
          </Text>
          <Text style={styles.body}>
            Quando você traça uma viagem, a API pede ao banco a matriz de
            <Text style={styles.codeInk}> point.distance</Text> entre as paradas, corrige pelo
            fator de estrada de serra e roda heurísticas de caixeiro-viajante —
            vizinho mais próximo pela velocidade, 2-opt pelo caminho mais curto. A
            resposta volta como roteiro ordenado e o OSRM ajusta o traçado às
            rodovias reais.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHead title="A arquitetura." sub="MONÓLITO MODULAR · CAMADAS MSC" />
        {STACK.map((row, i) => (
          <View key={row.layer} style={[styles.stackRow, i === 0 && styles.stackRowFirst]}>
            <Text style={styles.stackLayer}>{row.layer.toUpperCase()}</Text>
            <Text style={styles.stackTech}>{row.tech}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionHead title="Regras da casa." sub="REGRAS DE NEGÓCIO QUE O GRAFO IMPÕE" />
        <View style={[styles.rules, narrow && styles.col]}>
          {RULES.map((rule) => (
            <View key={rule.id} style={styles.rule}>
              <Text style={styles.ruleId}>{rule.id}</Text>
              <Text style={styles.ruleText}>{rule.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.credit}>
        <Text style={styles.creditBig}>UFOP · BANCO DE DADOS II</Text>
        <Text style={styles.creditText}>
          Construído como trabalho prático: uma demonstração full-stack de modelagem em
          grafo, Cypher, consultas espaciais e otimização de rotas — embrulhada num
          almanaque de estrada.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column' },
  section: { paddingTop: 48, paddingBottom: 8 },

  figure: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 24, paddingTop: 40, marginBottom: 28 },
  figCorner: { position: 'absolute', fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.6, color: colors.inkSoft, zIndex: 2 },

  split: { flexDirection: 'row', columnGap: 40, rowGap: 20 },
  body: { flex: 1, fontFamily: fonts.serif, fontSize: 16.5, lineHeight: 26, color: colors.inkSoft, minWidth: 260 },
  codeInk: { fontFamily: fonts.mono, fontSize: 13.5, color: colors.redDeep },

  stackRow: {
    flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 4,
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  stackRowFirst: { borderTopWidth: 1, borderTopColor: colors.rule },
  stackLayer: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: colors.inkSoft, width: 130 },
  stackTech: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, flexShrink: 1 },

  rules: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 18 },
  rule: { flexGrow: 1, flexBasis: '30%', minWidth: 240, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, backgroundColor: colors.paper, padding: 22 },
  ruleId: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, color: colors.copper, marginBottom: 8 },
  ruleText: { fontFamily: fonts.serif, fontSize: 14.5, lineHeight: 22, color: colors.inkSoft },

  credit: { backgroundColor: colors.ink, borderRadius: 10, padding: 40, marginTop: 48 },
  creditBig: { fontFamily: fonts.mono, fontSize: 12, letterSpacing: 3, color: colors.copper, marginBottom: 12 },
  creditText: { fontFamily: fonts.serif, fontSize: 16, lineHeight: 25, color: colors.onInkSoft, maxWidth: 560 },
});
