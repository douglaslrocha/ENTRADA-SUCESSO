import { documentService } from '../services/documentService';
import { safeLocalStorage } from '../utils/storage';
import { PerfProfiler } from '../utils/perfProfiler';

export interface ManagerSemanticRecord {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  category: string;
  entities: string[];
  emotionalState: string[];
  recurringTopics: string[];
  importance: number;
  updatedAt: string;
}

const MEMORY_KEY = 'manager_semantic_memory';

class ManagerSemanticEngine {
  private memories: Record<string, ManagerSemanticRecord> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const saved = safeLocalStorage.getItem(MEMORY_KEY);
      if (saved) {
        this.memories = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[ManagerSemanticEngine] Error loading semantic memory', e);
    }
  }

  private save() {
    try {
      safeLocalStorage.setItem(MEMORY_KEY, JSON.stringify(this.memories));
    } catch (e) {
      console.error('[ManagerSemanticEngine] Error saving semantic memory', e);
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ');
  }

  /**
   * Scans a specific document and generates its rich semantic metadata
   */
  public analyzeDocument(id: string, title: string, content: string): ManagerSemanticRecord {
    return PerfProfiler.measure('managerSemanticEngine.analyzeDocument', () => {
      return this.analyzeDocumentInternal(id, title, content);
    });
  }

  private analyzeDocumentInternal(id: string, title: string, content: string): ManagerSemanticRecord {
    const plainText = this.stripHtml(content || '');
    const cleanText = plainText.trim().toLowerCase();

    // 1. Natural heuristic extraction of emotional traits
    const emotionalState: string[] = [];
    if (/metas|foco|crescimento|sucesso|consegui|ganhei|cliente|venda|progresso/i.test(cleanText)) {
      emotionalState.push('Motivado');
      emotionalState.push('Focado');
    }
    if (/ansioso|medo|preocupado|difícil|crise|problema|ajuda|perda/i.test(cleanText)) {
      emotionalState.push('Preocupado');
    }
    if (/paz|calma|tranquilo|meditação|organizado|equilíbrio|estável/i.test(cleanText)) {
      emotionalState.push('Sereno');
    }
    if (emotionalState.length === 0) {
      emotionalState.push('Estável');
    }

    // 2. Discover key topics
    const recurringTopics: string[] = [];
    if (/investir|financeiro|orçamento|dinheiro|lucro|faturamento|caixa|saldo/i.test(cleanText)) {
      recurringTopics.push('Finanças');
    }
    if (/estratégia|negócios|marketing|empresa|startup|vendas|parceria/i.test(cleanText)) {
      recurringTopics.push('Empreendedorismo');
    }
    if (/saúde|meditação|exercício|sono|rotina|diário|pessoal/i.test(cleanText)) {
      recurringTopics.push('Autocuidado');
    }
    if (/estudo|livro|aprendizado|curso|faculdade|pesquisa/i.test(cleanText)) {
      recurringTopics.push('Desenvolvimento Intelectual');
    }

    // 3. Extract Tags (Heuristic keywords)
    const tagsSet = new Set<string>();
    const words = cleanText.split(/[^a-zA-Záéíóúâêôãõç0-9]+/);
    const stopWords = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'em', 'no', 'na', 'para', 'com', 'que', 'se', 'por', 'como', 'meu', 'minha']);
    
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word)) {
        if (/prospect|cliente|contrato|venda/i.test(word)) tagsSet.add('clientes');
        if (/dinheiro|receita|gasto|invest/i.test(word)) tagsSet.add('finanças');
        if (/estratégia|plano|organizar/i.test(word)) tagsSet.add('planejamento');
        if (/ia|tecnologia|software|code/i.test(word)) tagsSet.add('tecnologia');
      }
    });

    if (tagsSet.size === 0) {
      tagsSet.add('geral');
    }

    // Heuristics for categories
    let category = 'Geral';
    if (recurringTopics.includes('Finanças')) category = 'Estratégia Financeira';
    else if (recurringTopics.includes('Empreendedorismo')) category = 'Profissional';
    else if (recurringTopics.includes('Autocuidado')) category = 'Pessoal';

    // Heuristics for entities
    const entities: string[] = [];
    const matchCompany = plainText.match(/([A-Z][a-zA-Z0-9_\-]{2,}(\s+[A-Z][a-zA-Z0-9_\-]{2,})*)/g);
    if (matchCompany) {
      matchCompany.slice(0, 5).forEach(entity => {
        if (!['Para', 'Meu', 'Com', 'Como', 'Geral'].includes(entity)) {
          entities.push(entity);
        }
      });
    }

    // Heuristic importance rating (1-10)
    let importance = 5;
    if (/urgente|crítico|prioridade|importante|meta\s+principal/i.test(cleanText)) {
      importance = 9;
    } else if (/arquivo|notas\s+soltas|draft|rascunho/i.test(cleanText)) {
      importance = 2;
    }

    // Dynamic Summary
    let summary = plainText.slice(0, 160).trim();
    if (plainText.length > 160) {
      summary += '...';
    }

    const record: ManagerSemanticRecord = {
      id,
      title: title || 'Documento Sem Título',
      summary: summary || 'Documento vazio.',
      tags: Array.from(tagsSet),
      category,
      entities: Array.from(new Set(entities)),
      emotionalState,
      recurringTopics,
      importance,
      updatedAt: new Date().toISOString()
    };

    this.memories[id] = record;
    this.save();
    return record;
  }

  /**
   * Scans all documents in the active workspace and syncs memories
   */
  public syncAllDocuments() {
    return PerfProfiler.measure('managerSemanticEngine.syncAllDocuments', () => {
      this.syncAllDocumentsInternal();
    });
  }

  private syncAllDocumentsInternal() {
    console.log('[ManagerSemanticEngine] Synchronizing all workspaces documents semantically...');
    const workspaces = documentService.getWorkspaces();
    const activeIds = new Set<string>();

    workspaces.forEach(ws => {
      if (ws.isHidden) {
        return; // Skip hidden workspaces entirely from the AI's semantic knowledge or learn/reference capability
      }
      ws.folders.forEach(folder => {
        folder.pages.forEach(page => {
          activeIds.add(page.id);
          this.analyzeDocument(page.id, page.title, page.content);
        });
      });
    });

    // Prune stale records of deleted documents
    Object.keys(this.memories).forEach(id => {
      if (!activeIds.has(id)) {
        delete this.memories[id];
      }
    });
    this.save();
  }

  public getMemoryForPage(id: string): ManagerSemanticRecord | undefined {
    return this.memories[id];
  }

  public getAllMemories(): Record<string, ManagerSemanticRecord> {
    return this.memories;
  }

  public clear() {
    this.memories = {};
    safeLocalStorage.removeItem(MEMORY_KEY);
  }

  /**
   * Generates a compact semantic block for prompt context injection, limited to max 10 records
   */
  public getSummary(): string {
    const records = Object.values(this.memories)
      .sort((a, b) => b.importance - a.importance || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    if (records.length === 0) {
      return 'Nenhum documento ou conhecimento ativo no gerenciador de workspaces.';
    }

    return records.map(r => {
      return `[Doc: "${r.title}"]
- Resumo: ${r.summary}
- Categorias/Tópicos: ${r.category} (${r.recurringTopics.join(', ')})
- Tags: ${r.tags.join(', ')}
- Estado Emocional Estimado: ${r.emotionalState.join(', ')}
- Importância: ${r.importance}/10 | Atualizado: ${r.updatedAt.split('T')[0]}`;
    }).join('\n\n');
  }
}

export const managerSemanticEngine = new ManagerSemanticEngine();
