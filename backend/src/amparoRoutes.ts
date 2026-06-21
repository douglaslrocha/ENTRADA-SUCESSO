import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import { z } from 'zod';

function getUserId(request: FastifyRequest): string {
  // Lê header customizado ou usa 'default'
  return (request.headers['x-user-id'] as string) || 'default';
}

const updateCatalogSchema = z.object({
  catalog_type: z.enum(['sensations', 'phenomena', 'fatuistica']),
  items: z.array(z.string()),
});

export async function amparoRoutes(fastify: FastifyInstance) {
  // -----------------------------------------------
  // GET /api/energy-work/catalog
  // Retorna os catálogos customizados salvos na VPS
  // -----------------------------------------------
  fastify.get('/api/energy-work/catalog', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const result = await db.query(
        'SELECT catalog_type, items FROM energy_work_catalogs WHERE user_id = $1',
        [userId]
      );

      const catalogs: Record<string, string[]> = {
        sensations: [],
        phenomena: [],
        fatuistica: []
      };

      for (const row of result.rows) {
        try {
          catalogs[row.catalog_type] = JSON.parse(row.items);
        } catch (e) {
          catalogs[row.catalog_type] = [];
        }
      }

      return catalogs;
    } catch (error: any) {
      console.error('[Amparo] Erro ao buscar catálogos de energia:', error);
      reply.status(500).send({ error: 'Erro ao buscar catálogos de bioenergias.' });
    }
  });

  // -----------------------------------------------
  // PUT /api/energy-work/catalog
  // Salva ou atualiza um catálogo específico na VPS (UPSERT)
  // -----------------------------------------------
  fastify.put('/api/energy-work/catalog', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const body = updateCatalogSchema.parse(request.body);
      const itemsJson = JSON.stringify(body.items);

      await db.query(
        `INSERT INTO energy_work_catalogs (user_id, catalog_type, items, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, catalog_type)
         DO UPDATE SET items = EXCLUDED.items, updated_at = CURRENT_TIMESTAMP`,
        [userId, body.catalog_type, itemsJson]
      );

      return { success: true };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Dados inválidos.', details: error.issues });
        return;
      }
      console.error('[Amparo] Erro ao atualizar catálogo de energia:', error);
      reply.status(500).send({ error: 'Erro ao atualizar catálogo de bioenergias.' });
    }
  });
}
