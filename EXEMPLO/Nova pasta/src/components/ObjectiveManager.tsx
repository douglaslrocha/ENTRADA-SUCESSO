import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, X, Plus, Trash2, Upload, Calendar, 
  Clock, DollarSign, Target, BarChart, 
  Layers, Image as ImageIcon, ChevronRight,
  Info, Activity, TrendingUp, PieChart,
  AlertTriangle, Link as LinkIcon, CheckCircle2,
  ChevronLeft, FileText, Settings, Zap,
  ArrowUpRight, Gauge, Layout, Database,
  Bell, ShieldAlert, GitBranch, Brain, Sparkles
} from 'lucide-react';

// --- Types ---

type Priority = 'low' | 'medium' | 'high' | 'critical';
type Status = 'planning' | 'active' | 'paused' | 'completed' | 'canceled';
type TimeUnit = 'hours/week' | 'days/month';
type Frequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly';
type DataSource = 'manual' | 'api' | 'csv';
type Visualization = 'area' | 'gauge' | 'bar' | 'trend';

interface KPI {
  id: string;
  name: string;
  formaMedicao: string;
  pontoAtual: string | number;
  objetivoDesejado: string | number;
  frequencia: Frequency;
  ritmoEsperado: string;
  evolucaoEsperada: string;
  interpretacao: 'linear' | 'acumulativa' | 'progressiva' | 'streak' | 'subjetiva' | 'continua' | 'intensidade';
  tipoMetrica: 'unidade' | 'tempo' | 'frequencia' | 'consistencia' | 'leitura' | 'financeiro' | 'intensidade' | 'foco' | 'composto';
  arquétipo?: 'maestria' | 'habito' | 'sprint' | 'manutencao' | 'descoberta';
  dimensões?: { nome: string; valor: number | string; peso: number }[];
  contexto: 'geral' | 'leitura' | 'prática' | 'financeiro' | 'foco' | 'audio';
  source: DataSource;
  visualization: Visualization;
  alertThreshold?: number;
  milestones?: { label: string; value: number | string; reached: boolean }[];
  lastUpdated?: string;
  momentumScore?: number;
  sustainabilityStatus?: 'healthy' | 'intense' | 'exhausted' | 'recovery';
  qualitativeNotes?: string[];
}

interface Risk {
  id: string;
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation: string;
}

interface ObjectiveData {
  // Step 1: The Burning Desire
  title: string;
  burningDesire: string; // The "Statement of Desire"
  feelings: string; // How it feels to have achieved it
  tags: string[];
  priority: Priority;
  status: Status;
  
  // Step 2: The Sacrifice & Timeline
  sacrifice: string; // What will be given in return
  plan: string; // Definite plan
  budget: number;
  currency: string;
  startDate: string;
  deadline: string;
  isRecurring: boolean;
  recurrenceInterval?: 'monthly' | 'quarterly' | 'yearly';

  // Step 3: Visual Manifestation (Media)
  media: { id: string; url: string; type: 'image' | 'video' | 'pdf'; name: string; videoUrl?: string }[];

  // Step 4: KPIs (Metrics of Success)
  kpis: KPI[];
  archetype?: 'mastery' | 'habit' | 'sprint' | 'maintenance' | 'discovery';
  evolutionaryContext?: string; // High-level human context for the objective evolution

  // Step 5: Fortifying the Path (Risks)
  risks: Risk[];
  relatedObjectives: { id: string; title: string }[];
}

// --- Components ---

const Stepper = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  return (
    <div className="flex items-center gap-1 md:gap-2 mb-8 md:mb-12 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div className={`flex-shrink-0 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs font-bold transition-all duration-500 ${
            i + 1 <= currentStep 
              ? 'bg-neutral-white text-neutral-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
              : 'bg-neutral-black text-neutral-white/30 border border-neutral-white/10'
          }`}>
            {i + 1 < currentStep ? <CheckCircle2 size={14} className="md:w-[16px] md:h-[16px]" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`flex-shrink-0 h-0.5 w-4 md:w-8 rounded-full transition-all duration-500 ${
              i + 1 < currentStep ? 'bg-neutral-white/30' : 'bg-neutral-white/5'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function ObjectiveManager({ onBack, onSave }: { onBack: () => void, onSave: (data: ObjectiveData) => void }) {
  const [step, setStep] = useState(1);
  const [focusTime, setFocusTime] = useState(0);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [data, setData] = useState<ObjectiveData>({
    title: '',
    burningDesire: '',
    feelings: '',
    sacrifice: '',
    plan: '',
    tags: [],
    priority: 'medium',
    status: 'planning',
    budget: 0,
    currency: 'BRL',
    startDate: '',
    deadline: '',
    isRecurring: false,
    media: [],
    kpis: [],
    evolutionaryContext: '',
    risks: [],
    relatedObjectives: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    let interval: any;
    if (isFocusActive) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUpdate = (updates: Partial<ObjectiveData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSave = () => {
    console.log('Final Objective Ecosystem Data:', data);
    onSave(data);
  };

  // --- Step Renderers ---

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">O Que Você Deseja Exatamente?</label>
          <input 
            type="text" 
            value={data.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Defina o seu objetivo com precisão absoluta..."
            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-lg font-bold text-neutral-white placeholder:text-neutral-white/20 focus:outline-none focus:ring-2 focus:ring-pastel-indigo/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Declaração do Desejo Ardente</label>
          <textarea 
            value={data.burningDesire}
            onChange={(e) => handleUpdate({ burningDesire: e.target.value })}
            placeholder="Escreva uma declaração clara e concisa do que você pretende alcançar. Como se já fosse realidade..."
            rows={6}
            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-neutral-white/80 placeholder:text-neutral-white/20 focus:outline-none focus:ring-2 focus:ring-pastel-indigo/30 transition-all resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">A Sensação da Conquista</label>
          <textarea 
            value={data.feelings}
            onChange={(e) => handleUpdate({ feelings: e.target.value })}
            placeholder="Descreva como você se sente agora que o objetivo foi alcançado. Quais são as cores, os sons e a emoção?"
            rows={4}
            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-neutral-white/80 placeholder:text-neutral-white/20 focus:outline-none focus:ring-2 focus:ring-pastel-indigo/30 transition-all resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div>
            <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-3">Prioridade Espiritual & Mental</label>
            <div className="grid grid-cols-2 sm:flex gap-2">
              {(['low', 'medium', 'high', 'critical'] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handleUpdate({ priority: p })}
                  className={`flex-1 py-3 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    data.priority === p 
                      ? p === 'low' ? 'bg-pastel-green/20 border-pastel-green text-pastel-green' :
                        p === 'medium' ? 'bg-pastel-blue/20 border-pastel-blue text-pastel-blue' :
                        p === 'high' ? 'bg-pastel-yellow/20 border-pastel-yellow text-pastel-yellow' :
                        'bg-pastel-pink/20 border-pastel-pink text-pastel-pink shadow-[0_0_15px_rgba(248,187,208,0.2)]'
                      : 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/40 hover:border-neutral-white/20'
                  }`}
                >
                  {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : p === 'high' ? 'Alta' : 'Desejo Ardente'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-3">Status da Manifestação</label>
            <select 
              value={data.status}
              onChange={(e) => handleUpdate({ status: e.target.value as Status })}
              className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-4 py-3 text-sm font-bold text-neutral-white/80 focus:outline-none focus:ring-2 focus:ring-pastel-indigo/30 appearance-none"
            >
              <option value="planning">Concepção</option>
              <option value="active">Em Manifestação</option>
              <option value="paused">Em Pausa</option>
              <option value="completed">Materializado</option>
              <option value="canceled">Arquivado</option>
            </select>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-pastel-pink">
          <Zap size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">O Sacrifício Necessário</h3>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">O Que Você Pretende Dar em Troca?</label>
          <textarea 
            value={data.sacrifice}
            onChange={(e) => handleUpdate({ sacrifice: e.target.value })}
            placeholder="Não existe algo em troca de nada. Qual esforço, tempo ou hábito você sacrificará?"
            rows={4}
            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-neutral-white/80 placeholder:text-neutral-white/20 focus:outline-none focus:ring-2 focus:ring-pastel-pink/30 transition-all resize-none font-mono text-sm leading-relaxed"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-pastel-indigo">
          <GitBranch size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">O Plano de Ação</h3>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Crie um Plano Definido</label>
          <textarea 
            value={data.plan}
            onChange={(e) => handleUpdate({ plan: e.target.value })}
            placeholder="Descreva os passos imediatos. Comece agora, esteja você pronto ou não."
            rows={6}
            className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-neutral-white/80 placeholder:text-neutral-white/20 focus:outline-none focus:ring-2 focus:ring-pastel-indigo/30 transition-all resize-none font-mono text-sm leading-relaxed"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-pastel-green">
          <Calendar size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">A Data Limite</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Início</label>
              <input 
                type="date" 
                value={data.startDate}
                onChange={(e) => handleUpdate({ startDate: e.target.value })}
                className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-3 md:px-4 py-3 text-[10px] md:text-xs font-bold text-neutral-white/80 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Conquista</label>
              <input 
                type="date" 
                value={data.deadline}
                onChange={(e) => handleUpdate({ deadline: e.target.value })}
                className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-3 md:px-4 py-3 text-[10px] md:text-xs font-bold text-neutral-white/80 [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl gap-4">
            <div>
              <p className="text-xs font-bold text-neutral-white/80">Recorrência Mental</p>
              <p className="text-[10px] text-neutral-white/30 uppercase tracking-wider mt-1">Reforçar este desejo periodicamente?</p>
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              {data.isRecurring && (
                <select 
                  value={data.recurrenceInterval}
                  onChange={(e) => handleUpdate({ recurrenceInterval: e.target.value as any })}
                  className="bg-neutral-white/10 border border-neutral-white/10 rounded-lg px-2 py-1.5 text-[10px] font-bold text-pastel-indigo"
                >
                  <option value="monthly">Mensal</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="yearly">Anual</option>
                </select>
              )}
              <button 
                onClick={() => handleUpdate({ isRecurring: !data.isRecurring })}
                className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${data.isRecurring ? 'bg-neutral-white' : 'bg-neutral-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-neutral-black transition-all ${data.isRecurring ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        <div className="border-2 border-dashed border-neutral-white/10 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center gap-4 bg-neutral-white/5 hover:bg-neutral-white/10 transition-all cursor-pointer group">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-neutral-black flex items-center justify-center text-neutral-white/30 group-hover:text-pastel-indigo group-hover:scale-110 transition-all">
            <ImageIcon size={24} className="md:w-[32px] md:h-[32px]" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-neutral-white/80">Imagens de Manifestação</h4>
            <p className="text-[10px] md:text-xs text-neutral-white/30 mt-1 uppercase tracking-widest">Visualize o seu sucesso</p>
          </div>
          <button 
            onClick={() => {
              const mockMedia = { 
                id: Math.random().toString(), 
                url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
                type: 'image' as const,
                name: 'Manifestacao_' + (data.media.length + 1) + '.png'
              };
              handleUpdate({ media: [...data.media, mockMedia] });
            }}
            className="mt-4 px-6 py-2.5 bg-neutral-white/10 hover:bg-neutral-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Adicionar Imagem
          </button>
        </div>

        <div className="border-2 border-dashed border-neutral-white/10 rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center gap-4 bg-neutral-white/5 hover:bg-neutral-white/10 transition-all cursor-pointer group">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-neutral-black flex items-center justify-center text-neutral-white/30 group-hover:text-pastel-pink group-hover:scale-110 transition-all">
            <Zap size={24} className="md:w-[32px] md:h-[32px]" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-neutral-white/80">Vídeos Motivacionais</h4>
            <p className="text-[10px] md:text-xs text-neutral-white/30 mt-1 uppercase tracking-widest">A energia em movimento</p>
          </div>
          <button 
            onClick={() => {
              const videoUrl = prompt('Insira a URL do vídeo (YouTube/Vimeo/MP4):');
              if (videoUrl) {
                const mockMedia = { 
                  id: Math.random().toString(), 
                  url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
                  type: 'video' as const,
                  name: 'Video_Motivacional_' + (data.media.length + 1),
                  videoUrl: videoUrl
                };
                handleUpdate({ media: [...data.media, mockMedia] });
              }
            }}
            className="mt-4 px-6 py-2.5 bg-neutral-white/10 hover:bg-neutral-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Adicionar Vídeo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <AnimatePresence>
          {data.media.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-white/10 group"
            >
              <img src={item.url} alt={item.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-3">
                <div className="flex items-center gap-2 mb-2">
                  {item.type === 'video' ? <Zap size={10} className="text-pastel-pink" /> : <ImageIcon size={10} className="text-pastel-indigo" />}
                  <p className="text-[8px] font-bold text-neutral-white truncate uppercase tracking-widest">{item.name}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-neutral-white/10 hover:bg-neutral-white/20 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all">Ver</button>
                  <button 
                    onClick={() => handleUpdate({ media: data.media.filter(m => m.id !== item.id) })}
                    className="w-8 h-8 flex items-center justify-center bg-pastel-pink/20 hover:bg-pastel-pink text-pastel-pink hover:text-neutral-black rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pastel-indigo/20 rounded-2xl">
            <Activity className="text-pastel-indigo w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-bold text-neutral-white">Mecânica de Evolução</h3>
            <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-[0.2em]">Interpretação e Contexto Evolutivo</p>
          </div>
        </div>
        <button 
          onClick={() => {
            const newKPI: KPI = {
              id: Math.random().toString(36).substr(2, 9),
              name: '',
              tipoMetrica: 'frequencia',
              contexto: 'geral',
              interpretacao: 'streak',
              formaMedicao: 'Automática (IA)',
              pontoAtual: 'Início',
              objetivoDesejado: 'Consistência',
              ritmoEsperado: 'Natural',
              evolucaoEsperada: '',
              frequencia: 'daily',
              source: 'manual',
              visualization: 'area'
            };
            handleUpdate({ kpis: [...data.kpis, newKPI] });
          }}
          className="flex items-center gap-2 px-6 py-3 bg-pastel-indigo text-neutral-black rounded-2xl font-bold text-xs hover:scale-105 transition-all shadow-xl shadow-pastel-indigo/20"
        >
          <Plus size={16} />
          SINTONIZAR DIMENSÃO
        </button>
      </div>

      <div className="bg-pastel-indigo/5 border border-pastel-indigo/10 rounded-[2.5rem] p-6 mb-8 flex flex-col md:flex-row items-start gap-6">
        <div className="p-3 bg-pastel-indigo/10 rounded-xl shrink-0">
          <Brain size={20} className="text-pastel-indigo" />
        </div>
        <div className="space-y-4 flex-1">
          <div>
            <h4 className="text-sm font-bold text-neutral-white/80">Contexto Geral de Evolução (Propósito Humano)</h4>
            <p className="text-[10px] text-neutral-white/30 uppercase tracking-widest mt-1 mb-3">Como a IA deve compreender o sucesso desta jornada?</p>
            <textarea 
              value={data.evolutionaryContext || ''}
              onChange={(e) => handleUpdate({ evolutionaryContext: e.target.value })}
              placeholder="Descreva a essência da mudança que você busca. Ex: 'Busco uma relação mais fluida com o trabalho, onde a produtividade nasça da clareza e não do esforço bruto.'"
              className="w-full bg-neutral-white/5 border border-neutral-white/5 rounded-2xl p-4 text-xs text-neutral-white/60 focus:outline-none focus:border-pastel-indigo/50 min-h-[80px] resize-none leading-relaxed transition-all"
            />
          </div>
          <div className="p-4 bg-pastel-indigo/10 rounded-2xl border border-pastel-indigo/20">
             <p className="text-[10px] text-neutral-white/40 leading-relaxed">
              <Sparkles size={12} className="inline mr-2 text-pastel-indigo" />
              O sistema detecta automaticamente padrões de <span className="text-pastel-indigo font-bold">Tempo, Frequência e Ritmo</span>. As dimensões abaixo servem para dar <span className="text-pastel-green font-bold">significado qualitativo</span> a esses dados.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <AnimatePresence mode="popLayout">
          {data.kpis.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 border-2 border-dashed border-neutral-white/5 rounded-[3rem] flex flex-col items-center justify-center text-neutral-white/20 gap-6 bg-neutral-white/[0.01]"
            >
              <div className="p-6 bg-neutral-white/5 rounded-full">
                <Target size={40} strokeWidth={1} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.3em]">Nenhuma dimensão de progresso sintonizada.</p>
            </motion.div>
          ) : (
            data.kpis.map((kpi) => (
              <motion.div 
                key={kpi.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-neutral-white/5 border border-neutral-white/10 rounded-[3rem] p-8 md:p-10 space-y-10 relative group hover:bg-neutral-white/[0.07] transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-pastel-indigo uppercase tracking-[0.2em] ml-1 opacity-60">Dimensão da Prática</label>
                    <input 
                      type="text" 
                      value={kpi.name}
                      onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, name: e.target.value } : k) })}
                      placeholder="Ex: Profundidade do Estudo ou Qualidade do Foco"
                      className="w-full bg-transparent border-none text-2xl md:text-3xl font-headline font-bold text-neutral-white placeholder:text-neutral-white/10 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => handleUpdate({ kpis: data.kpis.filter(k => k.id !== kpi.id) })}
                    className="w-12 h-12 rounded-full border border-neutral-white/10 flex items-center justify-center text-neutral-white/20 hover:bg-pastel-pink/20 hover:text-pastel-pink transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Esfera de Influência</label>
                    </div>
                    <select 
                      value={kpi.contexto}
                      onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, contexto: e.target.value as any } : k) })}
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-neutral-white/80 focus:outline-none focus:border-pastel-indigo appearance-none transition-all"
                    >
                      <option value="geral">Geral / Multidimensão</option>
                      <option value="leitura">Cognitivo / Estudo</option>
                      <option value="prática">Ação / Técnica</option>
                      <option value="foco">Consciência / Presença</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Arquétipo Evolutivo</label>
                    </div>
                    <select 
                      value={kpi.interpretacao}
                      onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, interpretacao: e.target.value as any } : k) })}
                      className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-neutral-white/80 focus:outline-none focus:border-pastel-indigo appearance-none transition-all"
                    >
                      <option value="streak">Consistência (Caminho da Repetição)</option>
                      <option value="subjetiva">Nível de Percepção (Caminho Interno)</option>
                      <option value="acumulativa">Acúmulo de Valor (Caminho da Obra)</option>
                      <option value="intensidade">Aprofundamento (Caminho da Maestria)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Interpretação da IA</label>
                    </div>
                    <div className="w-full bg-pastel-green/5 border border-pastel-green/10 rounded-2xl px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles size={14} className="text-pastel-green" />
                        <span className="text-[10px] font-bold text-pastel-green uppercase tracking-widest">Automática</span>
                      </div>
                      <div className="px-2 py-0.5 bg-pastel-green/20 rounded-md text-[8px] font-bold text-pastel-green uppercase tracking-wider">Contextual</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-neutral-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-neutral-white/60 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} className="text-pastel-indigo" />
                      Instrução Contextual (Guia da Memória)
                    </h4>
                    <span className="text-[9px] font-medium text-neutral-white/20 italic">Ensine a IA a perceber seu progresso</span>
                  </div>
                  <textarea 
                    value={kpi.evolucaoEsperada}
                    onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, evolucaoEsperada: e.target.value } : k) })}
                    placeholder="Como você descreveria o 'sentir' da evolução nesta dimensão? Ex: 'Perceba se estou saindo da prática com menos fadiga mental, indicando que a técnica está se tornando natural.'"
                    className="w-full bg-neutral-white/5 border border-neutral-white/5 rounded-[2rem] p-6 text-sm text-neutral-white/80 focus:outline-none focus:border-pastel-indigo min-h-[100px] resize-none leading-relaxed transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest ml-1">Estados de Transição</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-neutral-white/[0.02] border border-neutral-white/5 rounded-2xl p-5 group-hover:bg-neutral-white/5 transition-all">
                        <label className="block text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest mb-2">Ponto de Partida</label>
                        <input 
                          type="text" 
                          value={kpi.pontoAtual}
                          onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, pontoAtual: e.target.value } : k) })}
                          className="bg-transparent border-none text-sm font-bold text-neutral-white focus:outline-none p-0 w-full"
                          placeholder="Ex: Confusão"
                        />
                      </div>
                      <div className="bg-neutral-white/[0.02] border border-neutral-white/5 rounded-2xl p-5 group-hover:bg-neutral-white/5 transition-all">
                        <label className="block text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest mb-2">Destino Desejado</label>
                        <input 
                          type="text" 
                          value={kpi.objetivoDesejado}
                          onChange={(e) => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, objetivoDesejado: e.target.value } : k) })}
                          className="bg-transparent border-none text-sm font-bold text-pastel-green focus:outline-none p-0 w-full"
                          placeholder="Ex: Maestria"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest ml-1">Frequência da Observação</h4>
                    <div className="flex gap-2">
                      {['daily', 'weekly', 'monthly'].map((f) => (
                        <button
                          key={f}
                          onClick={() => handleUpdate({ kpis: data.kpis.map(k => k.id === kpi.id ? { ...k, frequencia: f as any } : k) })}
                          className={`flex-1 py-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                            kpi.frequencia === f 
                              ? 'bg-pastel-indigo/20 border-pastel-indigo/40 text-pastel-indigo' 
                              : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20 hover:bg-neutral-white/10'
                          }`}
                        >
                          {f === 'daily' ? 'Diária' : f === 'weekly' ? 'Semanal' : 'Mensal'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }}
      className="space-y-12"
    >
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-pastel-pink">
            <ShieldAlert size={20} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Matriz de Riscos</h3>
          </div>
          <button 
            onClick={() => {
              const newRisk: Risk = {
                id: Math.random().toString(),
                description: '',
                probability: 3,
                impact: 3,
                mitigation: ''
              };
              handleUpdate({ risks: [...data.risks, newRisk] });
            }}
            className="text-xs font-bold text-pastel-pink hover:text-pastel-pink/80 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Mapear Novo Risco
          </button>
        </div>

        <div className="space-y-4">
          {data.risks.map((risk) => (
            <div key={risk.id} className="bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-5 md:p-6 space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Descrição do Risco</label>
                  <input 
                    type="text" 
                    value={risk.description}
                    onChange={(e) => handleUpdate({ risks: data.risks.map(r => r.id === risk.id ? { ...r, description: e.target.value } : r) })}
                    placeholder="Ex: Atraso na entrega..."
                    className="w-full bg-transparent border-b border-neutral-white/10 py-2 text-sm font-bold text-neutral-white focus:outline-none focus:border-pastel-pink/50 transition-all"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Probabilidade</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => handleUpdate({ risks: data.risks.map(r => r.id === risk.id ? { ...r, probability: v as any } : r) })}
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-[10px] font-bold transition-all ${
                            risk.probability === v ? 'bg-pastel-pink text-neutral-black' : 'bg-neutral-white/10 text-neutral-white/30 hover:text-neutral-white/60'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Impacto</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button 
                          key={v}
                          onClick={() => handleUpdate({ risks: data.risks.map(r => r.id === risk.id ? { ...r, impact: v as any } : r) })}
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-[10px] font-bold transition-all ${
                            risk.impact === v ? 'bg-pastel-pink text-neutral-black' : 'bg-neutral-white/10 text-neutral-white/30 hover:text-neutral-white/60'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-neutral-white/50 uppercase tracking-widest mb-2">Plano de Mitigação</label>
                <textarea 
                  value={risk.mitigation}
                  onChange={(e) => handleUpdate({ risks: data.risks.map(r => r.id === risk.id ? { ...r, mitigation: e.target.value } : r) })}
                  placeholder="O que fazer se este risco se concretizar?"
                  rows={2}
                  className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-xl px-4 py-3 text-xs text-neutral-white/40 focus:outline-none focus:ring-1 focus:ring-pastel-pink/30 transition-all resize-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-pastel-blue">
          <GitBranch size={20} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Objetivos Relacionados & Dependências</h3>
        </div>
        <div className="bg-neutral-white/5 border border-neutral-white/10 rounded-3xl p-8">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-white/20" />
              <input 
                type="text" 
                placeholder="Buscar objetivos existentes para vincular..."
                className="w-full bg-neutral-black border border-neutral-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-neutral-white/40 focus:outline-none focus:ring-2 focus:ring-pastel-blue/30"
              />
            </div>
            <button className="px-6 py-3 bg-neutral-white/10 hover:bg-neutral-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Vincular</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.relatedObjectives.length === 0 ? (
              <p className="text-[10px] text-neutral-white/20 uppercase tracking-widest italic">Nenhuma dependência vinculada.</p>
            ) : (
              data.relatedObjectives.map(obj => (
                <div key={obj.id} className="flex items-center gap-2 px-4 py-2 bg-pastel-blue/10 border border-pastel-blue/20 rounded-full text-[10px] font-bold text-pastel-blue">
                  <ArrowUpRight size={12} />
                  {obj.title}
                  <button className="hover:text-neutral-white"><X size={10} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-neutral-black text-neutral-white font-body pb-32">
      {/* Focus Ritual Overlay */}
      <AnimatePresence>
        {isFocusActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-neutral-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-2xl space-y-12"
            >
              <div className="space-y-4">
                <p className="text-pastel-indigo font-bold uppercase tracking-[0.5em] text-xs">Ritual de Manifestação</p>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-neutral-white font-headline">
                  {formatTime(focusTime)}
                </h2>
                <div className="w-64 h-1 bg-neutral-white/10 mx-auto rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-pastel-indigo h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((focusTime / 300) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-neutral-white/40 text-sm font-medium">
                  {focusTime < 300 
                    ? `Faltam ${formatTime(300 - focusTime)} para completar o ciclo de 5 minutos de foco total.`
                    : "Ciclo de manifestação completo. Sua mente está agora alinhada com o seu desejo."}
                </p>
              </div>

              <div className="p-8 bg-neutral-white/5 border border-neutral-white/10 rounded-3xl space-y-6">
                <p className="text-xl font-medium text-neutral-white/80 leading-relaxed italic">
                  "{data.title || "Seu Objetivo"}"
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => setIsFocusActive(false)}
                    className="px-8 py-4 bg-neutral-white text-neutral-black rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                  >
                    Continuar Construindo
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-[0.3em]">
                "A persistência é o esforço concentrado necessário para induzir a fé."
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-neutral-black/80 backdrop-blur-xl border-b border-neutral-white/10 px-4 md:px-8 py-4 md:py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <button 
              onClick={onBack}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all group flex-shrink-0"
            >
              <ChevronLeft size={20} className="md:w-[24px] md:h-[24px] group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 md:gap-3 mb-0.5">
                <h1 className="text-sm md:text-xl font-extrabold tracking-tight truncate">Ecosystem</h1>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-pastel-indigo/10 text-pastel-indigo text-[8px] font-black uppercase tracking-[0.2em] rounded border border-pastel-indigo/20">v2.0</span>
              </div>
              <p className="text-[8px] md:text-[10px] text-neutral-white/40 font-bold uppercase tracking-widest truncate">Configuração de Objetivos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={() => setIsFocusActive(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-pastel-indigo/10 hover:bg-pastel-indigo/20 border border-pastel-indigo/30 rounded-xl text-[10px] font-bold text-pastel-indigo transition-all group"
            >
              <Zap size={14} className="group-hover:animate-pulse" />
              Ritual
            </button>
            <button 
              onClick={handleSave}
              className="bg-pastel-green hover:bg-pastel-green/80 text-neutral-black px-4 md:px-8 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all shadow-[0_10px_30px_rgba(168,230,207,0.2)] active:scale-95"
            >
              <Save size={16} className="md:w-[18px] md:h-[18px]" />
              <span className="hidden xs:inline">Finalizar</span>
              <span className="xs:hidden">OK</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 md:px-8 py-8 md:py-16">
        <Stepper currentStep={step} totalSteps={5} />

        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="mt-12 md:mt-20 flex items-center justify-between pt-6 md:pt-8 border-t border-neutral-white/10">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'bg-neutral-white/5 text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10'
            }`}
          >
            <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="hidden xs:inline">Voltar</span>
          </button>
          
          <div className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-[0.2em] md:tracking-[0.3em]">
            {step} / 5
          </div>

          {step < 5 ? (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-pastel-indigo hover:bg-pastel-indigo/80 text-neutral-black rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shadow-[0_10px_25px_rgba(195,177,225,0.2)]"
            >
              Próximo
              <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
          ) : (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-pastel-green hover:bg-pastel-green/80 text-neutral-black rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all shadow-[0_10px_25px_rgba(168,230,207,0.2)]"
            >
              Concluir
              <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
          )}
        </div>
      </main>

      {/* Persistence Indicator */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="bg-neutral-black/90 backdrop-blur border border-neutral-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-pastel-green animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Auto-save: Ativo</span>
        </div>
      </div>
    </div>
  );
}
