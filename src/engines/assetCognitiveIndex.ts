import { db } from '../services/db';
import { safeLocalStorage } from '../utils/storage';

export interface AssetCognitiveRecord {
  assetId: string;
  name: string;
  type: string;
  category: string;
  location: string;
  risk: string;
  documentStatus: string;
  value: number;
}

const STORAGE_KEY = 'asset_cognitive_index';

class AssetCognitiveIndex {
  private index: Record<string, AssetCognitiveRecord> = {};

  constructor() {
    this.loadIndex();
  }

  private loadIndex() {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.index = JSON.parse(saved);
      } catch (e) {
        console.error('[AssetCognitiveIndex] Erro ao carregar índice', e);
        this.index = {};
      }
    }
  }

  public refreshIndex(): Record<string, AssetCognitiveRecord> {
    const muralData = db.getMuralData();
    const assetsList = muralData.assets || [];
    const vaultList = muralData.vault || [];
    
    const newIndex: Record<string, AssetCognitiveRecord> = {};

    // 1. Process regular assets
    assetsList.forEach(a => {
      let type = 'Bem Móvel';
      let location = 'Garagem Pessoal';
      let risk = 'Depreciação';
      let documentStatus = (a.documents && a.documents.length > 0) ? 'Completo' : 'Regular';

      const cat = (a.category || '').toLowerCase();
      const name = (a.name || '').toLowerCase();

      if (cat.includes('veículo') || cat.includes('carro')) {
        type = 'Bem Móvel';
        location = 'Garagem Pessoal';
        risk = 'Baixo (Físico)';
      } else if (cat.includes('imóvel') || cat.includes('casa') || cat.includes('apartamento') || cat.includes('terreno')) {
        type = 'Ativo Imobiliário';
        location = name.includes('jardins') ? 'São Paulo - Jardins' : 'Território Nacional';
        risk = 'Consolidado (Muito Baixo)';
      } else {
        type = 'Ativo Físico';
        location = 'Custódia Local';
        risk = 'Mínimo';
      }

      newIndex[a.id] = {
        assetId: a.id,
        name: a.name || 'Ativo sem nome',
        type,
        category: a.category || 'Geral',
        location,
        risk,
        documentStatus,
        value: Number(a.value || 0)
      };
    });

    // 2. Process vault items as confidential cognitive assets
    vaultList.forEach(v => {
      newIndex[v.id || Math.random().toString(36).substr(2, 9)] = {
        assetId: v.id || 'vault-item',
        name: v.title || v.name || 'Item do Cofre',
        type: 'Ativo Protegido (Cofre)',
        category: 'Confidencial',
        location: 'Storage Criptografado',
        risk: 'Segurança Máxima',
        documentStatus: 'Protegido',
        value: Number(v.value || 0)
      };
    });

    this.index = newIndex;
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.index));
    return this.index;
  }

  public getIndex(): Record<string, AssetCognitiveRecord> {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.index = JSON.parse(saved);
        return this.index;
      } catch (e) {
        // Fallback to recalculating
      }
    }
    return this.refreshIndex();
  }

  public clear() {
    this.index = {};
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}

export const assetCognitiveIndex = new AssetCognitiveIndex();
