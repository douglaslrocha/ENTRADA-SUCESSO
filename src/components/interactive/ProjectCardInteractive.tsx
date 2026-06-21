import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FolderKanban, Plus, ListTodo, MoreVertical, ChevronRight } from 'lucide-react';
import { orchestrator } from '../../core/orchestrator';

interface ProjectCardInteractiveProps {
  project: {
    id?: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    tasksCount: number;
  };
  onUpdate?: () => void;
}

export const ProjectCardInteractive: React.FC<ProjectCardInteractiveProps> = ({ project, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddTodo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const todoTitle = window.prompt(`Adicionar nova tarefa ao projeto: ${project.title}`);
    if (!todoTitle) return;

    setIsUpdating(true);
    try {
      await orchestrator.executeDirectAction('task_create', { 
        title: todoTitle, 
        project: project.title 
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleViewTasks = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await orchestrator.executeDirectAction('query_tasks', { project: project.title });
      orchestrator.appendBlocksFromOrchestrator(response);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, borderColor: '#333' }}
      className={`bg-[#111] border border-[#222] rounded-[20px] p-5 md:p-6 shadow-2xl group transition-all cursor-pointer relative overflow-hidden ${isUpdating ? 'opacity-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">{project.title}</h3>
            <ChevronRight size={14} className="text-zinc-700 group-hover:text-purple-400 transition-all" />
          </div>
          <p className="text-xs text-zinc-500 line-clamp-2">{project.description}</p>
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
          project.status === 'active' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 
          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
        }`}>
          {project.status}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
          <span className="text-zinc-500">Progresso</span>
          <span className="text-white">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-[#222] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-[#111] bg-[#222] flex items-center justify-center text-[8px] font-bold text-zinc-400">
              U{i}
            </div>
          ))}
        </div>
        <div className="text-[10px] text-zinc-500 font-medium">
          {project.tasksCount} tarefas pendentes
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-[#222] flex items-center gap-2">
        <button 
          onClick={handleViewTasks}
          className="flex-1 py-2 rounded-xl bg-[#161616] hover:bg-[#222] border border-[#222] text-[10px] font-bold text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <ListTodo size={12} />
          Ver Tarefas
        </button>
        <button 
          onClick={handleAddTodo}
          className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-500 transition-all"
          title="Adicionar Tarefa"
        >
          <Plus size={14} />
        </button>
      </div>

      {isUpdating && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </motion.div>
  );
};
