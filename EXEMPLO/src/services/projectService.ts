import { safeLocalStorage } from '../utils/storage';

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold';
  taskIds: string[];
  documentIds: string[];
  createdAt: string;
}

const STORAGE_KEY = 'personal_os_projects';

export const projectService = {
  getProjects(): Project[] {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveProjects(projects: Project[]) {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  },

  addProject(title: string, description?: string): Project {
    const projects = this.getProjects();
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      status: 'active',
      taskIds: [],
      documentIds: [],
      createdAt: new Date().toISOString()
    };
    this.saveProjects([...projects, newProject]);
    return newProject;
  },

  linkTask(projectId: string, taskId: string) {
    const projects = this.getProjects();
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, taskIds: [...new Set([...p.taskIds, taskId])] };
      }
      return p;
    });
    this.saveProjects(updatedProjects);
  },

  linkDocument(projectId: string, documentId: string) {
    const projects = this.getProjects();
    const updatedProjects = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, documentIds: [...new Set([...p.documentIds, documentId])] };
      }
      return p;
    });
    this.saveProjects(updatedProjects);
  }
};
