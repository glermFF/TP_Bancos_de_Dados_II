import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

type Props = { icon: string; title: string; text: string; children?: React.ReactNode };

export function GateCard({ icon, title, text, children }: Props) {
  return (
    <View style={styles.gate}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  gate: { borderWidth: 1, borderColor: colors.rule, borderRadius: 8, backgroundColor: colors.paper, padding: 28 },
  icon: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 40, color: colors.copper, marginBottom: 10 },
  title: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 26, color: colors.ink, marginBottom: 10 },
  text: { fontFamily: fonts.serif, fontSize: 15, lineHeight: 23, color: colors.inkSoft },
  actions: { rowGap: 12, marginTop: 18 },
});
