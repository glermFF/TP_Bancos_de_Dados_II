import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, fonts } from '../theme';

/**
 * "Traveler's card" frame for the auth screens: ruled paper document with a
 * rotated rubber stamp, doc number and ink footer — like a page torn from a
 * 1960s road almanac.
 */
export function AuthCard({
  docLabel,
  title,
  subtitle,
  children,
}: {
  docLabel: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const narrow = width <= 640;
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, narrow && styles.cardNarrow]}>
        <View style={styles.stamp}>
          <Text style={styles.stampText}>C·V{'\n'}EST.{'\n'}2026</Text>
        </View>
        <Text style={styles.doc}>{docLabel}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.rule} />
        {children}
        <View style={styles.foot}>
          <Text style={styles.footText}>CACHACEIRO VIAJANTE · MINAS GERAIS</Text>
          <Text style={styles.footText}>BEBA COM MODERAÇÃO · 18+</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 56 },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    paddingVertical: 44,
    paddingHorizontal: 44,
  },
  cardNarrow: { paddingHorizontal: 24, paddingVertical: 32 },
  stamp: {
    position: 'absolute',
    top: 26,
    right: 26,
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: 'rgba(158,42,43,.55)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  stampText: {
    fontFamily: fonts.mono,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 2,
    color: 'rgba(158,42,43,.65)',
    textAlign: 'center',
  },
  doc: { fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 2.4, color: colors.copperDeep, marginBottom: 18 },
  title: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, lineHeight: 42, color: colors.ink, marginBottom: 12, maxWidth: 330 },
  subtitle: { fontFamily: fonts.serif, fontSize: 15.5, lineHeight: 23, color: colors.inkSoft, maxWidth: 360 },
  rule: { height: 1, backgroundColor: colors.rule, marginVertical: 26 },
  foot: {
    marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
    flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 6,
  },
  footText: { fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1.6, color: colors.inkSoft },
});

export const authStyles = StyleSheet.create({
  error: {
    fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.cream,
    backgroundColor: colors.red, borderRadius: 4,
    paddingVertical: 9, paddingHorizontal: 12, marginBottom: 16, overflow: 'hidden',
  },
  switchRow: { flexDirection: 'row', justifyContent: 'center', columnGap: 8, marginTop: 22, flexWrap: 'wrap' },
  switchText: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.inkSoft },
  switchLink: { fontFamily: fonts.serif, fontSize: 14.5, color: colors.red, fontStyle: 'italic' },
});
