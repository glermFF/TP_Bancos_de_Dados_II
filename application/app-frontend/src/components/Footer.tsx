import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts } from '../theme';
import { Hoverable } from './Hoverable';
import { copy } from '../copy/strings';
import type { RootStackParamList, RouteName } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Link = { label: string; to?: RouteName };

const COLUMNS: { head: string; links: Link[] }[] = [
  { head: 'Explorar', links: [
    { label: 'Mapa de Minas', to: 'Home' },
    { label: 'Todos os alambiques', to: 'Distilleries' },
    { label: 'Montar uma rota', to: 'RoutePlanner' },
    { label: 'Diário de bordo', to: 'Journal' },
  ] },
  { head: 'O guia', links: [
    { label: 'Como funciona', to: 'About' },
    { label: 'O modelo em grafo', to: 'About' },
    { label: 'Sobre o projeto', to: 'About' },
  ] },
  { head: 'Caderno', links: [
    { label: 'Escrever nota de campo', to: 'Journal' },
    { label: 'Indicar alambique', to: 'SuggestPlace' },
    { label: 'Criar conta', to: 'SignUp' },
    { label: 'Entrar', to: 'SignIn' },
  ] },
];

export function Footer() {
  const nav = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const cols = width <= 640 ? 1 : width <= 1080 ? 2 : 4;
  const basis = `${100 / cols - 2}%` as const;
  return (
    <View style={styles.footer}>
      <View style={styles.grid}>
        <View style={[styles.brandBlock, { flexBasis: cols >= 4 ? '32%' : basis }]}>
          <Text style={styles.brandWord}>Cachaceiro{'\n'}Viajante.</Text>
          <Text style={styles.brandText}>{copy.footer.brandText}</Text>
          <View style={styles.flag}>
            <View style={styles.flagR} /><View style={styles.flagW} />
            <View style={styles.flagR} /><View style={styles.flagW} />
            <Text style={styles.flagText}>{copy.footer.flag}</Text>
          </View>
        </View>
        {COLUMNS.map((col) => (
          <View key={col.head} style={{ flexBasis: basis, flexGrow: 1 }}>
            <Text style={styles.h5}>{col.head.toUpperCase()}</Text>
            {col.links.map((l, i) => (
              <Hoverable key={i} onPress={l.to ? () => nav.navigate(l.to as never) : undefined}>
                {(hovered: boolean) => (
                  <Text style={[styles.li, hovered && l.to ? styles.liHover : null]}>{l.label}</Text>
                )}
              </Hoverable>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.colophon}>
        {copy.footer.colophon.map((line) => (
          <Text key={line} style={styles.colText}>{line}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingTop: 60, marginTop: 60 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 40, rowGap: 40 },
  brandBlock: { flexGrow: 1, minWidth: 220 },
  brandWord: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 44, lineHeight: 44, color: colors.ink, marginBottom: 16 },
  brandText: { fontFamily: fonts.serif, color: colors.inkSoft, fontSize: 15, lineHeight: 22, maxWidth: 320, marginBottom: 18 },
  flag: { flexDirection: 'row', alignItems: 'center', columnGap: 6 },
  flagR: { width: 14, height: 9, backgroundColor: colors.red },
  flagW: { width: 14, height: 9, backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.rule },
  flagText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginLeft: 6 },
  h5: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, marginBottom: 16 },
  li: { fontFamily: fonts.serif, fontSize: 15, color: colors.ink, paddingVertical: 6 },
  liHover: { color: colors.red },
  colophon: { marginTop: 40, paddingVertical: 18, borderTopWidth: 1, borderTopColor: colors.rule, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', columnGap: 16, rowGap: 8 },
  colText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft },
});
