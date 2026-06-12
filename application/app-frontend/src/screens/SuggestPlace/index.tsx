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
    if (!pin) {
      setError('Marque o ponto no mapa — clique onde fica o alambique.');
      return;
    }
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
      crumbs={[{ label: 'Guia' }, { label: 'Indicar alambique', current: true }]}
      title={['Finque o pino, ', { em: 'conte o causo.' }]}
      lede="Clique no mapa exatamente onde fica o alambique, preencha a ficha e envie. A indicação entra no grafo como EM VALIDAÇÃO até a comunidade confirmar (RN04 / RN05)."
    />
  );

  if (!user) {
    return (
      <Screen active="SuggestPlace">
        {head}
        <View style={{ maxWidth: 560, marginTop: 40 }}>
          <GateCard
            icon="⚲"
            title="Só viajantes identificados indicam paradas."
            text="Entre na sua conta (ou crie uma) para marcar o ponto no mapa e enviar a indicação."
          >
            <Button label="Entrar" onPress={() => nav.navigate('SignIn')} />
            <Button label="Criar conta" ghost onPress={() => nav.navigate('SignUp')} />
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
            headLeft="FIG. 04 — APONTE O LUGAR"
            headRight={`${pin ? 'PONTO MARCADO ✛' : 'CLIQUE NO MAPA'} · N ↑`}
            footLeft={coords ? `COORDENADAS ${coords}` : 'AGUARDANDO PONTO…'}
            footRight="TILES © OPENSTREETMAP · CARTO"
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
            <Text style={styles.formHead}>FICHA DE INDICAÇÃO</Text>
            {error ? <Text style={styles.formError}>{error}</Text> : null}
            <Field label="Nome do alambique" placeholder="Alambique do Serjão" value={name} onChangeText={setName} />
            <Field label="Cidade" placeholder="Ouro Preto" value={city} onChangeText={setCity} />

            <Text style={styles.pickLabel}>CATEGORIA</Text>
            <View style={styles.pickWrap}>
              {CATEGORIES.map((option) => (
                <Chip key={option} label={option} on={option === category} onPress={() => setCategory(option)} />
              ))}
            </View>

            <Field label="Coordenadas (clique no mapa)" placeholder="—" value={coords} editable={false} />

            <Button label={busy ? 'Enviando…' : 'Enviar indicação'} full disabled={busy} onPress={submit} />
            <Text style={styles.note}>
              A indicação fica visível no catálogo com o selo “em validação” até ser
              confirmada por outros viajantes ou pela curadoria.
            </Text>
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
  formError: {
    fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.cream,
    backgroundColor: colors.red, borderRadius: 4,
    paddingVertical: 9, paddingHorizontal: 12, marginBottom: 16, overflow: 'hidden',
  },
  pickLabel: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 8 },
  pickWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  note: { fontFamily: fonts.serif, fontSize: 13.5, lineHeight: 20, color: colors.inkSoft, marginTop: 16, fontStyle: 'italic' },
});
