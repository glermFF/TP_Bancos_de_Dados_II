import type { GraphNode } from './types';

// SVG coords loosely tracking the geography of Minas Gerais.
// Used by the Rotas solver board and the Mapa hero graph.
export const NODES: GraphNode[] = [
  { id: 'bh', name: 'Belo Horizonte', city: 'Capital', x: 330, y: 310 },
  { id: 'op', name: 'Ouro Preto', city: 'Vertentes', x: 380, y: 340 },
  { id: 'tir', name: 'Tiradentes', city: 'Vertentes', x: 310, y: 375 },
  { id: 'sjr', name: 'S.J. del-Rei', city: 'Vertentes', x: 270, y: 395 },
  { id: 'cax', name: 'Caxambu', city: 'Sul de Minas', x: 245, y: 425 },
  { id: 'cipo', name: 'Serra do Cipó', city: 'Central', x: 330, y: 268 },
  { id: 'dia', name: 'Diamantina', city: 'Serro', x: 392, y: 232 },
  { id: 'sal', name: 'Salinas', city: 'Norte de Minas', x: 380, y: 140 },
  { id: 'jan', name: 'Januária', city: 'São Francisco', x: 250, y: 135 },
  { id: 'set', name: 'Sete Lagoas', city: 'Central', x: 300, y: 255 },
  { id: 'can', name: 'São Roque (Canastra)', city: 'Canastra', x: 150, y: 360 },
  { id: 'ara', name: 'Araxá', city: 'Triângulo', x: 130, y: 285 },
];

export const NODE_BY_ID: Record<string, GraphNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
);

// road-distance calibration (mirrors rotas template)
export const KM_PER_UNIT = 2.35;
export const ROAD_SPEED = 62; // km/h média de estrada mineira
export const STOP_MIN = 50; // min por parada (prova + prosa)
