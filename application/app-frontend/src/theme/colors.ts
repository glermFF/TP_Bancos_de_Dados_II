// Cachaceiro Viajante — palette (mirrors templates/assets/base.css :root)
export const colors = {
  cream: '#F2EAD8',
  creamDeep: '#E8DDC4',
  paper: '#FBF6EB',
  ink: '#2A1810',
  inkSoft: '#4A3526',
  red: '#9E2A2B',
  redDeep: '#6E1B1C',
  copper: '#B97A3D',
  copperDeep: '#8A552A',
  moss: '#5B6B3C',
  rule: 'rgba(42,24,16,.18)',
  ruleSoft: 'rgba(42,24,16,.10)',
  onInkSoft: 'rgba(242,234,216,.7)',
  onInkFaint: 'rgba(242,234,216,.5)',
} as const;

export type ColorName = keyof typeof colors;
