import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Pause, CheckCircle2, Clock, 
  AlertTriangle, Zap, ArrowRight, Target,
  FileText, MessageSquare, TrendingUp,
  RotateCcw, Calendar, Trash2, ChevronRight,
  Sparkles, History, Info, Flag, Brain,
  Wind,
  Award, Lightbulb, Image as ImageIcon,
  ChevronUp, ChevronDown, Edit2, Shield,
  Plus, Check, Sliders
} from 'lucide-react';
import { TaskData } from './TaskBuilderModal';
import { analyzeTaskExecution, getNextActionSuggestion, ExecutionInsight } from '../services/intelligenceService';
import NativeTimePicker from './NativeTimePicker';
import { storage } from '../lib/storage';
import { energyCatalogService } from '../../../services/energyCatalogService';
import { organismEventBus } from '../../../services/organismEventBus';


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

  const [showEnergyWorkDetails, setShowEnergyWorkDetails] = useState<boolean>(() => {
    const titleLower = (task?.title || '').toLowerCase();
    const hasKeyword = titleLower.includes('mobilização') || 
                      titleLower.includes('energétic') || 
                      titleLower.includes('ev') || 
                      titleLower.includes('vbe') || 
                      titleLower.includes('fatuística') ||
                      titleLower.includes('amparo') ||
                      titleLower.includes('mve') ||
                      titleLower.includes('tenepes');
    return task?.executionType === 'energy-work' || hasKeyword;
  });
  
  // Constants for default lists to synchronize options with Amparo page
  const DEFAULT_SENSATIONS = [
    'Parestesia', 'Calafrio benigno', 'Vassouramento energético', 'Presença amparadora', 
    'Expansibilidade', 'Balonamento', 'Mini-decolagem', 'EV espontâneo', 'Sonoridades intracranianas',
    'Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento'
  ];

  const DEFAULT_PHENOMENA = [
    'Absorção de Energia', 'Exteriorização de Energia', 'Estado Vibracional (EV)', 
    'Projeção Lúcida', 'Clarividência Espontânea', 'Intuição Amparadora', 'Acoplamento Áurico',
    'Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania'
  ];

  const DEFAULT_FATUISTICA = [
    { value: 'ev', label: 'Circularização de Energias (EV)' },
    { value: 'absorcao', label: 'Absorção de Energias' },
    { value: 'exteriorizacao', label: 'Exteriorização Cosmoconstante' },
    { value: 'tenepes', label: 'Pesquisa Assistencial / Equipe' },
    { value: 'consciencia_cosmica', label: 'Consciência Cósmica (Cosmoconsciência)' },
    { value: 'fenomenos_registrados', label: 'Fenômenos Registrados (Autopesquisa)' },
    { value: 'fenomenos_externos', label: 'Fenômenos Externos (Parafatos)' },
    { value: 'desassim', label: 'Desassimilação Simpática (Desassim)' },
    { value: 'projecao_lucida', label: 'Projeção Lúcida (Projeciologia)' },
    { value: 'acoplamento', label: 'Acoplamento Interconsciencial' },
    { value: 'auto_retrocognicao', label: 'Auto-retrocognição (Memória Holosomática)' }
  ];

  // Synchronized unified/custom lists across the application
  const [customSensations, setCustomSensations] = useState<string[]>([]);
  const [customPhenomena, setCustomPhenomena] = useState<string[]>([]);
  const [customFatuistica, setCustomFatuistica] = useState<string[]>([]);

  useEffect(() => {
    energyCatalogService.getCatalog().then(data => {
      setCustomSensations(data.sensations);
      setCustomPhenomena(data.phenomena);
      setCustomFatuistica(data.fatuistica);
    });

    const unsub = organismEventBus.subscribe('energyCatalogUpdated', () => {
      energyCatalogService.getCatalog().then(data => {
        setCustomSensations(data.sensations);
        setCustomPhenomena(data.phenomena);
        setCustomFatuistica(data.fatuistica);
      });
    });
    return () => unsub();
  }, []);

  const sensations = customSensations;
  const phenomena = customPhenomena;
  const fatuisticas = customFatuistica.map((cf, idx) => ({ value: cf, label: cf }));


  // Inline inputs for add operations
  const [newSensationInput, setNewSensationInput] = useState('');
  const [showNewSensationInput, setShowNewSensationInput] = useState(false);

  // Custom non-blocking inline editors for tags in modal
  const [editingSensation, setEditingSensation] = useState<string | null>(null);
  const [editingSensationValue, setEditingSensationValue] = useState<string>('');

  const [editingPhenomenon, setEditingPhenomenon] = useState<string | null>(null);
  const [editingPhenomenonValue, setEditingPhenomenonValue] = useState<string>('');

  const [editingFatuistica, setEditingFatuistica] = useState<string | null>(null);
  const [editingFatuisticaValue, setEditingFatuisticaValue] = useState<string>('');

  const [newPhenomenonInput, setNewPhenomenonInput] = useState('');
  const [showNewPhenomenonInput, setShowNewPhenomenonInput] = useState(false);

  const [newFatuisticaInput, setNewFatuisticaInput] = useState('');
  const [showNewFatuisticaInput, setShowNewFatuisticaInput] = useState(false);

  const [showSidebar, setShowSidebar] = useState(false);
  const [isGlobalEditActive, setIsGlobalEditActive] = useState(false);

  // CRUD handlers matching AmparoPage with total parity and universal intelligence
  const addCustomSensation = () => {
    const val = newSensationInput.trim();
    if (val && !customSensations.includes(val)) {
      const updated = [...customSensations, val];
      setCustomSensations(updated);
      energyCatalogService.updateCatalog('sensations', updated);

      // Auto select the newly added sensation
      const prevSensations = task.energyWorkExecution?.sensations || [];
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          sensations: Array.from(new Set([...prevSensations, val]))
        }
      });

      setNewSensationInput('');
      setShowNewSensationInput(false);
    }
  };

  const handleEditSensation = (oldValue: string) => {
    setEditingSensation(oldValue);
    setEditingSensationValue(oldValue);
  };

  const handleSaveSensation = (oldValue: string, newValue: string) => {
    const trimmed = newValue.trim();
    if (trimmed && trimmed !== oldValue) {
      const updated = customSensations.map(s => s === oldValue ? trimmed : s);
      setCustomSensations(updated);
      energyCatalogService.updateCatalog('sensations', updated);

      const activeSensations = task.energyWorkExecution?.sensations || [];
      if (activeSensations.includes(oldValue)) {
        onUpdate({
          ...task,
          energyWorkExecution: {
            ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
            sensations: activeSensations.map(s => s === oldValue ? trimmed : s)
          }
        });
      }
    }
    setEditingSensation(null);
  };

  const handleDeleteSensation = (value: string) => {
    const updated = customSensations.filter(s => s !== value);
    setCustomSensations(updated);
    energyCatalogService.updateCatalog('sensations', updated);

    const activeSensations = task.energyWorkExecution?.sensations || [];
    if (activeSensations.includes(value)) {
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          sensations: activeSensations.filter(s => s !== value)
        }
      });
    }
  };

  const addCustomPhenomenon = () => {
    const val = newPhenomenonInput.trim();
    if (val && !customPhenomena.includes(val)) {
      const updated = [...customPhenomena, val];
      setCustomPhenomena(updated);
      energyCatalogService.updateCatalog('phenomena', updated);

      // Auto select the newly added phenomenon
      const prevPhenomena = task.energyWorkExecution?.phenomena || [];
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          phenomena: Array.from(new Set([...prevPhenomena, val]))
        }
      });

      setNewPhenomenonInput('');
      setShowNewPhenomenonInput(false);
    }
  };

  const handleEditPhenomenon = (oldValue: string) => {
    setEditingPhenomenon(oldValue);
    setEditingPhenomenonValue(oldValue);
  };

  const handleSavePhenomenon = (oldValue: string, newValue: string) => {
    const trimmed = newValue.trim();
    if (trimmed && trimmed !== oldValue) {
      const updated = customPhenomena.map(s => s === oldValue ? trimmed : s);
      setCustomPhenomena(updated);
      energyCatalogService.updateCatalog('phenomena', updated);

      const activePhenomena = task.energyWorkExecution?.phenomena || [];
      if (activePhenomena.includes(oldValue)) {
        onUpdate({
          ...task,
          energyWorkExecution: {
            ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
            phenomena: activePhenomena.map(s => s === oldValue ? trimmed : s)
          }
        });
      }
    }
    setEditingPhenomenon(null);
  };

  const handleDeletePhenomenon = (value: string) => {
    const updated = customPhenomena.filter(s => s !== value);
    setCustomPhenomena(updated);
    energyCatalogService.updateCatalog('phenomena', updated);

    const activePhenomena = task.energyWorkExecution?.phenomena || [];
    if (activePhenomena.includes(value)) {
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          phenomena: activePhenomena.filter(s => s !== value)
        }
      });
    }
  };

  const addCustomFatuistica = () => {
    const trimmed = newFatuisticaInput.trim();
    if (trimmed && !customFatuistica.some(cf => cf.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...customFatuistica, trimmed];
      setCustomFatuistica(updated);
      energyCatalogService.updateCatalog('fatuistica', updated);
      
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          technique: trimmed as any
        }
      });
      setNewFatuisticaInput('');
      setShowNewFatuisticaInput(false);
    }
  };

  const handleEditFatuistica = (oldValue: string) => {
    setEditingFatuistica(oldValue);
    setEditingFatuisticaValue(oldValue);
  };

  const handleSaveFatuistica = (oldValue: string, newValue: string) => {
    const trimmed = newValue.trim();
    if (trimmed && trimmed !== oldValue) {
      const updated = customFatuistica.map(s => s === oldValue ? trimmed : s);
      setCustomFatuistica(updated);
      energyCatalogService.updateCatalog('fatuistica', updated);

      const activeTechnique = task.energyWorkExecution?.technique || 'ev';
      if (activeTechnique === oldValue) {
        onUpdate({
          ...task,
          energyWorkExecution: {
            ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
            technique: trimmed as any
          }
        });
      }
    }
    setEditingFatuistica(null);
  };

  const handleDeleteFatuistica = (value: string) => {
    const updated = customFatuistica.filter(s => s !== value);
    setCustomFatuistica(updated);
    energyCatalogService.updateCatalog('fatuistica', updated);

    const activeTechnique = task.energyWorkExecution?.technique || 'ev';
    if (activeTechnique === value) {
      onUpdate({
        ...task,
        energyWorkExecution: {
          ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
          technique: 'ev'
        }
      });
    }
  };


  const hasInitializedRef = useRef(false);
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Scroll back to top when showing the task completed feedback overlay
  useEffect(() => {
    if (showFeedback) {
      if (modalContainerRef.current) {
        modalContainerRef.current.scrollTop = 0;
      }
      if (contentContainerRef.current) {
        contentContainerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);

      const timer = setTimeout(() => {
        if (modalContainerRef.current) {
          modalContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (contentContainerRef.current) {
          contentContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

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
        <div className="absolute inset-0 bg-neutral-black/40 dark:bg-black/80 backdrop-blur-md" onClick={onClose} />

        {/* Modal Content */}
        <motion.div
          ref={modalContainerRef}
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 40 }}
          className="relative w-full max-w-full md:max-w-[90%] h-full md:h-auto md:max-h-[90vh] bg-neutral-black md:border border-neutral-white/10 rounded-none md:rounded-[3rem] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_120px_rgba(0,0,0,0.6)] overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar"
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
              status === 'in-progress' && showEnergyWorkDetails ? 'bg-indigo-600/20' : 'bg-pastel-indigo/5'
            }`} />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-white/[0.01] to-transparent pointer-events-none" />
            
            <div className="space-y-2 flex-1 relative z-10">
              <div className="flex items-center flex-wrap gap-2 md:gap-3 text-neutral-white/60">
                <Target size={10} className="text-pastel-indigo flex-shrink-0" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] truncate max-w-[150px] md:max-w-xs">{objectiveTitle}</span>
                <ChevronRight size={10} className="flex-shrink-0" />
                <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] text-pastel-indigo truncate max-w-[150px] md:max-w-xs">{metaIntention || 'Estratégia'}</span>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl md:text-4xl font-headline font-bold text-neutral-white tracking-tight leading-tight break-words">
                  {task.title}
                </h1>
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-1 h-1 rounded-full bg-pastel-green" 
                  />
                  <p className="text-xs md:text-sm text-neutral-white/60 font-medium italic">
                    Evolução Esperada: <span className="text-neutral-white">{task.evolucaoEsperada || 'Conclusão da tarefa'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                status === 'completed' ? 'bg-pastel-green/20 border-pastel-green/40 text-pastel-green' :
                status === 'in-progress' ? 'bg-pastel-indigo/20 border-pastel-indigo/40 text-pastel-indigo' :
                status === 'paused' ? 'bg-pastel-yellow/20 border-pastel-yellow/40 text-pastel-yellow' :
                status === 'blocked' ? 'bg-pastel-pink/20 border-pastel-pink/40 text-pastel-pink' :
                'bg-neutral-white/10 border-neutral-white/20 text-neutral-white/70'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  status === 'completed' ? 'bg-pastel-green' :
                  status === 'in-progress' ? 'bg-pastel-indigo animate-ping' :
                  status === 'paused' ? 'bg-pastel-yellow' :
                  status === 'blocked' ? 'bg-pastel-pink' :
                  'bg-neutral-white/40'
                }`} />
                {status === 'pending' ? 'Pendente' : 
                 status === 'in-progress' ? 'Em Execução' : 
                 status === 'paused' ? 'Pausada' : 
                 status === 'completed' ? 'Concluída' : 'Bloqueada'}
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-neutral-white/10 border border-neutral-white/20 flex items-center justify-center text-neutral-white/70 hover:text-neutral-white hover:bg-neutral-white/20 transition-all group"
              >
                <X size={20} className="md:w-[28px] md:h-[28px] group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </header>

          <div ref={contentContainerRef} className="flex-1 flex flex-col lg:flex-row md:overflow-y-auto custom-scrollbar">
            {/* Main Content Area */}
            <div className="flex-1 px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-10">
              
              {/* 1. Timer Central (Cockpit) */}
              <motion.div 
                animate={status === 'in-progress' ? { 
                  boxShadow: ['0 0 30px rgba(197,202,233,0.03)', '0 0 50px rgba(197,202,233,0.1)', '0 0 30px rgba(197,202,233,0.03)'] 
                } : {}}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-6 sm:py-8 md:py-10 bg-neutral-white/[0.03] border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-pastel-indigo/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="text-center space-y-3 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'in-progress' ? 'bg-indigo-400 animate-pulse' : 'bg-neutral-white/30'}`} />
                    <p className="text-[10px] font-bold text-neutral-white/70 uppercase tracking-[0.2em]">Tempo de Execução Real</p>
                  </div>
                  <div className={`text-5xl md:text-7xl font-headline font-black tracking-tighter tabular-nums transition-all duration-700 ${status === 'in-progress' ? 'text-neutral-white text-shadow-glow' : 'text-neutral-white/70'}`}>
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
                      className="w-10 h-10 rounded-full bg-neutral-white/10 border border-neutral-white/20 flex items-center justify-center text-neutral-white/75 hover:text-neutral-white hover:bg-neutral-white/20 transition-all"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <div className="relative group">
                      <button 
                        onClick={() => setIsManualTimePickerOpen(true)}
                        className="w-10 h-10 rounded-full bg-neutral-white/10 border border-neutral-white/20 flex items-center justify-center text-neutral-white/75 hover:text-neutral-white hover:bg-neutral-white/20 transition-all"
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
                <div className="w-full max-w-md px-4 sm:px-10 space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-neutral-white/60 font-mono">Estimado: {task.estimatedDuration || 'N/A'}</span>
                    <span className={`${elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 ? 'text-pastel-pink' : 'text-pastel-green'}`}>
                      {elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 
                        ? `+${Math.round(((elapsedSeconds - estimatedSeconds) / estimatedSeconds) * 100)}% do tempo` 
                        : 'Dentro do prazo'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(timeProgress, 100)}%` }}
                      className={`h-full transition-colors duration-500 ${
                        elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 ? 'bg-pastel-pink' : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                  {elapsedSeconds > estimatedSeconds && estimatedSeconds > 0 && (
                    <motion.p 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[9px] text-pastel-pink font-bold uppercase tracking-wider text-center"
                    >
                      Você já ultrapassou o tempo estimado. Mantenha o foco para concluir.
                    </motion.p>
                  )}
                </div>
              </motion.div>

               {/* 2. Strategy (Canvas) */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-pastel-purple/15 flex items-center justify-center text-pastel-purple">
                    <Zap size={16} />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-white">Estratégia de Execução</h3>
                </div>
                <div className="p-5 sm:p-7 md:p-10 bg-neutral-white/[0.03] border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] relative group">
                  <div className="absolute top-6 right-8 opacity-10">
                    <Sparkles size={24} />
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-sm md:text-lg text-neutral-white/85 leading-relaxed whitespace-pre-wrap font-body">
                      {task.executionStrategy || 'Nenhuma estratégia detalhada para esta tarefa.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Status Dynamic Selector */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                {[
                  { id: 'pending', label: 'Pendente', color: 'bg-neutral-white/15 text-neutral-white/90 border-neutral-white/35' },
                  { id: 'in-progress', label: 'Executando', color: 'bg-indigo-600/20 text-indigo-400 border-indigo-600/40 font-black' },
                  { id: 'paused', label: 'Pausada', color: 'bg-pastel-yellow/20 text-pastel-yellow border-pastel-yellow/40' },
                  { id: 'completed', label: 'Concluída', color: 'bg-pastel-green/20 text-pastel-green border-pastel-green/45' },
                  { id: 'blocked', label: 'Bloqueada', color: 'bg-pastel-pink/20 text-pastel-pink border-pastel-pink/40' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStatus(s.id as any)}
                    className={`px-2 py-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${
                      status === s.id ? s.color : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/60 hover:bg-neutral-white/10 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* 3.1 Toggle Button for Parapsychic Record */}
              <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center bg-zinc-900/40 border border-neutral-white/10 p-4 sm:p-5 rounded-2xl md:rounded-3xl gap-4">
                <div className="flex items-center gap-3">
                  <Wind size={20} className="text-zinc-400 flex-shrink-0" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-black text-neutral-white uppercase tracking-wider">Fatuística & Parapercepções</p>
                      {showEnergyWorkDetails && (
                        <button
                          type="button"
                          onClick={() => setIsGlobalEditActive(!isGlobalEditActive)}
                          className={`p-1 rounded transition-all flex items-center justify-center shrink-0 border-none bg-transparent outline-none cursor-pointer ${
                            isGlobalEditActive 
                              ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                              : 'text-zinc-500 hover:text-white'
                          }`}
                          title="Alternar Modo de Edições de Itens"
                        >
                          <Sliders size={14} className="stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400">Deseja registrar o Volume Bioenergético (VBE), técnica e percepções para esta sessão?</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEnergyWorkDetails(prev => !prev)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      showEnergyWorkDetails 
                        ? 'bg-zinc-700 text-white border border-zinc-500 shadow-lg shadow-zinc-800/10' 
                        : 'bg-neutral-white/10 border border-neutral-white/20 text-neutral-white/70 hover:text-white hover:bg-neutral-white/15'
                    }`}
                  >
                    {showEnergyWorkDetails ? 'Registrar Ativado' : 'Ativar Registro'}
                  </button>
                </div>
              </div>

              {/* 3.1 Energy Work Analysis (Conscienciologia) */}
              {showEnergyWorkDetails && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 p-5 md:p-10 bg-pastel-indigo/[0.03] border border-pastel-indigo/10 rounded-3xl md:rounded-[2.5rem] relative overflow-hidden"
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
                      <Shield size={18} className={`text-indigo-400 ${status === 'in-progress' ? 'animate-pulse' : ''}`} />
                      <h4 className="text-sm font-bold uppercase tracking-widest text-[#f4f4f5]">Fatuística & Parapercepções</h4>
                    </div>
                    <div className="px-3 py-1 bg-zinc-800/40 rounded-lg border border-neutral-white/10 text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                      Registro de EV / Técnica
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Paraperceptual Metrics (Left Column) */}
                    <div className="space-y-6">
                      {/* VBE Slider */}
                      <div className="space-y-3 bg-zinc-900/40 border border-neutral-white/10 p-4 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold text-neutral-white/90 uppercase tracking-widest">Volume Bioenergético (VBE)</span>
                          <span className="px-2.5 py-1 bg-zinc-700 text-white rounded-md text-[10px] font-black shadow-lg shadow-zinc-800/10">
                            {task.energyWorkExecution?.intensity || 5}/10
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={task.energyWorkExecution?.intensity ?? 5} 
                          onChange={(e) => onUpdate({
                            ...task,
                            energyWorkExecution: { 
                              ...task.energyWorkExecution || { 
                                intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                symmetry: 3, signals: '', lucidity: 3, sensations: [], phenomena: []
                              },
                              intensity: parseInt(e.target.value, 10)
                            }
                          })}
                          className="w-full h-2 bg-neutral-white/10 rounded-full appearance-none accent-zinc-550 cursor-pointer" 
                        />
                        <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-widest text-zinc-400 font-semibold">
                          <span>Linfático (Baixo)</span>
                          <span>Tsunami Energético</span>
                        </div>
                      </div>

                      {/* Symmetry & Lucidity in a grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Equilibração Bilateral */}
                        <div className="space-y-3 bg-zinc-900/40 border border-neutral-white/10 p-3 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-extrabold text-neutral-white/90 uppercase tracking-widest truncate">Equilíbrio</span>
                            <span className="text-zinc-400 font-mono text-xs font-black">{task.energyWorkExecution?.symmetry || 3}/5</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={task.energyWorkExecution?.symmetry ?? 3} 
                            onChange={(e) => onUpdate({
                              ...task,
                              energyWorkExecution: { 
                                ...task.energyWorkExecution || { 
                                  intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                  symmetry: 3, signals: '', lucidity: 3, sensations: [], phenomena: []
                                },
                                symmetry: parseInt(e.target.value, 10)
                              }
                            })}
                            className="w-full h-1.5 bg-neutral-white/10 rounded-full appearance-none accent-zinc-500 cursor-pointer" 
                          />
                        </div>

                        {/* Fator de Hiperlucidez */}
                        <div className="space-y-3 bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-extrabold text-neutral-white/90 uppercase tracking-widest truncate">Hiperlucidez</span>
                            <span className="text-emerald-400 font-mono text-xs font-black">{task.energyWorkExecution?.lucidity || 3}/5</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            value={task.energyWorkExecution?.lucidity ?? 3} 
                            onChange={(e) => onUpdate({
                              ...task,
                              energyWorkExecution: { 
                                ...task.energyWorkExecution || { 
                                  intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                  symmetry: 0, signals: '', lucidity: 3, sensations: [], phenomena: []
                                },
                                lucidity: parseInt(e.target.value, 10)
                              }
                            })}
                            className="w-full h-1.5 bg-neutral-white/10 rounded-full appearance-none accent-emerald-400 cursor-pointer" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fatuística Técnica selector (Right Column) */}
                    <div className="space-y-4 bg-zinc-900/40 border border-neutral-white/10 p-4 rounded-xl flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-[#13151c] p-1.5 rounded-lg border border-neutral-white/5 gap-2">
                          <label className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest font-mono">Fatuística Tática</label>
                          {!showNewFatuisticaInput ? (
                            <button 
                              type="button"
                              onClick={() => setShowNewFatuisticaInput(true)}
                              className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 uppercase tracking-wider bg-transparent border-none cursor-pointer"
                            >
                              + Mais
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-md p-0.5">
                              <input 
                                type="text"
                                placeholder="Nova tática"
                                value={newFatuisticaInput}
                                onChange={(e) => setNewFatuisticaInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomFatuistica();
                                  }
                                }}
                                className="bg-transparent outline-none text-[8px] px-1 text-white max-w-[80px]"
                              />
                              <button 
                                type="button"
                                onClick={addCustomFatuistica}
                                className="p-0.5 bg-zinc-700 text-white hover:bg-zinc-650 rounded transition-colors"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setShowNewFatuisticaInput(false);
                                  setNewFatuisticaInput('');
                                }}
                                className="p-0.5 text-zinc-500 hover:text-red-450"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="relative group/sel">
                          <select 
                            value={task.energyWorkExecution?.technique || 'ev'}
                            onChange={(e) => onUpdate({
                              ...task,
                              energyWorkExecution: {
                                ...task.energyWorkExecution || { 
                                   intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                   symmetry: 3, signals: '', lucidity: 3, sensations: [], phenomena: []
                                 },
                                technique: e.target.value as any
                              }
                            })}
                            className="w-full p-3 pr-10 rounded-xl border border-neutral-white/10 outline-none text-xs font-bold transition-all bg-[#121420] text-white focus:border-indigo-500 appearance-none cursor-pointer"
                          >
                            {fatuisticas.map(opt => (
                              <option key={opt.value} value={opt.value} className="bg-neutral-black text-white">{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
                        </div>
                      </div>

                      {fatuisticas.length > 0 && (
                        <div className="horizontal-flow-4-rows pt-1 pr-1">
                          {fatuisticas.map(cf => {
                            const isSelected = (task.energyWorkExecution?.technique || 'ev') === cf.value;
                            const isEditing = editingFatuistica === cf.value;
                            return isEditing ? (
                              <div key={cf.value} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner">
                                <input 
                                  type="text"
                                  value={editingFatuisticaValue}
                                  onChange={(e) => setEditingFatuisticaValue(e.target.value)}
                                  className="bg-transparent outline-none text-[9px] px-2 py-1 text-white flex-1 min-w-0 border-none font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveFatuistica(cf.value, editingFatuisticaValue);
                                    if (e.key === 'Escape') setEditingFatuistica(null);
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleSaveFatuistica(cf.value, editingFatuisticaValue)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center border-none cursor-pointer"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingFatuistica(null)}
                                  className="p-1 text-zinc-500 hover:text-red-450 flex items-center justify-center border-none cursor-pointer bg-transparent"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <div key={cf.value} className="flex items-center gap-1 bg-neutral-white/[0.01] p-0.5 rounded-lg">
                                <span 
                                  onClick={() => onUpdate({
                                    ...task,
                                    energyWorkExecution: {
                                      ...task.energyWorkExecution || { 
                                         intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                                         symmetry: 3, signals: '', lucidity: 3, sensations: [], phenomena: []
                                      },
                                      technique: cf.value as any
                                    }
                                  })}
                                  className={`px-2.5 py-1.5 rounded-lg text-[8.5px] border transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-zinc-700 border-zinc-500 text-white font-black shadow-md shadow-zinc-800/20'
                                      : 'bg-neutral-white/5 border border-neutral-white/10 text-neutral-white/60 hover:text-white'
                                  }`}
                                >
                                  {cf.label}
                                </span>
                                {isGlobalEditActive && (
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditFatuistica(cf.value);
                                      }}
                                      className="p-1 hover:bg-neutral-white/15 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFatuistica(cf.value);
                                      }}
                                      className="p-1 hover:bg-red-500/15 rounded text-red-450 hover:text-red-300 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                                      title="Excluir"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Impacto Holossomático */}
                    <div className="space-y-4 bg-neutral-white/[0.02] border border-neutral-white/10 p-4 rounded-xl relative z-10">
                      <label className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Impacto Holossomático</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: 'energy', label: 'Energético', color: 'pastel-indigo' },
                          { id: 'physical', label: 'Físico (Soma)', color: 'pastel-green' },
                          { id: 'emotional', label: 'Emocional', color: 'pastel-pink' },
                          { id: 'mental', label: 'Mental', color: 'pastel-purple' }
                        ].map((dim) => (
                          <div key={dim.id} className="space-y-2 bg-neutral-white/[0.02] border border-neutral-white/5 p-2 rounded-lg">
                            <div className="flex justify-between items-center px-1">
                              <span className="text-[9px] font-bold text-neutral-white/80 uppercase tracking-tight">{dim.label}</span>
                              <span className={`text-[10px] font-black text-${dim.color}`}>{task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0}/5</span>
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
                                  className={`h-2 flex-1 rounded-full transition-all ${
                                    (task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0) >= level
                                      ? `bg-${dim.color} shadow-sm`
                                      : 'bg-neutral-white/10 hover:bg-neutral-white/20'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* Sensações e Fenômenos (Bioenergetic Registry) */}
                  <div className="space-y-6 pt-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Sensações / Sinalética */}
                      <div className="p-4 sm:p-6 bg-neutral-white/[0.03] border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] space-y-4 flex flex-col">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-white/85 uppercase tracking-[0.2em]">Sinalética Bioenergética</label>
                          {!showNewSensationInput ? (
                            <button 
                              type="button"
                              onClick={() => setShowNewSensationInput(true)}
                              className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[8px] font-black text-teal-400 uppercase tracking-widest hover:bg-teal-500/20 transition-all border-none cursor-pointer border-transparent"
                            >+ Novo</button>
                          ) : (
                            <div className="flex items-center gap-1 bg-[#12131a] border border-neutral-white/15 rounded-md p-0.5">
                              <input 
                                type="text"
                                placeholder="Nova sinalética"
                                value={newSensationInput}
                                onChange={(e) => setNewSensationInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomSensation();
                                  }
                                }}
                                className="bg-transparent outline-none text-[8px] px-1 text-white max-w-[100px]"
                              />
                              <button 
                                type="button"
                                onClick={addCustomSensation}
                                className="p-0.5 bg-teal-500 text-black hover:bg-teal-400 rounded transition-colors"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setShowNewSensationInput(false);
                                  setNewSensationInput('');
                                }}
                                className="p-0.5 text-zinc-500 hover:text-red-450"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="horizontal-flow-4-rows flex-1">
                          {sensations.map(s => {
                            const isSelected = (task.energyWorkExecution?.sensations || []).includes(s);
                            const isEditing = editingSensation === s;
                            return isEditing ? (
                              <div key={s} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner">
                                <input 
                                  type="text"
                                  value={editingSensationValue}
                                  onChange={(e) => setEditingSensationValue(e.target.value)}
                                  className="bg-transparent outline-none text-[8.5px] sm:text-[9.5px] px-2 py-1 text-white max-w-[110px] font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveSensation(s, editingSensationValue);
                                    if (e.key === 'Escape') setEditingSensation(null);
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleSaveSensation(s, editingSensationValue)}
                                  className="p-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded flex items-center justify-center border-none cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingSensation(null)}
                                  className="p-1 text-zinc-500 hover:text-red-450 flex items-center justify-center border-none cursor-pointer bg-transparent"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div key={s} className="flex items-center gap-1 bg-neutral-white/[0.01] p-0.5 rounded-xl transition-all">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const prev = task.energyWorkExecution?.sensations || [];
                                    const updated = prev.includes(s) ? prev.filter(t => t !== s) : [...prev, s];
                                    onUpdate({
                                      ...task,
                                      energyWorkExecution: {
                                        ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
                                        sensations: updated
                                      }
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[8.5px] sm:text-[9.5px] font-black uppercase transition-all flex items-center gap-1 border cursor-pointer min-h-[30px] ${
                                    isSelected
                                      ? 'bg-zinc-700 border-zinc-500 text-white shadow-lg shadow-zinc-800/20'
                                      : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/70 hover:text-white hover:border-neutral-white/20'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                  {s}
                                </button>
                                {isGlobalEditActive && (
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditSensation(s);
                                      }}
                                      className="p-1 hover:bg-neutral-white/10 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSensation(s);
                                      }}
                                      className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-350 rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Excluir"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fenômenos */}
                      <div className="p-4 sm:p-6 bg-neutral-white/[0.03] border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] space-y-4 flex flex-col">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-neutral-white/85 uppercase tracking-[0.2em]">Ocorrências Fenomenológicas</label>
                          {!showNewPhenomenonInput ? (
                            <button 
                              type="button"
                              onClick={() => setShowNewPhenomenonInput(true)}
                              className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8.5px] font-black text-indigo-400 uppercase tracking-widest hover:bg-indigo-500/20 transition-all border-none cursor-pointer border-transparent"
                            >+ Nova</button>
                          ) : (
                            <div className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/15 rounded-md p-0.5">
                              <input 
                                type="text"
                                placeholder="Novo fenômeno"
                                value={newPhenomenonInput}
                                onChange={(e) => setNewPhenomenonInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addCustomPhenomenon();
                                  }
                                }}
                                className="bg-transparent outline-none text-[8px] px-1 text-white max-w-[100px]"
                              />
                              <button 
                                type="button"
                                onClick={addCustomPhenomenon}
                                className="p-0.5 bg-zinc-700 hover:bg-zinc-650 text-white rounded"
                              >
                                <Check className="w-2.5 h-2.5" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                  setShowNewPhenomenonInput(false);
                                  setNewPhenomenonInput('');
                                }}
                                className="p-0.5 text-zinc-500 hover:text-red-450"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="horizontal-flow-4-rows flex-1">
                          {phenomena.map(p => {
                            const isSelected = (task.energyWorkExecution?.phenomena || []).includes(p);
                            const isEditing = editingPhenomenon === p;
                            return isEditing ? (
                              <div key={p} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner">
                                <input 
                                  type="text"
                                  value={editingPhenomenonValue}
                                  onChange={(e) => setEditingPhenomenonValue(e.target.value)}
                                  className="bg-transparent outline-none text-[8.5px] sm:text-[9.5px] px-2 py-1 text-white max-w-[110px] font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePhenomenon(p, editingPhenomenonValue);
                                    if (e.key === 'Escape') setEditingPhenomenon(null);
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleSavePhenomenon(p, editingPhenomenonValue)}
                                  className="p-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded flex items-center justify-center border-none cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingPhenomenon(null)}
                                  className="p-1 text-zinc-500 hover:text-red-450 flex items-center justify-center border-none cursor-pointer bg-transparent"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div key={p} className="flex items-center gap-1 bg-neutral-white/[0.01] p-0.5 rounded-xl transition-all">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const prev = task.energyWorkExecution?.phenomena || [];
                                    const updated = prev.includes(p) ? prev.filter(t => t !== p) : [...prev, p];
                                    onUpdate({
                                      ...task,
                                      energyWorkExecution: {
                                        ...task.energyWorkExecution || { intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 3, signals: '', sensations: [], lucidity: 3, phenomena: [] },
                                        phenomena: updated
                                      }
                                    });
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[8.5px] sm:text-[9.5px] font-black uppercase border transition-all cursor-pointer min-h-[30px] ${
                                    isSelected
                                      ? 'bg-zinc-700 border-zinc-500 text-white shadow-lg shadow-zinc-800/20'
                                      : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/70 hover:text-white hover:border-neutral-white/20'
                                  }`}
                                >
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                  {p}
                                </button>
                                {isGlobalEditActive && (
                                  <div className="flex items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPhenomenon(p);
                                      }}
                                      className="p-1 hover:bg-neutral-white/10 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePhenomenon(p);
                                      }}
                                      className="p-1 hover:bg-red-500/10 text-red-400 hover:text-red-350 rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Excluir"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Memorial Section */}
                    <div className="p-4 sm:p-6 md:p-10 bg-neutral-white/[0.03] border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] sm:text-[12px] font-black text-neutral-white/85 uppercase tracking-[0.2em]">Memorial de Atividade: Laboratório Bioenergético</label>
                          <p className="text-[10px] text-neutral-white/55 italic">Descreva com precisão técnica a parapercepção e fenômenos detectados.</p>
                        </div>
                      </div>
                      <textarea 
                        value={task.energyWorkExecution?.signals || ''}
                        onChange={(e) => onUpdate({
                          ...task,
                          energyWorkExecution: {
                            ...task.energyWorkExecution || { 
                              intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 },
                              symmetry: 3, signals: '', lucidity: 3, sensations: [], phenomena: []
                            },
                            signals: e.target.value
                          }
                        })}
                        placeholder="Inicie aqui o relato da sua auto-pesquisa técnica. Quais foram os insights e sinaléticas parapsíquicas primordiais desta sessão?"
                        className="w-full bg-transparent border-none rounded-none p-0 text-sm md:text-lg text-neutral-white/90 focus:ring-0 transition-all min-h-[140px] md:min-h-[220px] resize-none leading-relaxed font-body placeholder:text-neutral-white/30 placeholder:italic custom-scrollbar shadow-none"
                      />
                      <div className="flex justify-end pt-4 border-t border-neutral-white/10">
                        <p className="text-[9px] font-bold text-neutral-white/40 uppercase tracking-widest italic flex items-center gap-2 font-black">
                           SISTEMA DE EVOLUÇÃO CONSCIENCIAL ATIVO
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar (Structure & Reality) */}
            <aside className="w-full lg:w-[450px] lg:flex-shrink-0 border-l border-neutral-white/5 bg-neutral-black/40 flex flex-col">
              <div className="p-4 sm:p-5 border-b border-neutral-white/10 flex lg:hidden items-center justify-between bg-neutral-white/10 cursor-pointer" onClick={() => setShowSidebar(!showSidebar)}>
                <h4 className="text-[10px] font-black text-neutral-white/90 uppercase tracking-widest">Painel de Controle</h4>
                <button className="text-neutral-white/80 bg-transparent border-none">
                  {showSidebar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <div className={`p-4 sm:p-8 md:p-12 space-y-8 sm:space-y-12 flex-1 overflow-y-auto custom-scrollbar ${showSidebar ? 'block' : 'hidden lg:block'}`}>
                
                {/* Subtasks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-neutral-white/75 uppercase tracking-widest">Estrutura de Ação</h4>
                    <span className="text-[10px] font-black text-indigo-400">
                      {subtasks.filter(s => s.completed).length}/{subtasks.length}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {subtasks.map((sub) => (
                      <button 
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSubtasks(prev => prev.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s));
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                          sub.completed 
                            ? 'bg-[#10b981]/10 border-[#10b981]/25 text-neutral-white/50' 
                            : 'bg-neutral-white/5 border border-neutral-white/10 text-neutral-white hover:border-neutral-white/25'
                        }`}
                      >
                        <div className={`w-4 h-4 flex-shrink-0 rounded border flex items-center justify-center transition-all ${
                          sub.completed ? 'bg-[#10b981] border-[#10b981] text-neutral-black' : 'border-neutral-white/30'
                        }`}>
                          {sub.completed && <CheckCircle2 size={10} />}
                        </div>
                        <span className={`text-xs font-semibold break-words min-w-0 ${sub.completed ? 'line-through' : ''}`}>{sub.text}</span>
                      </button>
                    ))}
                    {subtasks.length === 0 && (
                      <p className="text-[10px] text-neutral-white/50 italic text-center py-4">Sem subtarefas definidas.</p>
                    )}
                  </div>
                </div>

                {/* Reality Capture */}
                <div className="space-y-6 pt-2">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/75 uppercase tracking-widest">Esforço Real Percebido</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'lower', label: 'Menor', icon: <TrendingUp className="rotate-180" size={14} /> },
                        { id: 'equal', label: 'Igual', icon: <Target size={14} /> },
                        { id: 'higher', label: 'Maior', icon: <TrendingUp size={14} /> }
                      ].map((e) => (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => setRealEffort(e.id as any)}
                          className={`flex flex-col items-center justify-center gap-2 py-3.5 rounded-xl border transition-all cursor-pointer ${
                            realEffort === e.id 
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                              : 'bg-neutral-white/5 border border-neutral-white/10 text-neutral-white/70 hover:bg-neutral-white/10 hover:text-white'
                          }`}
                        >
                          {e.icon}
                          <span className="text-[8px] font-bold uppercase tracking-widest">{e.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/75 uppercase tracking-widest">Bloqueadores / Dificuldades</label>
                    <input 
                      type="text"
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      placeholder="O que dificultou a fluidez?"
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-4 py-3 text-xs text-neutral-white placeholder:text-neutral-white/30 focus:border-indigo-500/50 focus:ring-0 transition-all"
                    />
                  </div>
                </div>

                {/* System Connection (Discreet) */}
                <div className="pt-6 border-t border-neutral-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-neutral-white/45">
                    <History size={12} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Contexto Global</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-neutral-white/60">
                      <span>Objetivo</span>
                      <span className="text-white font-semibold">{objectiveTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-white/60">
                      <span>Prioridade</span>
                      <span className="text-pastel-orange uppercase font-bold">{task.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-white/60">
                      <span>Data Planejada</span>
                      <span className="text-white font-semibold">{new Date(task.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer Actions (Integrated & Preserved) */}
          <footer className="px-5 md:px-12 py-5 border-t border-neutral-white/5 bg-neutral-black flex flex-col sm:flex-row items-center justify-between gap-4 z-20 flex-shrink-0">
            <div className="flex items-center gap-4 w-full sm:w-auto order-2 sm:order-1">
              <button 
                onClick={() => {
                  if (confirm('Deseja excluir esta tarefa?')) {
                    onDelete?.(task.id);
                    onClose();
                  }
                }}
                className="p-3.5 rounded-xl bg-neutral-white/5 border border-neutral-white/10 text-neutral-white/50 hover:text-pastel-pink hover:bg-pastel-pink/10 hover:border-pastel-pink/20 transition-all shrink-0 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-neutral-white/5 border border-neutral-white/10 text-[9px] font-bold text-neutral-white/70 uppercase tracking-widest hover:text-white hover:bg-neutral-white/10 transition-all text-center">
                Remarcar
              </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-[9px] font-bold text-neutral-white/65 uppercase tracking-widest hover:text-white hover:bg-neutral-white/5 transition-all text-center cursor-pointer bg-transparent border-none"
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
                className="absolute inset-0 z-[100] bg-neutral-black/95 backdrop-blur-2xl flex flex-col items-center justify-start overflow-y-auto custom-scrollbar p-6 md:p-12 py-12 md:py-16"
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
