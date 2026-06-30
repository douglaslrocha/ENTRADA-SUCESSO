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
      objectives: (objetivosData || []).map(item => snakeToCamel(item)),
      goals: (metasData || []).map(item => snakeToCamel(item)),
      projects: [],
      tasks: (tarefasData || []).map(item => {
        const mapped = snakeToCamel(item);
        // Garante compatibilidade de tipos para campos JSON
        if (typeof mapped.sensations === 'string') {
          try { mapped.sensations = JSON.parse(mapped.sensations); } catch { mapped.sensations = []; }
        }
        if (typeof mapped.phenomena === 'string') {
          try { mapped.phenomena = JSON.parse(mapped.phenomena); } catch { mapped.phenomena = []; }
        }
        if (typeof mapped.subtasks === 'string') {
          try { mapped.subtasks = JSON.parse(mapped.subtasks); } catch { mapped.subtasks = []; }
        }
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
        const mappedObjs = tree.objectives.map(o => camelToSnake(o));
        await supabase.from('objetivos').upsert(mappedObjs);
      }
      if (tree.goals?.length) {
        const mappedGoals = tree.goals.map(g => camelToSnake(g));
        await supabase.from('metas').upsert(mappedGoals);
      }
      if (tree.tasks?.length) {
        const mappedTasks = tree.tasks.map(t => camelToSnake(t));
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
    if (dbPayload.media) dbPayload.media = JSON.stringify(dbPayload.media);
    if (dbPayload.kpis) dbPayload.kpis = JSON.stringify(dbPayload.kpis);
    if (dbPayload.risks) dbPayload.risks = JSON.stringify(dbPayload.risks);
    if (dbPayload.metas) dbPayload.metas = JSON.stringify(dbPayload.metas);

    const { data, error } = await supabase
      .from('objetivos')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return snakeToCamel(data);
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
    const { data, error } = await supabase
      .from('metas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return snakeToCamel(data);
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
    if (Array.isArray(dbPayload.subtasks)) dbPayload.subtasks = JSON.stringify(dbPayload.subtasks);
    if (Array.isArray(dbPayload.sensations)) dbPayload.sensations = JSON.stringify(dbPayload.sensations);
    if (Array.isArray(dbPayload.phenomena)) dbPayload.phenomena = JSON.stringify(dbPayload.phenomena);
    if (Array.isArray(dbPayload.recurrence_days)) dbPayload.recurrence_days = JSON.stringify(dbPayload.recurrence_days);
    if (Array.isArray(dbPayload.linked_document_ids)) dbPayload.linked_document_ids = JSON.stringify(dbPayload.linked_document_ids);

    const { data, error } = await supabase
      .from('tarefas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    
    const mapped = snakeToCamel(data);
    if (typeof mapped.subtasks === 'string') mapped.subtasks = JSON.parse(mapped.subtasks);
    if (typeof mapped.sensations === 'string') mapped.sensations = JSON.parse(mapped.sensations);
    if (typeof mapped.phenomena === 'string') mapped.phenomena = JSON.parse(mapped.phenomena);
    
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
