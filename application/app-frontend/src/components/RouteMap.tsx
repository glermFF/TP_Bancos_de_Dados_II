import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import type { RouteMapProps } from './RouteMap.types';

export default function RouteMap({ stops }: RouteMapProps) {
  const selected = stops.filter((s) => s.selected);
  return (
    <View style={styles.box}>
      <Text style={styles.head}>MAPA DE CAMPO · SOMENTE WEB</Text>
      <Text style={styles.body}>
        O mapa interativo de Minas Gerais é renderizado na versão web (`make front`).
        {'\n'}Paradas selecionadas: {selected.length ? selected.map((s) => s.name).join(' · ') : 'nenhuma ainda'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, minHeight: 320, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.paper },
  head: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 12 },
  body: { fontFamily: fonts.serif, fontSize: 14, lineHeight: 21, color: colors.inkSoft, textAlign: 'center' },
});
