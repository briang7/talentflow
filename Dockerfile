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

# Patch generated package.json: add graphql (peer dep of @apollo/server, not auto-detected by Nx)
RUN node -e "const p=require('./dist/apps/server/package.json'); p.dependencies.graphql='16.13.0'; require('fs').writeFileSync('./dist/apps/server/package.json', JSON.stringify(p,null,2));"

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy built output (includes main.js, graphql/typeDefs/*.graphql, patched package.json)
COPY --from=builder /app/dist/apps/server ./

# Install production-only dependencies from patched package.json
RUN npm install --legacy-peer-deps --omit=dev

# Copy generated Prisma Client from build stage (native binaries, skip re-generation)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Cloud Run uses PORT env var (defaults to 8080)
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "main.js"]
