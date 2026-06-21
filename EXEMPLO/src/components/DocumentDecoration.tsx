import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image as ImageIcon, Smile, X, GripVertical, Upload } from 'lucide-react';

interface DocumentCoverProps {
  url: string | null;
  position: number;
  onAdd: () => void;
  onChange: () => void;
  onRemove: () => void;
  onPositionChange: (pos: number) => void;
  isRepositioning?: boolean;
  onEndReposition?: () => void;
}

export const DocumentCover = ({ 
  url, 
  position, 
  onAdd, 
  onChange, 
  onRemove, 
  onPositionChange,
  isRepositioning,
  onEndReposition
}: DocumentCoverProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startPos, setStartPos] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!url) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setStartPos(position);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const deltaY = e.clientY - startY;
      const containerHeight = containerRef.current.offsetHeight;
      const movementPercent = (deltaY / containerHeight) * 100;
      let newPos = startPos + movementPercent;
      newPos = Math.max(0, Math.min(100, newPos));
      onPositionChange(newPos);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startPos, onPositionChange]);

  useEffect(() => {
    if (!isRepositioning) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onEndReposition?.();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isRepositioning, onEndReposition]);

  if (!url) {
    return null; // Handled by the combined buttons in EditorComponent
  }

  return (
    <div 
      ref={containerRef}
      onClick={() => !isRepositioning && onChange()}
      className={`relative w-full h-[250px] sm:h-[300px] group overflow-hidden select-none ${!isRepositioning ? 'cursor-pointer' : ''}`}
    >
      <img
        src={url}
        alt="Capa do documento"
        className="w-full h-full object-cover pointer-events-none"
        style={{ objectPosition: `center ${position}%` }}
        referrerPolicy="no-referrer"
      />
      
      {/* Smooth transition overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'linear-gradient(to bottom, transparent 60%, var(--bg))' 
        }}
      />

      {/* Repositioning Controls */}
      <AnimatePresence>
        {isRepositioning && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          >
            <div className="flex flex-col items-center gap-4">
              <div 
                onMouseDown={handleMouseDown}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/80 text-white backdrop-blur-xl border border-white/20 shadow-2xl cursor-ns-resize hover:scale-105 transition-transform active:scale-95"
              >
                <GripVertical size={20} />
                <span className="font-bold tracking-tight">Arraste para reposicionar</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEndReposition?.();
                }}
                className="px-6 py-2 rounded-xl bg-white text-black font-bold text-sm shadow-xl hover:scale-105 transition-transform active:scale-95"
              >
                Pronto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DocumentIconProps {
  icon: string | null;
  hasCover: boolean;
  onAdd: () => void;
  onChange: () => void;
  onRemove: () => void;
}

export const DocumentIcon = ({ 
  icon, 
  hasCover, 
  onAdd, 
  onChange, 
  onRemove 
}: DocumentIconProps) => {
  if (!icon) {
    return null; // Handled by the combined buttons in EditorComponent
  }

  const isEmoji = !icon.startsWith('http') && !icon.startsWith('data:image');

  return (
    <div className={`relative px-4 sm:px-8 ${hasCover ? '-mt-12' : 'mt-4'} mb-2 group inline-block`}>
      <div 
        onClick={onChange}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl cursor-pointer hover:bg-black/5 transition-all overflow-hidden"
      >
        {isEmoji ? (
          icon
        ) : (
          <img src={icon} alt="Ícone" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        )}
      </div>
    </div>
  );
};
