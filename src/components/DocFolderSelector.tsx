import React, { useState } from 'react';
import { FileText, Folder, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocFolderItem {
  id: string;
  title: string;
  type: 'folder' | 'document';
  color: string;
  icon?: string; // Optional icon name or component
}

interface DocFolderSelectorProps {
  onSelect: (item: DocFolderItem) => void;
  onClose: () => void;
}

const MOCK_ITEMS: DocFolderItem[] = [
  { id: '1', title: 'Projeto Alpha', type: 'folder', color: '#3b82f6', icon: 'folder' },
  { id: '2', title: 'Notas de Reunião', type: 'document', color: '#10b981', icon: 'file-text' },
  { id: '3', title: 'Design System', type: 'folder', color: '#8b5cf6', icon: 'folder' },
  { id: '4', title: 'Roadmap 2026', type: 'document', color: '#f59e0b', icon: 'file-text' },
  { id: '5', title: 'Arquivos Legados', type: 'folder', color: '#ef4444', icon: 'folder' },
  { id: '6', title: 'Contrato de Serviço', type: 'document', color: '#6366f1', icon: 'file-text' },
  { id: '7', title: 'Manual do Colaborador', type: 'document', color: '#ec4899', icon: 'file-text' },
  { id: '8', title: 'Ativos de Marketing', type: 'folder', color: '#06b6d4', icon: 'folder' },
  { id: '9', title: 'Relatório Financeiro Q1', type: 'document', color: '#3b82f6', icon: 'file-text' },
  { id: '10', title: 'Brainstorming de Produto', type: 'document', color: '#10b981', icon: 'file-text' },
  { id: '11', title: 'Documentação Técnica', type: 'folder', color: '#8b5cf6', icon: 'folder' },
  { id: '12', title: 'Feedback de Clientes', type: 'document', color: '#f59e0b', icon: 'file-text' },
];

export const DocFolderSelector = ({ onSelect, onClose }: DocFolderSelectorProps) => {
  const [search, setSearch] = useState('');

  const filteredItems = MOCK_ITEMS.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-colors duration-300"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Selecionar Documento ou Pasta</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} size={18} />
            <input 
              autoFocus
              type="text"
              placeholder="Pesquisar documentos ou pastas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none transition-all"
              style={{ 
                backgroundColor: 'var(--surface-hover)', 
                border: '1px solid var(--border)',
                color: 'var(--text)',
                boxShadow: 'var(--shadow)'
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto pr-1 space-y-1 no-scrollbar">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors group hover:bg-[var(--surface-hover)]"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.type === 'folder' ? <Folder size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.title}</div>
                    <div className="text-xs flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.type === 'folder' ? 'Pasta' : 'Documento'}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--muted)' }}>
                Nenhum item encontrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
