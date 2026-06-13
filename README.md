# Cachaceiro Viajante

*O guia de campo do cachaceiro que viaja por Minas Gerais.*

Escolha os alambiques que quer visitar; o app calcula a **rota mais rápida**
que cobre todos — cidades reais, coordenadas reais, estradas reais — e desenha
o trajeto num mapa ao vivo. Por baixo do capô, cada lugar é um nó e cada
estrada um relacionamento num grafo **Neo4j**: o roteiro é literalmente uma
pergunta feita ao banco de dados.

Trabalho prático da disciplina de **Banco de Dados II** (UFOP).

## Funcionalidades

- 🥃 **Catálogo de alambiques reais de MG** — Salinas, Nova União, Betim,
  Tiradentes e mais; cada um é um nó `(:Distillery)` com coordenadas WGS-84 reais
- 🗺️ **Planejador de rotas em mapa real** — Leaflet + OpenStreetMap; toque nos
  pinos, escolha a partida e o algoritmo (vizinho mais próximo ou 2-opt)
- 🧭 **Cálculo movido a grafo** — o Neo4j computa a matriz de `point.distance()`;
  a API roda heurísticas de TSP e devolve a ordem de visita; o OSRM ajusta o
  resultado às rodovias reais
- 👤 **Contas** — cadastro / login (JWT + bcrypt), sessão persistida
- ✍️ **Diário de bordo** — viajantes logados registram notas de campo
  (avaliações) que atualizam a nota de cada alambique dentro do grafo
- 📍 **Indicar alambique** — logado, você finca o pino no mapa e o lugar entra
  no grafo em quarentena (EM VALIDAÇÃO) até ser confirmado
- 📴 **Tolerância a falhas** — sem API, a interface roda com um dataset de
  exemplo embutido

## Stack

| Camada    | Tecnologia |
|-----------|------------|
| Frontend  | Expo / React Native Web · TypeScript · Leaflet |
| Backend   | Node.js · Express · TypeScript · JWT |
| Banco     | Neo4j 5 — grafo de propriedades + pontos espaciais |
| Infra     | Docker **ou** Podman (+ compose) · Makefile |

## Como rodar

Pré-requisitos: Node 20+, e Docker ou Podman para o banco.

### Tudo em containers

```bash
make up
```

### Dev local (hot reload)

```bash
make install   # dependências do front + back
cp application/app-backend/.env.example application/app-backend/.env  # preencha as senhas
make db        # container do Neo4j (usa NEO4J_PASSWORD do .env)
make seed      # carrega o dataset de Minas Gerais
make back      # API → http://localhost:3000
make front     # app web → http://localhost:8081
```

Abra **http://localhost:8081** — o seed cria a conta `demo@cachaceiro.app`
com a senha de `SEED_USER_PASSWORD` (ou uma aleatória impressa no log).
Neo4j Browser em http://localhost:7474.

### Produção (Umbrel + Cloudflare Tunnel)

Imagem única (web estático + API), Neo4j fechado na rede interna, app exposto
só em `127.0.0.1` e túnel da Cloudflare na frente — guia completo em
[doc/Deploy.md](doc/Deploy.md).

```bash
cd application && cp .env.example .env   # segredos
make prod-up-tunnel
```

Rode `make help` para ver todos os alvos (`typecheck`, `test`, `logs`,
`clean`, ...).

## Documentação

| Doc | Conteúdo |
|---|---|
| [doc/Architecture.md](doc/Architecture.md) | camadas MSC, pipeline de cálculo de rota, estrutura do projeto |
| [doc/Database.md](doc/Database.md) | modelo do grafo, constraints, queries Cypher principais, dataset |
| [doc/API.md](doc/API.md) | referência de endpoints com payloads |
| [doc/RNS.md](doc/RNS.md) | RN01–RN10 e o status de implementação de cada uma |
| [doc/Testing.md](doc/Testing.md) | como rodar, testar e fazer smoke-test de tudo |
| [doc/Deploy.md](doc/Deploy.md) | produção: Umbrel, Docker e túnel Cloudflare |

## Telas

- **Mapa (home)** — hero editorial com prancha de rota projetada e estatísticas ao vivo do grafo
- **Alambiques** — catálogo com busca e filtros (região, categoria, nota, confiança)
- **Monte sua rota** — a funcionalidade principal: mapa real, seleção por pinos, solver, roteiro
- **Diário** — notas de campo da comunidade + escreva a sua (logado)
- **Indicar alambique** — finque o pino no mapa e mande a ficha (logado)
- **Sobre** — o modelo de grafo e a arquitetura, ilustrados
- **Entrar / Criar conta** — formulários em estilo carteirinha de viajante

---

*Beba com moderação. 18+.*
