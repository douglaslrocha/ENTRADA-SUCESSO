import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Edit2, Trash2, Clock, MoreVertical } from 'lucide-react';
import { orchestrator } from '../../core/orchestrator';

interface TaskItemInteractiveProps {
  task: {
    id?: string;
    title: string;
    status: string;
    project?: string;
    dueDate?: string;
    priority?: string;
  };
  onUpdate?: () => void;
}

export const TaskItemInteractive: React.FC<TaskItemInteractiveProps> = ({ task, onUpdate }) => {
  const [isDone, setIsDone] = useState(task.status === 'done');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const handleToggleDone = async () => {
    const newStatus = !isDone ? 'done' : 'todo';
    setIsDone(!isDone);
    setIsUpdating(true);

    try {
      await orchestrator.executeDirectAction('task_update', { 
        id: task.id || task.title, 
        status: newStatus 
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      setIsDone(isDone); // Rollback
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Deseja remover esta tarefa?')) return;
    setIsUpdating(true);
    try {
      await orchestrator.executeDirectAction('task_delete', { id: task.id || task.title });
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      layout
      className={`p-4 hover:bg-[#161616] transition-colors flex items-center justify-between group relative ${isUpdating ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={handleToggleDone}
          disabled={isUpdating}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[#333] hover:border-zinc-500'
          }`}
        >
          {isDone && <CheckSquare size={12} />}
        </button>
        
        <div className="flex-1">
          <h4 className={`text-sm font-medium transition-all ${isDone ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
            {task.title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[10px] text-zinc-600 font-medium">{task.project || 'Sem projeto'}</span>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                <Clock size={10} />
                <span>{task.dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden group-hover:flex items-center gap-1">
          <button 
            onClick={() => console.log('Edit task', task)}
            className="p-1.5 rounded-lg hover:bg-[#222] text-zinc-500 hover:text-white transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button 
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-[#222] text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        <div className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
          task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
          task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
          'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }`}>
          {task.priority || 'normal'}
        </div>
      </div>

      {isUpdating && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center rounded-xl"
        >
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </motion.div>
  );
};
