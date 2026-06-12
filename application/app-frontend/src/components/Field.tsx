import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { colors, fonts } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
};

/** Editorial form field: mono small-caps label over a ruled serif input. */
export function Field({ label, error, hint, style, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <TextInput
        placeholderTextColor="rgba(74,53,38,.45)"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          !!error && styles.inputError,
          inputProps.multiline && styles.inputMultiline,
          style,
        ]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  label: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 2, color: colors.inkSoft },
  hint: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: colors.copperDeep },
  input: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
  inputFocused: { borderColor: colors.ink },
  inputError: { borderColor: colors.red },
  error: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.red, marginTop: 6 },
});
