import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { aiRoutes } from './routes.js';
import { identityRoutes } from './identityRoutes.js';
import { diaryRoutes } from './diaryRoutes.js';
import { objectivesRoutes } from './objectivesRoutes.js';
import { financialRoutes } from './financialRoutes.js';
import { workspaceRoutes } from './workspaceRoutes.js';
import { amparoRoutes } from './amparoRoutes.js';
import { aiCognitiveRoutes } from './aiCognitiveRoutes.js';
import { runMigrations } from './migrate.js';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

const isProduction = process.env.NODE_ENV === 'production';

const fastify = Fastify({
  logger: isProduction
    ? true
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
      },
});

// Configure CORS
await fastify.register(cors, {
  origin: '*', // Permitir todas as origens para facilitar a transição de frontend/backend local e VPS
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Configure Rate-Limiting to prevent cost explosion (loops client-side)
await fastify.register(rateLimit, {
  max: 100, // Limite de 100 requisições
  timeWindow: '1 minute', // Por minuto
  errorResponseBuilder: (request, context) => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Taxa limite de segurança de requisições excedida. Para prevenir loops infinitos e explosão de custos, sua conexão foi suspensa temporariamente por 1 minuto.',
    };
  },
});

// Register Routes
await fastify.register(multipart);

// Serve static uploads locally
await fastify.register(fastifyStatic, {
  root: path.resolve(process.cwd(), '../uploads'),
  prefix: '/uploads/',
  decorateReply: false,
});

// Register Swagger
await fastify.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Douglas L. Rocha OS API',
      description: 'API documentation for the Personal OS backend',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
});
await fastify.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

await fastify.register(aiRoutes);
await fastify.register(identityRoutes);
await fastify.register(diaryRoutes);
await fastify.register(objectivesRoutes);
await fastify.register(financialRoutes);
await fastify.register(workspaceRoutes);
await fastify.register(amparoRoutes);
await fastify.register(aiCognitiveRoutes);

// Start Server
const start = async () => {
  try {
    // Executa migrations antes de iniciar o servidor
    try {
      await runMigrations();
    } catch (migrationError) {
      console.error('[Server] Erro nas migrations (continuando):', migrationError);
    }

    const address = await fastify.listen({
      port: config.port,
      host: config.host,
    });
    console.log(`[Server] Fastify escutando em ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
