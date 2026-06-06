import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { colors, fonts } from '../../theme';
import { REVIEWS, RATING_AGG } from '../../data/reviews';
import type { Review } from '../../data/types';
import { stars } from '../../lib/format';

const AVATAR_BG: Record<Review['avatar'], string> = {
  copper: colors.copper, red: colors.red, ink: colors.ink,
};

function Entry({ r }: { r: Review }) {
  return (
    <View style={styles.entry}>
      <View style={[styles.av, { backgroundColor: AVATAR_BG[r.avatar] }]}>
        <Text style={styles.avText}>{r.who[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.head}>
          <Text style={styles.who}>
            {r.who} <Text style={styles.whoFrom}>{r.from.toUpperCase()}</Text>
          </Text>
          <Text style={styles.stars}>{stars(r.stars)}</Text>
        </View>
        <View style={styles.at}>
          <View style={styles.pin} />
          <Text style={styles.atText}>em <Text style={styles.place}>{r.place}</Text> · {r.when}</Text>
        </View>
        <Text style={styles.body}>
          <Text style={styles.bodyLead}>{r.bodyLead}</Text>{r.body}
        </Text>
        <View style={styles.tags}>
          {r.tags.map((t, i) => (
            <View key={i} style={[styles.etag, t.route && styles.etagRoute]}>
              <Text style={[styles.etagText, t.route && styles.etagTextRoute]}>{t.label.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <View style={styles.react}>
          <Text style={styles.reactItem}>▲ ÚTIL · {r.useful}</Text>
          <Text style={styles.reactItem}>↩ RESPONDER</Text>
          <Text style={styles.reactItem}>✦ SALVAR</Text>
        </View>
      </View>
    </View>
  );
}

export default function DiarioScreen() {
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;

  return (
    <Screen active="Diario">
      <PageHead
        crumbs={[{ label: 'Mapa' }, { label: 'Diário' }, { label: 'caderno dos viajantes', current: true }]}
        title={['O ', { em: 'diário' }, '\nde bordo.']}
        lede="As avaliações de quem já rodou as estradas de Minas. Notas, prosas e fotos da comunidade — é aqui que você descobre quais alambiques valem mesmo o desvio."
      />

      <View style={[styles.diary, stacked && styles.diaryStacked]}>
        <View style={styles.feed}>
          <View style={styles.feedTop}>
            <Text style={styles.c}>9.842 <Text style={styles.cSmall}>relatos no caderno</Text></Text>
            <Text style={styles.sortbar}>Ordenar: <Text style={styles.sortOn}>recentes</Text> · nota · úteis</Text>
          </View>
          {REVIEWS.map((r) => <Entry key={r.id} r={r} />)}
          <View style={styles.loadFoot}>
            <Button label="Carregar mais relatos" arrow="↓" ghost />
          </View>
        </View>

        <View style={[styles.rail, stacked && styles.railStacked]}>
          <View style={styles.aggCard}>
            <View style={styles.aggTop}>
              <Text style={styles.aggBig}>{RATING_AGG.avg.toFixed(2)}</Text>
              <Text style={styles.aggStars}>★ ★ ★ ★ ★</Text>
              <Text style={styles.aggN}>{RATING_AGG.total.toLocaleString('pt-BR')} AVALIAÇÕES DA COMUNIDADE</Text>
            </View>
            <View style={styles.bars}>
              {RATING_AGG.bars.map((b) => (
                <View key={b.star} style={styles.bar}>
                  <Text style={styles.barStar}>{b.star}★</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, b.hi && styles.fillHi, { width: `${b.pct}%` }]} />
                  </View>
                  <Text style={styles.barPct}>{Math.round(b.pct)}%</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={styles.facetHead}>FILTRAR RELATOS</Text>
          {RATING_AGG.facets.map((f) => (
            <Hoverable key={f.label} style={styles.facet}>
              {(hovered: boolean) => (
                <>
                  <Text style={[styles.facetLabel, (f.on || hovered) && styles.facetOn]}>{f.label}</Text>
                  <Text style={styles.facetCount}>{f.count.toLocaleString('pt-BR')}</Text>
                </>
              )}
            </Hoverable>
          ))}

          <View style={styles.writeCard}>
            <Text style={styles.writeTitle}>Rodou alguma rota?</Text>
            <Text style={styles.writeText}>
              Conte como foi. Cada relato ajuda a próxima pessoa a montar um roteiro ainda melhor.
            </Text>
            <Button label="Escrever no caderno" full invert />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  diary: { flexDirection: 'row', columnGap: 56, paddingTop: 44, alignItems: 'flex-start' },
  diaryStacked: { flexDirection: 'column-reverse', rowGap: 32 },
  feed: { flex: 1 },
  rail: { width: 300 },
  railStacked: { width: '100%' },

  feedTop: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.ink,
  },
  c: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 28, color: colors.ink },
  cSmall: { fontFamily: fonts.mono, fontStyle: 'normal', fontSize: 11, letterSpacing: 1.6, color: colors.inkSoft },
  sortbar: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.6, color: colors.inkSoft, textTransform: 'uppercase' },
  sortOn: { color: colors.ink },

  entry: { flexDirection: 'row', columnGap: 22, paddingVertical: 30, borderBottomWidth: 1, borderBottomColor: colors.rule },
  av: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 20, color: colors.cream },
  head: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', columnGap: 14, flexWrap: 'wrap', marginBottom: 6 },
  who: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 18, color: colors.ink, fontWeight: '500' },
  whoFrom: { fontFamily: fonts.mono, fontStyle: 'normal', fontSize: 9.5, letterSpacing: 1.6, color: colors.inkSoft },
  stars: { fontFamily: fonts.display, fontStyle: 'italic', letterSpacing: 3, color: colors.copper, fontSize: 17 },
  at: { flexDirection: 'row', alignItems: 'center', columnGap: 8, marginBottom: 12 },
  pin: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.red },
  atText: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.4, color: colors.inkSoft, textTransform: 'uppercase' },
  place: { color: colors.ink },
  body: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 28, color: colors.ink, marginBottom: 14 },
  bodyLead: { fontFamily: fonts.display, fontStyle: 'italic' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  etag: { borderWidth: 1, borderColor: colors.rule, borderRadius: 3, paddingVertical: 3, paddingHorizontal: 8 },
  etagRoute: { borderColor: 'rgba(91,107,60,.4)' },
  etagText: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkSoft },
  etagTextRoute: { color: colors.moss },
  react: { flexDirection: 'row', columnGap: 22, flexWrap: 'wrap', rowGap: 6 },
  reactItem: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft },

  loadFoot: { alignItems: 'center', paddingTop: 34 },

  aggCard: { borderWidth: 1, borderColor: colors.ink, borderRadius: 8, overflow: 'hidden', marginBottom: 22 },
  aggTop: { backgroundColor: colors.ink, paddingVertical: 26, paddingHorizontal: 24, alignItems: 'center' },
  aggBig: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 64, lineHeight: 64, color: colors.cream },
  aggStars: { color: colors.copper, letterSpacing: 4, fontSize: 18, marginTop: 4 },
  aggN: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.6, color: colors.onInkFaint, marginTop: 8 },
  bars: { paddingVertical: 18, paddingHorizontal: 22, backgroundColor: colors.paper },
  bar: { flexDirection: 'row', alignItems: 'center', columnGap: 10, paddingVertical: 4 },
  barStar: { width: 28, fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft },
  track: { flex: 1, height: 6, backgroundColor: colors.creamDeep, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.copper },
  fillHi: { backgroundColor: colors.red },
  barPct: { width: 36, textAlign: 'right', fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft },

  facetHead: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2.2, color: colors.inkSoft, marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.rule },
  facet: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 7 },
  facetLabel: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft },
  facetOn: { color: colors.ink },
  facetCount: { fontFamily: fonts.mono, fontSize: 11, color: colors.inkSoft },

  writeCard: { backgroundColor: colors.red, borderRadius: 8, padding: 24, marginTop: 22 },
  writeTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, color: colors.cream, marginBottom: 8 },
  writeText: { fontFamily: fonts.serif, fontSize: 14, color: 'rgba(242,234,216,.8)', marginBottom: 16 },
  writeBtn: { backgroundColor: colors.cream, borderColor: colors.cream },
});
