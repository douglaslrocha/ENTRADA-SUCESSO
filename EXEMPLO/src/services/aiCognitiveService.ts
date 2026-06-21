import { api } from './api';
import { safeLocalStorage } from '../utils/storage';

export interface KnowledgeDoc {
  id: string;
  title: string;
  type: 'pdf' | 'book' | 'link';
  addedAt: string;
  size: string;
  value?: string;
}

export interface CognitiveSettings {
  global_personality: string;
  temperature: number;
  selected_model: string;
  knowledge_constraint: 'flexible' | 'strict';
  knowledge_docs: KnowledgeDoc[];
}

export interface ModelUsage {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface ServerUsageData {
  totalCostUSD: number;
  limitUSD: number;
  killSwitchActive: boolean;
  byModel: Record<string, ModelUsage>;
}

const DEFAULT_PERSONALITY = "Você é a Amparadora de Próxima Geração. Deve agir com extrema empatia, pragmatismo analítico e inteligência holística. Seu rumo de conversa deve ser focado em apoiar minhas tomadas de decisão de forma lúcida, equilibrada e focada no auto-aperfeiçoamento quotidiano. Evite respostas genéricas e traga uma visão madura baseada em lógica.";

export const aiCognitiveService = {
  // Sync in memory state
  localCache: null as CognitiveSettings | null,

  async getSettings(): Promise<CognitiveSettings> {
    // 1. Try local cache first
    if (this.localCache) {
      return this.localCache;
    }

    // 2. Try loading from safeLocalStorage
    const localRaw = safeLocalStorage.getItem('AI_COGNITIVE_SETTINGS');
    if (localRaw) {
      try {
        this.localCache = this.cleanFakeDocs(JSON.parse(localRaw));
      } catch (e) {
        console.error('[aiCognitiveService] Error parsing local settings:', e);
      }
    }

    // 3. Always attempt to sync or fetch from backend for the real/official settings
    try {
      const serverSettings = await api.get<CognitiveSettings>('/api/ai/cognitive-settings');
      if (serverSettings) {
        const cleaned = this.cleanFakeDocs(serverSettings);
        this.localCache = cleaned;
        safeLocalStorage.setItem('AI_COGNITIVE_SETTINGS', JSON.stringify(cleaned));
        return cleaned;
      }
    } catch (error) {
      console.warn('[aiCognitiveService] Failed to load cognitive settings from backend, fallback to local storage:', error);
    }

    // 4. Default fallback if nothing has been set yet
    if (!this.localCache) {
      this.localCache = {
        global_personality: DEFAULT_PERSONALITY,
        temperature: 0.7,
        selected_model: 'gpt-4o-mini',
        knowledge_constraint: 'flexible',
        knowledge_docs: []
      };
    }

    return this.localCache;
  },

  async saveSettings(settings: CognitiveSettings): Promise<boolean> {
    const cleaned = this.cleanFakeDocs(settings);
    this.localCache = cleaned;
    
    // Save to Local Storage for immediate response
    safeLocalStorage.setItem('AI_COGNITIVE_SETTINGS', JSON.stringify(cleaned));
    
    // Sync to backend
    try {
      await api.put('/api/ai/cognitive-settings', cleaned);
      console.log('[aiCognitiveService] Cognitive settings synchronized successfully with VPS.');
      return true;
    } catch (error) {
      console.error('[aiCognitiveService] Error syncing cognitive settings with backend:', error);
      return false;
    }
  },

  /**
   * Fetches real tokenomics statistics from the backend system.
   */
  async getUsageStats(): Promise<ServerUsageData> {
    try {
      const data = await api.get<ServerUsageData>('/api/ai/usage');
      return data;
    } catch (error) {
      console.error('[aiCognitiveService] Failed to load real usage stats:', error);
      return {
        totalCostUSD: 0,
        limitUSD: 20.0,
        killSwitchActive: false,
        byModel: {}
      };
    }
  },

  /**
   * Sends settings or updates for the safety kill switch parameters.
   */
  async updateKillSwitch(params: { active?: boolean; limitUSD?: number; action?: 'clear' }): Promise<ServerUsageData> {
    try {
      const data = await api.post<ServerUsageData>('/api/ai/kill-switch', params);
      return data;
    } catch (error) {
      console.error('[aiCognitiveService] Failed to update kill switch params:', error);
      throw error;
    }
  },

  /**
   * Cleans any legacy fake/dummy manual documents from local states so they never leak or show up to the user in production.
   */
  cleanFakeDocs(settings: CognitiveSettings): CognitiveSettings {
    if (!settings || !settings.knowledge_docs) return settings;
    
    // Remove if document has id like 'doc_1', 'doc_2', 'doc_3' or has titles resembling default mock names
    const filteredDocs = settings.knowledge_docs.filter(doc => {
      const isFakeId = ['doc_1', 'doc_2', 'doc_3'].includes(doc.id);
      const isFakeName = ['Manual_do_Organismo_v3.pdf', 'Livro_Projeciosologia_e_Bioenergias.pdf', 'estatisticas'].some(fake => 
        doc.title.toLowerCase().includes(fake.toLowerCase())
      );
      return !(isFakeId || isFakeName);
    });

    return {
      ...settings,
      knowledge_docs: filteredDocs
    };
  }
};
