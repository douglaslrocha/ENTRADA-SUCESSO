import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, ArrowRight, Sparkles, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { fakeDB } from '../core/fakeDB';
import { safeLocalStorage } from '../utils/storage';

interface DayData {
  nome: string;
  energia: 'baixa' | 'media' | 'alta';
  foco: 'baixo' | 'medio' | 'alto';
  emocional: string;
  interferencias: string;
  direcao: 'progredindo' | 'travado' | 'recuando';
  tarefas_concluidas: number;
  tarefas_planejadas: number;
  coerencia: 'baixa' | 'media' | 'alta';
  acoes: string[];
  reflexao: string;
}

const DEFAULT_DATA: DayData = {
  nome: "Douglas",
  energia: "baixa",
  foco: "alto",
  emocional: "alegria",
  interferencias: "influenciado",
  direcao: "travado",
  tarefas_concluidas: 3,
  tarefas_planejadas: 7,
  coerencia: "media",
  acoes: ["iniciou tarefas", "procrastinou", "retomou foco"],
  reflexao: "Tentei focar mas as notificações me tiraram do caminho no meio da tarde."
};

const CLOSURE_IMAGES = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1920",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=1920"
];

function generateClosureMessage(data: DayData): string {
  const { nome, energia, foco, tarefas_concluidas, tarefas_planejadas, direcao, acoes } = data;
  const efficiency = tarefas_concluidas / tarefas_planejadas;
  const hadProcrastination = acoes.includes("procrastinou");
  
  let diagnosis = "";
  if (hadProcrastination) {
    diagnosis = `${nome}, você começou bem, mas cedeu no meio do processo.`;
  } else if (efficiency < 0.5) {
    diagnosis = `${nome}, você teve clareza, mas não sustentou a execução.`;
  } else if (foco === 'alto' && efficiency >= 0.8) {
    diagnosis = `${nome}, você dominou seu dia com clareza e vigor.`;
  } else {
    diagnosis = `${nome}, você manteve o curso, mas sem a intensidade necessária.`;
  }

  let body = "";
  if (hadProcrastination) {
    body = `Procrastinar quando se tem clareza é uma escolha de autossabotagem. Você permitiu que a distração fosse maior que sua vontade.`;
  } else if (energia === 'baixa' && foco === 'alto') {
    body = `Mesmo com baixa energia, você manteve o foco. Isso mostra controle, mas terminar apenas ${tarefas_concluidas} tarefas indica que você permitiu que o ambiente vencesse sua prioridade.`;
  } else {
    body = `A constatação é clara: você está operando abaixo do seu potencial. A direção está ${direcao}, e amanhã exige que você rompa essa inércia.`;
  }

  let directionText = "Amanhã exige mais firmeza — não mais intenção.";
  if (efficiency >= 0.9) {
    directionText = "Agora o desafio é transformar essa consistência em um padrão inegociável.";
  }

  return `${diagnosis}\n\n${body}\n\n${directionText}`;
}

export const DayClosureSection: React.FC<{ 
  diaryId?: string;
  data?: DayData; 
  onComplete?: () => void 
}> = ({ 
  diaryId = safeLocalStorage.getItem('last_edited_diary_id') || "default",
  data = DEFAULT_DATA,
  onComplete 
}) => {
  const { id: urlParamId } = useParams();
  const effectiveDiaryId = urlParamId || diaryId || safeLocalStorage.getItem('last_edited_diary_id') || "default";

  const [bgImageIndex, setBgImageIndex] = useState(0);

  const entry = useMemo(() => {
    return fakeDB.diaries.find(e => String(e.id) === String(effectiveDiaryId));
  }, [effectiveDiaryId]);

  const [isCompleted, setIsCompleted] = useState(() => {
    return entry?.status === 'completed';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBgImageIndex((prev) => (prev + 1) % CLOSURE_IMAGES.length);
    }, 6000); // Crossfade every 6 seconds
    return () => clearInterval(interval);
  }, []);

  const savedData = useMemo(() => {
    if (!entry) return null;
    if (entry.status !== 'completed') return null;
    
    const metrics = fakeDB.getSleepMetrics(entry.id);
    const formatDuration = (ms: number) => {
      const hrs = Math.floor(ms / 3600000);
      const mins = Math.floor((ms % 3600000) / 60000);
      return `${hrs}h ${mins}m`;
    };
    const durMs = entry.duration || 0;
    const durHrs = Math.floor(durMs / 3600000);
    const durMins = Math.floor((durMs % 3600000) / 60000);

    return {
      inicio_dia: entry.time,
      fim_dia: entry.endAt ? new Date(entry.endAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--',
      duracao: durHrs > 0 ? `${durHrs}h ${durMins}m` : `${durMins}m`,
      tempo_sono: metrics.currentSleepMs ? formatDuration(metrics.currentSleepMs) : null,
      media_sono: metrics.averageSleepMs ? formatDuration(metrics.averageSleepMs) : null,
      analise_ia: entry.analise_ia
    };
  }, [entry]);

  const message = useMemo(() => {
    if (savedData?.analise_ia) return savedData.analise_ia;
    return generateClosureMessage(data);
  }, [data, savedData]);

  const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleFinalize = () => {
    const finalizedEntry = fakeDB.finishDiaryEntry(effectiveDiaryId);
    
    if (finalizedEntry) {
      // Store AI analysis in entry too
      fakeDB.updateDiaryEntry(effectiveDiaryId, { analise_ia: message });
    }
    
    setIsCompleted(true);
    
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Immersive Background System (Adapted from DiaryEditorPage) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "linear" }}
            className="absolute inset-0"
          >
            <img 
              src={CLOSURE_IMAGES[bgImageIndex]} 
              alt="Ritualistic closure background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Dynamic Overlays: Permanent Dark Presence */}
        <div className="absolute inset-0 bg-black/70 sm:bg-black/60" />

        {/* Atmospheric Depth, Gradient & Grain */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 opacity-90" />
        <div 
          className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        
        {/* Subtle Atmospheric Blur */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/5 blur-[120px] pointer-events-none" />
      </div>

      <div className="relative z-10 w-full h-full max-w-5xl mx-auto flex flex-col justify-between px-6 sm:px-12 py-12 sm:py-20 text-center overflow-y-auto no-scrollbar">
        {/* TOP BAR / NAVIGATION */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center w-full"
        >
          <div className="inline-flex items-center gap-2 group cursor-default">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/20">
              <Sparkles className="w-4 h-4 text-orange-400 group-hover:scale-125 transition-transform" />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-[0.3em] font-black text-white/70 uppercase">
              RITUAL DE ENCERRAMENTO
            </span>
          </div>
          
          <button 
            onClick={() => onComplete?.()}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 transition-all active:scale-90"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </motion.div>

        {/* MAIN CONTENT: AI Analysis Modular Container */}
        <div className="flex-1 flex flex-col items-center justify-center sm:gap-14 py-16 sm:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1.2 }}
            className="relative w-full max-w-3xl p-8 sm:p-14 rounded-[40px] sm:rounded-[60px] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Inner Grain for Container */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="relative z-10 space-y-10 sm:space-y-12">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.15] tracking-tight text-left italic drop-shadow-xl overflow-y-auto max-h-[45vh] sm:max-h-none no-scrollbar pr-4">
                {message.split('\n\n').map((paragraph, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.4, duration: 0.8 }}
                    className={`block ${i === 0 ? 'text-white/95 not-italic font-medium mb-8 sm:mb-12' : 'text-white/70 font-light mt-6 sm:mt-8 text-xl sm:text-2xl lg:text-3xl'}`}
                  >
                    {paragraph}
                  </motion.span>
                ))}
              </h1>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="flex flex-col gap-6 pt-10 border-t border-white/10"
              >
                {/* Métricas do Diário Consolidado */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-widest text-[#FF8A00] font-black mb-1">Início</span>
                    <span className="text-[13px] text-white font-mono tracking-wide">{savedData?.inicio_dia || '--:--'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Fim</span>
                    <span className="text-[13px] text-white font-mono tracking-wide">{savedData?.fim_dia || '--:--'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-widest text-white/40 mb-1">Duração</span>
                    <span className="text-[13px] text-white font-mono tracking-wide">{savedData?.duracao || '--:--'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
                    <span className="text-[8px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Descanso</span>
                    <span className="text-[13px] text-white font-mono tracking-wide">{savedData?.tempo_sono || '--:--'}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md col-span-2 md:col-span-1">
                    <span className="text-[8px] uppercase tracking-widest text-[#FF4D00] font-bold mb-1">Média Sono</span>
                    <span className="text-[13px] text-white font-mono tracking-wide">{savedData?.media_sono || '--:--'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                  <div className="flex flex-col gap-2 text-left">
                    <p className="text-white/40 text-xs sm:text-sm font-light tracking-wide italic">
                      "Você registrou, refletiu e evoluiu hoje."
                    </p>
                    <p className="text-white/30 text-[9px] sm:text-[10px] uppercase tracking-widest font-black">
                      CICLO FECHADO • {currentDate}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-lg">
                     <div className="flex flex-col">
                       <span className="text-[8px] uppercase tracking-[0.2em] text-white/30">Horário</span>
                       <span className="text-[12px] text-white/80 font-mono tracking-wider">{currentTime}</span>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* FOOTER ACTIONS: Separate Modular Button */}
        <div className="flex flex-col gap-10 w-full items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="w-full max-w-md p-1.5 sm:p-2 rounded-[50px] bg-white/10 backdrop-blur-3xl border border-white/10 shadow-inner"
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 50px rgba(255, 77, 0, 0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinalize}
              disabled={isCompleted}
              className={`
                group relative w-full h-16 sm:h-20 rounded-[45px] flex items-center justify-center gap-4 overflow-hidden transition-all duration-700
                ${isCompleted ? 'bg-zinc-900 border-white/5 cursor-default' : 'bg-gradient-to-br from-[#FF8A00] to-[#FF4D00] shadow-[0_20px_40px_rgba(0,0,0,0.4)]'}
              `}
            >
              {/* Premium Sparkles/Grain on Button */}
              {!isCompleted && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000" />
                  <div 
                    className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                  />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
              
              <div className="flex flex-col items-center">
                <span className={`text-[12px] sm:text-[14px] font-black tracking-[0.4em] uppercase transition-colors duration-300 ${isCompleted ? 'text-zinc-600' : 'text-white'}`}>
                  {isCompleted ? 'DIA FINALIZADO' : 'ENCERRAR CICLO DO DIA'}
                </span>
                {!isCompleted && (
                  <span className="text-[8px] sm:text-[9px] text-white/60 tracking-[0.2em] uppercase mt-1 font-bold">
                    RESTAURAR E RECOMEÇAR
                  </span>
                )}
              </div>

              {isCompleted ? (
                <Moon className="w-5 h-5 text-zinc-700 animate-pulse" />
              ) : (
                <div className="relative">
                   <Sparkles className="w-5 h-5 text-white/80 group-hover:text-white transition-all duration-500" />
                   <div className="absolute inset-0 bg-white blur-xl opacity-0 group-hover:opacity-30 rounded-full transition-opacity" />
                </div>
              )}
            </motion.button>
          </motion.div>

          {/* Bottom Zen Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.6 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.p 
              className="text-[9px] sm:text-[10px] text-white/30 tracking-[0.3em] uppercase font-black"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              "Evoluir é sua responsabilidade inegociável."
            </motion.p>
          </motion.div>
        </div>
      </div>
      
      {/* Animated Dust Particles for Atmosphere (Refined) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/30 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%", 
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-15%"],
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: Math.random() * 15 + 15, 
              repeat: Infinity,
              delay: Math.random() * 10 
            }}
          />
        ))}
      </div>
    </div>
  );
};
