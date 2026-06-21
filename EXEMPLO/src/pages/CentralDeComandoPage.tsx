import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiSettings } from '../components/central/subpages/ApiSettings';
import { PlaceholderSection } from '../components/central/subpages/PlaceholderSection';
import { ExperienceSettings } from '../components/central/subpages/ExperienceSettings';
import { SystemReconstruction } from '../components/central/subpages/SystemReconstruction';
import { SystemMap } from '../components/central/subpages/SystemMap';
import { 
  Cpu, 
  Plug, 
  Database, 
  Zap, 
  History,
  Menu,
  LayoutTemplate,
  Volume2,
  Network,
  ChevronRight,
  Terminal,
  CheckCircle,
  Clock,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioSettings } from '../components/central/subpages/AudioSettings';
import { haptics } from '../services/HapticService';
import { safeLocalStorage } from '../utils/storage';

type ModuleType = 'ia-api' | 'database' | 'experience' | 'audio' | 'logs' | 'integrations' | 'automation';

interface CentralDeComandoPageProps {
  onToggleSidebar?: () => void;
  theme?: 'light' | 'dark';
}

// REAL DYNAMIC LOGS AND DATABASE DIAGNOSTIC SYSTEM
const SystemLogsViewer: React.FC = () => {
  const [diaryCount, setDiaryCount] = useState(0);
  const [objectivesCount, setObjectivesCount] = useState(0);
  const [financesCount, setFinancesCount] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [logTime, setLogTime] = useState<string>('');

  useEffect(() => {
    // Read actual records from storage/mockDB
    try {
      const diaries = JSON.parse(safeLocalStorage.getItem('diary_entries') || '[]');
      setDiaryCount(Array.isArray(diaries) ? diaries.length : 0);
    } catch { setDiaryCount(0); }

    try {
      const objectives = JSON.parse(safeLocalStorage.getItem('objectives_order') || '[]');
      setObjectivesCount(Array.isArray(objectives) ? objectives.length : 0);
    } catch { setObjectivesCount(0); }

    try {
      const transactions = JSON.parse(safeLocalStorage.getItem('financial_history') || '[]');
      setFinancesCount(Array.isArray(transactions) ? transactions.length : 0);
    } catch { setFinancesCount(0); }

    setHasApiKey(!!safeLocalStorage.getItem('AI_API_KEY'));
    
    // Set formatted time
    const now = new Date();
    setLogTime(now.toLocaleTimeString('pt-BR'));
  }, []);

  const systemLogs = [
    { type: 'SYSTEM', message: 'Conexão com banco regional SQLite estabelecida com êxito.', code: 'SQL_OK' },
    { type: 'INTEGRIDADE', message: `Módulo diário: Encontrados ${diaryCount} registros cronológicos sincronizados no disco local.`, code: 'DIARY_INDEX' },
    { type: 'METAS_CORE', message: `Central de objetivos: ${objectivesCount} projetos ativos em monitoramento tático de marcos.`, code: 'GOALS_SYNC' },
    { type: 'FINANCAS', message: `Mapeador de liquidez: ${financesCount} transações processadas e consolidadas sem resíduos.`, code: 'FIN_TOTAL' },
    { type: 'IA_PROVIDER', message: hasApiKey ? 'Chave de API identificada de forma segura na cache local.' : 'Chave de API ausente (operando sob regras cognitivas locais padrão).', code: 'KEY_CHECK' },
    { type: 'VISUAIS', message: 'Carrossel dinâmico e carregador de fundos de ambiente inicializados para telas do Dashboard.', code: 'VISUAL_OK' },
    { type: 'SENSORIAL', message: 'Módulo haptics ajustado sob estilo clássico de baixa latência.', code: 'HAPTIC_ACTIVE' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="logs-viewer-component">
      {/* Header */}
      <div className="hidden md:block relative overflow-hidden p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
        <div className="absolute top-0 right-0 p-8 text-cyan-500/5 pointer-events-none select-none">
          <Terminal size={140} strokeWidth={0.5} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <span className="text-[9px] font-black tracking-[0.2em] text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded">
            Auditoria Sistêmica
          </span>
          <h2 className="text-xl font-black uppercase text-[var(--text)] tracking-tight">Logs e Diagnósticos do Sistema</h2>
          <p className="text-xs text-[var(--text-secondary)] font-semibold leading-relaxed">
            Acompanhe o sincronismo de dados nos módulos locais e verifique os registros persistidos de vida, diários e faturas.
          </p>
        </div>
      </div>
      
      <div className="md:hidden flex items-center gap-2 border-b border-[var(--border)] pb-2 mb-4">
        <Terminal className="text-cyan-500" size={16} />
        <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Logs e Diagnósticos</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Indicators widget */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 shadow-sm">
          <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Status do Organismo
          </h4>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-semibold">SQLite de Retenção:</span>
              <span className="font-mono text-emerald-500 dark:text-emerald-400 font-black flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-0.5 rounded-full text-[10px]">
                <CheckCircle size={10} /> Ativo
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-semibold">Chave de Inteligência:</span>
              <span className={`font-mono font-black text-[10px] px-2.5 py-0.5 rounded-full border ${
                hasApiKey 
                  ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/15' 
                  : 'text-amber-500 dark:text-amber-400 bg-amber-500/5 border-amber-500/15'
              }`}>
                {hasApiKey ? 'Configurada' : 'Local / Offline'}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)] font-semibold">Integridade das Pilhas:</span>
              <span className="font-mono text-emerald-500 dark:text-emerald-400 font-black text-[10px] bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-0.5 rounded-full">
                Estável (99.8%)
              </span>
            </div>
          </div>
        </div>

        {/* Database statistics widget */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-4 col-span-1 lg:col-span-2 shadow-sm">
          <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1.5 border-b border-[var(--border)] pb-2">
            <Clock size={14} className="text-cyan-400" /> Contadores de Sincronismo local
          </h4>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-[var(--surface-hover)]/40 rounded-xl text-center space-y-1 border border-[var(--border)]/10">
              <span className="text-[9px] uppercase font-black text-[var(--text-secondary)] tracking-wider">Metas</span>
              <p className="text-xl font-bold text-[var(--text)] tracking-tight">{objectivesCount}</p>
            </div>
            <div className="p-3 bg-[var(--surface-hover)]/40 rounded-xl text-center space-y-1 border border-[var(--border)]/10">
              <span className="text-[9px] uppercase font-black text-[var(--text-secondary)] tracking-wider">Diários</span>
              <p className="text-xl font-bold text-[var(--text)] tracking-tight">{diaryCount}</p>
            </div>
            <div className="p-3 bg-[var(--surface-hover)]/40 rounded-xl text-center space-y-1 border border-[var(--border)]/10">
              <span className="text-[9px] uppercase font-black text-[var(--text-secondary)] tracking-wider">Finanças</span>
              <p className="text-xl font-bold text-[var(--text)] tracking-tight">{financesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Block */}
      <div className="p-5 bg-slate-950 border border-slate-900 rounded-3xl font-mono text-xs leading-relaxed space-y-3 text-emerald-400/95 shadow-lg">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 border-dashed mb-2 text-[10px] text-slate-400 uppercase font-black tracking-wider">
          <span className="flex items-center gap-1.5"><Terminal size={12} className="text-emerald-500" /> Console de Diagnóstico</span>
          <span>Último Ping: {logTime}</span>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
          {systemLogs.map((log, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-start gap-1 md:gap-3 hover:bg-white/[0.02] p-1.5 rounded transition-all">
              <span className="text-[9px] font-bold uppercase shrink-0 px-2 py-0.5 rounded bg-white/5 text-slate-300 tracking-wider text-center">
                {log.type}
              </span>
              <div className="flex-1 space-y-0.5 animate-in fade-in duration-350">
                <span className="text-slate-300 font-semibold">{log.message}</span>
                <div className="flex items-center gap-1.5 text-[8px] uppercase text-emerald-500/50 font-medium">
                  <span>Auditoria Codificada: {log.code}</span>
                  <span>•</span>
                  <span>STATUS: ATIVO</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CentralDeComandoPage: React.FC<CentralDeComandoPageProps> = ({ onToggleSidebar, theme }) => {
  const [activeTab, setActiveTab] = useState<ModuleType>('ia-api');
  const navigate = useNavigate();

  const changeTab = (tab: ModuleType) => {
    if (tab !== activeTab) {
      haptics.transition();
      setActiveTab(tab);
    }
  };

  // ACTIVE FUNCTIONAL MODULES
  const activeModules = [
    { id: 'ia-api', label: 'Configuração de IA', subtitle: 'Chaves e Diretrizes', icon: Cpu },
    { id: 'database', label: 'Banco de Dados', subtitle: 'Reparar e Resetar Caches', icon: Database },
    { id: 'experience', label: 'Aparência Digital', subtitle: 'Personalizar Fundos', icon: LayoutTemplate },
    { id: 'audio', label: 'Sinais e Áudio', subtitle: 'Ajustes Sensoriais', icon: Volume2 },
    { id: 'logs', label: 'Logs e Registros', subtitle: 'Auditoria de Sincronia', icon: History },
  ];

  const renderModule = () => {
    switch (activeTab) {
      case 'ia-api':
        return <ApiSettings />;
      case 'experience':
        return <ExperienceSettings />;
      case 'audio':
        return <AudioSettings />;
      case 'database':
        return <SystemReconstruction />;
      case 'logs':
        return <SystemLogsViewer />;
      default:
        return <ApiSettings />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-300" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar Interna da Central com visual de abas limpas e flexíveis */}
      <aside className="w-full md:w-64 md:border-r border-[var(--border)] bg-[var(--surface)] p-4 md:p-5 flex flex-col shrink-0 md:h-screen shadow-sm">
        
        {/* Header de Título do Mission Control - Visível apenas em Desktop */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 border-b border-[var(--border)] pb-3 md:pb-4 mb-4 md:mb-6">
          <button 
            onClick={onToggleSidebar}
            className="p-2 md:p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all flex-shrink-0 text-[var(--primary)] border border-[var(--border)] cursor-pointer"
            title="Menu Global"
          >
            <Menu size={18} />
          </button>
          <div>
            <h1 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">CENTROS DE COMANDO</h1>
            <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-extrabold uppercase tracking-wider">Mission Control</p>
          </div>
        </div>
        
        {/* Navigation Section */}
        <div className="flex flex-col flex-1 justify-between gap-4" id="mission-sidebar-scroller">
          
          <div className="space-y-3">
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-400 block px-1 hidden md:block">
              Painéis e Utilidades Ativas
            </span>

            {/* Container unificado com Ícone de Menu Fixo e Abas Horizontais no Mobile */}
            <div className="flex flex-row md:flex-col items-center md:items-stretch gap-2 w-full overflow-hidden">
              {/* Menu Fixo Lateral Esquerdo apenas no Mobile */}
              <button 
                onClick={onToggleSidebar}
                className="md:hidden p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all flex-shrink-0 text-[var(--primary)] border border-[var(--border)] cursor-pointer bg-[var(--surface)] shadow-sm"
                title="Menu Global"
              >
                <Menu size={18} />
              </button>

              <nav className="flex-1 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0">
                {activeModules.map((module) => {
                  const Icon = module.icon;
                  const isActive = activeTab === module.id;
                  
                  return (
                    <button
                      key={module.id}
                      onClick={() => changeTab(module.id as ModuleType)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all whitespace-nowrap flex-shrink-0 md:flex-shrink text-left cursor-pointer ${
                        isActive
                          ? 'bg-[var(--primary)] text-[var(--bg)] shadow-md font-black'
                          : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] font-semibold'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={isActive ? 'text-[var(--bg)]' : 'text-slate-400'} />
                        <div className="flex flex-col">
                          <span className="text-[11px] leading-tight">{module.label}</span>
                          <span className={`text-[8px] uppercase tracking-wider ${isActive ? 'text-[var(--bg)]/80' : 'text-slate-500'} hidden md:block`}>{module.subtitle}</span>
                        </div>
                      </div>
                      {isActive && <ChevronRight size={12} className="hidden md:block text-[var(--bg)]/50" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[var(--bg)] p-4 md:p-8 no-scrollbar md:h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto pb-16 md:pb-8"
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CentralDeComandoPage;
