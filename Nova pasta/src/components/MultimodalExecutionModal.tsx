import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, CheckCircle2, Clock, 
  Zap, Volume2, VolumeX, BookOpen, 
  Brain, Activity, Eye, PlayCircle,
  RotateCcw, ChevronRight, Target,
  FileText, Sparkles, Award, History,
  Maximize2, Plus, Minus, Info,
  Wind, Mic, Dumbbell, Image as ImageIcon,
  ChevronLeft
} from 'lucide-react';
import { TaskData } from './TaskBuilderModal';
import { storage } from '../lib/storage';

interface MultimodalExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskData;
  onUpdate: (updatedTask: TaskData) => void;
  objectiveTitle: string;
  metaIntention?: string;
  initialElapsedSeconds?: number;
  initialStatus?: TaskData['status'];
}

export default function MultimodalExecutionModal({ 
  isOpen, 
  onClose, 
  task, 
  onUpdate,
  objectiveTitle,
  metaIntention,
  initialElapsedSeconds,
  initialStatus
}: MultimodalExecutionModalProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds ?? task.actualDuration ?? 0);
  const [status, setStatus] = useState<TaskData['status']>(initialStatus || task.status || 'pending');
  const [timerSeconds, setTimerSeconds] = useState(task.multimodalConfig?.timerSeconds || 0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [mediaCurrentTime, setMediaCurrentTime] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0); // pages read today
  const [isMuted, setIsMuted] = useState(false);
  const [currentRepetition, setCurrentRepetition] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Storage for custom items
  const [customSensations, setCustomSensations] = useState<string[]>(() => storage.get('energy_work_sensations', []));
  const [customPhenomena, setCustomPhenomena] = useState<string[]>(() => storage.get('energy_work_phenomena', []));

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const hasInitializedRef = useRef(false);

  // Sync with props when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setElapsedSeconds(initialElapsedSeconds ?? task.actualDuration ?? 0);
      setStatus(initialStatus || task.status || 'pending');
      setTimerSeconds(task.multimodalConfig?.timerSeconds || 0);
      setReadingProgress(0); // Reset page progress
      setCurrentMediaIndex(0);
      setShowFeedback(false);
      setCurrentRepetition(1);
      hasInitializedRef.current = true;
    }
  }, [isOpen, task.id, initialElapsedSeconds, initialStatus]);

  // Sync media with status
  useEffect(() => {
    const media = audioRef.current || videoRef.current;
    if (media) {
      if (status === 'in-progress') {
        const playPromise = media.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Media play failed:", error);
          });
        }
      } else {
        media.pause();
      }
    }
  }, [status]);

  // General Timer for actualDuration
  useEffect(() => {
    if (status === 'in-progress') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
        if (timerSeconds > 0) {
          setTimerSeconds(prev => {
            if (prev <= 1) {
              // Timer ended
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timerSeconds]);

  const handleUpdate = () => {
    onUpdate({
      ...task,
      actualDuration: elapsedSeconds,
      status,
    });
  };

  const handleComplete = () => {
    setStatus('completed');
    setShowFeedback(true);
    handleUpdate();
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Logic for custom phenomena/sensations addition
  const handleAddSensation = () => {
    const name = prompt('Nova sinalética bioenergética:');
    if (name) {
      const updated = [...customSensations, name];
      setCustomSensations(updated);
      storage.set('energy_work_sensations', updated);
    }
  };

  const handleAddPhenomenon = () => {
    const name = prompt('Fenômeno observado:');
    if (name) {
      const updated = [...customPhenomena, name];
      setCustomPhenomena(updated);
      storage.set('energy_work_phenomena', updated);
    }
  };

  const BioenergeticAnimation = () => (
    <AnimatePresence>
      {status === 'in-progress' && task.executionType === 'energy-work' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none z-0 overflow-visible"
        >
          {/* Pranic Streamers (Longer, more fluid consciousness flow) */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                x: [
                  Math.random() * 1000 - 500, 
                  Math.random() * 1000 - 500,
                  Math.random() * 1000 - 500
                ],
                y: [
                  Math.random() * 1000 - 500, 
                  Math.random() * 1000 - 500,
                  Math.random() * 1000 - 500
                ],
                opacity: [0, 0.4, 0],
                scale: [0.5, 2, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 4 + Math.random() * 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute w-[2px] h-32 bg-gradient-to-b from-pastel-indigo/40 to-transparent blur-[2px]"
              style={{ 
                left: `${50 + (Math.random() * 100 - 50)}%`, 
                top: `${50 + (Math.random() * 100 - 50)}%`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            />
          ))}

          {/* Subtle Energy Waves (Expansive) */}
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.1, 0.25, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,202,233,0.2)_0%,transparent_70%)]"
          />
          
          {/* Vibration Interference Pattern */}
          <motion.div 
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 0.05, repeat: Infinity }}
            className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(197,202,233,0.05)_0px,transparent_4px)] mix-blend-screen opacity-30"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  const getTypeColor = () => {
    switch (task.executionType) {
      case 'audio': return 'text-pastel-indigo';
      case 'video': return 'text-pastel-pink';
      case 'reading': return 'text-pastel-yellow';
      case 'exercise': return 'text-pastel-green';
      case 'breathing': return 'text-pastel-blue';
      case 'vocal': return 'text-pastel-orange';
      case 'meditation':
      case 'visualization':
      case 'practice': return 'text-pastel-purple';
      default: return 'text-pastel-indigo';
    }
  };

  const renderExecutionContent = () => {
    switch (task.executionType) {
      case 'audio':
        const audioSrc = task.multimodalConfig?.mediaType === 'upload' ? task.multimodalConfig.mediaFile : task.multimodalConfig?.url;
        return (
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-neutral-white/[0.03] border border-neutral-white/5 flex items-center justify-center">
              <motion.div 
                animate={status === 'in-progress' ? { scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] } : {}}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-pastel-indigo/20 rounded-full blur-3xl"
              />
              {audioSrc && status === 'in-progress' && !isMuted ? (
                <div className="flex items-end gap-1 h-12">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [10, 40, 15, 30, 10] }}
                      transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                      className="w-1.5 bg-pastel-indigo rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <Volume2 size={80} className="text-pastel-indigo opacity-20" />
              )}
            </div>

              <div className="flex items-center justify-center gap-12 text-neutral-white/40 mb-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-white/20">Progresso</p>
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-pastel-indigo" />
                    <span className="text-sm font-bold text-neutral-white">{currentRepetition} / {task.multimodalConfig?.repetitions || 1}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-neutral-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-white/20">Tempo Restante</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-pastel-pink" />
                    <span className="text-sm font-bold text-neutral-white">
                      {mediaDuration > 0 
                        ? formatTime(Math.max(0, Math.floor(mediaDuration - mediaCurrentTime))) 
                        : formatTime(timerSeconds)}
                    </span>
                  </div>
                </div>
              </div>

            <div className="flex items-center gap-12">
               <button 
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-white/20 hover:text-neutral-white transition-all"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              
            <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')}
                className="w-20 h-20 rounded-full bg-neutral-white text-neutral-black flex items-center justify-center shadow-2xl shadow-neutral-white/10"
              >
                {status === 'in-progress' ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </motion.button>
            </div>
            {audioSrc && (
              <audio 
                ref={audioRef}
                src={audioSrc} 
                muted={isMuted} 
                onPlay={() => setStatus('in-progress')}
                onPause={() => setStatus('paused')}
                onLoadedMetadata={(e) => setMediaDuration(e.currentTarget.duration)}
                onTimeUpdate={(e) => setMediaCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => {
                  triggerCelebration();
                  if (currentRepetition < (task.multimodalConfig?.repetitions || 1)) {
                    setCurrentRepetition(r => r + 1);
                    setStatus('paused'); // Pause to show celebration, user can play again
                  } else {
                    setStatus('paused');
                  }
                }} 
                className="hidden" 
              />
            )}
          </div>
        );
      case 'video':
        const videoSrc = task.multimodalConfig?.mediaType === 'upload' ? task.multimodalConfig.mediaFile : task.multimodalConfig?.url;
        return (
          <div className="flex flex-col items-center space-y-8 w-full max-w-4xl mx-auto">
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-neutral-white/[0.02] border border-neutral-white/10 shadow-2xl">
              {videoSrc ? (
                videoSrc.startsWith('data:') || videoSrc.includes('.mp4') ? (
                  <video 
                    ref={videoRef}
                    src={videoSrc} 
                    controls 
                    className="w-full h-full" 
                    autoPlay={status === 'in-progress'} 
                    onPlay={() => setStatus('in-progress')}
                    onPause={() => setStatus('paused')}
                    onLoadedMetadata={(e) => setMediaDuration(e.currentTarget.duration)}
                    onTimeUpdate={(e) => setMediaCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => {
                      triggerCelebration();
                      if (currentRepetition < (task.multimodalConfig?.repetitions || 1)) {
                        setCurrentRepetition(r => r + 1);
                        setStatus('paused');
                      } else {
                        setStatus('paused');
                      }
                    }}
                  />
                ) : (
                  <iframe 
                    className="w-full h-full"
                    src={videoSrc.includes('youtube') ? videoSrc.replace('watch?v=', 'embed/') : videoSrc}
                    title="Task Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <PlayCircle size={64} className="text-neutral-white/10" />
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-white/20">Sem vídeo configurado</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'reading':
        return (
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-2 mb-4">
               <p className="text-[10px] font-bold text-pastel-yellow uppercase tracking-[0.3em]">Lendo Agora</p>
               <h3 className="text-3xl md:text-5xl font-headline font-black text-neutral-white">{task.multimodalConfig?.bookName || 'Obra não especificada'}</h3>
            </div>
            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="4" className="text-neutral-white/5" />
                <motion.circle
                  cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="100 100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - (readingProgress / (task.multimodalConfig?.dailyPageGoal || 1)) * 100 }}
                  className="text-pastel-yellow" strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                <span className="text-5xl md:text-7xl font-headline font-black text-neutral-white tabular-nums">{readingProgress}</span>
                <span className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-[0.2em]">Páginas de {task.multimodalConfig?.dailyPageGoal || 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setReadingProgress(p => Math.max(0, p - 1))} className="w-14 h-14 rounded-2xl bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white transition-all"><Minus size={20} /></button>
               <button onClick={() => setReadingProgress(p => p + 1)} className="w-20 h-20 rounded-3xl bg-pastel-yellow text-neutral-black flex items-center justify-center shadow-lg shadow-pastel-yellow/20"><Plus size={28} /></button>
            </div>
          </div>
        );
      case 'visualization':
        const media = task.multimodalConfig?.visualizationMedia || [];
        return (
          <div className="w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-center space-y-4">
             <div className="relative w-full max-w-4xl mx-auto overflow-hidden bg-neutral-black shadow-2xl border border-neutral-white/10 flex items-center justify-center h-[65vh] md:h-[80vh] rounded-[2rem]">
                <AnimatePresence mode="wait">
                  {media.length > 0 ? (
                    <motion.div 
                      key={currentMediaIndex}
                      initial={{ opacity: 0, scale: 1.1, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 1.05, x: -20 }}
                      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                       {media[currentMediaIndex].type === 'image' ? (
                         <img 
                           src={media[currentMediaIndex].url} 
                           className="w-full h-full object-contain" 
                           alt="Visualização" 
                           referrerPolicy="no-referrer" 
                         />
                       ) : (
                         <video 
                           key={media[currentMediaIndex].url}
                           src={media[currentMediaIndex].url} 
                           className="w-full h-full object-contain" 
                           autoPlay={status === 'in-progress'} 
                           loop 
                           muted={isMuted}
                           onPlay={() => setStatus('in-progress')}
                           onPause={() => setStatus('paused')}
                         />
                       )}
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 opacity-20">
                       <ImageIcon size={64} />
                       <p className="text-xs font-bold uppercase tracking-widest">Nenhuma mídia carregada</p>
                    </div>
                  )}
                </AnimatePresence>
                
                {/* Minimalist Controls */}
                {media.length > 1 && (
                  <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4 z-20">
                     <button 
                      onClick={() => setCurrentMediaIndex(i => (i - 1 + media.length) % media.length)} 
                      className="w-12 h-12 rounded-full bg-neutral-black/40 backdrop-blur-xl border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-neutral-white hover:bg-neutral-black/60 transition-all"
                     >
                       <ChevronLeft size={24} />
                     </button>
                     <button 
                      onClick={() => setCurrentMediaIndex(i => (i + 1) % media.length)} 
                      className="w-12 h-12 rounded-full bg-neutral-black/40 backdrop-blur-xl border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-neutral-white hover:bg-neutral-black/60 transition-all"
                     >
                       <ChevronRight size={24} />
                     </button>
                  </div>
                )}
             </div>
             
             {/* Action Control */}
             <div className="flex flex-col items-center gap-4">
               <motion.button 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')}
                 className="w-20 h-20 rounded-full bg-pastel-purple text-neutral-black flex items-center justify-center shadow-2xl shadow-pastel-purple/20"
               >
                 {status === 'in-progress' ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
               </motion.button>
               <p className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.2em]">
                 {status === 'in-progress' ? 'Visualizando...' : 'Iniciar Visualização'}
               </p>
             </div>

             {/* Pagination Dots */}
             <div className="flex justify-center gap-2">
                {media.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentMediaIndex(idx)} 
                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentMediaIndex ? 'w-8 bg-pastel-purple' : 'w-1.5 bg-neutral-white/10'}`} 
                  />
                ))}
             </div>
          </div>
        );
      case 'exercise':
        return (
          <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-12">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="p-10 bg-neutral-white/5 rounded-[3rem] border border-neutral-white/10 flex flex-col items-center justify-center space-y-6">
                   <Dumbbell size={64} className="text-pastel-green mb-4" />
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-[0.2em] mb-1">Categoria</p>
                      <h4 className="text-2xl font-bold text-neutral-white uppercase">{task.multimodalConfig?.exerciseCategory || 'Geral'}</h4>
                   </div>
                   {task.multimodalConfig?.exerciseCategory === 'musculation' && (
                     <div className="w-full pt-8 border-t border-neutral-white/5">
                        <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-[0.2em] mb-4 text-center">Foco Muscular</p>
                        <div className="flex flex-wrap justify-center gap-2">
                           {(task.multimodalConfig?.targetMuscles || []).map(muscle => (
                             <span key={muscle} className="px-4 py-2 bg-pastel-green/10 border border-pastel-green/20 rounded-xl text-neutral-white text-[10px] font-bold uppercase tracking-widest">
                               {muscle}
                             </span>
                           ))}
                        </div>
                     </div>
                   )}
                </div>
                <div className="p-10 bg-neutral-white/5 rounded-[4rem] border border-neutral-white/10 flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
                   <div className="relative z-10 text-center">
                      <div className="text-7xl font-headline font-black text-neutral-white tabular-nums">{formatTime(timerSeconds > 0 ? timerSeconds : elapsedSeconds)}</div>
                      <p className="text-[10px] font-bold text-pastel-green uppercase tracking-[0.4em] mt-4">Tempo de Treino</p>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')} className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${status === 'in-progress' ? 'bg-neutral-white text-neutral-black' : 'bg-pastel-green text-neutral-black'}`}>
                        {status === 'in-progress' ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                      </button>
                      <button onClick={() => setTimerSeconds(task.multimodalConfig?.timerSeconds || 0)} className="w-20 h-20 rounded-3xl bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white hover:bg-neutral-white/10 transition-all"><RotateCcw size={28} /></button>
                   </div>
                </div>
             </div>
             {task.multimodalConfig?.exerciseCategory !== 'musculation' && (
               <div className="w-full p-8 bg-neutral-white/5 rounded-3xl border border-neutral-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="text-center">
                        <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Séries</p>
                        <p className="text-xl font-bold text-neutral-white">{currentRepetition}/{task.multimodalConfig?.repetitions || 1}</p>
                     </div>
                  </div>
                  <button onClick={() => setCurrentRepetition(r => r + 1)} className="px-10 py-4 bg-pastel-green text-neutral-black rounded-2xl font-black text-[10px] uppercase tracking-widest">Próxima Série</button>
               </div>
             )}
          </div>
        );
      case 'breathing':
        return (
          <div className="flex flex-col items-center justify-center space-y-16">
             <div className="relative w-80 h-80 md:w-[450px] md:h-[450px] flex items-center justify-center">
                <motion.div 
                  animate={{ 
                    scale: status === 'in-progress' ? [1, 1.5, 1] : 1,
                    opacity: status === 'in-progress' ? [0.2, 0.5, 0.2] : 0.1
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-pastel-blue/30 rounded-full blur-[100px]"
                />
                <div className="relative flex flex-col items-center space-y-8">
                   <Wind size={120} className="text-pastel-blue opacity-40" />
                   <div className="text-center">
                      <motion.h2 
                        animate={status === 'in-progress' ? { opacity: [0.4, 1, 0.4] } : {}}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="text-4xl md:text-6xl font-headline font-black text-neutral-white uppercase tracking-[0.2em]"
                      >
                         {elapsedSeconds % 8 < 4 ? 'Inspira' : 'Expira'}
                      </motion.h2>
                      <div className="text-7xl md:text-9xl font-headline font-black text-neutral-white tabular-nums mt-4">{formatTime(timerSeconds)}</div>
                   </div>
                </div>
             </div>
             <div className="flex gap-8">
                <button onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')} className="w-24 h-24 rounded-full bg-pastel-blue text-neutral-black flex items-center justify-center shadow-2xl shadow-pastel-blue/20">
                   {status === 'in-progress' ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
             </div>
          </div>
        );
      case 'vocal':
        return (
          <div className="flex flex-col items-center justify-center space-y-12">
             <div className="relative w-72 h-72 rounded-full border border-neutral-white/10 flex items-center justify-center overflow-hidden">
                <motion.div 
                   animate={status === 'in-progress' ? { height: ['20%', '80%', '40%', '90%', '20%'] } : { height: '10%' }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute bottom-0 w-full bg-gradient-to-t from-pastel-orange/40 to-transparent"
                />
                <Mic size={80} className="text-pastel-orange relative z-10" />
             </div>
             
             <div className="flex items-center justify-center gap-12 text-neutral-white/40 mb-4">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-white/20">Progresso</p>
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-pastel-orange" />
                    <span className="text-sm font-bold text-neutral-white">{currentRepetition} / {task.multimodalConfig?.repetitions || 1}</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-neutral-white/10" />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-white/20">Tempo Restante</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-pastel-pink" />
                    <span className="text-sm font-bold text-neutral-white">
                      {formatTime(timerSeconds)}
                    </span>
                  </div>
                </div>
              </div>

             <div className="text-center space-y-4">
                <h3 className="text-3xl font-headline font-black text-neutral-white uppercase tracking-tight">Projeção Vocal Adulta</h3>
                <p className="text-sm text-neutral-white/40 italic">Foque na ressonância, profundidade e intenção.</p>
                <div className="text-6xl font-headline font-black text-neutral-white tabular-nums pt-4">{formatTime(elapsedSeconds)}</div>
             </div>

             <div className="flex flex-col items-center gap-6 relative z-50">
               <motion.button 
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')}
                 className="w-28 h-28 rounded-full bg-pastel-orange text-neutral-black flex items-center justify-center shadow-[0_0_50px_rgba(255,180,100,0.3)] ring-4 ring-pastel-orange/20"
               >
                 {status === 'in-progress' ? <Pause size={38} fill="currentColor" /> : <Play size={38} fill="currentColor" className="ml-1" />}
               </motion.button>
               
               {task.multimodalConfig?.repetitions && task.multimodalConfig.repetitions > 1 && (
                 <button 
                   onClick={() => {
                     triggerCelebration();
                     setCurrentRepetition(r => Math.min(r + 1, task.multimodalConfig?.repetitions || 1));
                   }}
                   className="px-8 py-3 bg-neutral-white/5 border border-neutral-white/10 rounded-xl text-[10px] font-bold text-neutral-white uppercase tracking-widest hover:bg-neutral-white/10 transition-all"
                 >
                   Concluir Repetição
                 </button>
               )}
             </div>
          </div>
        );
      case 'meditation':
      case 'practice':
        return (
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="text-center space-y-2 mb-4">
               <p className="text-[10px] font-bold text-pastel-purple uppercase tracking-[0.3em]">
                 {task.executionType === 'meditation' ? `Meditação: ${task.multimodalConfig?.meditationStyle || 'Consciente'}` : 'Prática GH'}
               </p>
            </div>
            <div className="relative w-80 h-80 flex items-center justify-center">
               <AnimatePresence>
                {status === 'in-progress' && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.4, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-pastel-purple/20 rounded-full blur-[80px]" />
                )}
               </AnimatePresence>
               <div className="relative space-y-6 text-center">
                  <div className="text-8xl md:text-9xl font-headline font-black text-neutral-white tabular-nums tracking-tighter">{formatTime(timerSeconds > 0 ? timerSeconds : elapsedSeconds)}</div>
                  <p className="text-[10px] font-bold text-pastel-purple uppercase tracking-[0.4em]">{timerSeconds > 0 ? 'Timer Ativo' : 'Cronômetro Fluxo'}</p>
               </div>
            </div>
            <button onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')} className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all ${status === 'in-progress' ? 'bg-neutral-white text-neutral-black' : 'bg-pastel-purple text-neutral-black'}`}>
               {status === 'in-progress' ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </button>
          </div>
        );
      case 'energy-work':
        return (
          <div className="flex flex-col items-center justify-center space-y-12 w-full max-w-6xl px-2 md:px-0 relative">
            <div className="text-center space-y-3 mb-4 relative z-10 px-4">
               <motion.div 
                 animate={status === 'in-progress' ? { y: [0, -2, 0] } : {}}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="flex items-center justify-center gap-3"
               >
                 <Wind className={`text-pastel-indigo ${status === 'in-progress' ? 'animate-pulse' : ''}`} size={24} />
                 <p className="text-[10px] md:text-xs font-bold text-pastel-indigo uppercase tracking-[0.5em] drop-shadow-[0_0_10px_rgba(197,202,233,0.3)]">Laboratório Bioenergético (EV)</p>
               </motion.div>
               <h3 className="text-3xl md:text-6xl font-headline font-black text-neutral-white tracking-tighter leading-none italic group">
                 Estação de <span className="text-pastel-indigo">Pesquisa</span> Consciencial
               </h3>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 md:gap-10 w-full relative z-10 px-1 md:px-0">
              {/* Dynamic Visualization Atmosphere (UNRESTRICTED) */}
              <div className="flex-1 relative aspect-square w-full max-w-xl mx-auto flex items-center justify-center overflow-visible group">
                {/* Internal Scanlines & Grids */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                
                {/* Active Biofield Visualization */}
                {status === 'in-progress' && (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-[0.5px] border-pastel-indigo/20 rounded-full scale-[1.2] opacity-20"
                  />
                )}
                
                <motion.div 
                  animate={status === 'in-progress' ? { 
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.4, 0.1],
                  } : {}}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="absolute inset-10 bg-gradient-to-tr from-pastel-indigo/20 via-transparent to-pastel-purple/20 blur-[120px] rounded-full"
                />
                
                {/* Aura Simulation & Central Control */}
                <div className="relative flex flex-col items-center justify-center space-y-10">
                  <div className="relative">
                    <motion.div 
                       animate={status === 'in-progress' ? { 
                         scale: [1, 1.3, 1],
                         boxShadow: ['0 0 50px rgba(197,202,233,0.1)', '0 0 100px rgba(197,202,233,0.3)', '0 0 50px rgba(197,202,233,0.1)']
                       } : {}}
                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                       className="w-56 h-56 md:w-80 md:h-80 rounded-full border border-pastel-indigo/10 flex items-center justify-center relative overflow-hidden backdrop-blur-sm"
                    >
                      <motion.div 
                        animate={status === 'in-progress' ? { rotate: -360 } : {}}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-30"
                      >
                         {[...Array(4)].map((_, i) => (
                           <div key={i} className="absolute inset-0 border border-t-pastel-indigo/40 border-r-transparent border-b-transparent border-l-transparent rounded-full" style={{ transform: `rotate(${i * 90}deg) scale(${1 - i * 0.1})` }} />
                         ))}
                      </motion.div>
                      
                      {/* INTESITY PARTICLES */}
                      <AnimatePresence>
                        {status === 'in-progress' && [...Array(Math.floor((task.energyWorkExecution?.intensity || 5) * 2))].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                            animate={{ 
                              opacity: [0, 0.8, 0], 
                              scale: [0, 1.5, 0], 
                              x: (Math.random() - 0.5) * 350, 
                              y: (Math.random() - 0.5) * 350 
                            }}
                            transition={{ 
                              duration: 1 + Math.random() * 2, 
                              repeat: Infinity, 
                              delay: Math.random() * 2 
                            }}
                            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-pastel-indigo blur-[1px]"
                          />
                        ))}
                      </AnimatePresence>

                      {/* INTEGRATED ACTION BUTTON (PLAY/PAUSE) */}
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setStatus(status === 'in-progress' ? 'paused' : 'in-progress')}
                        className="relative z-50 w-24 h-24 md:w-32 md:h-32 rounded-full bg-neutral-white text-neutral-black flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_150px_rgba(255,255,255,0.4)] transition-all duration-700"
                      >
                        <AnimatePresence mode="wait">
                          {status === 'in-progress' ? (
                            <motion.div key="pause" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                              <Pause size={48} fill="currentColor" />
                            </motion.div>
                          ) : (
                            <motion.div key="play" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                              <Play size={48} fill="currentColor" className="ml-2" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </motion.div>
                  </div>
                  
                  <div className="text-center space-y-1 relative z-10">
                    <div className="text-6xl md:text-8xl font-headline font-black text-neutral-white tabular-nums tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                      {formatTime(timerSeconds > 0 ? timerSeconds : elapsedSeconds)}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                       <span className={`w-1 h-1 rounded-full ${status === 'in-progress' ? 'bg-pastel-indigo animate-pulse' : 'bg-neutral-white/10'}`} />
                       <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-[0.4em]">Tempo de Registro</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Controls (Sidebar of the Lab) */}
              <div className="flex-1 space-y-8">
                <div className="p-8 bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[4rem] flex flex-col space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Intensidade do Campo</label>
                        <p className="text-[8px] font-medium text-neutral-white/10 uppercase tracking-widest">Graduação da Mobilização</p>
                      </div>
                      <span className="text-2xl font-headline font-black text-pastel-indigo">{task.energyWorkExecution?.intensity || 0}/10</span>
                    </div>
                    <div className="space-y-3">
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
                        className="w-full h-4 bg-neutral-white/5 rounded-full appearance-none cursor-pointer accent-pastel-indigo"
                      />
                      <div className="flex justify-between text-[8px] font-black text-neutral-white/30 uppercase tracking-widest">
                         <span>Latente</span>
                         <span>EV Instalado</span>
                         <span>Balonamento</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center gap-2">
                       <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Mapeamento Holossomático</label>
                       <div className="h-px flex-1 bg-neutral-white/5" />
                     </div>
                     <div className="grid grid-cols-2 gap-6">
                       {[
                         { id: 'energy', label: 'Energossoma', color: 'bg-pastel-indigo' },
                         { id: 'physical', label: 'Soma', color: 'bg-pastel-green' },
                         { id: 'emotional', label: 'Psicossoma', color: 'bg-pastel-pink' },
                         { id: 'mental', label: 'Mentalsoma', color: 'bg-pastel-purple' }
                       ].map((dim) => (
                         <div key={dim.id} className="space-y-4">
                            <div className="flex justify-between items-center pr-2">
                               <span className="text-[8px] font-bold text-neutral-white/40 uppercase">{dim.label}</span>
                               <span className={`text-[12px] font-black text-neutral-white`}>{task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0}</span>
                            </div>
                            <div className="flex gap-2 h-2">
                               {[1,2,3,4,5].map(l => (
                                 <button
                                   key={l}
                                   onClick={() => {
                                      const impacts = task.energyWorkExecution?.holosomaticImpacts || { physical: 0, energy: 0, emotional: 0, mental: 0 };
                                      onUpdate({
                                        ...task,
                                        energyWorkExecution: {
                                          ...task.energyWorkExecution || { 
                                            intensity: 0, technique: 'ev', holosomaticImpacts: impacts,
                                            symmetry: 1, signals: '', lucidity: 1, sensations: [], phenomena: []
                                          },
                                          holosomaticImpacts: { ...impacts, [dim.id]: l }
                                        }
                                      });
                                   }}
                                   className={`flex-1 rounded-full transition-all ${ 
                                      (task.energyWorkExecution?.holosomaticImpacts?.[dim.id as keyof typeof task.energyWorkExecution.holosomaticImpacts] || 0) >= l 
                                        ? dim.color 
                                        : 'bg-neutral-white/5 hover:bg-neutral-white/10' 
                                   }`} 
                                 />
                               ))}
                            </div>
                         </div>
                       ))}
                     </div>
                  </div>

                  <div className="space-y-6 pt-4 border-t border-neutral-white/5">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Lucidez de Pesquisa</label>
                       <span className="text-xl font-headline font-black text-pastel-purple">{task.energyWorkExecution?.lucidity || 1}/5</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(l => (
                        <button
                          key={l}
                          onClick={() => onUpdate({
                            ...task,
                            energyWorkExecution: {
                              ...task.energyWorkExecution || { intensity: 0, technique: 'ev', holosomaticImpacts: { physical: 0, energy: 0, emotional: 0, mental: 0 }, symmetry: 1, signals: '', sensations: [], lucidity: 1, phenomena: [] },
                              lucidity: l
                            }
                          })}
                          className={`flex-1 py-4 rounded-2xl border transition-all text-base font-black ${
                            (task.energyWorkExecution?.lucidity || 1) === l
                              ? 'bg-pastel-purple text-neutral-black border-pastel-purple'
                              : 'bg-neutral-white/5 border-neutral-white/5 text-neutral-white/20 hover:text-neutral-white/60'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Research Registry (Full Width Bottom Area) */}
            <div className="w-full space-y-10 relative z-10 pt-10">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Sinaléticas / Sensations */}
                  <div className="p-4 md:p-10 bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[2rem] md:rounded-[4rem] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Sinalética Bioenergética</label>
                        <p className="text-[8px] font-medium text-neutral-white/10 uppercase tracking-widest">Mapeamento de Sensações Físicas</p>
                      </div>
                      <button 
                        onClick={handleAddSensation}
                        className="px-4 py-1.5 rounded-full bg-pastel-indigo/10 border border-pastel-indigo/20 text-[9px] font-black text-pastel-indigo uppercase tracking-widest hover:bg-pastel-indigo/20 transition-all"
                      >+ Novo Registro</button>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 flex-1 content-start">
                      {['Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento', 'Pressão', ...customSensations].map(s => (
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
                          className={`px-4 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-3xl text-[11px] md:text-[11px] font-bold uppercase transition-all flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-start ${
                            (task.energyWorkExecution?.sensations || []).includes(s)
                              ? 'bg-pastel-indigo text-neutral-black shadow-xl shadow-pastel-indigo/20 ring-2 ring-pastel-indigo/20'
                              : 'bg-neutral-white/5 text-neutral-white/30 border border-neutral-white/5 hover:text-neutral-white hover:border-neutral-white/20'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${ (task.energyWorkExecution?.sensations || []).includes(s) ? 'bg-neutral-black' : 'bg-pastel-indigo' }`} />
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fenômenos / Phenomena */}
                  <div className="p-4 md:p-10 bg-neutral-white/[0.02] border border-neutral-white/5 rounded-[2rem] md:rounded-[4rem] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest">Ocorrências Fenomenológicas</label>
                        <p className="text-[8px] font-medium text-neutral-white/10 uppercase tracking-widest">Registro Multidimensional</p>
                      </div>
                      <button 
                        onClick={handleAddPhenomenon}
                        className="px-4 py-1.5 rounded-full bg-pastel-purple/10 border border-pastel-purple/20 text-[9px] font-black text-pastel-purple uppercase tracking-widest hover:bg-pastel-purple/20 transition-all"
                      >+ Nova Observação</button>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-4 flex-1 content-start">
                       {['Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania', 'Clariaudiência', 'Retropercepção', ...customPhenomena].map(p => (
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
                           className={`px-4 py-3 md:px-8 md:py-4 rounded-2xl md:rounded-3xl text-[11px] md:text-[11px] font-bold uppercase transition-all flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-center sm:justify-start ${
                             (task.energyWorkExecution?.phenomena || []).includes(p)
                               ? 'bg-pastel-purple text-neutral-black shadow-xl shadow-pastel-purple/20 ring-2 ring-pastel-purple/20'
                               : 'bg-neutral-white/5 border border-neutral-white/5 text-neutral-white/20 hover:text-neutral-white hover:border-neutral-white/20'
                           }`}
                         >
                            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${ (task.energyWorkExecution?.phenomena || []).includes(p) ? 'bg-neutral-black' : 'bg-pastel-purple' }`} />
                           {p}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Memorial Section */}
               <div className="p-4 md:p-12 bg-neutral-white/[0.01] border border-neutral-white/5 rounded-[2rem] md:rounded-[4rem] space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="space-y-1">
                     <label className="text-[12px] md:text-[14px] font-black text-neutral-white/40 uppercase tracking-[0.2em] md:tracking-[0.4em]">Memorial de Atividade: Laboratório Bioenergético</label>
                     <p className="text-[9px] md:text-[11px] text-neutral-white/20 italic tracking-widest uppercase font-bold">Descreva com precisão técnica a parapercepção e fenômenos detectados.</p>
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
                   placeholder="Relato técnico da sua auto-pesquisa..."
                   className="w-full bg-transparent border-none rounded-none p-0 text-base md:text-2xl text-neutral-white focus:ring-0 transition-all min-h-[250px] resize-none leading-relaxed placeholder:text-neutral-white/5 placeholder:italic custom-scrollbar shadow-none"
                 />
                 <div className="flex justify-end pt-6 border-t border-neutral-white/5">
                   <p className="text-[9px] md:text-[10px] font-bold text-neutral-white/10 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2">
                      Base de Dados para Análise Consciencial
                   </p>
                 </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[130] flex items-center justify-center p-0 md:p-8"
      >
        <div className="absolute inset-0 bg-neutral-black/95 backdrop-blur-3xl" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 1, y: 0 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-full md:max-w-[85%] h-full md:h-auto md:max-h-[90vh] bg-neutral-black md:border border-neutral-white/10 rounded-none md:rounded-[4rem] flex flex-col shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-y-auto md:overflow-hidden backdrop-blur-3xl"
        >
          {/* Visual Anchor Image (Emotional Resonance) */}
          {task.imageUrl && (
            <div className="w-full h-32 md:h-64 relative flex-shrink-0 overflow-hidden">
              <motion.img 
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={task.imageUrl} 
                className="w-full h-full object-cover opacity-80" 
                alt={task.title} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-black via-transparent to-neutral-black/60" />
            </div>
          )}

          {/* Header Experience */}
          <header className="px-5 md:px-12 py-6 md:py-8 border-b border-neutral-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 relative md:sticky top-0 overflow-hidden bg-neutral-black z-30 flex-shrink-0">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pastel-indigo to-transparent opacity-20" />
             
             <div className="space-y-2 relative z-10">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-xl bg-neutral-white/5 flex items-center justify-center ${getTypeColor()}`}>
                      {task.executionType === 'audio' && <Volume2 size={16} />}
                      {task.executionType === 'video' && <Play size={16} />}
                      {task.executionType === 'reading' && <BookOpen size={16} />}
                      {task.executionType === 'practice' && <Activity size={16} />}
                      {task.executionType === 'meditation' && <Brain size={16} />}
                      {task.executionType === 'visualization' && <Eye size={20} />}
                   </div>
                   <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-neutral-white/30">
                        <Target size={10} className="text-pastel-indigo" />
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em]">{objectiveTitle}</span>
                      </div>
                      <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-white/40">Estação de {task.executionType}</h4>
                   </div>
                </div>
                <h1 className="text-2xl md:text-4xl font-headline font-black text-neutral-white tracking-tight">
                  {task.title}
                </h1>
             </div>

             <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                   <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest mb-1">Status de Foco</p>
                   <div className="flex items-center gap-2 px-3 py-1 bg-neutral-white/5 rounded-full border border-neutral-white/5">
                      <motion.div 
                        animate={status === 'in-progress' ? { opacity: [0.3, 1, 0.3] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-1.5 h-1.5 rounded-full ${status === 'in-progress' ? 'bg-pastel-indigo' : 'bg-neutral-white/10'}`} 
                      />
                      <span className="text-[8px] font-bold text-neutral-white/40 uppercase tracking-widest">
                        {status === 'in-progress' ? 'Consciente' : 'Pausado'}
                      </span>
                   </div>
                </div>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/40 hover:text-neutral-white group transition-all"
                >
                  <X size={18} className="group-hover:rotate-90 transition-transform" />
                </button>
             </div>
          </header>

          <div className="flex-1 md:overflow-y-auto p-5 md:p-12 relative bg-neutral-black custom-scrollbar">
             {/* Sublayer Background (UNRESTRICTED FLOW) */}
             <div className="absolute inset-0 pointer-events-none overflow-visible">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neutral-white/[0.01] blur-[150px] rounded-full" />
                <BioenergeticAnimation />
             </div>

             {/* MAIN CONTENT AREA */}
             <div className="relative z-20 w-full flex flex-col items-center py-8">
                {renderExecutionContent()}
             </div>
          </div>

          {/* Footer Navigation */}
          <footer className="px-5 md:px-12 py-6 md:py-8 border-t border-neutral-white/5 bg-neutral-black flex flex-col md:flex-row items-center justify-between gap-6 relative md:sticky bottom-0 z-30 flex-shrink-0 mt-auto">
             <div className="flex items-center gap-8 order-2 md:order-1">
                <div className="flex flex-col">
                   <p className="text-[7px] font-bold text-neutral-white/20 uppercase tracking-widest mb-1">Objetivo da Sessão</p>
                   <p className="text-[10px] font-bold text-neutral-white/60">{task.evolucaoEsperada || 'Manifestação Realizada'}</p>
                </div>
                <div className="w-px h-6 bg-neutral-white/10" />
                <div className="flex flex-col">
                   <p className="text-[7px] font-bold text-neutral-white/20 uppercase tracking-widest mb-1">Duração Total</p>
                   <p className="text-[10px] font-bold text-neutral-white/60">{formatTime(elapsedSeconds)}</p>
                </div>
             </div>

             <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-2">
                <button 
                  onClick={onClose}
                  className="flex-1 md:flex-none px-6 py-4 rounded-xl text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest hover:text-neutral-white transition-all"
                >
                  Continuar Depois
                </button>
                <button 
                  onClick={handleComplete}
                  className="flex-1 md:flex-none px-10 md:px-14 py-4 md:py-5 rounded-2xl bg-neutral-white text-neutral-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-2xl shadow-neutral-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Concluir Prática
                </button>
             </div>
          </footer>

          {/* Intelligence Completion Layer */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[250] pointer-events-none flex items-center justify-center"
              >
                {/* Background Explosion Glow */}
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 2, opacity: [0, 0.5, 0] }}
                  transition={{ duration: 1 }}
                  className="absolute w-[600px] h-[600px] bg-pastel-indigo/20 rounded-full blur-[120px]"
                />
                
                {/* Celebration Message */}
                <motion.div
                  initial={{ scale: 0.5, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="relative z-10 bg-neutral-black/80 backdrop-blur-2xl border border-neutral-white/10 px-12 py-8 rounded-[3rem] shadow-2xl flex flex-col items-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-pastel-indigo/20 flex items-center justify-center text-pastel-indigo mb-2">
                    <Sparkles size={40} />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl font-headline font-black text-neutral-white uppercase tracking-tighter">Ciclo Concluído!</h2>
                    <p className="text-xs font-bold text-neutral-white/40 uppercase tracking-widest mt-1">Ótimo trabalho na repetição {currentRepetition}</p>
                  </div>
                  
                  {/* Particle Simulation (CSS only simple version) */}
                  <div className="absolute inset-x-0 -top-20 flex justify-center">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          x: [0, (i - 6) * 40],
                          y: [0, -100 - Math.random() * 50],
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0]
                        }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-2 h-2 rounded-full bg-pastel-indigo absolute"
                        style={{ left: `${50 + (i - 6) * 5}%` }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {showFeedback && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] bg-neutral-black/98 backdrop-blur-3xl flex items-center justify-center p-8 text-center"
              >
                <div className="max-w-2xl space-y-12">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-pastel-green/20 flex items-center justify-center text-pastel-green mx-auto border border-pastel-green/30"
                   >
                     <Award size={48} className="md:w-64" />
                   </motion.div>
                   <div className="space-y-4">
                      <h2 className="text-5xl md:text-7xl font-headline font-black text-neutral-white tracking-tighter">Experiência Concluída</h2>
                      <p className="text-lg md:text-xl text-neutral-white/40 italic">"Seu foco hoje manifestou progresso real na sua jornada de maestria."</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-neutral-white/5 rounded-3xl border border-neutral-white/5">
                         <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest mb-2">Tempo Focado</p>
                         <p className="text-2xl font-bold text-neutral-white">{formatTime(elapsedSeconds)}</p>
                      </div>
                      <div className="p-6 bg-neutral-white/5 rounded-3xl border border-neutral-white/5">
                         <p className="text-[10px] font-bold text-neutral-white/30 uppercase tracking-widest mb-2">Qualidade</p>
                         <p className="text-2xl font-bold text-pastel-green">Consciente</p>
                      </div>
                   </div>
                   <button 
                    onClick={onClose}
                    className="px-16 py-5 rounded-[2rem] bg-neutral-white text-neutral-black font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all"
                   >
                     Retornar ao Dashboard
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
