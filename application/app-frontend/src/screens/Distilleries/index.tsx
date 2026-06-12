import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Hoverable } from '../../components/Hoverable';
import { Tag } from '../../components/Tag';
import { Field } from '../../components/Field';
import { colors, fonts } from '../../theme';
import { FALLBACK_DISTILLERIES } from '../../data/fallback';
import type { Distillery } from '../../data/types';
import { fetchAllDistilleries } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { stars } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RatingFilter = 'any' | '4.0' | '4.5';

const PAGE_SIZE = 8;

function countBy(list: Distillery[], key: (d: Distillery) => string): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of list) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function FilterGroup({
  title,
  options,
  active,
  onPick,
}: {
  title: string;
  options: { key: string; label: string; count: number }[];
  active: string | null;
  onPick: (key: string | null) => void;
}) {
  return (
    <View style={styles.grp}>
      <Text style={styles.grpHead}>{title.toUpperCase()}</Text>
      {options.map((option) => {
        const on = active === option.key;
        return (
          <Hoverable key={option.key} style={styles.opt} onPress={() => onPick(on ? null : option.key)}>
            {(hovered: boolean) => (
              <>
                <View style={styles.optName}>
                  <View style={[styles.box, on && styles.boxOn]}>{on && <Text style={styles.check}>✓</Text>}</View>
                  <Text style={[styles.optLabel, (on || hovered) && styles.optLabelOn]}>{option.label}</Text>
                </View>
                <Text style={styles.optCount}>{option.count}</Text>
              </>
            )}
          </Hoverable>
        );
      })}
    </View>
  );
}

function Row({ item, index, onAdd }: { item: Distillery; index: number; onAdd: () => void }) {
  const { width } = useWindowDimensions();
  const narrow = width <= 760;
  return (
    <Hoverable style={[styles.row, narrow && styles.rowNarrow]} hoverStyle={styles.rowHover}>
      {(hovered: boolean) => (
        <>
          <Text style={styles.rowIdx}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={styles.rowMain}>
            <View style={styles.rowNameLine}>
              <Text style={[styles.rowName, hovered && { color: colors.red }]}>{item.name}</Text>
              {item.status === 'IN_VALIDATION' ? <Tag variant="route">em validação</Tag> : null}
            </View>
            <Text style={styles.rowCity}>
              {item.city.toUpperCase()} · {item.region.toUpperCase()}
              {item.founded ? ` · DESDE ${item.founded}` : ''}
            </Text>
            {item.signature ? <Text style={styles.rowSig}>“{item.signature}”</Text> : null}
            <View style={styles.rowTags}>
              <Tag variant="label">{item.category}</Tag>
              {item.tags.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}
            </View>
          </View>
          <View style={styles.rowSide}>
            <Text style={styles.rowRate}>{item.rating.toFixed(1)}</Text>
            <Text style={styles.rowStars}>{stars(item.rating)}</Text>
            <Text style={styles.rowReviews}>
              {item.reviewCount} {item.reviewCount === 1 ? 'NOTA DE CAMPO' : 'NOTAS DE CAMPO'}
            </Text>
            <Hoverable onPress={onAdd}>
              {(h: boolean) => (
                <Text style={[styles.rowAdd, h && { color: colors.cream, backgroundColor: colors.red, borderColor: colors.red }]}>
                  ADICIONAR À ROTA →
                </Text>
              )}
            </Hoverable>
          </View>
        </>
      )}
    </Hoverable>
  );
}

function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <View style={styles.pager}>
      <Hoverable onPress={page > 1 ? () => onPage(page - 1) : undefined}>
        {(h: boolean) => (
          <Text style={[styles.pagerBtn, page <= 1 && styles.pagerOff, h && page > 1 && { color: colors.red }]}>← ANTERIOR</Text>
        )}
      </Hoverable>
      <Text style={styles.pagerInfo}>PÁGINA {page} DE {totalPages}</Text>
      <Hoverable onPress={page < totalPages ? () => onPage(page + 1) : undefined}>
        {(h: boolean) => (
          <Text style={[styles.pagerBtn, page >= totalPages && styles.pagerOff, h && page < totalPages && { color: colors.red }]}>PRÓXIMA →</Text>
        )}
      </Hoverable>
    </View>
  );
}

export default function DistilleriesScreen() {
  const nav = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;

  const { data: all, live } = useFetch(fetchAllDistilleries, FALLBACK_DISTILLERIES);
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [rating, setRating] = useState<RatingFilter>('any');
  const [includePending, setIncludePending] = useState(true);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((d) => {
      if (!includePending && d.status === 'IN_VALIDATION') return false;
      if (region && d.region !== region) return false;
      if (category && d.category !== category) return false;
      if (rating !== 'any' && d.rating < Number(rating)) return false;
      if (q && !`${d.name} ${d.city} ${d.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, query, region, category, rating, includePending]);

  const totalPages = Math.max(Math.ceil(filtered.length / PAGE_SIZE), 1);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [query, region, category, rating, includePending]);

  return (
    <Screen active="Distilleries">
      <PageHead
        crumbs={[{ label: 'Guia' }, { label: 'Alambiques', current: true }]}
        title={['Cada alambique ', { em: 'no mapa.' }]}
        lede={`O catálogo por trás do grafo — ${all.length} alambiques em cidades reais de Minas Gerais, cada um pronto para entrar na sua rota. ${live ? '' : '(Dados de exemplo offline.)'}`}
      />

      <View style={styles.suggestRow}>
        <Text style={styles.suggestText}>Conhece um alambique que não está aqui?</Text>
        <Button label="Indicar alambique" ghost onPress={() => nav.navigate('SuggestPlace')} />
      </View>

      <View style={[styles.layout, stacked && styles.colLayout]}>
        <View style={[styles.rail, !stacked && styles.railWide]}>
          <FilterGroup
            title="Região"
            options={countBy(all, (d) => d.region).map(([key, count]) => ({ key, label: key, count }))}
            active={region}
            onPick={setRegion}
          />
          <FilterGroup
            title="Categoria"
            options={countBy(all, (d) => d.category).map(([key, count]) => ({ key, label: key, count }))}
            active={category}
            onPick={setCategory}
          />
          <FilterGroup
            title="Nota"
            options={[
              { key: '4.5', label: '★ 4,5 ou mais', count: all.filter((d) => d.rating >= 4.5).length },
              { key: '4.0', label: '★ 4,0 ou mais', count: all.filter((d) => d.rating >= 4).length },
            ]}
            active={rating === 'any' ? null : rating}
            onPick={(key) => setRating((key as RatingFilter) ?? 'any')}
          />
          <FilterGroup
            title="Confiança (RN06)"
            options={[{
              key: 'pending',
              label: 'Incluir “em validação”',
              count: all.filter((d) => d.status === 'IN_VALIDATION').length,
            }]}
            active={includePending ? 'pending' : null}
            onPick={(key) => setIncludePending(key === 'pending')}
          />
        </View>

        <View style={{ flex: 1, width: '100%' }}>
          <Field
            label={`Busca · ${filtered.length} de ${all.length} exibidos`}
            placeholder="Nome, cidade ou região…"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {pageItems.map((d, i) => (
            <Row
              key={d.id}
              item={d}
              index={(page - 1) * PAGE_SIZE + i}
              onAdd={() => nav.navigate('RoutePlanner', { preselect: d.id })}
            />
          ))}
          <Pager page={page} totalPages={totalPages} onPage={setPage} />
          {!filtered.length ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIc}>∅</Text>
              <Text style={styles.emptyText}>Nada combina com esses filtros. Afrouxe um deles e tente de novo.</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  suggestRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', columnGap: 16, rowGap: 12, paddingTop: 26, paddingBottom: 4,
  },
  suggestText: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 17, color: colors.inkSoft },
  layout: { flexDirection: 'row', columnGap: 44, rowGap: 32, paddingTop: 40, alignItems: 'flex-start' },
  colLayout: { flexDirection: 'column' },
  rail: { width: '100%' },
  railWide: { width: 250, flexShrink: 0 },

  grp: { borderBottomWidth: 1, borderBottomColor: colors.rule, paddingBottom: 18, marginBottom: 18 },
  grpHead: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 12 },
  opt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
  optName: { flexDirection: 'row', alignItems: 'center', columnGap: 10, flexShrink: 1 },
  box: { width: 15, height: 15, borderWidth: 1, borderColor: colors.rule, borderRadius: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  boxOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  check: { color: colors.cream, fontSize: 9, lineHeight: 11 },
  optLabel: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.inkSoft },
  optLabelOn: { color: colors.ink },
  optCount: { fontFamily: fonts.mono, fontSize: 10, color: colors.inkSoft },

  row: {
    flexDirection: 'row', alignItems: 'flex-start', columnGap: 20,
    borderWidth: 1, borderColor: colors.rule, borderRadius: 8,
    backgroundColor: colors.paper, padding: 22, marginBottom: 14,
  },
  rowNarrow: { flexWrap: 'wrap', rowGap: 14 },
  rowHover: { borderColor: colors.ink },
  rowIdx: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, color: colors.copper, width: 36 },
  rowMain: { flex: 1, minWidth: 220 },
  rowNameLine: { flexDirection: 'row', alignItems: 'center', columnGap: 10, flexWrap: 'wrap', rowGap: 6 },
  rowName: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 23, color: colors.ink, lineHeight: 27 },
  rowCity: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.inkSoft, marginTop: 6 },
  rowSig: { fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 14, color: colors.copperDeep, marginTop: 8 },
  rowTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  rowSide: { alignItems: 'flex-end', rowGap: 4 },
  rowRate: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 30, color: colors.ink },
  rowStars: { fontSize: 11, color: colors.copper, letterSpacing: 2 },
  rowReviews: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkSoft },
  rowAdd: {
    fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.6, color: colors.ink,
    borderWidth: 1, borderColor: colors.ink, borderRadius: 999,
    paddingVertical: 7, paddingHorizontal: 12, marginTop: 8, overflow: 'hidden',
  },

  pager: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.rule, borderRadius: 8,
    backgroundColor: colors.paper, paddingVertical: 14, paddingHorizontal: 20, marginTop: 6,
  },
  pagerBtn: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.6, color: colors.ink },
  pagerOff: { opacity: 0.3 },
  pagerInfo: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.6, color: colors.inkSoft },

  empty: { alignItems: 'center', paddingVertical: 50 },
  emptyIc: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.copper, marginBottom: 8 },
  emptyText: { fontFamily: fonts.serif, fontSize: 15, color: colors.inkSoft },
});
