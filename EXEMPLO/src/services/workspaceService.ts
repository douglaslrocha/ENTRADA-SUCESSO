import { Workspace } from '../types';

const API_BASE = '/api/workspaces';

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'default',
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('[WorkspaceService] Erro na API de workspaces:', error);
    throw error;
  }
}

export const workspaceService = {
  /**
   * Obtém a árvore completa de workspaces do banco de dados
   */
  async getWorkspaces(): Promise<{ workspaces: Workspace[] }> {
    return await apiFetch('');
  },

  /**
   * Sincroniza em lote todo o estado estrutural de workspaces local
   */
  async syncWorkspaces(payload: { workspaces: Workspace[] }): Promise<{ success: boolean }> {
    return await apiFetch('/sync', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Salva ou atualiza um workspace individual
   */
  async saveWorkspace(id: string, workspace: Omit<Workspace, 'id' | 'folders'>): Promise<any> {
    return await apiFetch(`/workspace/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workspace),
    });
  },

  /**
   * Remove um workspace individual
   */
  async deleteWorkspace(id: string): Promise<boolean> {
    const data = await apiFetch(`/workspace/${id}`, {
      method: 'DELETE',
    });
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma pasta (Folder) individual
   */
  async saveFolder(id: string, folder: {
    workspaceId: string;
    name: string;
    isPinned?: boolean;
    color?: string;
    icon?: string;
    iconType?: 'emoji' | 'lucide' | 'image';
    imageUrl?: string;
  }): Promise<any> {
    return await apiFetch(`/folder/${id}`, {
      method: 'PUT',
      body: JSON.stringify(folder),
    });
  },

  /**
   * Remove uma pasta individual
   */
  async deleteFolder(id: string): Promise<boolean> {
    const data = await apiFetch(`/folder/${id}`, {
      method: 'DELETE',
    });
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma página (Page) individual
   */
  async savePage(id: string, page: {
    folderId: string;
    title: string;
    content?: string;
    isPinned?: boolean;
    coverImage?: string | null;
    coverPosition?: number;
    icon?: string | null;
  }): Promise<any> {
    return await apiFetch(`/page/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
  },

  /**
   * Remove uma página individual
   */
  async deletePage(id: string): Promise<boolean> {
    const data = await apiFetch(`/page/${id}`, {
      method: 'DELETE',
    });
    return !!data.success;
  },
};
