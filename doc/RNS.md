# Regras de Negócio

- **RN01 — Raio de busca limitado:** recomendações e montagem de rota devem
  considerar apenas alambiques dentro de um raio máximo do ponto de referência
  do viajante. *(Planejada — o planejador hoje expõe o estado inteiro.)*

- **RN02 — Mínimo de avaliações para destaque:** um alambique precisa de um
  número mínimo de avaliações antes de encabeçar recomendações, evitando que
  um único voto 5 estrelas distorça o ranking. A interface mostra a contagem
  de notas ao lado de cada nota média.

- **RN03 — Dependência de localização ativa:** rotas em tempo real a partir da
  posição do usuário exigem permissão de GPS; sem ela o app funciona a partir
  do alambique de partida escolhido. *(A demo web sempre parte de uma parada
  selecionada.)*

- **RN04 — Cadastro de novo alambique:** um viajante logado pode indicar um
  novo alambique marcando o ponto no mapa (`POST /distilleries`, exige JWT).
  Implementada na tela “Indicar alambique”.

- **RN05 — Ciclo de validação (quarentena):** toda indicação de usuário entra
  no grafo com status `IN_VALIDATION`. Só após validação vira `VERIFIED`.
  Implementada em `distilleryModel.suggestDistillery`.

- **RN06 — Filtro de confiança:** o catálogo tem um filtro visível para
  incluir ou esconder entradas `IN_VALIDATION`. Implementada na tela de
  Alambiques.

- **RN07 — Recálculo dinâmico dos pesos:** custos de rota nunca são
  armazenados; a matriz de distâncias é recalculada com `point.distance()` a
  cada requisição, então novas paradas e mudanças de nota sempre aparecem.

- **RN08 — Sem nós órfãos:** um alambique só é listado/roteável enquanto tiver
  um relacionamento `[:LOCATED_IN]` com uma cidade e seu status não for
  `BLOCKED` (garantido pelas queries de listagem/matriz).

- **RN09 — Reputação do usuário:** viajantes carregam um score `reputation`;
  votos de validação de usuários com reputação alta devem pesar mais.
  *(Esquema pronto; ponderação planejada.)*

- **RN10 — Experiência personalizada:** as recomendações respeitam as
  categorias preferidas do viajante (branca, envelhecida, premium, orgânica,
  histórica). O catálogo expõe filtros por categoria; preferências por perfil
  estão planejadas.
