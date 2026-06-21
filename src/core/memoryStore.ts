import { UserProfile, initialUserProfile } from './userProfile';
import { safeLocalStorage } from '../utils/storage';

export interface MemoryData {
  userProfile: UserProfile;
  patterns: string[];
  history: any[];
}

const MEMORY_KEY = 'app_memory_v1';

const initialMemory: MemoryData = {
  userProfile: initialUserProfile,
  patterns: [],
  history: []
};

export const memoryStore = {
  getMemory(): MemoryData {
    const stored = safeLocalStorage.getItem(MEMORY_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('[MemoryStore] Erro ao parsear memória:', e);
      }
    }
    return initialMemory;
  },

  saveMemory(data: MemoryData) {
    safeLocalStorage.setItem(MEMORY_KEY, JSON.stringify(data));
    console.log('[MemoryStore] Memória processada no armazenamento.');
  },

  updateMemory(partial: Partial<MemoryData>) {
    const current = this.getMemory();
    const updated = { ...current, ...partial };
    this.saveMemory(updated);
  }
};
