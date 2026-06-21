import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('A autorização de acesso é necessária.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciais não reconhecidas pelo sistema.');
      }
    } catch (err) {
      setError('Erro na comunicação com o servidor de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-sm w-full space-y-10 z-10"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Pulse Rings */}
              <motion.div 
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.05, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-4 border border-white/5 rounded-full" 
              />
              
              {/* Main Icon Container - Dark with Ultra-thin Gold Border */}
              <div className="w-16 h-16 rounded-2xl bg-[#0d0d0d] border border-[#C5A059]/50 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(197,160,89,0.1)] relative overflow-hidden">
                {/* Gold Shine Sweep */}
                <motion.div 
                  animate={{ x: ['150%', '-150%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent -rotate-45"
                />
                
                <ShieldCheck className="w-8 h-8 text-[#D4AF37] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10" strokeWidth={1} />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-outfit font-semibold tracking-tight text-white">Identificação</h2>
          <p className="text-white/30 text-[11px] tracking-[0.2em] uppercase font-medium">Validar credenciais de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/40 transition-colors" />
              <input
                type="email"
                placeholder="E-mail de Acesso"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white/40 transition-colors" />
              <input
                type="password"
                placeholder="Senha de Sessão"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all placeholder:text-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-6 space-y-4 shadow-inner">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <div className={`h-5 w-5 bg-white/5 border border-white/20 rounded-md transition-all peer-checked:bg-white peer-checked:border-white flex items-center justify-center shadow-lg`}>
                  {consent && (
                    <motion.div animate={{ scale: 1 }} initial={{ scale: 0 }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L3.5 7L9 1" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <span className={`text-[10px] ${consent ? 'text-white' : 'text-white/50'} transition-colors leading-relaxed font-bold uppercase tracking-wide block`}>
                  Termo de Responsabilidade Criminal & Rastreamento Total
                </span>
                <span className={`text-[9px] ${consent ? 'text-white/80' : 'text-white/30'} transition-colors leading-relaxed uppercase tracking-tighter block`}>
                  ESTO ESTOU CIENTE QUE ESTE AMBIENTE É PROTEGIDO PELA <b className={`${consent ? 'text-white' : 'text-white/60'}`}>LEI Nº 12.737/2012</b> E <b className={`${consent ? 'text-white' : 'text-white/60'}`}>ART. 154-A DO CÓDIGO PENAL BRASILEIRO</b>. O ACESSO NÃO AUTORIZADO OU TENTATIVA DE INVASÃO CONFIGURA CRIME FEDERAL COM PENA DE RECLUSÃO. NESTE MOMENTO, ESTOU SENDO MONITORADO VIA <b className={`${consent ? 'text-white' : 'text-white/60'}`}>ENDEREÇO IP, GEOLOCALIZAÇÃO PRECISA, DIGITAL DO DISPOSITIVO (HARDWARE ID), TELEMETRIA BIOMÉTRICA E PROVEDOR DE INTERNET</b> PARA FINS DE IDENTIFICAÇÃO EM EVENTUAL PROCESSO CRIMINAL.
                </span>
              </div>
            </label>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-red-400/80 bg-red-400/5 p-4 rounded-xl border border-red-400/10 text-[11px]"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={isLoading || !consent}
            className="w-full py-4 bg-white text-black font-bold rounded-xl transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </motion.button>
        </form>

        <div className="text-center pt-8 opacity-20">
          <p className="text-[9px] text-white uppercase tracking-[0.3em] font-medium italic">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
