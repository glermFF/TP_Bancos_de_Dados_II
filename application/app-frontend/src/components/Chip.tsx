import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';
import { Hoverable } from './Hoverable';

type Props = { label: string; on?: boolean; accent?: boolean; onPress?: () => void };

export function Chip({ label, on, accent, onPress }: Props) {
  return (
    <Hoverable onPress={onPress} style={[styles.chip, on && styles.on, accent && styles.accent]}>
      <Text style={[styles.text, (on || accent) && styles.textOn]}>{label}</Text>
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  chip: { borderWidth: 1, borderColor: colors.rule, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13, backgroundColor: colors.cream },
  on: { backgroundColor: colors.ink, borderColor: colors.ink },
  accent: { backgroundColor: colors.red, borderColor: colors.redDeep },
  text: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.8, color: colors.inkSoft, textTransform: 'uppercase' },
  textOn: { color: colors.cream },
});
