import { documentService } from '../services/documentService';
import { safeLocalStorage } from '../utils/storage';
import { PerfProfiler } from '../utils/perfProfiler';

export interface CognitiveItemIndex {
  id: string;
  type: 'workspace' | 'folder' | 'page' | 'link' | 'attachment';
  name: string;
  parentId: string | null;
  path: string; // e.g. "Meu Workspace > Projetos > Planejamento"
  tags: string[];
}

export interface ManagerCognitiveIndexData {
  items: Record<string, CognitiveItemIndex>;
  totalWorkspaces: number;
  totalFolders: number;
  totalPages: number;
  recentDocuments: { id: string; name: string; path: string; updatedAt: string }[];
  importantDocuments: { id: string; name: string; importance: number }[];
  lastUpdate: number;
}

const STORAGE_KEY = 'manager_cognitive_index';

class ManagerCognitiveIndex {
  private data: ManagerCognitiveIndexData = {
    items: {},
    totalWorkspaces: 0,
    totalFolders: 0,
    totalPages: 0,
    recentDocuments: [],
    importantDocuments: [],
    lastUpdate: 0
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.data = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[ManagerCognitiveIndex] Error loading index', e);
    }
  }

  private save() {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('[ManagerCognitiveIndex] Error saving index', e);
    }
  }

  public getIndexData(): ManagerCognitiveIndexData {
    return this.data;
  }

  public refreshIndex(): ManagerCognitiveIndexData {
    return PerfProfiler.measure('managerCognitiveIndex.refreshIndex', () => {
      return this.refreshIndexInternal();
    });
  }

  private refreshIndexInternal(): ManagerCognitiveIndexData {
    console.log('[ManagerCognitiveIndex] Refreshing cognitive index from physical files...');
    const workspaces = documentService.getWorkspaces();
    
    const items: Record<string, CognitiveItemIndex> = {};
    let totalWorkspaces = 0;
    let totalFolders = 0;
    let totalPages = 0;
    const allPages: { id: string; name: string; path: string; updatedAt: string; content: string }[] = [];

    workspaces.forEach(ws => {
      if (ws.isHidden) {
        return; // Skip hidden workspaces for the AI indexing and search completely
      }
      totalWorkspaces++;
      items[ws.id] = {
        id: ws.id,
        type: 'workspace',
        name: ws.name,
        parentId: null,
        path: ws.name,
        tags: []
      };

      ws.folders.forEach(folder => {
        totalFolders++;
        items[folder.id] = {
          id: folder.id,
          type: 'folder',
          name: folder.name,
          parentId: ws.id,
          path: `${ws.name} > ${folder.name}`,
          tags: []
        };

        folder.pages.forEach(page => {
          totalPages++;
          items[page.id] = {
            id: page.id,
            type: 'page',
            name: page.title,
            parentId: folder.id,
            path: `${ws.name} > ${folder.name} > ${page.title}`,
            tags: []
          };

          allPages.push({
            id: page.id,
            name: page.title,
            path: `${ws.name} > ${folder.name} > ${page.title}`,
            updatedAt: page.updatedAt || page.createdAt || new Date().toISOString(),
            content: page.content || ''
          });
        });
      });
    });

    // Sort recent documents
    const recentDocuments = allPages
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        name: p.name,
        path: p.path,
        updatedAt: p.updatedAt
      }));

    // Import semantic attributes for importance mapping
    const importantDocuments: { id: string; name: string; importance: number }[] = [];
    allPages.forEach(p => {
      // Simple heuristic for index level importance if semantic engine is not yet filled, 
      // or check content keywords
      let importance = 5;
      if (/urgente|crítico|prioridade|foco/i.test(p.content)) {
        importance = 9;
      }
      importantDocuments.push({
        id: p.id,
        name: p.name,
        importance
      });
    });

    importantDocuments.sort((a, b) => b.importance - a.importance);

    this.data = {
      items,
      totalWorkspaces,
      totalFolders,
      totalPages,
      recentDocuments,
      importantDocuments: importantDocuments.slice(0, 5),
      lastUpdate: Date.now()
    };

    this.save();
    return this.data;
  }

  public invalidate() {
    this.refreshIndex();
  }

  public clear() {
    this.data = {
      items: {},
      totalWorkspaces: 0,
      totalFolders: 0,
      totalPages: 0,
      recentDocuments: [],
      importantDocuments: [],
      lastUpdate: 0
    };
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}

export const managerCognitiveIndex = new ManagerCognitiveIndex();
