
import React from 'react';
import { motion, useSpring } from 'motion/react';

interface PresenceCircleProps {
  photo: string;
  name: string;
  size: number;
  x: number;
  y: number;
  onDragStart: () => void;
  onDrag: (event: any, info: any) => void;
  onDragEnd: () => void;
  onClick: () => void;
  index: number;
  theme?: 'light' | 'dark';
}

export const PresenceCircle: React.FC<PresenceCircleProps> = ({ 
  photo, name, size, x, y, onDragStart, onDrag, onDragEnd, onClick, index, theme 
}) => {
  const isDark = theme === 'dark';
  const springConfig = { damping: 30, stiffness: 150 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  React.useEffect(() => {
    springX.set(x);
    springY.set(y);
  }, [x, y, springX, springY]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        position: 'absolute',
        // Centers the element relative to its (x,y) coordinate
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      className="cursor-grab active:cursor-grabbing group z-10"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        if (e.defaultPrevented) return;
        onClick();
      }}
    >
      <div className={`absolute inset-0 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${
        isDark ? 'bg-white/10' : 'bg-white/5'
      }`} />
      
      <div className={`relative w-full h-full rounded-full p-1 border backdrop-blur-md shadow-xl overflow-hidden transition-all duration-700 ${
        isDark 
          ? 'border-white/15 bg-zinc-900/60 group-hover:border-white/30' 
          : 'border-black/5 bg-white/60 group-hover:border-black/20'
      }`}>
        <img 
          src={photo} 
          alt={name} 
          className="w-full h-full object-cover rounded-full grayscale-[0.1] group-hover:grayscale-0 transition-all duration-1000 scale-[1.02] group-hover:scale-100"
          referrerPolicy="no-referrer"
        />
      </div>

      <motion.div 
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none text-center"
      >
        <span className={`block text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-bold transition-colors ${
          isDark 
            ? 'text-zinc-500 group-hover:text-zinc-100' 
            : 'text-zinc-400 group-hover:text-zinc-900'
        }`}>
          {name}
        </span>
      </motion.div>
    </motion.div>
  );
};
