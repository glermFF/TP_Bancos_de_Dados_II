import type { Review } from './types';

// Diário feed (mock; future: (:Viajante)-[:AVALIOU]->(:Alambique)).
export const REVIEWS: Review[] = [
  {
    id: 'r1', who: 'Letícia Andrade', from: 'São Paulo · SP', avatar: 'red', stars: 5,
    place: 'Casa do Mestre Joaquim', when: 'Serra do Cipó · mar/2026',
    bodyLead: 'Cheguei pela estrada de terra',
    body: ' esperando uma destilaria e saí com uma família. Seu Joaquim me serviu três safras na varanda enquanto a chuva batia no telhado de zinco. A rota que o app montou me deixou ali no fim da tarde, hora certa da luz dourada. Vou voltar todo ano.',
    tags: [{ label: 'Rota do Ouro & do Cobre', route: true }, { label: 'pousada' }, { label: 'envelhecida' }],
    useful: 214,
  },
  {
    id: 'r2', who: 'Rodrigo Mendes', from: 'Belo Horizonte · MG', avatar: 'ink', stars: 5,
    place: 'Alambique Estrela do Vão', when: 'Diamantina · fev/2026',
    bodyLead: 'A amburana do Estrela do Vão',
    body: ' é outra coisa. Doçura discreta, final longo. A rota que montei poupou uns 80 km de estrada — sobrou tempo de provar tudo com calma e ainda almoçar no Serro. O preço da garrafa parece roubo de tão barato pra qualidade. Levei três.',
    tags: [{ label: 'Rota dos Diamantes', route: true }, { label: 'amburana' }, { label: 'premium' }],
    useful: 178,
  },
  {
    id: 'r3', who: 'Mariana Couto', from: 'Rio de Janeiro · RJ', avatar: 'copper', stars: 4,
    place: 'roteiro de 3 dias', when: '5 paradas · jan/2026',
    bodyLead: 'Fizemos a Rota do Ouro & do Cobre',
    body: ' em três dias e foi o melhor presente que dei pro meu pai. Pousada no engenho, café com bolo de fubá, e a ordem certinha das paradas — nunca voltamos na mesma estrada. Tiro só meia estrela porque uma das pousadas estava lotada; reservem antes.',
    tags: [{ label: 'Rota do Ouro & do Cobre', route: true }, { label: '3 dias' }, { label: 'família' }],
    useful: 156,
  },
  {
    id: 'r4', who: 'Caio Resende', from: 'Uberlândia · MG', avatar: 'copper', stars: 5,
    place: 'Engenho Santo Antônio', when: 'Ouro Preto · dez/2025',
    bodyLead: 'Degustação à luz de vela',
    body: ' na adega subterrânea, com viola de dez cordas ao fundo. Os barris de jequitibá têm mais de cem anos. É parada obrigatória e dá pra entender por quê: todo mundo passa por ali. Reservem a sexta.',
    tags: [{ label: 'histórico' }, { label: 'degustação' }, { label: 'IPHAN' }],
    useful: 132,
  },
  {
    id: 'r5', who: 'Beatriz Salgado', from: 'Salvador · BA', avatar: 'ink', stars: 4,
    place: 'Fazenda Boi da Cara Preta', when: 'Januária · nov/2025',
    bodyLead: 'O tour de bicicleta',
    body: ' pelo canavial ao amanhecer vale a viagem sozinho. A branca é herbácea, com aquela mineralidade do calcário do São Francisco. Estrada de chão pede carro alto na época de chuva — fora isso, perfeito.',
    tags: [{ label: 'Norte de Minas', route: true }, { label: 'branca' }, { label: 'cobre' }],
    useful: 98,
  },
  {
    id: 'r6', who: 'Thiago Nunes', from: 'Curitiba · PR', avatar: 'copper', stars: 5,
    place: 'Alambique do Largo', when: 'Tiradentes · out/2025',
    bodyLead: 'Cana crioula, orgânica,',
    body: ' moída na mesma semana do corte — dá pra sentir. Fica a duzentos metros do Largo das Forras, então a gente provou, almoçou frango com quiabo na esquina e voltou pra segunda dose. Caiu bem no meio do roteiro, perfeito pro almoço.',
    tags: [{ label: 'orgânica' }, { label: 'cana crioula' }, { label: 'centro histórico' }],
    useful: 87,
  },
];

export const RATING_AGG = {
  avg: 4.81,
  total: 9842,
  bars: [
    { star: 5, pct: 78, hi: true },
    { star: 4, pct: 16 },
    { star: 3, pct: 4 },
    { star: 2, pct: 1.5 },
    { star: 1, pct: 1 },
  ],
  facets: [
    { label: 'Todos', count: 9842, on: true },
    { label: 'Com foto', count: 4120 },
    { label: 'Roteiro completo', count: 1336 },
    { label: 'Pousada no engenho', count: 892 },
    { label: 'Só 5 estrelas', count: 7680 },
  ],
};
