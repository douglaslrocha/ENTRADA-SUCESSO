import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Pause, CheckCircle2, Clock, 
  AlertTriangle, Zap, ArrowRight, Target,
  FileText, MessageSquare, TrendingUp,
  RotateCcw, Calendar, Trash2, ChevronRight,
  Sparkles, History, Info, Flag, Brain,
  Wind,
  Award, Lightbulb, Image as ImageIcon
} from 'lucide-react';
import { TaskData } from './TaskBuilderModal';
import { analyzeTaskExecution, getNextActionSuggestion, ExecutionInsight } from '../services/intelligenceService';
import NativeTimePicker from './NativeTimePicker';
import { storage } from '../lib/storage';

interface TaskExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskData;
  onUpdate: (updatedTask: TaskData) => void;
  onDelete?: (taskId: string) => void;
  objectiveTitle: string;
  metaIntention?: string;
  initialElapsedSeconds?: number;
  initialStatus?: TaskData['status'];
}

export default function TaskExecutionModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdate,
  onDelete,
  objectiveTitle,
  metaIntention,
  initialElapsedSeconds,
  initialStatus
}: TaskExecutionModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds ?? task.actualDuration ?? 0);
  const [status, setStatus] = useState<TaskData['status']>(initialStatus || task.status || 'pending');
  const [notes, setNotes] = useState(task.executionNotes || '');
  const [realEffort, setRealEffort] = useState<TaskData['realEffort']>(task.realEffort || 'equal');
  const [blockers, setBlockers] = useState(task.blockers || '');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [showFeedback, setShowFeedback] = useState(false);
  const [insights, setInsights] = useState<ExecutionInsight[]>([]);
  const [nextAction, setNextAction] = useState<TaskData | null>(null);
  const [isManualTimePickerOpen, setIsManualTimePickerOpen] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Custom Tags for energy work
  const [customSensations, setCustomSensations] = useState<string[]>(() => storage.get('energy_work_sensations', []));
  const [customPhenomena, setCustomPhenomena] = useState<string[]>(() => storage.get('energy_work_phenomena', []));
  const [newSensation, setNewSensation] = useState('');
  const [newPhenomenon, setNewPhenomenon] = useState('');

  const hasInitializedRef = useRef(false);

  // Sync with props when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setElapsedSeconds(initialElapsedSeconds ?? task.actualDuration ?? 0);
      setStatus(initialStatus || task.status || 'pending');
      setNotes(task.executionNotes || '');
      setRealEffort(task.realEffort || 'equal');
      setBlockers(task.blockers || '');
      setSubtasks(task.subtasks || []);
      setShowFeedback(false);
      setInsights([]);
      setNextAction(null);
      hasInitializedRef.current = true;
    }
  }, [isOpen, task.id, initialElapsedSeconds, initialStatus]);

  // Timer Logic
  useEffect(() => {
    if (status === 'in-progress') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Auto-save logic
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        handleUpdate();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [elapsedSeconds, status, notes, realEffort, blockers, subtasks]);

  const handleUpdate = () => {
    onUpdate({
      ...task,
      actualDuration: elapsedSeconds,
      status,
      executionNotes: notes,
      realEffort,
      blockers,
      subtasks,
      completedAt: status === 'completed' ? (task.completedAt || new Date().toISOString()) : undefined
    });
  };

  const handleComplete = () => {
    setStatus('completed');
    const updatedTask = {
      ...task,
      actualDuration: elapsedSeconds,
      status: 'completed' as const,
      executionNotes: notes,
      realEffort,
      blockers,
      subtasks,
      completedAt: new Date().toISOString()
    };
    
    // Get all tasks from storage to analyze
    const allTasks = storage.get<TaskData[]>(`tasks_${objectiveTitle}`, []);
    const updatedAllTasks = allTasks.map(t => t.id === task.id ? updatedTask : t);
    
    const taskInsights = analyzeTaskExecution(updatedTask, updatedAllTasks);
    const suggestion = getNextActionSuggestion(updatedAllTasks.filter(t => t.id !== task.id));
    
    setInsights(taskInsights);
    setNextAction(suggestion);
    setShowFeedback(true);
    onUpdate(updatedTask);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseEstimatedTime = (est: string) => {
    // Simple parser for "2h 30m" or "45m"
    let totalMinutes = 0;
    const hMatch = est.match(/(\d+)h/);
    const mMatch = est.match(/(\d+)m/);
    if (hMatch) totalMinutes += parseInt(hMatch[1]) * 60;
    if (mMatch) totalMinutes += parseInt(mMatch[1]);
    return totalMinutes * 60; // returns seconds
  };

  const estimatedSeconds = parseEstimatedTime(task.estimatedDuration || "0m");
  const timeProgress = estimatedSeconds > 0 ? (elapsedSeconds / estimatedSeconds) * 100 : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-0 md:p-8"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-black/90 backdrop-blur-3xl" onClick={onClose} />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="relative w-full max-w-full md:max-w-[90%] h-full md:h-auto md:max-h-[90vh] bg-neutral-black md:border border-neutral-white/10 rounded-none md:rounded-[3rem] flex flex-col shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-y-auto md:overflow-hidden custom-scrollbar"
        >
          {/* Visual Anchor Image (Emotional Resonance) */}
          {task.imageUrl && (
            <div className="w-full h-40 md:h-72 relative flex-shrink-0 overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={task.imageUrl} 
                className="w-full h-full object-cover transition-transform duration-[30s] hover:scale-110" 
                alt={task.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-neutral-black/20 to-neutral-black/40" />
              <div className="absolute bottom-6 left-6 md:bottom-10 md:left-12 flex items-center gap-3">
                 <div className="p-2 bg-pastel-indigo/20 backdrop-blur-xl rounded-xl border border-pastel-indigo/30">
                   <ImageIcon size={14} className="text-pastel-indigo" />
                 </div>
                 <span className="text-[10px] font-bold text-neutral-white uppercase tracking-[0.3em] drop-shadow-lg">Âncora Visual Ativa</span>
              </div>
            </div>
          )}

          {/* Header (Integrated & Preserved) */}
          <header className="px-5 md:px-12 py-5 md:py-8 border-b border-neutral-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-black relative md:sticky top-0 overflow-hidden z-30 flex-shrink-0">
            {/* Soft Aura/Glow */}
            <div className={`absolute -top-12 -left-12 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000 ${
              status === 'in-progress' && task.executionType === 'energy-work' ? 'bg-pastel-indigo/30' : 'bg-pastel-indigo/10'
            }`} />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-white/[0.01] to-transparent pointer-events-none" />
            
            <div className="space-y-2 flex-1 relative z-10">
              <div className="flex items-center gap-3 text-neutral-white/30">
                <Target size={10} className="text-pastel-indigo" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em]">{objectiveTitle}</span>
                <ChevronRight size={10} />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-pastel-indigo">{metaIntention || 'Estratégia'}</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-headline font-bold text-neutral-white tracking-tight leading-tight">
                  {task.title}
                </h1>
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-pastel-green" 
                  />
                  <p className="text-xs md:text-sm text-neutral-white/40 font-medium italic">
                    Evolução Esperada: <span className="text-neutral-white/70">"{task.evolucaoEsperada || 'Conclusão da tarefa'}"</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                status === 'completed' ? 'bg-pastel-green/20 border-pastel-green/30 text-pastel-green' :
                status === 'in-progress' ? 'bg-pastel-indigo/20 border-pastel-indigo/30 text-pastel-indigo' :
                status === 'paused' ? 'bg-pastel-yellow/20 border-pastel-yellow/30 text-pastel-yellow' :
                status === 'blocked' ? 'bg-pastel-pink/20 border-pastel-pink/30 text-pastel-pink' :
                'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/40'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'completed' ? 'bg-pastel-green' :
                  status === 'in-progress' ? 'bg-pastel-indigo animate-ping' :
                  status === 'paused' ? 'bg-pastel-yellow' :
                  status === 'blocked' ? 'bg-pastel-pink' :
                  'bg-neutral-white/20'
                }`} />
                {status === 'pending' ? 'Pendente' : 
                 status === 'in-progress' ? 'Em Execução' : 
                 status === 'paused' ? 'Pausada' : 
                 status === 'completed' ? 'Concluída' : 'Bloqueada'}
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all group"
              >
                <X size={20} className="md:w-[28px] md:h-[28px] group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row md:overflow-y-auto custom-scrollbar">
            {/* Main Content Area */}
            <div className="flex-1 px-5 md:px-10 py-6 md:py-8 space-y-10">
              
              {/* 1. Timer Central (Cockpit) */}
              <motion.div 
                animate={status === 'in-progress' ? { 
                  boxShadow: ['0 0 30px rgba(197,202,233,0.03)', '0 0 50px rgba(197,202,233,0.1)', '0 0 30px rgba(197,202,233,0.03)'] 
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center space-y-8 py-8 md:py-10 bg-neutral-white/[0.01] border border-neutral-white/5 rounded-[2.5rem] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-pastel-indigo/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="text-center space-y-3 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className={`w-1 h-1 rounded-full ${status === 'in-progress' ? 'bg-pastel-indigo animate-pulse' : 'bg-neutral-white/20'}`} />
                    <p className="text-[9px] font-bold text-neutral-white/30 uppercase tracking-[0.3em]">Tempo de Execução Real</p>
                  </div>
                  <div className={`text-5xl md:text-7xl font-headline font-black tracking-tighter tabular-nums transition-all duration-700 ${status === 'in-progress' ? 'text-neutral-white' : 'text-neutral-white/40'}`}>
                    {formatTime(elapsedSeconds)}
                  </div>
                </div>

                <div className="flex items-center gap-6 relative z-10">
                  {status !== 'in-progress' ? (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatus('in-progress')}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-white text-neutral-black flex items-center justify-center shadow-xl transition-all group border-4 border-neutral-white/10"
                    >
                      <Play size={28} fill="currentColor" className="md:w-32 md:h-32 ml-1" />
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatus('paused')}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-pastel-indigo text-neutral-black flex items-center justify-center shadow-xl transition-all border-4 border-pastel-indigo/20"
                    >
                      <Pause size={28} fill="currentColor" className="md:w-32 md:h-32" />
                    </motion.button>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => {
                        if (confirm('Deseja reiniciar o cronômetro?')) setElapsedSeconds(0);
                      }}
                      className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <div className="relative group">
                      <button 
                        onClick={() => setIsManualTimePickerOpen(true)}
                        className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all"
                      >
                        <Clock size={16} />
                      </button>
                      <NativeTimePicker 
                        value={`${Math.floor(elapsedSeconds / 3600)}h ${Math.floor((elapsedSeconds % 3600) / 60)}m`}
                        onChange={(val) => {
                          const h = parseInt(val.match(/(\d+)h/)?.[1] || '0');
                          const m = parseInt(val.match(/(\d+)m/)?.[1] || '0');
                          setElapsedSeconds((h * 3600) + (m * 60));
                        }}
                        isOpen={isManualTimePickerOpen}
                        onClose={() => setIsManualTimePickerOpen(false)}
                        label="Ajustar Tempo Real"
                      />
                    </div>
                  </div>
                </div>

                {/* Comparison Bar */}
                <div className="w-full max-w-md px-10 space-y-3">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-neutral-white/30">Estimado: {task.estimatedDuration || 'N/A'}</span>
                    <span className={`${elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 ? 'text-pastel-pink' : 'text-pastel-green'}`}>
                      {elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 
                        ? `+${Math.round(((elapsedSeconds - estimatedSeconds) / estimatedSeconds) * 100)}% do tempo` 
                        : 'Dentro do prazo'}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-neutral-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(timeProgress, 100)}%` }}
                      className={`h-full transition-colors duration-500 ${
                        elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 ? 'bg-pastel-pink' : 'bg-pastel-indigo'
                      }`}
                    />
                  </div>
                  {elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[8px] text-pastel-pink font-bold uppercase tracking-widest text-center"
                    >
                      Você já ultrapassou o tempo estimado. Mantenha o foco para concluir.
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* 2. Strategy (Canvas) */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pastel-purple/10 flex items-center justify-center text-pastel-purple">
                    <Zap size={16} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-white/80">Estratégia de Execução</h3>
                </div>
                <div className="p-8 md:p-10 bg-neutral-white/[0.03] border border-neutral-white/5 rounded-[2.5rem] relative group">
                  <div className="absolute top-6 right-8 opacity-10">
                    <Sparkles size={24} />
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm md:text-lg text-neutral-white/60 leading-relaxed whitespace-pre-wrap font-body">
                      {task.executionStrategy || 'Nenhuma estratégia detalhada para esta tarefa.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Status Dynamic Selector */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { id: 'pending', label: 'Pendente', color: 'bg-neutral-white/5 text-neutral-white/40' },
                  { id: 'in-progress', label: 'Executando', color: 'bg-pastel-indigo/20 text-pastel-indigo border-pastel-indigo/30' },
                  { id: 'paused', label: 'Pausada', color: 'bg-pastel-yellow/20 text-pastel-yellow border-pastel-yellow/30' },
                  { id: 'completed', label: 'Concluída', color: 'bg-pastel-green/20 text-pastel-green border-pastel-green/30' },
                  { id: 'blocked', label: 'Bloqueada', color: 'bg-pastel-pink/20 text-pastel-pink border-pastel-pink/30' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id as any)}
                    className={`px-4 py-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${
                      status === s.id ? s.color : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20 hover:bg-neutral-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* 3.1 Energy Work Analysis (Conscienciologia) */}
              {task.executionType === 'energy-work' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 p-6 md:p-10 bg-pastel-indigo/[0.03] border border-pastel-indigo/10 rounded-[2.5rem] relative overflow-hidden"
                >
                  {/* EV Animation Effect Backdrop */}
                  <AnimatePresence>
                    {status === 'in-progress' && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-[-200px] pointer-events-none z-0 overflow-visible"
                      >
                        {/* Shimmering Energy Particles (Pranic Bits) */}
                        {[...Array(20)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ 
                              y: [500, -100], 
                              opacity: [0, 0.6, 0],
                              scale: [0.5, 2, 0.5],
                              x: [
                                (Math.random() - 0.5) * 40, 
                                (Math.random() - 0.5) * 40
                              ]
                            }}
                            transition={{ 
                              duration: 2 + Math.random() * 3, 
                              repeat: Infinity, 
                              delay: Math.random() * 2,
                              ease: "easeInOut"
                            }}
                            className="absolute w-0.5 h-20 bg-gradient-to-t from-pastel-indigo/40 to-transparent blur-[1.5px]"
                            style={{ left: `${Math.random() * 100}%`, bottom: '-100px' }}
                          />
                        ))}
                        
                        {/* Aura Pulsation */}
                        <motion.div 
                          animate={{ 
                            opacity: [0.05, 0.15, 0.05],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-radial-gradient(from 50% 50%, rgba(197,202,233,0.15) 0%, transparent 80%)"
                        />

                        {/* High Frequency Vibration */}
                        <motion.div 
                          animate={{ 
                            opacity: [0.3, 0.5, 0.3],
                          }}
                          transition={{ duration: 0.05, repeat: Infinity }}
                          className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(197,202,233,0.02)_0px,transparent_2px)]"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <Wind size={18} className={`text-pastel-indigo ${status === 'in-progress' ? 'animate-pulse' : ''}`} />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-neutral-white/80">Mobilização Energética (MVE)</h4>
                    </div>
                    <div className="px-3 py-1 bg-pastel-indigo/10 rounded-lg border border-pastel-indigo/20 text-[8px] font-bold text-pastel-indigo uppercase tracking-widest">
                      Bioenergética Técnica / EV
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    {/* Intensidade e Simetria */}
                    <div className="space-y-8">
                       <div className="space-y-4">
                         <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                           <label className="text-neutral-white/40">Intensidade do EV/MVE</label>
                           <span className="font-headline text-pastel-indigo">{task.energyWorkExecution?.intensity || 0}/10</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <input 
                             type="range" min="0" max="10" 
                             value={task.energyWorkExecution?.intensity || 0}
                             onChange={(e) => onUpdate({
                               ...task,
                               energyWorkExecution: { 
                                 ...task.energyWorkExecution || { 
                                   intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                   symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                 },
                                 intensity: parseInt(e.target.value)
                               }
                             })}
                             className="flex-1 accent-pastel-indigo h-1.5 bg-neutral-white/10 rounded-full appearance-none cursor-pointer"
                           />
                         </div>
                       </div>

                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Simetria (Distribuição)</label>
                           <span className="text-xs font-headline font-bold text-pastel-indigo">{task.energyWorkExecution?.symmetry || 1}/5</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <input 
                             type="range" min="1" max="5" 
                             value={task.energyWorkExecution?.symmetry || 1}
                             onChange={(e) => onUpdate({
                               ...task,
                               energyWorkExecution: { 
                                 ...task.energyWorkExecution || { 
                                   intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                   symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                 },
                                 symmetry: parseInt(e.target.value)
                               }
                             })}
                             className="flex-1 accent-pastel-indigo"
                           />
                         </div>
                       </div>

                       <div className="space-y-4">
                         <div className="flex justify-between items-center">
                           <label className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Lucidez Projetiva</label>
                           <span className="text-xs font-headline font-bold text-pastel-indigo">{task.energyWorkExecution?.lucidity || 1}/5</span>
                         </div>
                         <div className="flex items-center gap-1">
                           {[1, 2, 3, 4, 5].map(l => (
                             <button
                               key={l}
                               onClick={() => onUpdate({
                                 ...task,
                                 energyWorkExecution: {
                                   ...task.energyWorkExecution || { 
                                      intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                      symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                   },
                                   lucidity: l
                                 }
                               })}
                               className={`flex-1 py-1.5 rounded-lg border transition-all text-[9px] font-bold ${
                                 (task.energyWorkExecution?.lucidity || 1) === l
                                   ? 'bg-pastel-indigo/20 border-pastel-indigo/40 text-pastel-indigo'
                                   : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20'
                               }`}
                             >
                               {l}
                             </button>
                           ))}
                         </div>
                       </div>
                    </div>

                    {/* Impacto Holossomático */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Impacto Holossomático</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'energy', label: 'Mobilização Energética', color: 'pastel-indigo' },
                          { id: 'physical', label: 'Somático (Corpo)', color: 'pastel-green' },
                          { id: 'emotional', label: 'Psicossoma (Emoção)', color: 'pastel-pink' },
                          { id: 'mental', label: 'Mentalsoma (Mente)', color: 'pastel-purple' }
                        ].map((dim) => (
                          <div key={dim.id} className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[8px] font-bold text-neutral-white/30 uppercase tracking-tight">{dim.label}</span>
                              <span className={`text-[9px] font-bold text-${dim.color}`}>{task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0}</span>
                            </div>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => {
                                    const impacts = task.energyWorkExecution?.holosomaticImpacts || { physical: 0, energy: 0, emotional: 0, mental: 0 };
                                    onUpdate({
                                      ...task,
                                      energyWorkExecution: {
                                        ...task.energyWorkExecution || { 
                                          intensity: 0, technique: 'ev', holosomaticImpacts: impacts,
                                          symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                        },
                                        holosomaticImpacts: { ...impacts, [dim.id]: level }
                                      }
                                    });
                                  }}
                                  className={`h-1.5 flex-1 rounded-full transition-all ${
                                    (task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0) >= level
                                      ? `bg-${dim.color}`
                                      : 'bg-neutral-white/5 hover:bg-neutral-white/10'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sensações e Fenômenos (Bioenergetic Registry) */}
                  <div className="space-y-10 pt-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Sensações / Sinalética */}
                      <div className="p-8 bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[3rem] space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-white/30 uppercase tracking-[0.2em]">Sinalética Bioenergética</label>
                          <button 
                            onClick={() => {
                              const name = prompt('Nova sinalética detectada:');
                              if (name) {
                                const updated = [...customSensations, name];
                                setCustomSensations(updated);
                                storage.set('energy_work_sensations', updated);
                              }
                            }}
                            className="px-3 py-1 rounded-full bg-pastel-indigo/10 border border-pastel-indigo/20 text-[8px] font-black text-pastel-indigo uppercase tracking-widest hover:bg-pastel-indigo/20 transition-all"
                          >+ Novo</button>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1 content-start">
                          {['Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento', ...customSensations].map(s => (
                            <button 
                              key={s}
                              onClick={() => {
                                const prev = task.energyWorkExecution?.sensations || [];
                                const updated = prev.includes(s) ? prev.filter(t => t !== s) : [...prev, s];
                                onUpdate({
                                  ...task,
                                  energyWorkExecution: {
                                    ...task.energyWorkExecution || { intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 1, signals: '', sensations: [], lucidity: 1, phenomena: [] },
                                    sensations: updated
                                  }
                                });
                              }}
                              className={`px-4 py-2.5 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${
                                (task.energyWorkExecution?.sensations || []).includes(s)
                                  ? 'bg-pastel-indigo text-neutral-black shadow-lg shadow-pastel-indigo/20'
                                  : 'bg-neutral-white/5 text-neutral-white/30 hover:text-neutral-white border border-transparent hover:border-neutral-white/10'
                              }`}
                            >
                              {(task.energyWorkExecution?.sensations || []).includes(s) && <div className="w-1 h-1 rounded-full bg-neutral-black" />}
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fenômenos */}
                      <div className="p-8 bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[3rem] space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-white/30 uppercase tracking-[0.2em]">Ocorrências Fenomenológicas</label>
                          <button 
                            onClick={() => {
                              const name = prompt('Fenômeno observado:');
                              if (name) {
                                const updated = [...customPhenomena, name];
                                setCustomPhenomena(updated);
                                storage.set('energy_work_phenomena', updated);
                              }
                            }}
                            className="px-3 py-1 rounded-full bg-pastel-purple/10 border border-pastel-purple/20 text-[8px] font-black text-pastel-purple uppercase tracking-widest hover:bg-pastel-purple/20 transition-all"
                          >+ Nova</button>
                        </div>
                        <div className="flex flex-wrap gap-2 flex-1 content-start">
                           {['Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania', ...customPhenomena].map(p => (
                             <button 
                               key={p}
                               onClick={() => {
                                 const prev = task.energyWorkExecution?.phenomena || [];
                                 const updated = prev.includes(p) ? prev.filter(t => t !== p) : [...prev, p];
                                 onUpdate({
                                   ...task,
                                   energyWorkExecution: {
                                     ...task.energyWorkExecution || { intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 1, signals: '', sensations: [], lucidity: 1, phenomena: [] },
                                     phenomena: updated
                                   }
                                 });
                               }}
                               className={`px-5 py-3 rounded-[1.25rem] text-[10px] font-black uppercase border transition-all ${
                                 (task.energyWorkExecution?.phenomena || []).includes(p)
                                   ? 'bg-pastel-purple/20 border-pastel-purple/40 text-pastel-purple shadow-lg shadow-pastel-purple/10'
                                   : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20 hover:text-neutral-white/40 hover:border-neutral-white/10'
                               }`}
                             >
                               {p}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>

                    {/* Memorial Section */}
                    <div className="p-8 md:p-10 bg-neutral-white/[0.01] border border-neutral-white/5 rounded-[4rem] space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <label className="text-[12px] font-black text-neutral-white/40 uppercase tracking-[0.4em]">Memorial de Atividade: Laboratório Bioenergético</label>
                          <p className="text-[10px] text-neutral-white/20 italic">Descreva com precisão técnica a parapercepção e fenômenos detectados.</p>
                        </div>
                      </div>
                      <textarea 
                        value={task.energyWorkExecution?.signals || ''}
                        onChange={(e) => onUpdate({
                          ...task,
                          energyWorkExecution: {
                            ...task.energyWorkExecution || { 
                              intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                              symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                            },
                            signals: e.target.value
                          }
                        })}
                        placeholder="Inicie aqui o relato da sua auto-pesquisa técnica. Quais foram os insights e sinaléticas parapsíquicas primordiais desta sessão?"
                        className="w-full bg-transparent border-none rounded-none p-0 text-base md:text-xl text-neutral-white/80 focus:ring-0 transition-all min-h-[250px] resize-none leading-relaxed font-body placeholder:text-neutral-white/5 placeholder:italic custom-scrollbar shadow-none"
                      />
                      <div className="flex justify-end pt-4 border-t border-neutral-white/5">
                        <p className="text-[9px] font-medium text-neutral-white/10 uppercase tracking-widest italic flex items-center gap-2 font-black">
                           SISTEMA DE EVOLUÇÃO CONSCIENCIAL ATIVO
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar (Structure & Reality) */}
            <aside className="w-full lg:w-[450px] border-l border-neutral-white/5 bg-neutral-black/40 p-5 md:p-12 space-y-12">
              
              {/* Subtasks */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Estrutura de Ação</h4>
                  <span className="text-[10px] font-bold text-pastel-indigo">
                    {subtasks.filter(s => s.completed).length}/{subtasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {subtasks.map((sub) => (
                    <button 
                      key={sub.id}
                      onClick={() => {
                        setSubtasks(prev => prev.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s));
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        sub.completed 
                          ? 'bg-pastel-green/5 border-pastel-green/10 text-neutral-white/20' 
                          : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/70 hover:border-neutral-white/20'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        sub.completed ? 'bg-pastel-green border-pastel-green text-neutral-black' : 'border-neutral-white/20'
                      }`}>
                        {sub.completed && <CheckCircle2 size={12} />}
                      </div>
                      <span className={`text-xs font-medium ${sub.completed ? 'line-through' : ''}`}>{sub.text}</span>
                    </button>
                  ))}
                  {subtasks.length === 0 && (
                    <p className="text-[10px] text-neutral-white/20 italic text-center py-4">Sem subtarefas definidas.</p>
                  )}
                </div>
              </div>

              {/* Journal of Evolution (Human Observations) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-pastel-indigo" />
                    <h4 className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Diário de Evolução</h4>
                  </div>
                  <span className="text-[8px] font-medium text-neutral-white/10 italic">Contexto Humano para a IA</span>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-pastel-indigo/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="O que você percebeu durante esta prática? Sentiu alguma mudança interna, clareza ou dificuldade sutil? (A IA usará isso para interpretar sua evolução)"
                    className="relative w-full bg-neutral-white/5 border border-neutral-white/10 rounded-3xl p-6 text-xs text-neutral-white/60 focus:border-pastel-indigo/50 focus:ring-0 transition-all min-h-[180px] resize-none font-body leading-relaxed placeholder:text-neutral-white/10 placeholder:italic"
                  />
                </div>
              </div>

              {/* Reality Capture */}
              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Esforço Real Percebido</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'lower', label: 'Menor', icon: <TrendingUp className="rotate-180" size={14} /> },
                      { id: 'equal', label: 'Igual', icon: <Target size={14} /> },
                      { id: 'higher', label: 'Maior', icon: <TrendingUp size={14} /> }
                    ].map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setRealEffort(e.id as any)}
                        className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${
                          realEffort === e.id 
                            ? 'bg-pastel-indigo/20 border-pastel-indigo/30 text-pastel-indigo' 
                            : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20 hover:bg-neutral-white/10'
                        }`}
                      >
                        {e.icon}
                        <span className="text-[8px] font-bold uppercase tracking-widest">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Bloqueadores / Dificuldades</label>
                  <input 
                    type="text"
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="O que dificultou a fluidez?"
                    className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-xs text-neutral-white/60 focus:border-pastel-pink/50 focus:ring-0"
                  />
                </div>
              </div>

              {/* System Connection (Discreet) */}
              <div className="pt-10 border-t border-neutral-white/5 space-y-4">
                <div className="flex items-center gap-3 text-neutral-white/10">
                  <History size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Contexto Global</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] text-neutral-white/30">
                    <span>Objetivo</span>
                    <span className="text-neutral-white/60">{objectiveTitle}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-white/30">
                    <span>Prioridade</span>
                    <span className="text-pastel-orange uppercase">{task.priority}</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-neutral-white/30">
                    <span>Data Planejada</span>
                    <span className="text-neutral-white/60">{new Date(task.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer Actions (Integrated & Preserved) */}
          <footer className="px-5 md:px-12 py-6 border-t border-neutral-white/5 bg-neutral-black flex flex-col sm:flex-row items-center justify-between gap-4 z-20 flex-shrink-0">
            <div className="flex items-center gap-4 w-full sm:w-auto order-2 sm:order-1">
              <button 
                onClick={() => {
                  if (confirm('Deseja excluir esta tarefa?')) {
                    onDelete?.(task.id);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl bg-neutral-white/5 border border-neutral-white/10 text-neutral-white/20 hover:text-pastel-pink hover:bg-pastel-pink/10 hover:border-pastel-pink/20 transition-all shrink-0"
              >
                <Trash2 size={16} />
              </button>
              <button className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-neutral-white/5 border border-neutral-white/10 text-[9px] font-bold text-neutral-white/40 uppercase tracking-widest hover:text-neutral-white hover:bg-neutral-white/10 transition-all text-center">
                Remarcar
              </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[9px] font-bold text-neutral-white/30 uppercase tracking-widest hover:text-neutral-white hover:bg-neutral-white/5 transition-all text-center"
              >
                Sair sem concluir
              </button>
              <button 
                onClick={handleComplete}
                className={`w-full sm:w-auto px-8 md:px-12 py-4 md:py-4.5 rounded-xl md:rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  status === 'completed'
                    ? 'bg-pastel-green text-neutral-black shadow-pastel-green/20'
                    : 'bg-neutral-white text-neutral-black hover:scale-[1.01] active:scale-[0.99] shadow-neutral-white/10'
                }`}
              >
                <CheckCircle2 size={18} />
                {status === 'completed' ? 'Tarefa Concluída' : 'Concluir Agora'}
              </button>
            </div>
          </footer>

          {/* Post-Execution Intelligence Overlay */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-neutral-black/95 backdrop-blur-2xl flex items-center justify-center p-6 md:p-12"
              >
                <div className="max-w-3xl w-full space-y-12">
                  <div className="text-center space-y-6">
                    <motion.div 
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-pastel-green/20 border border-pastel-green/30 flex items-center justify-center text-pastel-green mx-auto shadow-[0_0_80px_rgba(165,214,167,0.2)]"
                    >
                      <Award size={48} className="md:w-[64px] md:h-[64px]" />
                    </motion.div>
                    <div className="space-y-2">
                      <h2 className="text-4xl md:text-6xl font-headline font-black text-neutral-white tracking-tighter">Missão Cumprida</h2>
                      <p className="text-sm md:text-xl text-neutral-white/40 font-medium italic">"Você avançou na sua meta e manifestou mais um passo da sua visão."</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Insights Block */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <Brain size={18} className="text-pastel-indigo" />
                        <h4 className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Camada de Inteligência</h4>
                      </div>
                      <div className="space-y-4">
                        {insights.map((insight, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className={`p-6 rounded-3xl border flex gap-4 ${
                              insight.severity === 'warning' ? 'bg-pastel-pink/5 border-pastel-pink/10' :
                              insight.severity === 'success' ? 'bg-pastel-green/5 border-pastel-green/10' :
                              'bg-neutral-white/5 border-neutral-white/10'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              insight.severity === 'warning' ? 'bg-pastel-pink/20 text-pastel-pink' :
                              insight.severity === 'success' ? 'bg-pastel-green/20 text-pastel-green' :
                              'bg-pastel-indigo/20 text-pastel-indigo'
                            }`}>
                              {insight.type === 'time' ? <Clock size={16} /> : 
                               insight.type === 'effort' ? <TrendingUp size={16} /> : <Lightbulb size={16} />}
                            </div>
                            <p className="text-xs md:text-sm text-neutral-white/70 leading-relaxed font-medium">
                              {insight.message}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Next Action Block */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <ArrowRight size={18} className="text-pastel-indigo" />
                        <h4 className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Próxima Melhor Ação</h4>
                      </div>
                      {nextAction ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 }}
                          className="p-8 rounded-[2.5rem] bg-neutral-white/5 border border-neutral-white/10 space-y-6 group cursor-pointer hover:border-pastel-indigo/30 transition-all"
                        >
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-pastel-indigo uppercase tracking-widest">Recomendado por Prioridade</span>
                            <h5 className="text-xl md:text-2xl font-bold text-neutral-white group-hover:text-pastel-indigo transition-colors">{nextAction.title}</h5>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><Clock size={12} /> {nextAction.estimatedDuration}</span>
                            <span className="flex items-center gap-2"><Flag size={12} /> {nextAction.priority}</span>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="p-8 rounded-[2.5rem] bg-neutral-white/5 border border-dashed border-neutral-white/10 text-center py-12">
                          <p className="text-xs text-neutral-white/20 font-bold uppercase tracking-widest italic">Nenhuma tarefa pendente recomendada.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center pt-8">
                    <button 
                      onClick={onClose}
                      className="px-16 py-5 rounded-[2rem] bg-neutral-white text-neutral-black font-black text-sm uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                    >
                      Finalizar Fluxo
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
