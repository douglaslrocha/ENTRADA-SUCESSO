import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Lock, UserCheck, Vault, Eye } from 'lucide-react';

interface WelcomePageProps {
  onNext: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Subtle Depth Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full text-center z-10"
      >
        <div className="flex justify-center mb-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Security Pulse Ring */}
            <motion.div 
              animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.05, 0.1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -inset-6 border border-white/5 rounded-full pointer-events-none" 
            />

            {/* Main Icon Container - Dark Metallic */}
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#1a1a1a] border border-white/10 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_2px_10px_rgba(255,255,255,0.05)] relative overflow-hidden group">
              <motion.div 
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 pointer-events-none"
              />
              <div className="relative z-10">
                <UserCheck className="w-10 h-10 text-[#f5f5f7] drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" strokeWidth={1} />
              </div>
            </div>

            {/* Silver Safe (Vault) - Top Right */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, y: -15, x: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 20 }}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-[#0d0d0d] border border-[#E5E7EB]/30 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.1)] z-20 overflow-hidden"
            >
              {/* Border Shine Animation */}
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.5, 0.1],
                  borderColor: ['rgba(229,231,235,0.3)', 'rgba(229,231,235,0.8)', 'rgba(229,231,235,0.3)'] 
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-[#E5E7EB] rounded-xl pointer-events-none"
              />
               <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
              />
              <Vault className="w-5 h-5 text-[#E5E7EB] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={0.8} />
            </motion.div>

            {/* Golden Shield Seal - Ultra-thin gold border */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, x: 15 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 20 }}
              className="absolute -bottom-2 -right-3 w-9 h-9 rounded-xl bg-[#0d0d0d] border border-[#C5A059]/40 flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(197,160,89,0.1)] z-20 overflow-hidden"
            >
              {/* Gold Border Shine Animation */}
              <motion.div 
                animate={{ 
                  opacity: [0.2, 0.6, 0.2],
                  borderColor: ['rgba(197,160,89,0.4)', 'rgba(197,160,89,1)', 'rgba(197,160,89,0.4)'] 
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
                className="absolute inset-0 border border-[#C5A059] rounded-xl pointer-events-none"
              />
              <Shield className="w-4 h-4 text-[#C5A059] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" strokeWidth={1} fill="rgba(197, 160, 89, 0.05)" />
            </motion.div>

            {/* Silver Eye Seal - Ultra-thin silver border */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, x: -15, y: 15 }}
              animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200, damping: 20 }}
              className="absolute -bottom-4 left-0 w-8 h-8 rounded-lg bg-[#0d0d0d] border border-[#E5E7EB]/30 flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.05)] z-20 overflow-hidden"
            >
              {/* Silver Border Shine Animation */}
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.4, 0.1],
                  borderColor: ['rgba(229,231,235,0.3)', 'rgba(229,231,235,0.7)', 'rgba(229,231,235,0.3)'] 
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute inset-0 border border-[#E5E7EB] rounded-lg pointer-events-none"
              />
              <Eye className="w-4 h-4 text-[#E5E7EB] opacity-70" strokeWidth={1} />
            </motion.div>

            {/* Golden Lock Seal - Ultra-thin gold border */}
            <motion.div 
              initial={{ scale: 0, opacity: 0, x: -15 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
              className="absolute -left-4 top-2 w-9 h-9 rounded-lg bg-[#0d0d0d] border border-[#C5A059]/30 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(197,160,89,0.05)] z-20 overflow-hidden"
            >
              {/* Gold Border Shine Animation */}
              <motion.div 
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  borderColor: ['rgba(197,160,89,0.3)', 'rgba(197,160,89,0.9)', 'rgba(197,160,89,0.3)'] 
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 1.5 }}
                className="absolute inset-0 border border-[#C5A059] rounded-lg pointer-events-none"
              />
              <Lock className="w-4 h-4 text-[#C5A059] opacity-60" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        </div>

        <div className="space-y-4 mb-12">
          <h1 className="text-3xl font-outfit font-semibold tracking-tight text-white/90">
            Acesso Autorizado
          </h1>
          <p className="text-white/40 text-sm leading-relaxed px-12 font-light">
            Este ambiente é de uso exclusivo para operações identificadas. Prossiga para validar sua sessão de trabalho.
          </p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,1)' }}
            whileTap={{ scale: 0.99 }}
            onClick={onNext}
            className="group relative w-full py-4 bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all"
          >
            <span className="text-sm">Acessar Área Segura</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Sessão Criptografada</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Modern minimal footer accent */}
      <div className="absolute bottom-12 text-white/5 uppercase tracking-[0.5em] text-[10px] font-bold">
        Personal Management System
      </div>
    </div>
  );
};

export default WelcomePage;
