// Domain types — mirror the Neo4j property-graph model described in Sobre.
// (:Alambique)-[:ESTRADA {km,min}]->(:Alambique)
// (:Alambique)-[:FICA_EM]->(:Cidade)
// (:Viajante)-[:AVALIOU {nota}]->(:Alambique)

export interface GraphNode {
  id: string;
  name: string;
  city: string; // região / cidade label used on the map
  x: number; // svg coord ~ geography of MG
  y: number;
}

export interface Alambique {
  id: string;
  idx: string;
  name: string;
  label: string; // node label, e.g. ":Alambique"
  props: string[]; // extra property tags
  city: string;
  region: string;
  category: string;
  rate: number;
  reviews: number;
}

export interface Review {
  id: string;
  who: string;
  from: string;
  avatar: 'copper' | 'red' | 'ink';
  stars: number; // 0..5 (halves allowed)
  place: string;
  when: string;
  body: string;
  bodyLead: string;
  tags: { label: string; route?: boolean }[];
  useful: number;
}
