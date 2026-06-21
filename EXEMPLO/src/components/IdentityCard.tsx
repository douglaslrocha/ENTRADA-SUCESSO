import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, Play } from 'lucide-react';

interface MediaItem {
  id?: string;
  type: 'image' | 'video' | 'youtube';
  url: string;
  thumbnail?: string;
}

interface IdentityCardProps {
  block: any;
  answers: Record<string, string>;
  media: MediaItem[];
  onClick?: () => void;
}

export function IdentityCard({ block, answers, media, onClick }: IdentityCardProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    if (!media || media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % media.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [media]);

  const currentMedia = media && media.length > 0 ? media[currentMediaIndex] : null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="group relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden bg-[#111111] border border-white/10 shadow-2xl cursor-pointer"
    >
      {/* Background Rotating Media */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMedia?.url || 'default'}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {currentMedia?.type === 'youtube' ? (
              <img 
                src={`https://img.youtube.com/vi/${getYouTubeId(currentMedia.url)}/maxresdefault.jpg`} 
                className="w-full h-full object-cover opacity-85"
              />
            ) : (
              <img 
                src={currentMedia?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'}
                className="w-full h-full object-cover opacity-85"
              />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Indicators for Video/YT */}
        {currentMedia && (currentMedia.type === 'video' || currentMedia.type === 'youtube') && (
          <div className="absolute top-6 right-6 z-20">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Play size={12} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-end z-10">
        <div className="space-y-3 md:space-y-4">
          <div className="space-y-0.5 md:space-y-1">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/30">
              {block.guide}
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white leading-[1.1] md:leading-tight">
              {block.label.split(' ')[1] || block.label}
            </h3>
          </div>

          <div className="pt-3 md:pt-4 border-t border-white/10 flex justify-between items-end gap-3">
            <div className="space-y-2 max-w-[75%]">
              <p className="text-[10px] md:text-xs font-serif italic text-white/50 leading-relaxed line-clamp-2">
                {block.activation}
              </p>
              <div className="flex gap-1 md:gap-1.5">
                {media?.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-0.5 md:h-1 rounded-full transition-all duration-500 ${i === currentMediaIndex ? 'w-3 md:w-4 bg-white' : 'w-1 bg-white/20'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
              <Maximize2 size={14} className="md:w-4 md:h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Silver Shine Overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      </div>
    </motion.div>
  );
}

function getYouTubeId(url: string) {
  if (url.length === 11) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
