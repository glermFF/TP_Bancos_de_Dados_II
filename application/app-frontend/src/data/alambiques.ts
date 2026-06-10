import type { Alambique } from './types';

// Catalog rows for the Alambiques screen (mock data; replaced by GET /adegas).
export const ALAMBIQUES: Alambique[] = [
  { id: 'a01', idx: '01', name: 'Engenho Coronel das Águas', label: ':Alambique', props: ['bálsamo · 18m', 'desde 1961'], city: 'Salinas', region: 'Norte de Minas', category: 'Envelhecida', rate: 4.9, reviews: 312 },
  { id: 'a02', idx: '02', name: 'Engenho Santo Antônio', label: ':Alambique', props: ['viola ao vivo', 'tombado IPHAN'], city: 'Ouro Preto', region: 'Vertentes', category: 'Histórico', rate: 4.9, reviews: 489 },
  { id: 'a03', idx: '03', name: 'Alambique Estrela do Vão', label: ':Alambique', props: ['amburana · 36m', '8 visitas/dia'], city: 'Diamantina', region: 'Serro', category: 'Premium', rate: 4.8, reviews: 176 },
  { id: 'a04', idx: '04', name: 'Alambique do Largo', label: ':Alambique', props: ['cana crioula', 'orgânica'], city: 'Tiradentes', region: 'Vertentes', category: 'Orgânica', rate: 4.8, reviews: 241 },
  { id: 'a05', idx: '05', name: 'Fazenda Boi da Cara Preta', label: ':Alambique', props: ['cobre martelado', 'tour de bike'], city: 'Januária', region: 'São Francisco', category: 'Branca', rate: 4.7, reviews: 158 },
  { id: 'a06', idx: '06', name: 'Casa do Mestre Joaquim', label: ':Alambique', props: ['pousada · 5 quartos', "roda d'água"], city: 'Serra do Cipó', region: 'Central', category: 'Pousada', rate: 4.6, reviews: 203 },
  { id: 'a07', idx: '07', name: 'Engenho Vista Alegre', label: ':Alambique', props: ['carvalho · 24m', 'almoço mineiro'], city: 'São João del-Rei', region: 'Vertentes', category: 'Envelhecida', rate: 4.6, reviews: 134 },
  { id: 'a08', idx: '08', name: 'Alambique Pedra do Sino', label: ':Alambique', props: ['altitude 1.200m', 'degustação'], city: 'São Roque de Minas', region: 'Canastra', category: 'Premium', rate: 4.7, reviews: 97 },
  { id: 'a09', idx: '09', name: 'Engenho Águas Claras', label: ':Alambique', props: ['fonte termal', 'loja própria'], city: 'Caxambu', region: 'Sul de Minas', category: 'Branca', rate: 4.5, reviews: 112 },
  { id: 'a10', idx: '10', name: 'Cachaçaria Dona Beja', label: ':Alambique', props: ['jequitibá · 12m', 'museu da cachaça'], city: 'Araxá', region: 'Triângulo', category: 'Envelhecida', rate: 4.5, reviews: 88 },
  { id: 'a11', idx: '11', name: 'Alambique do Tropeiro', label: ':Alambique', props: ['rota dos diamantes', 'visita guiada'], city: 'Serro', region: 'Espinhaço', category: 'Branca', rate: 4.6, reviews: 129 },
  { id: 'a12', idx: '12', name: 'Engenho Nossa Senhora', label: ':Alambique', props: ['capela colonial', 'degustação'], city: 'Sabará', region: 'Vertentes', category: 'Histórico', rate: 4.5, reviews: 156 },
];

export const REGION_FILTERS = [
  { label: 'Todas', count: 147, on: true },
  { label: 'Norte de Minas', count: 28 },
  { label: 'Vertentes', count: 41 },
  { label: 'Serra do Cipó', count: 19 },
  { label: 'Sul de Minas', count: 33 },
  { label: 'Triângulo', count: 26 },
];

export const CATEGORY_FILTERS = [
  { label: 'Branca / prata', count: 52 },
  { label: 'Envelhecida', count: 61 },
  { label: 'Premium / reserva', count: 21 },
  { label: 'Orgânica', count: 13 },
];

export const EXPERIENCE_FILTERS = [
  { label: 'Visita guiada', count: 88 },
  { label: 'Pousada no engenho', count: 24 },
  { label: 'Degustação', count: 102 },
  { label: 'Loja própria', count: 71 },
];

export const RATING_FILTERS = [
  { label: '★ 4.5+', count: 34, on: true },
  { label: '★ 4.0+', count: 96 },
  { label: 'Qualquer', count: 147 },
];
