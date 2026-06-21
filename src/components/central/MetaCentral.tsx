import React from 'react';
import { motion } from 'motion/react';
import { X, Target, CheckSquare, Clock, Calendar, TrendingUp, Zap } from 'lucide-react';
import { fakeDB } from '../../core/fakeDB';

interface MetaCentralProps {
  goalId: string;
  onClose: () => void;
}

export const MetaCentral: React.FC<MetaCentralProps> = ({ goalId, onClose }) => {
  const goal = fakeDB.goals.find(g => g.id === goalId);
  
  if (!goal) return null;

  const projects = fakeDB.projects.filter(p => p.goalId === goalId);
  const tasks = projects.flatMap(p => fakeDB.tasks.filter(t => t.projectId === p.id));
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[110] bg-[var(--bg)]/80 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
    >
      <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
              <Target size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Central da Meta</p>
              <h2 className="text-xl font-light">{goal.title}</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-[var(--bg)] flex items-center justify-center text-[var(--muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Progresso</p>
              <p className="text-xl font-light text-[var(--primary)]">{progress}%</p>
            </div>
            <div className="bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Projetos</p>
              <p className="text-xl font-light">{projects.length}</p>
            </div>
            <div className="bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Tarefas</p>
              <p className="text-xl font-light">{tasks.length}</p>
            </div>
            <div className="bg-[var(--bg)] p-4 rounded-3xl border border-[var(--border)]">
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] mb-1">Concluídas</p>
              <p className="text-xl font-light text-emerald-500">{completedTasks.length}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Descrição</h3>
            <p className="text-sm text-[var(--text)]/70 leading-relaxed">
              {goal.description || 'Nenhuma descrição detalhada para esta meta.'}
            </p>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">Projetos Vinculados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map(project => (
                <div key={project.id} className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors">
                  <h4 className="text-sm font-medium mb-1">{project.title}</h4>
                  <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                    {fakeDB.tasks.filter(t => t.projectId === project.id).length} Tarefas
                  </p>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="col-span-full py-8 text-center border-2 border-dashed border-[var(--border)] rounded-2xl text-[var(--muted)] text-xs">
                  Nenhum projeto vinculado a esta meta.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border)] bg-[var(--bg)]/50">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all"
          >
            Fechar Central
          </button>
        </div>
      </div>
    </motion.div>
  );
};
