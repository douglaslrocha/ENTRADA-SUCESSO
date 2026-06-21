/**
 * Diary Service
 * Abstração de API para o sistema de Diário de Ondas/Evolução.
 * Gerencia a comunicação com o backend e provê cache/fallback local no localStorage.
 */

import { safeLocalStorage } from '../utils/storage';

// ============================================
// Tipos
// ============================================

export interface DiaryEntry {
  id: string;
  userId?: string;
  location?: string;
  status?: string;
  startAt?: number;
  createdAt?: number;
  updatedAt?: number;
  title?: string;
  temp?: string;
  waves?: string;
  rating?: string;
  mainImage?: string;
  eventTitle?: string;
  eventDate?: string;
  eventImage?: string;
  circleImage?: string;
  description?: string;
  categories?: string[];
  gallery?: string[];
  time?: string;
  day?: string;
  month?: string;
  monthName?: string;
  year?: string;
  weekday?: string;
  endAt?: number;
  duration?: number;
  
  // Estruturas Semânticas / Cognitivas
  dayOpening?: any;
  dreams?: any[];
  actions?: any[];
  habits?: any[];
  insights?: any[];
  state?: any;
  guidance?: any;
  daySynthesis?: any;
  semanticEntities?: any;
  blocks?: any[];
  
  // Conteúdos Textuais e Editores
  essentialActions?: any[];
  recurringActions?: any[];
  tomorrowActions?: any[];
  content?: string;
  insightsContent?: string;
  guidanceContent?: string;
  consolidationContent?: string;
  freeContent?: string;
  posture?: string[];
  mental?: string[];
  emotion?: string[];
  energy?: string[];
}

export interface DiaryStats {
  total: number;
  completed: number;
  active: number;
  avgDuration: number;
  streak: number;
}

// ============================================
// Config
// ============================================

import { api } from './api';

// ============================================
// Config
// ============================================

const API_BASE = '/api/diary';

// ============================================
// Serviço de Diário
// ============================================

export const diaryService = {
  /**
   * Busca diários com paginação, filtros e termo de busca.
   */
  async getDiaries(params: { page?: number; limit?: number; search?: string; status?: string } = {}): Promise<{ entries: DiaryEntry[]; total: number; page: number; totalPages: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const data = await api.get(`${API_BASE}${queryString}`);
    
    // Atualiza cache local
    if (data.entries && params.page === 1 && !params.search && !params.status) {
      safeLocalStorage.setItem('diary_entries', JSON.stringify(data.entries));
    }
    
    return data;
  },

  /**
   * Busca um diário por ID específico.
   */
  async getDiaryById(id: string): Promise<DiaryEntry> {
    const data = await api.get(`${API_BASE}/${id}`);
    return data.entry;
  },

  /**
   * Salva ou atualiza um diário no backend (Upsert).
   */
  async saveDiary(id: string, entryData: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const data = await api.put(`${API_BASE}/${id}`, entryData);
    return data.entry;
  },

  /**
   * Exclui um diário específico.
   */
  async deleteDiary(id: string): Promise<boolean> {
    const data = await api.delete(`${API_BASE}/${id}`);
    return !!data.success;
  },

  /**
   * Faz upload de arquivo de imagem de diário (multipart).
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'X-User-Id': 'default',
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error('[DiaryService] Erro ao fazer upload de imagem:', error);
      throw error;
    }
  },

  /**
   * Busca estatísticas do diário (streak, médias, etc).
   */
  async getStats(): Promise<DiaryStats> {
    return await api.get(`${API_BASE}/stats`);
  }
};
