import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import { z } from 'zod';

function getUserId(request: FastifyRequest): string {
  return (request.headers['x-user-id'] as string) || 'default';
}

const updateCognitiveSettingsSchema = z.object({
  global_personality: z.string(),
  temperature: z.number(),
  selected_model: z.string(),
  knowledge_constraint: z.enum(['flexible', 'strict']),
  knowledge_docs: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['pdf', 'book', 'link']),
    addedAt: z.string(),
    size: z.string(),
    value: z.string().optional()
  })),
});

export async function aiCognitiveRoutes(fastify: FastifyInstance) {
  // GET /api/ai/cognitive-settings
  fastify.get('/api/ai/cognitive-settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const result = await db.query(
        'SELECT global_personality, temperature, selected_model, knowledge_constraint, knowledge_docs FROM ai_cognitive_settings WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          global_personality: "Você é a Amparadora de Próxima Geração. Deve agir com extrema empatia, pragmatismo analítico e inteligência holística. Seu rumo de conversa deve ser focado em apoiar minhas tomadas de decisão de forma lúcida, equilibrada e focada no auto-aperfeiçoamento quotidiano. Evite respostas genéricas e traga uma visão madura baseada em lógica.",
          temperature: 0.7,
          selected_model: "gpt-4o-mini",
          knowledge_constraint: "flexible",
          knowledge_docs: []
        };
      }

      const row = result.rows[0];
      let knowledgeDocsParsed = [];
      try {
        knowledgeDocsParsed = JSON.parse(row.knowledge_docs);
      } catch (e) {
        knowledgeDocsParsed = [];
      }

      return {
        global_personality: row.global_personality,
        temperature: Number(row.temperature),
        selected_model: row.selected_model,
        knowledge_constraint: row.knowledge_constraint,
        knowledge_docs: knowledgeDocsParsed
      };
    } catch (error: any) {
      console.error('[AI Cognitive Settings] Erro ao buscar configurações:', error);
      reply.status(500).send({ error: 'Erro ao buscar configurações cognitivas.' });
    }
  });

  // PUT /api/ai/cognitive-settings
  fastify.put('/api/ai/cognitive-settings', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const body = updateCognitiveSettingsSchema.parse(request.body);
      const docsJson = JSON.stringify(body.knowledge_docs);

      await db.query(
        `INSERT INTO ai_cognitive_settings (user_id, global_personality, temperature, selected_model, knowledge_constraint, knowledge_docs, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id)
         DO UPDATE SET 
           global_personality = EXCLUDED.global_personality, 
           temperature = EXCLUDED.temperature,
           selected_model = EXCLUDED.selected_model,
           knowledge_constraint = EXCLUDED.knowledge_constraint,
           knowledge_docs = EXCLUDED.knowledge_docs,
           updated_at = CURRENT_TIMESTAMP`,
        [userId, body.global_personality, body.temperature, body.selected_model, body.knowledge_constraint, docsJson]
      );

      return { success: true };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Dados inválidos.', details: error.issues });
        return;
      }
      console.error('[AI Cognitive Settings] Erro ao atualizar configurações cognitivas:', error);
      reply.status(500).send({ error: 'Erro ao atualizar configurações cognitivas.' });
    }
  });
}
