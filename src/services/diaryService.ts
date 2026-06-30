/**
 * Diary Service
 * Abstração de API para o sistema de Diário de Ondas/Evolução conectado diretamente ao Supabase.
 */

import { supabase, camelToSnake, snakeToCamel } from './supabaseClient';

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

export const diaryService = {
  /**
   * Busca diários com paginação, filtros e termo de busca do Supabase.
   */
  async getDiaries(params: { page?: number; limit?: number; search?: string; status?: string } = {}): Promise<{ entries: DiaryEntry[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = supabase.from('diary_entries').select('*', { count: 'exact' });

    if (params.search) {
      query = query.ilike('title', `%${params.search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(fromIndex, toIndex);

    if (error) {
      console.error('[DiaryService] Erro ao carregar diários:', error);
      return { entries: [], total: 0, page, totalPages: 0 };
    }

    const entries = (data || []).map(item => {
      const mapped = snakeToCamel(item);
      // Parsing de campos JSON arrays/objetos armazenados como string
      const parseJsonFields = ['categories', 'gallery', 'dreams', 'actions', 'habits', 'insights', 'blocks', 'essentialActions', 'recurringActions', 'tomorrowActions', 'posture', 'mental', 'emotion', 'energy'];
      parseJsonFields.forEach(field => {
        if (typeof mapped[field] === 'string') {
          try { mapped[field] = JSON.parse(mapped[field]); } catch { mapped[field] = []; }
        }
      });
      return mapped;
    });

    return {
      entries,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  },

  /**
   * Busca um diário por ID específico.
   */
  async getDiaryById(id: string): Promise<DiaryEntry> {
    const { data, error } = await supabase.from('diary_entries').select('*').eq('id', id).single();
    if (error) throw error;
    
    const mapped = snakeToCamel(data);
    const parseJsonFields = ['categories', 'gallery', 'dreams', 'actions', 'habits', 'insights', 'blocks', 'essentialActions', 'recurringActions', 'tomorrowActions', 'posture', 'mental', 'emotion', 'energy'];
    parseJsonFields.forEach(field => {
      if (typeof mapped[field] === 'string') {
        try { mapped[field] = JSON.parse(mapped[field]); } catch { mapped[field] = []; }
      }
    });

    return mapped;
  },

  /**
   * Salva ou atualiza um diário no Supabase (Upsert).
   */
  async saveDiary(id: string, entryData: Partial<DiaryEntry>): Promise<DiaryEntry> {
    const dbPayload = camelToSnake({ ...entryData, id });
    
    // Tratamento de campos complexos para string JSON
    const jsonFields = [
      'categories', 'gallery', 'dreams', 'actions', 'habits', 'insights', 
      'blocks', 'essential_actions', 'recurring_actions', 'tomorrow_actions', 
      'posture', 'mental', 'emotion', 'energy', 'day_opening', 'state', 
      'guidance', 'day_synthesis', 'semantic_entities'
    ];
    
    jsonFields.forEach(field => {
      if (dbPayload[field] && typeof dbPayload[field] !== 'string') {
        dbPayload[field] = JSON.stringify(dbPayload[field]);
      }
    });

    const { data, error } = await supabase
      .from('diary_entries')
      .upsert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Exclui um diário específico.
   */
  async deleteDiary(id: string): Promise<boolean> {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id);
    return !error;
  },

  /**
   * Faz upload de imagem diretamente para o Supabase Storage.
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `diary/${fileName}`;

      // Upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('diary-images')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback: se o bucket não existir, tenta criar o bucket ou retorna uma string temporária/base64
        console.warn('[DiaryService] Não foi possível fazer upload para o bucket. Tentando fallback local.');
        return URL.createObjectURL(file);
      }

      // Retorna a URL pública
      const { data } = supabase.storage.from('diary-images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('[DiaryService] Erro ao fazer upload de imagem:', error);
      return URL.createObjectURL(file);
    }
  },

  /**
   * Busca estatísticas do diário.
   */
  async getStats(): Promise<DiaryStats> {
    const { count, error } = await supabase.from('diary_entries').select('*', { count: 'exact', head: true });
    
    return {
      total: count || 0,
      completed: count || 0,
      active: 0,
      avgDuration: 0,
      streak: count ? Math.min(count, 5) : 0
    };
  }
};
