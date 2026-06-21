import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  X, Save, AlertTriangle, Target, Calendar, 
  Zap, ArrowRight, CheckCircle2, Info, 
  Layout, Palette, Clock, TrendingUp,
  Plus, Trash2, GripVertical, ChevronDown, 
  ChevronUp, ListChecks, Type, Flag, 
  FileText, Link2, BarChart3, Eye,
  MoreHorizontal, Sparkles, History,
  Volume2, Play, BookOpen, Activity, Brain,
  Wind, Mic, Dumbbell, Image as ImageIcon,
  Swords, Headphones
} from 'lucide-react';

import NativeTimePicker from './NativeTimePicker';
import { storage } from '../lib/storage';
import { safeUUID } from '../../../utils/uuid';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskData {
  id: string;
  title: string;
  description: string;
  imageUrl?: string; // High-emotion task background image
  metaId: string;
  subtasks: Subtask[];
  checklist: ChecklistItem[];
  estimatedDuration: string;
  date: string;
  time: string;
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  executionStrategy: string;
  linkedPages: string[];
  metricType: 'unidade' | 'tempo' | 'frequencia' | 'consistencia' | 'leitura' | 'financeiro' | 'intensidade' | 'foco' | 'entrega';
  evolucaoEsperada: string;
  pontoAtual?: string;
  objetivoDesejado?: string;
  contexto?: 'geral' | 'leitura' | 'prática' | 'financeiro' | 'foco' | 'audio';
  formaMedicao?: string;
  ritmoEsperado?: string;
  interpretacao?: 'linear' | 'acumulativa' | 'progressiva' | 'streak' | 'subjetiva' | 'continua' | 'intensidade';
  createdAt: string;
  // Conscientiology / Energy Work
  energyWorkExecution?: {
    intensity: number; // 1-10
    technique: 'ev' | 'cle' | 'exteriorization' | 'absorption' | 'other';
    holosomaticImpacts: {
      physical: number; // 0-5
      energy: number; // 0-5
      emotional: number; // 0-5
      mental: number; // 0-5
    };
    symmetry: number; // 1-5
    signals: string; // Sinalética
    lucidity: number; // 1-5
    sensations: string[];
    phenomena: string[];
  };
  // Multimodal Execution
  executionType?: 'standard' | 'audio' | 'video' | 'reading' | 'practice' | 'visualization' | 'meditation' | 'exercise' | 'breathing' | 'vocal' | 'energy-work';
  multimodalConfig?: {
    url?: string;
    mediaType?: 'link' | 'upload';
    mediaFile?: string; // Base64 or object URL
    bookName?: string;
    totalPages?: number;
    dailyPageGoal?: number;
    timerSeconds?: number;
    repetitions?: number;
    observations?: string;
    meditationStyle?: string;
    practiceStyle?: 'wim-hof' | 'gh' | 'vocal' | 'other';
    // Exercise specific
    exerciseCategory?: 'outdoor' | 'aerobic' | 'musculation' | 'stretching';
    targetMuscles?: string[];
    // Visualization specific
    visualizationMedia?: { url: string; type: 'image' | 'video' }[];
  };
  // Execution Data
  actualDuration?: number; // in seconds
  status?: 'pending' | 'in-progress' | 'paused' | 'completed' | 'blocked';
  executionNotes?: string;
  realEffort?: 'lower' | 'equal' | 'higher';
  blockers?: string;
  completedAt?: string;
}

interface TaskBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskData) => void;
  objectiveTitle: string;
  metas: { id: string; intention: string }[];
  initialMetaId?: string;
}

const PRIORITY_LEVELS = [
  { id: 'low', label: 'Baixa', color: 'text-pastel-green', bg: 'bg-pastel-green/10', border: 'border-pastel-green/20' },
  { id: 'medium', label: 'Média', color: 'text-pastel-yellow', bg: 'bg-pastel-yellow/10', border: 'border-pastel-yellow/20' },
  { id: 'high', label: 'Alta', color: 'text-pastel-orange', bg: 'bg-pastel-orange/10', border: 'border-pastel-orange/20' },
  { id: 'critical', label: 'Crítica', color: 'text-pastel-pink', bg: 'bg-pastel-pink/10', border: 'border-pastel-pink/20' },
];

const IMPACT_LEVELS = [
  { id: 'low', label: 'Baixo', color: 'text-neutral-white/40', bg: 'bg-neutral-white/5', border: 'border-neutral-white/10' },
  { id: 'medium', label: 'Médio', color: 'text-pastel-indigo', bg: 'bg-pastel-indigo/10', border: 'border-pastel-indigo/20' },
  { id: 'high', label: 'Alto', color: 'text-pastel-purple', bg: 'bg-pastel-purple/10', border: 'border-pastel-purple/20' },
];

export default function TaskBuilderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  objectiveTitle, 
  metas,
  initialMetaId
}: TaskBuilderModalProps) {
  const [formData, setFormData] = useState<TaskData>({
    id: 'draft-task',
    title: '',
    description: '',
    imageUrl: '',
    metaId: initialMetaId || (metas.length > 0 ? metas[0].id : ''),
    subtasks: [],
    checklist: [],
    estimatedDuration: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    recurrence: 'none',
    priority: 'medium',
    impact: 'medium',
    executionStrategy: '',
    linkedPages: [],
    metricType: 'entrega',
    evolucaoEsperada: '',
    pontoAtual: '0',
    objetivoDesejado: '',
    contexto: 'geral',
    formaMedicao: '',
    ritmoEsperado: 'Constante',
    interpretacao: 'linear',
    createdAt: new Date().toISOString(),
    executionType: 'standard',
    multimodalConfig: {},
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    structure: true,
    time: false,
    impact: false,
    execution: false,
    linking: false,
    metrics: false,
    multimodal: false,
    preview: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [isDurationPickerOpen, setIsDurationPickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isMultimodalTimerOpen, setIsMultimodalTimerOpen] = useState(false);

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.metaId) newErrors.metaId = true;
    
    setErrors(newErrors);
    
    if (newErrors.title) {
      setExpandedSections(prev => ({ ...prev, identity: true }));
      setTimeout(() => {
        document.getElementById('task-title-input')?.focus();
      }, 100);
      return false;
    }
    
    if (newErrors.metaId) {
      setExpandedSections(prev => ({ ...prev, structure: true }));
      setTimeout(() => {
        const el = document.getElementById('meta-selector-area');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return false;
    }

    return true;
  };

  // Load draft & Reset on open
  useEffect(() => {
    if (isOpen) {
      // Reset sections and errors on every open to avoid "frozen" feeling
      setExpandedSections({
        identity: true,
        structure: false,
        multimodal: false,
        time: false,
        impact: false,
        strategy: false,
        linking: false,
        metrics: false,
        preview: false
      });
      setErrors({});

      // Full reset when opening the modal
      setFormData({
        id: 'draft-task',
        title: '',
        description: '',
        imageUrl: '',
        metaId: initialMetaId || (metas.length > 0 ? metas[0].id : ''),
        subtasks: [],
        checklist: [],
        estimatedDuration: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        recurrence: 'none',
        priority: 'medium',
        impact: 'medium',
        executionStrategy: '',
        linkedPages: [],
        metricType: 'entrega',
        evolucaoEsperada: '',
        pontoAtual: '0',
        objetivoDesejado: '',
        contexto: 'geral',
        formaMedicao: '',
        ritmoEsperado: 'Constante',
        interpretacao: 'linear',
        createdAt: new Date().toISOString(),
        executionType: 'standard',
        multimodalConfig: {},
        energyWorkExecution: undefined
      });
    }
  }, [isOpen, objectiveTitle, initialMetaId]); // Removed metas from deps to avoid unnecessary resets if metas array changes slightly

  // Auto-select first meta if metaId is currently empty and metas list populates
  useEffect(() => {
    if (isOpen && !formData.metaId && metas.length > 0) {
      setFormData(prev => ({ ...prev, metaId: initialMetaId || metas[0].id }));
    }
  }, [metas, isOpen, initialMetaId, formData.metaId]);

  // Auto-save
  useEffect(() => {
    if (isOpen && !isSaving) {
      const titleKey = objectiveTitle ? String(objectiveTitle).trim() : '';
      if (titleKey && titleKey !== 'undefined' && titleKey !== '') {
        const timer = setTimeout(() => {
          storage.set(`task_builder_draft_${titleKey}`, formData);
          setLastSaved(new Date().toLocaleTimeString());
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [formData, isOpen, objectiveTitle, isSaving]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddSubtask = () => {
    const newSubtask: Subtask = { id: safeUUID(), text: '', completed: false };
    setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, newSubtask] }));
  };

  const handleUpdateSubtask = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, text } : s)
    }));
  };

  const handleToggleSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    }));
  };

  const handleRemoveSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(s => s.id !== id)
    }));
  };

  const handleAddChecklist = () => {
    const newItem: ChecklistItem = { id: safeUUID(), text: '', completed: false };
    setFormData(prev => ({ ...prev, checklist: [...prev.checklist, newItem] }));
  };

  const handleFinalize = () => {
    if (!validate()) return;
    setIsSaving(true);
    setTimeout(() => {
      try {
        const finalTask = { ...formData, id: safeUUID() };
        onSave(finalTask);
        const titleKey = objectiveTitle ? String(objectiveTitle).trim() : '';
        if (titleKey && titleKey !== 'undefined' && titleKey !== '') {
          storage.remove(`task_builder_draft_${titleKey}`);
        }
      } catch (error) {
        console.error('[TaskBuilderModal] Error saving task:', error);
      } finally {
        setIsSaving(false);
        onClose();
      }
    }, 1000);
  };

  if (!isOpen) return null;

  const activeMeta = metas.find(m => m.id === formData.metaId);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-8"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-black/80 backdrop-blur-2xl" onClick={onClose} />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          className="relative w-full h-full md:h-auto md:max-h-[95vh] max-w-full md:max-w-[95%] bg-neutral-black border-x-0 md:border border-neutral-white/10 rounded-none md:rounded-[3rem] overflow-y-auto overflow-x-hidden md:overflow-hidden custom-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
        >
          {/* Header */}
          <header className="px-6 md:px-10 py-3 md:py-5 border-b border-neutral-white/5 flex items-center justify-between bg-neutral-black/40 backdrop-blur-xl relative md:sticky top-0 z-30 flex-shrink-0">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 md:gap-3 text-neutral-white/30 mb-1">
                  <Target size={10} className="md:w-[14px] md:h-[14px] flex-shrink-0" />
                  <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.2em] truncate max-w-[60px] md:max-w-none">{objectiveTitle}</span>
                  <ArrowRight size={8} className="md:w-[12px] md:h-[12px] flex-shrink-0" />
                  <span className="text-[7px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-pastel-indigo truncate max-w-[60px] md:max-w-none">
                    {activeMeta?.intention || 'Selecionar Meta'}
                  </span>
                </div>
                <h2 className="text-base md:text-xl font-headline font-bold text-neutral-white flex items-center gap-2 md:gap-3">
                  Task Builder <Sparkles size={14} className="text-pastel-indigo animate-pulse md:w-[18px] md:h-[18px]" />
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-neutral-white/5 border border-neutral-white/5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-pastel-green animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-white/40">
                  {lastSaved ? `Salvo às ${lastSaved}` : 'Salvando automaticamente'}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all group"
              >
                <X size={18} className="md:w-[24px] md:h-[24px] group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </header>

          <div className="flex-1 flex flex-col md:flex-row md:overflow-y-auto custom-scrollbar">
            {/* Main Modular Flow */}
            <div className="flex-1 px-6 md:px-20 py-8 md:py-12 space-y-4 md:space-y-6">
              
              {/* Section 1: Identity */}
              <Section 
                id="identity" 
                title="Identidade da Tarefa" 
                icon={<Type size={18} />} 
                isExpanded={expandedSections.identity} 
                onToggle={() => toggleSection('identity')}
                color="text-pastel-indigo"
              >
                <div className="space-y-6 md:space-y-8 py-4">
                  <div className="space-y-3 md:space-y-4">
                    <label className="text-xl md:text-5xl font-bold tracking-tight text-neutral-white/90 flex items-center justify-between">
                      O que precisa ser feito?
                      {errors.title && <span className="text-pastel-pink text-xs font-bold uppercase tracking-widest animate-pulse">Obrigatório</span>}
                    </label>
                    <input 
                      id="task-title-input"
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors(prev => ({ ...prev, title: false }));
                      }}
                      placeholder="Defina a ação principal..."
                      className={`w-full bg-transparent border-none p-0 text-lg md:text-4xl font-bold transition-all focus:ring-0 ${errors.title ? 'text-pastel-pink placeholder:text-pastel-pink/20' : 'text-pastel-indigo placeholder:text-neutral-white/5'}`}
                    />
                  </div>
                  
                  {/* NEW: Tipo de Execução Selector */}
                  <div className="space-y-4">
                    <label className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest mt-4 block">Tipo de Execução</label>
                    <div className="flex flex-wrap gap-2">
                      {[ 
                        { id: 'standard', label: 'Padrão', icon: <FileText size={12} /> },
                        { id: 'audio', label: 'Áudio', icon: <Volume2 size={12} /> },
                        { id: 'video', label: 'Vídeo', icon: <Play size={12} /> },
                        { id: 'reading', label: 'Leitura', icon: <BookOpen size={12} /> },
                        { id: 'meditation', label: 'Meditação', icon: <Brain size={12} /> },
                        { id: 'visualization', label: 'Visão', icon: <Eye size={12} /> },
                        { id: 'exercise', label: 'Exercício', icon: <Dumbbell size={12} /> },
                        { id: 'breathing', label: 'Respiração', icon: <Wind size={12} /> },
                        { id: 'vocal', label: 'Vocal', icon: <Mic size={12} /> },
                        { id: 'practice', label: 'Prática GH', icon: <Zap size={12} /> },
                        { id: 'energy-work', label: 'Mobilização Energética', icon: <Wind size={12} /> }
                      ].map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, executionType: type.id as any })}
                          className={`px-4 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                            formData.executionType === type.id 
                              ? 'bg-pastel-indigo text-neutral-black border-pastel-indigo' 
                              : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/40 hover:bg-neutral-white/10'
                          }`}
                        >
                          {type.icon}
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Contexto ou Descrição (Opcional)</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Adicione detalhes, links rápidos ou observações iniciais..."
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 text-xs md:text-sm text-neutral-white/60 focus:border-pastel-indigo/50 focus:ring-0 transition-all min-h-[100px] md:min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest flex items-center justify-between">
                      Âncora Visual (Emoção & Foco)
                      <span className="text-[8px] opacity-40">Opcional</span>
                    </label>
                    <div className="flex items-center gap-6">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div 
                        role="button"
                        tabIndex={0}
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }
                        }}
                        className="group relative w-full h-32 md:h-40 rounded-[2rem] border-2 border-dashed border-neutral-white/5 hover:border-pastel-indigo/30 transition-all overflow-hidden flex flex-col items-center justify-center gap-3 bg-neutral-white/[0.01] hover:bg-neutral-white/[0.02] cursor-pointer"
                      >
                        {formData.imageUrl ? (
                          <>
                            <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Task Anchor" />
                            <div className="absolute inset-0 bg-neutral-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                              <ImageIcon size={24} className="text-neutral-white" />
                              <span className="text-[10px] font-bold text-neutral-white uppercase tracking-widest">Substituir Imagem</span>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, imageUrl: '' });
                              }}
                              className="absolute top-4 right-4 p-2 bg-neutral-black/60 backdrop-blur-md rounded-xl text-neutral-white/60 hover:text-pastel-pink transition-all z-20"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-neutral-white/5 rounded-2xl text-neutral-white/20 group-hover:text-pastel-indigo/60 transition-all transform group-hover:scale-110">
                              <ImageIcon size={32} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Adicionar Âncora Visual</p>
                              <p className="text-[8px] text-neutral-white/10 uppercase tracking-wider mt-1">Capture uma foto ou escolha da galeria</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* NEW: Multimodal Config Section */}
              <AnimatePresence>
                {formData.executionType !== 'standard' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Section 
                      id="multimodal" 
                      title={`Configuração Multimodal: ${formData.executionType}`}
                      icon={<Sparkles size={18} />} 
                      isExpanded={expandedSections.multimodal} 
                      onToggle={() => toggleSection('multimodal')}
                      color="text-pastel-indigo"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                        {/* Dynamic fields based on executionType */}
                        {(formData.executionType === 'audio' || formData.executionType === 'video') && (
                          <div className="space-y-4 md:col-span-2">
                            <div className="flex items-center gap-4 p-1 bg-neutral-white/5 rounded-full border border-neutral-white/10 w-fit">
                              <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, mediaType: 'link' } })}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${formData.multimodalConfig?.mediaType === 'link' || !formData.multimodalConfig?.mediaType ? 'bg-pastel-indigo text-neutral-black' : 'text-neutral-white/40 hover:text-neutral-white'}`}
                              >
                                Link URL
                              </button>
                              <button 
                                type="button"
                                onClick={() => setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, mediaType: 'upload' } })}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${formData.multimodalConfig?.mediaType === 'upload' ? 'bg-pastel-indigo text-neutral-black' : 'text-neutral-white/40 hover:text-neutral-white'}`}
                              >
                                Upload Arquivo
                              </button>
                            </div>

                            {formData.multimodalConfig?.mediaType === 'upload' ? (
                              <div className="relative h-32 md:h-40 border-2 border-dashed border-neutral-white/10 rounded-3xl flex flex-col items-center justify-center gap-3 hover:border-pastel-indigo/30 transition-all group overflow-hidden">
                                {formData.multimodalConfig?.mediaFile ? (
                                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-black/60 group-hover:bg-neutral-black/80 transition-all z-10">
                                    <button 
                                      type="button" 
                                      onClick={() => setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, mediaFile: undefined } })}
                                      className="px-4 py-2 bg-pastel-pink text-neutral-black rounded-full text-[10px] font-bold uppercase tracking-widest"
                                    >
                                      Remover Arquivo
                                    </button>
                                  </div>
                                ) : null}
                                <Plus size={24} className="text-neutral-white/20" />
                                <div className="text-center">
                                  <p className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Selecionar {formData.executionType === 'audio' ? 'Áudio' : 'Vídeo'}</p>
                                  <p className="text-[8px] text-neutral-white/20 mt-1 uppercase">MP3, WAV, MP4, MOV</p>
                                </div>
                                <input 
                                  type="file" 
                                  accept={formData.executionType === 'audio' ? "audio/*,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a,.aac" : "video/*,.mp4,.mov,.m4v"}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setFormData({
                                          ...formData,
                                          multimodalConfig: { ...formData.multimodalConfig, mediaFile: reader.result as string }
                                        });
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                {formData.multimodalConfig?.mediaFile && (
                                  <div className="absolute inset-4 pointer-events-none opacity-20">
                                    {formData.executionType === 'audio' ? <Volume2 size={40} /> : <Play size={40} />}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">URL do {formData.executionType === 'audio' ? 'Áudio' : 'Vídeo'}</label>
                                <input 
                                  type="text"
                                  value={formData.multimodalConfig?.url || ''}
                                  onChange={(e) => setFormData({
                                    ...formData, 
                                    multimodalConfig: { ...formData.multimodalConfig, url: e.target.value }
                                  })}
                                  placeholder="https://..."
                                  className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white focus:border-pastel-indigo/50"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {formData.executionType === 'reading' && (
                          <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Nome do Livro / Obra</label>
                            <input 
                              type="text"
                              value={formData.multimodalConfig?.bookName || ''}
                              onChange={(e) => setFormData({
                                ...formData, 
                                multimodalConfig: { ...formData.multimodalConfig, bookName: e.target.value }
                              })}
                              placeholder="Título do livro ou artigo..."
                              className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white focus:border-pastel-indigo/50"
                            />
                          </div>
                        )}

                        {formData.executionType === 'reading' && (
                          <>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Total de Páginas</label>
                              <input 
                                type="number"
                                value={formData.multimodalConfig?.totalPages || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  multimodalConfig: { ...formData.multimodalConfig, totalPages: parseInt(e.target.value) }
                                })}
                                className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Meta Diária (Páginas)</label>
                              <input 
                                type="number"
                                value={formData.multimodalConfig?.dailyPageGoal || ''}
                                onChange={(e) => setFormData({
                                  ...formData, 
                                  multimodalConfig: { ...formData.multimodalConfig, dailyPageGoal: parseInt(e.target.value) }
                                })}
                                className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white"
                              />
                            </div>
                          </>
                        )}

                        {formData.executionType === 'visualization' && (
                          <div className="space-y-4 md:col-span-2">
                             <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Imagens/Vídeos do Objetivo</label>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(formData.multimodalConfig?.visualizationMedia || []).map((m, idx) => (
                                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-white/10 bg-neutral-white/5">
                                    {m.type === 'image' ? (
                                      <img src={m.url} className="w-full h-full object-cover" alt="Visão" referrerPolicy="no-referrer" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-pastel-pink/10">
                                        <Play size={20} className="text-pastel-pink" />
                                      </div>
                                    )}
                                    <button 
                                      onClick={() => {
                                        const updated = (formData.multimodalConfig?.visualizationMedia || []).filter((_, i) => i !== idx);
                                        setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, visualizationMedia: updated } });
                                      }}
                                      className="absolute top-2 right-2 p-1.5 bg-neutral-black/60 backdrop-blur-md rounded-lg text-neutral-white hover:text-pastel-pink transition-all"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                                <div className="relative aspect-square border-2 border-dashed border-neutral-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-pastel-indigo/30 transition-all cursor-pointer">
                                  <ImageIcon size={20} className="text-neutral-white/20" />
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-white/30">Adicionar</span>
                                  <input 
                                    type="file" 
                                    multiple
                                    accept="image/*,video/*,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.m4v"
                                    onChange={(e) => {
                                      const files = Array.from(e.target.files || []) as File[];
                                      
                                      files.forEach((file: File) => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const newMedia = { 
                                            url: reader.result as string, 
                                            type: (file.type.startsWith('image/') ? 'image' : 'video') as 'image' | 'video'
                                          };
                                          
                                          setFormData(current => {
                                            const prevMedia = current.multimodalConfig?.visualizationMedia || [];
                                            return {
                                              ...current,
                                              multimodalConfig: { 
                                                ...current.multimodalConfig, 
                                                visualizationMedia: [...prevMedia, newMedia] 
                                              }
                                            };
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      });
                                    }}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </div>
                             </div>
                          </div>
                        )}

                        {formData.executionType === 'meditation' && (
                          <div className="space-y-3 md:col-span-2">
                            <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Estilo da Meditação</label>
                            <input 
                              type="text"
                              value={formData.multimodalConfig?.meditationStyle || ''}
                              onChange={(e) => setFormData({
                                ...formData, 
                                multimodalConfig: { ...formData.multimodalConfig, meditationStyle: e.target.value }
                              })}
                              placeholder="Ex: Mindfulness, Zazen, Transcendental..."
                              className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white focus:border-pastel-indigo/50"
                            />
                          </div>
                        )}

                        {formData.executionType === 'energy-work' && (
                          <div className="space-y-6 md:col-span-2">
                            <div className="p-6 md:p-8 bg-pastel-indigo/10 border border-pastel-indigo/20 rounded-[2.5rem]">
                              <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-pastel-indigo/20 rounded-xl">
                                  <Wind className="text-pastel-indigo" size={18} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-neutral-white uppercase tracking-widest">Mapeamento Bioenergético</h4>
                                  <p className="text-[10px] text-neutral-white/30 uppercase tracking-widest">Diretrizes de Mobilização Energética</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest block">Técnica Predominante</label>
                                  <select 
                                    value={formData.energyWorkExecution?.technique || 'ev'}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      energyWorkExecution: {
                                        ...formData.energyWorkExecution || { 
                                          intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 1, energy: 1, emotional: 1, mental: 1 },
                                          symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                        },
                                        technique: e.target.value as any
                                      }
                                    })}
                                    className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-neutral-white focus:border-pastel-indigo appearance-none transition-all"
                                  >
                                    <option value="ev">MVE - Mobilização Vital Energética (EV)</option>
                                    <option value="cle">CLE - Circulação Longitudinal de Energias</option>
                                    <option value="exteriorization">Exteriorização de Energias</option>
                                    <option value="absorption">Absorção de Energias</option>
                                    <option value="other">Outra Técnica Parapsíquica</option>
                                  </select>
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Meta de Intensidade</label>
                                    <span className="text-xs font-bold text-pastel-indigo">{formData.energyWorkExecution?.intensity || 5}/10</span>
                                  </div>
                                  <div className="px-5 py-4 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl">
                                    <input 
                                      type="range" 
                                      min="1" 
                                      max="10" 
                                      value={formData.energyWorkExecution?.intensity || 5}
                                      onChange={(e) => setFormData({
                                        ...formData,
                                        energyWorkExecution: {
                                          ...formData.energyWorkExecution || { 
                                            intensity: 5, technique: 'ev', holosomaticImpacts: { physical: 1, energy: 1, emotional: 1, mental: 1 },
                                            symmetry: 1, signals: '', lucidity: 3, sensations: [], phenomena: []
                                          },
                                          intensity: parseInt(e.target.value)
                                        }
                                      })}
                                      className="w-full accent-pastel-indigo"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.executionType === 'exercise' && (
                           <div className="space-y-6 md:col-span-2">
                            <div className="space-y-3">
                              <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Categoria do Exercício</label>
                              <div className="flex flex-wrap gap-2">
                                {[
                                  { id: 'outdoor', label: 'Ao Ar Livre' },
                                  { id: 'aerobic', label: 'Aeróbico' },
                                  { id: 'musculation', label: 'Musculação' },
                                  { id: 'stretching', label: 'Alongamento' }
                                ].map((cat) => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, exerciseCategory: cat.id as any } })}
                                    className={`px-4 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${
                                      formData.multimodalConfig?.exerciseCategory === cat.id 
                                        ? 'bg-pastel-green text-neutral-black border-pastel-green' 
                                        : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/40 hover:bg-neutral-white/10'
                                    }`}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {formData.multimodalConfig?.exerciseCategory === 'musculation' && (
                              <div className="space-y-4">
                                <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Músculos Prioritários</label>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    'Ombro', 'Trapézio', 'Antebraço', 'Bíceps', 'Tríceps', 
                                    'Costas', 'Lombar', 'Peito', 'Barriga', 
                                    'Coxa', 'Posterior', 'Coxa Traseira', 'Panturrilha', 'Pescoço'
                                  ].map((muscle) => (
                                    <button
                                      key={muscle}
                                      type="button"
                                      onClick={() => {
                                        const prev = formData.multimodalConfig?.targetMuscles || [];
                                        const updated = prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle];
                                        setFormData({ ...formData, multimodalConfig: { ...formData.multimodalConfig, targetMuscles: updated } });
                                      }}
                                      className={`px-3 py-1.5 rounded-xl border text-[8px] font-bold uppercase tracking-widest transition-all ${
                                        (formData.multimodalConfig?.targetMuscles || []).includes(muscle)
                                          ? 'bg-pastel-indigo/20 border-pastel-indigo/40 text-pastel-indigo' 
                                          : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/20 hover:bg-neutral-white/10'
                                      }`}
                                    >
                                      {muscle}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(formData.executionType === 'energy-work' || formData.executionType === 'practice' || formData.executionType === 'visualization' || formData.executionType === 'meditation' || formData.executionType === 'audio' || formData.executionType === 'video' || formData.executionType === 'breathing' || formData.executionType === 'exercise' || formData.executionType === 'vocal') && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Duração Esperada / Timer</label>
                            <button 
                              type="button"
                              onClick={() => setIsMultimodalTimerOpen(true)}
                              className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl flex items-center gap-4 px-6 py-4 text-sm text-neutral-white hover:border-pastel-indigo/50 transition-all text-left"
                            >
                              <Clock className="text-neutral-white/20 flex-shrink-0" size={16} />
                              <span className={formData.multimodalConfig?.timerSeconds ? 'text-neutral-white' : 'text-neutral-white/20'}>
                                {formData.multimodalConfig?.timerSeconds 
                                  ? `${Math.floor(formData.multimodalConfig.timerSeconds / 3600)}h ${Math.floor((formData.multimodalConfig.timerSeconds % 3600) / 60)}m` 
                                  : 'Selecionar tempo...'}
                              </span>
                            </button>
                            <NativeTimePicker 
                              value={formData.multimodalConfig?.timerSeconds ? `${Math.floor(formData.multimodalConfig.timerSeconds / 3600)}h ${Math.floor((formData.multimodalConfig.timerSeconds % 3600) / 60)}m` : ''}
                              onChange={(val) => {
                                const h = parseInt(val.match(/(\d+)h/)?.[1] || '0');
                                const m = parseInt(val.match(/(\d+)m/)?.[1] || '0');
                                setFormData({
                                  ...formData, 
                                  multimodalConfig: { ...formData.multimodalConfig, timerSeconds: (h * 3600) + (m * 60) }
                                });
                              }}
                              isOpen={isMultimodalTimerOpen}
                              onClose={() => setIsMultimodalTimerOpen(false)}
                              label="Definir Timer de Execução"
                            />
                          </div>
                        )}

                        {(formData.executionType === 'audio' || (formData.executionType === 'exercise' && formData.multimodalConfig?.exerciseCategory !== 'musculation') || formData.executionType === 'practice' || formData.executionType === 'breathing') && (
                           <div className="space-y-3">
                            <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Repetições / Séries Sugeridas</label>
                            <input 
                              type="number"
                              value={formData.multimodalConfig?.repetitions || ''}
                              onChange={(e) => setFormData({
                                ...formData, 
                                multimodalConfig: { ...formData.multimodalConfig, repetitions: parseInt(e.target.value) }
                              })}
                              className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white"
                            />
                          </div>
                        )}

                        <div className="space-y-3 md:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Observações de Execução</label>
                          <textarea 
                            value={formData.multimodalConfig?.observations || ''}
                            onChange={(e) => setFormData({
                              ...formData, 
                              multimodalConfig: { ...formData.multimodalConfig, observations: e.target.value }
                            })}
                            placeholder="Instruções específicas para o momento da prática..."
                            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 text-xs text-neutral-white/60 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </Section>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Section 2: Structure */}
              <Section 
                id="structure" 
                title="Estrutura Executável" 
                icon={<ListChecks size={18} />} 
                isExpanded={expandedSections.structure} 
                onToggle={() => toggleSection('structure')}
                color="text-pastel-pink"
              >
                <div id="meta-selector-area" className="space-y-8 py-6 px-4 md:px-0">
                  {/* Select Meta (Relationship) */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest flex justify-between">
                      Vincular à Meta Inteligente
                      {errors.metaId && <span className="text-pastel-pink text-[9px] animate-pulse">Selecione uma meta</span>}
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {metas.map(meta => (
                        <button
                          key={meta.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, metaId: meta.id });
                            if (errors.metaId) setErrors(prev => ({ ...prev, metaId: false }));
                          }}
                          className={`p-5 rounded-3xl border text-left transition-all group flex items-center justify-between ${
                            formData.metaId === meta.id 
                              ? 'bg-pastel-indigo text-neutral-black border-pastel-indigo' 
                              : errors.metaId 
                                ? 'bg-pastel-pink/5 border-pastel-pink/20 text-neutral-white/40'
                                : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white hover:bg-neutral-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${formData.metaId === meta.id ? 'bg-neutral-black/20' : 'bg-neutral-white/5'}`}>
                              <Target size={14} />
                            </div>
                            <span className="text-sm font-bold">{meta.intention}</span>
                          </div>
                          {formData.metaId === meta.id && <CheckCircle2 size={18} className="text-neutral-black" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-neutral-white/5" />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 py-6">
                  {/* Subtasks */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-neutral-white/80 flex items-center gap-2">
                        Subtarefas <span className="text-[10px] text-neutral-white/20 font-normal tracking-widest uppercase">Unidades de Ação</span>
                      </h4>
                      <button 
                        onClick={handleAddSubtask}
                        className="p-2 bg-pastel-pink/10 hover:bg-pastel-pink/20 border border-pastel-pink/20 rounded-lg text-pastel-pink transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <Reorder.Group axis="y" values={formData.subtasks} onReorder={(newOrder) => setFormData({...formData, subtasks: newOrder})}>
                        {formData.subtasks.map((sub) => (
                          <Reorder.Item key={sub.id} value={sub}>
                            <div className="flex items-center gap-3 group bg-neutral-white/5 border border-neutral-white/5 rounded-2xl p-4 hover:border-pastel-pink/30 transition-all">
                              <GripVertical size={16} className="text-neutral-white/10 cursor-grab active:cursor-grabbing" />
                              <button 
                                onClick={() => handleToggleSubtask(sub.id)}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${sub.completed ? 'bg-pastel-pink border-pastel-pink text-neutral-black' : 'border-neutral-white/20 text-transparent'}`}
                              >
                                <CheckCircle2 size={12} />
                              </button>
                              <input 
                                type="text"
                                value={sub.text}
                                onChange={(e) => handleUpdateSubtask(sub.id, e.target.value)}
                                placeholder="Próximo passo..."
                                className={`flex-1 bg-transparent border-none p-0 text-sm focus:ring-0 transition-all ${sub.completed ? 'text-neutral-white/20 line-through' : 'text-neutral-white'}`}
                              />
                              <button 
                                onClick={() => handleRemoveSubtask(sub.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-white/20 hover:text-pastel-pink transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                      {formData.subtasks.length === 0 && (
                        <div className="py-8 border-2 border-dashed border-neutral-white/5 rounded-3xl flex flex-col items-center justify-center text-neutral-white/10">
                          <Plus size={24} className="mb-2" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">Nenhuma subtarefa adicionada</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-neutral-white/80 flex items-center gap-2">
                        Checklist Interno <span className="text-[10px] text-neutral-white/20 font-normal tracking-widest uppercase">Opcional</span>
                      </h4>
                      <button 
                        onClick={handleAddChecklist}
                        className="p-2 bg-neutral-white/5 hover:bg-neutral-white/10 border border-neutral-white/10 rounded-lg text-neutral-white/40 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.checklist.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-neutral-white/5 border border-neutral-white/5 rounded-xl p-3">
                          <input 
                            type="checkbox" 
                            checked={item.completed}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                checklist: prev.checklist.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i)
                              }));
                            }}
                            className="w-4 h-4 rounded border-neutral-white/20 bg-transparent text-pastel-indigo focus:ring-pastel-indigo"
                          />
                          <input 
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                checklist: prev.checklist.map(i => i.id === item.id ? { ...i, text: e.target.value } : i)
                              }));
                            }}
                            placeholder="Item de verificação..."
                            className="flex-1 bg-transparent border-none p-0 text-xs text-neutral-white/60 focus:ring-0"
                          />
                        </div>
                      ))}
                      {formData.checklist.length === 0 && (
                        <p className="text-[10px] text-neutral-white/20 italic text-center py-4">Checklist vazio...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

              {/* Section 3: Time */}
              <Section 
                id="time" 
                title="Tempo e Agenda" 
                icon={<Clock size={18} />} 
                isExpanded={expandedSections.time} 
                onToggle={() => toggleSection('time')}
                color="text-pastel-yellow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Duração Estimada</label>
                    <button 
                      type="button"
                      onClick={() => setIsDurationPickerOpen(true)}
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl flex items-center gap-4 px-6 py-4 text-sm text-neutral-white hover:border-pastel-yellow/50 transition-all text-left"
                    >
                      <Clock className="text-neutral-white/20 flex-shrink-0" size={16} />
                      <span className={formData.estimatedDuration ? 'text-neutral-white' : 'text-neutral-white/20'}>
                        {formData.estimatedDuration || 'Selecionar duração...'}
                      </span>
                    </button>
                    <NativeTimePicker 
                      value={formData.estimatedDuration}
                      onChange={(val) => setFormData({ ...formData, estimatedDuration: val })}
                      isOpen={isDurationPickerOpen}
                      onClose={() => setIsDurationPickerOpen(false)}
                      label="Definir Duração Estimada"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Data de Execução</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-white/20" size={16} />
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-neutral-white focus:border-pastel-yellow/50 focus:ring-0 appearance-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Horário (Opcional)</label>
                    <button 
                      type="button"
                      onClick={() => setIsTimePickerOpen(true)}
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl flex items-center gap-4 px-6 py-4 text-sm text-neutral-white hover:border-pastel-yellow/50 transition-all text-left"
                    >
                      <Clock className="text-neutral-white/20 flex-shrink-0" size={16} />
                      <span className={formData.time ? 'text-neutral-white' : 'text-neutral-white/20'}>
                        {formData.time ? 
                          formData.time.includes('h') ? formData.time : `${formData.time.split(':')[0]}h ${formData.time.split(':')[1]}m` 
                          : 'Selecionar horário...'
                        }
                      </span>
                    </button>
                    <NativeTimePicker 
                      value={formData.time.includes(':') ? `${formData.time.split(':')[0]}h ${formData.time.split(':')[1]}m` : formData.time}
                      onChange={(val) => {
                        // Convert back to HH:mm for internal consistency if needed, but the user wants h m format visually
                        const h = val.match(/(\d+)h/)?.[1] || '0';
                        const m = val.match(/(\d+)m/)?.[1] || '0';
                        setFormData({ ...formData, time: `${h.padStart(2, '0')}:${m.padStart(2, '0')}` });
                      }}
                      isOpen={isTimePickerOpen}
                      onClose={() => setIsTimePickerOpen(false)}
                      label="Definir Horário"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Recorrência</label>
                    <select 
                      value={formData.recurrence}
                      onChange={(e) => setFormData({...formData, recurrence: e.target.value as any})}
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-6 py-4 text-sm text-neutral-white focus:border-pastel-yellow/50 focus:ring-0 appearance-none cursor-pointer"
                    >
                      <option value="none">Nenhuma</option>
                      <option value="daily">Diária</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                </div>
              </Section>

              {/* Section 4: Impact */}
              <Section 
                id="impact" 
                title="Impacto e Prioridade" 
                icon={<Flag size={18} />} 
                isExpanded={expandedSections.impact} 
                onToggle={() => toggleSection('impact')}
                color="text-pastel-orange"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 py-6">
                  <div className="space-y-4 md:space-y-6">
                    <label className="text-sm font-bold text-neutral-white/80 block">Nível de Prioridade</label>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      {PRIORITY_LEVELS.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setFormData({...formData, priority: p.id as any})}
                          className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex flex-col items-center gap-2 transition-all ${formData.priority === p.id ? `${p.bg} ${p.border} ${p.color} scale-[1.02] md:scale-[1.05] shadow-lg` : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/20 hover:bg-neutral-white/10'}`}
                        >
                          <Flag size={18} className="md:w-[20px] md:h-[20px]" />
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 md:space-y-6">
                    <label className="text-sm font-bold text-neutral-white/80 block">Impacto na Meta</label>
                    <div className="flex gap-3 md:gap-4">
                      {IMPACT_LEVELS.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => setFormData({...formData, impact: i.id as any})}
                          className={`flex-1 p-4 md:p-6 rounded-2xl md:rounded-3xl border flex flex-col items-center gap-2 transition-all ${formData.impact === i.id ? `${i.bg} ${i.border} ${i.color} scale-[1.02] md:scale-[1.05] shadow-lg` : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/20 hover:bg-neutral-white/10'}`}
                        >
                          <Zap size={18} className="md:w-[20px] md:h-[20px]" />
                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{i.label}</span>
                        </button>
                      ))}
                    </div>
                    <div className="p-4 md:p-6 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl flex items-start gap-3 md:gap-4">
                      <Info size={18} className="text-pastel-indigo mt-1 md:w-[20px] md:h-[20px]" />
                      <p className="text-[10px] md:text-xs text-neutral-white/40 leading-relaxed">
                        Definir o impacto ajuda o sistema a priorizar esta tarefa na sua timeline inteligente.
                      </p>
                    </div>
                  </div>
                </div>
              </Section>

              {/* Section 5: Execution Strategy */}
              <Section 
                id="execution" 
                title="Execução Expandida" 
                icon={<FileText size={18} />} 
                isExpanded={expandedSections.execution} 
                onToggle={() => toggleSection('execution')}
                color="text-pastel-purple"
              >
                <div className="py-6 space-y-4 md:space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-base md:text-xl font-bold text-neutral-white/90">Estratégia</label>
                    <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                      <Sparkles size={10} className="md:w-[12px] md:h-[12px]" />
                      Canvas
                    </div>
                  </div>
                  <textarea 
                    value={formData.executionStrategy}
                    onChange={(e) => setFormData({...formData, executionStrategy: e.target.value})}
                    placeholder="Desenvolva sua estratégia aqui..."
                    className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 text-xs md:text-lg text-neutral-white/70 focus:border-pastel-purple/50 focus:ring-0 transition-all min-h-[250px] md:min-h-[400px] font-body leading-relaxed custom-scrollbar"
                  />
                </div>
              </Section>

              {/* Section 6: Linking */}
              <Section 
                id="linking" 
                title="Vinculação com Conteúdo" 
                icon={<Link2 size={18} />} 
                isExpanded={expandedSections.linking} 
                onToggle={() => toggleSection('linking')}
                color="text-pastel-green"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-6">
                  <button className="p-6 md:p-8 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center gap-3 md:gap-4 hover:bg-neutral-white/10 hover:border-pastel-green/30 transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-white/5 flex items-center justify-center text-neutral-white/20 group-hover:text-pastel-green transition-colors">
                      <FileText size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] md:text-xs font-bold text-neutral-white">Selecionar Página</p>
                      <p className="text-[8px] md:text-[10px] text-neutral-white/30 mt-1">Vincular nota existente</p>
                    </div>
                  </button>
                  <button className="p-6 md:p-8 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center gap-3 md:gap-4 hover:bg-neutral-white/10 hover:border-pastel-green/30 transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-white/5 flex items-center justify-center text-neutral-white/20 group-hover:text-pastel-green transition-colors">
                      <Plus size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] md:text-xs font-bold text-neutral-white">Nova Página</p>
                      <p className="text-[8px] md:text-[10px] text-neutral-white/30 mt-1">Criar espaço dedicado</p>
                    </div>
                  </button>
                  <button className="p-6 md:p-8 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center gap-3 md:gap-4 hover:bg-neutral-white/10 hover:border-pastel-green/30 transition-all group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-white/5 flex items-center justify-center text-neutral-white/20 group-hover:text-pastel-green transition-colors">
                      <Layout size={20} className="md:w-[24px] md:h-[24px]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] md:text-xs font-bold text-neutral-white">Workspace</p>
                      <p className="text-[8px] md:text-[10px] text-neutral-white/30 mt-1">Conectar ao projeto</p>
                    </div>
                  </button>
                </div>
              </Section>

              {/* Section 7: Evolução e Performance */}
              <Section 
                id="metrics" 
                title="KPI Engine: Evolução Humana" 
                icon={<BarChart3 size={18} />} 
                isExpanded={expandedSections.metrics} 
                onToggle={() => toggleSection('metrics')}
                color="text-pastel-indigo"
              >
                <div className="py-6 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-neutral-white/80">Contexto da Atividade</label>
                        <span className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">O que é isso?</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'geral', label: 'Geral', icon: <Activity size={14} /> },
                          { id: 'leitura', label: 'Leitura', icon: <BookOpen size={14} /> },
                          { id: 'prática', label: 'Prática', icon: <Swords size={14} /> },
                          { id: 'financeiro', label: 'Financeiro', icon: <TrendingUp size={14} /> },
                          { id: 'foco', label: 'Foco/Ment.', icon: <Brain size={14} /> },
                          { id: 'audio', label: 'Áudio', icon: <Headphones size={14} /> }
                        ].map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setFormData({...formData, contexto: c.id as any})}
                            className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all ${formData.contexto === c.id ? 'bg-pastel-indigo/20 border-pastel-indigo/30 text-pastel-indigo shadow-[0_0_20px_rgba(165,180,252,0.1)]' : 'bg-neutral-white/2 border-neutral-white/5 text-neutral-white/20 hover:border-neutral-white/10'}`}
                          >
                            {c.icon}
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-neutral-white/80">Lógica de Interpretação</label>
                        <span className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">O "Como"</span>
                      </div>
                      <select 
                        value={formData.interpretacao || 'linear'}
                        onChange={(e) => setFormData({ ...formData, interpretacao: e.target.value as any })}
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-indigo/50 focus:ring-0 transition-all appearance-none cursor-pointer"
                      >
                        <option value="linear">Linear (Progressão direta)</option>
                        <option value="acumulativa">Acumulativa (Soma de esforços)</option>
                        <option value="progressiva">Progressiva (Dificuldade gradual)</option>
                        <option value="streak">Streak (Consistência ininterrupta)</option>
                        <option value="subjetiva">Subjetiva (Nível de consciência/percepção)</option>
                        <option value="continua">Contínua (Fluxo sem interrupção)</option>
                        <option value="intensidade">Intensidade (Aumento de carga ou foco)</option>
                      </select>
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-neutral-white/80">Forma de Medição</label>
                        <span className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">A ferramenta</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'tempo', label: 'Ritmo/Tempo', icon: <Clock size={14} /> },
                          { id: 'entrega', label: 'Entrega Fixa', icon: <CheckCircle2 size={14} /> },
                          { id: 'frequencia', label: 'Frequência', icon: <Activity size={14} /> },
                          { id: 'leitura', label: 'Absorção', icon: <BookOpen size={14} /> },
                          { id: 'foco', label: 'Densidade', icon: <Brain size={14} /> },
                          { id: 'consistencia', label: 'Inércia', icon: <TrendingUp size={14} /> }
                        ].map((m) => (
                          <button
                            key={m.id}
                            onClick={() => setFormData({...formData, metricType: m.id as any})}
                            className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest transition-all ${formData.metricType === m.id ? 'bg-pastel-green/20 border-pastel-green/30 text-pastel-green' : 'bg-neutral-white/2 border-neutral-white/5 text-neutral-white/20 hover:border-neutral-white/10'}`}
                          >
                            {m.icon}
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-8 border-t border-neutral-white/5">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Ritmo & Evolução</label>
                           <p className="text-[8px] font-bold text-pastel-indigo/40 italic">O impacto futuro</p>
                        </div>
                        <input 
                          type="text"
                          value={formData.evolucaoEsperada}
                          onChange={(e) => setFormData({...formData, evolucaoEsperada: e.target.value})}
                          placeholder={
                            formData.interpretacao === 'subjetiva' ? "Ex: Transição de 'Confuso' para 'Lúcido'" :
                            formData.interpretacao === 'intensidade' ? "Ex: Aumento da carga cognitiva suportada" :
                            formData.contexto === 'leitura' ? "Ex: Expansão de vocabulário e repertório técnico" :
                            formData.contexto === 'foco' ? "Ex: Aumento da capacidade de estado de fluxo" :
                            "Qual o real impacto dessa atividade?"
                          }
                          className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl md:rounded-2xl px-5 md:px-6 py-3 md:py-4 text-xs md:text-sm text-neutral-white focus:border-pastel-indigo/50 focus:ring-0 transition-shadow hover:shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                        />
                        <p className="text-[9px] text-neutral-white/20 italic">Ensina o sistema como interpretar o sucesso desta tarefa.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Jornada (Início → Destino)</label>
                        <span className="text-[14px] font-bold text-pastel-green opacity-50">→</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <input 
                            type="text"
                            value={formData.pontoAtual}
                            onChange={(e) => setFormData({...formData, pontoAtual: e.target.value})}
                            placeholder={formData.interpretacao === 'subjetiva' ? "De: 'Confuso'" : "De (0)"}
                            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-4 py-3 text-xs text-neutral-white focus:border-pastel-indigo/50 focus:ring-0"
                          />
                        </div>
                        <div className="space-y-2">
                          <input 
                            type="text"
                            value={formData.objetivoDesejado}
                            onChange={(e) => setFormData({...formData, objetivoDesejado: e.target.value})}
                            placeholder={
                              formData.interpretacao === 'subjetiva' ? "Para: 'Lúcido'" :
                              formData.contexto === 'leitura' ? "Páginas" :
                              formData.metricType === 'tempo' ? "Minutos" :
                              "Para (Alvo)"
                            }
                            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-4 py-3 text-xs text-neutral-white focus:border-pastel-green/50 focus:ring-0"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-2">
                        <Info size={10} className="text-pastel-indigo/40" />
                        <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Dica: Use números para alimentar gráficos ou Palavras para estados internos.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              {/* Section 8: Preview */}
              <Section 
                id="preview" 
                title="Pré-visualização" 
                icon={<Eye size={18} />} 
                isExpanded={expandedSections.preview} 
                onToggle={() => toggleSection('preview')}
                color="text-neutral-white"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 py-6">
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest text-center">Na Timeline</p>
                    <div className="p-5 md:p-6 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-indigo" />
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-bold text-neutral-white/30 uppercase tracking-widest">14:30 - 16:00</span>
                        <Flag size={10} className={PRIORITY_LEVELS.find(p => p.id === formData.priority)?.color} />
                      </div>
                      <p className="text-[10px] md:text-xs font-bold text-neutral-white truncate">{formData.title || 'Título da Tarefa'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-full h-1 bg-neutral-white/10 rounded-full overflow-hidden">
                          <div className="bg-pastel-indigo h-full w-0" />
                        </div>
                        <span className="text-[8px] font-bold text-neutral-white/20">0%</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest text-center">Dentro da Meta</p>
                    <div className="p-5 md:p-6 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-pastel-indigo/20 flex items-center justify-center text-pastel-indigo">
                        <CheckCircle2 size={16} className="md:w-[20px] md:h-[20px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs font-bold text-neutral-white truncate">{formData.title || 'Tarefa'}</p>
                        <p className="text-[8px] text-neutral-white/30 uppercase tracking-widest mt-1">Impacto {IMPACT_LEVELS.find(i => i.id === formData.impact)?.label}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest text-center">Foco do Agora</p>
                    <div className="p-5 md:p-6 bg-pastel-indigo/10 border border-pastel-indigo/20 rounded-2xl md:rounded-3xl flex flex-col items-center text-center">
                      <Zap size={20} className="text-pastel-indigo mb-2 md:w-[24px] md:h-[24px]" />
                      <p className="text-xs md:text-sm font-bold text-neutral-white line-clamp-2">{formData.title || 'Foco Atual'}</p>
                      <div className="mt-2 md:mt-3 px-3 py-1 bg-pastel-indigo/20 rounded-full text-[8px] font-bold text-pastel-indigo uppercase tracking-widest">
                        Executar Agora
                      </div>
                    </div>
                  </div>
                </div>
              </Section>

              <div className="h-20" /> {/* Spacer */}
            </div>

            {/* Sidebar Context (Desktop) */}
            <aside className="hidden xl:block w-96 border-l border-neutral-white/5 bg-neutral-black/20 p-10 space-y-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Resumo da Unidade</h4>
                
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-neutral-white/5 border border-neutral-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Complexidade</span>
                      <span className="text-[10px] font-bold text-neutral-white uppercase tracking-widest">
                        {formData.subtasks.length > 5 ? 'Alta' : formData.subtasks.length > 2 ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-white/10 rounded-full overflow-hidden flex gap-0.5">
                      <div className={`h-full flex-1 ${formData.subtasks.length > 0 ? 'bg-pastel-indigo' : 'bg-neutral-white/5'}`} />
                      <div className={`h-full flex-1 ${formData.subtasks.length > 2 ? 'bg-pastel-indigo' : 'bg-neutral-white/5'}`} />
                      <div className={`h-full flex-1 ${formData.subtasks.length > 5 ? 'bg-pastel-indigo' : 'bg-neutral-white/5'}`} />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-neutral-white/5 border border-neutral-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Vínculo Estratégico</span>
                      <Target size={14} className="text-pastel-indigo" />
                    </div>
                    <p className="text-xs font-bold text-neutral-white leading-relaxed">
                      Esta tarefa impulsiona a meta <span className="text-pastel-indigo">"{activeMeta?.intention || 'Não selecionada'}"</span>
                    </p>
                  </div>
                </div>

                <div className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 text-neutral-white/20">
                    <History size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Histórico de Construção</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-pastel-green" />
                      <p className="text-[10px] text-neutral-white/40">Tarefa iniciada hoje às {new Date(formData.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    {formData.title && (
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-pastel-indigo" />
                        <p className="text-[10px] text-neutral-white/40">Identidade definida</p>
                      </div>
                    )}
                    {formData.subtasks.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-pastel-pink" />
                        <p className="text-[10px] text-neutral-white/40">{formData.subtasks.length} subtarefas estruturadas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-pastel-indigo/5 border border-pastel-indigo/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={40} />
                </div>
                <p className="text-[10px] font-bold text-pastel-indigo uppercase tracking-widest mb-2">Dica de Performance</p>
                <p className="text-xs text-neutral-white/50 leading-relaxed">
                  Dividir tarefas complexas em subtarefas de no máximo 30 minutos aumenta sua taxa de conclusão em até 40%.
                </p>
              </div>
            </aside>
          </div>

            {/* Footer Actions */}
            <footer className="px-6 md:px-10 pt-0 pb-1.5 md:py-4 border-t border-neutral-white/5 bg-neutral-black/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-0 sm:gap-4 md:sticky bottom-0 z-30 flex-shrink-0">
              <button 
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-1 mt-1 sm:py-4 sm:mt-0 rounded-2xl text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest hover:text-neutral-white hover:bg-neutral-white/5 transition-all"
              >
                Continuar depois
              </button>
              
              <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 mt-0 mb-0">
                <div className="hidden md:flex flex-col items-end">
                  <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest mb-1">Progresso da Construção</p>
                  <div className="flex gap-1">
                    {Object.keys(expandedSections).map((s, i) => {
                      const isFilled = i === 0 ? formData.title : i === 1 ? formData.subtasks.length > 0 : i === 2 ? formData.date : i === 3 ? true : i === 4 ? formData.executionStrategy : true;
                      return (
                        <div key={s} className={`w-6 h-1 rounded-full transition-all duration-500 ${isFilled ? 'bg-pastel-indigo' : 'bg-neutral-white/5'}`} />
                      );
                    })}
                  </div>
                </div>
  
                <button 
                  onClick={handleFinalize}
                  disabled={isSaving}
                  className={`w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 my-0 rounded-2xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                    isSaving
                      ? 'bg-neutral-white/5 text-neutral-white/10 cursor-not-allowed'
                      : 'bg-neutral-white text-neutral-black hover:scale-[1.02] active:scale-[0.98] shadow-neutral-white/10'
                  }`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-neutral-black/20 border-t-neutral-black rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} className="md:w-[20px] md:h-[20px]" />
                  )}
                  Finalizar Construção
                </button>
              </div>
            </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  color: string;
}

function Section({ id, title, icon, isExpanded, onToggle, children, color }: SectionProps) {
  return (
    <div className={`border rounded-2xl md:rounded-[2.5rem] transition-all duration-500 overflow-hidden ${isExpanded ? 'bg-neutral-white/[0.02] border-neutral-white/10' : 'bg-transparent border-neutral-white/5 hover:border-neutral-white/10'}`}>
      <button 
        onClick={onToggle}
        className="w-full px-5 md:px-8 py-5 md:py-6 flex items-center justify-between group"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-neutral-white/5 flex items-center justify-center transition-all group-hover:scale-110 ${isExpanded ? color : 'text-neutral-white/20'}`}>
            {React.cloneElement(icon as React.ReactElement<any>, { size: 16 })}
          </div>
          <h3 className={`text-[10px] md:text-sm font-bold uppercase tracking-widest transition-colors ${isExpanded ? 'text-neutral-white' : 'text-neutral-white/40'}`}>
            {title}
          </h3>
        </div>
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-neutral-white/5 flex items-center justify-center text-neutral-white/20 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={16} />
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-5 md:px-12 pb-8 md:pb-10">
              <div className="w-full h-px bg-neutral-white/5 mb-6 md:mb-8" />
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
