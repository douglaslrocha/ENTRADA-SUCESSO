import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Play, Pause, Volume2, VolumeX, 
  Target, Zap, Shield, Calendar, ArrowRight,
  Maximize2, Share2, Download, Heart, Plus,
  CheckCircle2, AlertTriangle, Clock, TrendingUp
} from 'lucide-react';
import { storage } from '../lib/storage';
import MetaBuilderModal, { MetaData } from './MetaBuilderModal';

interface KPI {
  id: string;
  name: string;
  formaMedicao: string;
  pontoAtual: string | number;
  objetivoDesejado: string | number;
  frequencia: string;
  interpretacao?: string;
  arquétipo?: string;
  dimensões?: { nome: string; valor: any }[];
  contexto?: string;
  source: string;
  visualization: string;
}

interface Risk {
  id: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

interface ObjectiveData {
  title: string;
  burningDesire: string;
  feelings: string;
  sacrifice: string;
  plan: string;
  tags: string[];
  priority: string;
  status: string;
  budget: number;
  currency: string;
  startDate: string;
  deadline: string;
  isRecurring: boolean;
  media: { id: string; url: string; type: 'image' | 'video' | 'pdf'; name: string; videoUrl?: string }[];
  kpis: KPI[];
  risks: Risk[];
  metas?: MetaData[];
}

export default function ManifestationView({ 
  data, 
  onBack,
  onViewGoals,
  onSaveMeta
}: { 
  data: ObjectiveData, 
  onBack: () => void,
  onViewGoals?: () => void,
  onSaveMeta?: (meta: MetaData) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metas, setMetas] = useState<MetaData[]>(data.metas || []);

  useEffect(() => {
    // Load draft if exists
    const savedMetas = storage.get<MetaData[]>(`metas_${data.title}`, []);
    if (savedMetas.length > 0) {
      setMetas(savedMetas);
    }
  }, [data.title]);

  const handleSaveMeta = (newMeta: MetaData) => {
    const updatedMetas = [...metas, newMeta];
    setMetas(updatedMetas);
    storage.set(`metas_${data.title}`, updatedMetas);
    if (onSaveMeta) {
      onSaveMeta(newMeta);
    }
  };

  const calculateObjectiveProgress = () => {
    if (!data.kpis || data.kpis.length === 0) return 0;
    // For demo purposes, we'll use a fixed progress or calculate based on targets
    // In a real app, we'd have current values for each KPI
    return 45; 
  };

  const objectiveProgress = calculateObjectiveProgress();

  useEffect(() => {
    if (isPlaying && data.media.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % data.media.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, data.media.length]);

  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${match[2]}`;
    }
    return null;
  };

  const currentMedia = data.media[activeIndex];
  const embedUrl = currentMedia?.type === 'video' ? getEmbedUrl(currentMedia.videoUrl || '') : null;

  return (
    <div className="min-h-screen bg-neutral-black text-neutral-white font-body overflow-x-hidden">
      {/* Background Immersive Media */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {currentMedia?.type === 'video' && embedUrl ? (
              <iframe 
                className="w-full h-full pointer-events-none scale-150"
                src={embedUrl}
                title="Manifestation Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img 
                src={currentMedia?.url || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80"} 
                className="w-full h-full object-cover"
                alt="Manifestation Background"
                referrerPolicy="no-referrer"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-black via-transparent to-neutral-black" />
        <div className="absolute inset-0 bg-neutral-black/40 backdrop-blur-[2px]" />
      </div>

      {/* Header Controls */}
      <nav className="md:fixed relative top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-3 md:py-4 bg-neutral-black/20 backdrop-blur-md border-b border-neutral-white/5 md:border-none">
        <button 
          onClick={onBack}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white hover:bg-neutral-white/10 transition-all group backdrop-blur-md"
        >
          <ChevronLeft size={20} className="md:w-[24px] md:h-[24px] group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsMetaModalOpen(true)}
            className="px-4 md:px-6 py-2.5 md:py-3 bg-neutral-white/5 border border-neutral-white/10 rounded-full font-bold text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-neutral-white/10 transition-all backdrop-blur-md"
          >
            <Plus size={12} className="md:w-[14px] md:h-[14px]" />
            <span className="hidden sm:inline">Criar Meta</span>
            <span className="sm:hidden">Meta</span>
          </button>
          <button className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-white/5 border border-neutral-white/10 items-center justify-center text-neutral-white/40 hover:text-neutral-white backdrop-blur-md transition-all">
            <Share2 size={18} className="md:w-[20px] md:h-[20px]" />
          </button>
          <button className="px-4 md:px-6 py-2.5 md:py-3 bg-pastel-indigo text-neutral-black rounded-full font-bold text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pastel-indigo/20 transition-all hover:scale-105 active:scale-95">
            <Heart size={14} className="md:w-[16px] md:h-[16px]" fill="currentColor" />
            <span className="hidden sm:inline">Desejo Ativo</span>
            <span className="sm:hidden">Ativo</span>
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pt-6 md:pt-24 pb-32 md:pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
          
          {/* Left Column: The Core Vision */}
          <div className="lg:col-span-7 space-y-12 md:space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                <span className="px-3 py-1 bg-pastel-indigo/20 border border-pastel-indigo/30 rounded-full text-[9px] md:text-[10px] font-bold text-pastel-indigo uppercase tracking-widest">
                  {data.priority === 'critical' ? 'Desejo Ardente' : data.priority}
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">
                  Iniciado em {new Date(data.startDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-neutral-white leading-[1.1] md:leading-[0.9] mb-6 md:mb-8">
                {data.title}
              </h1>
              <div className="p-6 md:p-8 bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-indigo/10 blur-3xl -z-10 group-hover:bg-pastel-indigo/20 transition-all duration-1000" />
                <p className="text-lg md:text-2xl font-medium text-neutral-white/90 leading-relaxed italic font-serif">
                  "{data.burningDesire}"
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            >
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-pastel-pink">
                  <Zap size={16} className="md:w-[18px] md:h-[18px]" />
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">O Sacrifício</h3>
                </div>
                <p className="text-xs md:text-sm text-neutral-white/60 leading-relaxed bg-neutral-white/5 p-5 md:p-6 rounded-xl md:rounded-2xl border border-neutral-white/5">
                  {data.sacrifice}
                </p>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-2 text-pastel-green">
                  <Target size={16} className="md:w-[18px] md:h-[18px]" />
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">A Sensação</h3>
                </div>
                <p className="text-xs md:text-sm text-neutral-white/60 leading-relaxed bg-neutral-white/5 p-5 md:p-6 rounded-xl md:rounded-2xl border border-neutral-white/5">
                  {data.feelings}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="flex items-center gap-2 text-pastel-indigo">
                <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
                <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">O Plano de Manifestação</h3>
              </div>
              <div className="bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 font-mono text-xs md:text-sm leading-loose text-neutral-white/70 whitespace-pre-wrap">
                {data.plan}
              </div>
            </motion.div>

            {/* Metas Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pastel-indigo">
                  <Target size={16} className="md:w-[18px] md:h-[18px]" />
                  <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Metas Estratégicas</h3>
                </div>
                <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                  {metas.length} Metas Definidas
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {/* Create Meta Button */}
                <button 
                  onClick={() => setIsMetaModalOpen(true)}
                  className="group relative h-40 md:h-48 bg-neutral-white/5 border border-dashed border-neutral-white/10 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 transition-all hover:bg-neutral-white/10 hover:border-pastel-indigo/50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-pastel-indigo/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-neutral-white/5 flex items-center justify-center text-neutral-white/20 group-hover:bg-pastel-indigo/20 group-hover:text-pastel-indigo transition-all">
                    <Plus size={20} className="md:w-[24px] md:h-[24px]" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm font-bold text-neutral-white/40 group-hover:text-neutral-white transition-colors">+ Criar Meta</p>
                    <p className="text-[8px] md:text-[10px] text-neutral-white/20 uppercase tracking-widest mt-1">Meta Builder Avançado</p>
                  </div>
                </button>

                {/* Meta Cards */}
                {metas.map((meta) => (
                  <div 
                    key={meta.id}
                    className="group bg-neutral-white/5 border border-neutral-white/10 rounded-2xl md:rounded-3xl p-5 md:p-6 space-y-3 md:space-y-4 hover:bg-neutral-white/10 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pastel-indigo/5 blur-3xl -z-10" />
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-neutral-black"
                        style={{ backgroundColor: meta.color || '#c3b1e1' }}
                      >
                        <Target size={14} className="md:w-[16px] md:h-[16px]" />
                      </div>
                      <div className="px-2 py-0.5 bg-neutral-white/5 rounded text-[8px] font-bold text-neutral-white/40 uppercase tracking-widest">
                        {meta.impact}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-neutral-white mb-1">{meta.intention}</h4>
                      <p className="text-[9px] md:text-[10px] text-neutral-white/40 line-clamp-2 leading-relaxed">
                        {meta.description || 'Sem descrição...'}
                      </p>
                    </div>
                    <div className="pt-3 md:pt-4 flex items-center justify-between border-t border-neutral-white/5">
                      <div className="flex items-center gap-2">
                        <Clock size={10} className="text-neutral-white/20 md:w-[12px] md:h-[12px]" />
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/30">
                          {new Date(meta.deadline).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-pastel-green">
                        <CheckCircle2 size={10} className="md:w-[12px] md:h-[12px]" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Ativa</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Board & Metrics */}
          <div className="lg:col-span-5 space-y-8 md:space-y-12 lg:sticky lg:top-32">
            {/* Visual Carousel */}
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-neutral-white/10 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  {currentMedia?.type === 'video' && embedUrl ? (
                    <div className="w-full h-full bg-neutral-black">
                      <iframe 
                        className="w-full h-full"
                        src={embedUrl}
                        title="Manifestation Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : currentMedia?.type === 'video' ? (
                    <div className="w-full h-full bg-neutral-black flex flex-col items-center justify-center p-8 md:p-12 text-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pastel-pink/20 flex items-center justify-center text-pastel-pink mb-4 md:mb-6">
                        <Play size={24} className="md:w-[32px] md:h-[32px]" fill="currentColor" />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-neutral-white mb-2">{currentMedia.name}</h4>
                      <p className="text-[10px] text-neutral-white/40 uppercase tracking-widest">Vídeo Motivacional</p>
                      <a 
                        href={currentMedia.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-6 md:mt-8 px-5 md:px-6 py-2.5 md:py-3 bg-neutral-white/10 hover:bg-neutral-white/20 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        Assistir Agora
                      </a>
                    </div>
                  ) : (
                    <img 
                      src={currentMedia?.url} 
                      className="w-full h-full object-cover"
                      alt="Manifestation"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Carousel Controls */}
              <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-neutral-black/40 backdrop-blur-md rounded-full border border-neutral-white/10">
                {data.media.map((media, i) => (
                  <button 
                    key={media.id || i}
                    onClick={() => setActiveIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeIndex ? 'bg-neutral-white w-3 md:w-4' : 'bg-neutral-white/20'}`}
                  />
                ))}
              </div>

              <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-col gap-2 md:gap-3">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-neutral-black/40 backdrop-blur-md border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-neutral-white transition-all"
                >
                  {isPlaying ? <Pause size={16} className="md:w-[18px] md:h-[18px]" /> : <Play size={16} className="md:w-[18px] md:h-[18px]" />}
                </button>
                <button className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-neutral-black/40 backdrop-blur-md border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-neutral-white backdrop-blur-md transition-all">
                  <Maximize2 size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            </div>

            {/* Deadline Countdown */}
            <div className="bg-pastel-indigo/10 border border-pastel-indigo/20 rounded-2xl md:rounded-3xl p-6 md:p-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-pastel-indigo mb-1">
                  <Calendar size={14} className="md:w-[16px] md:h-[16px]" />
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Data Final</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-neutral-white">
                  {new Date(data.deadline).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl md:text-3xl font-bold text-pastel-indigo">
                  {Math.max(0, Math.ceil((new Date(data.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) || 0}
                </p>
                <p className="text-[9px] md:text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Dias Restantes</p>
              </div>
            </div>

            {/* Success Metrics */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[9px] md:text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Métricas de Sucesso</h3>
                <button 
                  onClick={onViewGoals}
                  className="text-[9px] md:text-[10px] font-bold text-pastel-indigo uppercase tracking-widest hover:underline"
                >
                  Ver Todas
                </button>
              </div>
              <div className="space-y-3">
                {data.kpis.map((kpi) => (
                  <div key={kpi.id || kpi.name} className="bg-neutral-white/5 border border-neutral-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 flex items-center justify-between group hover:bg-neutral-white/10 transition-all">
                    <div>
                      <p className="text-[11px] md:text-xs font-bold text-neutral-white/80 mb-1">
                        {kpi.name}
                        {kpi.arquétipo && (
                          <span className="ml-2 text-[8px] bg-pastel-indigo/20 text-pastel-indigo px-1.5 py-0.5 rounded uppercase tracking-tighter">
                            {kpi.arquétipo}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[8px] font-bold text-neutral-white/30 uppercase tracking-widest mb-1">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-neutral-white/20" />
                            {kpi.pontoAtual}
                          </span>
                          <span className="flex items-center gap-1">
                            {kpi.objetivoDesejado}
                            <span className="w-1 h-1 rounded-full bg-pastel-indigo/40" />
                          </span>
                        </div>
                        
                        {(kpi as any).dimensões && (kpi as any).dimensões.length > 0 && (
                          <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                            {(kpi as any).dimensões.map((dim: any, i: number) => (
                              <div key={i} className="flex-shrink-0 flex flex-col gap-0.5">
                                <span className="text-[7px] text-neutral-white/20 uppercase">{dim.nome}</span>
                                <span className="text-[9px] font-bold text-pastel-green">{dim.valor}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-neutral-white/10 rounded-full overflow-hidden flex gap-0.5">
                            <div 
                              className={`h-full transition-all duration-700 ${isNaN(Number(kpi.pontoAtual)) ? 'bg-gradient-to-r from-neutral-white/5 via-pastel-indigo/40 to-neutral-white/5' : 'bg-pastel-indigo'}`} 
                              style={{ width: isNaN(Number(kpi.objetivoDesejado)) ? '100%' : '45%' }} 
                            />
                            <div className="w-px h-full bg-neutral-black/50" style={{ marginLeft: '25%' }} />
                            <div className="w-px h-full bg-neutral-black/50" style={{ marginLeft: '50%' }} />
                            <div className="w-px h-full bg-neutral-black/50" style={{ marginLeft: '75%' }} />
                          </div>
                          <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/30">
                            {kpi.arquétipo === 'maestria' ? 'Evoluindo' : 
                             kpi.arquétipo === 'habito' ? 'Estável' :
                             isNaN(Number(kpi.pontoAtual)) ? 'Sintonizando' : '45%'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative group/flame">
                         <Zap size={14} className="text-pastel-indigo animate-pulse" />
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-black px-2 py-1 rounded text-[8px] font-bold text-neutral-white opacity-0 group-hover/flame:opacity-100 transition-opacity whitespace-nowrap border border-neutral-white/10">
                           MOMENTUM ALTO
                         </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs md:text-sm font-bold text-pastel-green">
                          {kpi.objetivoDesejado} {kpi.formaMedicao}
                        </p>
                        <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Alvo Desejado</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Affirmation */}
      <footer className="md:fixed relative bottom-0 left-0 w-full z-50 p-4 md:p-8 pointer-events-none">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="bg-neutral-black/80 backdrop-blur-xl border border-neutral-white/10 px-6 md:px-8 py-3 md:py-4 rounded-full pointer-events-auto shadow-2xl">
            <p className="text-[8px] md:text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center leading-relaxed">
              "Tudo o que a mente pode conceber e acreditar, ela pode realizar." — Napoleon Hill
            </p>
          </div>
        </div>
      </footer>

      <MetaBuilderModal 
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={handleSaveMeta}
        objectiveTitle={data.title}
        objectiveProgress={objectiveProgress}
        objectiveDeadline={data.deadline}
      />
    </div>
  );
}
