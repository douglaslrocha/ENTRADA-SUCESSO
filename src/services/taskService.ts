import { safeLocalStorage } from '../utils/storage';
import { api } from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

const STORAGE_KEY = 'personal_os_tasks';

export const taskService = {
  getTasks(): Task[] {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveTasks(tasks: Task[]) {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  },

  async syncWithBackend() {
    try {
      const data = await api.get('/api/objetivos');
      if (data && data.tasks) {
        const mappedTasks: Task[] = data.tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: t.status === 'done' ? 'completed' : 'pending',
          createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString()
        }));
        this.saveTasks(mappedTasks);
        console.log('[taskService] Sincronização de tarefas com o backend concluída com sucesso.');
      }
    } catch (e) {
      console.warn('[taskService] Erro ao sincronizar tarefas com backend:', e);
    }
  },

  addTask(title: string, description?: string): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.saveTasks([...tasks, newTask]);

    // Envia ao backend em background
    const backendTask = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description || '',
      status: 'todo',
      executionType: 'standard',
      complexity: 'low',
      priority: 'medium',
      scheduledDate: new Date(newTask.createdAt).getTime()
    };
    api.put(`/api/tarefas/${newTask.id}`, backendTask).catch(e => {
      console.warn('[taskService] Erro ao enviar tarefa para o backend:', e);
    });

    return newTask;
  },

  updateTaskStatus(id: string, status: 'pending' | 'completed') {
    const tasks = this.getTasks();
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    this.saveTasks(updated);

    const task = updated.find(t => t.id === id);
    if (task) {
      const backendTask = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: status === 'completed' ? 'done' : 'todo',
        executionType: 'standard',
        complexity: 'low',
        priority: 'medium',
        scheduledDate: new Date(task.createdAt).getTime()
      };
      api.put(`/api/tarefas/${task.id}`, backendTask).catch(e => {
        console.warn('[taskService] Erro ao atualizar status da tarefa no backend:', e);
      });
    }
  }
};
