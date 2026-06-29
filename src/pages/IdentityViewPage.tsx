import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { BLOCKS, INTERSTITIALS } from './IdentityPage';
import { identityService } from '../services/identityService';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2, Play, Volume2, Sparkles, LayoutGrid, ScrollText, X } from 'lucide-react';
import { IdentityCard } from '../components/IdentityCard';

interface MediaItem {
  id?: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
  thumbnail?: string;
}

const getYouTubeId = (url: string) => {
  if (url.length === 11) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function YouTubeEmbed({ url, className, isBackground = false }: { url: string, className?: string, isBackground?: boolean }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      <iframe
        src={embedUrl}
        className={`absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 pointer-events-none ${isBackground ? 'opacity-100' : 'opacity-100'}`}
        allow="autoplay; encrypted-media"
        frameBorder="0"
      />
    </div>
  );
}

function HeroSection({ name, media }: { name: string, media?: MediaItem }) {
  return (
    <section className="relative h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={media?.url || 'hero-default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {media?.type === 'youtube' ? (
              <YouTubeEmbed url={media.url} isBackground className="blur-[8px] scale-110 opacity-30" />
            ) : media?.type === 'video' ? (
              <video 
                src={media.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover blur-[8px] scale-110 opacity-30"
              />
            ) : (
              <motion.img 
                src={media?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'}
                className="w-full h-full object-cover blur-[8px] scale-110 opacity-30"
                animate={{ scale: [1.1, 1.15, 1.1] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 max-w-4xl px-4"
      >
        <span className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white/40 mb-4 md:mb-6 block">
          Manifesto de Identidade
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-[1.1] md:leading-tight mb-6 md:mb-8">
          {name}, <br/> 
          <span className="relative inline-block">
            <span className="text-white/60">sua identidade não é mais uma ideia.</span>
            <span className="absolute inset-0 animate-silver-shine pointer-events-none">
              sua identidade não é mais uma ideia.
            </span>
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-3xl font-serif italic text-white/40 leading-relaxed px-4 md:px-0">
          É uma decisão em movimento. Você está se tornando alguém que opera com clareza, direção e presença.
        </p>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
      >
        <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
      </motion.div>
    </section>
  );
}

export function IdentityViewPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [mediaData, setMediaData] = useState<Record<string, MediaItem[]>>({});
  const [focusedMedia, setFocusedMedia] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'scroll' | 'cards'>('cards');
  const [selectedBlock, setSelectedBlock] = useState<any>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedAnswers, loadedMedia] = await Promise.all([
          identityService.loadAnswers(),
          identityService.loadMedia(),
        ]);

        setAnswers(loadedAnswers);
        setMediaData(loadedMedia);

        const focus: Record<string, number> = {};
        for (const block of BLOCKS) {
          if (loadedMedia[block.id] && loadedMedia[block.id].length > 0) {
            focus[block.id] = 0;
          }
        }
        setFocusedMedia(focus);
      } catch (err) {
        console.error('Failed to load identity data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Listen for updates from IdentityPage
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('identity-media-updated', handleUpdate);
    return () => {
      window.removeEventListener('identity-media-updated', handleUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/20 font-serif italic text-2xl"
        >
          Sincronizando Identidade...
        </motion.div>
      </div>
    );
  }

  const identityBlocks = BLOCKS.filter(b => !b.id.startsWith('weekly_'));
  const weeklyBlocks = BLOCKS.filter(b => b.id.startsWith('weekly_'));
  const firstMedia = Object.values(mediaData).find(m => m.length > 0)?.[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20 overflow-x-hidden">
      {/* Botão de Voltar Fixo */}
      <nav className="fixed top-4 left-4 md:top-8 md:left-8 z-[100]">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 md:p-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl hover:bg-white/10 transition-all group flex items-center gap-3"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Voltar</span>
        </button>
      </nav>

      {/* Hero Section */}
      <HeroSection name="Douglas L. Rocha" media={firstMedia} />

      {/* Seção de Toggle de Visualização */}
      <div className="flex justify-center gap-3 md:gap-4 mb-16 md:mb-20 px-6">
        <button 
          onClick={() => setViewMode('cards')}
          className={`px-6 md:px-8 py-3.5 md:py-4 rounded-2xl flex items-center gap-3 transition-all ${viewMode === 'cards' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <LayoutGrid size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Cards</span>
        </button>
        <button 
          onClick={() => setViewMode('scroll')}
          className={`px-6 md:px-8 py-3.5 md:py-4 rounded-2xl flex items-center gap-3 transition-all ${viewMode === 'scroll' ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <ScrollText size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Imersivo</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'cards' ? (
          <motion.section 
            key="cards-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto px-6 md:px-8 mb-32"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {identityBlocks.map((block) => (
                <IdentityCard 
                  key={block.id} 
                  block={block} 
                  answers={answers} 
                  media={mediaData[block.id] || []}
                  onClick={() => setSelectedBlock(block)}
                />
              ))}
            </div>
          </motion.section>
        ) : (
          <motion.div
            key="scroll-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Seções de Identidade */}
            {identityBlocks.map((block, index) => (
              <div key={block.id}>
                <IdentitySection 
                  block={block} 
                  answers={answers} 
                  media={mediaData[block.id] || []}
                  focusedIndex={focusedMedia[block.id] || 0}
                  onMediaFocus={(idx) => setFocusedMedia(prev => ({ ...prev, [block.id]: idx }))}
                />
                
                {/* Interstitial entre blocos */}
                {index < identityBlocks.length - 1 && (
                  <section className="h-[30vh] md:h-[40vh] flex items-center justify-center px-6 md:px-8 bg-[#0a0a0a] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="relative z-10 flex flex-col items-center gap-4 md:gap-6"
                    >
                      <Sparkles size={16} className="text-white/10 md:w-5 md:h-5" />
                      <p className="text-xl md:text-4xl font-serif italic text-white/20 text-center max-w-2xl leading-tight tracking-tight px-4">
                        {INTERSTITIALS[index % INTERSTITIALS.length]}
                      </p>
                      <div className="w-6 md:w-8 h-px bg-white/5" />
                    </motion.div>
                  </section>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhe do Card (Visualização Individual) */}
      <AnimatePresence>
        {selectedBlock && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlock(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]"
            >
              <button 
                onClick={() => setSelectedBlock(null)}
                className="absolute top-6 right-6 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition-all z-[1010]"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                <IdentitySection 
                  block={selectedBlock} 
                  answers={answers} 
                  media={mediaData[selectedBlock.id] || []}
                  focusedIndex={focusedMedia[selectedBlock.id] || 0}
                  onMediaFocus={(idx) => setFocusedMedia(prev => ({ ...prev, [selectedBlock.id]: idx }))}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Seção Semanal */}
      <section className="min-h-screen relative py-20 md:py-32 px-6 md:px-8 flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="max-w-7xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24 text-center"
          >
            <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter italic mb-4 opacity-20">
              Ciclo Semanal
            </h2>
            <p className="text-white/40 font-serif italic text-lg md:text-xl">
              A arquitetura das suas decisões diárias.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {weeklyBlocks.map((block, idx) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 sm:p-6 md:p-8 bg-white/5 border border-white/10 rounded-[1.8rem] md:rounded-[2.5rem] flex flex-col gap-5 md:gap-6"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-white/30">
                    {block.guide}
                  </span>
                  <h3 className="text-lg md:text-2xl font-black uppercase italic tracking-tight">
                    {block.inputs[0].label}
                  </h3>
                </div>
                
                <div className="flex-1">
                  <p className="text-base md:text-lg text-white/80 leading-relaxed font-medium">
                    {answers[block.inputs[0].id] || "Nenhuma decisão definida para este dia."}
                  </p>
                </div>

                <div className="pt-5 md:pt-6 border-t border-white/10">
                  <p className="text-[10px] font-serif italic text-white/40 leading-relaxed">
                    {block.activation}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Finalização */}
      <footer className="h-screen flex flex-col items-center justify-center text-center px-6 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-transparent opacity-30" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          <h3 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter mb-8">
            O Devir <br/> é Agora.
          </h3>
          <p className="text-white/40 font-serif italic text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
            "Você não se torna alguém por acaso. Você se constrói através de cada imagem, cada palavra e cada decisão."
          </p>
        </motion.div>
      </footer>
    </div>
  );
}

function IdentitySection({ block, answers, media, focusedIndex, onMediaFocus }: { 
  block: any, 
  answers: Record<string, string>, 
  media: MediaItem[],
  focusedIndex: number,
  onMediaFocus: (idx: number) => void
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  const currentMedia = media[focusedIndex];

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden py-20 md:py-32"
    >
      {/* Background Imersivo com Sincronização */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMedia?.url || 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            {currentMedia?.type === 'youtube' ? (
              <YouTubeEmbed url={currentMedia.url} isBackground className="blur-[10px] scale-110 opacity-40" />
            ) : currentMedia?.type === 'video' ? (
              <video 
                src={currentMedia.url}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover blur-[10px] scale-110 opacity-40"
              />
            ) : (
              <motion.img 
                src={currentMedia?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'}
                className="w-full h-full object-cover blur-[10px] scale-110 opacity-40"
                animate={{ scale: [1.1, 1.2, 1.1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Conteúdo do Bloco */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative z-10 w-full max-w-7xl px-5 sm:px-8 md:px-12 flex flex-col gap-12 md:gap-16"
      >
        <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Textos Completos */}
          <div className="flex-1 space-y-10 md:space-y-12 w-full">
            <div className="space-y-4 md:space-y-6">
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-white/30 block">
                {block.guide}
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-[1.1] md:leading-none">
                {block.label.split(' ')[1] || block.label}
              </h2>
              <p className="text-base md:text-2xl font-serif italic text-white/60 max-w-xl leading-relaxed">
                {block.activation}
              </p>
              
              {/* Direction: Contextualização do pensamento */}
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="pt-6 md:pt-4 border-t border-white/5"
              >
                <p className="text-[10px] md:text-[13px] font-medium uppercase tracking-[0.15em] md:tracking-[0.2em] text-white/20 leading-relaxed max-w-lg">
                  {block.direction}
                </p>
              </motion.div>
            </div>

            <div className="space-y-10 md:space-y-12">
              {block.inputs.map((input: any) => (
                <div key={input.id} className="space-y-3 md:space-y-4">
                  <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                    {input.label}
                  </h4>
                  <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/90 leading-relaxed md:leading-tight">
                    {answers[input.id] || (
                      <span className="text-white/10 italic font-serif">
                        {input.placeholder || "Ainda em construção..."}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Reinforcement: Fechamento com impacto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="pt-8 md:pt-12"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-8 md:w-12 h-px bg-white/10" />
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Reforço</span>
              </div>
              <p className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-white/40 leading-none">
                {block.reinforcement}
              </p>
            </motion.div>
          </div>

          {/* Carrossel de Mídia (Foreground) */}
          <div className="w-full md:w-[450px] shrink-0 space-y-4 md:space-y-6">
            <div className="relative aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMedia?.url || 'placeholder'}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full"
                >
                  {currentMedia?.type === 'youtube' ? (
                    <YouTubeEmbed url={currentMedia.url} />
                  ) : currentMedia?.type === 'video' ? (
                    <video 
                      src={currentMedia.url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={currentMedia?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              
              {/* Overlay de Navegação no Carrossel */}
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                <div className="flex gap-1.5 md:gap-2">
                  {media.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => onMediaFocus(i)}
                      className={`h-1 rounded-full transition-all ${i === focusedIndex ? 'w-6 md:w-8 bg-white' : 'w-1.5 md:w-2 bg-white/20'}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onMediaFocus(Math.max(0, focusedIndex - 1))}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                  >
                    <ChevronLeft size={16} className="md:w-5 md:h-5" />
                  </button>
                  <button 
                    onClick={() => onMediaFocus(Math.min(media.length - 1, focusedIndex + 1))}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
                  >
                    <ChevronRight size={16} className="md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Miniaturas / Scroll Lateral */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
              {media.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onMediaFocus(i)}
                  className={`relative shrink-0 w-24 aspect-square rounded-2xl overflow-hidden border-2 transition-all snap-start ${
                    i === focusedIndex ? 'border-white scale-105' : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  {item.type === 'youtube' ? (
                    <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/0.jpg`} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.thumbnail || item.url} className="w-full h-full object-cover" />
                  )}
                  {(item.type === 'video' || item.type === 'youtube') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={12} fill="white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
