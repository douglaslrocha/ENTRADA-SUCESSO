import React from 'react';
import { motion } from 'motion/react';

export const StudioLabel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <label className={`text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold mb-2 block pl-1 ${className}`}>
    {children}
  </label>
);

export const StudioInput = ({ 
  value, 
  onChange, 
  placeholder, 
  large = false,
  className = "" 
}: { 
  value: string, 
  onChange: (v: string) => void, 
  placeholder?: string,
  large?: boolean,
  className?: string
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-zinc-50/50 border border-zinc-100 rounded-2xl px-5 py-4 text-zinc-800 placeholder:text-zinc-300 focus:bg-white focus:border-zinc-300 focus:outline-none transition-all ${large ? 'text-lg font-light' : 'text-sm'} ${className}`}
  />
);

export const StudioTextArea = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "" 
}: { 
  value: string, 
  onChange: (v: string) => void, 
  placeholder?: string,
  className?: string
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-zinc-50/50 border border-zinc-100 rounded-3xl px-6 py-5 text-zinc-800 placeholder:text-zinc-300 focus:bg-white focus:border-zinc-300 focus:outline-none transition-all min-h-[120px] resize-none text-sm leading-relaxed ${className}`}
  />
);

export const StudioSection = ({ 
  title, 
  isOpen, 
  onToggle, 
  children, 
  icon 
}: { 
  title: string, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode,
  icon: string
}) => (
  <div className="border-b border-zinc-50 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-8 px-2 hover:bg-zinc-50/50 transition-colors group text-left"
    >
      <div className="flex items-center gap-5">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-400 group-hover:text-zinc-900'}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <h3 className={`text-lg transition-all ${isOpen ? 'font-medium text-zinc-900' : 'text-zinc-400 font-light'}`}>{title}</h3>
      </div>
      <span className={`material-symbols-outlined transition-transform duration-500 text-zinc-300 ${isOpen ? 'rotate-180' : ''}`}>
        expand_more
      </span>
    </button>
    <motion.div
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      className="overflow-hidden"
    >
      <div className="pb-12 pt-2 px-0 sm:px-4">
        {children}
      </div>
    </motion.div>
  </div>
);

export const StudioAction = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all group active:scale-95"
  >
    <span className="material-symbols-outlined text-lg">{icon}</span>
    <span className="text-[10px] uppercase tracking-widest font-bold">{label}</span>
  </button>
);
