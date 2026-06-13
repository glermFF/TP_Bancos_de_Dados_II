import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, fonts } from '../theme';

type Crumb = { label: string; current?: boolean };
type TitlePart = string | { em: string };

export function PageHead({ crumbs, title, lede }: { crumbs: Crumb[]; title: TitlePart[]; lede?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const h1Size = Math.max(56, Math.min(120, width * 0.08));
  return (
    <View style={styles.head}>
      <View style={styles.crumb}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Text style={styles.sep}>/</Text>}
            <Text style={[styles.crumbText, c.current && styles.crumbCurrent]}>{c.label}</Text>
          </React.Fragment>
        ))}
      </View>
      <Text style={[styles.h1, { fontSize: h1Size, lineHeight: h1Size * 0.9 }]}>
        {title.map((p, i) =>
          typeof p === 'string'
            ? <Text key={i} style={styles.h1}>{p}</Text>
            : <Text key={i} style={[styles.h1, styles.h1Em]}>{p.em}</Text>,
        )}
      </Text>
      {lede ? <Text style={styles.lede}>{lede}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingTop: 48, paddingBottom: 36, borderBottomWidth: 1, borderBottomColor: colors.rule },
  crumb: { flexDirection: 'row', alignItems: 'center', columnGap: 10, marginBottom: 22, flexWrap: 'wrap' },
  crumbText: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft, textTransform: 'uppercase' },
  crumbCurrent: { color: colors.ink },
  sep: { color: colors.inkSoft, opacity: 0.5 },
  h1: { fontFamily: fonts.display, fontStyle: 'italic', color: colors.ink, letterSpacing: -1 },
  h1Em: { color: colors.red },
  lede: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 29, color: colors.inkSoft, maxWidth: 620, marginTop: 22 },
});
