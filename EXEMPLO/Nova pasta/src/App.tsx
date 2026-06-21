/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ObjectiveManager from './components/ObjectiveManager';
import ManifestationView from './components/ManifestationView';
import MetaBuilderModal, { MetaData } from './components/MetaBuilderModal';
import TaskBuilderModal, { TaskData } from './components/TaskBuilderModal';
import TaskExecutionModal from './components/TaskExecutionModal';
import MultimodalExecutionModal from './components/MultimodalExecutionModal';
import GoalsOverview from './components/GoalsOverview';
import { 
  Plus, Zap, Play, Clock, TrendingUp, 
  CheckCircle2, Layout, Calendar, Brain,
  Activity, Target as TargetIcon, BarChart3,
  Pause as PauseIcon, Square
} from 'lucide-react';
import { getPerformanceStats, generateMockHistory } from './services/intelligenceService';
import { storage } from './lib/storage';

const carouselImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsbslWFAw-IqJ8-3x_UHC7zCnG1wGASjs701H4eh5SJXLZ4TKjVlvxwPp5cSWgGVaxVVG5RwLCj4XV4gHlTlAjSjUPBuwWzNrs0vVS0jsRi5LcpGa9i8sUyKHaq7BIdKbPplxSdOq5z_AhBh61IvlrZd_s9qhA-0fdXfruYJy2WqgiBLfnUUaSyqGA5jmEVB-6twSX48uuQspREvhBPD0ACiIB5-lh7tafA37Zd741C-aT6iTqLWZ-G2UOnNWHCDPDOjP1VyEXbyGA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYMw4Uei2Ggsk8L3lOMXqRbEbwAW99UKLk0GljfvMRVV05NG910bG1w2sr77Eakc0U-GIIUe3D-Int36lOpO-bRkUmvhu86If2R1zBdBnU8M72g5IGBcnWK4kb-k_Fy7ssoyLyv27YLuk8QlUgDNvs2yOcoOe798zCxZ9E6pqolzwvup1WJgWydIK39ErhaEFcfrIGZj86WPX0fTfQJaBX30S8skn_h8pUKzywOnGJ_2UO5q21kWxg277c8eq_GCQ0yU8RXB1C0cUO",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCiPeixsIKlUAYbnG0VszYdnrZ-vmFEjzzgqFdizzb3KUHvW5sMBfHlgYNsN3e_nKTGWBI5597mc6hOOUiTtTUraWf8pKn6RPv_nn4iOWlQM8kN_-7MYG7Hakcv-OLSLi75PzzrbUhdtzkXPTjIfELWXTyK7ahmleQUppE2rFQq7bXV9QPTDsrISzW1kz9ogxcU0ns-Knglx8YBhStTSYUxuKf3Rss55uOskDbjOuxIbg10MeXAFIP2di9rylj9lnTvnCoICZH4N5la",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZE4F1T8nHh4_aUi2ZOxE8yUTh36iSTaJhq1ABe8_5nyCBDahV1mZcDQnRJUtq5i1WY3QpedNAux84G3UUlscD-oJ3-HOug5tywhIyNb55nCB_MgV-31pQ_fTlTokXBLNfowwfXRBvlZONZiTaEXlR0ZxlrD1bCfCPytqCAUuilSUVTH7wKCXKqriuyCpj5Pk2qJ2H4cMSMnm4MaerrfzogjpD4QSLHFOC56FKSbBpLKjteaye-GFVovWpGvslkRAySpc9Md3KgpU5"
];

export default function App() {
  const [view, setView] = useState<'dashboard' | 'manager' | 'manifestation' | 'goals-overview'>('dashboard');
  const [activeObjective, setActiveObjective] = useState<any>({
    title: "Minha Visão Extraordinária",
    burningDesire: "Eu desejo manifestar uma vida de abundância, propósito e impacto global através da tecnologia e do design.",
    sacrifice: "Eu renuncio à procrastinação e ao conforto imediato em troca de disciplina e visão de longo prazo.",
    feelings: "Eu sinto uma paz profunda, uma energia vibrante e a certeza absoluta de que já alcancei meus objetivos.",
    plan: "1. Dedicar 2 horas diárias ao aprendizado profundo.\n2. Construir protótipos semanais.\n3. Conectar-me com mentores e líderes da indústria.",
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    media: [
      { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80', name: 'Visão de Futuro' },
      { id: 'm2', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', name: 'Inspiração' }
    ],
    kpis: [
      { 
        id: 'k1', 
        name: 'Foco Diário', 
        formaMedicao: 'horas', 
        pontoAtual: 0, 
        objetivoDesejado: 4, 
        frequencia: 'diário', 
        ritmoEsperado: 'Constante',
        evolucaoEsperada: 'Aumento gradual de profundidade',
        tipoMetrica: 'foco',
        visualization: 'gauge' 
      }
    ],
    risks: [],
    metas: [
      {
        id: 'meta-1',
        intention: 'Dominar Design System e UI Avançada',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(),
        status: 'in-progress',
        progress: 35,
        color: '#c8bfff'
      },
      {
        id: 'meta-2',
        intention: 'Lançar MVP do Produto Principal',
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        status: 'not-started',
        progress: 0,
        color: '#B3E5FC'
      }
    ]
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpeningVision, setIsOpeningVision] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return storage.get('app-theme', 'dark') as 'dark' | 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    storage.set('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const [selectedTaskForExecution, setSelectedTaskForExecution] = useState<TaskData | null>(null);
  const [selectedMetaId, setSelectedMetaId] = useState<string | undefined>(undefined);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [activeWorkspaceFolder, setActiveWorkspaceFolder] = useState<string | null>(null);

  const workspaceFolders = [
    {
      id: 'research',
      title: 'Pesquisa',
      tag: 'Pesquisa v4.2',
      icon: 'analytics',
      itemsCount: 12,
      lastActivity: 'Hoje, 10:45 AM',
      colorVar: 'var(--folder-bg-research)',
      accentVar: 'var(--folder-accent-research)',
      items: [
        { id: 'r1', title: 'Relatório de Psicologia do Consumidor', icon: 'description' },
        { id: 'r2', title: 'Auditoria de Concorrentes v2', icon: 'sticky_note_2' },
        { id: 'r3', title: 'Notas de Entrevista com Stakeholders', icon: 'mic' },
        { id: 'r4', title: 'Análise de Mercado Global', icon: 'public' },
        { id: 'r5', title: 'Feedback de Usuários Beta', icon: 'forum' },
      ]
    },
    {
      id: 'strategy',
      title: 'Estratégia',
      tag: 'Estratégia_Final',
      icon: 'strategy',
      itemsCount: 8,
      lastActivity: 'Ontem',
      colorVar: 'var(--folder-bg-strategy)',
      accentVar: 'var(--folder-accent-strategy)',
      items: [
        { id: 's1', title: 'Roadmap de Produto 2026', icon: 'map' },
        { id: 's2', title: 'Plano Go-to-Market', icon: 'rocket_launch' },
        { id: 's3', title: 'Projeções de Crescimento', icon: 'monitoring' },
        { id: 's4', title: 'Definição de OKRs Q3', icon: 'target' },
        { id: 's5', title: 'Análise SWOT 2026', icon: 'grid_view' },
      ]
    },
    {
      id: 'workflows',
      title: 'Workflows',
      tag: 'Automação_Ativa',
      icon: 'account_tree',
      itemsCount: 5,
      lastActivity: 'Há 2 horas',
      colorVar: 'var(--folder-bg-workflows)',
      accentVar: 'var(--folder-accent-workflows)',
      items: [
        { id: 'w1', title: 'Funil de Vendas Automatizado', icon: 'filter_alt' },
        { id: 'w2', title: 'Onboarding de Clientes', icon: 'person_add' },
        { id: 'w3', title: 'Pipeline de Conteúdo AI', icon: 'auto_awesome' },
        { id: 'w4', title: 'Gestão de Crise v1', icon: 'warning' },
      ]
    },
    {
      id: 'pages',
      title: 'Páginas',
      tag: 'Wiki_Central',
      icon: 'auto_stories',
      itemsCount: 15,
      lastActivity: 'Há 15 min',
      colorVar: 'var(--folder-bg-pages)',
      accentVar: 'var(--folder-accent-pages)',
      items: [
        { id: 'p1', title: 'Manual da Marca', icon: 'menu_book' },
        { id: 'p2', title: 'Diretrizes de Design', icon: 'palette' },
        { id: 'p3', title: 'Documentação Técnica', icon: 'code' },
        { id: 'p4', title: 'Visão Geral do Projeto', icon: 'visibility' },
        { id: 'p5', title: 'Notas de Reunião', icon: 'event_note' },
      ]
    }
  ];
  const [activeInlineTaskId, setActiveInlineTaskId] = useState<string | null>(null);
  const [inlineElapsedSeconds, setInlineElapsedSeconds] = useState(0);
  const [isInlinePaused, setIsInlinePaused] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeInlineTaskId && !isInlinePaused) {
      interval = setInterval(() => {
        setInlineElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeInlineTaskId, isInlinePaused]);

  useEffect(() => {
    const savedTasks = storage.get<TaskData[]>(`tasks_${activeObjective.title}`, []);
    
    if (savedTasks.length > 2) {
      setTasks(savedTasks);
    } else if (activeObjective.metas && activeObjective.metas.length > 0) {
      // Initialize mock history for demo
      const mockHistory = generateMockHistory(activeObjective.title, activeObjective.metas[0].id);
      setTasks(mockHistory);
      storage.set(`tasks_${activeObjective.title}`, mockHistory);
    }
  }, [activeObjective.title, activeObjective.metas]);

  const stats = getPerformanceStats(tasks);

  const handleSaveMeta = (newMeta: MetaData) => {
    const metas = storage.get<MetaData[]>(`metas_${activeObjective.title}`, []);
    const updatedMetas = [...metas, newMeta];
    storage.set(`metas_${activeObjective.title}`, updatedMetas);
    setActiveObjective({ ...activeObjective, metas: updatedMetas });
  };

  const handleSaveTask = (newTask: TaskData) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);
  };

  const handleUpdateTask = (updatedTask: TaskData) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);
    if (selectedTaskForExecution?.id === updatedTask.id) {
      setSelectedTaskForExecution(updatedTask);
    }
    
    // Sync with inline timer if this is the active task
    if (activeInlineTaskId === updatedTask.id) {
      setInlineElapsedSeconds(updatedTask.actualDuration || 0);
      setIsInlinePaused(updatedTask.status !== 'in-progress');
      if (updatedTask.status === 'completed') {
        setActiveInlineTaskId(null);
        setInlineElapsedSeconds(0);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);
  };

  const openExecution = (task: TaskData) => {
    setSelectedTaskForExecution(task);
    setIsExecutionModalOpen(true);
  };

  const handleStartInline = (e: React.MouseEvent, task: TaskData) => {
    e.stopPropagation();
    if (activeInlineTaskId === task.id) {
      setIsInlinePaused(false);
    } else {
      setActiveInlineTaskId(task.id);
      setInlineElapsedSeconds(task.actualDuration || 0);
      setIsInlinePaused(false);
    }
  };

  const handlePauseInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInlinePaused(true);
  };

  const handleFinishInline = (e: React.MouseEvent, task: TaskData) => {
    e.stopPropagation();
    const updatedTask = {
      ...task,
      status: 'completed' as const,
      actualDuration: inlineElapsedSeconds,
      completedAt: new Date().toISOString()
    };
    handleUpdateTask(updatedTask);
    setActiveInlineTaskId(null);
    setInlineElapsedSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Load metas and tasks for the active objective on mount
    const savedMetas = storage.get<MetaData[]>(`metas_${activeObjective.title}`, []);
    if (savedMetas.length > 0) {
      setActiveObjective(prev => ({ ...prev, metas: savedMetas }));
    } else if (activeObjective.metas) {
      storage.set(`metas_${activeObjective.title}`, activeObjective.metas);
    }
  }, [activeObjective.title]);

  useEffect(() => {
    if (view === 'dashboard') {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleOpenVision = () => {
    setIsOpeningVision(true);
    setTimeout(() => {
      setView('manifestation');
      setIsOpeningVision(false);
    }, 800);
  };

  if (view === 'manager') {
    return (
      <ObjectiveManager 
        onBack={() => setView('dashboard')} 
        onSave={(data) => {
          setActiveObjective(data);
          setView('manifestation');
        }} 
      />
    );
  }

  if (view === 'manifestation' && activeObjective) {
    return (
      <ManifestationView 
        data={activeObjective} 
        onBack={() => setView('dashboard')} 
        onViewGoals={() => setView('goals-overview')}
      />
    );
  }

  if (view === 'goals-overview') {
    return (
      <GoalsOverview 
        objectiveTitle={activeObjective.title}
        onBack={() => setView('dashboard')}
        onAddTask={(metaId) => {
          setSelectedMetaId(metaId);
          setIsTaskModalOpen(true);
        }}
        onExecuteTask={openExecution}
      />
    );
  }

  return (
    <div className="bg-neutral-black selection:bg-pastel-indigo/30 min-h-screen text-neutral-white font-body">
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-3 bg-transparent backdrop-blur-md border-b border-neutral-white/5">
        <button 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2 px-4 py-1.5 bg-neutral-white/5 border border-neutral-white/10 rounded-full backdrop-blur-xl hover:bg-neutral-white/10 transition-all group"
        >
          <span className="material-symbols-outlined text-lg text-neutral-white/60 group-hover:text-neutral-white transition-colors">arrow_back</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-white/60 group-hover:text-neutral-white transition-colors">Voltar</span>
        </button>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <div className="absolute -bottom-10 right-0 bg-neutral-black/80 backdrop-blur-md border border-neutral-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Trocar Tema</p>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('goals-overview')}
            className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">grid_view</span>
            <div className="absolute -bottom-10 right-0 bg-neutral-black/80 backdrop-blur-md border border-neutral-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Visão de Metas</p>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenVision}
            className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
            <div className="absolute -bottom-10 right-0 bg-neutral-black/80 backdrop-blur-md border border-neutral-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Ver Visão</p>
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Refined Header Carousel */}
      <section className="relative h-[380px] md:h-[420px] w-full overflow-hidden flex items-end justify-center pb-8 md:pb-12">
        <div className="absolute inset-0 z-0">
          {carouselImages.map((img, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img alt="Carrossel" className="w-full h-full object-cover" src={img} referrerPolicy="no-referrer" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 z-10 hero-overlay"></div>
        <div className="hero-blur-transition"></div>
        
        <div className="relative z-20 w-full max-w-4xl px-6 md:px-8 flex flex-col items-center">
          <p className="text-pastel-indigo font-medium tracking-[0.4em] uppercase text-[8px] md:text-[10px] mb-3 md:mb-4 opacity-80 text-center">Fase Atual: Alta Execução</p>
          <h1 className="font-[Arial] text-3xl md:text-5xl text-neutral-white mb-6 md:mb-8 tracking-tight text-center leading-tight">Protocolo de Performance Máxima</h1>
          <div className="flex flex-col items-center gap-5 md:gap-6 w-full">
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="w-[85%] sm:w-auto px-8 md:px-14 py-4 md:py-5 bg-neutral-white text-neutral-black rounded-[2.5rem] md:rounded-[3.5rem] font-headline font-bold text-lg md:text-xl shadow-[0_25px_60px_-10px_rgba(245,245,247,0.3)] hover:shadow-[0_30px_70px_-5px_rgba(245,245,247,0.4)] transform hover:-translate-y-1.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-neutral-white/20"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 700" }}>add_circle</span>
              Nova Tarefa
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('manager')}
                className="px-6 py-2.5 bg-neutral-white/5 hover:bg-neutral-white/10 border border-neutral-white/10 rounded-full text-neutral-white/50 hover:text-neutral-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">architecture</span>
                Objetivo
              </button>
              <button 
                onClick={() => setIsMetaModalOpen(true)}
                className="px-6 py-2.5 bg-pastel-indigo/20 hover:bg-pastel-indigo/30 border border-pastel-indigo/30 rounded-full text-pastel-indigo text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(197,202,233,0.1)]"
              >
                <Plus size={14} />
                Meta
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative min-h-screen pt-4 pb-32">
        {/* 1. Stats & Focus */}
        <section className="max-w-5xl mx-auto px-6 md:px-8 mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 pt-4">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-neutral-white/40 font-bold mb-2">Conclusão da Visão</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-headline font-bold text-neutral-white">65%</span>
                <div className="w-12 h-1 bg-neutral-white/10 rounded-full overflow-hidden">
                  <div className="bg-pastel-indigo h-full" style={{ width: '65%' }}></div>
                </div>
              </div>
            </div>
            <div className="max-w-xs text-center md:text-left">
              <p className="text-neutral-white/40 italic text-xs leading-relaxed">
                "A alma torna-se tingida com a cor dos seus pensamentos. Foque na execução da sua intenção mais elevada."
              </p>
            </div>
          </div>
        </section>

        {/* 2. Execution Engine: Real-Time Action */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 space-y-16 md:space-y-24">
          
          {/* Foco do Agora Section */}
          <div className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-pastel-indigo animate-pulse md:w-[24px] md:h-[24px]" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-white/40">Foco do Agora</h2>
              </div>
              <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                {tasks.filter(t => t.status !== 'completed').length} Pendentes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {tasks.filter(t => t.status !== 'completed').slice(0, 2).map((task) => (
                <motion.div 
                  key={task.id}
                  whileHover={{ y: -5 }}
                  onClick={() => openExecution(task)}
                  className={`group relative bg-neutral-white/5 border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-500 soft-shadow ${
                    activeInlineTaskId === task.id ? 'active-glow ring-1 ring-pastel-indigo/20' : 'border-neutral-white/10 hover:border-neutral-white/20'
                  }`}
                >
                  {/* Visual Anchor background */}
                  {task.imageUrl && (
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                      <img 
                        src={task.imageUrl} 
                        className="w-full h-full object-cover opacity-[0.08] group-hover:opacity-20 group-hover:scale-110 transition-all duration-[10s]" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-black via-transparent to-neutral-black/90" />
                    </div>
                  )}
                  
                  <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] -z-10 transition-all duration-700 ${
                    activeInlineTaskId === task.id ? 'bg-pastel-indigo/30' : 'bg-pastel-indigo/10 group-hover:bg-pastel-indigo/20'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-6 md:mb-12">
                    <div className="space-y-2 md:space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[8px] md:text-[9px] font-bold rounded uppercase tracking-wider transition-colors ${
                          activeInlineTaskId === task.id ? 'bg-pastel-indigo text-neutral-black' : 'bg-pastel-indigo/20 text-pastel-indigo'
                        }`}>
                          {activeInlineTaskId === task.id ? 'Em Execução' : 'Próxima Ação'}
                        </span>
                        <span className="text-[8px] md:text-[9px] text-neutral-white/30 uppercase tracking-widest font-bold">
                          {activeObjective.metas?.find(m => m.id === task.metaId)?.intention || 'Estratégia'}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-4xl font-headline font-bold text-neutral-white tracking-tight leading-tight max-w-md">{task.title}</h3>
                      
                      {activeInlineTaskId === task.id && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 pt-2"
                        >
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-4xl font-headline font-black text-pastel-indigo tabular-nums">
                              {formatTime(inlineElapsedSeconds)}
                            </span>
                            <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Cronômetro</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {activeInlineTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => isInlinePaused ? handleStartInline(e, task) : handlePauseInline(e)}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-neutral-white text-neutral-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                          >
                            {isInlinePaused ? <Play size={20} fill="currentColor" /> : <PauseIcon size={20} fill="currentColor" />}
                          </button>
                          <button 
                            onClick={(e) => handleFinishInline(e, task)}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-pastel-green text-neutral-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleStartInline(e, task)}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-pastel-indigo text-neutral-black flex items-center justify-center shadow-2xl shadow-pastel-indigo/20 group-hover:scale-110 transition-transform"
                        >
                          <Play size={24} fill="currentColor" className="md:w-[32px] md:h-[32px]" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-white/20 md:w-[18px] md:h-[18px]" />
                      <span className="text-[10px] md:text-xs font-bold text-neutral-white/40 uppercase tracking-widest">{task.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-neutral-white/20 md:w-[18px] md:h-[18px]" />
                      <span className="text-[10px] md:text-xs font-bold text-neutral-white/40 uppercase tracking-widest">{task.priority}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <div className="col-span-full py-20 bg-neutral-white/5 border border-dashed border-neutral-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-pastel-green/10 flex items-center justify-center text-pastel-green/40">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-white/60 font-bold uppercase tracking-widest">Fluxo de execução limpo</p>
                    <p className="text-[10px] text-neutral-white/20 uppercase tracking-widest">Defina novas tarefas para continuar manifestando.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Layout size={18} className="text-pastel-indigo md:w-[24px] md:h-[24px]" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-white/40">Linha do Tempo</h2>
              </div>
              <div className="flex items-center gap-6">
                <button className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest hover:text-neutral-white transition-colors">Hoje</button>
                <button className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest hover:text-neutral-white transition-colors">Semana</button>
              </div>
            </div>

            <div className="relative space-y-6 md:space-y-10">
              <div className="absolute left-[23px] md:left-[35px] top-6 bottom-6 w-px bg-gradient-to-b from-pastel-indigo/50 via-neutral-white/5 to-transparent" />
              
              {tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((task, idx) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => openExecution(task)}
                  className={`group relative flex items-center gap-6 md:gap-12 cursor-pointer transition-all duration-500 ${
                    activeInlineTaskId === task.id ? 'scale-[1.02]' : ''
                  }`}
                >
                  <div className={`relative z-10 w-12 h-12 md:w-18 md:h-18 rounded-2xl md:rounded-3xl border flex items-center justify-center transition-all overflow-hidden ${
                    task.status === 'completed' 
                      ? 'bg-pastel-green/20 border-pastel-green/30 text-pastel-green shadow-[0_0_20px_rgba(165,214,167,0.1)]' 
                      : activeInlineTaskId === task.id
                        ? 'bg-pastel-indigo border-pastel-indigo text-neutral-black shadow-[0_0_30px_rgba(197,202,233,0.3)]'
                        : 'bg-neutral-black border-neutral-white/10 text-neutral-white/20 group-hover:border-pastel-indigo/50 group-hover:text-pastel-indigo'
                  }`}>
                    {task.imageUrl ? (
                      <img src={task.imageUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      task.status === 'completed' ? <CheckCircle2 size={20} className="md:w-[28px] md:h-[28px]" /> : <Clock size={20} className="md:w-[28px] md:h-[28px]" />
                    )}
                  </div>
                  <div className={`flex-1 bg-neutral-white/5 border rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 transition-all backdrop-blur-sm soft-shadow ${
                    activeInlineTaskId === task.id ? 'active-glow border-pastel-indigo/30 bg-pastel-indigo/[0.03]' : 'border-neutral-white/5 hover:border-neutral-white/10'
                  }`}>
                    <div className="flex justify-between items-start mb-3 md:mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-sm md:text-2xl font-headline font-bold tracking-tight ${task.status === 'completed' ? 'text-neutral-white/20 line-through' : 'text-neutral-white/80'}`}>
                            {task.title}
                          </h4>
                          {activeInlineTaskId === task.id && (
                            <span className="px-2 py-0.5 bg-pastel-indigo text-neutral-black text-[7px] md:text-[9px] font-black rounded uppercase tracking-tighter animate-pulse">Ativo</span>
                          )}
                        </div>
                        <p className="text-[9px] md:text-xs text-neutral-white/30 font-medium italic">
                          {activeObjective.metas?.find(m => m.id === task.metaId)?.intention || 'Estratégia'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[9px] md:text-[11px] font-bold text-neutral-white/20 uppercase tracking-widest">{task.time || 'Sem hora'}</span>
                        {task.status !== 'completed' && (
                          <div className="flex items-center gap-2">
                            {activeInlineTaskId === task.id ? (
                              <>
                                <button 
                                  onClick={(e) => isInlinePaused ? handleStartInline(e, task) : handlePauseInline(e)}
                                  className="w-8 h-8 rounded-xl bg-neutral-white text-neutral-black flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  {isInlinePaused ? <Play size={14} fill="currentColor" /> : <PauseIcon size={14} fill="currentColor" />}
                                </button>
                                <button 
                                  onClick={(e) => handleFinishInline(e, task)}
                                  className="w-8 h-8 rounded-xl bg-pastel-green text-neutral-black flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={(e) => handleStartInline(e, task)}
                                className="w-8 h-8 rounded-xl bg-pastel-indigo/20 text-pastel-indigo flex items-center justify-center hover:bg-pastel-indigo hover:text-neutral-black transition-all"
                              >
                                <Play size={14} fill="currentColor" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {activeInlineTaskId === task.id && (
                      <div className="mb-6 p-4 bg-neutral-black/40 rounded-2xl border border-neutral-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-pastel-indigo animate-ping" />
                          <span className="text-xl md:text-3xl font-headline font-black text-pastel-indigo tabular-nums">
                            {formatTime(inlineElapsedSeconds)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Tempo Decorrido</p>
                          <p className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Estimado: {task.estimatedDuration}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 md:gap-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                        task.priority === 'critical' ? 'bg-pastel-pink/20 text-pastel-pink' : 'bg-neutral-white/10 text-neutral-white/40'
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-neutral-white/20" />
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                          {new Date(task.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <div className="pl-20 py-12">
                  <p className="text-xs text-neutral-white/20 uppercase tracking-widest font-bold italic">Nenhuma tarefa agendada na linha do tempo.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Performance Dashboard */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Intelligence Block */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-neutral-white/5 bg-neutral-white/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-indigo/5 blur-3xl -z-10 group-hover:bg-pastel-indigo/10 transition-all" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-pastel-indigo/10 flex items-center justify-center text-pastel-indigo">
                <Brain size={20} />
              </div>
              <h4 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.3em]">Camada de Inteligência</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-white/40 font-medium">Precisão de Estimativa</span>
                <span className="text-lg font-headline font-bold text-pastel-indigo">{stats.estimationAccuracy}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.estimationAccuracy}%` }}
                  className="h-full bg-pastel-indigo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Tempo Médio</p>
                  <p className="text-xl font-headline font-bold text-neutral-white">{stats.avgTimePerTask}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Consistência</p>
                  <p className="text-xl font-headline font-bold text-pastel-green">{stats.consistencyScore}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-neutral-white/5 bg-neutral-white/[0.02] md:col-span-2">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-pastel-indigo" />
                <h4 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.3em]">Velocidade de Entrega</h4>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pastel-indigo" /> Concluídas</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neutral-white/10" /> Pendentes</span>
              </div>
            </div>
            
            <div className="h-32 flex items-end justify-between px-4">
              {[40, 65, 30, 85, 50, 60, 75].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group/bar">
                  <div className="w-10 md:w-14 bg-neutral-white/5 rounded-t-2xl h-full relative overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className={`absolute bottom-0 left-0 right-0 transition-all ${i === 3 ? 'bg-pastel-indigo shadow-[0_0_20px_rgba(197,202,233,0.3)]' : 'bg-neutral-white/10 group-hover/bar:bg-neutral-white/20'}`}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Enhanced Objective Workspace (Wallet Style) */}
        <section className="relative w-full mt-20 md:mt-32 mb-24 overflow-hidden">
          {/* Background Carousel for Workspace */}
          <div className="absolute inset-0 z-0 opacity-[0.5] pointer-events-none">
            {carouselImages.map((img, idx) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === activeIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <img alt="Background" className="w-full h-full object-cover" src={img} referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="absolute inset-0 workspace-bg-overlay"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
            <div className="mb-10 md:mb-16 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-neutral-white tracking-tight">Espaço de Trabalho</h2>
                <p className="text-xs md:text-sm text-neutral-white/60 opacity-60 mt-2 font-medium">Repositório tátil para todos os recursos críticos da missão.</p>
              </div>
              
              <AnimatePresence mode="wait">
                {activeWorkspaceFolder && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setActiveWorkspaceFolder(null)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-indigo/10 border border-pastel-indigo/20 text-pastel-indigo hover:bg-pastel-indigo/20 transition-all group"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Voltar ao Grid</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className={`grid gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16 transition-all duration-500 ${activeWorkspaceFolder ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              <AnimatePresence mode="popLayout">
                {workspaceFolders
                  .filter(folder => !activeWorkspaceFolder || folder.id === activeWorkspaceFolder)
                  .map((folder) => (
                    <motion.div 
                      layout
                      key={folder.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => !activeWorkspaceFolder && setActiveWorkspaceFolder(folder.id)}
                      style={{ 
                        '--folder-bg': folder.colorVar,
                        '--folder-accent': folder.accentVar,
                        background: activeWorkspaceFolder === folder.id ? `color-mix(in srgb, ${folder.colorVar}, transparent 15%)` : 'var(--folder-bg)',
                        backdropFilter: activeWorkspaceFolder === folder.id ? 'blur(24px)' : 'none'
                      } as React.CSSProperties}
                      className={`wallet-folder group ${!activeWorkspaceFolder ? 'cursor-pointer hover:scale-[1.02]' : activeWorkspaceFolder === folder.id ? 'expanded cursor-default' : 'opacity-0 pointer-events-none'} transition-all duration-500 ${activeWorkspaceFolder === folder.id ? 'max-w-4xl mx-auto w-full' : ''}`}
                    >
                      <div className="wallet-card-back"></div>
                      <div className="wallet-card-mid flex items-start justify-between p-4">
                        <span className="text-[8px] font-bold text-black/60 uppercase tracking-widest">{folder.tag}</span>
                        <span className="material-symbols-outlined text-black/30 text-xs">{folder.icon}</span>
                      </div>
                      
                      <div className="pt-6 px-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-headline font-extrabold text-neutral-white">{folder.title}</h3>
                          <span className="text-[10px] font-bold text-pastel-indigo bg-pastel-indigo/10 px-2 py-0.5 rounded">{folder.itemsCount} Itens</span>
                        </div>
                        <p className="text-[10px] text-neutral-white/40 uppercase tracking-[0.1em] font-bold">Última atividade: {folder.lastActivity}</p>
                      </div>

                      <div className={`wallet-front-pocket transition-all duration-500 ${activeWorkspaceFolder === folder.id ? 'min-h-[300px]' : ''}`}>
                        <ul className={`grid gap-4 ${activeWorkspaceFolder === folder.id ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                          {folder.items.slice(0, activeWorkspaceFolder === folder.id ? undefined : 3).map((item) => (
                            <motion.li 
                              layout
                              key={item.id} 
                              className="flex items-center gap-3 group/page p-2 rounded-xl hover:bg-neutral-white/[0.03] transition-all cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-pastel-indigo/10 flex items-center justify-center text-pastel-indigo">
                                <span className="material-symbols-outlined text-base">{item.icon}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-neutral-white/80 group-hover/page:text-pastel-indigo transition-colors">{item.title}</p>
                                <div className="w-full h-px bg-neutral-white/5 mt-1"></div>
                              </div>
                            </motion.li>
                          ))}
                          
                          {!activeWorkspaceFolder && folder.itemsCount > 3 && (
                            <li className="flex items-center justify-center pt-2">
                              <span className="text-[9px] font-bold text-pastel-indigo uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Ver mais {folder.itemsCount - 3} itens...</span>
                            </li>
                          )}
                        </ul>

                        {activeWorkspaceFolder === folder.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-6 border-t border-neutral-white/5 flex justify-center"
                          >
                            <button className="px-6 py-2 rounded-full bg-neutral-white/5 border border-neutral-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-white/40 hover:text-pastel-indigo hover:border-pastel-indigo/30 transition-all">
                              Adicionar Novo Item ao {folder.title}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Portal Transition Overlay */}
      <AnimatePresence>
        {isOpeningVision && (
          <motion.div
            initial={{ scale: 0, opacity: 0, borderRadius: "100%" }}
            animate={{ scale: 50, opacity: 1, borderRadius: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className="fixed bottom-10 right-10 w-20 h-20 bg-neutral-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <MetaBuilderModal 
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={handleSaveMeta}
        objectiveTitle={activeObjective.title}
        objectiveProgress={45} // Placeholder as in ManifestationView
        objectiveDeadline={activeObjective.deadline}
      />

      <TaskBuilderModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedMetaId(undefined);
        }}
        onSave={handleSaveTask}
        objectiveTitle={activeObjective.title}
        metas={activeObjective.metas || []}
        initialMetaId={selectedMetaId}
      />

      {selectedTaskForExecution && (
        selectedTaskForExecution.executionType && selectedTaskForExecution.executionType !== 'standard' ? (
          <MultimodalExecutionModal 
            isOpen={isExecutionModalOpen}
            onClose={() => {
              setIsExecutionModalOpen(false);
              setSelectedTaskForExecution(null);
            }}
            task={selectedTaskForExecution}
            onUpdate={handleUpdateTask}
            objectiveTitle={activeObjective.title}
            metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
            initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
            initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
          />
        ) : (
          <TaskExecutionModal 
            isOpen={isExecutionModalOpen}
            onClose={() => {
              setIsExecutionModalOpen(false);
              setSelectedTaskForExecution(null);
            }}
            task={selectedTaskForExecution}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            objectiveTitle={activeObjective.title}
            metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
            initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
            initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
          />
        )
      )}
    </div>
  );
}
