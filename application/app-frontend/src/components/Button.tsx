import React from 'react';
import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { Hoverable } from './Hoverable';

type Props = {
  label: string;
  onPress?: () => void;
  ghost?: boolean;
  /** ghost button sitting on a dark/ink surface — light border + label */
  onDark?: boolean;
  /** solid cream button with ink label (used on red/ink cards) */
  invert?: boolean;
  arrow?: '→' | '↓' | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
};

export function Button({ label, onPress, ghost, onDark, invert, arrow = '→', disabled, style, full }: Props) {
  const ghostLight = ghost && onDark;
  return (
    <Hoverable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.btn,
        ghost ? styles.ghost : styles.filled,
        ghostLight && styles.ghostLight,
        invert && !ghost && styles.invert,
        full && styles.full,
        disabled && styles.disabled,
        style,
      ]}
      hoverStyle={!disabled && (ghostLight ? styles.ghostLightHover : ghost ? styles.ghostHover : invert ? styles.invertHover : styles.filledHover)}
    >
      {(hovered: boolean) => (
        <Text
          style={[
            styles.label,
            ghost ? styles.ghostLabel : styles.filledLabel,
            invert && !ghost && styles.invertLabel,
            ghostLight && styles.ghostLightLabel,
            hovered && !disabled && invert && !ghost && styles.invertLabelHover,
            hovered && !disabled && ghost && (ghostLight ? styles.ghostLightLabelHover : styles.ghostLabelHover),
          ]}
        >
          {label}
          {arrow ? `  ${arrow}` : ''}
        </Text>
      )}
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 22, borderRadius: 999, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  full: { alignSelf: 'stretch', width: '100%' },
  filled: { backgroundColor: colors.ink, borderColor: colors.ink },
  filledHover: { backgroundColor: colors.red, borderColor: colors.red },
  ghost: { backgroundColor: 'transparent', borderColor: colors.ink },
  ghostHover: { backgroundColor: colors.ink, borderColor: colors.ink },
  ghostLight: { borderColor: colors.cream },
  ghostLightHover: { backgroundColor: colors.cream, borderColor: colors.cream },
  invert: { backgroundColor: colors.cream, borderColor: colors.cream },
  invertHover: { backgroundColor: colors.ink, borderColor: colors.ink },
  disabled: { opacity: 0.4 },
  label: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2 },
  filledLabel: { color: colors.cream, textTransform: 'uppercase' },
  ghostLabel: { color: colors.ink, textTransform: 'uppercase' },
  ghostLabelHover: { color: colors.cream },
  ghostLightLabel: { color: colors.cream },
  ghostLightLabelHover: { color: colors.ink },
  invertLabel: { color: colors.ink },
  invertLabelHover: { color: colors.cream },
});
