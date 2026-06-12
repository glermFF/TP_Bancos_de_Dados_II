import React from 'react';
import { NavigationContainer, type LinkingOptions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from './types';

import HomeScreen from '../screens/Home';
import DistilleriesScreen from '../screens/Distilleries';
import RoutePlannerScreen from '../screens/RoutePlanner';
import JournalScreen from '../screens/Journal';
import AboutScreen from '../screens/About';
import SignInScreen from '../screens/SignIn';
import SignUpScreen from '../screens/SignUp';
import SuggestPlaceScreen from '../screens/SuggestPlace';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Distilleries: 'alambiques',
      RoutePlanner: 'rotas',
      Journal: 'diario',
      About: 'sobre',
      SignIn: 'entrar',
      SignUp: 'cadastro',
      SuggestPlace: 'indicar',
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
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Cachaceiro Viajante — Roteiros de cachaça em Minas Gerais' }} />
        <Stack.Screen name="Distilleries" component={DistilleriesScreen} options={{ title: 'Alambiques — Cachaceiro Viajante' }} />
        <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ title: 'Monte sua rota — Cachaceiro Viajante' }} />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ title: 'Diário de bordo — Cachaceiro Viajante' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre — Cachaceiro Viajante' }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Entrar — Cachaceiro Viajante' }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Criar conta — Cachaceiro Viajante' }} />
        <Stack.Screen name="SuggestPlace" component={SuggestPlaceScreen} options={{ title: 'Indicar alambique — Cachaceiro Viajante' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
