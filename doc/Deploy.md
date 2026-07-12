# Deploy Local

Este projeto roda inteiramente na máquina do desenvolvedor, via Docker (ou
Podman) Compose. Não há deploy em VPS, Umbrel ou qualquer host remoto — só
local.

```
localhost ──> [frontend :8081] ──http://localhost:3000──> [backend :3000] ──bolt (rede interna)──> [neo4j :7474/:7687]
```

Todas as portas dos containers são publicadas em `127.0.0.1`: só a própria
máquina acessa, nada fica exposto na rede local ou na internet.

## Subindo a stack

```bash
cd application && cp .env.example .env
nano .env        # preencha NEO4J_PASSWORD e JWT_SECRET (ex.: openssl rand -hex 32)
```

```bash
make up          # ou: docker compose -f application/docker-compose.yml up --build
```

Isso sobe 4 containers na rede interna do compose:

| Container | Papel | Porta publicada |
|---|---|---|
| `cachacaDB` (neo4j) | banco de grafos | `127.0.0.1:7474` (browser), `127.0.0.1:7687` (bolt) |
| `cachacaAPI` (backend) | API Express | `127.0.0.1:3000` |
| `cachacaSeed` | carrega o dataset de MG e sai (one-shot) | — |
| `cachacaWeb` (frontend) | Expo web | `127.0.0.1:8081` |

## Segurança aplicada

| Item | Como |
|---|---|
| Segredos | só via `application/.env` (gitignorado); a API não sobe sem `NEO4J_PASSWORD` e `JWT_SECRET` |
| Senhas | bcrypt no banco; usuários do seed recebem senha de `SEED_USER_PASSWORD` ou uma aleatória impressa uma única vez no log |
| Força bruta | rate limit de 20 req/min por IP em `/auth` |
| Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy em toda resposta |

## Operação

```bash
make logs                                   # acompanhar os containers
make down                                   # parar e remover os containers
docker compose -f application/docker-compose.yml up --build   # atualizar após mudar código
```

- O seed roda no boot do backend em modo *pula-se-já-tem-dados*: reiniciar os
  containers não apaga usuários nem avaliações.
- Backup: o grafo vive no volume `neo4j_data`
  (`docker run --rm -v application_neo4j_data:/data -v $PWD:/bkp alpine tar czf /bkp/neo4j-backup.tgz /data`).
- Para recarregar o dataset do zero: `make down`, remova o volume
  (`docker volume rm application_neo4j_data`) e suba de novo com `make up`.

Para desenvolvimento com hot reload (sem containerizar front/back), veja
[doc/Testing.md](Testing.md).
