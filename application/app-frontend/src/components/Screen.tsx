import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, layout } from '../theme';
import { installWebChrome } from '../styles/webChrome';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import type { RouteName } from '../navigation/types';

export function useShellPad() {
  const { width } = useWindowDimensions();
  if (width <= 640) return layout.padXPhone;
  if (width <= 1080) return layout.padXTablet;
  return layout.padX;
}

export function Screen({ active, children }: { active: RouteName; children: React.ReactNode }) {
  const padX = useShellPad();
  useEffect(() => { installWebChrome(); }, []);
  return (
    <ScrollView style={styles.canvas} contentContainerStyle={styles.scroll}>
      <View style={[styles.shell, { paddingHorizontal: padX }]}>
        <Topbar active={active} />
        {children}
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, backgroundColor: colors.cream },
  scroll: { alignItems: 'center' },
  shell: { width: '100%', maxWidth: layout.maxWidth, paddingTop: 22, paddingBottom: 80 },
});
