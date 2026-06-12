import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { Chip } from '../../components/Chip';
import { GateCard } from '../../components/GateCard';
import { Hoverable } from '../../components/Hoverable';
import { colors, fonts } from '../../theme';
import { FALLBACK_DISTILLERIES, FALLBACK_REVIEWS } from '../../data/fallback';
import type { Distillery, Review } from '../../data/types';
import * as apiService from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { formatDate, stars } from '../../lib/format';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const AVATAR_COLORS = [colors.copper, colors.red, colors.ink, colors.moss];

function ReviewCard({ review, index }: { review: Review; index: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={styles.avatarText}>{review.author.name.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.who}>{review.author.name}</Text>
          <Text style={styles.whoSub}>@{review.author.username.toUpperCase()} · {formatDate(review.createdAt).toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.cardStars}>{stars(review.rating)}</Text>
          <Text style={styles.cardRate}>{review.rating.toFixed(1)}</Text>
        </View>
      </View>
      <Text style={styles.place}>
        {review.distillery.name.toUpperCase()} · {review.distillery.city.toUpperCase()}
      </Text>
      <Text style={styles.cardTitle}>“{review.title}”</Text>
      <Text style={styles.cardBody}>{review.body}</Text>
    </View>
  );
}

function WriteNote({ distilleries, onCreated }: { distilleries: Distillery[]; onCreated: (r: Review) => void }) {
  const [distilleryId, setDistilleryId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (sending) return;
    setError(null);
    if (!distilleryId) { setError('Escolha o alambique desta nota.'); return; }
    setSending(true);
    try {
      onCreated(await apiService.createReview({ distilleryId, title, body, rating }));
      setTitle(''); setBody(''); setRating(5); setDistilleryId(null);
      setDone(true);
      setTimeout(() => setDone(false), 3500);
    } catch (err) {
      setError(apiService.apiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.write}>
      <Text style={styles.writeHead}>NOVA NOTA DE CAMPO</Text>

      <Text style={styles.pickLabel}>ALAMBIQUE</Text>
      <View style={styles.pickWrap}>
        {distilleries.map((d) => (
          <Chip
            key={d.id}
            label={`${d.city} · ${d.name.replace(/^Cachaça /, '')}`}
            on={d.id === distilleryId}
            onPress={() => setDistilleryId(d.id === distilleryId ? null : d.id)}
          />
        ))}
      </View>

      <Field label="Título" placeholder="Uma linha que resuma a visita" value={title} onChangeText={setTitle} />
      <Field
        label="A nota"
        placeholder="O que você provou? Quem serviu? O que o próximo viajante precisa saber?"
        value={body}
        onChangeText={setBody}
        multiline
      />

      <Text style={styles.pickLabel}>NOTA</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Hoverable key={n} onPress={() => setRating(n)}>
            <Text style={[styles.starBtn, n <= rating && styles.starOn]}>★</Text>
          </Hoverable>
        ))}
        <Text style={styles.starVal}>{rating.toFixed(1)}</Text>
      </View>

      {error ? <Text style={styles.formError}>{error}</Text> : null}
      {done ? <Text style={styles.formDone}>NOTA REGISTRADA — OBRIGADO, VIAJANTE.</Text> : null}
      <Button label={sending ? 'Registrando…' : 'Registrar nota'} full disabled={sending} onPress={submit} />
    </View>
  );
}

export default function JournalScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;

  const reviews = useFetch(() => apiService.fetchLatestReviews(20), FALLBACK_REVIEWS);
  const { data: distilleries } = useFetch(apiService.fetchAllDistilleries, FALLBACK_DISTILLERIES);

  const columns = useMemo(() => {
    if (stacked) return [reviews.data];
    const left: Review[] = [];
    const right: Review[] = [];
    reviews.data.forEach((r, i) => (i % 2 ? right : left).push(r));
    return [left, right];
  }, [reviews.data, stacked]);

  return (
    <Screen active="Journal">
      <PageHead
        crumbs={[{ label: 'Guia' }, { label: 'Diário', current: true }]}
        title={['Notas de ', { em: 'estrada.' }]}
        lede={`Notas de campo registradas pelos viajantes depois de cada visita — a memória viva do grafo. ${reviews.live ? '' : '(Dados de exemplo offline.)'}`}
      />

      <View style={[styles.layout, stacked && styles.colLayout]}>
        <View style={{ flex: 1.5, width: '100%' }}>
          <View style={[styles.cols, stacked && styles.colLayout]}>
            {columns.map((col, ci) => (
              <View key={ci} style={{ flex: 1, rowGap: 18 }}>
                {col.map((r, i) => <ReviewCard key={r.id} review={r} index={i * 2 + ci} />)}
              </View>
            ))}
          </View>
        </View>

        <View style={[{ width: '100%' }, !stacked && { width: 380, flexShrink: 0 }]}>
          {user ? (
            reviews.live ? (
              <WriteNote
                distilleries={distilleries}
                onCreated={(r) => reviews.setData((previous) => [r, ...previous])}
              />
            ) : (
              <GateCard
                icon="⚲"
                title="A API está fora do ar."
                text="Suba o backend (`make back`) para registrar novas notas no grafo."
              />
            )
          ) : (
            <GateCard
              icon="✎"
              title="Carregue seu próprio caderno."
              text="Entre na conta para registrar notas de campo, dar nota aos alambiques e construir uma reputação em que outros viajantes confiam."
            >
              <Button label="Entrar" full onPress={() => nav.navigate('SignIn')} />
              <Button label="Criar conta" ghost full onPress={() => nav.navigate('SignUp')} />
            </GateCard>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  layout: { flexDirection: 'row', columnGap: 44, rowGap: 32, paddingTop: 40, alignItems: 'flex-start' },
  colLayout: { flexDirection: 'column' },
  cols: { flexDirection: 'row', columnGap: 18, rowGap: 18, alignItems: 'flex-start' },

  card: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, backgroundColor: colors.paper, padding: 24 },
  cardHead: { flexDirection: 'row', alignItems: 'center', columnGap: 12, marginBottom: 14 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 17, color: colors.cream },
  who: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, fontWeight: '600' },
  whoSub: { fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1.2, color: colors.inkSoft, marginTop: 2 },
  cardStars: { fontSize: 11, color: colors.copper, letterSpacing: 2 },
  cardRate: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 16, color: colors.ink, marginTop: 2 },
  place: { fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1.4, color: colors.redDeep, marginBottom: 10 },
  cardTitle: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 21, color: colors.ink, lineHeight: 25, marginBottom: 8 },
  cardBody: { fontFamily: fonts.serif, fontSize: 14.5, lineHeight: 22, color: colors.inkSoft },

  write: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, backgroundColor: colors.paper, padding: 24 },
  writeHead: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 18 },
  pickLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 8 },
  pickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 },
  starRow: { flexDirection: 'row', alignItems: 'center', columnGap: 6, marginBottom: 18 },
  starBtn: { fontSize: 26, color: colors.rule },
  starOn: { color: colors.copper },
  starVal: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 18, color: colors.ink, marginLeft: 8 },
  formError: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.red, marginBottom: 12 },
  formDone: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.4, color: colors.moss, marginBottom: 12 },
});
