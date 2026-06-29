import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedRocket from './AnimatedRocket';
import { useAuth } from '../lib/AuthContext';
import { haptics } from '../services/HapticService';
import {
  AnimatedDiary,
  AnimatedDashboard,
  AnimatedAmparadora,
  AnimatedFinancials,
  AnimatedMural,
  AnimatedManager,
  AnimatedEditor,
  AnimatedCommandCenter,
  AnimatedPresencesIcon
} from './AnimatedSidebarIcons';
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Sidebar({ isOpen, onClose, onToggleTheme, theme, onNavigate, currentPage }: SidebarProps) {
  const [isAmparoActive, setIsAmparoActive] = React.useState(false);
  const { logout } = useAuth();

  const mainNavItems = [
    { id: 'projects', title: 'Atacar Objetivos', desc: 'Gestão de metas e projetos', icon: 'rocket_launch', color: '#bae1ff' },
    { id: 'diary', title: 'Diário', desc: 'Sua jornada em palavras', icon: 'auto_stories', color: '#d1f2eb' },
    { id: 'amparo', title: 'Amparo', desc: 'Autopesquisa e Conscienciologia', icon: 'shield', color: '#c3a1ff' },
    { id: 'dashboard', title: 'Dashboard da Vida', desc: 'Visão geral do sistema', icon: 'dashboard', color: '#b3e5fc' },
    { id: 'amparadora', title: 'Amparadora AI', desc: 'Sua assistente de criação', icon: 'auto_fix', color: '#fdf2e9' },
    { id: 'cortes', title: 'Dinheiro Proéxis', desc: 'Sustento da Programação Existencial', icon: 'payments', color: '#c1e1c1' },
    { id: 'mural', title: 'Mural de Sucesso', desc: 'Suas conquistas e marcos', icon: 'military_tech', color: '#fdfd96' },
    { id: 'manager', title: 'Gerenciador', desc: 'Arquivos e organização', icon: 'folder_open', color: '#ffdac1' },
    { id: 'central-de-comando', title: 'Central de Comando', desc: 'Sistema e IA', icon: 'settings_suggest', color: '#cfd8dc' },
    { id: 'presences', title: 'Presenças', desc: 'Conexão e inspiração humana', icon: 'animation', color: '#f3e5f5' },
    { id: 'profile', title: 'Profile', desc: 'Personal Shell Interface', icon: 'terminal', color: '#ffc5e3' }
  ];  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="menu-backdrop"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="menu-panel"
          >
            <div className="panel-inner">
              {/* Panel Header */}
              <div className="panel-header">
                <button 
                  onClick={() => {
                    onClose();
                    haptics.lightClick();
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] border border-[#222] text-[#888] active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      onToggleTheme();
                      haptics.mediumClick();
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] border border-[#222] text-[#888] active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined">
                      {theme === 'light' ? 'dark_mode' : 'light_mode'}
                    </span>
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      haptics.lightClick();
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#111] border border-[#222] text-[#888] active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="panel-scroll no-scrollbar">
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col"
                >
                  {/* Arquitetura do seu Poder Pessoal / Manifesto de Identidade (Cabeçalho) */}
                  <motion.button
                    variants={itemVariants}
                    onClick={() => {
                      onNavigate('identity');
                      haptics.lightClick();
                    }}
                    className={`mb-4 mx-2 p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border ${
                      currentPage === 'identity' || currentPage === 'identity-view'
                        ? 'bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                        : 'bg-gradient-to-r from-zinc-900/50 to-black/50 border-zinc-800 hover:border-zinc-700/80'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg">
                      <span className="material-symbols-outlined text-xl">workspace_premium</span>
                    </div>
                    <div className="flex-1 text-left flex flex-col">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest leading-none mb-1">Poder Pessoal</span>
                      <span className="text-xs font-black text-white leading-tight">Manifesto de Identidade</span>
                    </div>
                  </motion.button>

                  {mainNavItems.map((item) => (
                    <motion.button
                      key={item.id}
                      variants={itemVariants}
                      onClick={() => {
                        onNavigate(item.id as any);
                        haptics.lightClick();
                      }}
                      className={`nav-card ${currentPage === item.id ? 'active' : ''}`}
                    >
                      <div className="nav-card-icon">
                        {item.id === 'projects' && <AnimatedRocket color={item.color} sizeForSidebar={true} />}
                        {item.id === 'diary' && <AnimatedDiary color={item.color} />}
                        {item.id === 'amparo' && <span className="material-symbols-outlined text-2xl" style={{ color: item.color }}>shield</span>}
                        {item.id === 'dashboard' && <AnimatedDashboard color={item.color} />}
                        {item.id === 'amparadora' && <AnimatedAmparadora color={item.color} />}
                        {item.id === 'cortes' && <AnimatedFinancials color={item.color} />}
                        {item.id === 'mural' && <AnimatedMural color={item.color} />}
                        {item.id === 'manager' && <AnimatedManager color={item.color} />}
                        {item.id === 'central-de-comando' && <AnimatedCommandCenter color={item.color} />}
                        {item.id === 'presences' && <AnimatedPresencesIcon color={item.color} />}
                        {item.id === 'profile' && <span className="material-symbols-outlined text-2xl" style={{ color: item.color }}>terminal</span>}
                      </div>
                      <div className="nav-card-content">
                        <span className="nav-card-title">{item.title}</span>
                        <span className="nav-card-desc">{item.desc}</span>
                      </div>
                    </motion.button>
                  ))}

                  {/* Amparo Slider (Functional Preservation) */}
                  <motion.div variants={itemVariants} className="mt-8 px-2 pb-6">
                    <div 
                      className="relative w-full h-14 rounded-full bg-[#050505] border border-[#222] p-1 flex items-center cursor-pointer overflow-hidden"
                      onClick={() => {
                        setIsAmparoActive(prev => {
                          const newState = !prev;
                          haptics.toggle(newState);
                          onNavigate('amparo');
                          return newState;
                        });
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black tracking-[0.25em] text-[#444] uppercase">AMPARO</span>
                      </div>
                      <motion.div 
                        animate={{ x: isAmparoActive ? 'calc(100% + 180px)' : 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="relative w-12 h-12 rounded-full bg-gradient-to-br from-white via-zinc-200 to-zinc-400 flex items-center justify-center z-10 shadow-lg"
                      >
                        <span className="material-symbols-outlined text-black text-xl">shield</span>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
              <div className="panel-footer flex flex-col items-center justify-center py-6" style={{ height: '40.5022px', paddingBottom: '18px', paddingTop: '22px', marginBottom: '-11px' }}>
                <span className="text-[10px] font-bold tracking-widest text-[#222] uppercase">Amor pelo Douglas</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
