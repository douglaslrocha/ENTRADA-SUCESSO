import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, CheckSquare, Briefcase, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { orchestrator } from '../../core/orchestrator';

interface DashboardInteractiveProps {
  data: {
    stats: any[];
    insights: string[];
  };
  onUpdate?: () => void;
}

export const DashboardInteractive: React.FC<DashboardInteractiveProps> = ({ data, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!data || !data.stats) {
    return (
      <div className="p-6 rounded-2xl bg-[#161616] border border-[#222] text-zinc-500 text-sm italic">
        Dados do dashboard indisponíveis.
      </div>
    );
  }

  const stats = data.stats || [];
  const insights = data.insights || [];

  const handleStatClick = async (label: string) => {
    setIsUpdating(true);
    try {
      let intent = 'query_tasks';
      if (label.toLowerCase().includes('projeto')) intent = 'query_projects';
      if (label.toLowerCase().includes('resumo')) intent = 'query_summary';
      
      const response = await orchestrator.executeDirectAction(intent, {});
      orchestrator.appendBlocksFromOrchestrator(response);
    } catch (error) {
      console.error('Erro ao navegar no dashboard:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      <div className="flex items-center gap-3 mb-2">
        <LayoutDashboard size={20} className="text-zinc-500" />
        <h2 className="text-lg font-semibold text-white">Resumo Executivo</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat: any, idx: number) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -4, borderColor: '#333' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStatClick(stat.label)}
            className="bg-[#111] border border-[#222] rounded-[20px] p-5 md:p-6 shadow-2xl flex flex-col justify-between min-h-[140px] cursor-pointer transition-all group"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider group-hover:text-zinc-300 transition-colors">{stat.label}</span>
              <div className={`p-2 rounded-lg transition-all ${
                stat.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20' :
                stat.status === 'warning' ? 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20' :
                stat.status === 'danger' ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20' :
                'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20'
              }`}>
                {stat.label.toLowerCase().includes('tarefa') ? <CheckSquare size={16} /> : 
                 stat.label.toLowerCase().includes('projeto') ? <Briefcase size={16} /> : <TrendingUp size={16} />}
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className={`text-[11px] font-medium ${
                  stat.trend?.includes('+') ? 'text-emerald-500' : 
                  stat.trend?.includes('-') ? 'text-red-500' : 'text-zinc-500'
                }`}>
                  {stat.trend}
                </div>
                <ChevronRight size={12} className="text-zinc-800 group-hover:text-purple-500 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {insights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#111] to-[#161616] border border-[#222] rounded-[20px] p-6 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-purple-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Insights da IA</span>
          </div>
          <ul className="space-y-3">
            {insights.map((insight: string, i: number) => (
              <li key={i} className="text-sm text-zinc-300 flex gap-3 group">
                <span className="text-purple-500 mt-1 group-hover:scale-125 transition-transform">•</span>
                <span className="group-hover:text-white transition-colors">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {isUpdating && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-20">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};
