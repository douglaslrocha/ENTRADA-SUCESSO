import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// ============================================
// Schemas de Validação (Zod)
// ============================================

const answerSchema = z.object({
  block_id: z.string().min(1).max(50),
  input_id: z.string().min(1).max(50),
  answer: z.string().max(10000),
});

const bulkAnswersSchema = z.object({
  answers: z.array(answerSchema),
});

const addMediaSchema = z.object({
  block_id: z.string().min(1).max(50),
  media_type: z.enum(['image', 'video', 'youtube']),
  url: z.string().min(1).max(5000),
  sort_order: z.number().int().min(0).optional(),
});

const reorderMediaSchema = z.object({
  block_id: z.string().min(1).max(50),
  media_ids: z.array(z.string().uuid()),
});

// ============================================
// Helpers
// ============================================

// Usuário padrão — quando implementar auth real, extrair do JWT/session
function getUserId(request: FastifyRequest): string {
  // Lê header customizado ou usa 'default'
  return (request.headers['x-user-id'] as string) || 'default';
}

// Diretório de uploads (persistido no container via volume)
const UPLOADS_DIR = process.env.UPLOADS_DIR ? path.join(path.dirname(process.env.UPLOADS_DIR), 'identity') : path.resolve(process.cwd(), '../uploads/identity');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

// ============================================
// Rotas de Identidade
// ============================================

export async function identityRoutes(fastify: FastifyInstance) {

  // -----------------------------------------------
  // GET /api/identity/answers
  // Retorna todas as respostas do usuário
  // -----------------------------------------------
  fastify.get('/api/identity/answers', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const result = await db.query(
        'SELECT block_id, input_id, answer, updated_at FROM identity_answers WHERE user_id = $1 ORDER BY block_id, input_id',
        [userId]
      );

      // Retorna como Record<input_id, answer> para compatibilidade com o frontend
      const answers: Record<string, string> = {};
      for (const row of result.rows) {
        answers[row.input_id] = row.answer;
      }

      return { answers };
    } catch (error: any) {
      console.error('[Identity] Erro ao buscar respostas:', error);
      reply.status(500).send({ error: 'Erro ao buscar respostas de identidade.' });
    }
  });

  // -----------------------------------------------
  // PUT /api/identity/answers
  // Salva/atualiza respostas (upsert em lote)
  // -----------------------------------------------
  fastify.put('/api/identity/answers', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    
    try {
      const body = bulkAnswersSchema.parse(request.body);

      if (body.answers.length === 0) {
        return { success: true, updated: 0 };
      }

      // Upsert em lote usando transação
      const client = await db.getClient();
      let updated = 0;

      try {
        await client.query('BEGIN');

        for (const item of body.answers) {
          await client.query(
            `INSERT INTO identity_answers (user_id, block_id, input_id, answer)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, input_id) 
             DO UPDATE SET answer = EXCLUDED.answer, block_id = EXCLUDED.block_id, updated_at = CURRENT_TIMESTAMP`,
            [userId, item.block_id, item.input_id, item.answer]
          );
          updated++;
        }

        await client.query('COMMIT');
      } catch (txError) {
        await client.query('ROLLBACK');
        throw txError;
      } finally {
        client.release();
      }

      return { success: true, updated };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Dados inválidos.', details: error.issues });
        return;
      }
      console.error('[Identity] Erro ao salvar respostas:', error);
      reply.status(500).send({ error: 'Erro ao salvar respostas de identidade.' });
    }
  });

  // -----------------------------------------------
  // GET /api/identity/media
  // Retorna todas as mídias do usuário agrupadas por bloco
  // -----------------------------------------------
  fastify.get('/api/identity/media', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const result = await db.query(
        'SELECT id, block_id, media_type, url, sort_order FROM identity_media WHERE user_id = $1 ORDER BY block_id, sort_order',
        [userId]
      );

      // Agrupa por block_id para compatibilidade com o frontend
      const media: Record<string, Array<{ id: string; type: string; url: string }>> = {};
      for (const row of result.rows) {
        if (!media[row.block_id]) {
          media[row.block_id] = [];
        }
        media[row.block_id].push({
          id: row.id,
          type: row.media_type,
          url: row.url,
        });
      }

      return { media };
    } catch (error: any) {
      console.error('[Identity] Erro ao buscar mídias:', error);
      reply.status(500).send({ error: 'Erro ao buscar mídias de identidade.' });
    }
  });

  // -----------------------------------------------
  // POST /api/identity/media
  // Adiciona uma mídia (YouTube URL ou link externo)
  // -----------------------------------------------
  fastify.post('/api/identity/media', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const body = addMediaSchema.parse(request.body);

      // Calcula o próximo sort_order
      const countResult = await db.query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM identity_media WHERE user_id = $1 AND block_id = $2',
        [userId, body.block_id]
      );
      const sortOrder = body.sort_order ?? countResult.rows[0].next_order;

      const result = await db.query(
        `INSERT INTO identity_media (user_id, block_id, media_type, url, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, block_id, media_type, url, sort_order`,
        [userId, body.block_id, body.media_type, body.url, sortOrder]
      );

      return {
        success: true,
        media: {
          id: result.rows[0].id,
          type: result.rows[0].media_type,
          url: result.rows[0].url,
        }
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Dados inválidos.', details: error.issues });
        return;
      }
      console.error('[Identity] Erro ao adicionar mídia:', error);
      reply.status(500).send({ error: 'Erro ao adicionar mídia.' });
    }
  });

  // -----------------------------------------------
  // POST /api/identity/media/upload
  // Upload de arquivo de mídia (imagem/vídeo)
  // Recebe base64 e salva como arquivo, retorna URL
  // -----------------------------------------------
  fastify.post('/api/identity/media/upload', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const body = request.body as {
        block_id: string;
        media_type: 'image' | 'video';
        data: string; // base64 data URL
        filename?: string;
      };

      if (!body.block_id || !body.media_type || !body.data) {
        reply.status(400).send({ error: 'Campos obrigatórios: block_id, media_type, data' });
        return;
      }

      ensureUploadsDir();

      // Extrai dados do base64
      const matches = body.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        reply.status(400).send({ error: 'Formato de dados inválido. Envie base64 data URL.' });
        return;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Limita tamanho (10MB)
      if (buffer.length > 10 * 1024 * 1024) {
        reply.status(400).send({ error: 'Arquivo muito grande. Máximo: 10MB.' });
        return;
      }

      // Gera nome único
      const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'bin';
      const filename = `${userId}_${body.block_id}_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      // Salva arquivo
      fs.writeFileSync(filePath, buffer);

      // URL pública servida pelo Nginx
      const url = `/uploads/identity/${filename}`;

      // Calcula sort_order
      const countResult = await db.query(
        'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM identity_media WHERE user_id = $1 AND block_id = $2',
        [userId, body.block_id]
      );
      const sortOrder = countResult.rows[0].next_order;

      // Salva no banco
      const result = await db.query(
        `INSERT INTO identity_media (user_id, block_id, media_type, url, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, block_id, media_type, url, sort_order`,
        [userId, body.block_id, body.media_type, url, sortOrder]
      );

      return {
        success: true,
        media: {
          id: result.rows[0].id,
          type: result.rows[0].media_type,
          url: result.rows[0].url,
        }
      };
    } catch (error: any) {
      console.error('[Identity] Erro ao fazer upload:', error);
      reply.status(500).send({ error: 'Erro ao fazer upload de mídia.' });
    }
  });

  // -----------------------------------------------
  // DELETE /api/identity/media/:id
  // Remove uma mídia específica
  // -----------------------------------------------
  fastify.delete('/api/identity/media/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      // Busca a mídia para verificar se é um arquivo local
      const mediaResult = await db.query(
        'SELECT url FROM identity_media WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (mediaResult.rows.length === 0) {
        reply.status(404).send({ error: 'Mídia não encontrada.' });
        return;
      }

      const mediaUrl = mediaResult.rows[0].url;

      // Se for um upload local, deleta o arquivo
      if (mediaUrl.startsWith('/uploads/')) {
        const filePath = path.join('/app', mediaUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // Remove do banco
      await db.query(
        'DELETE FROM identity_media WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      return { success: true };
    } catch (error: any) {
      console.error('[Identity] Erro ao remover mídia:', error);
      reply.status(500).send({ error: 'Erro ao remover mídia.' });
    }
  });

  // -----------------------------------------------
  // DELETE /api/identity/media/block/:blockId
  // Remove todas as mídias de um bloco
  // -----------------------------------------------
  fastify.delete('/api/identity/media/block/:blockId', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { blockId } = request.params as { blockId: string };

    try {
      // Busca arquivos locais para deletar
      const mediaResult = await db.query(
        'SELECT url FROM identity_media WHERE user_id = $1 AND block_id = $2',
        [userId, blockId]
      );

      for (const row of mediaResult.rows) {
        if (row.url.startsWith('/uploads/')) {
          const filePath = path.join('/app', row.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }

      // Remove do banco
      const result = await db.query(
        'DELETE FROM identity_media WHERE user_id = $1 AND block_id = $2',
        [userId, blockId]
      );

      return { success: true, deleted: result.rowCount };
    } catch (error: any) {
      console.error('[Identity] Erro ao limpar mídias do bloco:', error);
      reply.status(500).send({ error: 'Erro ao limpar mídias do bloco.' });
    }
  });

  // -----------------------------------------------
  // PUT /api/identity/media/reorder
  // Reordena mídias de um bloco
  // -----------------------------------------------
  fastify.put('/api/identity/media/reorder', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      const body = reorderMediaSchema.parse(request.body);
      
      const client = await db.getClient();
      try {
        await client.query('BEGIN');
        
        for (let i = 0; i < body.media_ids.length; i++) {
          await client.query(
            'UPDATE identity_media SET sort_order = $1 WHERE id = $2 AND user_id = $3 AND block_id = $4',
            [i, body.media_ids[i], userId, body.block_id]
          );
        }

        await client.query('COMMIT');
      } catch (txError) {
        await client.query('ROLLBACK');
        throw txError;
      } finally {
        client.release();
      }

      return { success: true };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        reply.status(400).send({ error: 'Dados inválidos.', details: error.issues });
        return;
      }
      console.error('[Identity] Erro ao reordenar mídias:', error);
      reply.status(500).send({ error: 'Erro ao reordenar mídias.' });
    }
  });
}
