import { safeLocalStorage } from '../utils/storage';

export type ChatSession = {
  id: string;
  title: string;
  content: string;
  isDocument: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'amparadora_chats';

export const amparadoraService = {
  getSessions(): ChatSession[] {
    const stored = safeLocalStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return [];
  },

  saveSessions(sessions: ChatSession[]) {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  createSession(title: string = 'Novo Chat'): ChatSession {
    const sessions = this.getSessions();
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content: '', // Empty canvas content
      isDocument: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveSessions([newSession, ...sessions]);
    return newSession;
  },

  updateSession(id: string, updates: Partial<ChatSession>) {
    const sessions = this.getSessions();
    const updated = sessions.map(s => 
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    this.saveSessions(updated);
  },

  deleteSession(id: string) {
    const sessions = this.getSessions();
    this.saveSessions(sessions.filter(s => s.id !== id));
  }
};
