# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the server with Nx (outputs to dist/apps/server/)
# Disable Nx daemon - doesn't work in Docker containers
ENV NX_DAEMON=false
RUN npx nx build server --configuration=production

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy built output (includes main.js, graphql/typeDefs/*.graphql)
COPY --from=builder /app/dist/apps/server ./

# Copy full node_modules from build stage (includes all transitive deps)
COPY --from=builder /app/node_modules ./node_modules

# Cloud Run uses PORT env var (defaults to 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "main.js"]
