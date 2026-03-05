import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './graphql/resolvers';
import prisma from './services/prisma.service';

const isProduction = process.env.NODE_ENV === 'production';

// Load all .graphql type definition files
function loadTypeDefs(): string {
  const typeDefsDir = join(__dirname, 'graphql', 'typeDefs');
  const files = [
    'schema.graphql',
    'common.graphql',
    'employee.graphql',
    'department.graphql',
    'review.graphql',
    'analytics.graphql',
    'auth.graphql',
  ];

  return files
    .map((file) => readFileSync(join(typeDefsDir, file), 'utf-8'))
    .join('\n');
}

function getCorsOrigins(): string[] {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(',').map((o) => o.trim());
  }
  return ['http://localhost:4200', 'http://localhost:4000'];
}

async function startServer() {
  const app = express();

  const typeDefs = loadTypeDefs();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: !isProduction,
  });

  await server.start();

  app.use(cors({ origin: getCorsOrigins(), credentials: true }));
  app.use(express.json());

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract user from Authorization header (dev mode)
        const authHeader = req.headers.authorization;
        let user = null;

        if (authHeader?.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
            user = await prisma.user.findUnique({
              where: { id: decoded.userId },
              include: { employee: true },
            });
          } catch {
            // Invalid token, continue without user
          }
        }

        return { user };
      },
    })
  );

  // Health check
  app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = process.env.PORT || 4000;
  const httpServer = app.listen(port, () => {
    console.log(`TalentFlow GraphQL API ready on port ${port}`);
    console.log(`Health check at /health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`${signal} received, shutting down...`);
    httpServer.close();
    await server.stop();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
