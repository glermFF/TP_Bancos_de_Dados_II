import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Field } from '../../components/Field';
import { Chip } from '../../components/Chip';
import { MapBoard } from '../../components/MapBoard';
import { GateCard } from '../../components/GateCard';
import RouteMap from '../../components/RouteMap';
import { colors, fonts } from '../../theme';
import { CATEGORIES } from '../../data/fallback';
import * as apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { copy } from '../../copy/strings';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SuggestPlaceScreen() {
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const stacked = width <= 1080;
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const coords = pin ? `${pin.latitude.toFixed(5)}, ${pin.longitude.toFixed(5)}` : '';

  async function submit() {
    if (busy) return;
    setError(null);
    if (!pin) { setError(copy.suggest.needPin); return; }
    setBusy(true);
    try {
      await apiService.suggestDistillery({ name, city, category, ...pin });
      nav.navigate('Distilleries');
    } catch (err) {
      setError(apiService.apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const head = (
    <PageHead
      crumbs={[{ label: copy.crumbGuia }, { label: 'Indicar alambique', current: true }]}
      title={copy.suggest.title}
      lede={copy.suggest.lede}
    />
  );

  if (!user) {
    return (
      <Screen active="SuggestPlace">
        {head}
        <View style={{ maxWidth: 560, marginTop: 40 }}>
          <GateCard
            icon="⚲"
            title={copy.suggest.gateTitle}
            text={copy.suggest.gateText}
          >
            <Button label={copy.gate.enter} onPress={() => nav.navigate('SignIn')} />
            <Button label={copy.gate.create} ghost onPress={() => nav.navigate('SignUp')} />
          </GateCard>
        </View>
      </Screen>
    );
  }

  return (
    <Screen active="SuggestPlace">
      {head}
      <View style={[styles.layout, stacked && styles.col]}>
        <View style={[{ width: '100%' }, !stacked && { flex: 1.4 }]}>
          <MapBoard
            headLeft={copy.suggest.mapHeadLeft}
            headRight={`${pin ? copy.suggest.mapPinned : copy.suggest.mapClick} · N ↑`}
            footLeft={coords ? copy.suggest.coords(coords) : copy.suggest.waitingPin}
            footRight={copy.suggest.tiles}
          >
            <RouteMap
              stops={[]}
              routeLatLngs={null}
              straightPath={null}
              onMapClick={(latitude, longitude) => setPin({ latitude, longitude })}
              draftPin={pin}
            />
          </MapBoard>
        </View>
        <View style={[{ width: '100%' }, !stacked && { flex: 1 }]}>
          <View style={styles.form}>
            <Text style={styles.formHead}>{copy.suggest.formHead}</Text>
            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <Field label={copy.suggest.nameLabel} placeholder={copy.suggest.namePlaceholder} value={name} onChangeText={setName} />
            <Field label={copy.suggest.cityLabel} placeholder={copy.suggest.cityPlaceholder} value={city} onChangeText={setCity} />
            <Text style={styles.pickLabel}>{copy.suggest.categoryLabel}</Text>
            <View style={styles.pickWrap}>
              {CATEGORIES.map((option) => (
                <Chip key={option} label={option} on={option === category} onPress={() => setCategory(option)} />
              ))}
            </View>
            <Field label={copy.suggest.coordsLabel} placeholder="—" value={coords} editable={false} />
            <Button label={busy ? copy.suggest.submitting : copy.suggest.submit} full disabled={busy} onPress={submit} />
            <Text style={styles.note}>{copy.suggest.note}</Text>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  col: { flexDirection: 'column' },
  layout: { flexDirection: 'row', columnGap: 40, rowGap: 28, paddingTop: 40, alignItems: 'flex-start' },
  form: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, backgroundColor: colors.paper, padding: 24 },
  formHead: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 18 },
  formError: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.cream, backgroundColor: colors.red, borderRadius: 4, paddingVertical: 9, paddingHorizontal: 12, marginBottom: 16, overflow: 'hidden' },
  pickLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 8 },
  pickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  note: { fontFamily: fonts.serif, fontSize: 13.5, lineHeight: 20, color: colors.inkSoft, marginTop: 16, fontStyle: 'italic' },
});
