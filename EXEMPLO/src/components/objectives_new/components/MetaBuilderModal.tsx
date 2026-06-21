import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Save, AlertTriangle, Target, Calendar, 
  Zap, ArrowRight, CheckCircle2, Info, 
  Layout, Palette, Clock, TrendingUp,
  Plus, Trash2, GripVertical, Brain, Sparkles, FileText, Activity
} from 'lucide-react';
import { storage } from '../lib/storage';
import { safeUUID } from '../../../utils/uuid';

interface MetaAction {
  id: string;
  description: string;
  order: number;
}

export interface MetaData {
  id: string;
  intention: string;
  description: string;
  meaning: string;
  formaMedicao: string;
  objetivoDesejado: string;
  pontoAtual?: string;
  ritmoEsperado?: string;
  evolucaoEsperada?: string;
  evolutionaryContext?: string;
  interpretacao?: 'linear' | 'acumulativa' | 'progressiva' | 'streak' | 'subjetiva' | 'continua' | 'intensidade';
  tipoMetrica?: string;
  contexto?: string;
  deadline: string;
  consequence: string;
  risks: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  strategy: string;
  actions: MetaAction[];
  rhythm: 'daily' | 'weekly' | 'custom';
  color: string;
  image?: string;
  createdAt: string;
}

interface MetaBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meta: MetaData) => void;
  objectiveTitle: string;
  objectiveProgress: number;
  objectiveDeadline: string;
  initialData?: MetaData;
}

const IMPACT_LEVELS = [
  { id: 'low', label: 'Baixo', color: 'text-pastel-green', bg: 'bg-pastel-green/10', border: 'border-pastel-green/20' },
  { id: 'medium', label: 'Médio', color: 'text-pastel-yellow', bg: 'bg-pastel-yellow/10', border: 'border-pastel-yellow/20' },
  { id: 'high', label: 'Alto', color: 'text-pastel-orange', bg: 'bg-pastel-orange/10', border: 'border-pastel-orange/20' },
  { id: 'critical', label: 'Crítico', color: 'text-pastel-pink', bg: 'bg-pastel-pink/10', border: 'border-pastel-pink/20' },
];

export default function MetaBuilderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  objectiveTitle, 
  objectiveProgress, 
  objectiveDeadline,
  initialData 
}: MetaBuilderModalProps) {
  const [formData, setFormData] = useState<MetaData>(initialData || {
    id: 'draft',
    intention: '',
    description: '',
    meaning: '',
    formaMedicao: '',
    objetivoDesejado: '',
    pontoAtual: '0',
    ritmoEsperado: 'Constante',
    evolucaoEsperada: '',
    evolutionaryContext: '',
    interpretacao: 'linear',
    tipoMetrica: 'unidade',
    contexto: 'geral',
    deadline: new Date().toISOString().split('T')[0],
    consequence: '',
    risks: '',
    impact: 'medium',
    strategy: '',
    actions: [],
    rhythm: 'daily',
    color: '#c3b1e1',
    createdAt: new Date().toISOString(),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showTaskFeedback, setShowTaskFeedback] = useState(false);

  // Load draft & Reset on open
  useEffect(() => {
    if (isOpen) {
      const cleanState: MetaData = {
        id: 'draft',
        intention: '',
        description: '',
        meaning: '',
        formaMedicao: '',
        objetivoDesejado: '',
        pontoAtual: '0',
        ritmoEsperado: 'Constante',
        evolucaoEsperada: '',
        evolutionaryContext: '',
        interpretacao: 'linear',
        tipoMetrica: 'unidade',
        contexto: 'geral',
        deadline: new Date().toISOString().split('T')[0],
        consequence: '',
        risks: '',
        impact: 'medium',
        strategy: '',
        actions: [],
        rhythm: 'daily',
        color: '#c3b1e1',
        createdAt: new Date().toISOString(),
      };

      if (initialData) {
        setFormData(initialData);
      } else {
        const titleKey = objectiveTitle ? String(objectiveTitle).trim() : '';
        if (titleKey && titleKey !== 'undefined' && titleKey !== '') {
          const savedDraft = storage.get<Partial<MetaData>>(`meta_builder_draft_${titleKey}`, {});
          if (Object.keys(savedDraft).length > 0) {
            setFormData({ ...cleanState, ...savedDraft, id: 'draft' });
          } else {
            setFormData(cleanState);
          }
        } else {
          setFormData(cleanState);
        }
      }
    }
  }, [isOpen, initialData, objectiveTitle]);

  // Auto-save simulation
  useEffect(() => {
    if (isOpen && !isSaving) {
      const titleKey = objectiveTitle ? String(objectiveTitle).trim() : '';
      if (titleKey && titleKey !== 'undefined' && titleKey !== '') {
        const timer = setTimeout(() => {
          storage.set(`meta_builder_draft_${titleKey}`, formData);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [formData, isOpen, objectiveTitle, isSaving]);

  const calculateProgress = () => {
    const fields = [
      formData.intention, 
      formData.meaning, 
      formData.formaMedicao, 
      formData.objetivoDesejado, 
      formData.strategy,
      formData.consequence
    ];
    const filledFields = fields.filter(f => f.trim().length > 0).length;
    const actionProgress = formData.actions.length > 0 ? 1 : 0;
    return Math.round(((filledFields + actionProgress) / (fields.length + 1)) * 100);
  };

  const progress = calculateProgress();

  const handleAddAction = () => {
    const newAction: MetaAction = {
      id: safeUUID(),
      description: '',
      order: formData.actions.length,
    };
    setFormData({ ...formData, actions: [...formData.actions, newAction] });
  };

  const handleUpdateAction = (id: string, description: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.map(a => a.id === id ? { ...a, description } : a)
    });
  };

  const handleRemoveAction = (id: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter(a => a.id !== id)
    });
  };

  const handleFinalize = () => {
    setIsSaving(true);
    // Suppress draft writing and remove draft immediately
    const titleKey = objectiveTitle ? String(objectiveTitle).trim() : '';
    if (titleKey && titleKey !== 'undefined' && titleKey !== '') {
      storage.remove(`meta_builder_draft_${titleKey}`);
    }
    setTimeout(() => {
      try {
        const finalMeta = { ...formData, id: safeUUID() };
        onSave(finalMeta);
        
        // Reset state immediately so it's fresh for next open
        setFormData({
          id: 'draft',
          intention: '',
          description: '',
          meaning: '',
          formaMedicao: '',
          objetivoDesejado: '',
          pontoAtual: '0',
          ritmoEsperado: 'Constante',
          evolucaoEsperada: '',
          evolutionaryContext: '',
          interpretacao: 'linear',
          tipoMetrica: 'unidade',
          contexto: 'geral',
          deadline: new Date().toISOString().split('T')[0],
          consequence: '',
          risks: '',
          impact: 'medium',
          strategy: '',
          actions: [],
          rhythm: 'daily',
          color: '#c3b1e1',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[MetaBuilderModal] Error saving meta:', error);
      } finally {
        setIsSaving(false);
        onClose();
      }
    }, 800);
  };

  const handleTransformToTasks = () => {
    setShowTaskFeedback(true);
    setTimeout(() => setShowTaskFeedback(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-neutral-black/60 backdrop-blur-xl" onClick={onClose} />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full h-full max-w-7xl bg-neutral-black border-x md:border border-neutral-white/10 rounded-none md:rounded-[2.5rem] overflow-y-auto overflow-x-hidden md:overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <header className="px-4 md:px-8 py-3 md:py-4 border-b border-neutral-white/10 flex items-center justify-between bg-neutral-black/50 backdrop-blur-md relative md:sticky top-0 z-20">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-pastel-indigo/20 flex items-center justify-center text-pastel-indigo flex-shrink-0">
                <Target size={20} className="md:w-[24px] md:h-[24px]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm md:text-lg font-bold text-neutral-white flex items-center gap-2 truncate">
                  {objectiveTitle}
                  <span className="hidden sm:inline text-[10px] text-neutral-white/30 uppercase tracking-widest font-normal">• Meta Builder</span>
                </h2>
                <div className="flex items-center gap-3 md:gap-4 mt-0.5 md:mt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-16 md:w-20 h-1 bg-neutral-white/10 rounded-full overflow-hidden">
                      <div className="bg-pastel-indigo h-full" style={{ width: `${objectiveProgress}%` }} />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/40">{objectiveProgress}%</span>
                  </div>
                  <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest truncate">
                    Prazo: {new Date(objectiveDeadline).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              <div className="hidden lg:flex items-center gap-2 text-pastel-green">
                <div className="w-2 h-2 rounded-full bg-pastel-green animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Meta em construção • salvando automaticamente</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all"
              >
                <X size={18} className="md:w-[20px] md:h-[20px]" />
              </button>
            </div>
          </header>

          <div className="flex-1 md:overflow-hidden flex flex-col md:flex-row">
            {/* Main Flow */}
            <div className="flex-1 md:overflow-y-auto px-6 md:px-16 py-8 md:py-12 space-y-16 md:space-y-24 scroll-smooth custom-scrollbar">
              
              {/* Section 1: Intention */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">01</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-indigo">Intenção</h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <div className="space-y-2">
                    <label className="text-xl md:text-4xl font-bold tracking-tight text-neutral-white/90 block">
                      O que você quer construir?
                    </label>
                    <input 
                      type="text"
                      value={formData.intention}
                      onChange={(e) => setFormData({ ...formData, intention: e.target.value })}
                      placeholder="Ex: Lançar o MVP"
                      className="w-full bg-transparent border-none p-0 text-2xl md:text-5xl font-bold text-pastel-indigo placeholder:text-neutral-white/5 focus:ring-0 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-xs font-bold text-neutral-white/30 uppercase tracking-widest">Descrição Complementar</label>
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detalhe a visão desta meta específica..."
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white/60 focus:border-pastel-indigo/50 focus:ring-0 transition-all min-h-[100px]"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Meaning */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">02</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-pink">Significado</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <label className="text-xl md:text-4xl font-bold tracking-tight text-neutral-white/90 block">
                    Por que isso importa?
                  </label>
                  <textarea 
                    value={formData.meaning}
                    onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                    placeholder="Reflexão profunda..."
                    className="w-full bg-transparent border-none p-0 text-lg md:text-2xl font-medium text-neutral-white/60 italic placeholder:text-neutral-white/5 focus:ring-0 transition-all min-h-[100px] md:min-h-[120px] resize-none"
                  />
                </div>
              </section>

              {/* Section 3: Evolução e Medição */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">03</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-green">Evolução Esperada</h3>
                </div>

                {/* Brain Context Section (The "Mecânica de Evolução" logic) */}
                <div className="bg-pastel-indigo/5 border border-pastel-indigo/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
                  <div className="p-3 bg-pastel-indigo/10 rounded-xl shrink-0">
                    <Brain size={20} className="text-pastel-indigo" />
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-white/80">Contexto Geral de Evolução (Propósito Humano)</h4>
                      <p className="text-[10px] text-neutral-white/30 uppercase tracking-widest mt-1 mb-3">Como a IA deve compreender o sucesso desta jornada?</p>
                      <textarea 
                        value={formData.evolutionaryContext || ''}
                        onChange={(e) => setFormData({ ...formData, evolutionaryContext: e.target.value })}
                        placeholder="Descreva a essência da mudança que você busca. Ex: 'Busco uma relação mais fluida com o trabalho, onde a produtividade nasça da clareza e não do esforço bruto.'"
                        className="w-full bg-neutral-white/5 border border-neutral-white/5 rounded-2xl p-4 text-xs text-neutral-white/60 focus:outline-none focus:border-pastel-indigo/50 min-h-[80px] resize-none leading-relaxed transition-all"
                      />
                    </div>
                    <div className="p-4 bg-pastel-indigo/10 rounded-2xl border border-pastel-indigo/20">
                      <p className="text-[10px] text-neutral-white/40 leading-relaxed">
                        <Sparkles size={12} className="inline mr-2 text-pastel-indigo" />
                        O sistema detecta automaticamente padrões de <span className="text-pastel-indigo font-bold">Tempo, Frequência e Ritmo</span>. Os dados abaixo servem para dar <span className="text-pastel-green font-bold">significado qualitativo</span> a esses dados.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[2rem] p-6 md:p-10 space-y-8 md:space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Contexto da Experiência</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">O que estamos medindo?</span>
                      </div>
                      <select 
                        value={formData.contexto || 'geral'}
                        onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all appearance-none cursor-pointer"
                      >
                        <option value="geral">Geral / Produção</option>
                        <option value="leitura">Leitura / Estudo</option>
                        <option value="prática">Prática / Treino</option>
                        <option value="financeiro">Financeiro / Gestão</option>
                        <option value="foco">Foco / Meditação</option>
                        <option value="audio">Áudio / Consumo</option>
                      </select>
                      <p className="text-[10px] text-neutral-white/30 italic">Define sobre qual perspectiva a evolução será interpretada.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Interpretação da Evolução</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Lógica do Sistema</span>
                      </div>
                      <select 
                        value={formData.interpretacao || 'linear'}
                        onChange={(e) => setFormData({ ...formData, interpretacao: e.target.value as any })}
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all appearance-none cursor-pointer"
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
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Instrução Contextual (Guia da Memória)</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Ensine a IA a perceber seu progresso</span>
                      </div>
                      <textarea 
                        value={formData.evolucaoEsperada}
                        onChange={(e) => setFormData({ ...formData, evolucaoEsperada: e.target.value })}
                        placeholder="Como você descreveria o 'sentir' da evolução nesta dimensão? Ex: 'Perceba se estou saindo da prática com menos fadiga mental, indicando que a técnica está se tornando natural.'"
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white/60 focus:border-pastel-green/50 focus:ring-0 transition-all min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-4 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Forma de Medição</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Como quantificar?</span>
                      </div>
                      <div className="space-y-4">
                        <select 
                          value={formData.tipoMetrica}
                          onChange={(e) => setFormData({ ...formData, tipoMetrica: e.target.value })}
                          className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all appearance-none cursor-pointer"
                        >
                          <option value="unidade">Unidades (ex: Repetições)</option>
                          <option value="tempo">Tempo (ex: Horas/Minutos)</option>
                          <option value="frequencia">Frequência (ex: Vezes por semana)</option>
                          <option value="consistencia">Consistência (ex: % de acerto)</option>
                          <option value="leitura">Leitura (ex: Páginas/Capítulos)</option>
                          <option value="financeiro">Financeiro (ex: R$)</option>
                          <option value="intensidade">Intensidade (ex: Nível 1-10)</option>
                        </select>
                        <input 
                          type="text"
                          value={formData.formaMedicao}
                          onChange={(e) => setFormData({ ...formData, formaMedicao: e.target.value })}
                          placeholder={
                            formData.contexto === 'leitura' ? "Ex: Páginas lidas por dia" :
                            formData.contexto === 'foco' ? "Ex: Minutos de foco ininterruptos" :
                            formData.contexto === 'financeiro' ? "Ex: Receita bruta mensal" :
                            "Ex: sessões de meditação, entregáveis..."
                          }
                          className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-4 border-t border-neutral-white/5">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-pastel-green mb-1">
                            <Sparkles size={14} className="text-pastel-green" />
                            <span className="text-[10px] font-bold text-pastel-green uppercase tracking-widest">Interpretação da IA: Automática</span>
                          </div>
                          <div className="px-3 py-1.5 bg-pastel-green/10 border border-pastel-green/20 rounded-lg">
                            <p className="text-[9px] text-pastel-green/60 font-medium">O Engine analisa seu comportamento e gera insights contextuais baseados nas notas que você registra.</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-4 border-t border-neutral-white/5">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Jornada de Evolução</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Ponto de Partida → Destino</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Onde você está hoje?</p>
                          <input 
                            type="text" 
                            value={formData.pontoAtual}
                            onChange={(e) => setFormData({ ...formData, pontoAtual: e.target.value })}
                            placeholder={formData.interpretacao === 'subjetiva' ? "Iniciante/Confuso" : "0"}
                            className="w-full bg-neutral-white/3 border border-neutral-white/10 rounded-2xl p-5 text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Qual o alvo final?</p>
                          <input 
                            type="text" 
                            value={formData.objetivoDesejado}
                            onChange={(e) => setFormData({ ...formData, objetivoDesejado: e.target.value })}
                            placeholder={formData.interpretacao === 'subjetiva' ? "Lúcido/Avançado" : "Alvo (Ex: 50)"}
                            className="w-full bg-neutral-white/3 border border-neutral-white/10 rounded-2xl p-5 text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-neutral-white/20 italic">Você pode usar números (0 a 100) ou estados emocionais/técnicos.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-lg md:text-xl font-bold text-neutral-white/90">Ritmo de Evolução</label>
                        <span className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Comportamento da Métrica</span>
                      </div>
                      <div className="space-y-4">
                        <select 
                          value={formData.ritmoEsperado || 'Constante'}
                          onChange={(e) => setFormData({ ...formData, ritmoEsperado: e.target.value })}
                          className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Constante">Constante (Manutenção)</option>
                          <option value="Crescimento Gradual">Crescimento Gradual</option>
                          <option value="Intensificação Progressiva">Intensificação Progressiva</option>
                          <option value="Imersão Forte">Imersão Forte (Sprint)</option>
                          <option value="Construção Lenta">Construção Lenta de Base</option>
                        </select>
                        <input 
                          type="text"
                          value={formData.evolucaoEsperada}
                          onChange={(e) => setFormData({ ...formData, evolucaoEsperada: e.target.value })}
                          placeholder={
                            formData.ritmoEsperado?.includes('Imersão') ? "Ex: Foco total para desbloquear nível X" :
                            formData.contexto === 'prática' ? "Ex: Ganho de força e técnica linear" :
                            "Qual o real impacto dessa evolução no longo prazo?"
                          }
                          className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-green/50 focus:ring-0 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Time */}
              <section className="space-y-6 md:space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">04</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-yellow">Tempo</h3>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                  <div className="w-full md:w-auto space-y-3 md:space-y-4">
                    <label className="text-lg md:text-xl font-bold text-neutral-white/90 block">Quando precisa acontecer?</label>
                    <input 
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full md:w-auto bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white focus:border-pastel-yellow/50 focus:ring-0 transition-all appearance-none"
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6 w-full">
                    <div className="bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-2xl md:text-3xl font-bold text-pastel-yellow">
                        {Math.max(0, Math.ceil((new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) || 0}
                      </p>
                      <p className="text-[8px] md:text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest mt-1">Dias Restantes</p>
                    </div>
                    <div className="bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-2 text-pastel-orange mb-1">
                        <AlertTriangle size={12} className="md:w-[14px] md:h-[14px]" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest">Urgência</span>
                      </div>
                      <p className="text-xs md:text-sm font-bold text-neutral-white">
                        {(Math.ceil((new Date(formData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) || 0) < 7 ? 'Alta' : 'Moderada'}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Consequence & Risk */}
              <section className="space-y-8 md:space-y-12">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">05</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-orange">Consequência e Risco</h3>
                </div>
                
                <div className="space-y-8 md:space-y-12">
                  <div className="space-y-4 md:space-y-6">
                    <label className="text-xl md:text-3xl font-bold tracking-tight text-neutral-white/90 block">
                      Se não for executada, o que acontece?
                    </label>
                    <textarea 
                      value={formData.consequence}
                      onChange={(e) => setFormData({ ...formData, consequence: e.target.value })}
                      placeholder="Impacto negativo..."
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-sm md:text-lg text-neutral-white/60 focus:border-pastel-orange/50 focus:ring-0 transition-all min-h-[120px] md:min-h-[150px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-4 md:space-y-6">
                      <label className="text-lg md:text-xl font-bold text-neutral-white/90 block">Quais riscos podem impedir?</label>
                      <textarea 
                        value={formData.risks}
                        onChange={(e) => setFormData({ ...formData, risks: e.target.value })}
                        placeholder="Barreiras potenciais..."
                        className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 text-xs md:text-sm text-neutral-white/60 focus:border-pastel-orange/50 focus:ring-0 transition-all min-h-[100px] md:min-h-[120px]"
                      />
                    </div>
                    <div className="space-y-4 md:space-y-6">
                      <label className="text-lg md:text-xl font-bold text-neutral-white/90 block">Impacto do não cumprimento</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {IMPACT_LEVELS.map((level) => (
                          <button
                            key={level.id}
                            onClick={() => setFormData({ ...formData, impact: level.id as any })}
                            className={`px-3 md:px-4 py-3 md:py-4 rounded-xl md:rounded-2xl border text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                              formData.impact === level.id 
                                ? `${level.bg} ${level.border} ${level.color} scale-[1.02]` 
                                : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/30 hover:bg-neutral-white/10'
                            }`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      <div className="p-4 bg-neutral-white/5 border border-neutral-white/10 rounded-xl md:rounded-2xl flex items-start gap-3">
                        <Info size={14} className="text-pastel-indigo mt-0.5 md:w-[16px] md:h-[16px]" />
                        <p className="text-[9px] md:text-[10px] font-medium text-neutral-white/40 leading-relaxed">
                          Feedback: Ignorar essa meta pode gerar um impacto <span className={IMPACT_LEVELS.find(l => l.id === formData.impact)?.color}>{IMPACT_LEVELS.find(l => l.id === formData.impact)?.label.toLowerCase()}</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Strategy & Actions */}
              <section className="space-y-8 md:space-y-12">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">06</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-indigo">Estratégia + Ações</h3>
                </div>

                <div className="space-y-8 md:space-y-12">
                  <div className="space-y-4 md:space-y-6">
                    <label className="text-xl md:text-3xl font-bold tracking-tight text-neutral-white/90 block">
                      Como isso vai acontecer?
                    </label>
                    <textarea 
                      value={formData.strategy}
                      onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                      placeholder="Caminho para a vitória..."
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-sm md:text-lg text-neutral-white/60 focus:border-pastel-indigo/50 focus:ring-0 transition-all min-h-[120px] md:min-h-[150px]"
                    />
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                      <label className="text-lg md:text-xl font-bold text-neutral-white/90 block">Quais ações?</label>
                      <button 
                        onClick={handleAddAction}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-pastel-indigo/10 hover:bg-pastel-indigo/20 border border-pastel-indigo/30 rounded-xl text-[9px] md:text-[10px] font-bold text-pastel-indigo transition-all"
                      >
                        <Plus size={12} className="md:w-[14px] md:h-[14px]" />
                        Adicionar
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-2 md:gap-4 group">
                          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-neutral-white/5 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-neutral-white/20 cursor-grab active:cursor-grabbing flex-shrink-0 relative">
                            <GripVertical size={12} className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity absolute inset-0 m-auto md:w-[14px] md:h-[14px]" />
                            <span className="opacity-0 md:opacity-100 md:group-hover:opacity-0 transition-opacity">{index + 1}</span>
                          </div>
                          <input 
                            type="text"
                            value={action.description}
                            onChange={(e) => handleUpdateAction(action.id, e.target.value)}
                            placeholder="Ação..."
                            className="flex-1 bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-neutral-white focus:border-pastel-indigo/50 focus:ring-0 transition-all"
                          />
                          <button 
                            onClick={() => handleRemoveAction(action.id)}
                            className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/20 hover:text-pastel-pink hover:bg-pastel-pink/10 transition-all flex-shrink-0"
                          >
                            <Trash2 size={14} className="md:w-[16px] md:h-[16px]" />
                          </button>
                        </div>
                      ))}
                      
                      {formData.actions.length > 0 && (
                        <div className="pt-4 space-y-4">
                          <button 
                            onClick={handleTransformToTasks}
                            className="w-full py-3 md:py-4 border border-dashed border-neutral-white/10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold text-neutral-white/20 hover:text-neutral-white/40 hover:border-neutral-white/20 transition-all group relative overflow-hidden"
                          >
                            <AnimatePresence>
                              {showTaskFeedback ? (
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -20, opacity: 0 }}
                                  className="flex items-center gap-2 text-pastel-green"
                                >
                                  <CheckCircle2 size={14} className="md:w-[16px] md:h-[16px]" />
                                  Ações preparadas
                                </motion.div>
                              ) : (
                                <motion.div 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: -20, opacity: 0 }}
                                  className="flex items-center gap-2 md:gap-3"
                                >
                                  <Layout size={14} className="group-hover:scale-110 transition-transform md:w-[16px] md:h-[16px]" />
                                  Transformar em tarefas
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                          
                          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-white/5 rounded-xl border border-neutral-white/5">
                            <Info size={10} className="text-neutral-white/20 md:w-[12px] md:h-[12px]" />
                            <p className="text-[9px] md:text-[10px] font-medium text-neutral-white/20">
                              A sequência lógica define a ordem de execução.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-8">
                      <div className="space-y-3 md:space-y-4">
                        <label className="text-[10px] md:text-xs font-bold text-neutral-white/30 uppercase tracking-widest">Ritmo de Execução</label>
                        <div className="flex gap-2">
                          {['daily', 'weekly', 'custom'].map((r) => (
                            <button
                              key={r}
                              onClick={() => setFormData({ ...formData, rhythm: r as any })}
                              className={`flex-1 py-2.5 md:py-3 rounded-xl border text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
                                formData.rhythm === r 
                                  ? 'bg-pastel-indigo/20 border-pastel-indigo/30 text-pastel-indigo' 
                                  : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/30'
                              }`}
                            >
                              {r === 'daily' ? 'Diário' : r === 'weekly' ? 'Semanal' : 'Personalizado'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7: Identity */}
              <section className="space-y-8 pb-12">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-[10px] font-bold text-neutral-white/40">07</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-pastel-indigo">Identidade</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-xl font-bold text-neutral-white/90 block">Cor da Meta</label>
                    <div className="flex flex-wrap gap-4 px-4 py-2">
                      {['#c3b1e1', '#a8e6cf', '#ffaaa5', '#ffd3b6', '#dcedc1'].map((c) => (
                        <button
                          key={c}
                          onClick={() => setFormData({ ...formData, color: c })}
                          className={`w-12 h-12 md:w-10 md:h-10 rounded-full border-2 transition-all ${
                            formData.color === c ? 'border-neutral-white scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar Preview (Desktop) */}
            <aside className="hidden lg:block w-96 border-l border-neutral-white/10 bg-neutral-black/30 p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Visão em Tempo Real</h4>
                  <div className="px-2 py-1 bg-pastel-indigo/20 rounded text-[8px] font-bold text-pastel-indigo uppercase tracking-widest">
                    {progress}% Estruturada
                  </div>
                </div>

                <div className="p-6 rounded-3xl border border-neutral-white/10 bg-neutral-white/5 space-y-4">
                  <div 
                    className="w-full aspect-video rounded-2xl overflow-hidden bg-neutral-black/40 flex items-center justify-center"
                    style={{ borderLeft: `4px solid ${formData.color}` }}
                  >
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <Layout size={32} className="text-neutral-white/10" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-neutral-white truncate">
                      {formData.intention || 'Nova Meta'}
                    </h5>
                    <p className="text-[10px] text-neutral-white/40 mt-1 line-clamp-2">
                      {formData.description || 'Sem descrição definida...'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-neutral-white/5 rounded-2xl border border-neutral-white/5">
                    <div className="flex items-center gap-3">
                      <TrendingUp size={16} className="text-pastel-green" />
                      <span className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Impacto</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${IMPACT_LEVELS.find(l => l.id === formData.impact)?.color}`}>
                      {IMPACT_LEVELS.find(l => l.id === formData.impact)?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-neutral-white/5 rounded-2xl border border-neutral-white/5">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-pastel-yellow" />
                      <span className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Esforço</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-white/80 uppercase tracking-widest">
                      {formData.actions.length > 5 ? 'Alto' : formData.actions.length > 2 ? 'Médio' : 'Baixo'}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="p-6 rounded-3xl bg-pastel-indigo/5 border border-pastel-indigo/10">
                    <p className="text-[10px] font-bold text-pastel-indigo uppercase tracking-widest mb-3">Resumo Estratégico</p>
                    <p className="text-xs text-neutral-white/60 leading-relaxed">
                      {formData.strategy ? formData.strategy.substring(0, 120) + '...' : 'Defina sua estratégia para visualizar o resumo...'}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Footer Actions */}
          <footer className="px-4 md:px-8 py-3 md:py-4 border-t border-neutral-white/10 bg-neutral-black/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 md:sticky bottom-0 z-30 flex-shrink-0">
            <button 
              onClick={onClose}
              className="w-full md:w-auto px-8 py-4 md:py-3 rounded-xl text-[10px] md:text-xs font-bold text-neutral-white/40 uppercase tracking-widest hover:text-neutral-white transition-all bg-neutral-white/5 md:bg-transparent"
            >
              Continuar depois
            </button>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="hidden md:flex flex-col items-end mr-4">
                <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Estrutura da Meta</p>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className={`w-4 h-1 rounded-full ${progress >= ((i+1)/7)*100 ? 'bg-pastel-indigo' : 'bg-neutral-white/5'}`} />
                  ))}
                </div>
              </div>
              <button 
                onClick={handleFinalize}
                disabled={isSaving || !formData.intention}
                className={`w-full md:w-auto px-12 py-5 md:py-4 rounded-2xl font-black text-[11px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  isSaving || !formData.intention
                    ? 'bg-neutral-white/5 text-neutral-white/20 cursor-not-allowed'
                    : 'bg-pastel-green text-neutral-black hover:bg-pastel-green/80 shadow-pastel-green/20'
                }`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-neutral-black/20 border-t-neutral-black rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
                )}
                Finalizar Meta
              </button>
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
