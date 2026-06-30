/**
 * Identity Service
 * Abstração de API para o sistema de identidade pessoal.
 * Gerencia respostas e mídias com backend + fallback localStorage/IndexedDB.
 */

import { saveMediaToDB, getMediaFromDB, safeLocalStorage } from '../utils/storage';
import { supabase } from './supabaseClient';

// ============================================
// Tipos
// ============================================

export interface MediaItem {
  id?: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
}

const DEBOUNCE_MS = 1500;

// ============================================
// Estado interno
// ============================================

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;
let _pendingAnswers: Record<string, { block_id: string; input_id: string; answer: string }> = {};

// ============================================
// Helpers
// ============================================

function base64ToBlob(base64: string): Blob {
  const matches = base64.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return new Blob([base64]);
  }
  const contentType = matches[1];
  const sliceSize = 512;
  const byteCharacters = atob(matches[2]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

// ============================================
// Respostas de Identidade
// ============================================

export const identityService = {

  /**
   * Carrega todas as respostas de identidade.
   * Tenta Supabase direto primeiro, fallback para localStorage.
   */
  async loadAnswers(): Promise<Record<string, string>> {
    try {
      const { data, error } = await supabase
        .from('identity_answers')
        .select('*')
        .eq('user_id', 'default')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Remove campos de metadados antes de retornar
        const answers: Record<string, string> = {};
        Object.keys(data).forEach(key => {
          if (key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
            answers[key] = data[key] || '';
          }
        });
        
        safeLocalStorage.setItem('identity_answers', JSON.stringify(answers));
        return answers;
      }
      return {};
    } catch (e) {
      console.warn('[IdentityService] Falha ao carregar respostas do Supabase, usando localStorage:', e);
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

    // Limpa pendentes antes do envio para evitar race conditions
    _pendingAnswers = {};

    // Constrói o payload plano com os pares chave/valor correspondendo às colunas da tabela flat
    const payload: Record<string, any> = {
      user_id: 'default',
      updated_at: new Date().toISOString()
    };
    answers.forEach(item => {
      payload[item.input_id] = item.answer;
    });

    try {
      const { error } = await supabase
        .from('identity_answers')
        .upsert(payload);

      if (error) throw error;
      console.log(`[IdentityService] ${answers.length} respostas de identidade sincronizadas com o Supabase.`);
    } catch (error) {
      console.warn('[IdentityService] Falha ao sincronizar respostas (mantidas em localStorage):', error);
      // Devolve para os pendentes em caso de erro para a próxima tentativa
      answers.forEach(item => {
        _pendingAnswers[item.input_id] = item;
      });
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
   * Tenta Supabase direto primeiro, fallback para IndexedDB.
   */
  async loadMedia(): Promise<Record<string, MediaItem[]>> {
    try {
      const { data, error } = await supabase
        .from('identity_media')
        .select('*')
        .eq('user_id', 'default')
        .order('sort_order', { ascending: true });

      if (error) throw error;

      const media: Record<string, MediaItem[]> = {};
      (data || []).forEach(row => {
        if (!media[row.block_id]) {
          media[row.block_id] = [];
        }
        media[row.block_id].push({
          id: row.id,
          type: row.media_type as any,
          url: row.url,
        });
      });

      await saveMediaToDB('identity_media', media).catch(() => {});
      return media;
    } catch (e) {
      console.warn('[IdentityService] Erro ao carregar mídias do Supabase, usando IndexedDB:', e);
      const dbMedia = await getMediaFromDB('identity_media');
      return dbMedia || {};
    }
  },

  /**
   * Adiciona uma mídia (YouTube ID ou link externo) a um bloco.
   */
  async addMedia(blockId: string, mediaType: 'image' | 'video' | 'youtube', url: string): Promise<MediaItem | null> {
    try {
      const { data: countData } = await supabase
        .from('identity_media')
        .select('sort_order')
        .eq('user_id', 'default')
        .eq('block_id', blockId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const nextOrder = countData && countData.length > 0 ? (countData[0].sort_order || 0) + 1 : 0;

      const { data, error } = await supabase
        .from('identity_media')
        .insert({
          user_id: 'default',
          block_id: blockId,
          media_type: mediaType,
          url: url,
          sort_order: nextOrder
        })
        .select()
        .single();

      if (error) throw error;

      window.dispatchEvent(new CustomEvent('identity-media-updated'));

      return {
        id: data.id,
        type: data.media_type as any,
        url: data.url
      };
    } catch (e) {
      console.warn('[IdentityService] Erro ao adicionar mídia ao Supabase:', e);
      return null;
    }
  },

  /**
   * Faz upload de um arquivo de mídia (imagem/vídeo).
   * Envia para o Supabase Storage e registra na tabela.
   */
  async uploadMedia(blockId: string, mediaType: 'image' | 'video', base64Data: string): Promise<MediaItem | null> {
    try {
      const blob = base64ToBlob(base64Data);
      const fileExt = blob.type.split('/').pop() || 'jpg';
      const fileName = `${blockId}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `identity/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('identity-images')
        .upload(filePath, blob, {
          contentType: blob.type
        });

      let publicUrl = '';
      if (uploadError) {
        console.warn('[IdentityService] Falha no upload para o storage. Usando base64 local como fallback:', uploadError);
        publicUrl = base64Data;
      } else {
        const { data } = supabase.storage.from('identity-images').getPublicUrl(filePath);
        publicUrl = data.publicUrl;
      }

      return await this.addMedia(blockId, mediaType, publicUrl);
    } catch (e) {
      console.error('[IdentityService] Erro ao fazer upload de mídia:', e);
      return null;
    }
  },

  /**
   * Remove uma mídia específica por ID.
   */
  async removeMedia(mediaId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('identity_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      window.dispatchEvent(new CustomEvent('identity-media-updated'));
      return true;
    } catch (e) {
      console.warn('[IdentityService] Erro ao remover mídia:', e);
      return false;
    }
  },

  /**
   * Remove todas as mídias de um bloco.
   */
  async clearBlockMedia(blockId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('identity_media')
        .delete()
        .eq('user_id', 'default')
        .eq('block_id', blockId);

      if (error) throw error;

      window.dispatchEvent(new CustomEvent('identity-media-updated'));
      return true;
    } catch (e) {
      console.warn('[IdentityService] Erro ao limpar mídias do bloco:', e);
      return false;
    }
  },
};
