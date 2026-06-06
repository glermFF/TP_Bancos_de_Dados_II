import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { Hoverable } from '../../components/Hoverable';
import { colors, fonts } from '../../theme';
import {
  ALAMBIQUES, REGION_FILTERS, CATEGORY_FILTERS, EXPERIENCE_FILTERS, RATING_FILTERS,
} from '../../data/alambiques';
import type { Alambique } from '../../data/types';
import { fetchAlambiques } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function FilterGroup({ title, opts }: { title: string; opts: { label: string; count: number; on?: boolean }[] }) {
  return (
    <View style={styles.grp}>
      <Text style={styles.grpHead}>{title.toUpperCase()}</Text>
      {opts.map((o) => (
        <Hoverable key={o.label} style={styles.opt}>
          {(hovered: boolean) => (
            <>
              <View style={styles.optName}>
                <View style={[styles.box, o.on && styles.boxOn]}>
                  {o.on && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.optLabel, (o.on || hovered) && styles.optLabelOn]}>{o.label}</Text>
              </View>
              <Text style={styles.optCount}>{o.count}</Text>
            </>
          )}
        </Hoverable>
      ))}
    </View>
  );
}

function NodeRow({ item }: { item: Alambique }) {
  const { width } = useWindowDimensions();
  const narrow = width <= 640;
  return (
    <Hoverable style={styles.row} hoverStyle={styles.rowHover}>
      {(hovered: boolean) => (
        <>
          <Text style={styles.idx}>{item.idx}</Text>
          <View style={styles.nameCell}>
            <Text style={[styles.name, hovered && styles.nameHover]}>{item.name}</Text>
            <View style={styles.props}>
              <Tag variant="label">{item.category}</Tag>
              {item.props.map((p) => <Tag key={p}>{p}</Tag>)}
            </View>
          </View>
          {!narrow && (
            <View style={styles.cityCell}>
              <Text style={styles.cityName}>{item.city}</Text>
              <Text style={styles.cityRegion}>{item.region.toUpperCase()}</Text>
            </View>
          )}
          {!narrow && <Text style={styles.cat}>{item.category}</Text>}
          <View style={styles.rateCell}>
            <Text style={styles.rate}>{item.rate.toFixed(1)}</Text>
            <Text style={styles.rateSmall}>{item.reviews} aval.</Text>
          </View>
          {!narrow && <Text style={[styles.go, hovered && styles.goHover]}>→</Text>}
        </>
      )}
    </Hoverable>
  );
}

export default function AlambiquesScreen() {
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;
  const nav = useNavigation<Nav>();
  const [list, setList] = useState<Alambique[]>(ALAMBIQUES);

  useEffect(() => {
    let alive = true;
    fetchAlambiques()
      .then((srv) => { if (alive && srv.length) setList(srv); })
      .catch(() => { /* keep mock data offline */ });
    return () => { alive = false; };
  }, []);

  return (
    <Screen active="Alambiques">
      <PageHead
        crumbs={[{ label: 'Mapa' }, { label: 'Alambiques' }, { label: 'todos os alambiques', current: true }]}
        title={['Os ', { em: 'alambiques.' }]}
        lede="Todos os alambiques de Minas que a gente visitou e provou, com nota, estilo e o que esperar de cada visita. Filtre por região e gosto, e escolha quais entram no seu roteiro."
      />

      <View style={[styles.catalog, stacked && styles.catalogStacked]}>
        <View style={[styles.rail, stacked && styles.railStacked]}>
          <FilterGroup title="Região" opts={REGION_FILTERS} />
          <FilterGroup title="Categoria" opts={CATEGORY_FILTERS} />
          <FilterGroup title="Experiência" opts={EXPERIENCE_FILTERS} />
          <FilterGroup title="Nota mínima" opts={RATING_FILTERS} />
        </View>

        <View style={styles.main}>
          <View style={styles.listTop}>
            <Text style={styles.count}>
              {list.length} <Text style={styles.countSmall}>de 147 alambiques</Text>
            </Text>
            <Text style={styles.view}>
              Ordenar: <Text style={styles.viewOn}>nota</Text> · distância · A–Z
            </Text>
          </View>

          {list.map((item) => <NodeRow key={item.id} item={item} />)}

          <View style={styles.catFoot}>
            <Text style={styles.more}>Mostrando {list.length} · mais 135 alambiques no guia</Text>
            <Button label="Carregar mais" arrow="↓" ghost />
          </View>

          <View style={styles.solverCard}>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.solverTitle}>Já tem seus favoritos?</Text>
              <Text style={styles.solverText}>
                Escolha os alambiques que quer conhecer e a gente monta a melhor ordem de visitar todos, gastando o mínimo de estrada.
              </Text>
            </View>
            <Button label="Montar a rota" ghost onDark onPress={() => nav.navigate('Rotas')} style={styles.solverBtn} />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  catalog: { flexDirection: 'row', columnGap: 48, paddingTop: 44 },
  catalogStacked: { flexDirection: 'column', rowGap: 24 },
  rail: { width: 230 },
  railStacked: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 8 },
  main: { flex: 1 },

  grp: { marginBottom: 28, minWidth: 200, flexGrow: 1 },
  grpHead: {
    fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.2, color: colors.inkSoft,
    marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
  optName: { flexDirection: 'row', alignItems: 'center', columnGap: 10 },
  box: { width: 14, height: 14, borderWidth: 1, borderColor: colors.rule, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.red, borderColor: colors.red },
  check: { color: colors.cream, fontSize: 9, fontFamily: fonts.mono },
  optLabel: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft },
  optLabelOn: { color: colors.ink },
  optCount: { fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft },

  listTop: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.ink,
  },
  count: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.ink },
  countSmall: { fontFamily: fonts.mono, fontStyle: 'normal', fontSize: 11, letterSpacing: 1.6, color: colors.inkSoft },
  view: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.8, color: colors.inkSoft, textTransform: 'uppercase' },
  viewOn: { color: colors.ink },

  row: {
    flexDirection: 'row', alignItems: 'center', columnGap: 22,
    paddingVertical: 22, paddingHorizontal: 6,
    borderBottomWidth: 1, borderBottomColor: colors.rule,
  },
  rowHover: { backgroundColor: colors.paper },
  idx: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.inkSoft, width: 40 },
  nameCell: { flex: 1.7, minWidth: 160 },
  name: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink, lineHeight: 28 },
  nameHover: { color: colors.red },
  props: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  cityCell: { flex: 1, minWidth: 110 },
  cityName: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, marginBottom: 4 },
  cityRegion: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, color: colors.inkSoft },
  cat: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 15, color: colors.inkSoft, width: 110 },
  rateCell: { width: 80, alignItems: 'flex-end' },
  rate: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink },
  rateSmall: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.inkSoft },
  go: { fontSize: 20, color: colors.inkSoft, width: 30, textAlign: 'center' },
  goHover: { color: colors.red },

  catFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 30, flexWrap: 'wrap', rowGap: 16 },
  more: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.8, color: colors.inkSoft, textTransform: 'uppercase' },

  solverCard: {
    backgroundColor: colors.ink, borderRadius: 8, paddingVertical: 34, paddingHorizontal: 36,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 24, rowGap: 18, flexWrap: 'wrap',
  },
  solverTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.cream, marginBottom: 8 },
  solverText: { fontFamily: fonts.serif, color: colors.onInkSoft, fontSize: 15, maxWidth: 420 },
  solverBtn: { borderColor: colors.cream },
});
