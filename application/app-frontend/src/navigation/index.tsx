import React from 'react';
import { NavigationContainer, type LinkingOptions, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { copy } from '../copy/strings';
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

const navTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.cream } };

export function Navigation() {
  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: copy.navTitles.Home }} />
        <Stack.Screen name="Distilleries" component={DistilleriesScreen} options={{ title: copy.navTitles.Distilleries }} />
        <Stack.Screen name="RoutePlanner" component={RoutePlannerScreen} options={{ title: copy.navTitles.RoutePlanner }} />
        <Stack.Screen name="Journal" component={JournalScreen} options={{ title: copy.navTitles.Journal }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: copy.navTitles.About }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: copy.navTitles.SignIn }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: copy.navTitles.SignUp }} />
        <Stack.Screen name="SuggestPlace" component={SuggestPlaceScreen} options={{ title: copy.navTitles.SuggestPlace }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
