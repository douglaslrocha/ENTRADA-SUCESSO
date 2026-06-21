import { Transaction } from '../types';
import { safeLocalStorage } from '../utils/storage';

export interface FinancialSemanticRecord {
  transactionId: string;
  emotion: string;
  behavior: string;
  context: string;
  intensity: number;
  tags: string[];
}

const STORAGE_KEY = 'financial_semantic_memory';

class FinancialSemanticEngine {
  private memory: Record<string, FinancialSemanticRecord> = {};

  constructor() {
    this.loadMemory();
  }

  private loadMemory() {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.memory = JSON.parse(saved);
      } catch (e) {
        console.error('[FinancialSemanticEngine] Erro ao carregar memória', e);
        this.memory = {};
      }
    }
  }

  private saveMemory() {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
  }

  public analyzeTransaction(t: Transaction): FinancialSemanticRecord {
    const note = (t.note || '').toLowerCase();
    const value = t.value;
    
    let emotion = 'estabilidade';
    let behavior = 'alocação';
    let context = 'rotina';
    let intensity = 0.4;
    const tags: string[] = [];

    if (value > 0) {
      emotion = 'realização';
      behavior = 'receita';
      context = 'fluxo-positivo';
      intensity = 0.6;
      tags.push('entrada');
    }

    // Keyword matching
    if (note.includes('ansioso') || note.includes('ansiedade') || note.includes('nervoso') || note.includes('estresse') || note.includes('pressão') || note.includes('stress')) {
      emotion = 'ansiedade';
      behavior = 'compensação';
      context = 'estresse';
      intensity = 0.78;
      tags.push('emocional', 'gatilho-estresse');
    } else if (note.includes('cansado') || note.includes('cansaço') || note.includes('sono') || note.includes('exaustão') || note.includes('exausto')) {
      emotion = 'exaustão';
      behavior = 'recompensa-imediata';
      context = 'sobrecarga';
      intensity = 0.72;
      tags.push('autocuidado', 'escapismo');
    } else if (note.includes('investimento') || note.includes('app') || note.includes('servidor') || note.includes('cloud') || note.includes('tecnologia') || note.includes('esbuild') || note.includes('vite') || note.includes('desenvolvimento')) {
      emotion = 'foco';
      behavior = 'investimento';
      context = 'expansão-ativos';
      intensity = 0.88;
      tags.push('crescimento', 'ativo-digital');
    } else if (note.includes('luxo') || note.includes('velar') || note.includes('apartamento') || note.includes('jardins') || note.includes('carro') || note.includes('patrimônio') || note.includes('patrimonio')) {
      emotion = 'abundância';
      behavior = 'estabilização-patrimonial';
      context = 'conquista';
      intensity = 0.92;
      tags.push('patrimônio', 'longo-prazo');
    } else if (note.includes('comemoração') || note.includes('festa') || note.includes('sucesso') || note.includes('celebração')) {
      emotion = 'satisfação';
      behavior = 'celebração';
      context = 'reconhecimento';
      intensity = 0.8;
      tags.push('social', 'recompensa');
    } else if (note.includes('básico') || note.includes('mercado') || note.includes('aluguel') || note.includes('contas') || note.includes('luz') || note.includes('água') || note.includes('agua')) {
      emotion = 'segurança';
      behavior = 'manutenção';
      context = 'essencial-diário';
      intensity = 0.5;
      tags.push('custo-fixo', 'subsistência');
    }

    if (Math.abs(value) > 50000) {
      intensity = Math.min(1.0, intensity + 0.15);
      tags.push('alto-impacto');
    }

    const record: FinancialSemanticRecord = {
      transactionId: t.id,
      emotion,
      behavior,
      context,
      intensity,
      tags: Array.from(new Set(tags))
    };

    this.memory[t.id] = record;
    this.saveMemory();
    return record;
  }

  public getMemoryForTransaction(transactionId: string): FinancialSemanticRecord | undefined {
    return this.memory[transactionId];
  }

  public getAllMemories(): Record<string, FinancialSemanticRecord> {
    return this.memory;
  }

  public clear() {
    this.memory = {};
    this.saveMemory();
  }

  public syncAllTransactions(transactions: Transaction[]) {
    transactions.forEach(t => {
      this.analyzeTransaction(t);
    });
  }
}

export const financialSemanticEngine = new FinancialSemanticEngine();
