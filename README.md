# O Cachaceiro Viajante

Guia de roteiros de cachaça em Minas Gerais. O usuário escolhe os alambiques que
quer conhecer e o app monta a melhor ordem de visitar todos — a rota que cobre
todas as paradas rodando o mínimo de estrada, partindo de onde ele quiser.

Projeto da disciplina de **Banco de Dados II** (UFOP). Por baixo do guia, o
roteiro é calculado sobre um banco de dados em grafo (Neo4j), tratando alambiques
como pontos e estradas como ligações entre eles.

## Stack

| Camada    | Tecnologia                                            |
|-----------|-------------------------------------------------------|
| Frontend  | Expo / React Native (web via `react-native-web`), TypeScript |
| Backend   | Node.js + Express, TypeScript                         |
| Banco     | Neo4j 5                                               |
| Containers| Docker **ou** Podman (+ compose)                      |

## Estrutura

```
application/
  app-frontend/      # app Expo/RN — telas, componentes, tema, dados, lib de rota
    src/
      components/    # Topbar, Footer, Button, PageHead, ...
      screens/       # Mapa, Alambiques, Rotas, Diario, Sobre
      data/          # mocks + tipos de domínio
      lib/           # cálculo de rota (+ testes) e formatação
      services/      # cliente HTTP para o backend
      theme/         # cores e tipografia
  app-backend/       # API Express → Neo4j (controllers, services, models, routes)
  docker-compose.yml # Neo4j + backend + frontend
doc/                 # documentação (arquitetura, RNs, testes)
Makefile             # atalhos de dev/test (veja abaixo)
```

## Como rodar

Tudo passa pelo **Makefile** na raiz. Rode `make` (ou `make help`) para ver a
lista completa de comandos.

### Pré-requisitos

- Node.js 20+ e npm
- Para o banco/stack em container: Docker **ou** Podman

### Primeiro acesso

```bash
make install      # instala dependências do front e do back
make dev          # abre o frontend em http://localhost:8081 (funciona offline, com dados de exemplo)
```

### Rodando com o banco de dados

```bash
make db           # sobe só o Neo4j em container (http://localhost:7474 · neo4j / senha123)
make back         # roda o backend local na porta 3000
make front        # roda o frontend local
# ou tudo junto em containers:
make up           # Neo4j + backend + frontend via docker/podman compose
```

### Comandos do Makefile

| Comando          | O que faz                                                        |
|------------------|------------------------------------------------------------------|
| `make help`      | Lista todos os comandos disponíveis                              |
| `make install`   | Instala dependências (frontend + backend)                       |
| `make dev`       | Roda o frontend (Expo web) — funciona offline com dados de exemplo |
| `make up`        | Sobe a stack inteira em containers                              |
| `make down`      | Para e remove os containers                                     |
| `make logs`      | Acompanha os logs dos containers                                |
| `make db`        | Sobe apenas o Neo4j (sem precisar de compose)                   |
| `make db-stop`   | Para e remove o container do Neo4j                              |
| `make front`     | Roda o frontend local (Expo web)                                |
| `make back`      | Roda o backend local (porta 3000)                               |
| `make seed`      | Carrega os dados iniciais no Neo4j                              |
| `make test`      | Roda os testes (frontend)                                       |
| `make typecheck` | Checagem de tipos TypeScript (front + back)                     |
| `make clean`     | Remove `node_modules` e artefatos de build                      |

> O Makefile detecta automaticamente o container engine (`docker` ou `podman`)
> e o comando de compose disponível (`docker compose` v2, `docker-compose` v1 ou
> os equivalentes do podman), funcionando em distros baseadas em Debian/Ubuntu e
> em Fedora.

### Apontando o frontend para a API

O frontend usa dados de exemplo por padrão e cai para eles quando a API está
fora do ar. Para apontar para o backend, defina a variável de ambiente antes de
rodar o front:

```bash
EXPO_PUBLIC_API_URL=http://localhost:3000 make front
```
