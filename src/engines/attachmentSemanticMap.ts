import { safeLocalStorage } from '../utils/storage';

export interface AttachmentRecord {
  id: string;
  type: 'PDF' | 'IMAGE' | 'LINK' | 'AUDIO' | 'OTHER';
  title: string;
  sourceDocumentId: string | null;
  hasContent: boolean;
  indexed: boolean;
  rawUrl?: string;
  semanticSummary?: string;
  detectedKeywords: string[];
}

const STORAGE_KEY = 'attachment_semantic_map';

class AttachmentSemanticMap {
  private map: Record<string, AttachmentRecord> = {};

  constructor() {
    this.load();
  }

  private load() {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.map = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[AttachmentSemanticMap] Error loading attachment semantic map', e);
    }
  }

  private save() {
    try {
      safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.map));
    } catch (e) {
      console.error('[AttachmentSemanticMap] Error saving attachment semantic map', e);
    }
  }

  public registerAttachment(
    id: string,
    type: 'PDF' | 'IMAGE' | 'LINK' | 'AUDIO' | 'OTHER',
    title: string,
    sourceDocumentId: string | null,
    rawUrl?: string
  ): AttachmentRecord {
    const keywords: string[] = [];
    let summaryHeuristic = '';

    // Extract basic properties heuristic from name
    const titleLower = title.toLowerCase();
    if (titleLower.includes('nota') || titleLower.includes('fiscal') || titleLower.includes('pdf')) {
      keywords.push('financeiro', 'comprovante', 'nota fiscal');
      summaryHeuristic = 'Comprovante fiscal ou nota de transação registrada.';
    } else if (titleLower.includes('contrato') || titleLower.includes('acordo')) {
      keywords.push('jurídico', 'parceria', 'negócio');
      summaryHeuristic = 'Termo de cooperação ou contrato comercial formalizado.';
    } else {
      keywords.push('recurso', 'anexo');
      summaryHeuristic = 'Anexo de arquivo associado para apoio estrutural.';
    }

    const record: AttachmentRecord = {
      id,
      type,
      title,
      sourceDocumentId,
      hasContent: type === 'PDF' || type === 'LINK',
      indexed: true,
      rawUrl,
      semanticSummary: summaryHeuristic,
      detectedKeywords: keywords
    };

    this.map[id] = record;
    this.save();
    return record;
  }

  public getAttachment(id: string): AttachmentRecord | undefined {
    return this.map[id];
  }

  public getAllAttachments(): Record<string, AttachmentRecord> {
    return this.map;
  }

  public clear() {
    this.map = {};
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}

export const attachmentSemanticMap = new AttachmentSemanticMap();
