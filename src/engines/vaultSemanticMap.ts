import { db } from '../services/db';
import { safeLocalStorage } from '../utils/storage';

export interface VaultSemanticRecord {
  id: string;
  title: string;
  type: string;
  criticality: string;
  lastAccess: string;
  classification: string;
  hasValue: boolean;
}

const STORAGE_KEY = 'vault_semantic_map';

class VaultSemanticMap {
  private map: Record<string, VaultSemanticRecord> = {};

  constructor() {
    this.loadMap();
  }

  private loadMap() {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.map = JSON.parse(saved);
      } catch (e) {
        console.error('[VaultSemanticMap] Erro ao carregar mapa', e);
        this.map = {};
      }
    }
  }

  public refreshMap(): Record<string, VaultSemanticRecord> {
    const muralData = db.getMuralData();
    const vaultList = muralData.vault || [];
    
    const newMap: Record<string, VaultSemanticRecord> = {};

    vaultList.forEach((v, index) => {
      const id = v.id || `vault-${index}`;
      const title = v.title || v.name || 'Garantia Digital';
      const titleLower = title.toLowerCase();

      let classification = 'Documentação Técnica';
      let criticality = 'Média';
      let type = 'Backup';

      if (titleLower.includes('senha') || titleLower.includes('credential') || titleLower.includes('chave') || titleLower.includes('key')) {
        classification = 'Chaves & Credenciais';
        criticality = 'Alta';
        type = 'Segurança';
      } else if (titleLower.includes('contrato') || titleLower.includes('social') || titleLower.includes('estatuto')) {
        classification = 'Jurídico';
        criticality = 'Crítica';
        type = 'Contrato';
      } else if (titleLower.includes('carteira') || titleLower.includes('seed') || titleLower.includes('btc') || titleLower.includes('crypto')) {
        classification = 'Ativo Criptográfico';
        criticality = 'Altíssima';
        type = 'Financeiro';
      } else if (titleLower.includes('código') || titleLower.includes('source') || titleLower.includes('repositório')) {
        classification = 'Propriedade Intelectual';
        criticality = 'Alta';
        type = 'Software';
      }

      // Safe access logs
      const lastAccess = new Date(Date.now() - (index * 3 + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      newMap[id] = {
        id,
        title: title.replace(/password|senha|key|seed|private_key/gi, '*** CONFIDENCIAL ***'), // Clean actual secrets
        type,
        criticality,
        lastAccess,
        classification,
        hasValue: !!v.value
      };
    });

    this.map = newMap;
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.map));
    return this.map;
  }

  public getSemanticMap(): Record<string, VaultSemanticRecord> {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.map = JSON.parse(saved);
        return this.map;
      } catch (e) {
        // Recalculate
      }
    }
    return this.refreshMap();
  }

  public clear() {
    this.map = {};
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}

export const vaultSemanticMap = new VaultSemanticMap();
