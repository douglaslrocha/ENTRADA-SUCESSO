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
  deadline?: number;
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
  date?: number;
  estimatedDuration?: string;
  actualDuration?: number;
  priority?: string;
  imageUrl?: string;
  completedAt?: number;
  documentIds?: string[];
  subtaskIds?: string[];
  createdAt?: number;
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
   * Carrega toda a árvore de objetivos, metas, projetos e tarefas.
   * Tenta carregar do backend, atualiza cache local se sucesso.
   * Em caso de erro, retorna do localStorage.
   */
  async getObjectivesTree(): Promise<ObjectivesTree> {
    try {
      const data = await api.get(`${API_BASE}/objectives`);
      
      // Atualiza cache local
      safeLocalStorage.setItem('objectives_order', JSON.stringify(data.objectives || []));
      safeLocalStorage.setItem('goals_entries', JSON.stringify(data.goals || []));
      safeLocalStorage.setItem('projects_entries', JSON.stringify(data.projects || []));
      
      // Separa e salva tarefas no cache por objetivo para compatibilidade com o fakeDB atual
      const tasksByObjective: Record<string, Task[]> = {};
      const objectivesMap = new Map<string, string>((data.objectives || []).map((o: any) => [o.id as string, o.title as string]));
      const goalsMap = new Map<string, string>((data.goals || []).map((g: any) => [g.id as string, g.objectiveId as string]));
      const projectsMap = new Map<string, string>((data.projects || []).map((p: any) => [p.id as string, p.goalId as string]));

      // Inicializa arrays de tarefas vazias para cada objetivo
      for (const obj of data.objectives || []) {
        tasksByObjective[obj.title] = [];
      }

      // Distribui as tarefas para seus respectivos objetivos
      for (const task of data.tasks || []) {
        let objectiveTitle = 'none';
        let targetGoalId = task.goalId;
        if ((!targetGoalId || targetGoalId === 'none') && task.projectId && task.projectId !== 'none') {
          targetGoalId = projectsMap.get(task.projectId);
        }

        if (targetGoalId && targetGoalId !== 'none') {
          const objectiveId = goalsMap.get(targetGoalId);
          if (objectiveId) {
            objectiveTitle = objectivesMap.get(objectiveId) || 'none';
          }
        }
        
        if (objectiveTitle !== 'none') {
          if (!tasksByObjective[objectiveTitle]) {
            tasksByObjective[objectiveTitle] = [];
          }
          tasksByObjective[objectiveTitle].push(task);
        }
      }

      // Salva no localStorage nos formatos legados para retrocompatibilidade
      for (const [title, tasksList] of Object.entries(tasksByObjective)) {
        // Converte de volta para as chaves legadas (metaId ao invés de goalId)
        const legacyTasks = tasksList.map(t => ({
          ...t,
          metaId: t.goalId
        }));
        safeLocalStorage.setItem(`tasks_${title}`, JSON.stringify(legacyTasks));
      }

      return data;
    } catch (e) {
      console.warn('[ObjectivesService] Falha ao buscar no backend. Usando cache local.', e);
      
      // Fallback: reconstrói a árvore a partir do cache local
      const savedObjectives = safeLocalStorage.getItem('objectives_order');
      const savedGoals = safeLocalStorage.getItem('goals_entries');
      const savedProjects = safeLocalStorage.getItem('projects_entries');

      const objectives: Objective[] = savedObjectives ? JSON.parse(savedObjectives) : [];
      const goals: Goal[] = savedGoals ? JSON.parse(savedGoals) : [];
      const projects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
      const tasks: Task[] = [];

      // Carrega tarefas associadas a cada objetivo do localStorage
      for (const obj of objectives) {
        const savedTasks = safeLocalStorage.getItem(`tasks_${obj.title}`);
        if (savedTasks) {
          try {
            const parsedLegacyTasks = JSON.parse(savedTasks);
            if (Array.isArray(parsedLegacyTasks)) {
              parsedLegacyTasks.forEach((t: any) => {
                tasks.push({
                  ...t,
                  id: t.id,
                  title: t.title,
                  projectId: t.projectId || 'none',
                  goalId: t.metaId || t.goalId || 'none',
                  parentTaskId: t.parentTaskId || null,
                  status: t.status === 'completed' || t.status === 'done' ? 'done' : (t.status === 'in-progress' || t.status === 'doing' ? 'doing' : 'todo'),
                  date: t.date,
                  estimatedDuration: t.estimatedDuration || '',
                  actualDuration: t.actualDuration || 0,
                  priority: t.priority || 'medium',
                  imageUrl: t.imageUrl || '',
                  completedAt: t.completedAt,
                  documentIds: t.documentIds || [],
                  createdAt: t.createdAt || Date.now()
                });
              });
            }
          } catch (err) {
            console.error('[ObjectivesService] Erro ao analisar tarefas locais:', err);
          }
        }
      }

      return { objectives, goals, projects, tasks };
    }
  },

  /**
   * Sincronização em lote para envio offline-to-online
   */
  async syncTree(tree: ObjectivesTree): Promise<boolean> {
    try {
      const data = await api.put(`${API_BASE}/objectives/sync`, tree);
      return !!data.success;
    } catch {
      return false;
    }
  },

  /**
   * Salva ou atualiza um objetivo
   */
  async saveObjective(id: string, objective: Partial<Objective>): Promise<Objective> {
    const data = await api.put(`${API_BASE}/objectives/${id}`, objective);
    return data.objective;
  },

  /**
   * Remove um objetivo
   */
  async deleteObjective(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/objectives/${id}`);
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma meta
   */
  async saveGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const data = await api.put(`${API_BASE}/goals/${id}`, goal);
    return data.goal;
  },

  /**
   * Remove uma meta
   */
  async deleteGoal(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/goals/${id}`);
    return !!data.success;
  },

  /**
   * Salva ou atualiza um projeto
   */
  async saveProject(id: string, project: Partial<Project>): Promise<Project> {
    const data = await api.put(`${API_BASE}/projects/${id}`, project);
    return data.project;
  },

  /**
   * Remove um projeto
   */
  async deleteProject(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/projects/${id}`);
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma tarefa
   */
  async saveTask(id: string, task: Partial<Task>): Promise<Task> {
    const data = await api.put(`${API_BASE}/tasks/${id}`, task);
    return data.task;
  },

  /**
   * Remove uma tarefa
   */
  async deleteTask(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/tasks/${id}`);
    return !!data.success;
  }
};
