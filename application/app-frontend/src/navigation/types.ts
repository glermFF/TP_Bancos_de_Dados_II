export type RootStackParamList = {
  Mapa: undefined;
  Alambiques: undefined;
  Rotas: undefined;
  Diario: undefined;
  Sobre: undefined;
};

export type RouteName = keyof RootStackParamList;

export const NAV_ITEMS: { name: RouteName; label: string }[] = [
  { name: 'Mapa', label: 'Mapa' },
  { name: 'Alambiques', label: 'Alambiques' },
  { name: 'Rotas', label: 'Rotas' },
  { name: 'Diario', label: 'Diário' },
  { name: 'Sobre', label: 'Sobre' },
];
