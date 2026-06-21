import { safeLocalStorage } from '../utils/storage';

export interface TransactionFingerprint {
  id: string; // Matches transaction ID
  tipo: string; // 'income' | 'expense'
  valor: number;
  timestamp: number;
  embedding_simplificado: string; // Key terms
  hash: string;
}

const STORAGE_KEY = 'transaction_fingerprint_cache';

export const fingerprintService = {
  getCache(): Record<string, TransactionFingerprint> {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[FingerprintService] Erro ao parsear cache de fingerprints', e);
      }
    }
    return {};
  },

  saveCache(cache: Record<string, TransactionFingerprint>) {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  },

  computeHash(tipo: string, valor: number, categoryId: string, note: string): string {
    const rawString = `${tipo}_${valor}_${categoryId}_${note.trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      const char = rawString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return 'fp_' + Math.abs(hash).toString(36);
  },

  getEmbeddingSimplificado(note: string, userInput: string): string {
    const textComb = `${note} ${userInput}`.toLowerCase();
    const words = textComb.replace(/[^a-zA-Z0-9áéíóúâêîôûãõç]/g, ' ').split(/\s+/);
    const stopWords = ['para', 'com', 'uma', 'como', 'dos', 'das', 'pelo', 'pela', 'mais', 'por', 'sem', 'sob', 'sob', 'com', 'de', 'do', 'da', 'em', 'no', 'na'];
    const keyTerms = words.filter(w => w.length > 2 && !stopWords.includes(w));
    return Array.from(new Set(keyTerms)).join(',');
  },

  createFingerprint(id: string, tipo: string, valor: number, categoryId: string, note: string, userInput: string): TransactionFingerprint {
    const hash = this.computeHash(tipo, valor, categoryId, note);
    const embedding = this.getEmbeddingSimplificado(note, userInput);
    const fp: TransactionFingerprint = {
      id,
      tipo,
      valor,
      timestamp: Date.now(),
      embedding_simplificado: embedding,
      hash
    };

    const cache = this.getCache();
    cache[id] = fp;
    this.saveCache(cache);

    return fp;
  },

  checkSimilarity(embedding1: string, embedding2: string): boolean {
    if (!embedding1 || !embedding2) return false;
    const w1 = embedding1.split(',');
    const w2 = embedding2.split(',');
    if (w1.length === 0 || w2.length === 0) return false;

    const intersection = w1.filter(w => w2.includes(w));
    const overlap = intersection.length / Math.min(w1.length, w2.length);
    return overlap >= 0.5; // 50% overlapping keywords
  }
};
