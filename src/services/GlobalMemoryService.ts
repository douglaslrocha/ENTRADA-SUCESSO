import { supabase } from './supabaseClient';
import { safeLocalStorage } from '../utils/storage';

export interface MemoryEntry {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  attachments?: {
    name: string;
    type: string;
    size: number;
    url?: string; // For images/previews
  }[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: MemoryEntry[];
  lastUpdate: string;
}

const CONVERSATIONS_KEY = 'amparadora_conversations';
const ACTIVE_CONV_KEY = 'amparadora_active_conversation_id';

export const GlobalMemoryService = {
  // Array local em memória (para carregar síncrono e responder instantâneo)
  _conversations: [] as Conversation[],

  /**
   * Sincroniza o histórico com o Supabase e atualiza o cache local
   */
  async syncWithBackend(): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('amparadora_chats')
        .select('*')
        .eq('user_id', 'default')
        .order('last_update', { ascending: false });

      if (error) throw error;

      const remoteConvs: Conversation[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        messages: Array.isArray(row.messages) ? row.messages : JSON.parse(row.messages || '[]'),
        lastUpdate: row.last_update
      }));

      this._conversations = remoteConvs;
      safeLocalStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(remoteConvs));
      return remoteConvs;
    } catch (e) {
      console.warn('[GlobalMemoryService] Falha ao sincronizar com Supabase:', e);
      return this.getConversations();
    }
  },

  getConversations(): Conversation[] {
    if (this._conversations.length > 0) return this._conversations;
    const stored = safeLocalStorage.getItem(CONVERSATIONS_KEY);
    if (stored) {
      this._conversations = JSON.parse(stored);
      return this._conversations;
    }
    return [];
  },

  async saveConversations(conversations: Conversation[]) {
    this._conversations = conversations;
    safeLocalStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  },

  getActiveConversationId(): string | null {
    return safeLocalStorage.getItem(ACTIVE_CONV_KEY);
  },

  setActiveConversationId(id: string | null) {
    if (id) {
      safeLocalStorage.setItem(ACTIVE_CONV_KEY, id);
    } else {
      safeLocalStorage.removeItem(ACTIVE_CONV_KEY);
    }
  },

  createConversation(title: string = 'Nova Conversa'): Conversation {
    const conversations = this.getConversations();
    const newConv: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      messages: [],
      lastUpdate: new Date().toISOString()
    };
    const updated = [newConv, ...conversations];
    this.saveConversations(updated);
    this.setActiveConversationId(newConv.id);

    // Persiste no Supabase em background
    supabase.from('amparadora_chats').upsert({
      id: newConv.id,
      user_id: 'default',
      title: newConv.title,
      messages: newConv.messages,
      last_update: newConv.lastUpdate
    }).then(({ error }) => {
      if (error) console.error('[GlobalMemoryService] Erro ao criar conversa no Supabase:', error);
    });

    return newConv;
  },

  getConversation(id: string): Conversation | undefined {
    return this.getConversations().find(c => c.id === id);
  },

  updateConversation(id: string, updates: Partial<Conversation>) {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      const updatedConv = { 
        ...conversations[index], 
        ...updates, 
        lastUpdate: new Date().toISOString() 
      };
      conversations[index] = updatedConv;
      this.saveConversations(conversations);

      // Persiste no Supabase em background
      supabase.from('amparadora_chats').upsert({
        id: updatedConv.id,
        user_id: 'default',
        title: updatedConv.title,
        messages: updatedConv.messages,
        last_update: updatedConv.lastUpdate
      }).then(({ error }) => {
        if (error) console.error('[GlobalMemoryService] Erro ao atualizar conversa no Supabase:', error);
      });
    }
  },

  deleteConversation(id: string) {
    const conversations = this.getConversations().filter(c => c.id !== id);
    this.saveConversations(conversations);
    if (this.getActiveConversationId() === id) {
      this.setActiveConversationId(conversations[0]?.id || null);
    }

    // Deleta no Supabase em background
    supabase.from('amparadora_chats')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('[GlobalMemoryService] Erro ao deletar conversa no Supabase:', error);
      });
  },

  addEntry(conversationId: string, entry: Omit<MemoryEntry, 'id' | 'timestamp'>) {
    const conv = this.getConversation(conversationId);
    if (!conv) return null;

    const newEntry: MemoryEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...conv.messages, newEntry].slice(-60); // Keep last 60
    
    // Auto-rename title if it's default and it's the first message
    let newTitle = conv.title;
    if (conv.title === 'Nova Conversa' && entry.role === 'user') {
      newTitle = entry.content.substring(0, 30) + (entry.content.length > 30 ? '...' : '');
    }

    this.updateConversation(conversationId, { 
      messages: updatedMessages,
      title: newTitle
    });

    return newEntry;
  },

  clearAll() {
    this._conversations = [];
    safeLocalStorage.removeItem(CONVERSATIONS_KEY);
    safeLocalStorage.removeItem(ACTIVE_CONV_KEY);

    // Limpa todas as conversas do usuário no Supabase em background
    supabase.from('amparadora_chats')
      .delete()
      .eq('user_id', 'default')
      .then(({ error }) => {
        if (error) console.error('[GlobalMemoryService] Erro ao limpar conversas no Supabase:', error);
      });
  }
};
