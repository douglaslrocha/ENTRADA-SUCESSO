import { Page, Folder, Workspace } from '../types';
import { safeLocalStorage } from '../utils/storage';
import { organismEventBus } from './organismEventBus';
import { PerfProfiler } from '../utils/perfProfiler';
import { workspaceService } from './workspaceService';

const STORAGE_KEY = 'personal_os_documents';

const DEFAULT_ITEMS: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Meu Workspace',
    folders: [
      {
        id: 'f-1',
        name: 'Projetos 2026',
        pages: [
          { id: 'p-1', title: 'Planejamento Financeiro', content: '<h1>Planejamento</h1>', createdAt: new Date().toISOString() },
          { id: 'p-2', title: 'Metas Trimestrais', content: '<p>Metas...</p>', createdAt: new Date().toISOString() },
        ]
      },
      {
        id: 'f-2',
        name: 'Pessoal',
        pages: []
      }
    ]
  }
];

export const documentService = {
  getWorkspaces(): Workspace[] {
    return PerfProfiler.measure('documentService.getWorkspaces', () => {
      const stored = safeLocalStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("REIDRATADO [documentService.getWorkspaces]:", parsed);
        return parsed;
      }
      console.log("REIDRATADO [documentService.getWorkspaces]: Criando/Semeando DEFAULT_ITEMS", DEFAULT_ITEMS);
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
      return DEFAULT_ITEMS;
    });
  },

  saveWorkspaces(workspaces: Workspace[]) {
    return PerfProfiler.measure('documentService.saveWorkspaces', () => {
      console.log("ANTES [documentService.saveWorkspaces]:", safeLocalStorage.getItem(STORAGE_KEY));
      console.log("SALVANDO [documentService.saveWorkspaces]:", workspaces);
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
      console.log("DB [documentService.saveWorkspaces] PERSISTIDO:", safeLocalStorage.getItem(STORAGE_KEY));
      organismEventBus.emit('managerChanged');

      // Dispara sincronização em lote para o backend em background
      workspaceService.syncWorkspaces({ workspaces }).catch(err => {
        console.warn('[documentService] Falha ao sincronizar workspaces com o backend:', err);
      });
    });
  },

  /**
   * Sincroniza os workspaces locais com o banco de dados PostgreSQL
   */
  async syncWithBackend() {
    try {
      console.log('[documentService] Sincronizando workspaces com o backend...');
      const data = await workspaceService.getWorkspaces();
      
      // Se houver dados salvos no backend, atualiza o cache local
      if (data.workspaces && data.workspaces.length > 0) {
        safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(data.workspaces));
        organismEventBus.emit('managerChanged');
        console.log('[documentService] Sincronização de workspaces realizada com sucesso.');
      } else {
        // Se o backend estiver vazio mas temos dados locais, envia os locais para o backend
        const localWorkspaces = this.getWorkspaces();
        if (localWorkspaces && localWorkspaces.length > 0) {
          console.log('[documentService] Enviando dados locais iniciais para o backend...');
          await workspaceService.syncWorkspaces({ workspaces: localWorkspaces });
        }
      }
    } catch (error) {
      console.warn('[documentService] Falha ao sincronizar com backend (utilizando cache local offline):', error);
    }
  },

  addPage(workspaceId: string, folderId: string | null, title: string, content: string): Page {
    const workspaces = this.getWorkspaces();
    const newPage: Page = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      createdAt: new Date().toISOString()
    };

    const updatedWorkspaces = workspaces.map(ws => {
      if (ws.id === workspaceId) {
        // Check if folderId actually exists in this workspace
        const targetFolder = folderId ? ws.folders.find(f => f.id === folderId) : null;
        
        if (targetFolder) {
          return {
            ...ws,
            folders: ws.folders.map(f => {
              if (f.id === folderId) {
                return { ...f, pages: [...f.pages, newPage] };
              }
              return f;
            })
          };
        } else {
          // If no folderId or folder not found in this workspace, 
          // add to the first folder or create one
          if (ws.folders.length > 0) {
            return {
              ...ws,
              folders: ws.folders.map((f, i) => i === 0 ? { ...f, pages: [...f.pages, newPage] } : f)
            };
          } else {
            // Create a default folder if none exists
            const defaultFolder: Folder = {
              id: 'f-' + Math.random().toString(36).substr(2, 5),
              name: 'Geral',
              pages: [newPage]
            };
            return {
              ...ws,
              folders: [defaultFolder]
            };
          }
        }
      }
      return ws;
    });

    this.saveWorkspaces(updatedWorkspaces);
    
    // Lazy notify observer
    import('../engines/managerObservers').then(({ managerObservers }) => {
      managerObservers.documentCreated(newPage.id, title, content);
    }).catch(e => console.error(e));

    return newPage;
  },

  async createDocument(title: string, content: string = ''): Promise<Page> {
    const workspaces = this.getWorkspaces();
    // Ensure at least one workspace exists
    if (workspaces.length === 0) {
      workspaces.push({
        id: 'ws-1',
        name: 'Meu Workspace',
        folders: []
      });
      this.saveWorkspaces(workspaces);
    }
    
    const wsId = workspaces[0].id;
    const folderId = workspaces[0].folders[0]?.id || null;
    const page = this.addPage(wsId, folderId, title, content);
    return page;
  },

  getPageById(id: string): Page | null {
    const workspaces = this.getWorkspaces();
    for (const ws of workspaces) {
      for (const folder of ws.folders) {
        const page = folder.pages.find(p => p.id === id);
        if (page) return page;
      }
    }
    return null;
  },

  updatePage(id: string, updates: Partial<Page>): boolean {
    const workspaces = this.getWorkspaces();
    let found = false;
    let pageTitle = '';
    let pageContent = '';

    const updatedWorkspaces = workspaces.map(ws => ({
      ...ws,
      folders: ws.folders.map(f => ({
        ...f,
        pages: f.pages.map(p => {
          if (p.id === id) {
            found = true;
            pageTitle = updates.title !== undefined ? updates.title : p.title;
            pageContent = updates.content !== undefined ? updates.content : p.content;
            return { ...p, ...updates, updatedAt: new Date().toISOString() };
          }
          return p;
        })
      }))
    }));

    if (found) {
      this.saveWorkspaces(updatedWorkspaces);
      
      // Lazy notify observer
      const titleToNotify = pageTitle;
      const contentToNotify = pageContent;
      import('../engines/managerObservers').then(({ managerObservers }) => {
        managerObservers.documentUpdated(id, titleToNotify, contentToNotify);
      }).catch(e => console.error(e));
    }
    return found;
  },
  
  deletePage(id: string): boolean {
    const workspaces = this.getWorkspaces();
    let found = false;

    const updatedWorkspaces = workspaces.map(ws => ({
      ...ws,
      folders: ws.folders.map(f => ({
        ...f,
        pages: f.pages.filter(p => {
          if (p.id === id) {
            found = true;
            return false;
          }
          return true;
        })
      }))
    }));

    if (found) {
      this.saveWorkspaces(updatedWorkspaces);
      
      // Lazy notify observer
      import('../engines/managerObservers').then(({ managerObservers }) => {
        managerObservers.documentDeleted(id);
      }).catch(e => console.error(e));
    }
    return found;
  }
};
