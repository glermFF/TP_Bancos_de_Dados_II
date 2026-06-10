import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, fonts } from '../theme';

export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  const { width } = useWindowDimensions();
  const narrow = width <= 640;
  const size = Math.max(40, Math.min(60, width * 0.042));
  return (
    <View style={[styles.row, narrow && styles.col]}>
      <Text style={[styles.h2, { fontSize: size, lineHeight: size }]}>{title}</Text>
      {sub ? <Text style={[styles.sub, narrow && styles.subLeft]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', columnGap: 24, marginBottom: 28 },
  col: { flexDirection: 'column', alignItems: 'flex-start', rowGap: 16 },
  h2: { fontFamily: fonts.display, fontStyle: 'italic', color: colors.ink, letterSpacing: -1, flexShrink: 1 },
  sub: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.inkSoft, textTransform: 'uppercase', maxWidth: 300, textAlign: 'right' },
  subLeft: { textAlign: 'left' },
});
