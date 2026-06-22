import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from './db.js';

function getUserId(request: FastifyRequest): string {
  return (request.headers['x-user-id'] as string) || 'default';
}

function safeJsonParse(val: any, fallback: any = []) {
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return fallback; }
  }
  return val || fallback;
}

function cleanForeignKey(id: any): string | null {
  if (!id || id === 'none' || id === 'draft' || id === 'draft-task' || String(id).trim() === '') {
    return null;
  }
  return id;
}

// Helpers de mapeamento de banco para frontend
function mapObjectiveDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    burningDesire: row.burning_desire || '',
    feelingOfAchievement: row.feeling_of_achievement || '',
    priority: row.priority || 'medium',
    manifestationStatus: row.manifestation_status || 'conception',
    sacrifice: row.sacrifice || '',
    actionPlan: row.action_plan || '',
    startDate: row.start_date ? new Date(row.start_date).getTime() : undefined,
    deadline: row.deadline ? new Date(row.deadline).getTime() : undefined,
    mentalRecurrence: row.mental_recurrence === 1,
    manifestationImages: safeJsonParse(row.manifestation_images, []),
    motivationalVideos: safeJsonParse(row.motivational_videos, []),
    evolutionaryContext: row.evolutionary_context || '',
    risks: safeJsonParse(row.risks, []),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    goalIds: []
  };
}

function mapGoalDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    objectiveId: row.objetivo_id,
    intention: row.intention,
    description: row.description || '',
    meaning: row.meaning || '',
    expectedEvolution: row.expected_evolution || '',
    deadline: row.deadline ? new Date(row.deadline).getTime() : undefined,
    consequence: row.consequence || '',
    risks: row.risks || '',
    impactLevel: row.impact_level || 'medium',
    strategy: row.strategy || '',
    color: row.color || '#c3b1e1',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
  };
}

function mapTaskDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    goalId: row.meta_id,
    parentTaskId: row.parent_task_id || null,
    title: row.title,
    executionType: row.execution_type || 'standard',
    description: row.description || '',
    visualAnchorUrl: row.visual_anchor_url || '',
    status: row.status || 'todo',
    complexity: row.complexity || 'low',
    subtasks: safeJsonParse(row.subtasks, []),
    scheduledDate: row.scheduled_date ? new Date(row.scheduled_date).getTime() : undefined,
    estimatedDuration: row.estimated_duration || '',
    actualDuration: parseInt(row.actual_duration || '0', 10),
    isRecurring: row.is_recurring === 1,
    recurrencePattern: row.recurrence_pattern || '',
    recurrenceDays: safeJsonParse(row.recurrence_days, []),
    parentRecurrenceId: row.parent_recurrence_id || null,
    priority: row.priority || 'medium',
    strategicImpact: row.strategic_impact || 'medium',
    energyVolume: parseInt(row.energy_volume || '0', 10),
    syncModality: parseInt(row.sync_modality || '0', 10),
    hyperlucidity: parseInt(row.hyperlucidity || '0', 10),
    technique: row.technique || '',
    sensations: safeJsonParse(row.sensations, []),
    phenomena: safeJsonParse(row.phenomena, []),
    selfResearchNotes: row.self_research_notes || '',
    linkedDocumentIds: safeJsonParse(row.linked_document_ids, []),
    audioUrl: row.audio_url || '',
    audioDuration: parseInt(row.audio_duration || '0', 10),
    audioNotes: row.audio_notes || '',
    documentUrl: row.document_url || '',
    writtenContent: row.written_content || '',
    wordCount: parseInt(row.word_count || '0', 10),
    transactionValue: parseFloat(row.transaction_value || '0.00'),
    transactionType: row.transaction_type || null,
    financialCategoryId: row.financial_category_id || null,
    receiptUrl: row.receipt_url || '',
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
  };
}

export async function objectivesRoutes(fastify: FastifyInstance) {

  // --------------------------------------------------
  // GET /api/objetivos
  // Retorna toda a árvore de objetivos, metas e tarefas
  // --------------------------------------------------
  fastify.get('/api/objetivos', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      // Busca todos os dados do banco para o usuário
      const objectivesRes = await db.query('SELECT * FROM objetivos WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      const goalsRes = await db.query('SELECT * FROM metas WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      const tasksRes = await db.query('SELECT * FROM tarefas WHERE user_id = $1 ORDER BY created_at ASC', [userId]);

      const objectives = objectivesRes.rows.map(mapObjectiveDbToFrontend);
      const goals = goalsRes.rows.map(mapGoalDbToFrontend);
      const projects: any[] = [];
      const tasks = tasksRes.rows.map(mapTaskDbToFrontend);

      // Preenche relacionamentos (IDs)
      const goalsMap = new Map<string, any>(goals.map(g => [g.id, g]));
      const tasksMap = new Map<string, any>(tasks.map(t => [t.id, t]));
      const objectivesMap = new Map<string, any>(objectives.map(o => [o.id, o]));

      // Metas -> Objetivos
      for (const goal of goals) {
        const obj = objectivesMap.get(goal.objectiveId);
        if (obj) {
          if (!obj.goalIds) obj.goalIds = [];
          if (!obj.goalIds.includes(goal.id)) obj.goalIds.push(goal.id);
        }
      }

      // Tarefas -> Metas / Subtarefas
      for (const task of tasks) {
        if (task.parentTaskId) {
          const parent = tasksMap.get(task.parentTaskId);
          if (parent) {
            if (!parent.subtaskIds) parent.subtaskIds = [];
            if (!parent.subtaskIds.includes(task.id)) parent.subtaskIds.push(task.id);
          }
        }
      }

      return {
        objectives,
        goals,
        projects,
        tasks
      };
    } catch (error) {
      console.error('[Objectives API] Erro ao buscar árvore de objetivos:', error);
      reply.status(500).send({ error: 'Erro ao carregar árvore de objetivos.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/objetivos/sync
  // Sincronização em lote (Batch Sync / Upsert)
  // --------------------------------------------------
  fastify.put('/api/objetivos/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { objectives = [], goals = [], tasks = [] } = request.body as any;

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Sincroniza Objetivos
      for (const obj of objectives) {
        await client.query(`
          INSERT INTO objetivos (
            id, user_id, title, burning_desire, feeling_of_achievement, priority,
            manifestation_status, sacrifice, action_plan, start_date, deadline,
            mental_recurrence, manifestation_images, motivational_videos,
            evolutionary_context, risks, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            burning_desire = EXCLUDED.burning_desire,
            feeling_of_achievement = EXCLUDED.feeling_of_achievement,
            priority = EXCLUDED.priority,
            manifestation_status = EXCLUDED.manifestation_status,
            sacrifice = EXCLUDED.sacrifice,
            action_plan = EXCLUDED.action_plan,
            start_date = EXCLUDED.start_date,
            deadline = EXCLUDED.deadline,
            mental_recurrence = EXCLUDED.mental_recurrence,
            manifestation_images = EXCLUDED.manifestation_images,
            motivational_videos = EXCLUDED.motivational_videos,
            evolutionary_context = EXCLUDED.evolutionary_context,
            risks = EXCLUDED.risks,
            updated_at = CURRENT_TIMESTAMP
        `, [
          obj.id, userId, obj.title, obj.burningDesire || '', (obj.feelingOfAchievement || obj.feelings || ''),
          obj.priority || 'medium', obj.manifestationStatus || 'conception', obj.sacrifice || '',
          (obj.actionPlan || obj.plan || ''), obj.startDate ? new Date(obj.startDate) : null,
          obj.deadline ? new Date(obj.deadline) : null,
          obj.mentalRecurrence ? 1 : 0,
          JSON.stringify(obj.manifestationImages || obj.media || []),
          JSON.stringify(obj.motivationalVideos || []),
          obj.evolutionaryContext || '',
          JSON.stringify(obj.risks || [])
        ]);
      }

      // 2. Sincroniza Metas (Goals)
      for (const goal of goals) {
        await client.query(`
          INSERT INTO metas (
            id, user_id, objetivo_id, intention, description, meaning,
            expected_evolution, deadline, consequence, risks, impact_level,
            strategy, color, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            objetivo_id = EXCLUDED.objetivo_id,
            intention = EXCLUDED.intention,
            description = EXCLUDED.description,
            meaning = EXCLUDED.meaning,
            expected_evolution = EXCLUDED.expected_evolution,
            deadline = EXCLUDED.deadline,
            consequence = EXCLUDED.consequence,
            risks = EXCLUDED.risks,
            impact_level = EXCLUDED.impact_level,
            strategy = EXCLUDED.strategy,
            color = EXCLUDED.color,
            updated_at = CURRENT_TIMESTAMP
        `, [
          goal.id, userId, goal.objectiveId, goal.intention, goal.description || '',
          goal.meaning || '', goal.expectedEvolution || '',
          goal.deadline ? new Date(goal.deadline) : null,
          goal.consequence || '', goal.risks || '', goal.impactLevel || 'medium',
          goal.strategy || '', goal.color || '#c3b1e1'
        ]);
      }

      // 3. Sincroniza Tarefas (Tasks)
      for (const t of tasks) {
        await client.query(`
          INSERT INTO tarefas (
            id, user_id, meta_id, parent_task_id, title, execution_type, description,
            visual_anchor_url, status, complexity, subtasks, scheduled_date,
            estimated_duration, actual_duration, is_recurring, recurrence_pattern,
            recurrence_days, parent_recurrence_id, priority, strategic_impact,
            energy_volume, sync_modality, hyperlucidity, technique, sensations,
            phenomena, self_research_notes, linked_document_ids, audio_url,
            audio_duration, audio_notes, document_url, written_content, word_count,
            transaction_value, transaction_type, financial_category_id, receipt_url,
            completed_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
            $31, $32, $33, $34, $35, $36, $37, $38, $39, CURRENT_TIMESTAMP
          )
          ON CONFLICT (id) DO UPDATE SET
            meta_id = EXCLUDED.meta_id,
            parent_task_id = EXCLUDED.parent_task_id,
            title = EXCLUDED.title,
            execution_type = EXCLUDED.execution_type,
            description = EXCLUDED.description,
            visual_anchor_url = EXCLUDED.visual_anchor_url,
            status = EXCLUDED.status,
            complexity = EXCLUDED.complexity,
            subtasks = EXCLUDED.subtasks,
            scheduled_date = EXCLUDED.scheduled_date,
            estimated_duration = EXCLUDED.estimated_duration,
            actual_duration = EXCLUDED.actual_duration,
            is_recurring = EXCLUDED.is_recurring,
            recurrence_pattern = EXCLUDED.recurrence_pattern,
            recurrence_days = EXCLUDED.recurrence_days,
            parent_recurrence_id = EXCLUDED.parent_recurrence_id,
            priority = EXCLUDED.priority,
            strategic_impact = EXCLUDED.strategic_impact,
            energy_volume = EXCLUDED.energy_volume,
            sync_modality = EXCLUDED.sync_modality,
            hyperlucidity = EXCLUDED.hyperlucidity,
            technique = EXCLUDED.technique,
            sensations = EXCLUDED.sensations,
            phenomena = EXCLUDED.phenomena,
            self_research_notes = EXCLUDED.self_research_notes,
            linked_document_ids = EXCLUDED.linked_document_ids,
            audio_url = EXCLUDED.audio_url,
            audio_duration = EXCLUDED.audio_duration,
            audio_notes = EXCLUDED.audio_notes,
            document_url = EXCLUDED.document_url,
            written_content = EXCLUDED.written_content,
            word_count = EXCLUDED.word_count,
            transaction_value = EXCLUDED.transaction_value,
            transaction_type = EXCLUDED.transaction_type,
            financial_category_id = EXCLUDED.financial_category_id,
            receipt_url = EXCLUDED.receipt_url,
            completed_at = EXCLUDED.completed_at,
            updated_at = CURRENT_TIMESTAMP
        `, [
          t.id, userId,
          cleanForeignKey(t.goalId),
          cleanForeignKey(t.parentTaskId),
          t.title, t.executionType || 'standard', t.description || '',
          t.visualAnchorUrl || '', t.status || 'todo', t.complexity || 'low',
          JSON.stringify(t.subtasks || []),
          t.scheduledDate ? new Date(t.scheduledDate) : null,
          t.estimatedDuration || '', t.actualDuration || 0,
          t.isRecurring ? 1 : 0, t.recurrencePattern || '',
          JSON.stringify(t.recurrenceDays || []),
          cleanForeignKey(t.parentRecurrenceId),
          t.priority || 'medium', t.strategicImpact || 'medium',
          t.energyVolume || 0, t.syncModality || 0, t.hyperlucidity || 0,
          t.technique || '', JSON.stringify(t.sensations || []),
          JSON.stringify(t.phenomena || []), t.selfResearchNotes || '',
          JSON.stringify(t.linkedDocumentIds || []), t.audioUrl || '',
          t.audioDuration || 0, t.audioNotes || '', t.documentUrl || '',
          t.writtenContent || 0, t.wordCount || 0, t.transactionValue || 0.00,
          t.transactionType || null, cleanForeignKey(t.financialCategoryId),
          t.receiptUrl || '', t.completedAt ? new Date(t.completedAt) : null
        ]);
      }

      await client.query('COMMIT');
      return { success: true };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[Objectives API] Erro ao sincronizar lote:', error);
      reply.status(500).send({ error: 'Erro ao sincronizar dados em lote.' });
    } finally {
      client.release();
    }
  });

  // --------------------------------------------------
  // PUT /api/objetivos/:id
  // Upsert de objetivo único
  // --------------------------------------------------
  fastify.put('/api/objetivos/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const obj = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO objetivos (
          id, user_id, title, burning_desire, feeling_of_achievement, priority,
          manifestation_status, sacrifice, action_plan, start_date, deadline,
          mental_recurrence, manifestation_images, motivational_videos,
          evolutionary_context, risks, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          burning_desire = EXCLUDED.burning_desire,
          feeling_of_achievement = EXCLUDED.feeling_of_achievement,
          priority = EXCLUDED.priority,
          manifestation_status = EXCLUDED.manifestation_status,
          sacrifice = EXCLUDED.sacrifice,
          action_plan = EXCLUDED.action_plan,
          start_date = EXCLUDED.start_date,
          deadline = EXCLUDED.deadline,
          mental_recurrence = EXCLUDED.mental_recurrence,
          manifestation_images = EXCLUDED.manifestation_images,
          motivational_videos = EXCLUDED.motivational_videos,
          evolutionary_context = EXCLUDED.evolutionary_context,
          risks = EXCLUDED.risks,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, obj.title, obj.burningDesire || '', (obj.feelingOfAchievement || obj.feelings || ''),
        obj.priority || 'medium', obj.manifestationStatus || 'conception', obj.sacrifice || '',
        (obj.actionPlan || obj.plan || ''), obj.startDate ? new Date(obj.startDate) : null,
        obj.deadline ? new Date(obj.deadline) : null,
        obj.mentalRecurrence ? 1 : 0,
        JSON.stringify(obj.manifestationImages || obj.media || []),
        JSON.stringify(obj.motivationalVideos || []),
        obj.evolutionaryContext || '',
        JSON.stringify(obj.risks || [])
      ]);

      return { success: true, objective: mapObjectiveDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar objetivo:', error);
      reply.status(500).send({ error: 'Erro ao salvar objetivo.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/objetivos/:id
  // --------------------------------------------------
  fastify.delete('/api/objetivos/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    console.log(`[Objectives API] Tentando deletar objetivo ${id} para usuário ${userId}`);
    try {
      const res = await db.query('DELETE FROM objetivos WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error(`[Objectives API] Erro ao deletar objetivo ${id}:`, error);
      reply.status(500).send({ error: 'Erro ao deletar objetivo no banco de dados.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/metas/:id
  // Upsert de meta única
  // --------------------------------------------------
  fastify.put('/api/metas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const goal = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO metas (
          id, user_id, objetivo_id, intention, description, meaning,
          expected_evolution, deadline, consequence, risks, impact_level,
          strategy, color, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          objetivo_id = EXCLUDED.objetivo_id,
          intention = EXCLUDED.intention,
          description = EXCLUDED.description,
          meaning = EXCLUDED.meaning,
          expected_evolution = EXCLUDED.expected_evolution,
          deadline = EXCLUDED.deadline,
          consequence = EXCLUDED.consequence,
          risks = EXCLUDED.risks,
          impact_level = EXCLUDED.impact_level,
          strategy = EXCLUDED.strategy,
          color = EXCLUDED.color,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, goal.objectiveId, goal.intention, goal.description || '',
        goal.meaning || '', goal.expectedEvolution || '',
        goal.deadline ? new Date(goal.deadline) : null,
        goal.consequence || '', goal.risks || '', goal.impactLevel || 'medium',
        goal.strategy || '', goal.color || '#c3b1e1'
      ]);

      return { success: true, goal: mapGoalDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar meta:', error);
      reply.status(500).send({ error: 'Erro ao salvar meta.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/metas/:id
  // --------------------------------------------------
  fastify.delete('/api/metas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query('DELETE FROM metas WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error('[Objectives API] Erro ao deletar meta:', error);
      reply.status(500).send({ error: 'Erro ao deletar meta.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/tarefas/:id
  // Upsert de tarefa única
  // --------------------------------------------------
  fastify.put('/api/tarefas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const t = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO tarefas (
          id, user_id, meta_id, parent_task_id, title, execution_type, description,
          visual_anchor_url, status, complexity, subtasks, scheduled_date,
          estimated_duration, actual_duration, is_recurring, recurrence_pattern,
          recurrence_days, parent_recurrence_id, priority, strategic_impact,
          energy_volume, sync_modality, hyperlucidity, technique, sensations,
          phenomena, self_research_notes, linked_document_ids, audio_url,
          audio_duration, audio_notes, document_url, written_content, word_count,
          transaction_value, transaction_type, financial_category_id, receipt_url,
          completed_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, CURRENT_TIMESTAMP
        )
        ON CONFLICT (id) DO UPDATE SET
          meta_id = EXCLUDED.meta_id,
          parent_task_id = EXCLUDED.parent_task_id,
          title = EXCLUDED.title,
          execution_type = EXCLUDED.execution_type,
          description = EXCLUDED.description,
          visual_anchor_url = EXCLUDED.visual_anchor_url,
          status = EXCLUDED.status,
          complexity = EXCLUDED.complexity,
          subtasks = EXCLUDED.subtasks,
          scheduled_date = EXCLUDED.scheduled_date,
          estimated_duration = EXCLUDED.estimated_duration,
          actual_duration = EXCLUDED.actual_duration,
          is_recurring = EXCLUDED.is_recurring,
          recurrence_pattern = EXCLUDED.recurrence_pattern,
          recurrence_days = EXCLUDED.recurrence_days,
          parent_recurrence_id = EXCLUDED.parent_recurrence_id,
          priority = EXCLUDED.priority,
          strategic_impact = EXCLUDED.strategic_impact,
          energy_volume = EXCLUDED.energy_volume,
          sync_modality = EXCLUDED.sync_modality,
          hyperlucidity = EXCLUDED.hyperlucidity,
          technique = EXCLUDED.technique,
          sensations = EXCLUDED.sensations,
          phenomena = EXCLUDED.phenomena,
          self_research_notes = EXCLUDED.self_research_notes,
          linked_document_ids = EXCLUDED.linked_document_ids,
          audio_url = EXCLUDED.audio_url,
          audio_duration = EXCLUDED.audio_duration,
          audio_notes = EXCLUDED.audio_notes,
          document_url = EXCLUDED.document_url,
          written_content = EXCLUDED.written_content,
          word_count = EXCLUDED.word_count,
          transaction_value = EXCLUDED.transaction_value,
          transaction_type = EXCLUDED.transaction_type,
          financial_category_id = EXCLUDED.financial_category_id,
          receipt_url = EXCLUDED.receipt_url,
          completed_at = EXCLUDED.completed_at,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId,
        cleanForeignKey(t.goalId),
        cleanForeignKey(t.parentTaskId),
        t.title, t.executionType || 'standard', t.description || '',
        t.visualAnchorUrl || '', t.status || 'todo', t.complexity || 'low',
        JSON.stringify(t.subtasks || []),
        t.scheduledDate ? new Date(t.scheduledDate) : null,
        t.estimatedDuration || '', t.actualDuration || 0,
        t.isRecurring ? 1 : 0, t.recurrencePattern || '',
        JSON.stringify(t.recurrenceDays || []),
        cleanForeignKey(t.parentRecurrenceId),
        t.priority || 'medium', t.strategicImpact || 'medium',
        t.energyVolume || 0, t.syncModality || 0, t.hyperlucidity || 0,
        t.technique || '', JSON.stringify(t.sensations || []),
        JSON.stringify(t.phenomena || []), t.selfResearchNotes || '',
        JSON.stringify(t.linkedDocumentIds || []), t.audioUrl || '',
        t.audioDuration || 0, t.audioNotes || '', t.documentUrl || '',
        t.writtenContent || '', t.wordCount || 0, t.transactionValue || 0.00,
        t.transactionType || null, cleanForeignKey(t.financialCategoryId),
        t.receiptUrl || '', t.completedAt ? new Date(t.completedAt) : null
      ]);

      return { success: true, task: mapTaskDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar tarefa:', error);
      reply.status(500).send({ error: 'Erro ao salvar tarefa.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/tarefas/:id
  // --------------------------------------------------
  fastify.delete('/api/tarefas/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query('DELETE FROM tarefas WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error('[Objectives API] Erro ao deletar tarefa:', error);
      reply.status(500).send({ error: 'Erro ao deletar tarefa.' });
    }
  });
}
