import React, { useState } from 'react';
import { Category, CategoryType } from '../types';
import { db } from '../services/db';
import { ArrowLeft, Trash2, Plus, GripVertical, ChevronDown } from 'lucide-react';
interface CategoryManagerProps {
  categories: Category[];
  onBack: () => void;
  onUpdate: () => void;
  isEmbedded?: boolean;
}
export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onBack, onUpdate, isEmbedded }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<CategoryType>(CategoryType.ESSENTIAL);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    db.addCategory({ name: newCatName, type: newCatType });
    setNewCatName('');
    onUpdate();
  };
  const handleDelete = (id: string) => {
    db.deleteCategory(id);
    setDeletingId(null);
    onUpdate();
  };
  const getBadgeStyle = (type: CategoryType) => {
    switch(type) {
      case CategoryType.ESSENTIAL: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case CategoryType.CUTTABLE: return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case CategoryType.INCOME: return 'bg-green-500/10 text-green-500 border-green-500/20';
    }
  };

  if (isEmbedded) {
    return (
      <div className="w-full lg:max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-10 lg:items-start">
        {/* Bloco de Adição - Premium Card */}
        <div className="bg-blue-500/[0.03] p-8 lg:p-10 rounded-[32px] border border-blue-500/20 shadow-2xl backdrop-blur-xl group transition-all duration-500 lg:w-[400px] shrink-0 sticky top-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform">
              <Plus size={16} className="text-blue-400" />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/50">Nova Categoria Estrutural</h2>
          </div>
          
          <form onSubmit={handleAdd} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Nome (Ex: Moradia)"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="w-full p-5 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-blue-500/40 focus:bg-blue-500/5 font-bold placeholder-white/10 transition-all backdrop-blur-md"
              required
            />
            <div className="flex flex-col gap-4">
              <div className="relative">
                <select
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as CategoryType)}
                  className="w-full p-5 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:border-blue-500/40 focus:bg-blue-500/5 font-bold appearance-none transition-all backdrop-blur-md"
                >
                  <option value={CategoryType.ESSENTIAL} className="bg-[#0a0a0a]">Custo Fixo Essencial</option>
                  <option value={CategoryType.CUTTABLE} className="bg-[#0a0a0a]">Custo Variável (Cortável)</option>
                  <option value={CategoryType.INCOME} className="bg-[#0a0a0a]">Fonte de Receita (Ganho)</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={20} />
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 active:scale-95"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Existentes - Premium List */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/20">Categorias Ativas</h2>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{categories.length} Total</span>
          </div>
          
          <div className="bg-white/[0.02] rounded-[40px] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md divide-y divide-white/5 max-h-[60vh] lg:max-h-none overflow-y-auto no-scrollbar">
            {categories.length === 0 ? (
               <div className="p-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                   <Plus size={24} className="text-white/10" />
                 </div>
                 <p className="text-white/20 font-bold text-sm tracking-tight text-center">Nenhuma categoria mapeada ainda.</p>
               </div>
            ) : categories.map(cat => (
              <div key={cat.id} className="p-6 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all">
                     <GripVertical size={16} className="text-white/20 group-hover:text-white/40" />
                   </div>
                   <div className="flex flex-col">
                     <span className="font-black text-white text-xl tracking-tight leading-tight">{cat.name}</span>
                     <span className={`w-fit mt-1.5 px-2.5 py-0.5 rounded-full text-[8px] font-black border uppercase tracking-[0.15em] ${getBadgeStyle(cat.type)}`}>
                      {cat.type === CategoryType.INCOME ? 'Receita' : cat.type === CategoryType.ESSENTIAL ? 'Fixo' : 'Variável'}
                    </span>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {deletingId === cat.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="px-4 py-2.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20"
                      >
                        Confirmar
                      </button>
                      <button 
                        onClick={() => setDeletingId(null)}
                        className="w-10 h-10 flex items-center justify-center bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setDeletingId(cat.id)} 
                      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 text-white/10 hover:text-rose-500 transition-all active:scale-90"
                      title="Excluir Categoria"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-[var(--bg)] pt-10 px-6 pb-32">
      <div className="flex items-center mb-10">
        <button onClick={onBack} className="p-3 bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] rounded-2xl border border-[var(--border)] shadow-sm transition-all focus:outline-none">
          <ArrowLeft size={20} />
        </button>
        <div className="ml-5">
           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Configuração Estrutural</span>
           <h1 className="text-3xl font-black text-[var(--text)] tracking-tighter uppercase italic">Mapeamento de Fluxo</h1>
        </div>
      </div>
      {/* Bloco de Adição */}
      <div className="bg-[var(--surface)] p-8 rounded-[2rem] shadow-xl border border-[var(--border)] mb-10">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] mb-6">Criar Nova Categoria</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Nome (Ex: Moradia, Alimentação Livre)"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            className="flex-1 p-4 bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] rounded-xl outline-none focus:border-indigo-500 font-medium"
            required
          />
          <select
            value={newCatType}
            onChange={e => setNewCatType(e.target.value as CategoryType)}
            className="p-4 bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] rounded-xl outline-none focus:border-indigo-500 font-medium md:min-w-[200px]"
          >
            <option value={CategoryType.ESSENTIAL}>Custo Fixo Essencial</option>
            <option value={CategoryType.CUTTABLE}>Custo Variável (Cortável)</option>
            <option value={CategoryType.INCOME}>Fonte de Receita (Ganho)</option>
          </select>
          <button type="submit" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Adicionar
          </button>
        </form>
      </div>
      {/* Lista de Existentes */}
      <div className="bg-[var(--surface)] rounded-[2rem] shadow-xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] bg-black/10">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Estruturas Adicionadas</h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {categories.length === 0 ? (
             <p className="p-10 text-center text-[var(--muted)] font-medium text-sm">Ainda não há categorias cadastradas.</p>
          ) : categories.map(cat => (
            <div key={cat.id} className="p-5 flex justify-between items-center group hover:bg-[var(--surface-hover)] transition-colors">
              <div className="flex items-center gap-4">
                 <GripVertical size={16} className="text-[var(--muted)]/30 cursor-grab" />
                 <span className="font-bold text-[var(--text)] text-lg capitalize">{cat.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black border uppercase tracking-widest ${getBadgeStyle(cat.type)}`}>
                  {cat.type === CategoryType.INCOME ? 'Receita' : cat.type === CategoryType.ESSENTIAL ? 'Fixo' : 'Variável'}
                </span>
                <button 
                  onClick={() => handleDelete(cat.id)} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-red-500 hover:text-white hover:border-red-500 text-[var(--muted)] transition-all"
                  title="Excluir Categoria"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
