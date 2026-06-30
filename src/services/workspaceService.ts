import { Workspace } from '../types';
import { supabase, camelToSnake, snakeToCamel } from './supabaseClient';

export const workspaceService = {
  /**
   * Obtém a árvore completa de workspaces, pastas e páginas do Supabase
   */
  async getWorkspaces(): Promise<{ workspaces: Workspace[] }> {
    const { data: wsData, error: wsErr } = await supabase.from('workspaces').select('*');
    const { data: fData, error: fErr } = await supabase.from('folders').select('*');
    const { data: pData, error: pErr } = await supabase.from('pages').select('*');

    if (wsErr || fErr || pErr) {
      console.error('[workspaceService] Erro ao carregar workspaces do Supabase:', { wsErr, fErr, pErr });
      return { workspaces: [] };
    }

    const pages = (pData || []).map(p => snakeToCamel(p));
    const folders = (fData || []).map(f => {
      const folder = snakeToCamel(f);
      folder.pages = pages.filter((p: any) => p.folderId === folder.id);
      return folder;
    });

    const workspaces = (wsData || []).map(w => {
      const workspace = snakeToCamel(w);
      workspace.folders = folders.filter((f: any) => f.workspaceId === workspace.id);
      return workspace;
    });

    return { workspaces };
  },

  /**
   * Sincroniza em lote todo o estado estrutural de workspaces local (No-op com Supabase já direto)
   */
  async syncWorkspaces(payload: { workspaces: Workspace[] }): Promise<{ success: boolean }> {
    try {
      for (const ws of payload.workspaces) {
        const wsPayload = { ...ws };
        delete wsPayload.folders;
        await this.saveWorkspace(ws.id, wsPayload);

        if (ws.folders) {
          for (const folder of ws.folders) {
            const folderPayload = { ...folder, workspaceId: ws.id };
            delete folderPayload.pages;
            await this.saveFolder(folder.id, folderPayload);

            if (folder.pages) {
              for (const page of folder.pages) {
                const pagePayload = { ...page, folderId: folder.id };
                await this.savePage(page.id, pagePayload);
              }
            }
          }
        }
      }
      return { success: true };
    } catch (e) {
      console.error('[workspaceService] Erro no syncWorkspaces:', e);
      return { success: false };
    }
  },

  /**
   * Salva ou atualiza um workspace individual
   */
  async saveWorkspace(id: string, workspace: Omit<Workspace, 'id' | 'folders'>): Promise<any> {
    const dbPayload = camelToSnake({ ...workspace, id });
    const { data, error } = await supabase.from('workspaces').upsert(dbPayload).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Remove um workspace individual
   */
  async deleteWorkspace(id: string): Promise<boolean> {
    const { error } = await supabase.from('workspaces').delete().eq('id', id);
    return !error;
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
    const dbPayload = camelToSnake({ ...folder, id });
    const { data, error } = await supabase.from('folders').upsert(dbPayload).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Remove uma pasta individual
   */
  async deleteFolder(id: string): Promise<boolean> {
    const { error } = await supabase.from('folders').delete().eq('id', id);
    return !error;
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
    const dbPayload = camelToSnake({ ...page, id });
    const { data, error } = await supabase.from('pages').upsert(dbPayload).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Remove uma página individual
   */
  async deletePage(id: string): Promise<boolean> {
    const { error } = await supabase.from('pages').delete().eq('id', id);
    return !error;
  },
};
