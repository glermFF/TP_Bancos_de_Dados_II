import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

type Props = {
  headLeft: string;
  headRight: string;
  footLeft: string;
  footRight: string;
  footRightAccent?: boolean;
  children: React.ReactNode;
};

export function MapBoard({ headLeft, headRight, footLeft, footRight, footRightAccent, children }: Props) {
  return (
    <View style={styles.board}>
      <View style={styles.row}>
        <Text style={styles.corner}>{headLeft}</Text>
        <Text style={styles.corner}>{headRight}</Text>
      </View>
      <View style={styles.mapBox}>{children}</View>
      <View style={[styles.row, { marginTop: 12, marginBottom: 0 }]}>
        <Text style={styles.corner}>{footLeft}</Text>
        <Text style={[styles.corner, footRightAccent && { color: colors.moss }]}>{footRight}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.rule, borderRadius: 8, padding: 18, width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 4, marginBottom: 12 },
  corner: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.inkSoft },
  mapBox: { width: '100%', aspectRatio: 16 / 9, minHeight: 460, maxHeight: 720, borderWidth: 1, borderColor: colors.rule, borderRadius: 6, overflow: 'hidden', backgroundColor: colors.paper },
});
