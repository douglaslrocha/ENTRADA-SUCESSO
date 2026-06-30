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
  priority?: string;
  status?: string;
  startDate?: string;
  isRecurring?: boolean;
  evolutionaryContext?: string;
  tags?: string[];
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
  actions?: any[];
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
  mapDbObjectiveToUi(item: any): Objective {
    if (!item) return {} as Objective;
    return {
      id: item.id,
      userId: item.user_id,
      title: item.title,
      burningDesire: item.burning_desire || '',
      feelings: item.feeling_of_achievement || '',
      priority: item.priority || 'medium',
      status: item.manifestation_status || 'planning',
      sacrifice: item.sacrifice || '',
      plan: item.action_plan || '',
      startDate: item.start_date || '',
      deadline: item.deadline || '',
      isRecurring: item.mental_recurrence === 1,
      media: typeof item.manifestation_images === 'string' ? JSON.parse(item.manifestation_images) : (item.manifestation_images || []),
      evolutionaryContext: item.evolutionary_context || '',
      risks: typeof item.risks === 'string' ? JSON.parse(item.risks) : (item.risks || []),
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []),
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
      updatedAt: item.updated_at ? new Date(item.updated_at).getTime() : Date.now()
    };
  },

  mapUiObjectiveToDb(objective: Partial<Objective>, id: string): any {
    const dbForm: any = {
      id,
      title: objective.title,
      burning_desire: objective.burningDesire || '',
      feeling_of_achievement: objective.feelings || '',
      priority: objective.priority || 'medium',
      manifestation_status: objective.status || 'planning',
      sacrifice: objective.sacrifice || '',
      action_plan: objective.plan || '',
      start_date: objective.startDate || null,
      deadline: objective.deadline || null,
      mental_recurrence: objective.isRecurring ? 1 : 0,
      evolutionary_context: objective.evolutionaryContext || '',
      user_id: 'default'
    };
    if (objective.media) dbForm.manifestation_images = JSON.stringify(objective.media);
    if (objective.risks) dbForm.risks = JSON.stringify(objective.risks);
    if (objective.tags) dbForm.tags = JSON.stringify(objective.tags);
    return dbForm;
  },

  mapDbGoalToUi(item: any): Goal {
    if (!item) return {} as Goal;
    return {
      id: item.id,
      userId: item.user_id,
      objectiveId: item.objetivo_id,
      title: item.title,
      progress: item.progress || 0,
      status: item.status || 'todo',
      color: item.color || '#c3b1e1',
      deadline: item.deadline ? new Date(item.deadline).getTime() : undefined,
      intention: item.intention || '',
      description: item.description || '',
      meaning: item.meaning || '',
      expectedEvolution: item.expected_evolution || '',
      consequence: item.consequence || '',
      risks: item.risks || '',
      impactLevel: item.impact_level || 'medium',
      strategy: item.strategy || '',
      actions: typeof item.actions === 'string' ? JSON.parse(item.actions) : (item.actions || []),
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
    };
  },

  mapUiGoalToDb(goal: Partial<Goal>, id: string): any {
    const dbForm: any = {
      id,
      objetivo_id: goal.objectiveId,
      title: goal.title,
      progress: goal.progress || 0,
      status: goal.status || 'todo',
      color: goal.color || '#c3b1e1',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString() : null,
      intention: goal.intention || '',
      description: goal.description || '',
      meaning: goal.meaning || '',
      expected_evolution: goal.expectedEvolution || '',
      consequence: goal.consequence || '',
      risks: goal.risks || '',
      impact_level: goal.impactLevel || 'medium',
      strategy: goal.strategy || '',
      user_id: 'default'
    };
    if (goal.actions) dbForm.actions = JSON.stringify(goal.actions);
    return dbForm;
  },

  mapDbTaskToUi(item: any): Task {
    if (!item) return {} as Task;
    return {
      id: item.id,
      userId: item.user_id,
      title: item.title,
      goalId: item.meta_id || 'none',
      status: item.status === 'completed' || item.status === 'done' ? 'done' : (item.status === 'doing' || item.status === 'in-progress' ? 'doing' : 'todo'),
      description: item.description || '',
      date: item.scheduled_date ? new Date(item.scheduled_date).getTime() : undefined,
      scheduledDate: item.scheduled_date ? new Date(item.scheduled_date).getTime() : undefined,
      estimatedDuration: item.estimated_duration || '',
      actualDuration: item.actual_duration || 0,
      priority: item.priority || 'medium',
      visualAnchorUrl: item.visual_anchor_url || '',
      completedAt: item.completed_at ? new Date(item.completed_at).getTime() : undefined,
      subtasks: typeof item.subtasks === 'string' ? JSON.parse(item.subtasks) : (item.subtasks || []),
      complexity: item.complexity || 'medium',
      strategicImpact: item.strategic_impact || 'medium',
      energyVolume: item.energy_volume || 0,
      syncModality: item.sync_modality || 0,
      hyperlucidity: item.hyperlucidity || 0,
      technique: item.technique || '',
      sensations: typeof item.sensations === 'string' ? JSON.parse(item.sensations) : (item.sensations || []),
      phenomena: typeof item.phenomena === 'string' ? JSON.parse(item.phenomena) : (item.phenomena || []),
      selfResearchNotes: item.self_research_notes || '',
      linkedDocumentIds: typeof item.linked_document_ids === 'string' ? JSON.parse(item.linked_document_ids) : (item.linked_document_ids || []),
      audioUrl: item.audio_url || '',
      audioDuration: item.audio_duration || 0,
      audioNotes: item.audio_notes || '',
      documentUrl: item.document_url || '',
      writtenContent: item.written_content || '',
      wordCount: item.word_count || 0,
      createdAt: item.created_at ? new Date(item.created_at).getTime() : Date.now()
    };
  },

  mapUiTaskToDb(task: Partial<Task>, id: string): any {
    const dbForm: any = {
      id,
      meta_id: task.goalId && task.goalId !== 'none' ? task.goalId : null,
      title: task.title,
      status: task.status || 'todo',
      description: task.description || '',
      scheduled_date: task.date || task.scheduledDate ? new Date(task.date || task.scheduledDate!).toISOString() : null,
      estimated_duration: task.estimatedDuration || '',
      actual_duration: task.actualDuration || 0,
      priority: task.priority || 'medium',
      visual_anchor_url: task.visualAnchorUrl || '',
      completed_at: task.completedAt ? new Date(task.completedAt).toISOString() : null,
      complexity: task.complexity || 'medium',
      strategic_impact: task.strategicImpact || 'medium',
      energy_volume: task.energyVolume || 0,
      sync_modality: task.syncModality || 0,
      hyperlucidity: task.hyperlucidity || 0,
      technique: task.technique || '',
      self_research_notes: task.selfResearchNotes || '',
      audio_url: task.audioUrl || '',
      audio_duration: task.audioDuration || 0,
      audio_notes: task.audioNotes || '',
      document_url: task.documentUrl || '',
      written_content: task.writtenContent || '',
      word_count: task.wordCount || 0,
      user_id: 'default'
    };
    if (task.subtasks) dbForm.subtasks = JSON.stringify(task.subtasks);
    if (task.sensations) dbForm.sensations = JSON.stringify(task.sensations);
    if (task.phenomena) dbForm.phenomena = JSON.stringify(task.phenomena);
    if (task.linkedDocumentIds) dbForm.linked_document_ids = JSON.stringify(task.linkedDocumentIds);
    return dbForm;
  },

  /**
   * Carrega toda a árvore de objetivos, metas e tarefas do Supabase.
   */
  async getObjectivesTree(): Promise<ObjectivesTree> {
    const { data: objetivosData } = await supabase.from('objetivos').select('*');
    const { data: metasData } = await supabase.from('metas').select('*');
    const { data: tarefasData } = await supabase.from('tarefas').select('*');

    return {
      objectives: (objetivosData || []).map(item => this.mapDbObjectiveToUi(item)),
      goals: (metasData || []).map(item => this.mapDbGoalToUi(item)),
      projects: [],
      tasks: (tarefasData || []).map(item => this.mapDbTaskToUi(item))
    };
  },

  /**
   * Sincronização em lote
   */
  async syncTree(tree: ObjectivesTree): Promise<boolean> {
    try {
      if (tree.objectives?.length) {
        const mappedObjs = tree.objectives.map(o => this.mapUiObjectiveToDb(o, o.id));
        await supabase.from('objetivos').upsert(mappedObjs);
      }
      if (tree.goals?.length) {
        const mappedGoals = tree.goals.map(g => this.mapUiGoalToDb(g, g.id));
        await supabase.from('metas').upsert(mappedGoals);
      }
      if (tree.tasks?.length) {
        const mappedTasks = tree.tasks.map(t => this.mapUiTaskToDb(t, t.id));
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
    const dbPayload = this.mapUiObjectiveToDb(objective, id);
    const { data, error } = await supabase
      .from('objetivos')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('[ObjectivesService] Erro no upsert objetivo:', error);
      throw error;
    }
    
    return this.mapDbObjectiveToUi(data);
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
    const dbPayload = this.mapUiGoalToDb(goal, id);
    const { data, error } = await supabase
      .from('metas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('[ObjectivesService] Erro no upsert meta:', error);
      throw error;
    }
    
    return this.mapDbGoalToUi(data);
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
    const dbPayload = this.mapUiTaskToDb(task, id);
    const { data, error } = await supabase
      .from('tarefas')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) {
      console.error('[ObjectivesService] Erro no upsert tarefa:', error);
      throw error;
    }
    
    return this.mapDbTaskToUi(data);
  },

  /**
   * Remove uma tarefa
   */
  async deleteTask(id: string): Promise<boolean> {
    const { error } = await supabase.from('tarefas').delete().eq('id', id);
    return !error;
  }
};
