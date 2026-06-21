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
  getConversations(): Conversation[] {
    const stored = safeLocalStorage.getItem(CONVERSATIONS_KEY);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveConversations(conversations: Conversation[]) {
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
    return newConv;
  },

  getConversation(id: string): Conversation | undefined {
    return this.getConversations().find(c => c.id === id);
  },

  updateConversation(id: string, updates: Partial<Conversation>) {
    const conversations = this.getConversations();
    const index = conversations.findIndex(c => c.id === id);
    if (index !== -1) {
      conversations[index] = { ...conversations[index], ...updates, lastUpdate: new Date().toISOString() };
      this.saveConversations(conversations);
    }
  },

  deleteConversation(id: string) {
    const conversations = this.getConversations().filter(c => c.id !== id);
    this.saveConversations(conversations);
    if (this.getActiveConversationId() === id) {
      this.setActiveConversationId(conversations[0]?.id || null);
    }
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
    safeLocalStorage.removeItem(CONVERSATIONS_KEY);
    safeLocalStorage.removeItem(ACTIVE_CONV_KEY);
  }
};
