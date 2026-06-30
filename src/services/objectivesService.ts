/**
 * Objectives Service
 * Abstração de API para o sistema de Objetivos, Metas, Projetos e Tarefas com integração direta ao Supabase.
 */

import { supabase, camelToSnake, snakeToCamel } from './supabaseClient';

// ============================================
// Tipos
// ============================================

export interface Objective {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  type?: string;
  deadline?: number | string;
  media?: any[];
  burningDesire?: string;
  sacrifice?: string;
  feelings?: string;
  plan?: string;
  kpis?: any[];
  risks?: any[];
  goalIds?: string[];
  createdAt?: number;
  updatedAt?: number;
}

export interface Goal {
  id: string;
  userId?: string;
  objectiveId: string;
  title: string;
  progress?: number;
  status?: string;
  color?: string;
  deadline?: number;
  projectIds?: string[];
  createdAt?: number;
  intention?: string;
  description?: string;
  meaning?: string;
  expectedEvolution?: string;
  consequence?: string;
  risks?: string;
  impactLevel?: string;
  strategy?: string;
}

export interface Project {
  id: string;
  userId?: string;
  goalId?: string;
  title: string;
  progress?: number;
  taskIds?: string[];
  createdAt?: number;
}

export interface Task {
  id: string;
  userId?: string;
  title: string;
  projectId?: string;
  goalId?: string;
  objectiveId?: string;
  objectiveTitle?: string;
  parentTaskId?: string | null;
  status?: 'todo' | 'doing' | 'done';
  description?: string;
  date?: number;
  estimatedDuration?: string;
  actualDuration?: number;
  priority?: string;
  imageUrl?: string;
  completedAt?: number;
  documentIds?: string[];
  subtaskIds?: string[];
  createdAt?: number;
  executionType?: string;
  visualAnchorUrl?: string;
  complexity?: string;
  subtasks?: any[];
  scheduledDate?: number;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceDays?: string[];
  parentRecurrenceId?: string | null;
  strategicImpact?: string;
  energyVolume?: number;
  syncModality?: number;
  hyperlucidity?: number;
  technique?: string;
  sensations?: string[];
  phenomena?: string[];
  selfResearchNotes?: string;
  linkedDocumentIds?: string[];
  audioUrl?: string;
  audioDuration?: number;
  audioNotes?: string;
  documentUrl?: string;
  writtenContent?: string;
  wordCount?: number;
  transactionValue?: number;
  transactionType?: string | null;
  financialCategoryId?: string | null;
  receiptUrl?: string;
}

export interface ObjectivesTree {
  objectives: Objective[];
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
}

export const objectivesService = {
  /**
   * Carrega toda a árvore de objetivos, metas e tarefas do Supabase.
   */
  async getObjectivesTree(): Promise<ObjectivesTree> {
    const { data: objetivosData } = await supabase.from('objetivos').select('*');
    const { data: metasData } = await supabase.from('metas').select('*');
    const { data: tarefasData } = await supabase.from('tarefas').select('*');

    return {
      objectives: (objetivosData || []).map(item => {
        const mapped = snakeToCamel(item);
        if (typeof mapped.media === 'string') {
          try { mapped.media = JSON.parse(mapped.media); } catch { mapped.media = []; }
        }
        if (typeof mapped.kpis === 'string') {
          try { mapped.kpis = JSON.parse(mapped.kpis); } catch { mapped.kpis = []; }
        }
        if (typeof mapped.risks === 'string') {
          try { mapped.risks = JSON.parse(mapped.risks); } catch { mapped.risks = []; }
        }
        if (typeof mapped.relatedObjectives === 'string') {
          try { mapped.relatedObjectives = JSON.parse(mapped.relatedObjectives); } catch { mapped.relatedObjectives = []; }
        }
        if (typeof mapped.tags === 'string') {
          try { mapped.tags = JSON.parse(mapped.tags); } catch { mapped.tags = []; }
        }
        return mapped;
      }),
      goals: (metasData || []).map(item => {
        const mapped = snakeToCamel(item);
        if (typeof mapped.actions === 'string') {
          try { mapped.actions = JSON.parse(mapped.actions); } catch { mapped.actions = []; }
        }
        return mapped;
      }),
      projects: [],
      tasks: (tarefasData || []).map(item => {
        const mapped = snakeToCamel(item);
        // Garante compatibilidade de tipos para campos JSON
        const jsonFields = ['sensations', 'phenomena', 'subtasks', 'checklist', 'multimodalConfig', 'energyWorkExecution'];
        jsonFields.forEach(field => {
          if (typeof mapped[field] === 'string') {
            try { 
              mapped[field] = JSON.parse(mapped[field]); 
            } catch { 
              mapped[field] = field === 'multimodalConfig' || field === 'energyWorkExecution' ? {} : []; 
            }
          }
        });
        return mapped;
      })
    };
  },

  /**
   * Sincronização em lote
   */
  async syncTree(tree: ObjectivesTree): Promise<boolean> {
    try {
      if (tree.objectives?.length) {
        const mappedObjs = tree.objectives.map(o => {
          const payload = camelToSnake(o);
          if (payload.media && typeof payload.media !== 'string') payload.media = JSON.stringify(payload.media);
          if (payload.kpis && typeof payload.kpis !== 'string') payload.kpis = JSON.stringify(payload.kpis);
          if (payload.risks && typeof payload.risks !== 'string') payload.risks = JSON.stringify(payload.risks);
          if (payload.related_objectives && typeof payload.related_objectives !== 'string') payload.related_objectives = JSON.stringify(payload.related_objectives);
          if (payload.tags && typeof payload.tags !== 'string') payload.tags = JSON.stringify(payload.tags);
          return payload;
        });
        await supabase.from('objetivos').upsert(mappedObjs);
      }
      if (tree.goals?.length) {
        const mappedGoals = tree.goals.map(g => {
          const payload = camelToSnake(g);
          if (payload.actions && typeof payload.actions !== 'string') payload.actions = JSON.stringify(payload.actions);
          return payload;
        });
        await supabase.from('metas').upsert(mappedGoals);
      }
      if (tree.tasks?.length) {
        const mappedTasks = tree.tasks.map(t => {
          const payload = camelToSnake(t);
          if (payload.subtasks && typeof payload.subtasks !== 'string') payload.subtasks = JSON.stringify(payload.subtasks);
          if (payload.checklist && typeof payload.checklist !== 'string') payload.checklist = JSON.stringify(payload.checklist);
          if (payload.multimodal_config && typeof payload.multimodal_config !== 'string') payload.multimodal_config = JSON.stringify(payload.multimodal_config);
          if (payload.energy_work_execution && typeof payload.energy_work_execution !== 'string') payload.energy_work_execution = JSON.stringify(payload.energy_work_execution);
          return payload;
        });
        await supabase.from('tarefas').upsert(mappedTasks);
      }
      return true;
    } catch (e) {
      console.error('[ObjectivesService] Erro ao sincronizar árvore com Supabase:', e);
      return false;
    }
  },

  /**
   * Salva ou atualiza um objetivo
   */
  async saveObjective(id: string, objective: Partial<Objective>): Promise<Objective> {
    const dbPayload = camelToSnake({ ...objective, id });
    if (dbPayload.media && typeof dbPayload.media !== 'string') dbPayload.media = JSON.stringify(dbPayload.media);
    if (dbPayload.kpis && typeof dbPayload.kpis !== 'string') dbPayload.kpis = JSON.stringify(dbPayload.kpis);
    if (dbPayload.risks && typeof dbPayload.risks !== 'string') dbPayload.risks = JSON.stringify(dbPayload.risks);
    if (dbPayload.related_objectives && typeof dbPayload.related_objectives !== 'string') dbPayload.related_objectives = JSON.stringify(dbPayload.related_objectives);
    if (dbPayload.tags && typeof dbPayload.tags !== 'string') dbPayload.tags = JSON.stringify(dbPayload.tags);

    const { data, error } = await supabase
      .from('objetivos')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    
    const mapped = snakeToCamel(data);
    if (typeof mapped.media === 'string') {
      try { mapped.media = JSON.parse(mapped.media); } catch { mapped.media = []; }
    }
    if (typeof mapped.kpis === 'string') {
      try { mapped.kpis = JSON.parse(mapped.kpis); } catch { mapped.kpis = []; }
    }
    if (typeof mapped.risks === 'string') {
      try { mapped.risks = JSON.parse(mapped.risks); } catch { mapped.risks = []; }
    }
    
    return mapped;
  },

  /**
   * Remove um objetivo
   */
  async deleteObjective(id: string): Promise<boolean> {
    const { error } = await supabase.from('objetivos').delete().eq('id', id);
    return !error;
  },

  /**
   * Salva ou atualiza uma meta
   */
  async saveGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const dbPayload = camelToSnake({ ...goal, id });
    if (dbPayload.actions && typeof dbPayload.actions !== 'string') dbPayload.actions = JSON.stringify(dbPayload.actions);

    const { data, error } = await supabase
      .from('metas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    
    const mapped = snakeToCamel(data);
    if (typeof mapped.actions === 'string') {
      try { mapped.actions = JSON.parse(mapped.actions); } catch { mapped.actions = []; }
    }
    return mapped;
  },

  /**
   * Remove uma meta
   */
  async deleteGoal(id: string): Promise<boolean> {
    const { error } = await supabase.from('metas').delete().eq('id', id);
    return !error;
  },

  /**
   * Salva ou atualiza um projeto (No-op para compatibilidade)
   */
  async saveProject(id: string, project: Partial<Project>): Promise<Project> {
    return { id, title: project.title || 'No-op' };
  },

  /**
   * Remove um projeto
   */
  async deleteProject(id: string): Promise<boolean> {
    return true;
  },

  /**
   * Salva ou atualiza uma tarefa
   */
  async saveTask(id: string, task: Partial<Task>): Promise<Task> {
    const dbPayload = camelToSnake({ ...task, id });
    
    // Tratamento de tipos especiais do PostgreSQL / JSON
    if (dbPayload.subtasks && typeof dbPayload.subtasks !== 'string') dbPayload.subtasks = JSON.stringify(dbPayload.subtasks);
    if (dbPayload.checklist && typeof dbPayload.checklist !== 'string') dbPayload.checklist = JSON.stringify(dbPayload.checklist);
    if (dbPayload.multimodal_config && typeof dbPayload.multimodal_config !== 'string') dbPayload.multimodal_config = JSON.stringify(dbPayload.multimodal_config);
    if (dbPayload.energy_work_execution && typeof dbPayload.energy_work_execution !== 'string') dbPayload.energy_work_execution = JSON.stringify(dbPayload.energy_work_execution);
    if (dbPayload.sensations && typeof dbPayload.sensations !== 'string') dbPayload.sensations = JSON.stringify(dbPayload.sensations);
    if (dbPayload.phenomena && typeof dbPayload.phenomena !== 'string') dbPayload.phenomena = JSON.stringify(dbPayload.phenomena);
    if (dbPayload.recurrence_days && typeof dbPayload.recurrence_days !== 'string') dbPayload.recurrence_days = JSON.stringify(dbPayload.recurrence_days);
    if (dbPayload.linked_document_ids && typeof dbPayload.linked_document_ids !== 'string') dbPayload.linked_document_ids = JSON.stringify(dbPayload.linked_document_ids);

    const { data, error } = await supabase
      .from('tarefas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    
    const mapped = snakeToCamel(data);
    const jsonFields = ['subtasks', 'checklist', 'multimodalConfig', 'energyWorkExecution', 'sensations', 'phenomena', 'recurrenceDays', 'linkedDocumentIds'];
    jsonFields.forEach(field => {
      if (typeof mapped[field] === 'string') {
        try { 
          mapped[field] = JSON.parse(mapped[field]); 
        } catch { 
          mapped[field] = field === 'multimodalConfig' || field === 'energyWorkExecution' ? {} : []; 
        }
      }
    });
    
    return mapped;
  },

  /**
   * Remove uma tarefa
   */
  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    return !error;
  }
};
