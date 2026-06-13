# Imagem única de produção: web estático (Expo export) servido pela API Express.

# --- build do web ---
FROM node:20 AS web
WORKDIR /web
COPY app-frontend/package*.json ./
RUN npm ci
COPY app-frontend/ .
# URL vazia = requisições relativas, mesma origem do túnel
ENV EXPO_PUBLIC_API_URL=""
RUN npx expo export --platform web --output-dir dist

# --- build da api ---
FROM node:20-alpine AS api
WORKDIR /api
COPY app-backend/package*.json ./
RUN npm ci
COPY app-backend/ .
RUN npm run build && npm prune --omit=dev

# --- runtime ---
FROM node:20-alpine
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0 WEB_DIST=/app/web
WORKDIR /app
COPY --from=api /api/node_modules ./node_modules
COPY --from=api /api/dist ./dist
COPY --from=api /api/package.json ./package.json
COPY --from=web /web/dist ./web
EXPOSE 8080
USER node
# seed roda em modo "pula se já tem dados", depois sobe o servidor
CMD ["sh", "-c", "node dist/scripts/seed.js && exec node dist/server.js"]
