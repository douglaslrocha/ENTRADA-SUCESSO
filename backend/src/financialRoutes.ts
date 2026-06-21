import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';

// ============================================
// Helpers
// ============================================

function getUserId(request: FastifyRequest): string {
  return (request.headers['x-user-id'] as string) || 'default';
}

function safeJsonParse(val: any, fallback: any = []) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return fallback; }
  }
  return val || fallback;
}

interface SyncPayload {
  categories: any[];
  transactions: any[];
  projections: any[];
  mural: {
    netWorth: any;
    assets: any[];
    vault: any[];
    links: any[];
  };
}

export async function financialRoutes(fastify: FastifyInstance) {

  // --------------------------------------------------
  // GET /api/financial
  // Carrega toda a estrutura financeira do usuário
  // --------------------------------------------------
  fastify.get('/api/financial', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      // 1. Carrega Categorias
      const categoriesResult = await db.query(
        'SELECT * FROM financial_categories WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
      );

      // 2. Carrega Transações
      const transactionsResult = await db.query(
        'SELECT * FROM financial_transactions WHERE user_id = $1 ORDER BY date DESC',
        [userId]
      );

      // 3. Carrega Projeções (Cotas)
      const projectionsResult = await db.query(
        'SELECT * FROM financial_projections WHERE user_id = $1',
        [userId]
      );

      // 4. Carrega Mural do Sucesso
      const muralResult = await db.query(
        'SELECT * FROM financial_mural WHERE user_id = $1',
        [userId]
      );

      const categories = categoriesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type
      }));

      const transactions = transactionsResult.rows.map(row => ({
        id: row.id,
        value: Number(row.value),
        category_id: row.category_id,
        date: row.date,
        note: row.note || ''
      }));

      const projections = projectionsResult.rows.map(row => ({
        category_id: row.category_id,
        allowed_value: Number(row.allowed_value),
        month: Number(row.month),
        year: Number(row.year)
      }));

      let mural = {
        netWorth: { current_cash: 0.00 },
        assets: [] as any[],
        vault: [] as any[],
        links: [] as any[]
      };

      if (muralResult.rows.length > 0) {
        const row = muralResult.rows[0];
        mural = {
          netWorth: safeJsonParse(row.net_worth, { current_cash: 0.00 }),
          assets: safeJsonParse(row.assets, []),
          vault: safeJsonParse(row.vault, []),
          links: safeJsonParse(row.links, [])
        };
      }

      return {
        categories,
        transactions,
        projections,
        mural
      };
    } catch (error: any) {
      console.error('[Financial API] Erro ao carregar dados financeiros:', error);
      reply.status(500).send({ error: 'Erro ao carregar dados financeiros.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/financial/sync
  // Sincronização completa em lote
  // --------------------------------------------------
  fastify.put('/api/financial/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { categories = [], transactions = [], projections = [], mural } = request.body as SyncPayload;

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Sincroniza Categorias
      const categoryIds = categories.map(c => c.id);
      if (categoryIds.length > 0) {
        const placeholders = categoryIds.map((_, i) => `$${i + 2}`).join(', ');
        await client.query(
          `DELETE FROM financial_categories WHERE user_id = $1 AND id NOT IN (${placeholders})`,
          [userId, ...categoryIds]
        );
      } else {
        await client.query('DELETE FROM financial_categories WHERE user_id = $1', [userId]);
      }

      for (const cat of categories) {
        await client.query(`
          INSERT INTO financial_categories (id, user_id, name, type, updated_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            updated_at = CURRENT_TIMESTAMP
          ON CONFLICT (user_id, name) DO UPDATE SET
            type = EXCLUDED.type,
            updated_at = CURRENT_TIMESTAMP
        `, [cat.id, userId, cat.name, cat.type]);
      }

      // 2. Sincroniza Transações
      const transactionIds = transactions.map(t => t.id);
      if (transactionIds.length > 0) {
        const placeholders = transactionIds.map((_, i) => `$${i + 2}`).join(', ');
        await client.query(
          `DELETE FROM financial_transactions WHERE user_id = $1 AND id NOT IN (${placeholders})`,
          [userId, ...transactionIds]
        );
      } else {
        await client.query('DELETE FROM financial_transactions WHERE user_id = $1', [userId]);
      }

      for (const t of transactions) {
        await client.query(`
          INSERT INTO financial_transactions (id, user_id, value, category_id, date, note, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            value = EXCLUDED.value,
            category_id = EXCLUDED.category_id,
            date = EXCLUDED.date,
            note = EXCLUDED.note,
            updated_at = CURRENT_TIMESTAMP
        `, [t.id, userId, Number(t.value), t.category_id, new Date(t.date), t.note || '']);
      }

      // 3. Sincroniza Projeções (Cotas)
      // Como projeções não têm uma ID única de string no frontend, limpamos e re-inserimos todas do usuário
      await client.query('DELETE FROM financial_projections WHERE user_id = $1', [userId]);

      for (const p of projections) {
        await client.query(`
          INSERT INTO financial_projections (user_id, category_id, allowed_value, month, year)
          VALUES ($1, $2, $3, $4, $5)
        `, [userId, p.category_id, Number(p.allowed_value), p.month, p.year]);
      }

      // 4. Sincroniza Mural do Sucesso
      if (mural) {
        await client.query(`
          INSERT INTO financial_mural (user_id, net_worth, assets, vault, links, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            net_worth = EXCLUDED.net_worth,
            assets = EXCLUDED.assets,
            vault = EXCLUDED.vault,
            links = EXCLUDED.links,
            updated_at = CURRENT_TIMESTAMP
        `, [
          userId,
          JSON.stringify(mural.netWorth || { current_cash: 0.00 }),
          JSON.stringify(mural.assets || []),
          JSON.stringify(mural.vault || []),
          JSON.stringify(mural.links || [])
        ]);
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error('[Financial API] Erro ao sincronizar dados financeiros:', error);
      reply.status(500).send({ error: 'Erro ao sincronizar dados financeiros.' });
    } finally {
      client.release();
    }
  });

  // --------------------------------------------------
  // PUT /api/financial/categories/:id
  // Cria ou atualiza uma única categoria
  // --------------------------------------------------
  fastify.put('/api/financial/categories/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const { name, type } = request.body as any;

    try {
      const result = await db.query(`
        INSERT INTO financial_categories (id, user_id, name, type, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          updated_at = CURRENT_TIMESTAMP
        ON CONFLICT (user_id, name) DO UPDATE SET
          type = EXCLUDED.type,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [id, userId, name, type]);

      return { success: true, category: result.rows[0] };
    } catch (error: any) {
      console.error('[Financial API] Erro ao salvar categoria:', error);
      reply.status(500).send({ error: 'Erro ao salvar categoria.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/financial/categories/:id
  // Remove uma categoria
  // --------------------------------------------------
  fastify.delete('/api/financial/categories/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query(
        'DELETE FROM financial_categories WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return { success: true };
    } catch (error: any) {
      console.error('[Financial API] Erro ao deletar categoria:', error);
      reply.status(500).send({ error: 'Erro ao deletar categoria.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/financial/transactions/:id
  // Cria ou atualiza uma única transação
  // --------------------------------------------------
  fastify.put('/api/financial/transactions/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const { value, category_id, date, note } = request.body as any;

    try {
      const result = await db.query(`
        INSERT INTO financial_transactions (id, user_id, value, category_id, date, note, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          value = EXCLUDED.value,
          category_id = EXCLUDED.category_id,
          date = EXCLUDED.date,
          note = EXCLUDED.note,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [id, userId, Number(value), category_id, new Date(date), note || '']);

      return { success: true, transaction: result.rows[0] };
    } catch (error: any) {
      console.error('[Financial API] Erro ao salvar transação:', error);
      reply.status(500).send({ error: 'Erro ao salvar transação.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/financial/transactions/:id
  // Remove uma transação
  // --------------------------------------------------
  fastify.delete('/api/financial/transactions/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query(
        'DELETE FROM financial_transactions WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
      return { success: true };
    } catch (error: any) {
      console.error('[Financial API] Erro ao deletar transação:', error);
      reply.status(500).send({ error: 'Erro ao deletar transação.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/financial/projections
  // Salva ou atualiza uma projeção (Cota)
  // --------------------------------------------------
  fastify.put('/api/financial/projections', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { category_id, allowed_value, month, year } = request.body as any;

    try {
      const result = await db.query(`
        INSERT INTO financial_projections (user_id, category_id, allowed_value, month, year, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, category_id, month, year) DO UPDATE SET
          allowed_value = EXCLUDED.allowed_value,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [userId, category_id, Number(allowed_value), month, year]);

      return { success: true, projection: result.rows[0] };
    } catch (error: any) {
      console.error('[Financial API] Erro ao salvar projeção:', error);
      reply.status(500).send({ error: 'Erro ao salvar projeção.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/financial/mural
  // Salva os dados do Mural do Sucesso
  // --------------------------------------------------
  fastify.put('/api/financial/mural', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { netWorth, assets, vault, links } = request.body as any;

    try {
      const result = await db.query(`
        INSERT INTO financial_mural (user_id, net_worth, assets, vault, links, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) DO UPDATE SET
          net_worth = EXCLUDED.net_worth,
          assets = EXCLUDED.assets,
          vault = EXCLUDED.vault,
          links = EXCLUDED.links,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId,
        JSON.stringify(netWorth || { current_cash: 0.00 }),
        JSON.stringify(assets || []),
        JSON.stringify(vault || []),
        JSON.stringify(links || [])
      ]);

      return { success: true, mural: result.rows[0] };
    } catch (error: any) {
      console.error('[Financial API] Erro ao salvar mural:', error);
      reply.status(500).send({ error: 'Erro ao salvar mural.' });
    }
  });
}
