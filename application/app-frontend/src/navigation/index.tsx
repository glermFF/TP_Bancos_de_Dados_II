import React from 'react';
import { NavigationContainer, type LinkingOptions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

import MapaScreen from '../screens/Mapa';
import AlambiquesScreen from '../screens/Alambiques';
import RotasScreen from '../screens/Rotas';
import DiarioScreen from '../screens/Diario';
import SobreScreen from '../screens/Sobre';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Mapa: '',
      Alambiques: 'alambiques',
      Rotas: 'rotas',
      Diario: 'diario',
      Sobre: 'sobre',
    },
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.cream },
};

export function Navigation() {
  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="Mapa" component={MapaScreen} />
        <Stack.Screen name="Alambiques" component={AlambiquesScreen} />
        <Stack.Screen name="Rotas" component={RotasScreen} />
        <Stack.Screen name="Diario" component={DiarioScreen} />
        <Stack.Screen name="Sobre" component={SobreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
