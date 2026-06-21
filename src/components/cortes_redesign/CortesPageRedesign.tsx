import React from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Terminal, 
  Copy, 
  Activity, 
  LayoutGrid
} from 'lucide-react';
import { Category, Transaction } from '../../types';

export interface CortesPageProps {
  onBack: () => void;
  onToggleSidebar?: () => void;
  categories: Category[];
  transactions: Transaction[];
  onRefreshCategories: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const CortesPage: React.FC<CortesPageProps> = ({ 
  onBack, 
  onToggleSidebar, 
  categories, 
  transactions, 
  onRefreshCategories,
  theme = 'dark',
  onToggleTheme
}) => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-at-t from-zinc-900/60 via-black to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Decorative Aurora Blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col min-h-screen justify-between">
        
        {/* Top bar */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all text-xs font-black uppercase tracking-wider text-zinc-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft size={14} /> Voltar para o Sistema
          </button>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">PRONTO PARA CÓDIGO</span>
          </div>
        </div>

        {/* Presentational Header card */}
        <div className="bg-gradient-to-b from-zinc-900/80 to-zinc-950/90 border border-zinc-850 p-6 sm:p-10 rounded-[32px] shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 mb-6">
            <Sparkles size={24} className="animate-pulse" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Módulo Cortes <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Redesign</span>
          </h1>
          
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mb-8">
            Esta pasta foi criada especificamente para organizar o seu novo código sem quebrar sua aplicação. 
            Gere o novo arquivo usando o prompt super detalhado contido no arquivo <code className="bg-zinc-950 text-emerald-400 px-2 py-0.5 rounded font-mono text-xs border border-zinc-800">Instructions.md</code> localizado nesta mesma pasta, copie o resultado da outra Inteligência Artificial e simplesmente substitua o conteúdo abaixo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                <LayoutGrid size={18} />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-1">Passo 1: Copiar o Prompt</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Consulte o arquivo <code className="text-zinc-300 font-mono">Instructions.md</code>, copie o prompt super potente fornecido lá, e envie para outra AI (ex: Claude 3.5 Sonnet).
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-900 flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Terminal size={18} />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-1">Passo 2: Paste Completo</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Quando a outra AI gerar o código, substitua totalmente o arquivo <code className="text-zinc-300 font-mono">CortesPageRedesign.tsx</code> com o código copiado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini stats component context debug block */}
        <div className="mt-8 pt-8 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" />
            <span>Dados Carregados Prontos:</span>
            <span className="text-zinc-300 font-bold">{categories.length} Categorias</span>
            <span>&bull;</span>
            <span className="text-zinc-300 font-bold">{transactions.length} Transações</span>
          </div>
          <div>
            <span>Pronto para Redesign &bull; Remix 1.7 / A5</span>
          </div>
        </div>

      </div>
    </div>
  );
};
