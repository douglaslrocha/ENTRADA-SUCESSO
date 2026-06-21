import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { aiGateway, GatewayRequest } from './gateway.js';
import { tokenomicsService } from './tokenomics.js';

export async function aiRoutes(fastify: FastifyInstance) {
  
  // Healthcheck route
  fastify.get('/api/health', async (request, reply) => {
    return { status: 'ok', time: new Date().toISOString() };
  });

  // POST /api/ai/chat - AI Gateway unificado
  fastify.post('/api/ai/chat', {
    config: {
      rateLimit: {
        max: 12, // Limite rígido anti-robô: máximo de 12 perguntas por minuto por IP/conexão
        timeWindow: '1 minute',
        errorResponseBuilder: (request: any, context: any) => {
          return {
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Alerta Antivírus / Anti-Bot: Sua conexão está enviando perguntas de maneira excessivamente rápida ou incomum. Este bloqueio preventivo impede que spams de robôs consumam sua API de forma destrutiva. Aguarde 60 segundos antes de enviar outra consulta.'
          };
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as GatewayRequest;
    const userApiKey = (request.headers['x-user-api-key'] as string) || '';

    if (!body || !body.provider || !body.messages || !Array.isArray(body.messages)) {
      reply.status(400).send({ error: 'Payload inválido. Exige provider e um array de mensagens.' });
      return;
    }

    if (body.stream) {
      // Configurar cabeçalhos para Server-Sent Events (SSE)
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*', // Configuração de segurança
      });

      try {
        await aiGateway.handleRequest(body, (chunkText: string) => {
          // Envia o chunk no formato SSE padrão: data: <chunk>\n\n
          reply.raw.write(`data: ${chunkText}\n\n`);
        }, userApiKey);
        
        // Finaliza o stream de forma limpa
        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();
      } catch (err: any) {
        console.error('[AI Gateway Stream Error]:', err);
        const errMsg = err.message || 'Erro interno no streaming de IA.';
        reply.raw.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
        reply.raw.end();
      }
    } else {
      // Chamada Síncrona convencional
      try {
        const result = await aiGateway.handleRequest(body, undefined, userApiKey);
        reply.send(result);
      } catch (err: any) {
        console.error('[AI Gateway Error]:', err);
        reply.status(500).send({ error: err.message || 'Erro interno no gateway de IA.' });
      }
    }
  });

  // GET /api/ai/usage - Estatísticas agregadas
  fastify.get('/api/ai/usage', async (request, reply) => {
    return tokenomicsService.getUsage();
  });

  // GET /api/ai/costs - Detalhamento de custos
  fastify.get('/api/ai/costs', async (request, reply) => {
    return tokenomicsService.getUsage();
  });

  // POST /api/ai/kill-switch - Controle do disjuntor de segurança
  fastify.post('/api/ai/kill-switch', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { 
      active?: boolean; 
      limitUSD?: number; 
      action?: 'clear' 
    };

    if (body) {
      if (body.active !== undefined) {
        tokenomicsService.setKillSwitch(body.active);
      }
      if (body.limitUSD !== undefined && typeof body.limitUSD === 'number') {
        tokenomicsService.setLimit(body.limitUSD);
      }
      if (body.action === 'clear') {
        tokenomicsService.clearStats();
      }
    }

    return tokenomicsService.getUsage();
  });

  // DELETE /api/system/reset/:module - Reset do banco de dados (SQLite)
  fastify.delete('/api/system/reset/:module', async (request: FastifyRequest, reply: FastifyReply) => {
    const { module } = request.params as { module: string };
    const userId = (request.headers['x-user-id'] as string) || 'default';
    
    // Evita loop ciclico no import, pegando a conexão diretamente
    const { db } = await import('./db.js');

    try {
      if (module === 'objectives') {
        await db.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM projects WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM goals WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM objectives WHERE user_id = $1', [userId]);
        return { success: true, message: 'Objetivos, metas, projetos e tarefas resetados no backend.' };
      } else if (module === 'diaries') {
        await db.query('DELETE FROM diary_entries WHERE user_id = $1', [userId]);
        return { success: true, message: 'Diários resetados no backend.' };
      } else if (module === 'workspaces') {
        await db.query('DELETE FROM pages WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM folders WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM workspaces WHERE user_id = $1', [userId]);
        return { success: true, message: 'Workspaces, pastas e páginas resetados no backend.' };
      } else if (module === 'financial') {
        await db.query('DELETE FROM financial_transactions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_projections WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_categories WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_mural WHERE user_id = $1', [userId]);
        return { success: true, message: 'Finanças (categorias, transações, projeções e mural) resetadas no backend.' };
      } else if (module === 'all') {
        // Expurgo completo de todas as tabelas do usuário
        await db.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM projects WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM goals WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM objectives WHERE user_id = $1', [userId]);
        
        await db.query('DELETE FROM diary_entries WHERE user_id = $1', [userId]);
        
        await db.query('DELETE FROM pages WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM folders WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM workspaces WHERE user_id = $1', [userId]);
        
        await db.query('DELETE FROM financial_transactions WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_projections WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_categories WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM financial_mural WHERE user_id = $1', [userId]);
        
        return { success: true, message: 'Sistema completamente resetado no backend.' };
      } else {
        reply.status(400).send({ error: 'Módulo desconhecido.' });
      }
    } catch (e: any) {
      console.error('[System Reset] Erro:', e);
      reply.status(500).send({ error: 'Erro interno ao resetar.' });
    }
  });
}
