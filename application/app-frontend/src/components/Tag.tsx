import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

/** Small monospace property tag (tagp / etag in the templates). */
export function Tag({ children, variant = 'default' }: {
  children: string;
  variant?: 'default' | 'label' | 'route';
}) {
  return (
    <View style={[styles.tag, variant === 'route' && styles.route, variant === 'label' && styles.label]}>
      <Text
        style={[styles.text, variant !== 'default' && styles.accentText]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 1, borderColor: colors.rule, borderRadius: 3,
    paddingVertical: 3, paddingHorizontal: 7,
  },
  label: { borderColor: 'rgba(91,107,60,.4)' },
  route: { borderColor: 'rgba(91,107,60,.4)' },
  text: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1.2, color: colors.inkSoft, textTransform: 'uppercase' },
  accentText: { color: colors.moss },
});
