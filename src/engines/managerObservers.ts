import { organismEventBus } from '../services/organismEventBus';
import { managerSemanticEngine } from './managerSemanticEngine';
import { managerCognitiveIndex } from './managerCognitiveIndex';

class ManagerObservers {
  public documentCreated(pageId: string, title: string, content: string) {
    console.log(`[ManagerObservers] documentCreated event: pageId=${pageId}, title="${title}"`);
    
    // Invalidate local index and rebuild semantically
    managerSemanticEngine.analyzeDocument(pageId, title, content);
    managerCognitiveIndex.refreshIndex();

    // Broadcast change
    organismEventBus.emit('managerChanged', { action: 'create', type: 'document', pageId });
  }

  public documentUpdated(pageId: string, title: string, content: string) {
    console.log(`[ManagerObservers] documentUpdated event: pageId=${pageId}, title="${title}"`);
    
    managerSemanticEngine.analyzeDocument(pageId, title, content);
    managerCognitiveIndex.refreshIndex();

    organismEventBus.emit('managerChanged', { action: 'update', type: 'document', pageId });
  }

  public documentDeleted(pageId: string) {
    console.log(`[ManagerObservers] documentDeleted event: pageId=${pageId}`);
    
    // Refreshing semantic memory and cognitive index will prune the deleted page record automatically
    managerSemanticEngine.syncAllDocuments();
    managerCognitiveIndex.refreshIndex();

    organismEventBus.emit('managerChanged', { action: 'delete', type: 'document', pageId });
  }

  public workspaceChanged() {
    console.log('[ManagerObservers] workspaceChanged event');
    
    managerSemanticEngine.syncAllDocuments();
    managerCognitiveIndex.refreshIndex();

    organismEventBus.emit('managerChanged', { action: 'change', type: 'workspace' });
  }

  public folderChanged() {
    console.log('[ManagerObservers] folderChanged event');
    
    managerSemanticEngine.syncAllDocuments();
    managerCognitiveIndex.refreshIndex();

    organismEventBus.emit('managerChanged', { action: 'change', type: 'folder' });
  }
}

export const managerObservers = new ManagerObservers();
