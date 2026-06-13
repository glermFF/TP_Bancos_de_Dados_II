import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
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
import { copy } from '../../copy/strings';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const narrow = width <= 1080;
  const nav = useNavigation<Nav>();
  const h1 = Math.max(52, Math.min(112, width * 0.072));
  const { data: stats, live } = useFetch(fetchStats, FALLBACK_STATS);
  const { data: distilleries } = useFetch(fetchAllDistilleries, FALLBACK_DISTILLERIES);
  const featured = distilleries.slice(0, 3);
  const statItems = [
    { v: String(stats.distilleries), k: copy.home.statLabels[0] },
    { v: String(stats.cities), k: copy.home.statLabels[1] },
    { v: String(stats.reviews), k: copy.home.statLabels[2] },
    { v: String(stats.regions), k: copy.home.statLabels[3] },
  ];

  return (
    <Screen active="Home">
      <View style={[styles.hero, narrow && styles.col]}>
        <View style={{ flex: 1.05 }}>
          <Text style={styles.kicker}>{copy.home.kicker(live)}</Text>
          <Text style={[styles.h1, { fontSize: h1, lineHeight: h1 * 0.92 }]}>
            A rota mais rápida{'\n'}pelas terras da <Text style={styles.h1Em}>cachaça.</Text>
          </Text>
          <Text style={styles.lede}>
            Escolha os alambiques que quer conhecer e o guia calcula a
            <Text style={styles.em}> ordem mais esperta</Text> de visitar todos — estradas reais,
            alambiques reais, o mínimo de asfalto entre você e o próximo gole.
          </Text>
          <View style={styles.heroBtns}>
            <Button label={copy.home.ctaRoute} onPress={() => nav.navigate('RoutePlanner')} />
            <Button label={copy.home.ctaExplore} ghost onPress={() => nav.navigate('Distilleries')} />
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {statItems.map((s, i) => (
          <View key={s.k} style={[styles.stat, i < statItems.length - 1 && styles.statBorder]}>
            <Text style={styles.statV}>{s.v}</Text>
            <Text style={styles.statK}>{s.k}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.featHead}>
          <Text style={styles.featTitle}>{copy.home.featTitle}</Text>
          <Hoverable onPress={() => nav.navigate('Distilleries')}>
            {(h: boolean) => <Text style={[styles.featLink, h && { color: colors.red }]}>{copy.home.featLink(stats.distilleries)}</Text>}
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

      <View style={styles.how}>
        {copy.home.steps.map((step, i) => (
          <View key={step.n} style={[styles.howItem, i < 2 && !narrow && styles.howBorder]}>
            <Text style={styles.howN}>{step.n}</Text>
            <Text style={styles.howT}>{step.t}</Text>
            <Text style={styles.howP}>{step.p}</Text>
          </View>
        ))}
      </View>

      <View style={styles.teaser}>
        <View style={{ flex: 1, minWidth: 260 }}>
          <Text style={styles.teaserH}>Você escolhe.{'\n'}O grafo traça.</Text>
          <Text style={styles.teaserP}>{copy.home.teaserP}</Text>
          <Button label={copy.home.teaserCta} ghost onDark onPress={() => nav.navigate('RoutePlanner')} />
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
  teaser: { backgroundColor: colors.ink, borderRadius: 10, paddingVertical: 48, paddingHorizontal: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', columnGap: 40, rowGap: 28, flexWrap: 'wrap' },
  teaserH: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.cream, marginBottom: 16 },
  teaserP: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 27, color: colors.onInkSoft, maxWidth: 460, marginBottom: 24 },
  teaserBig: { fontFamily: fonts.mono, fontSize: 22, lineHeight: 34, color: colors.copper, letterSpacing: 1 },
});
