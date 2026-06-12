FRONT := application/app-frontend
BACK  := application/app-backend
COMPOSE_FILE := application/docker-compose.yml
COMPOSE_PROD_FILE := application/docker-compose.prod.yml

# segredos vêm do .env do backend (gitignorado)
-include $(BACK)/.env

ENGINE := $(shell command -v docker 2>/dev/null || command -v podman 2>/dev/null)

COMPOSE_BIN := $(shell \
	if docker compose version >/dev/null 2>&1; then echo "docker compose"; \
	elif command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; \
	elif podman compose version >/dev/null 2>&1; then echo "podman compose"; \
	elif command -v podman-compose >/dev/null 2>&1; then echo "podman-compose"; \
	else echo "docker compose"; fi)
COMPOSE := $(COMPOSE_BIN) -f $(COMPOSE_FILE)
COMPOSE_PROD := $(COMPOSE_BIN) -f $(COMPOSE_PROD_FILE)

.DEFAULT_GOAL := help
.PHONY: help install install-front install-back \
        dev up down logs db db-stop back front web seed \
        prod-up prod-up-tunnel prod-down prod-logs \
        test test-front typecheck clean

# NOTE: parser avoids non-greedy regex so it works with both gawk (Fedora)
# and mawk (Debian/Ubuntu default).
help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

## ---- setup ----
install: install-front install-back ## Install all dependencies (front + back)

install-front: ## Install frontend dependencies
	cd $(FRONT) && npm install

install-back: ## Install backend dependencies
	cd $(BACK) && npm install

## ---- dev ----
dev: web ## Run the frontend (Expo web) — works offline with mock data

up: ## Full stack in containers (needs docker, or podman + a compose provider)
	$(COMPOSE) up --build

down: ## Stop and remove containers
	$(COMPOSE) down

logs: ## Tail container logs
	$(COMPOSE) logs -f

db: ## Start only Neo4j (reads NEO4J_PASSWORD from application/app-backend/.env)
	@test -n "$(NEO4J_PASSWORD)" || { echo "Defina NEO4J_PASSWORD em $(BACK)/.env (veja .env.example)"; exit 1; }
	-$(ENGINE) rm -f cachacaDB 2>/dev/null
	$(ENGINE) run -d --name cachacaDB \
		-p 127.0.0.1:7474:7474 -p 127.0.0.1:7687:7687 \
		-e NEO4J_AUTH=neo4j/$(NEO4J_PASSWORD) \
		-v cachaca_neo4j_data:/data \
		neo4j:5
	@echo "Neo4j up → http://localhost:7474 (usuário neo4j, bolt :7687)"

db-stop: ## Stop and remove the standalone Neo4j container
	-$(ENGINE) rm -f cachacaDB

## ---- dev (local, no docker) ----
front: web ## Run the frontend locally (Expo web)
web: ## Expo web dev server (http://localhost:8081)
	cd $(FRONT) && npm run web

back: ## Run the backend locally (ts-node, port 3000)
	cd $(BACK) && npm run dev

seed: ## (Re)load the Minas Gerais dataset into Neo4j
	cd $(BACK) && npm run seed

## ---- produção ----
prod-up: ## Production stack (Neo4j interno + app em 127.0.0.1:$$APP_PORT)
	$(COMPOSE_PROD) up -d --build

prod-up-tunnel: ## Production stack + túnel Cloudflare (exige TUNNEL_TOKEN no application/.env)
	$(COMPOSE_PROD) --profile tunnel up -d --build

prod-down: ## Stop the production stack
	$(COMPOSE_PROD) --profile tunnel down

prod-logs: ## Tail production logs
	$(COMPOSE_PROD) logs -f

## ---- quality ----
test: test-front ## Run the test suites
test-front: ## Frontend unit tests (Jest)
	cd $(FRONT) && npm test

typecheck: ## TypeScript type-check (frontend + backend)
	cd $(FRONT) && npm run typecheck
	cd $(BACK) && npm run typecheck

## ---- housekeeping ----
clean: ## Remove node_modules and build output
	rm -rf $(FRONT)/node_modules $(FRONT)/.expo $(FRONT)/web-build
	rm -rf $(BACK)/node_modules $(BACK)/dist
