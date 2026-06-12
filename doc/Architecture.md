# Arquitetura

## Padrão: Monólito Modular (MSC)

O backend segue a divisão em camadas **Model–Service–Controller** dentro de uma
única unidade implantável. As responsabilidades são separadas para manter o
acoplamento baixo e permitir testar cada camada isoladamente.

### Camadas do backend

1. **Rotas (Routes)** — pontos de entrada HTTP. Mapeiam URLs + verbos para os
   controllers (`/auth`, `/distilleries`, `/reviews`, `/routes`, `/stats`).
2. **Controladores (Controllers)** — só falam HTTP: leem o `req`, chamam um
   service e moldam a resposta JSON. Sem regra de negócio.
3. **Serviços (Services)** — o coração do app: validação, regras de negócio
   (quarentena, filtro de confiança, reputação) e os algoritmos de otimização
   de rota (vizinho mais próximo e 2-opt sobre uma matriz de distâncias).
4. **Modelos (Models)** — só persistência. Toda query Cypher mora aqui; os
   resultados são mapeados para objetos TypeScript antes de sair da camada.

Peças transversais: `middlewares/` (autenticação JWT, tratador central de
erros), `config/` (env + driver do Neo4j), `lib/` (heurísticas puras de TSP),
`scripts/seed.ts` (carrega o dataset de Minas Gerais).

### Por que esse formato

* **Testabilidade** — regras de negócio concentradas nos services; o solver de
  TSP é um módulo puro com testes unitários.
* **Isolamento da persistência** — mudanças de esquema ou Cypher ficam contidas
  nos models.
* **Escalabilidade** — o módulo `routes/solve` pode ser extraído para um
  serviço próprio sem mexer no resto.

### Cálculo de rota, de ponta a ponta

1. O frontend envia `POST /routes/solve` com os ids das paradas + partida.
2. O model pede ao Neo4j a matriz de `point.distance()` entre esses nós
   (o banco faz a matemática espacial).
3. O service corrige os km geodésicos por um fator rodoviário de 1,27, roda o
   vizinho mais próximo (opcionalmente refinado pelo 2-opt) e devolve as
   paradas ordenadas, trechos, totais e tempo estimado de direção.
4. O cliente web então pede ao OSRM (roteamento OpenStreetMap) a geometria
   viária real daquela ordem e desenha no mapa Leaflet; se o OSRM estiver fora
   do ar, cai para linhas retas tracejadas.

## Stack

| Camada    | Tecnologia                                              |
|-----------|---------------------------------------------------------|
| Frontend  | Expo / React Native Web, TypeScript, Leaflet, axios     |
| Backend   | Node.js, Express, TypeScript, JWT (jsonwebtoken), bcryptjs |
| Banco     | Neo4j 5 (grafo de propriedades + pontos espaciais)      |
| Roteamento| Heurísticas de TSP no service · OSRM para geometria viária |
| Infra     | Docker **ou** Podman + compose, Makefile                |

## Estrutura do projeto

```
application/
  app-backend/
    src/
      config/        # env + driver Neo4j (sessões gerenciadas, retries)
      controllers/   # authController, distilleryController, reviewController, routeController
      services/      # authService, distilleryService, reviewService, routeService
      models/        # userModel, distilleryModel, reviewModel (todo Cypher mora aqui)
      middlewares/   # authenticate (JWT), errorHandler (ApiError)
      routes/        # routers express por domínio
      lib/           # tsp.ts — vizinho mais próximo + 2-opt puros sobre matriz
      scripts/       # seed.ts — alambiques reais de MG, cidades, malha ROAD, usuários demo
      types/         # interfaces DTO compartilhadas
      app.ts         # montagem do express (cors, json, rotas, erros)
      server.ts      # ponto de entrada
  app-frontend/
    src/
      components/    # Topbar, Footer, Button, Field, AuthCard, RouteMap(.web)
      screens/       # Home, Distilleries, RoutePlanner, Journal, About, SignIn, SignUp, SuggestPlace
      context/       # AuthContext (sessão JWT persistida)
      data/          # tipos de domínio + dataset offline de fallback
      lib/           # tsp + geo (haversine) + format — com testes unitários
      services/      # api.ts (axios), osrm.ts (geometria viária), storage.ts
      styles/        # webChrome — fontes, grão de papel, skin do Leaflet
      theme/         # paleta + tipografia
  docker-compose.yml # neo4j + backend + seed (one-shot) + frontend
doc/                 # esta documentação
Makefile             # atalhos de dev/teste (rode `make help`)
```

> Convenção: o código-fonte (identificadores, rótulos do grafo, endpoints) é
> escrito em inglês; todo texto visível ao usuário e a documentação ficam em
> português do Brasil.
