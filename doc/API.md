# Referência da API

URL base: `http://localhost:3000`. Todos os corpos são JSON. Endpoints
autenticados esperam `Authorization: Bearer <token>`.

## Saúde & estatísticas

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/health` | — | verificação de vida |
| GET | `/stats` | — | `{distilleries, cities, regions, reviews}` |

## Autenticação

| Método | Caminho | Auth | Corpo | Retorna |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{name, username, email, password}` | `201 {token, user}` |
| POST | `/auth/login` | — | `{identifier, password}` (e-mail **ou** usuário) | `{token, user}` |
| GET | `/auth/me` | ✓ | — | o usuário autenticado |

Validação: nome ≥ 2 caracteres; usuário `[a-z0-9_.-]{3,24}`; e-mail válido;
senha ≥ 6 caracteres. E-mail/usuário duplicado → `409`.

## Alambiques

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/distilleries?page=1&pageSize=10` | — | paginado via `SKIP`/`LIMIT` no Cypher; ordenado por nota; inclui `latitude`/`longitude` reais |
| GET | `/distilleries/:id` | — | um alambique + suas avaliações |
| POST | `/distilleries` | ✓ | indicar novo alambique `{name, category, city, latitude, longitude}` — entra como `IN_VALIDATION` (RN04/RN05) |

Resposta paginada (padrão `page=1`, `pageSize=100`, máx. 100):

```json
{ "items": [ ... ], "total": 24, "page": 1, "pageSize": 10, "totalPages": 3 }
```

## Avaliações

| Método | Caminho | Auth | Descrição |
|---|---|---|---|
| GET | `/reviews?limit=12` | — | notas de campo mais recentes (autor + alambique embutidos) |
| POST | `/reviews` | ✓ | `{distilleryId, title, body, rating}` — também atualiza a nota denormalizada do alambique |

## Solver de rotas (a funcionalidade principal)

`POST /routes/solve`

```json
{
  "stopIds": ["<id do alambique>", "..."],
  "startId": "<um dos stopIds>",
  "algorithm": "two-opt"        // ou "nearest"
}
```

Resposta:

```json
{
  "algorithm": "two-opt",
  "stops": [ { "id": "...", "name": "...", "latitude": -19.69, "longitude": -43.58, ... } ],
  "legs": [ { "fromId": "...", "toId": "...", "km": 79.7 } ],
  "totalKm": 415.2,
  "savedKm": 132.8,
  "estimatedMinutes": 608
}
```

`stops` volta na ordem de visita começando em `startId`. As distâncias são a
matriz de `point.distance()` do Neo4j corrigida pelo fator rodoviário 1,27;
`savedKm` compara com visitar as paradas na ordem em que foram enviadas.
Limites: 2–20 paradas. Erros: `400` (entrada inválida), `404` (parada
desconhecida).

## Circuitos (detecção de comunidades)

`GET /communities`

Resposta:

```json
{
  "algorithm": "HP-MOCD",
  "communities": { "<id do alambique>": 0, "...": 1 },
  "groups": [ { "id": 0, "distilleryIds": ["...", "..."] } ]
}
```

O backend monta um grafo de proximidade (cada alambique ligado aos seus 3
vizinhos mais próximos via `point.distance()` do Neo4j) e envia as arestas ao
sidecar Python (`app-community`), que roda o HP-MOCD (biblioteca `pymocd`).
O resultado fica em cache por 5 minutos. Erros: `422` (menos de 3 alambiques),
`503` (sidecar fora do ar).
