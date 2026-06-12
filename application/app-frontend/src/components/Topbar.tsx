import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, letterSpacing } from '../theme';
import { Hoverable } from './Hoverable';
import { useAuth } from '../context/AuthContext';
import { NAV_ITEMS, type RootStackParamList, type RouteName } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function Topbar({ active }: { active: RouteName }) {
  const nav = useNavigation<Nav>();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.bar}>
      <Hoverable style={styles.brand} onPress={() => nav.navigate('Home')}>
        <View style={styles.mark}>
          <Text style={styles.markText}>C·V</Text>
        </View>
        <View>
          <Text style={styles.word}>Cachaceiro Viajante</Text>
          <Text style={styles.wordSub}>ROTEIROS DE CACHAÇA · MINAS GERAIS</Text>
        </View>
      </Hoverable>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const on = item.name === active;
          return (
            <Hoverable key={item.name} onPress={() => nav.navigate(item.name as never)}>
              {(hovered: boolean) => (
                <Text
                  style={[
                    styles.navLink,
                    on && styles.navLinkActive,
                    hovered && !on && styles.navLinkHover,
                  ]}
                >
                  {item.label.toUpperCase()}
                </Text>
              )}
            </Hoverable>
          );
        })}
      </View>

      <View style={styles.actions}>
        {user ? (
          <>
            <View style={styles.userChip}>
              <View style={styles.userDot} />
              <Text style={styles.userName}>@{user.username.toUpperCase()}</Text>
            </View>
            <Hoverable onPress={signOut}>
              {(hovered: boolean) => (
                <Text style={[styles.signOut, hovered && { color: colors.red }]}>SAIR</Text>
              )}
            </Hoverable>
          </>
        ) : (
          <Hoverable
            style={styles.signIn}
            hoverStyle={styles.signInHover}
            onPress={() => nav.navigate('SignIn')}
          >
            {(hovered: boolean) => (
              <Text style={[styles.signInText, hovered && styles.signInTextHover]}>ENTRAR →</Text>
            )}
          </Hoverable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 14,
    columnGap: 18,
    paddingTop: 8,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  brand: { flexDirection: 'row', alignItems: 'center', columnGap: 14 },
  mark: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, borderColor: colors.ink,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.cream,
  },
  markText: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 18, color: colors.ink },
  word: { fontFamily: fonts.display, fontStyle: 'italic', fontSize: 22, color: colors.ink, lineHeight: 24 },
  wordSub: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3.2, color: colors.inkSoft, marginTop: 2 },

  nav: { flexDirection: 'row', alignItems: 'center', columnGap: 28, rowGap: 10, flexShrink: 1, flexWrap: 'wrap' },
  navLink: {
    fontFamily: fonts.mono, fontSize: 11, letterSpacing: letterSpacing.label,
    color: colors.inkSoft, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: 'transparent',
  },
  navLinkActive: { color: colors.ink, borderBottomColor: colors.ink },
  navLinkHover: { color: colors.red, borderBottomColor: colors.red },

  actions: { flexDirection: 'row', alignItems: 'center', columnGap: 16 },
  signIn: {
    borderWidth: 1, borderColor: colors.ink, borderRadius: 999,
    paddingVertical: 9, paddingHorizontal: 18, backgroundColor: 'transparent',
  },
  signInHover: { backgroundColor: colors.ink },
  signInText: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 2, color: colors.ink },
  signInTextHover: { color: colors.cream },
  userChip: {
    flexDirection: 'row', alignItems: 'center', columnGap: 8,
    borderWidth: 1, borderColor: colors.rule, borderRadius: 999,
    paddingVertical: 8, paddingHorizontal: 14, backgroundColor: colors.paper,
  },
  userDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.moss },
  userName: { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.6, color: colors.ink },
  signOut: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.6, color: colors.inkSoft },
});
