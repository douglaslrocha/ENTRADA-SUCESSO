/**
 * Organism Event Bus — Universal Live Synchronization Layer
 * 
 * Central broker to broadcast and subscribe to events across the entire biological/digital system.
 * Eliminates the need of page refreshes, route changes or manual UI clicks.
 * Includes a debounced batch protection layer (150-300ms) to group highfrequency events.
 */

export type OrganismEventType =
  | 'transactionCreated'
  | 'transactionUpdated'
  | 'transactionDeleted'
  | 'assetCreated'
  | 'assetUpdated'
  | 'goalUpdated'
  | 'projectionUpdated'
  | 'vaultUpdated'
  | 'workspaceUpdated'
  | 'diaryUpdated'
  | 'systemReset'
  | 'memoryChanged'
  | 'cognitiveChanged'
  | 'cognitiveReady'
  | 'managerChanged'
  | 'energyCatalogUpdated'
  | 'backendError';

type EventCallback = (data?: any) => void;

class OrganismEventBus {
  private listeners: Record<string, EventCallback[]> = {};
  private globalListeners: EventCallback[] = [];
  private debounceTimeout: any = null;
  private pendingRebuilds = false;

  /**
   * Subscribe to a specific organism event
   */
  public subscribe(event: OrganismEventType, callback: EventCallback): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return an unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to ALL events fired by the organism
   */
  public subscribeAll(callback: EventCallback): () => void {
    this.globalListeners.push(callback);
    return () => {
      this.globalListeners = this.globalListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit an event into the system. It cascades to active subscriptions 
   * and triggers a debounced system cognitive sweep if needed.
   */
  public emit(event: OrganismEventType, data?: any) {
    const startEmit = performance.now();
    console.log(`[OrganismEventBus] --- INICIO EMIT: ${event} ---`, data);

    let directListenersCount = 0;
    let directListenersTimeSum = 0;

    // 1. Notify direct subscribers
    if (this.listeners[event]) {
      directListenersCount = this.listeners[event].length;
      this.listeners[event].forEach((callback, idx) => {
        const startCb = performance.now();
        try {
          callback(data);
        } catch (e) {
          console.error(`[OrganismEventBus] Error in subscription for ${event} at index ${idx}`, e);
        } finally {
          const endCb = performance.now();
          directListenersTimeSum += (endCb - startCb);
        }
      });
    }

    let globalListenersCount = this.globalListeners.length;
    let globalListenersTimeSum = 0;

    // 2. Notify global subscribers
    this.globalListeners.forEach((callback, idx) => {
      const startCb = performance.now();
      try {
        callback({ event, data });
      } catch (e) {
        console.error(`[OrganismEventBus] Error in global subscriber for ${event} at index ${idx}`, e);
      } finally {
        const endCb = performance.now();
        globalListenersTimeSum += (endCb - startCb);
      }
    });

    const endEmit = performance.now();
    const duration = endEmit - startEmit;

    console.log(`[INSTRUMENTACAO EVENTO]`);
    console.log(`  - Evento: "${event}"`);
    console.log(`  - Tempo Total Emit: ${duration.toFixed(2)}ms`);
    console.log(`  - Direct listeners: ${directListenersCount} (${directListenersTimeSum.toFixed(2)}ms)`);
    console.log(`  - Global listeners: ${globalListenersCount} (${globalListenersTimeSum.toFixed(2)}ms)`);
    console.log(`  - Payload size: ${data ? JSON.stringify(data).length : 0} chars`);

    // 3. Trigger debounced cognitive rebuild sweep (Avoids 30 rebuilds on fast operations)
    this.queueDebouncedCognitiveSweep();
  }

  /**
   * Groups subsequent rapid entries into a single synchronized evaluation context.
   */
  private queueDebouncedCognitiveSweep() {
    this.pendingRebuilds = true;

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(async () => {
      if (!this.pendingRebuilds) return;
      this.pendingRebuilds = false;

      console.log('[OrganismEventBus] Batch Protection: executando rebuild concentrado do organismo... ⚡');
      
      try {
        // Trigger financial rebuilds
        const { financialObservers } = await import('../engines/financialObservers');
        financialObservers.invalidate();
        financialObservers.rebuild();
        financialObservers.notifyChange();

        // Trigger context & prompt rebuilds
        const { existentialCoreEngine } = await import('./existentialCoreEngine');
        const { existentialVectorsEngine } = await import('./existentialVectorsEngine');
        existentialCoreEngine.invalidate();
        existentialVectorsEngine.invalidate();
        
        // Notify any cognitive updates
        this.emitDirectly('cognitiveChanged');
      } catch (e) {
        console.error('[OrganismEventBus] Falha no rebuild concentrado do organismo de segurança', e);
      }
    }, 250); // Balanced debounce delay (150-300ms)
  }

  /**
   * Internal direct emitter without triggering recursive sweeps
   */
  private emitDirectly(event: OrganismEventType, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {}
      });
    }
    this.globalListeners.forEach(callback => {
      try {
        callback({ event, data });
      } catch (e) {}
    });
  }
}

export const organismEventBus = new OrganismEventBus();
