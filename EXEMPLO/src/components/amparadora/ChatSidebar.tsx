import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MessageSquare, Trash2, X, Search, Clock } from 'lucide-react';
import { Conversation } from '../../services/GlobalMemoryService';
import { haptics } from '../../services/HapticService';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  theme: 'light' | 'dark';
}

export default function ChatSidebar({ 
  isOpen, 
  onClose, 
  conversations, 
  activeId, 
  onSelect, 
  onDelete,
  onNewChat,
  theme
}: ChatSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : 320,
          width: isOpen ? 320 : 0
        }}
        className="fixed lg:absolute inset-y-0 right-0 bg-[var(--surface)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between gap-3 border-b border-[var(--border)] mb-2">
          <div className="flex items-center gap-2">
            <Clock size={16} className={theme === 'dark' ? 'text-white' : 'text-violet-500'} />
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">Memória Síncrona</h2>
          </div>
          <button 
            onClick={() => {
              onClose();
              haptics.lightClick();
            }}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-[var(--muted)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              haptics.success();
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 mb-4 ${
              theme === 'dark' 
                ? 'bg-white text-black hover:bg-zinc-200' 
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            <Plus size={18} />
            Nova Conversa
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
            <input 
              type="text" 
              placeholder="Pesquise..." 
              className={`w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none placeholder:text-[var(--muted)] focus:ring-1 ${
                theme === 'dark' ? 'focus:ring-white/20' : 'focus:ring-violet-500/30'
              }`}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="py-20 text-center px-6">
              <MessageSquare className="mx-auto text-[var(--muted)] mb-3 opacity-20" size={32} />
              <p className="text-[var(--muted)] text-xs font-medium uppercase tracking-widest leading-relaxed">
                Nenhuma conversa encontrada
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv.id}
                className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  activeId === conv.id 
                    ? theme === 'dark'
                      ? 'bg-white/[0.12] text-white border-white/30 shadow-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/5' 
                      : 'bg-violet-500/10 text-violet-600 border-violet-500/20'
                    : `border-transparent text-[var(--text)] ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-violet-500/5'}`
                }`}
                onClick={() => {
                  onSelect(conv.id);
                  haptics.lightClick();
                }}
              >
                <div className={`p-2 rounded-lg ${
                  activeId === conv.id 
                    ? theme === 'dark' ? 'bg-white/10' : 'bg-violet-500/20' 
                    : theme === 'dark' ? 'bg-white/5' : 'bg-slate-500/10'
                }`}>
                  <MessageSquare size={16} className={
                    activeId === conv.id 
                      ? theme === 'dark' ? 'text-white' : 'text-violet-600' 
                      : theme === 'dark' ? 'text-white/40' : 'text-slate-500'
                  } />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-bold truncate leading-none mb-1.5 ${
                    activeId === conv.id 
                      ? theme === 'dark' ? 'text-white' : 'text-violet-600' 
                      : 'text-[var(--text)]'
                  }`}>{conv.title}</h4>
                  <p className={`text-[10px] truncate opacity-60 ${
                    activeId === conv.id 
                      ? theme === 'dark' ? 'text-white/60' : 'text-violet-500' 
                      : 'text-[var(--muted)]'
                  }`}>
                    {new Date(conv.lastUpdate).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                    haptics.error();
                  }}
                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)]/30">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-500/10 dark:bg-white/10 border border-[var(--border)]" />
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text)]">Usuário</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${
                theme === 'dark' ? 'text-slate-400' : 'text-violet-600'
              }`}>Organismo Ativo</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
