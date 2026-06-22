import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Target, CheckCircle2, Clock, 
  ArrowRight, Plus, Zap, Layout, ListTodo,
  MoreVertical, Play, Edit3, Trash2, ChevronDown,
  ChevronUp, Sparkles, TrendingUp
} from 'lucide-react';
import { storage } from '../lib/storage';
import { safeUUID } from '../../../utils/uuid';
import { MetaData } from './MetaBuilderModal';
import { TaskData } from './TaskBuilderModal';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  subtasks: { id: string; title: string; completed: boolean }[];
  originalTask?: TaskData;
}

interface MetaWithTasks extends MetaData {
  tasks: Task[];
}

export default function GoalsOverview({ 
  objectiveTitle, 
  onBack,
  onAddTask,
  onAddMeta,
  onExecuteTask
}: { 
  objectiveTitle: string; 
  onBack: () => void;
  onAddTask?: (metaId: string) => void;
  onAddMeta?: () => void;
  onExecuteTask?: (task: TaskData) => void;
}) {
  const [metas, setMetas] = useState<MetaWithTasks[]>([]);
  const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    const normalizeStorageKey = (title: string): string => {
      return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
    };

    const storageKey = normalizeStorageKey(objectiveTitle);
    const parsedMetas = storage.get<MetaData[]>(`metas_${storageKey}`, []);
    const allTasks = storage.get<TaskData[]>(`tasks_${storageKey}`, []);
    
    if (parsedMetas.length > 0) {
      const metasWithTasks = parsedMetas.map(meta => {
        const metaTasks = allTasks.filter(t => t.metaId === meta.id).map(t => ({
          id: t.id,
          title: t.title,
          completed: t.status === 'completed',
          subtasks: t.subtasks.map(s => ({ id: s.id, title: s.text, completed: s.completed })),
          originalTask: t
        }));

        return {
          ...meta,
          tasks: metaTasks.length > 0 ? metaTasks : [
            { 
              id: safeUUID(), 
              title: `Primeiro passo para ${meta.intention}`, 
              completed: false,
              subtasks: [
                { id: safeUUID(), title: 'Pesquisar referências', completed: true },
                { id: safeUUID(), title: 'Definir cronograma', completed: false }
              ]
            }
          ]
        };
      });
      setMetas(metasWithTasks);
    }
  }, [objectiveTitle]);


  const toggleTask = (metaId: string, taskId: string) => {
    setMetas(prev => prev.map(meta => {
      if (meta.id !== metaId) return meta;
      return {
        ...meta,
        tasks: meta.tasks.map(task => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        })
      };
    }));
  };

  const toggleSubtask = (metaId: string, taskId: string, subtaskId: string) => {
    setMetas(prev => prev.map(meta => {
      if (meta.id !== metaId) return meta;
      return {
        ...meta,
        tasks: meta.tasks.map(task => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            subtasks: task.subtasks.map(st => {
              if (st.id !== subtaskId) return st;
              return { ...st, completed: !st.completed };
            })
          };
        })
      };
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-black text-neutral-white font-body overflow-x-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-pastel-indigo/10 via-transparent to-pastel-pink/5" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-indigo/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-pink/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <nav className="md:fixed relative top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-4 bg-neutral-black/20 backdrop-blur-md border-b border-neutral-white/5">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-neutral-white/5 border border-neutral-white/10 rounded-full hover:bg-neutral-white/10 transition-all group"
        >
          <ChevronLeft size={14} className="text-neutral-white/60 group-hover:text-neutral-white transition-colors" />
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-neutral-white/60 group-hover:text-neutral-white transition-colors">Voltar</span>
        </button>
        <div className="flex items-center gap-2 md:gap-3">
          <Sparkles size={16} className="text-pastel-indigo animate-pulse md:w-[18px] md:h-[18px]" />
          <h1 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-neutral-white/80 truncate max-w-[120px] md:max-w-none">Visão Geral</h1>
        </div>
        <button 
          onClick={onAddMeta || onBack}
          className="px-3 md:px-4 py-1.5 bg-pastel-indigo text-neutral-black rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105"
        >
          Nova Meta
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-6 md:pt-32 pb-40">
        <header className="mb-10 md:mb-20 text-center space-y-3 md:space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-pastel-indigo font-bold uppercase tracking-[0.4em] text-[8px] md:text-[10px] mb-2 md:mb-4">Arquitetura da Manifestação</p>
            <h2 className="text-3xl md:text-7xl font-bold tracking-tighter leading-[1.1] md:leading-[0.9] text-neutral-white">
              Suas Metas <br className="hidden sm:block" /> <span className="text-neutral-white/20">Estratégicas</span>
            </h2>
          </motion.div>
        </header>

        <div className="space-y-8 md:space-y-12">
          {metas.length === 0 ? (
            <div className="py-20 md:py-32 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/10">
                <Target size={32} className="md:w-[40px] md:h-[40px]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-bold text-neutral-white/60">Nenhuma meta definida ainda</h3>
                <p className="text-xs md:text-sm text-neutral-white/30 max-w-xs mx-auto">Comece a estruturar sua visão criando sua primeira meta estratégica.</p>
              </div>
              <button 
                onClick={onAddMeta || onBack}
                className="px-6 md:px-8 py-2.5 md:py-3 bg-pastel-indigo text-neutral-black rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all hover:scale-105"
              >
                Criar Primeira Meta
              </button>
            </div>
          ) : (
            metas.map((meta, idx) => (
              <motion.section 
                key={meta.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="bg-neutral-white/5 border border-neutral-white/10 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl transition-all hover:border-neutral-white/20">
                  {/* Meta Header Card */}
                  <div className="p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
                    <div className="flex-1 space-y-4 md:space-y-6 w-full">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div 
                          className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-neutral-black shadow-lg flex-shrink-0"
                          style={{ backgroundColor: meta.color || '#c3b1e1' }}
                        >
                          <Target size={18} className="md:w-[24px] md:h-[24px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 md:gap-3 mb-0.5 md:mb-1">
                            <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Meta {idx + 1}</span>
                            <span className={`px-2 py-0.5 rounded text-[7px] md:text-[8px] font-bold uppercase tracking-widest ${
                              meta.impact === 'critical' ? 'bg-pastel-pink/20 text-pastel-pink' : 'bg-neutral-white/10 text-neutral-white/40'
                            }`}>
                              {meta.impact}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-3xl font-bold text-neutral-white tracking-tight leading-tight truncate">{meta.intention}</h3>
                        </div>
                      </div>
                      <p className="text-sm md:text-lg text-neutral-white/60 leading-relaxed max-w-2xl italic line-clamp-3">
                        "{meta.description || 'Sem descrição definida...'}"
                      </p>
                      <div className="flex flex-wrap gap-4 md:gap-6 pt-1 md:pt-4">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-pastel-yellow md:w-[14px] md:h-[14px]" />
                          <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">
                            {new Date(meta.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} className="text-pastel-green md:w-[14px] md:h-[14px]" />
                          <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest truncate">
                            {meta.objetivoDesejado || (meta as any).targetValue} {meta.formaMedicao || (meta as any).metric}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 md:gap-4">
                      <button 
                        onClick={() => setExpandedMetaId(expandedMetaId === meta.id ? null : meta.id)}
                        className="flex-1 px-6 md:px-8 py-3.5 md:py-4 bg-neutral-white/5 hover:bg-neutral-white/10 border border-neutral-white/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all group/btn"
                      >
                        {expandedMetaId === meta.id ? (
                          <>
                            <ChevronUp size={16} className="md:w-[18px] md:h-[18px]" />
                            Recolher
                          </>
                        ) : (
                          <>
                            <ListTodo size={16} className="md:w-[18px] md:h-[18px]" />
                            Ver {meta.tasks.length} Tarefas
                          </>
                        )}
                      </button>
                      <button 
                        onClick={() => {
                          const pendingTask = meta.tasks.find(t => !t.completed);
                          if (pendingTask && pendingTask.originalTask) {
                            onExecuteTask?.(pendingTask.originalTask);
                          } else if (meta.tasks.length > 0 && meta.tasks[0].originalTask) {
                            onExecuteTask?.(meta.tasks[0].originalTask);
                          }
                        }}
                        className="flex-1 px-6 md:px-8 py-3.5 md:py-4 bg-pastel-indigo text-neutral-black rounded-xl md:rounded-2xl flex items-center justify-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl shadow-pastel-indigo/10"
                      >
                        <Play size={16} fill="currentColor" className="md:w-[18px] md:h-[18px]" />
                        Agir Agora
                      </button>
                    </div>
                  </div>

                  {/* Tasks & Subtasks Expansion */}
                  <AnimatePresence>
                    {expandedMetaId === meta.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-white/10 bg-neutral-black/40"
                      >
                        <div className="p-6 md:p-12 space-y-6 md:space-y-8">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-neutral-white/40">Plano de Execução</h4>
                            <button 
                              onClick={() => onAddTask?.(meta.id)}
                              className="text-[9px] md:text-[10px] font-bold text-pastel-indigo uppercase tracking-widest flex items-center gap-2 hover:underline"
                            >
                              <Plus size={12} className="md:w-[14px] md:h-[14px]" />
                              Nova Tarefa
                            </button>
                          </div>

                          <div className="space-y-3 md:space-y-4">
                            {meta.tasks.map((task) => (
                              <div key={task.id} className="space-y-3">
                                <div className="group/task flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-neutral-white/5 border border-neutral-white/5 rounded-xl md:rounded-2xl hover:border-neutral-white/10 transition-all">
                                  <button 
                                    onClick={() => toggleTask(meta.id, task.id)}
                                    className={`w-5 h-5 md:w-6 md:h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                      task.completed 
                                        ? 'bg-pastel-green border-pastel-green text-neutral-black' 
                                        : 'border-neutral-white/20 hover:border-pastel-green/50'
                                    }`}
                                  >
                                    {task.completed && <CheckCircle2 size={12} className="md:w-[14px] md:h-[14px]" />}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <h5 className={`text-xs md:text-sm font-bold transition-all truncate ${task.completed ? 'text-neutral-white/20 line-through' : 'text-neutral-white/80'}`}>
                                      {task.title}
                                    </h5>
                                  </div>
                                  <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover/task:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => task.originalTask && onExecuteTask?.(task.originalTask)}
                                      className="hidden sm:block px-3 py-1.5 bg-pastel-indigo/10 hover:bg-pastel-indigo/20 border border-pastel-indigo/20 rounded-lg text-[10px] font-bold text-pastel-indigo uppercase tracking-widest transition-all"
                                    >
                                      Agir
                                    </button>
                                    <button className="p-1.5 md:p-2 text-neutral-white/20 hover:text-neutral-white transition-colors">
                                      <Edit3 size={14} className="md:w-[16px] md:h-[16px]" />
                                    </button>
                                    <button className="p-1.5 md:p-2 text-neutral-white/20 hover:text-pastel-pink transition-colors">
                                      <Trash2 size={14} className="md:w-[16px] md:h-[16px]" />
                                    </button>
                                  </div>
                                </div>

                                {/* Subtasks */}
                                {task.subtasks.length > 0 && (
                                  <div className="pl-10 md:pl-14 space-y-2">
                                    {task.subtasks.map((subtask) => (
                                      <div key={subtask.id} className="flex items-center gap-3 group/subtask">
                                        <button 
                                          onClick={() => toggleSubtask(meta.id, task.id, subtask.id)}
                                          className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                            subtask.completed 
                                              ? 'bg-pastel-green/40 border-pastel-green/40 text-neutral-black' 
                                              : 'border-neutral-white/10 hover:border-pastel-green/30'
                                          }`}
                                        >
                                          {subtask.completed && <CheckCircle2 size={10} />}
                                        </button>
                                        <span className={`text-[10px] md:text-xs transition-all ${subtask.completed ? 'text-neutral-white/10 line-through' : 'text-neutral-white/40'}`}>
                                          {subtask.title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            ))
          )}
        </div>
      </main>

      {/* Footer Affirmation */}
      <footer className="md:fixed relative bottom-0 left-0 w-full z-50 p-4 md:p-8 pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="bg-neutral-black/80 backdrop-blur-xl border border-neutral-white/10 px-6 md:px-8 py-3 md:py-4 rounded-full pointer-events-auto shadow-2xl">
            <p className="text-[8px] md:text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center leading-relaxed">
              "A disciplina é a ponte entre metas e realizações."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
