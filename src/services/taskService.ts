import { supabase } from './supabaseClient';
import { safeLocalStorage } from '../utils/storage';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export const taskService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tarefas').select('*');
    if (error) {
      console.error('[taskService] Erro ao buscar tarefas do Supabase:', error);
      const stored = safeLocalStorage.getItem('personal_os_tasks');
      if (stored) return JSON.parse(stored);
      return [];
    }
    const tasks: Task[] = (data || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: (t.status === 'done' ? 'completed' : 'pending') as 'completed' | 'pending',
      createdAt: t.created_at || new Date().toISOString()
    }));
    safeLocalStorage.setItem('personal_os_tasks', JSON.stringify(tasks));
    return tasks;
  },

  getTasksLocal(): Task[] {
    const stored = safeLocalStorage.getItem('personal_os_tasks');
    if (stored) return JSON.parse(stored);
    return [];
  },

  async syncWithBackend() {
    // Agora o Supabase é a nossa fonte primária. Este método serve para manter compatibilidade na inicialização.
    console.log('[taskService] Sincronização direta com o Supabase ativada.');
  },

  async addTask(title: string, description?: string): Promise<Task> {
    const newTask: Task = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const dbPayload = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description || '',
      status: 'todo',
      execution_type: 'standard',
      complexity: 'low',
      priority: 'medium',
      created_at: newTask.createdAt
    };

    const { error } = await supabase.from('tarefas').insert(dbPayload);
    if (error) {
      console.error('[taskService] Erro ao salvar tarefa no Supabase:', error);
    }

    return newTask;
  },

  async updateTaskStatus(id: string, status: 'pending' | 'completed') {
    const dbStatus = status === 'completed' ? 'done' : 'todo';
    const { error } = await supabase
      .from('tarefas')
      .update({ status: dbStatus, completed_at: status === 'completed' ? new Date().toISOString() : null })
      .eq('id', id);

    if (error) {
      console.error('[taskService] Erro ao atualizar status da tarefa no Supabase:', error);
    }
  }
};
