import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface NativeTimePickerProps {
  value: string; // Format "1h 30m" or "30m" or "2h"
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  label: string;
}

export default function NativeTimePicker({ value, onChange, isOpen, onClose, label }: NativeTimePickerProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const hMatch = value.match(/(\d+)h/);
      const mMatch = value.match(/(\d+)m/);
      setHours(hMatch ? parseInt(hMatch[1]) : 0);
      setMinutes(mMatch ? parseInt(mMatch[1]) : 0);
    }
  }, [value, isOpen]);

  const handleConfirm = () => {
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours === 0) result += `${minutes}m`;
    onChange(result.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <div className="absolute inset-0 bg-neutral-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="relative w-full max-w-md bg-neutral-black border-t sm:border border-neutral-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-neutral-white/5 flex items-center justify-between bg-neutral-white/5">
            <h3 className="text-xs font-bold text-neutral-white/60 uppercase tracking-widest">{label}</h3>
            <button onClick={onClose} className="text-neutral-white/40 hover:text-neutral-white">
              <Clock size={20} />
            </button>
          </div>

          <div className="p-8 flex items-center justify-center gap-8 bg-neutral-black">
            {/* Hours Column */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Horas</span>
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => setHours(prev => Math.min(prev + 1, 23))}
                  className="p-2 text-neutral-white/40 hover:text-pastel-indigo transition-colors"
                >
                  <ChevronUp size={24} />
                </button>
                <div className="w-20 h-24 bg-neutral-white/5 rounded-2xl flex items-center justify-center border border-neutral-white/10">
                  <span className="text-4xl font-black text-pastel-indigo">{hours.toString().padStart(2, '0')}</span>
                </div>
                <button 
                  onClick={() => setHours(prev => Math.max(prev - 1, 0))}
                  className="p-2 text-neutral-white/40 hover:text-pastel-indigo transition-colors"
                >
                  <ChevronDown size={24} />
                </button>
              </div>
            </div>

            <div className="text-4xl font-black text-neutral-white/10 mt-8">:</div>

            {/* Minutes Column */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Minutos</span>
              <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => setMinutes(prev => Math.min(prev + 5, 55))}
                  className="p-2 text-neutral-white/40 hover:text-pastel-indigo transition-colors"
                >
                  <ChevronUp size={24} />
                </button>
                <div className="w-20 h-24 bg-neutral-white/5 rounded-2xl flex items-center justify-center border border-neutral-white/10">
                  <span className="text-4xl font-black text-pastel-indigo">{minutes.toString().padStart(2, '0')}</span>
                </div>
                <button 
                  onClick={() => setMinutes(prev => Math.max(prev - 5, 0))}
                  className="p-2 text-neutral-white/40 hover:text-pastel-indigo transition-colors"
                >
                  <ChevronDown size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-neutral-white/5 border-t border-neutral-white/5 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest hover:bg-neutral-white/5 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={handleConfirm}
              className="flex-1 py-4 bg-pastel-indigo text-neutral-black rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
