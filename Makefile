FRONT := application/app-frontend
BACK  := application/app-backend
COMPOSE_FILE := application/docker-compose.yml

ENGINE := $(shell command -v docker 2>/dev/null || command -v podman 2>/dev/null)

COMPOSE := $(shell \
	if docker compose version >/dev/null 2>&1; then echo "docker compose"; \
	elif command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; \
	elif podman compose version >/dev/null 2>&1; then echo "podman compose"; \
	elif command -v podman-compose >/dev/null 2>&1; then echo "podman-compose"; \
	else echo "docker compose"; fi) -f $(COMPOSE_FILE)

.DEFAULT_GOAL := help
.PHONY: help install install-front install-back \
        dev up down logs db db-stop back front web seed \
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

db: ## Start only Neo4j (docker/podman run, no compose needed — browser at :7474)
	-$(ENGINE) rm -f adegaDB 2>/dev/null
	$(ENGINE) run -d --name adegaDB \
		-p 7474:7474 -p 7687:7687 \
		-e NEO4J_AUTH=neo4j/senha123 \
		-v adega_neo4j_data:/data \
		neo4j:5
	@echo "Neo4j up → http://localhost:7474  (user neo4j / pass senha123, bolt :7687)"

db-stop: ## Stop and remove the standalone Neo4j container
	-$(ENGINE) rm -f adegaDB

## ---- dev (local, no docker) ----
front: web ## Run the frontend locally (Expo web)
web: ## Expo web dev server (http://localhost:8081)
	cd $(FRONT) && npm run web

back: ## Run the backend locally (ts-node, port 3000)
	cd $(BACK) && npm run dev

seed: ## Load initial data into Neo4j
	cd $(BACK) && npm run seed

## ---- quality ----
test: test-front ## Run the test suites
test-front: ## Frontend unit tests (Jest)
	cd $(FRONT) && npm test

typecheck: ## TypeScript type-check (frontend + backend)
	cd $(FRONT) && npm run typecheck
	cd $(BACK) && npx tsc --noEmit

## ---- housekeeping ----
clean: ## Remove node_modules and build output
	rm -rf $(FRONT)/node_modules $(FRONT)/.expo $(FRONT)/web-build
	rm -rf $(BACK)/node_modules $(BACK)/dist
