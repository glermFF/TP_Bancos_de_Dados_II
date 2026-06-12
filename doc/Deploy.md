# Deploy em Produção (Umbrel + Cloudflare Tunnel)

A produção roda como **dois containers** numa rede interna do Docker, mais um
túnel opcional:

```
internet ──HTTPS──> Cloudflare ──túnel──> [cloudflared] ──http://app:8080──> [app]
                                                                              │ bolt (rede interna)
                                                                          [neo4j]
```

- **app** — imagem única (`application/app.dockerfile`): o site exportado pelo
  Expo é servido como estático pela própria API Express. No host, a porta só é
  publicada em `127.0.0.1` — ninguém da LAN/internet acessa direto.
- **neo4j** — sem nenhuma porta publicada; só existe na rede interna do compose.
- **cloudflared** — conecta-se *para fora* (outbound) até a Cloudflare; nenhuma
  porta de entrada é aberta na máquina.

## Segurança aplicada

| Item | Como |
|---|---|
| Segredos | só via variáveis de ambiente (`application/.env`, gitignorado); a API **recusa subir** em produção sem `NEO4J_PASSWORD` e `JWT_SECRET` |
| Exposição | app publicado apenas em `127.0.0.1:${APP_PORT}`; Neo4j sem portas |
| CORS | travado em `PUBLIC_ORIGIN` (o domínio do túnel) |
| Headers | HSTS, CSP, nosniff, frame-ancestors none, Referrer/Permissions-Policy |
| Força bruta | rate limit de 20 req/min por IP em `/auth` |
| Senhas | bcrypt no banco; usuários do seed recebem senha de `SEED_USER_PASSWORD` ou uma aleatória impressa uma única vez no log |

## Passo a passo no Umbrel

O umbrelOS já vem com Docker. Via SSH (`ssh umbrel@umbrel.local`):

```bash
git clone <repo> && cd TP_Bancos_de_Dados_II/application
cp .env.example .env
nano .env        # preencha NEO4J_PASSWORD, JWT_SECRET (ex.: openssl rand -hex 32),
                 # PUBLIC_ORIGIN e TUNNEL_TOKEN (passo abaixo)
```

> A porta padrão do app é `8080` (só em localhost). Se conflitar com algum app
> do Umbrel, mude `APP_PORT` no `.env`.

Suba o stack:

```bash
docker compose -f docker-compose.prod.yml --profile tunnel up -d --build
docker compose -f docker-compose.prod.yml logs -f app   # acompanhe seed + boot
```

(ou, da raiz do repositório: `make prod-up-tunnel`.)

## Criando o túnel na Cloudflare

1. Painel **Zero Trust** → *Networks* → *Tunnels* → **Create a tunnel**
   (tipo *Cloudflared*). Copie o **token** para `TUNNEL_TOKEN` no `.env`.
2. Em *Public Hostname*, aponte o seu domínio (ex.:
   `cachaceiro.seu-dominio.com`) para o serviço **`http://app:8080`** —
   o cloudflared roda na mesma rede do compose e resolve `app` pelo nome.
3. `PUBLIC_ORIGIN=https://cachaceiro.seu-dominio.com` no `.env` (trava o CORS).
4. Pronto: TLS, DNS e exposição ficam por conta da Cloudflare; a máquina não
   abre porta nenhuma para a internet.

## Teste local da produção (sem túnel)

```bash
cd application && cp .env.example .env  # preencha as senhas
docker compose -f docker-compose.prod.yml up -d --build
curl http://127.0.0.1:8080/health
xdg-open http://127.0.0.1:8080          # o site inteiro, servido pela API
```

## Operação

```bash
make prod-logs                      # logs
make prod-down                      # parar tudo
docker compose -f docker-compose.prod.yml up -d --build   # atualizar versão
```

- O seed roda no boot do app em modo *pula-se-já-tem-dados*: os cadastros de
  usuários sobrevivem a reinícios e atualizações.
- Backup: o grafo vive no volume `neo4j_data`
  (`docker run --rm -v application_neo4j_data:/data -v $PWD:/bkp alpine tar czf /bkp/neo4j-backup.tgz /data`).
- Para recarregar o dataset do zero: derrube o stack, remova o volume
  (`docker volume rm application_neo4j_data`) e suba de novo.
