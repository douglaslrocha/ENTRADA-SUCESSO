import { organismEventBus, OrganismEventType } from '../services/organismEventBus';
import { db } from '../services/db';
import { PerfProfiler } from '../utils/perfProfiler';
import { financialObservers } from '../engines/financialObservers';
import { financialCognitiveEngine } from '../services/financialCognitiveEngine';
import { financialHistoryEngine } from '../engines/financialHistoryEngine';
import { existentialVectorsEngine } from '../services/existentialVectorsEngine';
import { existentialCoreEngine } from '../services/existentialCoreEngine';
import { assetCognitiveIndex } from '../engines/assetCognitiveIndex';
import { vaultSemanticMap } from '../engines/vaultSemanticMap';
import { financialSemanticEngine } from '../engines/financialSemanticEngine';
import { dashboardSemanticService } from '../services/dashboardSemanticService';
import { managerSemanticEngine } from '../engines/managerSemanticEngine';
import { managerCognitiveIndex } from '../engines/managerCognitiveIndex';
import { attachmentSemanticMap } from '../engines/attachmentSemanticMap';
import { safeLocalStorage } from '../utils/storage';

export interface CognitiveState {
  version: number;
  status: 'idle' | 'rebuilding' | 'ready';
  lastUpdate: number;
  source: string;
}

class CognitiveSyncPlugin {
  private isProcessing = false;
  private rebuildPromise: Promise<void> | null = null;

  public getCognitiveState(): CognitiveState {
    const raw = safeLocalStorage.getItem('global_cognitive_state');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        // Safe fallback below
      }
    }
    const defaultState: CognitiveState = { version: 1, status: 'ready', lastUpdate: Date.now(), source: 'init' };
    safeLocalStorage.setItem('global_cognitive_state', JSON.stringify(defaultState));
    return defaultState;
  }

  public getVersion() {
    return { version: this.getCognitiveState().version };
  }

  public setCognitiveState(state: CognitiveState) {
    safeLocalStorage.setItem('global_cognitive_state', JSON.stringify(state));
  }

  public invalidateAll() {
    return PerfProfiler.measure('CognitiveSyncPlugin.invalidateAll', () => {
      this.invalidateAllInternal();
    });
  }

  private invalidateAllInternal() {
    console.log('[CognitiveSyncPlugin] Executing invalidateAll()...');

    // Remove localStorage cached states
    safeLocalStorage.removeItem('global_cognitive_finance_cache');
    safeLocalStorage.removeItem('financial_semantic_memory');
    safeLocalStorage.removeItem('global_existential_vectors');
    safeLocalStorage.removeItem('dashboard_snapshot');
    safeLocalStorage.removeItem('global_existential_memory_cache');
    safeLocalStorage.removeItem('asset_cognitive_index');
    safeLocalStorage.removeItem('vault_semantic_map');
    safeLocalStorage.removeItem('transaction_fingerprint_cache');
    safeLocalStorage.removeItem('manager_semantic_memory');
    safeLocalStorage.removeItem('manager_cognitive_index');
    safeLocalStorage.removeItem('attachment_semantic_map');

    // Force dirty flag
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');

    // Reset actual engines in memory
    try { financialObservers.invalidate(); } catch (e) { console.error(e); }
    try { financialCognitiveEngine.invalidate(); } catch (e) { console.error(e); }
    try { existentialCoreEngine.invalidate(); } catch (e) { console.error(e); }
    try { existentialVectorsEngine.invalidate(); } catch (e) { console.error(e); }
    try { assetCognitiveIndex.clear(); } catch (e) { console.error(e); }
    try { vaultSemanticMap.clear(); } catch (e) { console.error(e); }
    try { financialSemanticEngine.clear(); } catch (e) { console.error(e); }
    try { dashboardSemanticService.invalidateSnapshot(); } catch (e) { console.error(e); }
    try { managerSemanticEngine.clear(); } catch (e) { console.error(e); }
    try { managerCognitiveIndex.clear(); } catch (e) { console.error(e); }
    try { attachmentSemanticMap.clear(); } catch (e) { console.error(e); }
  }

  public async rebuildAll(source = 'manual'): Promise<void> {
    return PerfProfiler.measureAsync('CognitiveSyncPlugin.rebuildAll', () => {
      return this.rebuildAllInternal(source);
    });
  }

  private async rebuildAllInternal(source = 'manual'): Promise<void> {
    if (this.rebuildPromise) {
      return this.rebuildPromise;
    }

    const state = this.getCognitiveState();
    const nextVersion = state.version + 1;

    // Set status to rebuilding immediately
    this.setCognitiveState({
      version: state.version, // Keep version until ready of the full rebuild
      status: 'rebuilding',
      lastUpdate: Date.now(),
      source
    });

    console.log(`[CognitiveSyncPlugin] Starting asynchronous rebuildAll() [Ver: ${nextVersion}] (Source: ${source})...`);
    this.isProcessing = true;

    this.rebuildPromise = (async () => {
      try {
        const categories = db.getCategories();
        const transactions = db.getTransactions();

        // Run independent extraction processes concurrently for extreme efficiency and exact consistency
        await Promise.all([
          (async () => {
            try {
              financialHistoryEngine.getHistory();
            } catch (e) {
              console.error('Error on financialHistoryEngine.getHistory()', e);
            }
          })(),
          (async () => {
            try {
              financialSemanticEngine.syncAllTransactions(transactions);
            } catch (e) {
              console.error('Error on financialSemanticEngine.syncAllTransactions()', e);
            }
          })(),
          (async () => {
            try {
              assetCognitiveIndex.refreshIndex();
            } catch (e) {
              console.error('Error on assetCognitiveIndex.refreshIndex()', e);
            }
          })(),
          (async () => {
            try {
              vaultSemanticMap.refreshMap();
            } catch (e) {
              console.error('Error on vaultSemanticMap.refreshMap()', e);
            }
          })(),
          (async () => {
            try {
              managerSemanticEngine.syncAllDocuments();
            } catch (e) {
              console.error('Error on managerSemanticEngine.syncAllDocuments()', e);
            }
          })(),
          (async () => {
            try {
              managerCognitiveIndex.refreshIndex();
            } catch (e) {
              console.error('Error on managerCognitiveIndex.refreshIndex()', e);
            }
          })()
        ]);

        // Next sequential dependency chain
        await Promise.all([
          (async () => {
            try {
              financialObservers.rebuild();
            } catch (e) {
              console.error('Error on financialObservers.rebuild()', e);
            }
          })(),
          (async () => {
            try {
              dashboardSemanticService.getOrGenerateSnapshot(categories, transactions);
            } catch (e) {
              console.error('Error on dashboardSemanticService.getOrGenerateSnapshot()', e);
            }
          })()
        ]);

        // Finish downstream synthesis
        await Promise.all([
          (async () => {
            try {
              financialCognitiveEngine.rebuildIntelligence();
            } catch (e) {
              console.error('Error on financialCognitiveEngine.rebuildIntelligence()', e);
            }
          })(),
          (async () => {
            try {
              existentialCoreEngine.generateGlobalMemory();
            } catch (e) {
              console.error('Error on existentialCoreEngine.generateGlobalMemory()', e);
            }
          })(),
          (async () => {
            try {
              existentialVectorsEngine.generateExistentialVectors();
            } catch (e) {
              console.error('Error on existentialVectorsEngine.generateExistentialVectors()', e);
            }
          })()
        ]);

        // Update to ready state with incremented version
        this.setCognitiveState({
          version: nextVersion,
          status: 'ready',
          lastUpdate: Date.now(),
          source
        });

        console.log(`[CognitiveSyncPlugin] Rebuild succeeded! System locked at version ${nextVersion} [Ready].`);
        
        // Notify the entire system through our bus to trigger instant react binds
        organismEventBus.emit('cognitiveReady', { version: nextVersion });
      } catch (error) {
        console.error('[CognitiveSyncPlugin] Critical error while rebuilding intelligence:', error);
        this.setCognitiveState({
          version: state.version,
          status: 'idle',
          lastUpdate: Date.now(),
          source: 'error:' + source
        });
      } finally {
        this.isProcessing = false;
        this.rebuildPromise = null;
      }
    })();

    return this.rebuildPromise;
  }

  public async waitForReady(): Promise<void> {
    const check = () => {
      const state = this.getCognitiveState();
      return state.status !== 'rebuilding';
    };

    if (check()) return;

    return new Promise<void>((resolve) => {
      const unsubscribe = organismEventBus.subscribe('cognitiveReady', () => {
        unsubscribe();
        resolve();
      });

      // Polling fallback to avoid locks if event is missed
      const interval = setInterval(() => {
        if (check()) {
          clearInterval(interval);
          unsubscribe();
          resolve();
        }
      }, 50);
    });
  }

  public init() {
    console.log('[CognitiveSyncPlugin] Initializing universal listener with extreme consistency lock...');
    
    // Subscribe to all event bus updates
    organismEventBus.subscribeAll((eventPayload: any) => {
      if (this.isProcessing) return;

      const eventType = eventPayload?.event as OrganismEventType;
      if (!eventType) return;
      if (eventType === 'cognitiveReady') return; // Ignore self notifications to prevent loops

      console.log(`[CognitiveSyncPlugin] Intercepted event: ${eventType}. Locking system...`);
      
      // Determine categorized source of change
      let source = 'unknown';
      if (['transactionCreated', 'transactionUpdated', 'transactionDeleted'].includes(eventType)) {
        source = 'financial';
      } else if (['assetCreated', 'assetUpdated'].includes(eventType)) {
        source = 'mural';
      } else if (eventType === 'goalUpdated') {
        source = 'goals';
      } else if (eventType === 'diaryUpdated') {
        source = 'diary';
      } else if (eventType === 'projectionUpdated') {
        source = 'time';
      } else if (eventType === 'vaultUpdated') {
        source = 'vault';
      } else if (eventType === 'workspaceUpdated') {
        source = 'dashboard';
      } else if (eventType === 'managerChanged') {
        source = 'manager';
      } else if (eventType === 'cognitiveChanged') {
        source = 'existential';
      } else if (eventType === 'memoryChanged') {
        source = 'amparadora';
      } else if (eventType === 'systemReset') {
        source = 'systemReset';
      }

      // Invalidate everything first
      this.invalidateAll();

      // Recalculate/Rebuild asynchronously 
      this.rebuildAll(source);
    });
  }
}

export const cognitiveSyncPlugin = new CognitiveSyncPlugin();
