/**
 * Identity Service
 * Abstração de API para o sistema de identidade pessoal.
 * Gerencia respostas e mídias com backend + fallback localStorage/IndexedDB.
 */

import { saveMediaToDB, getMediaFromDB, safeLocalStorage } from '../utils/storage';

// ============================================
// Tipos
// ============================================

export interface MediaItem {
  id?: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
}

// ============================================
// Config
// ============================================

const API_BASE = '/api/identity';
const DEBOUNCE_MS = 1500;

// ============================================
// Estado interno
// ============================================

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;
let _pendingAnswers: Record<string, { block_id: string; input_id: string; answer: string }> = {};

// ============================================
// Helpers
// ============================================

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'default', // Será substituído quando auth real for implementado
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('[IdentityService] Erro na API, usando fallback local:', error);
    throw error;
  }
}

// ============================================
// Respostas de Identidade
// ============================================

export const identityService = {

  /**
   * Carrega todas as respostas de identidade.
   * Tenta backend primeiro, fallback para localStorage.
   */
  async loadAnswers(): Promise<Record<string, string>> {
    try {
      const data = await apiFetch('/answers');
      
      // Sincroniza com localStorage como cache/fallback offline
      if (data.answers && Object.keys(data.answers).length > 0) {
        safeLocalStorage.setItem('identity_answers', JSON.stringify(data.answers));
      }
      
      return data.answers || {};
    } catch {
      // Fallback: localStorage
      const saved = safeLocalStorage.getItem('identity_answers');
      return saved ? JSON.parse(saved) : {};
    }
  },

  /**
   * Salva uma resposta individual com debounce.
   * Acumula alterações e envia em lote após o debounce.
   */
  saveAnswer(blockId: string, inputId: string, answer: string) {
    // Salva imediatamente no localStorage (responsividade instantânea)
    const currentLocal = safeLocalStorage.getItem('identity_answers');
    const localAnswers = currentLocal ? JSON.parse(currentLocal) : {};
    localAnswers[inputId] = answer;
    safeLocalStorage.setItem('identity_answers', JSON.stringify(localAnswers));

    // Acumula para envio em lote ao backend
    _pendingAnswers[inputId] = { block_id: blockId, input_id: inputId, answer };

    // Debounce: envia ao backend após DEBOUNCE_MS sem novas alterações
    if (_saveTimeout) clearTimeout(_saveTimeout);
    _saveTimeout = setTimeout(() => {
      this._flushAnswers();
    }, DEBOUNCE_MS);
  },

  /**
   * Envia todas as respostas pendentes ao backend.
   */
  async _flushAnswers() {
    const answers = Object.values(_pendingAnswers);
    if (answers.length === 0) return;

    // Limpa pendentes antes do envio (para não duplicar)
    _pendingAnswers = {};

    try {
      await apiFetch('/answers', {
        method: 'PUT',
        body: JSON.stringify({ answers }),
      });
      console.log(`[IdentityService] ${answers.length} respostas sincronizadas com backend.`);
    } catch (error) {
      console.warn('[IdentityService] Falha ao sincronizar respostas (mantidas em localStorage):', error);
      // Não perde dados — já estão no localStorage
    }
  },

  /**
   * Força o envio imediato de todas as respostas pendentes.
   */
  async flushNow() {
    if (_saveTimeout) clearTimeout(_saveTimeout);
    await this._flushAnswers();
  },

  // ============================================
  // Mídias de Identidade
  // ============================================

  /**
   * Carrega todas as mídias agrupadas por bloco.
   * Tenta backend primeiro, fallback para IndexedDB.
   */
  async loadMedia(): Promise<Record<string, MediaItem[]>> {
    try {
      const data = await apiFetch('/media');
      
      // Sincroniza com IndexedDB como cache/fallback
      if (data.media) {
        await saveMediaToDB('identity_media', data.media).catch(() => {});
      }
      
      return data.media || {};
    } catch {
      // Fallback: IndexedDB
      const dbMedia = await getMediaFromDB('identity_media');
      return dbMedia || {};
    }
  },

  /**
   * Adiciona uma mídia (YouTube ID ou link externo) a um bloco.
   */
  async addMedia(blockId: string, mediaType: 'image' | 'video' | 'youtube', url: string): Promise<MediaItem | null> {
    try {
      const data = await apiFetch('/media', {
        method: 'POST',
        body: JSON.stringify({ block_id: blockId, media_type: mediaType, url }),
      });

      // Dispara evento para sync entre páginas
      window.dispatchEvent(new CustomEvent('identity-media-updated'));

      return data.media;
    } catch {
      // Fallback: salva só no IndexedDB
      return null;
    }
  },

  /**
   * Faz upload de um arquivo de mídia (imagem/vídeo).
   * Envia base64 ao backend que salva como arquivo.
   */
  async uploadMedia(blockId: string, mediaType: 'image' | 'video', base64Data: string): Promise<MediaItem | null> {
    try {
      const data = await apiFetch('/media/upload', {
        method: 'POST',
        body: JSON.stringify({
          block_id: blockId,
          media_type: mediaType,
          data: base64Data,
        }),
      });

      // Dispara evento para sync entre páginas
      window.dispatchEvent(new CustomEvent('identity-media-updated'));

      return data.media;
    } catch {
      // Fallback: retorna null (mídia ficará apenas local)
      return null;
    }
  },

  /**
   * Remove uma mídia específica por ID.
   */
  async removeMedia(mediaId: string): Promise<boolean> {
    try {
      await apiFetch(`/media/${mediaId}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('identity-media-updated'));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Remove todas as mídias de um bloco.
   */
  async clearBlockMedia(blockId: string): Promise<boolean> {
    try {
      await apiFetch(`/media/block/${blockId}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('identity-media-updated'));
      return true;
    } catch {
      return false;
    }
  },
};
