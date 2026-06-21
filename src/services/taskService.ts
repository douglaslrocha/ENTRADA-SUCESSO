import { safeLocalStorage } from '../utils/storage';

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

  addTask(title: string, description?: string): Task {
    const tasks = this.getTasks();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.saveTasks([...tasks, newTask]);
    return newTask;
  }
};
