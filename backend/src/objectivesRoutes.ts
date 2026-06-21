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

// Helpers de mapeamento de banco para frontend
function mapObjectiveDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    type: row.type || 'Estratégico',
    deadline: row.deadline ? new Date(row.deadline).getTime() : undefined,
    media: safeJsonParse(row.media, []),
    burningDesire: row.burning_desire || '',
    sacrifice: row.sacrifice || '',
    feelings: row.feelings || '',
    plan: row.plan || '',
    kpis: safeJsonParse(row.kpis, []),
    risks: safeJsonParse(row.risks, []),
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
    goalIds: [], // Preenchido no agregador
    metas: safeJsonParse(row.metas, [])
  };
}

function mapGoalDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    objectiveId: row.objective_id,
    title: row.title,
    progress: parseInt(row.progress || '0', 10),
    status: row.status || 'todo',
    color: row.color || '',
    deadline: row.deadline ? new Date(row.deadline).getTime() : undefined,
    projectIds: [], // Preenchido no agregador
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
  };
}

function mapProjectDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    goalId: row.goal_id || 'none',
    title: row.title,
    progress: parseInt(row.progress || '0', 10),
    taskIds: [], // Preenchido no agregador
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
  };
}

function mapTaskDbToFrontend(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    projectId: row.project_id || 'none',
    goalId: row.goal_id || 'none',
    parentTaskId: row.parent_task_id || null,
    status: row.status || 'todo',
    date: row.date ? new Date(row.date).getTime() : undefined,
    estimatedDuration: row.estimated_duration || '',
    actualDuration: parseInt(row.actual_duration || '0', 10),
    priority: row.priority || 'medium',
    imageUrl: row.image_url || '',
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : undefined,
    documentIds: row.document_ids || [],
    executionType: row.execution_type || 'standard',
    energyWorkExecution: safeJsonParse(row.energy_work_execution, undefined),
    subtaskIds: [], // Preenchido no agregador
    createdAt: row.created_at ? new Date(row.created_at).getTime() : undefined
  };
}

export async function objectivesRoutes(fastify: FastifyInstance) {

  // --------------------------------------------------
  // GET /api/objectives
  // Retorna toda a árvore de objetivos, metas, projetos e tarefas
  // --------------------------------------------------
  fastify.get('/api/objectives', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);

    try {
      // 1. Busca todos os dados do banco para o usuário
      const objectivesRes = await db.query('SELECT * FROM objectives WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
      const goalsRes = await db.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      const projectsRes = await db.query('SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at ASC', [userId]);
      const tasksRes = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at ASC', [userId]);

      const objectives = objectivesRes.rows.map(mapObjectiveDbToFrontend);
      const goals = goalsRes.rows.map(mapGoalDbToFrontend);
      const projects = projectsRes.rows.map(mapProjectDbToFrontend);
      const tasks = tasksRes.rows.map(mapTaskDbToFrontend);

      // 2. Preenche relacionamentos (IDs)
      // Chaves de apoio
      const goalsMap = new Map<string, any>(goals.map(g => [g.id, g]));
      const projectsMap = new Map<string, any>(projects.map(p => [p.id, p]));
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

      // Projetos -> Metas
      for (const project of projects) {
        if (project.goalId && project.goalId !== 'none') {
          const goal = goalsMap.get(project.goalId);
          if (goal) {
            if (!goal.projectIds) goal.projectIds = [];
            if (!goal.projectIds.includes(project.id)) goal.projectIds.push(project.id);
          }
        }
      }

      // Tarefas -> Projetos / Metas / Subtarefas
      for (const task of tasks) {
        if (task.projectId && task.projectId !== 'none') {
          const proj = projectsMap.get(task.projectId);
          if (proj) {
            if (!proj.taskIds) proj.taskIds = [];
            if (!proj.taskIds.includes(task.id)) proj.taskIds.push(task.id);
          }
        }
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
  // PUT /api/objectives/sync
  // Sincronização em lote (Batch Sync / Upsert)
  // --------------------------------------------------
  fastify.put('/api/objectives/sync', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { objectives = [], goals = [], projects = [], tasks = [] } = request.body as any;

    const client = await db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Sincroniza Objetivos
      for (const obj of objectives) {
        await client.query(`
          INSERT INTO objectives (id, user_id, title, description, type, deadline, media, burning_desire, sacrifice, feelings, plan, kpis, risks, metas, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            type = EXCLUDED.type,
            deadline = EXCLUDED.deadline,
            media = EXCLUDED.media,
            burning_desire = EXCLUDED.burning_desire,
            sacrifice = EXCLUDED.sacrifice,
            feelings = EXCLUDED.feelings,
            plan = EXCLUDED.plan,
            kpis = EXCLUDED.kpis,
            risks = EXCLUDED.risks,
            metas = EXCLUDED.metas,
            updated_at = CURRENT_TIMESTAMP
        `, [
          obj.id, userId, obj.title, obj.description, obj.type,
          obj.deadline ? new Date(obj.deadline) : null,
          JSON.stringify(obj.media || []),
          obj.burningDesire || '', obj.sacrifice || '', obj.feelings || '', obj.plan || '',
          JSON.stringify(obj.kpis || []),
          JSON.stringify(obj.risks || []),
          JSON.stringify(obj.metas || [])
        ]);
      }

      // 2. Sincroniza Metas (Goals)
      for (const goal of goals) {
        await client.query(`
          INSERT INTO goals (id, user_id, objective_id, title, progress, status, color, deadline, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            objective_id = EXCLUDED.objective_id,
            title = EXCLUDED.title,
            progress = EXCLUDED.progress,
            status = EXCLUDED.status,
            color = EXCLUDED.color,
            deadline = EXCLUDED.deadline,
            updated_at = CURRENT_TIMESTAMP
        `, [
          goal.id, userId, goal.objectiveId, goal.title, goal.progress || 0,
          goal.status || 'todo', goal.color || '',
          goal.deadline ? new Date(goal.deadline) : null
        ]);
      }

      // 3. Sincroniza Projetos
      for (const proj of projects) {
        await client.query(`
          INSERT INTO projects (id, user_id, goal_id, title, progress, updated_at)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            goal_id = EXCLUDED.goal_id,
            title = EXCLUDED.title,
            progress = EXCLUDED.progress,
            updated_at = CURRENT_TIMESTAMP
        `, [
          proj.id, userId, proj.goalId === 'none' ? null : proj.goalId,
          proj.title, proj.progress || 0
        ]);
      }

      // 4. Sincroniza Tarefas (Tasks)
      for (const t of tasks) {
        await client.query(`
          INSERT INTO tasks (id, user_id, goal_id, project_id, parent_task_id, title, status, date, estimated_duration, actual_duration, priority, image_url, completed_at, document_ids, execution_type, energy_work_execution, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            goal_id = EXCLUDED.goal_id,
            project_id = EXCLUDED.project_id,
            parent_task_id = EXCLUDED.parent_task_id,
            title = EXCLUDED.title,
            status = EXCLUDED.status,
            date = EXCLUDED.date,
            estimated_duration = EXCLUDED.estimated_duration,
            actual_duration = EXCLUDED.actual_duration,
            priority = EXCLUDED.priority,
            image_url = EXCLUDED.image_url,
            completed_at = EXCLUDED.completed_at,
            document_ids = EXCLUDED.document_ids,
            execution_type = EXCLUDED.execution_type,
            energy_work_execution = EXCLUDED.energy_work_execution,
            updated_at = CURRENT_TIMESTAMP
        `, [
          t.id, userId,
          t.goalId === 'none' ? null : t.goalId,
          t.projectId === 'none' ? null : t.projectId,
          t.parentTaskId || null,
          t.title, t.status || 'todo',
          t.date ? new Date(t.date) : null,
          t.estimatedDuration || '',
          t.actualDuration || 0,
          t.priority || 'medium',
          t.imageUrl || '',
          t.completedAt ? new Date(t.completedAt) : null,
          t.documentIds || [],
          t.executionType || 'standard',
          t.energyWorkExecution ? JSON.stringify(t.energyWorkExecution) : '{}'
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
  // PUT /api/objectives/:id
  // Upsert de objetivo único
  // --------------------------------------------------
  fastify.put('/api/objectives/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const obj = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO objectives (id, user_id, title, description, type, deadline, media, burning_desire, sacrifice, feelings, plan, kpis, risks, metas, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          type = EXCLUDED.type,
          deadline = EXCLUDED.deadline,
          media = EXCLUDED.media,
          burning_desire = EXCLUDED.burning_desire,
          sacrifice = EXCLUDED.sacrifice,
          feelings = EXCLUDED.feelings,
          plan = EXCLUDED.plan,
          kpis = EXCLUDED.kpis,
          risks = EXCLUDED.risks,
          metas = EXCLUDED.metas,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, obj.title, obj.description, obj.type,
        obj.deadline ? new Date(obj.deadline) : null,
        JSON.stringify(safeJsonParse(obj.media) || []),
        obj.burningDesire || '', obj.sacrifice || '', obj.feelings || '', obj.plan || '',
        JSON.stringify(safeJsonParse(obj.kpis) || []),
        JSON.stringify(safeJsonParse(obj.risks) || []),
        JSON.stringify(safeJsonParse(obj.metas) || [])
      ]);

      return { success: true, objective: mapObjectiveDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar objetivo:', error);
      reply.status(500).send({ error: 'Erro ao salvar objetivo.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/objectives/:id
  // --------------------------------------------------
  fastify.delete('/api/objectives/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    console.log(`[Objectives API] Tentando deletar objetivo ${id} para usuário ${userId}`);
    try {
      const res = await db.query('DELETE FROM objectives WHERE id = $1 AND user_id = $2', [id, userId]);
      
      if (res.rowCount === 0) {
        console.warn(`[Objectives API] Objetivo ${id} não encontrado ou já deletado.`);
      } else {
        console.log(`[Objectives API] Objetivo ${id} deletado com sucesso.`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`[Objectives API] Erro ao deletar objetivo ${id}:`, error);
      reply.status(500).send({ error: 'Erro ao deletar objetivo no banco de dados.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/goals/:id
  // Upsert de meta única
  // --------------------------------------------------
  fastify.put('/api/goals/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const goal = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO goals (id, user_id, objective_id, title, progress, status, color, deadline, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          objective_id = EXCLUDED.objective_id,
          title = EXCLUDED.title,
          progress = EXCLUDED.progress,
          status = EXCLUDED.status,
          color = EXCLUDED.color,
          deadline = EXCLUDED.deadline,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, goal.objectiveId, goal.title, goal.progress || 0,
        goal.status || 'todo', goal.color || '',
        goal.deadline ? new Date(goal.deadline) : null
      ]);

      return { success: true, goal: mapGoalDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar meta:', error);
      reply.status(500).send({ error: 'Erro ao salvar meta.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/goals/:id
  // --------------------------------------------------
  fastify.delete('/api/goals/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query('DELETE FROM goals WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error('[Objectives API] Erro ao deletar meta:', error);
      reply.status(500).send({ error: 'Erro ao deletar meta.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/projects/:id
  // Upsert de projeto único
  // --------------------------------------------------
  fastify.put('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const proj = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO projects (id, user_id, goal_id, title, progress, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          goal_id = EXCLUDED.goal_id,
          title = EXCLUDED.title,
          progress = EXCLUDED.progress,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId, proj.goalId === 'none' ? null : proj.goalId,
        proj.title, proj.progress || 0
      ]);

      return { success: true, project: mapProjectDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar projeto:', error);
      reply.status(500).send({ error: 'Erro ao salvar projeto.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/projects/:id
  // --------------------------------------------------
  fastify.delete('/api/projects/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error('[Objectives API] Erro ao deletar projeto:', error);
      reply.status(500).send({ error: 'Erro ao deletar projeto.' });
    }
  });

  // --------------------------------------------------
  // PUT /api/tasks/:id
  // Upsert de tarefa única
  // --------------------------------------------------
  fastify.put('/api/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };
    const t = request.body as any;

    try {
      const res = await db.query(`
        INSERT INTO tasks (id, user_id, goal_id, project_id, parent_task_id, title, status, date, estimated_duration, actual_duration, priority, image_url, completed_at, document_ids, execution_type, energy_work_execution, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET
          goal_id = EXCLUDED.goal_id,
          project_id = EXCLUDED.project_id,
          parent_task_id = EXCLUDED.parent_task_id,
          title = EXCLUDED.title,
          status = EXCLUDED.status,
          date = EXCLUDED.date,
          estimated_duration = EXCLUDED.estimated_duration,
          actual_duration = EXCLUDED.actual_duration,
          priority = EXCLUDED.priority,
          image_url = EXCLUDED.image_url,
          completed_at = EXCLUDED.completed_at,
          document_ids = EXCLUDED.document_ids,
          execution_type = EXCLUDED.execution_type,
          energy_work_execution = EXCLUDED.energy_work_execution,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        id, userId,
        t.goalId === 'none' ? null : t.goalId,
        t.projectId === 'none' ? null : t.projectId,
        t.parentTaskId || null,
        t.title, t.status || 'todo',
        t.date ? new Date(t.date) : null,
        t.estimatedDuration || '',
        t.actualDuration || 0,
        t.priority || 'medium',
        t.imageUrl || '',
        t.completedAt ? new Date(t.completedAt) : null,
        t.documentIds || [],
        t.executionType || 'standard',
        t.energyWorkExecution ? JSON.stringify(t.energyWorkExecution) : '{}'
      ]);

      return { success: true, task: mapTaskDbToFrontend(res.rows[0]) };
    } catch (error) {
      console.error('[Objectives API] Erro ao salvar tarefa:', error);
      reply.status(500).send({ error: 'Erro ao salvar tarefa.' });
    }
  });

  // --------------------------------------------------
  // DELETE /api/tasks/:id
  // --------------------------------------------------
  fastify.delete('/api/tasks/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = getUserId(request);
    const { id } = request.params as { id: string };

    try {
      await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
      return { success: true };
    } catch (error) {
      console.error('[Objectives API] Erro ao deletar tarefa:', error);
      reply.status(500).send({ error: 'Erro ao deletar tarefa.' });
    }
  });
}
