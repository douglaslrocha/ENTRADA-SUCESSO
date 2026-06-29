import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Download, Smartphone, Monitor, ChevronRight, Sparkles } from 'lucide-react';
import { saveMediaToDB, getMediaFromDB, safeLocalStorage } from '../utils/storage';
import { useAuth } from '../lib/AuthContext';
import { haptics } from '../services/HapticService';
import { identityService } from '../services/identityService';
import { PWAInstallModal } from './PWAInstallModal';

export const BLOCKS = [
  {
    id: 'professional',
    label: 'Identidade Profissional',
    activation: '“Pessoas comuns trabalham. Pessoas estratégicas constroem valor percebido.”',
    direction: '“Defina como você se posiciona de forma que sua presença gere respeito, confiança e reconhecimento.”',
    inputs: [
      { id: 'prof_1', label: 'No meu trabalho, eu sou o tipo de pessoa que…' },
      { id: 'prof_2', label: 'Eu gero valor quando…' },
      { id: 'prof_3', label: 'As pessoas passam a confiar em mim porque…' },
      { id: 'prof_4', label: 'Meu diferencial real é…' }
    ],
    reinforcement: '“Clareza gera posicionamento. Posicionamento gera oportunidade.”',
    guide: 'Estratégia e Valor'
  },
  {
    id: 'financial',
    label: 'Identidade Financeira',
    activation: '“Riqueza começa na forma como você pensa, não no quanto você tem.”',
    direction: '“Construa uma identidade que naturalmente toma decisões financeiras inteligentes.”',
    inputs: [
      { id: 'fin_1', label: 'Eu tomo decisões financeiras inteligentes quando…' },
      { id: 'fin_2', label: 'Eu respeito o dinheiro ao…' },
      { id: 'fin_3', label: 'Eu construo crescimento financeiro através de…' },
      { id: 'fin_4', label: 'Minha disciplina financeira aparece quando…' }
    ],
    reinforcement: '“Consistência financeira cria liberdade inevitável.”',
    guide: 'Mentalidade de Riqueza'
  },
  {
    id: 'emotional',
    label: 'Identidade Emocional',
    activation: '“Controle emocional é uma vantagem silenciosa.”',
    direction: '“Descreva como sua mente se mantém estável mesmo sob pressão.”',
    inputs: [
      { id: 'emo_1', label: 'Eu mantenho clareza mesmo quando…' },
      { id: 'emo_2', label: 'Eu controlo minhas emoções ao…' },
      { id: 'emo_3', label: 'Minha força mental aparece quando…' },
      { id: 'emo_4', label: 'Eu não reajo impulsivamente quando…' }
    ],
    reinforcement: '“Mente estável decide melhor que mente acelerada.”',
    guide: 'Vantagem Silenciosa'
  },
  {
    id: 'relationships',
    label: 'Relacionamentos',
    activation: '“A forma como você se posiciona define como o mundo responde.”',
    direction: '“Construa uma presença que naturalmente gera respeito e conexão.”',
    inputs: [
      { id: 'rel_1', label: 'Nos meus relacionamentos, eu sou…' },
      { id: 'rel_2', label: 'As pessoas se sentem assim perto de mim…' },
      { id: 'rel_3', label: 'Eu estabeleço limites quando…' },
      { id: 'rel_4', label: 'Minha comunicação é…' }
    ],
    reinforcement: '“Respeito começa no posicionamento interno.”',
    guide: 'Presença e Conexão'
  },
  {
    id: 'discipline',
    label: 'Disciplina e Execução',
    activation: '“Resultados não vêm da intenção. Vêm da execução repetida.”',
    direction: '“Defina como você age quando não está com vontade.”',
    inputs: [
      { id: 'disc_1', label: 'Eu faço o que precisa ser feito quando…' },
      { id: 'disc_2', label: 'Minha disciplina aparece mesmo quando…' },
      { id: 'disc_3', label: 'Eu mantenho consistência ao…' },
      { id: 'disc_4', label: 'Eu não dependo de motivação para…' }
    ],
    reinforcement: '“Ação consistente constrói identidade forte.”',
    guide: 'Execução Implacável'
  },
  {
    id: 'future',
    label: 'Identidade Futura',
    activation: '“Você não se torna alguém por acaso. Você se constrói.”',
    direction: '“Descreva com clareza quem você está se tornando.”',
    inputs: [
      { id: 'fut_1', label: 'Eu estou me tornando uma pessoa que…' },
      { id: 'fut_2', label: 'Eu serei reconhecido por…' },
      { id: 'fut_3', label: 'Minha evolução acontece porque…' },
      { id: 'fut_4', label: 'Minha versão futura vive de forma…' }
    ],
    reinforcement: '“Clareza de identidade acelera transformação.”',
    guide: 'O Devir'
  },
  {
    id: 'weekly_monday',
    label: 'Identidade Semanal',
    activation: '“Segunda-feira não é sobre começar. É sobre posicionamento.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_mon', 
        label: 'Segunda-feira',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu opero com intenção e direção.”',
    guide: 'Segunda-feira'
  },
  {
    id: 'weekly_tuesday',
    label: 'Identidade Semanal',
    activation: '“Consistência é a linguagem da maestria.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_tue', 
        label: 'Terça-feira',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu mantenho o ritmo da minha evolução.”',
    guide: 'Terça-feira'
  },
  {
    id: 'weekly_wednesday',
    label: 'Identidade Semanal',
    activation: '“O meio da semana é onde a vontade se prova.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_wed', 
        label: 'Quarta-feira',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu dobro minha aposta na disciplina.”',
    guide: 'Quarta-feira'
  },
  {
    id: 'weekly_thursday',
    label: 'Identidade Semanal',
    activation: '“Ajuste fino. A visão futura exige refinamento.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_thu', 
        label: 'Quinta-feira',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu aprimoro cada detalhe da minha execução.”',
    guide: 'Quinta-feira'
  },
  {
    id: 'weekly_friday',
    label: 'Identidade Semanal',
    activation: '“Concluir com a mesma força que comecei.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_fri', 
        label: 'Sexta-feira',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu honro meu compromisso até o fim.”',
    guide: 'Sexta-feira'
  },
  {
    id: 'weekly_saturday',
    label: 'Identidade Semanal',
    activation: '“Expansão. Novos horizontes, mesma identidade.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_sat', 
        label: 'Sábado',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu vivo a liberdade da minha nova versão.”',
    guide: 'Sábado'
  },
  {
    id: 'weekly_sunday',
    label: 'Identidade Semanal',
    activation: '“Reflexão e Preparo. O ciclo se renova na clareza.”',
    direction: 'Você se torna aquilo que repete todos os dias.',
    inputs: [
      { 
        id: 'week_sun', 
        label: 'Domingo',
        placeholder: 'Defina como você age, pensa e se posiciona neste dia.'
      }
    ],
    reinforcement: '“Neste dia, eu contemplo minha jornada e projeto o futuro.”',
    guide: 'Domingo'
  }
];

export const INTERSTITIALS = [
  "isso ainda não é tudo",
  "vá mais fundo",
  "continue...",
  "a jornada é sua"
];

interface MediaItem {
  type: 'image' | 'video' | 'youtube';
  url: string;
}

interface IdentityBlockProps {
  block: typeof BLOCKS[0];
  answers: Record<string, string>;
  mediaItems: MediaItem[];
  onAnswerChange: (id: string, val: string) => void;
  onMediaChange: (id: string, items: MediaItem[]) => void;
  index: number;
}

function MediaBackground({ items }: { items: MediaItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const prevItemsLength = useRef(items.length);

  // Feedback imediato: Se o número de itens aumentar, pula para o último item adicionado
  useEffect(() => {
    if (items.length > prevItemsLength.current) {
      setCurrentIndex(items.length - 1);
      setHasLoaded(true);
    }
    prevItemsLength.current = items.length;
  }, [items.length]);

  useEffect(() => {
    if (items.length > 0) {
      setHasLoaded(true);
    } else {
      setHasLoaded(false);
    }
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  const current = items[currentIndex];

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Fallback Background - Sempre presente para evitar flashes */}
      <div className="absolute inset-0 bg-[#0A0A0A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
      </div>

      <AnimatePresence mode="wait">
        {hasLoaded && current && (
          <motion.div
            key={current.url + currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="w-full h-full"
            >
              {current.type === 'image' && (
                <img 
                  src={current.url} 
                  alt=""
                  className="w-full h-full object-cover opacity-65 blur-[6px] brightness-[0.85] contrast-[1.1]" 
                  referrerPolicy="no-referrer"
                />
              )}
              {current.type === 'video' && (
                <video 
                  src={current.url} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover opacity-65 blur-[6px] brightness-[0.85]"
                />
              )}
              {current.type === 'youtube' && (
                <div className="w-full h-full opacity-65 blur-[6px] brightness-[0.85] scale-[1.2]">
                  <iframe
                    src={`https://www.youtube.com/embed/${current.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${current.url}&rel=0&showinfo=0`}
                    className="w-full h-full object-cover pointer-events-none"
                    allow="autoplay; encrypted-media"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camada de Fusão e Equilíbrio Visual - Mais suave para cinematic feel */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/40 pointer-events-none opacity-60" />
    </div>
  );
}

function IdentityBlock({ block, answers, mediaItems, onAnswerChange, onMediaChange, index }: IdentityBlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ytLink, setYtLink] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      newItems.push({ type, url: base64 });
    }
    // Append unique items
    onMediaChange(block.id, [...mediaItems, ...newItems]);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddYoutube = () => {
    const id = extractYoutubeId(ytLink);
    if (id) {
      onMediaChange(block.id, [...mediaItems, { type: 'youtube', url: id }]);
      setYtLink('');
    }
  };

  const removeMedia = (idx: number) => {
    const next = [...mediaItems];
    next.splice(idx, 1);
    onMediaChange(block.id, next);
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center py-16 md:py-48 overflow-hidden">
      <MediaBackground items={mediaItems} />

      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-15%" }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-6xl w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:w-full p-5 sm:p-8 md:p-28 rounded-[2.5rem] md:rounded-[3.5rem] bg-[#111111]/60 backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_80px_160px_rgba(0,0,0,0.7)] border border-white/[0.08] overflow-hidden mx-auto"
      >
        {/* Micro animação contínua de fundo */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.04)_0%,transparent_70%)] animate-pulse" />
        </div>

        <div className="space-y-12 md:space-y-16 relative z-10">
          {/* Header do Bloco */}
          <div className="space-y-8 md:space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-8 flex-1">
                <span className="text-[10px] md:text-sm font-bold uppercase tracking-[0.4em] md:tracking-[0.7em] text-white/30 block whitespace-nowrap">
                  {block.label}
                </span>
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] md:text-sm font-medium text-white/20 italic tracking-[0.2em] hidden sm:block">
                  {block.guide}
                </span>
              </div>
              
              {/* Media Controls */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  multiple 
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full md:w-auto px-5 md:px-6 py-3.5 md:py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-all flex items-center justify-center gap-3 group"
                >
                  <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">add_photo_alternate</span>
                  Adicionar da Galeria
                </button>
              </div>
            </div>
            
            <div className="space-y-6 md:space-y-10">
            <h2 
              className="font-medium italic leading-[1.1] md:leading-[1.05] tracking-tight text-2xl md:text-4xl"
              style={{ color: '#9fcaa3' }}
            >
              {block.activation}
            </h2>
              <p className="text-white/60 text-lg md:text-3xl font-light leading-relaxed max-w-4xl">
                {block.direction}
              </p>
            </div>
          </div>

          {/* YouTube/Link Input & Media Preview */}
          <div className="space-y-6 md:space-y-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text"
                  value={ytLink}
                  onChange={(e) => setYtLink(e.target.value)}
                  placeholder="YouTube ou Link de Imagem..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/20"
                />
                <button 
                  onClick={() => {
                    const id = extractYoutubeId(ytLink);
                    if (id) {
                      onMediaChange(block.id, [...mediaItems, { type: 'youtube', url: id }]);
                    } else if (ytLink.startsWith('http')) {
                      onMediaChange(block.id, [...mediaItems, { type: 'image', url: ytLink }]);
                    }
                    setYtLink('');
                  }}
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[9px] md:text-[10px] uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2"
                >
                  Confirmar Link
                </button>
              </div>
            </div>

            {mediaItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Sua Arquitetura Visual ({mediaItems.length})</span>
                  {mediaItems.length > 1 && (
                    <button 
                      onClick={() => onMediaChange(block.id, [])}
                      className="text-[9px] font-bold uppercase tracking-widest text-red-500/50 hover:text-red-500 transition-colors"
                    >
                      Limpar Tudo
                    </button>
                  )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
                  {mediaItems.map((item, idx) => (
                    <div key={idx} className="relative flex-shrink-0 w-32 h-32 rounded-3xl overflow-hidden border border-white/10 group shadow-2xl snap-start">
                      {item.type === 'image' && (
                        <img 
                          src={item.url} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {item.type === 'video' && <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">VÍDEO</div>}
                      {item.type === 'youtube' && (
                        <img 
                          src={`https://img.youtube.com/vi/${item.url}/0.jpg`} 
                          className="w-full h-full object-cover opacity-50" 
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          onClick={() => removeMedia(idx)}
                          className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid de Inputs */}
          <div className="grid grid-cols-1 gap-16 mt-20">
            {block.inputs.map((input: any) => (
              <InputCanvas 
                key={input.id}
                label={input.label}
                placeholder={input.placeholder}
                value={answers[input.id] || ''}
                onChange={(val) => onAnswerChange(input.id, val)}
              />
            ))}
          </div>

          {/* Footer do Bloco */}
          <div className="mt-20 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-white/40 text-sm md:text-base uppercase tracking-[0.3em] md:tracking-[0.5em] font-medium text-center md:text-left leading-relaxed">
              {block.reinforcement}
            </p>
            
            {index < BLOCKS.length - 1 && (
              <span className="text-xs md:text-sm uppercase tracking-[0.4em] text-white/20 animate-pulse font-light">
                {INTERSTITIALS[index % INTERSTITIALS.length]}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function InputCanvas({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (val: string) => void, placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <span className="text-[10px] md:text-sm uppercase tracking-[0.25em] md:tracking-[0.4em] text-white/15 font-black md:font-bold ml-2">
        {label}
      </span>
      <motion.div 
        animate={{ 
          scale: isFocused ? 1.015 : 1,
          backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
          boxShadow: isFocused 
            ? '0 30px 60px rgba(0, 0, 0, 0.4), 0 0 50px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(255,255,255,0.05)' 
            : 'inset 0 1px 1px rgba(255,255,255,0.02)',
          borderColor: isFocused ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.05)'
        }}
        className={`p-5 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-700 relative group ${isTyping ? 'ring-1 ring-blue-500/30' : ''}`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          placeholder={placeholder || "Escreva sua verdade..."}
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-xl sm:text-2xl md:text-4xl font-light leading-relaxed placeholder:text-white/10 resize-none transition-all duration-500 text-white/90 p-0 min-h-[140px] md:min-h-[120px]"
          spellCheck={false}
        />
        
        <AnimatePresence>
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-[2.5rem] bg-blue-500/[0.03] pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function IdentityPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const appCustomName = safeLocalStorage.getItem('app_custom_name') || 'Remix 1.7';
  const appCustomDesc = safeLocalStorage.getItem('app_custom_description') || 'Evolução Pessoal';
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [heroYtLink, setHeroYtLink] = useState('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      haptics.error();
      setIsInstallModalOpen(true);
      return;
    }
    
    haptics.success();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const saved = safeLocalStorage.getItem('identity_answers');
    return saved ? JSON.parse(saved) : {};
  });

  const [media, setMedia] = useState<Record<string, MediaItem[]>>({});
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.05], [1, 0.95]);
  
  const bgIntensity = useTransform(scrollYProgress, [0, 1], [0.01, 0.1]);
  const bgBlur = useTransform(scrollYProgress, [0, 1], [80, 120]);

  // Carrega dados do backend na montagem
  useEffect(() => {
    identityService.loadAnswers().then(backendAnswers => {
      if (Object.keys(backendAnswers).length > 0) {
        setAnswers(backendAnswers);
      }
    });
  }, []);

  // Mantém localStorage como cache local (para responsividade e fallback offline)
  useEffect(() => {
    safeLocalStorage.setItem('identity_answers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        // Tenta backend primeiro
        const backendMedia = await identityService.loadMedia();
        if (Object.keys(backendMedia).length > 0) {
          setMedia(backendMedia);
        } else {
          // Fallback: IndexedDB / localStorage
          const dbMedia = await getMediaFromDB('identity_media');
          if (dbMedia) {
            setMedia(dbMedia);
          } else {
            const saved = safeLocalStorage.getItem('identity_media');
            if (saved) {
              const parsed = JSON.parse(saved);
              setMedia(parsed);
              await saveMediaToDB('identity_media', parsed);
              safeLocalStorage.removeItem('identity_media');
            }
          }
        }
      } catch (error) {
        console.error('Error loading media from storage:', error);
      } finally {
        setIsMediaLoaded(true);
      }
    };
    loadMedia();
  }, []);

  useEffect(() => {
    if (isMediaLoaded) {
      saveMediaToDB('identity_media', media).catch(error => {
        console.error('Error saving media to IndexedDB:', error);
      });
    }
  }, [media, isMediaLoaded]);

  // Flush de respostas pendentes ao sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      identityService.flushNow();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      identityService.flushNow();
    };
  }, []);

  const handleAnswerChange = (id: string, val: string) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
    // Encontra o block_id a partir do input_id
    const block = BLOCKS.find(b => b.inputs.some((i: any) => i.id === id));
    if (block) {
      identityService.saveAnswer(block.id, id, val);
    }
  };

  const handleMediaChange = (id: string, items: MediaItem[]) => {
    setMedia(prev => ({ ...prev, [id]: items }));
  };

  const handleHeroFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await fileToBase64(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      
      // Upload ao backend
      const uploaded = await identityService.uploadMedia('hero', type, base64);
      if (uploaded) {
        newItems.push(uploaded);
      } else {
        // Fallback: mantém base64 local
        newItems.push({ type, url: base64 });
      }
    }
    handleMediaChange('hero', [...(media['hero'] || []), ...newItems]);
  };

  const handleAddHeroYoutube = () => {
    const id = extractYoutubeId(heroYtLink);
    if (id) {
      handleMediaChange('hero', [...(media['hero'] || []), { type: 'youtube', url: id }]);
      setHeroYtLink('');
    }
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-[1400vh] bg-[#0A0A0A] text-white font-sans selection:bg-white/10 overflow-x-hidden"
      style={{
        ['--bg-dark' as any]: '#0A0A0A',
        ['--surface-dark' as any]: '#111111',
        ['--input-dark' as any]: '#181818',
        ['--active-dark' as any]: '#222222',
      }}
    >
      {/* BACKGROUND ELEMENTS (STATIC) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          style={{ 
            opacity: bgIntensity,
            filter: `blur(${bgBlur}px)`
          }}
          className="absolute inset-0 bg-blue-600/10" 
        />
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      </div>

      {/* BACK BUTTON */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => navigate(-1)}
        className="fixed top-8 left-8 z-50 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
      >
        Voltar
      </motion.button>

      {/* HERO SECTION */}
      <section className="h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden">
        {/* Hero Dynamic Background */}
        <MediaBackground items={media['hero'] || []} />

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="text-center relative z-10 w-full px-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-light tracking-tight mb-8 md:mb-10 leading-[1.1] md:leading-[1.05] text-[28px] sm:text-[34px] md:text-[42px]"
            style={{ color: '#b0b1b1' }}
          >
            A arquitetura do seu<br /><span className="italic" style={{ color: '#fffcf4' }}>Poder Personal.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/30 text-base sm:text-lg md:text-3xl font-light tracking-wide max-w-3xl mx-auto mb-12 md:mb-16"
          >
            Não se torne alguém por acaso. Construa-se com intenção estratégica.
          </motion.p>

          {/* Hero Media Controls */}
          <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            <div className="flex items-center gap-4 w-full">
              <input 
                type="file" 
                ref={heroFileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*,video/*"
                onChange={handleHeroFileSelect}
              />
              <button 
                onClick={() => heroFileInputRef.current?.click()}
                className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black transition-all backdrop-blur-md shadow-2xl"
              >
                Personalizar Ambiente
              </button>
            </div>
            <div className="flex gap-2 w-full">
              <input 
                type="text"
                value={heroYtLink}
                onChange={(e) => setHeroYtLink(e.target.value)}
                placeholder="YouTube URL..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] sm:text-xs focus:ring-1 focus:ring-white/20 outline-none transition-all placeholder:text-white/20"
              />
              <button 
                onClick={handleAddHeroYoutube}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-[9px] sm:text-[10px] uppercase tracking-widest font-black transition-all"
              >
                Add
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 3 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Scroll para iniciar a construção</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </motion.div>
      </section>

      {/* CONTENT SECTION - CONTINUOUS BLOCKS */}
      <section className="relative z-10 pb-64">
        {BLOCKS.map((block, index) => (
          <IdentityBlock 
            key={block.id}
            block={block}
            index={index}
            answers={answers}
            mediaItems={media[block.id] || []}
            onAnswerChange={handleAnswerChange}
            onMediaChange={handleMediaChange}
          />
        ))}

        {/* PWA INSTALL SECTION */}
        <AnimatePresence>
          {!isInstalled && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-32 max-w-2xl mx-auto px-6"
            >
              <button 
                onClick={handleInstallClick}
                className="w-full relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 p-8 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 text-left"
              >
                {/* Glow Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex items-center justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-violet-400 border border-white/5 group-hover:bg-violet-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                        <Smartphone size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Performance Nativa</span>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-light text-white leading-tight">
                      Instale o <span className="font-bold italic text-violet-400">{appCustomName}</span> no seu dispositivo
                    </h3>
                    
                    <p className="text-xs md:text-sm text-white/40 font-light leading-relaxed max-w-sm">
                      Acesse {appCustomDesc} com zero latência, notificações em tempo real e modo offline.
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 group-hover:bg-white text-black transition-all">
                    <Download size={24} className="group-hover:animate-bounce" />
                  </div>
                </div>

                {/* Bottom Highlight */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="mt-4 flex justify-center">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/10 flex items-center gap-2">
                  <Sparkles size={10} /> Disponível para iOS, Android e Desktop
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <PWAInstallModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />

        {/* LOGOUT SECTION */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 flex flex-col items-center justify-center gap-12"
        >
          <div className="h-px w-24 bg-white/10" />
          <button 
            onClick={() => logout()}
            className="group flex flex-col items-center gap-4 transition-all hover:scale-105 active:scale-95"
          >
            <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all duration-500 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <span className="material-symbols-outlined text-3xl">logout</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 group-hover:text-red-500 transition-colors">
              Encerrar Sessão
            </span>
          </button>
          <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/10 max-w-xs text-center leading-relaxed">
            Sua identidade local é preservada neste dispositivo.
          </p>
        </motion.div>
      </section>

      {/* PROGRESS INDICATOR (SUBTLE) */}
      <div className="fixed right-12 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-50 hidden md:flex">
        {BLOCKS.map((block) => {
          const blockInputs = block.inputs.map(i => i.id);
          const filledCount = blockInputs.filter(id => !!answers[id]).length;
          const isStarted = filledCount > 0;
          const isComplete = filledCount === blockInputs.length;
          
          return (
            <motion.div 
              key={block.id}
              animate={{ 
                scale: isComplete ? 2 : isStarted ? 1.5 : 1,
                backgroundColor: isComplete ? '#60a5fa' : isStarted ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)'
              }}
              className={`w-1 h-1 rounded-full transition-all duration-1000 ${isStarted ? 'shadow-[0_0_20px_rgba(96,165,250,0.3)]' : ''}`}
            />
          );
        })}
      </div>

      {/* FOOTER SPACING */}
      <div className="h-[60vh] flex flex-col items-center justify-center gap-8">
        <div className="w-px h-32 bg-gradient-to-b from-white/5 to-transparent" />
        <span className="text-[10px] md:text-xs uppercase tracking-[0.8em] text-white/10 font-light">
          a construção nunca termina. apenas evolui.
        </span>
      </div>
    </div>
  );
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const extractYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};
