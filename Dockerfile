# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the server with Nx (outputs to dist/apps/server/)
RUN npx nx build server --configuration=production

# Prune to production package.json
RUN npx nx run server:prune-lockfile

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy built output (includes main.js, graphql/typeDefs/*.graphql, generated package.json)
COPY --from=builder /app/dist/apps/server ./

# Copy Prisma schema and migrations for runtime
COPY --from=builder /app/prisma ./prisma/

# Install production-only dependencies from generated package.json
RUN npm ci --omit=dev

# Generate Prisma Client in production image
RUN npx prisma generate

# Cloud Run uses PORT env var (defaults to 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "main.js"]
