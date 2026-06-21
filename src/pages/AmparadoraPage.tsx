import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  Trash2, 
  Sparkles,
  Maximize2,
  Circle,
  MoreVertical,
  Plus,
  MessageSquare,
  History,
  Pencil,
  Trash,
  Home,
  Clock
} from 'lucide-react';
import { useAmparadora } from '../hooks/useAmparadora';
import MessageList from '../components/amparadora/MessageList';
import ChatInput from '../components/amparadora/ChatInput';
import ChatSidebar from '../components/amparadora/ChatSidebar';
import { backgroundService } from '../services/backgroundService';
import { haptics } from '../services/HapticService';

interface AmparadoraPageProps {
  onToggleSidebar: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AmparadoraPage({ onToggleSidebar, theme, onToggleTheme }: AmparadoraPageProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showMenu, setShowMenu] = useState<string | false>(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgVersion, setBgVersion] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);

  // Sync backgrounds with Central de Comando
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.page === 'amparadora') {
        setBgVersion(v => v + 1);
      }
    };
    window.addEventListener('backgrounds-updated', handleUpdate);
    return () => window.removeEventListener('backgrounds-updated', handleUpdate);
  }, []);

  const allBackgroundImages = useMemo(() => {
    return backgroundService.getImages('amparadora');
  }, [bgVersion]);

  useEffect(() => {
    if (allBackgroundImages.length <= 1) {
      setBgIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % allBackgroundImages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [allBackgroundImages.length]);

  const location = useLocation();
  const processedMessageRef = useRef<string | null>(null);

  const { 
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    switchConversation,
    createNewChat,
    removeConversation,
    renameConversation,
    clearHistory
  } = useAmparadora();

  // Handle message from navigation state
  useEffect(() => {
    if (location.state?.action === 'new-chat') {
      createNewChat();
      window.history.replaceState({}, document.title);
      return;
    }

    const initialMessage = location.state?.initialMessage;
    const initialFile = location.state?.initialFile;
    
    if (initialMessage && !isLoading && processedMessageRef.current !== initialMessage) {
      processedMessageRef.current = initialMessage;
      
      // Clear state
      window.history.replaceState({}, document.title);
      
      // Send the message
      sendMessage(initialMessage, initialFile);
    }
  }, [location.state, isLoading, sendMessage]);

  useEffect(() => {
    const handleReset = () => switchConversation('');
    window.addEventListener('amparadora-reset', handleReset);
    return () => window.removeEventListener('amparadora-reset', handleReset);
  }, [switchConversation]);

  const handleNewChat = () => {
    createNewChat();
    setIsHistoryOpen(false);
  };

  const handleStartRename = () => {
    if (activeConversation) {
      setEditingTitle(activeConversation.title);
      setIsEditingTitle(true);
    }
  };

  const handleSaveRename = () => {
    if (activeConversationId && editingTitle.trim()) {
      renameConversation(activeConversationId, editingTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const getShortTitle = (title: string, length: number = 20) => {
    if (!title) return '';
    if (title.length <= length) return title;
    return title.substring(0, length) + '...';
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden relative font-sans">
      {/* Layer 0: Background Environment */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg)]">
        {/* Carousel Background */}
        <AnimatePresence initial={false}>
          <motion.div 
            key={allBackgroundImages[bgIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: theme === 'dark' ? 0.35 : 0.25,
              scale: [1.1, 1.05, 1.1],
            }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              opacity: { duration: 4, ease: "easeInOut" },
              scale: { duration: 40, repeat: Infinity, ease: "linear" }
            }}
            className="absolute -inset-[10%]"
          >
            <img 
              src={allBackgroundImages[bgIndex]} 
              alt="Page Background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Global Blur & Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 backdrop-blur-[2px] ${theme === 'light' ? 'bg-[var(--bg)]/40' : 'bg-[var(--bg)]/30'} transition-colors duration-500`} />
          <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(139,92,246,0.05)'}_0%,transparent_70%)]`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg)_100%)]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-w-0 relative h-full">
        {/* Header - Symmetric Design */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-4 md:px-6 md:pt-4 pointer-events-none">
          <header className={`pointer-events-auto flex items-center justify-between px-6 py-2 border backdrop-blur-xl h-11 md:h-14 rounded-2xl w-full transition-all duration-300 shadow-xl ${
            theme === 'dark' 
              ? 'bg-white/[0.03] border-white/10 shadow-black/40' 
              : 'bg-white/40 border-black/5 shadow-black/5'
          }`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {!isEditingTitle && (
                <button 
                  onClick={() => {
                    onToggleSidebar();
                    haptics.lightClick();
                  }}
                  className={`p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-violet-500'} shrink-0`}
                  title="Menu Organismo"
                >
                  <Menu size={18} />
                </button>
              )}
              
              {!isEditingTitle && activeConversationId && (
                <button 
                  onClick={() => {
                    switchConversation('');
                    haptics.lightClick();
                  }}
                  className={`p-2 bg-white/5 hover:bg-white/20 rounded-xl transition-all ${theme === 'dark' ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-violet-500'} shrink-0`}
                  title="Home Amparadora"
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                     <Home size={16} />
                  </div>
                </button>
              )}

              {!isEditingTitle && <div className="w-px h-4 bg-white/10 shrink-0 mx-1" />}
              
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isEditingTitle ? 'max-w-md' : ''}`}>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => {
                        handleSaveRename();
                        haptics.dataSave();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveRename();
                          haptics.dataSave();
                        }
                      }}
                      className={`w-full bg-[var(--surface)] border ${theme === 'dark' ? 'border-slate-500/30 focus:ring-slate-400/30' : 'border-violet-500/30 focus:ring-violet-500/30'} rounded-md px-2 py-0.5 text-xs font-bold text-[var(--text)] outline-none focus:ring-1 h-7`}
                    />
                  </div>
                ) : (
                  <h1 
                    onClick={() => {
                      handleStartRename();
                      haptics.lightClick();
                    }}
                    className={`text-[11px] md:text-sm font-black text-[var(--text)] flex items-center gap-2 tracking-[0.1em] cursor-pointer ${theme === 'dark' ? 'hover:text-white' : 'hover:text-violet-500'} transition-colors uppercase truncate opacity-80 hover:opacity-100`}
                  >
                    {activeConversationId ? (
                      <span className="flex items-center gap-2">
                        <span className={`${theme === 'dark' ? 'bg-white/10 text-slate-100' : 'bg-violet-500/10 text-violet-600'} px-2 py-0.5 rounded text-[10px]`}>
                          {getShortTitle(activeConversation?.title || '', 20)}
                        </span>
                      </span>
                    ) : null}
                  </h1>
                )}
              </div>
            </div>

            {!isEditingTitle && (
              <div className="flex items-center gap-1.5 shrink-0 ml-4">
                <button 
                  onClick={() => {
                    setIsHistoryOpen(!isHistoryOpen);
                    haptics.mediumClick();
                  }}
                  className={`p-2 rounded-xl border-2 transition-all shadow-sm ${
                    isHistoryOpen 
                      ? theme === 'dark' ? 'bg-white border-white text-black' : 'bg-violet-600 border-violet-600 text-white'
                      : theme === 'dark' 
                        ? 'bg-white/10 border-white/20 text-slate-100 hover:border-white/40 hover:text-white' 
                        : 'bg-white border-black/5 text-slate-500 hover:border-violet-500/50 hover:text-violet-500'
                  }`}
                  title="Memória de Sincronia"
                >
                  <Clock size={16} />
                </button>
              </div>
            )}
          </header>
        </div>


        {/* Chat Area / Premium Home */}
        <main 
          className="flex-1 flex flex-col min-w-0 bg-transparent relative z-10 overflow-y-auto overflow-x-hidden no-scrollbar h-full w-full"
          style={{ touchAction: 'pan-y' }}
        >
          {!activeConversationId ? (
            <div className="flex-1 flex flex-col items-center pt-20 md:pt-28">
              <div className="relative z-10 max-w-5xl mx-auto w-full px-5 py-12 md:py-20 flex flex-col items-center">
                {/* Cinema Hero Section */}
                <div className="text-center w-full mb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-violet-500/10 border-violet-500/20 text-violet-600'} text-[9px] font-black uppercase tracking-[0.3em] mb-6`}
                  >
                    <Sparkles size={10} className="animate-pulse" />
                    Interface de Consciência
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    className={`text-[39px] md:text-[clamp(1.75rem,8vw,5.5rem)] font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r ${
                      theme === 'dark' 
                        ? 'from-white via-white/80 to-white/40' 
                        : 'from-black via-zinc-600 to-black'
                    } whitespace-nowrap leading-none px-2 animate-shimmer bg-[length:200%_auto]`}
                    style={{
                      animation: 'shimmer 8s linear infinite'
                    }}
                  >
                    AMPARADORA AI
                  </motion.h1>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-sm md:text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed font-medium mb-10"
                  >
                    Consciência operacional conectada ao seu organismo.
                  </motion.p>

                  {/* Dominant CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center"
                  >
                    <button 
                      onClick={() => {
                        handleNewChat();
                        haptics.success();
                      }}
                      className={`group relative flex items-center justify-center gap-4 px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 active:scale-95 overflow-hidden ${
                        theme === 'dark' 
                          ? 'bg-[#0a0a0a] text-slate-300 border border-white/5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)]' 
                          : 'bg-violet-500 text-white border border-violet-400/50 shadow-[0_20px_50px_-15px_rgba(139,92,246,0.3)]'
                      }`}
                    >
                      {/* Depth Layer 1: Base Gradient */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-b from-zinc-800/20 to-transparent group-hover:opacity-100 opacity-50' 
                          : 'bg-gradient-to-b from-white/10 to-transparent'
                      }`} />

                      {/* Depth Layer 2: Inner Shadow/Highlight */}
                      <div className={`absolute inset-0 pointer-events-none ${
                        theme === 'dark' 
                          ? 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),inset_0_-1px_1px_rgba(0,0,0,0.8)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,1)]' 
                          : 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.1)]'
                      } transition-all duration-300`} />

                      {/* Depth Layer 3: Glass Shell */}
                      <div className="absolute inset-[1px] rounded-[15px] bg-gradient-to-tr from-white/10 via-white/0 to-white/10 opacity-50 pointer-events-none" />

                      {/* Animated Core */}
                      <div className={`absolute left-0 top-0 w-2 h-full transition-all duration-700 opacity-0 group-hover:opacity-100 ${
                        theme === 'dark' ? 'bg-slate-400 group-hover:left-full' : 'bg-white/40 group-hover:left-full'
                      } blur-md`} />

                      {/* Icon Section - Layered Icon */}
                      <div className={`relative z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-700 group-hover:scale-125 group-hover:rotate-6 ${
                        theme === 'dark' 
                          ? 'bg-white/5 border border-white/10 shadow-[inner_0_1px_0_rgba(255,255,255,0.1)]' 
                          : 'bg-white/20 border border-white/30'
                      }`}>
                        <Plus size={16} className={`transition-all duration-500 ${
                           theme === 'dark' ? 'text-slate-400 group-hover:text-white' : 'text-white'
                        }`} />
                      </div>

                      <span className={`relative z-10 font-black tracking-[0.4em] transition-all duration-500 ${
                        theme === 'dark' ? 'group-hover:text-white group-hover:tracking-[0.45em]' : 'group-hover:tracking-[0.45em]'
                      }`}>
                        Nova Conversa
                      </span>

                      {/* Exterior Glow Overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-1000 bg-gradient-to-r ${
                         theme === 'dark' ? 'from-transparent via-white to-transparent' : 'from-transparent via-violet-200 to-transparent'
                      }`} />
                    </button>
                  </motion.div>
                </div>

                {/* Quick Actions - Responsive Grid/Scroll */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full mb-12 md:mb-16"
                >
                  <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto no-scrollbar pb-4 md:pb-0 px-2 -mx-2">
                    {[
                      { label: "Resumo do dia", icon: History },
                      { label: "Resumo estratégico", icon: Sparkles },
                      { label: "Planejar semana", icon: Clock },
                      { label: "Próximas prioridades", icon: Circle },
                      { label: "Revisar objetivos", icon: Maximize2 },
                      { label: "Estado atual", icon: MessageSquare }
                    ].map((action, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          sendMessage(action.label);
                          haptics.send();
                        }}
                        className={`flex-shrink-0 flex items-center md:flex-col justify-center px-4 py-3 md:py-4 backdrop-blur-md border rounded-2xl min-w-[150px] md:min-w-0 transition-all group ${
                          theme === 'dark'
                            ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                            : 'bg-stone-50/50 border-violet-100/50 hover:border-violet-500/30 hover:bg-violet-500/5'
                        }`}
                      >
                        <action.icon size={14} className={`group-hover:scale-110 mb-0 md:mb-2 mr-3 md:mr-0 transition-all ${
                          theme === 'dark' ? 'text-slate-400 group-hover:text-white' : 'text-violet-400 group-hover:text-violet-600'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest text-left md:text-center line-clamp-1 leading-tight transition-colors ${
                          theme === 'dark' ? 'text-slate-500 group-hover:text-white' : 'text-stone-400 group-hover:text-violet-700'
                        }`}>
                          {action.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Conversations - The Protagonist */}
                <div className="w-full max-w-3xl space-y-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-50 flex items-center gap-2">
                       <Clock size={12} />
                       Conversas Recentes
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {conversations.length > 0 ? (
                      conversations.slice(0, 5).map((conv, i) => (
                        <motion.div
                          key={conv.id}
                          role="button"
                          tabIndex={0}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                          onClick={() => {
                            switchConversation(conv.id);
                            haptics.selection();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              switchConversation(conv.id);
                              haptics.selection();
                            }
                          }}
                          className={`w-full p-4 md:p-5 backdrop-blur-xl border rounded-3xl flex items-center gap-5 hover:translate-x-1 transition-all text-left group relative cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                              : 'bg-stone-50/10 border-black/15 hover:border-black/30 hover:bg-white/[0.2]'
                          } ${showMenu === conv.id ? (theme === 'dark' ? 'z-50 border-white/40 ring-1 ring-white/10 shadow-2xl shadow-black/50' : 'z-50 border-violet-500/50 ring-1 ring-violet-500/20 shadow-2xl') : 'z-10'}`}
                        >
                          <div className={`absolute inset-0 overflow-hidden rounded-3xl pointer-events-none`}>
                            <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl rounded-full -mr-10 -mt-10 ${
                              theme === 'dark' ? 'bg-white/5' : 'bg-violet-500/5'
                            }`} />
                          </div>
                          
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-all relative z-10 ${
                            theme === 'dark' 
                              ? 'bg-white/10 border-white/20 text-slate-300 group-hover:bg-white group-hover:text-black shadow-lg shadow-white/0 group-hover:shadow-white/20' 
                              : 'bg-violet-500/10 border-violet-500/20 text-violet-500 group-hover:bg-violet-600 group-hover:text-white shadow-lg shadow-violet-500/0 group-hover:shadow-violet-500/20'
                          }`}>
                            <MessageSquare size={18} />
                          </div>
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <h4 className="text-xs md:text-sm font-black text-[var(--text)] truncate tracking-tight">
                                {conv.title}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] opacity-50 shrink-0">
                                  {new Date(conv.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="relative">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowMenu(showMenu === conv.id ? false : conv.id);
                                    }}
                                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all"
                                  >
                                    <MoreVertical size={14} className="text-[var(--muted)]" />
                                  </button>
                                  
                                  <AnimatePresence>
                                    {showMenu === conv.id && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-40" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                          }} 
                                        />
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                          className={`absolute right-0 top-full mt-2 w-48 rounded-2xl shadow-2xl border backdrop-blur-2xl z-50 overflow-hidden ${
                                            theme === 'dark'
                                              ? 'bg-zinc-900/95 border-white/10 shadow-black'
                                              : 'bg-white/95 border-black/5 shadow-black/10'
                                          }`}
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div className="p-2 space-y-1">
                                            <button
                                              onClick={() => {
                                                switchConversation(conv.id);
                                                setEditingTitle(conv.title);
                                                setIsEditingTitle(true);
                                                setShowMenu(false);
                                              }}
                                              className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all"
                                            >
                                              <Pencil size={14} className="text-blue-500" />
                                              Renomear
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (activeConversationId === conv.id) {
                                                  switchConversation('');
                                                }
                                                removeConversation(conv.id);
                                                setShowMenu(false);
                                                haptics.actionCritical();
                                              }}
                                              className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
                                            >
                                              <Trash size={14} />
                                              Excluir
                                            </button>
                                          </div>
                                        </motion.div>
                                      </>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </div>
                            <p className="text-[10px] md:text-xs text-[var(--muted)] truncate opacity-60 font-medium">
                              {/* Simulate last message or placeholder */}
                              Continuar sincronia operacional do organismo...
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="py-12 border-2 border-dashed border-[var(--border)] rounded-3xl flex flex-col items-center justify-center text-[var(--muted)] opacity-30">
                        <MessageSquare size={32} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">
                          Nenhuma sintonização ativa.<br/>Inicie uma conversa acima.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full bg-transparent pt-16 md:pt-20">
              <MessageList 
                messages={messages} 
                streamingMessage={streamingMessage}
                isLoading={isLoading}
                theme={theme}
              />
              
              {/* SUGGESTIONS CHIPS */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                  {messages[messages.length - 1].metadata?.suggestions?.map((suggestion: string, i: number) => (
                    <motion.button
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      onClick={() => {
                        sendMessage(suggestion);
                        haptics.send();
                      }}
                      className={`shrink-0 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-slate-400'
                          : 'bg-violet-500/5 border-violet-500/10 hover:bg-violet-500/10 hover:text-violet-600 text-violet-500'
                      }`}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              )}

              <ChatInput 
                onSend={(content) => {
                  sendMessage(content, selectedFile);
                  setSelectedFile(null);
                }} 
                isLoading={isLoading} 
                theme={theme} 
                onFileSelect={setSelectedFile}
              />
            </div>
          )}
        </main>
      </div>

      {/* Persistence Sidebar (History) - Re-anchored to Right if needed by useAmparadora id selection */}
      <ChatSidebar 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => {
          switchConversation(id);
          setIsHistoryOpen(false);
        }}
        onDelete={removeConversation}
        onNewChat={handleNewChat}
        theme={theme}
      />
    </div>
  );
}

