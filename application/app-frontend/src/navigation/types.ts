export type RootStackParamList = {
  Home: undefined;
  Distilleries: undefined;
  RoutePlanner: { preselect?: string } | undefined;
  Journal: undefined;
  About: undefined;
  SignIn: undefined;
  SignUp: undefined;
  SuggestPlace: undefined;
};

export type RouteName = keyof RootStackParamList;

export const NAV_ITEMS: { name: RouteName; label: string }[] = [
  { name: 'Home', label: 'Mapa' },
  { name: 'Distilleries', label: 'Alambiques' },
  { name: 'RoutePlanner', label: 'Rotas' },
  { name: 'Journal', label: 'Diário' },
  { name: 'About', label: 'Sobre' },
];
