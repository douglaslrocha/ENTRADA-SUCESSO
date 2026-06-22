/**
 * Objectives Service
 * Abstração de API para o sistema de Objetivos, Metas, Projetos e Tarefas.
 * Gerencia a comunicação com o backend Fastify e fornece cache/fallback local no localStorage.
 */

import { safeLocalStorage } from '../utils/storage';

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

import { api } from './api';

// ============================================
// Config
// ============================================

const API_BASE = '/api';

// ============================================
// Serviço
// ============================================

export const objectivesService = {
  /**
   * Carrega toda a árvore de objetivos, metas e tarefas diretamente da API do backend.
   */
  async getObjectivesTree(): Promise<ObjectivesTree> {
    const data = await api.get(`${API_BASE}/objetivos`);
    return {
      objectives: data.objectives || [],
      goals: data.goals || [],
      projects: [],
      tasks: data.tasks || []
    };
  },

  /**
   * Sincronização em lote para envio offline-to-online
   */
  async syncTree(tree: ObjectivesTree): Promise<boolean> {
    try {
      const data = await api.put(`${API_BASE}/objetivos/sync`, tree);
      return !!data.success;
    } catch {
      return false;
    }
  },

  /**
   * Salva ou atualiza um objetivo
   */
  async saveObjective(id: string, objective: Partial<Objective>): Promise<Objective> {
    const data = await api.put(`${API_BASE}/objetivos/${id}`, objective);
    return data.objective;
  },

  /**
   * Remove um objetivo
   */
  async deleteObjective(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/objetivos/${id}`);
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma meta
   */
  async saveGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const data = await api.put(`${API_BASE}/metas/${id}`, goal);
    return data.goal;
  },

  /**
   * Remove uma meta
   */
  async deleteGoal(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/metas/${id}`);
    return !!data.success;
  },

  /**
   * Salva ou atualiza um projeto (No-op)
   */
  async saveProject(id: string, project: Partial<Project>): Promise<Project> {
    return { id, title: project.title || 'No-op' };
  },

  /**
   * Remove um projeto (No-op)
   */
  async deleteProject(id: string): Promise<boolean> {
    return true;
  },

  /**
   * Salva ou atualiza uma tarefa
   */
  async saveTask(id: string, task: Partial<Task>): Promise<Task> {
    const data = await api.put(`${API_BASE}/tarefas/${id}`, task);
    return data.task;
  },

  /**
   * Remove uma tarefa
   */
  async deleteTask(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/tarefas/${id}`);
    return !!data.success;
  }
};
