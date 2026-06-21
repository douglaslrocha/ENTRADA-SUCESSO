import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Award, Info, AlertCircle, Sparkles } from 'lucide-react';

interface FeedbackItem {
  id: string;
  type: 'success' | 'completion' | 'info' | 'error';
  message: string;
  icon: string;
}

/**
 * Sistema de Feedback Visual Reativo.
 * Escuta eventos do Event Engine e renderiza microinterações no canvas.
 */
export const FeedbackSystem: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    const handleFeedback = (e: any) => {
      const { type, message, icon } = e.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      const newFeedback = { id, type, message, icon };
      setFeedbacks(prev => [...prev, newFeedback]);

      // Remove automaticamente após 3 segundos
      setTimeout(() => {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      }, 3000);
    };

    window.addEventListener('ui-feedback', handleFeedback);
    return () => window.removeEventListener('ui-feedback', handleFeedback);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'completion': return <Award className="text-purple-500" size={18} />;
      case 'info': return <Info className="text-blue-500" size={18} />;
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Sparkles className="text-zinc-400" size={18} />;
    }
  };

  const getGlow = (type: string) => {
    switch (type) {
      case 'success': return 'shadow-[0_0_20px_rgba(16,185,129,0.2)] border-emerald-500/20';
      case 'completion': return 'shadow-[0_0_20px_rgba(168,85,247,0.2)] border-purple-500/20';
      case 'info': return 'shadow-[0_0_20px_rgba(59,130,246,0.2)] border-blue-500/20';
      case 'error': return 'shadow-[0_0_20px_rgba(239,68,68,0.2)] border-red-500/20';
      default: return 'border-zinc-800';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {feedbacks.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#111] border backdrop-blur-xl ${getGlow(f.type)}`}
          >
            <div className="flex-shrink-0">
              {getIcon(f.type)}
            </div>
            <span className="text-sm font-bold text-white tracking-tight">{f.message}</span>
            
            {/* Efeito de brilho sutil ao aparecer */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 2, 1] }}
              transition={{ duration: 0.8 }}
              className={`absolute inset-0 rounded-2xl pointer-events-none ${
                f.type === 'success' ? 'bg-emerald-500/10' : 
                f.type === 'completion' ? 'bg-purple-500/10' : 'bg-white/5'
              }`}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
