# Testes & Execução Local

Tudo passa pelo `Makefile` na raiz — rode `make help` para ver a lista.

## Demo completa em containers (um comando)

```bash
cd application && cp .env.example .env   # preencha NEO4J_PASSWORD e JWT_SECRET
make up        # Neo4j + API + seed (one-shot) + web, via docker/podman compose
```

Depois abra:

| URL | O quê |
|---|---|
| http://localhost:8081 | o app web |
| http://localhost:3000/health | verificação da API |
| http://localhost:7474 | Neo4j Browser (usuário `neo4j`, senha do seu `.env`) |

Login demo: **demo@cachaceiro.app** com a senha definida em
`SEED_USER_PASSWORD` (vazia = aleatória, impressa no log do seed).

## Dev local (hot reload)

```bash
make install   # npm install do front + back
make db        # Neo4j em container (portas 7474/7687)
make seed      # carrega o dataset de Minas Gerais (força recarga limpa)
make back      # API na :3000 (ts-node-dev, reinicia sozinho)
make front     # Expo web na :8081
```

O backend lê `application/app-backend/.env` (criado a partir do
`.env.example`): `PORT`, `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`,
`JWT_SECRET`, `JWT_EXPIRES_IN`.

O frontend aponta por padrão para `http://localhost:3000`; sobrescreva com
`EXPO_PUBLIC_API_URL=... make front`. Sem API no ar ele degrada para o dataset
offline embutido (o banner mostra “DADOS DE EXEMPLO”).

## Portões de qualidade

```bash
make typecheck   # tsc --noEmit no frontend e no backend
make test        # Jest — testes unitários de TSP/geo (frontend)
```

## Teste de fumaça da API (curl)

```bash
curl http://localhost:3000/health
curl http://localhost:3000/stats
curl http://localhost:3000/distilleries

# autenticação
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Maria","username":"maria","email":"maria@exemplo.com","password":"segredo1"}'

TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"demo@cachaceiro.app","password":"<senha-do-seed>"}' | jq -r .token)

curl http://localhost:3000/auth/me -H "Authorization: Bearer $TOKEN"

# cálculo de rota (ids vêm do GET /distilleries)
curl -X POST http://localhost:3000/routes/solve \
  -H 'Content-Type: application/json' \
  -d '{"stopIds":["<id1>","<id2>","<id3>"],"startId":"<id1>","algorithm":"two-opt"}'

# indicar alambique (autenticado)
curl -X POST http://localhost:3000/distilleries \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Alambique do Teste","category":"Branca","city":"Ouro Preto","latitude":-20.39,"longitude":-43.50}'
```

## Mobile (Expo Go)

```bash
cd application/app-frontend
npx expo start    # escaneie o QR code com o Expo Go
```

O mapa interativo Leaflet é exclusivo da web; no nativo o planejador mostra um
texto de fallback, mas o cálculo de rota continua funcionando contra a API.
