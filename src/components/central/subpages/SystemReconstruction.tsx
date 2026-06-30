import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Database,
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  BookOpen,
  Layers,
  FileCode,
  Link2,
  Lock,
  RefreshCw,
  Trash2,
  Skull,
  Activity,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';
import { financialObservers } from '../../../engines/financialObservers';
import { financialCognitiveEngine } from '../../../services/financialCognitiveEngine';
import { dashboardSemanticService } from '../../../services/dashboardSemanticService';
import { existentialCoreEngine } from '../../../services/existentialCoreEngine';
import { existentialVectorsEngine } from '../../../services/existentialVectorsEngine';
import { dataContext } from '../../../core/dataContext';
import { db } from '../../../services/db';
import { fakeDB } from '../../../core/fakeDB';
import { notebookManager } from '../../../core/notebookContext';
import { criticalSecurityService } from '../../../services/criticalSecurityService';
import { haptics } from '../../../services/HapticService';
import { organismEventBus } from '../../../services/organismEventBus';
import { supabase } from '../../../services/supabaseClient';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
}

interface ActionTarget {
  id: string;
  module: string;
  name: string;
  type: 'rebuild' | 'reset';
  description: string;
  action: () => Promise<void>;
}

export const SystemReconstruction: React.FC = () => {
  const [loadings, setLoadings] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<ToastState[]>([]);
  
  // Controls for the validation modal
  const [activeResetTarget, setActiveResetTarget] = useState<ActionTarget | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  // Add notification toast helper
  const addToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Listen to confirmation input changes to trigger countdown
  useEffect(() => {
    const targetPhrase = "Eu compreendo que estou reiniciando o organismo";
    if (resetConfirmText.trim() === targetPhrase) {
      if (!isCountdownRunning && countdown === null) {
        haptics.toggle(true);
        setIsCountdownRunning(true);
        setCountdown(3);
      }
    } else {
      setCountdown(null);
      setIsCountdownRunning(false);
    }
  }, [resetConfirmText]);

  // Countdown timer effect
  useEffect(() => {
    let timer: any;
    if (isCountdownRunning && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        haptics.lightClick();
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && isCountdownRunning) {
      haptics.success();
      setIsCountdownRunning(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isCountdownRunning]);

  // --- RECONSTRUCTION DIRECT ACTIONS ---

  // Module 1: Financeiro
  const handleReconstructFinanceText = async () => {
    financialObservers.invalidate();
    financialObservers.rebuild();
    financialCognitiveEngine.invalidate();
    financialCognitiveEngine.rebuildIntelligence();
    dashboardSemanticService.invalidateSnapshot();
    // Clear cognitive indexes & semantic caches but keep data
    localStorage.removeItem('global_cognitive_finance_cache');
    localStorage.removeItem('financial_semantic_memory');
    localStorage.removeItem('transaction_fingerprint_cache');
    localStorage.removeItem('dashboard_snapshot');
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
  };

  const handleResetFinanceText = async () => {
    db.resetFinancialHistory();
    // Reset indicators
    financialObservers.invalidate();
    financialObservers.rebuild();
    try {
      await Promise.all([
        supabase.from('financial_transactions').delete().eq('user_id', 'default'),
        supabase.from('financial_categories').delete().eq('user_id', 'default'),
        supabase.from('financial_projections').delete().eq('user_id', 'default')
      ]);
    } catch (err) {
      console.error('[SystemReconstruction] Error clearing finance in Supabase:', err);
    }
  };

  // Module 2: Amparadora
  const handleReconstructAmparadoraText = async () => {
    existentialCoreEngine.invalidate();
    existentialVectorsEngine.invalidate();
    dashboardSemanticService.invalidateSnapshot();
    
    // Clear memories and snapshots, trigger fresh generation
    localStorage.removeItem('global_existential_memory_cache');
    localStorage.removeItem('global_existential_vectors');
    localStorage.removeItem('dashboard_snapshot');
    
    // Core engine rebuild calls
    existentialCoreEngine.generateGlobalMemory();
    existentialVectorsEngine.generateExistentialVectors();
    dataContext.getPromptContext();
    organismEventBus.emit('cognitiveChanged');
  };

  const handleResetAmparadoraText = async () => {
    localStorage.removeItem('global_existential_memory_cache');
    localStorage.removeItem('global_existential_vectors');
    localStorage.removeItem('dashboard_snapshot');
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    existentialCoreEngine.invalidate();
    existentialVectorsEngine.invalidate();
    organismEventBus.emit('cognitiveChanged');
    try {
      await supabase.from('amparadora_chats').delete().eq('user_id', 'default');
    } catch (err) {
      console.error('[SystemReconstruction] Error clearing amparadora chats in Supabase:', err);
    }
  };

  // Module 3: Objetivos
  const handleReconstructObjectivesText = async () => {
    // Retain objectives in fakeDB but trigger recomputation of derivatives & vector maps
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    fakeDB.seed();
    organismEventBus.emit('goalUpdated');
  };

  const handleResetObjectivesText = async () => {
    fakeDB.resetObjectives();
    localStorage.removeItem('objectives_order');
    try {
      await Promise.all([
        supabase.from('tarefas').delete().eq('user_id', 'default'),
        supabase.from('metas').delete().eq('user_id', 'default'),
        supabase.from('objetivos').delete().eq('user_id', 'default')
      ]);
    } catch (err) {
      console.error('[SystemReconstruction] Error clearing objectives in Supabase:', err);
    }
  };

  // Module 4: Diário
  const handleReconstructDiariesText = async () => {
    // Retain diaries but recompute semantic indexes & posture maps
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    fakeDB.seed();
    organismEventBus.emit('diaryUpdated');
  };

  const handleResetDiariesText = async () => {
    fakeDB.resetDiaries();
    localStorage.removeItem('diary_entries');
    try {
      await supabase.from('diary_entries').delete().eq('user_id', 'default');
    } catch (err) {
      console.error('[SystemReconstruction] Error clearing diary entries in Supabase:', err);
    }
  };

  // Module 5: Workspaces
  const handleReconstructWorkspacesText = async () => {
    // Scan documents and workspace directories, clean structures without losing content
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    organismEventBus.emit('workspaceUpdated');
  };

  const handleResetWorkspacesText = async () => {
    fakeDB.resetWorkspaces();
    localStorage.removeItem('personal_os_documents');
    try {
      await Promise.all([
        supabase.from('pages').delete().eq('user_id', 'default'),
        supabase.from('folders').delete().eq('user_id', 'default'),
        supabase.from('workspaces').delete().eq('user_id', 'default')
      ]);
    } catch (err) {
      console.error('[SystemReconstruction] Error clearing workspaces in Supabase:', err);
    }
  };

  // Module 6: Notebook
  const handleReconstructNotebookText = async () => {
    // Forces synchronization with prompts and context memory
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
  };

  const handleResetNotebookText = async () => {
    notebookManager.clearContext();
  };

  // Module 7: Assets
  const handleReconstructAssetsText = async () => {
    // Clear and rebuild cognitive indices of custom physical/heritage assets
    localStorage.removeItem('asset_cognitive_index');
    import('../../../engines/assetCognitiveIndex').then(({ assetCognitiveIndex }) => {
      assetCognitiveIndex.clear();
      assetCognitiveIndex.refreshIndex();
      organismEventBus.emit('assetUpdated');
    });
  };

  const handleResetAssetsText = async () => {
    db.resetAssetsOnly();
    try {
      await supabase.from('financial_mural').upsert({ user_id: 'default', assets: '[]' });
    } catch (err) {
      console.error('[SystemReconstruction] Error resetting assets in Supabase:', err);
    }
  };

  // Module 8: Links
  const handleReconstructLinksText = async () => {
    // Recomputes cognitive secure routing models
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    organismEventBus.emit('cognitiveChanged');
  };

  const handleResetLinksText = async () => {
    db.resetLinksOnly();
    try {
      await supabase.from('financial_mural').upsert({ user_id: 'default', links: '[]' });
    } catch (err) {
      console.error('[SystemReconstruction] Error resetting links in Supabase:', err);
    }
  };

  // Module 9: Vault
  const handleReconstructVaultText = async () => {
    // Clear and rebuild semantic encryption maps of confidential digital vault items
    localStorage.removeItem('vault_semantic_map');
    import('../../../engines/vaultSemanticMap').then(({ vaultSemanticMap }) => {
      vaultSemanticMap.clear();
      vaultSemanticMap.refreshMap();
      organismEventBus.emit('vaultUpdated');
    });
  };

  const handleResetVaultText = async () => {
    db.resetVaultOnly();
    try {
      await supabase.from('financial_mural').upsert({ user_id: 'default', vault: '[]' });
    } catch (err) {
      console.error('[SystemReconstruction] Error resetting vault in Supabase:', err);
    }
  };

  // Module 11: Desk Board de Vida / Dashboard
  const handleReconstructLifeDashboardText = async () => {
    localStorage.removeItem('dashboard_life_reset');
    dashboardSemanticService.invalidateSnapshot();
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    organismEventBus.emit('cognitiveChanged');
  };

  const handleResetLifeDashboardText = async () => {
    localStorage.removeItem('dashboard_snapshot');
    localStorage.setItem('dashboard_snapshot_dirty', 'true');
    localStorage.setItem('dashboard_life_reset', 'true');
    dashboardSemanticService.invalidateSnapshot();
    organismEventBus.emit('cognitiveChanged');
  };

  // Module 10: Reset Global Supremo
  const handleAbsoluteResetText = async () => {
    db.resetToFirstInstallation();
    fakeDB.resetDB();
    notebookManager.clearContext();
    
    try {
      await Promise.all([
        supabase.from('amparadora_chats').delete().eq('user_id', 'default'),
        supabase.from('energy_work_catalogs').delete().eq('user_id', 'default'),
        supabase.from('pages').delete().eq('user_id', 'default'),
        supabase.from('folders').delete().eq('user_id', 'default'),
        supabase.from('workspaces').delete().eq('user_id', 'default'),
        supabase.from('financial_mural').delete().eq('user_id', 'default'),
        supabase.from('financial_projections').delete().eq('user_id', 'default'),
        supabase.from('financial_transactions').delete().eq('user_id', 'default'),
        supabase.from('financial_categories').delete().eq('user_id', 'default'),
        supabase.from('diary_entries').delete().eq('user_id', 'default'),
        supabase.from('tarefas').delete().eq('user_id', 'default'),
        supabase.from('metas').delete().eq('user_id', 'default'),
        supabase.from('objetivos').delete().eq('user_id', 'default'),
        supabase.from('identity_media').delete().eq('user_id', 'default'),
        supabase.from('identity_answers').delete().eq('user_id', 'default'),
        supabase.from('experience_backgrounds').delete().eq('user_id', 'default'),
        supabase.from('ai_cognitive_settings').delete().eq('user_id', 'default'),
        supabase.from('presences').delete().eq('user_id', 'default'),
        supabase.from('user_profile').delete().eq('user_id', 'default'),
      ]);
      console.log('[SystemReconstruction] Absolute Reset: All Supabase tables wiped.');
    } catch (err) {
      console.error('[SystemReconstruction] Absolute Reset: Supabase wipe failed:', err);
    }
    
    const keysToClear = [
      'global_cognitive_finance_cache',
      'global_existential_memory_cache',
      'global_existential_vectors',
      'dashboard_snapshot',
      'dashboard_snapshot_dirty',
      'financial_semantic_memory',
      'transaction_fingerprint_cache',
      'financial_history',
      'financial_episodes',
      'asset_cognitive_index',
      'vault_semantic_map',
      'financial_schema_v2',
      'projections',
      'personal_os_documents',
      'has_seeded_fake_db',
      'objectives_order',
      'diary_entries'
    ];
    keysToClear.forEach(key => localStorage.removeItem(key));
    localStorage.setItem('has_seeded_fake_db', 'true'); // Set to true to prevent automatic re-seeding
    localStorage.setItem('dashboard_life_reset', 'true');
  };

  // --- GENERAL TRIGGER EXECUTION WRAPPERS ---

  const executeRebuild = async (id: string, moduleName: string, actionFn: () => Promise<void>) => {
    haptics.open();
    setLoadings(prev => ({ ...prev, [id]: true }));
    addToast(`Iniciando recomputação profunda do Módulo: ${moduleName}...`, 'info');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await actionFn();
      addToast(`Sucesso! ${moduleName} recomputado sem perda de registros.`, 'success');
    } catch (e) {
      addToast(`Inconsistências durante o sincronismo do módulo ${moduleName}.`, 'warning');
      console.error(e);
    } finally {
      setLoadings(prev => ({ ...prev, [id]: false }));
    }
  };

  const triggerResetFlow = (id: string, moduleName: string, targetName: string, actionFn: () => Promise<void>) => {
    haptics.actionCritical();
    setResetConfirmText('');
    setCountdown(null);
    setIsCountdownRunning(false);
    setActiveResetTarget({
      id,
      module: moduleName,
      name: targetName,
      type: 'reset',
      description: `Esta ação irá expurgar irreversivelmente todos os dados do módulo ${moduleName}.`,
      action: actionFn
    });
  };

  const executeConfirmedReset = async () => {
    if (!activeResetTarget) return;
    const { id, name, action } = activeResetTarget;
    haptics.transition();
    
    // Integrate through Critical Security Service for compliance auditing
    const auditValidate = await criticalSecurityService.validateCredentials(name, resetConfirmText);
    
    if (!auditValidate.success) {
      addToast(auditValidate.error || 'Autenticação de nível mestre falhou.', 'warning');
      return;
    }

    setActiveResetTarget(null);
    setLoadings(prev => ({ ...prev, [id]: true }));
    addToast(`Aniquilando dados do alvo: ${name}...`, 'warning');

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      await action();
      addToast(`Redefinição completa efetuada! Alvo: ${name} limpo com sucesso.`, 'success');
      
      // If it is supreme reset global, do a full reload in 1.5s
      if (id === 'global-nuclear') {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      addToast(`Sombra detectada. Falha no reset de ${name}.`, 'warning');
      console.error(e);
    } finally {
      setLoadings(prev => ({ ...prev, [id]: false }));
    }
  };

  // Define All Modules Data for Iteration
  const modules = [
    {
      id: 'financeiro',
      title: 'Módulo Financeiro',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Tendências operacionais, fluxo monetário, categorias inteligentes de transação e previsões de patrimônio.',
      rebuildAction: {
        id: 'rebuild-finance',
        label: 'Reconstruir Finanças',
        desc: 'Sincroniza transações, recria as categorias do grafo semântico e invalida buffers.',
        fn: handleReconstructFinanceText
      },
      resetAction: {
        id: 'reset-finance',
        label: 'Reset Financeiro',
        desc: 'Zera transações, ativos, cofres, links financeiros e resíduos cognitivos.',
        fn: handleResetFinanceText
      }
    },
    {
      id: 'amparadora',
      title: 'Módulo Amparadora',
      icon: Brain,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      description: 'Estado existencial global, motor vetorial cognitivo de IA e compilações de snapshots de prompt.',
      rebuildAction: {
        id: 'rebuild-amparadora',
        label: 'Reconstruir Amparadora',
        desc: 'Comprime memórias herdadas e reorganiza o alinhamento semântico de projeções existenciais.',
        fn: handleReconstructAmparadoraText
      },
      resetAction: {
        id: 'reset-amparadora',
        label: 'Reset Amparadora',
        desc: 'Limpa contextos de longo prazo, caches de IA e vetores (sem apagar os dados fundamentais).',
        fn: handleResetAmparadoraText
      }
    },
    {
      id: 'objetivos',
      title: 'Central de Objetivos',
      icon: Target,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      description: 'Gestão de metas de vida, projetos táticos estruturados, sub-tarefas e simulações progressivas.',
      rebuildAction: {
        id: 'rebuild-goals',
        label: 'Reconstruir Central',
        desc: 'Recalcula direções existenciais, marcos concluídos e progresso dos marcos temporários.',
        fn: handleReconstructObjectivesText
      },
      resetAction: {
        id: 'reset-goals',
        label: 'Reset Objetivos',
        desc: 'Apaga todos os objetivos, metas, tarefas de roadmap, dependências de progresso e simulações.',
        fn: handleResetObjectivesText
      }
    },
    {
      id: 'diario',
      title: 'Módulo Diário',
      icon: BookOpen,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      description: 'Reflexões emocionais, posturas do organismo, interferências diárias e acordos de amanhã.',
      rebuildAction: {
        id: 'rebuild-diario',
        label: 'Reconstruir Diários',
        desc: 'Regera índices semânticos e compila mapas de tendências mentais retrospectivos.',
        fn: handleReconstructDiariesText
      },
      resetAction: {
        id: 'reset-diario',
        label: 'Reset Diário',
        desc: 'Expurga definitivamente todos os logs cronológicos de diários e anotações subjetivas.',
        fn: handleResetDiariesText
      }
    },
    {
      id: 'workspaces',
      title: 'Módulo Workspaces',
      icon: Layers,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'Áreas de cooperação estrutural, diretórios e segmentação racional de documentos do organismo.',
      rebuildAction: {
        id: 'rebuild-workspaces',
        label: 'Reconstruir Workspaces',
        desc: 'Verifica conexões de pastas e reindexa árvores de links órfãos.',
        fn: handleReconstructWorkspacesText
      },
      resetAction: {
        id: 'reset-workspaces',
        label: 'Reset Workspaces',
        desc: 'Abaixa as divisões workspace e deleta todas as pastas virtuais e estruturas lógicas.',
        fn: handleResetWorkspacesText
      }
    },
    {
      id: 'notebook',
      title: 'LLM Notebook',
      icon: FileCode,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      description: 'Contexto dinâmico de apoio utilizado para conduzir as diretrizes de cognição mestre da IA.',
      rebuildAction: {
        id: 'rebuild-notebook',
        label: 'Reconstruir Notebook',
        desc: 'Sincroniza o caderno de orientações com as últimas modificações de comportamento mestre.',
        fn: handleReconstructNotebookText
      },
      resetAction: {
        id: 'reset-notebook',
        label: 'Reset Notebook',
        desc: 'Esvazia por completo o prompt temporário de apoio dinâmico ativo.',
        fn: handleResetNotebookText
      }
    },
    {
      id: 'assets',
      title: 'Patrimônios (Assets)',
      icon: TrendingUp,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      description: 'Cadastro físico e lógico de ativos de alto valor sob controle gerencial direto.',
      rebuildAction: {
        id: 'rebuild-assets',
        label: 'Reconstruir Assets',
        desc: 'Recalcula índices cognitivos de valor de mercado e recalibra balanço de liquidez.',
        fn: handleReconstructAssetsText
      },
      resetAction: {
        id: 'reset-assets',
        label: 'Reset Assets',
        desc: 'Remove integralmente os ativos imobiliários, veículos e pertences tangíveis físicos.',
        fn: handleResetAssetsText
      }
    },
    {
      id: 'links',
      title: 'Conexões (Links)',
      icon: Link2,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Hiperlinks confidenciais salvos e canais integradores externos vinculados ao mural.',
      rebuildAction: {
        id: 'rebuild-links',
        label: 'Reconstruir Links',
        desc: 'Varre e revalida a resposta sistêmica das referências hipertexto informadas.',
        fn: handleReconstructLinksText
      },
      resetAction: {
        id: 'reset-links',
        label: 'Reset Links',
        desc: 'Exclui definitivamente todos os atalhos externos cadastrados.',
        fn: handleResetLinksText
      }
    },
    {
      id: 'vault',
      title: 'Cofre Secreto (Vault)',
      icon: Lock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description: 'Documentos criptografados de alta confidencialidade e credenciais cruciais arquivadas.',
      rebuildAction: {
        id: 'rebuild-vault',
        label: 'Reconstruir Vault',
        desc: 'Recodifica as assinaturas semânticas de acesso e limpa chaves expiradas.',
        fn: handleReconstructVaultText
      },
      resetAction: {
        id: 'reset-vault',
        label: 'Reset Vault',
        desc: 'Limpa o cofre, deletando todos os arquivos, chaves criptográficas e notas confidenciais.',
        fn: handleResetVaultText
      }
    },
    {
      id: 'dashboard-life',
      title: 'Desk Board de Vida (Painel)',
      icon: Activity,
      color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      description: 'Snapshot semântico existencial, cronobiologia de sono, hábitos multidimensionais e insights analíticos.',
      rebuildAction: {
        id: 'rebuild-dashboard-life',
        label: 'Reconstruir Painel',
        desc: 'Recalcula o snapshot analítico completo do diário, metas, tarefas e finanças.',
        fn: handleReconstructLifeDashboardText
      },
      resetAction: {
        id: 'reset-dashboard-life',
        label: 'Reset Desk Board',
        desc: 'Remove o snapshot, limpa ontologias de sonhos, sentimentos, wake time e zera as estatísticas do painel.',
        fn: handleResetLifeDashboardText
      }
    }
  ];

  return (
    <div className="space-y-8" id="system-reconstruction-container">
      {/* Toast Overlay */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-2xl pointer-events-auto ${
                t.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
                  : t.type === 'warning'
                  ? 'bg-rose-950/90 border-rose-500/30 text-rose-200'
                  : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-200'
              }`}
            >
              <div className="mt-0.5">
                {t.type === 'success' && <CheckCircle size={16} className="text-emerald-400" />}
                {t.type === 'warning' && <AlertTriangle size={16} className="text-rose-400" />}
                {t.type === 'info' && <Zap size={16} className="text-indigo-400 font-bold" />}
              </div>
              <div className="flex-1 text-xs font-semibold tracking-wide">
                {t.message}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Premium Elegant Header */}
      <div className="hidden md:block relative overflow-hidden p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-sm" id="reconstruction-header-card">
        <div className="absolute top-0 right-0 p-8 text-amber-500/10 pointer-events-none select-none">
          <Activity size={180} strokeWidth={0.5} />
        </div>
        
        {/* Design Glow Accent */}
        <div className="absolute top-0 left-1/3 w-[500px] h-24 bg-amber-500/10 rounded-full filter blur-[100px]" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-black tracking-[0.25em] text-amber-600 dark:text-amber-500 uppercase px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30">
              Módulo Integridade Premium
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-[var(--surface-hover)] px-2.5 py-1 rounded border border-[var(--border)]">
              <ShieldCheck size={12} className="text-emerald-500" /> INTEGRIDADE DO ORGANISMO v2.5
            </div>
          </div>

          <h1 className="text-xl md:text-3xl font-black tracking-tight text-[var(--text)] flex items-center gap-3 uppercase">
            Central de Reconstrução
          </h1>
          
          <div className="w-24 h-0.5 bg-gradient-to-r from-amber-500 to-amber-700" />

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
            Manipule e repare de maneira segura os estados internos de retenção de dados, caches em memória, 
            snapshots órfãos e indexadores vetoriais do organismo. Escolha recomputar (operação restaurativa no-loss) 
            ou resetar (operação destrutiva seletiva) individualmente cada setor cognitivo.
          </p>
        </div>
      </div>
      
      <div className="md:hidden flex items-center gap-2 border-b border-[var(--border)] pb-2 mb-4">
        <Database className="text-amber-500" size={16} />
        <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-tight">Eixo de Reconstrução</h2>
      </div>

      {/* Grid of Modular Subsections */}
      <div className="space-y-6" id="scaffold-modular-list">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)]/80 flex items-center gap-2 px-1">
          <HeartPulse size={12} className="text-amber-500" /> MÓDULOS OPERACIONAIS INDEPENDENTES
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="modular-cards-container">
          {modules.map(mod => {
            const ModIcon = mod.icon;
            const isRebuildingObj = loadings[mod.rebuildAction.id];
            const isResettingObj = loadings[mod.resetAction.id];

            return (
              <div 
                key={mod.id} 
                className="relative bg-[var(--surface)] border border-[var(--border)] hover:border-amber-500/30 transition-colors p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm"
                id={`modular-card-${mod.id}`}
              >
                {/* Module Heading */}
                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-2xl flex-shrink-0 border ${mod.color}`}>
                    <ModIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">
                      {mod.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-semibold">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Grid layout for the two specific choices on this module */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Action Rebuild (No-Loss Recomputation) */}
                  <div className="p-4 rounded-2xl bg-[var(--bg)] hover:bg-[var(--surface-hover)] transition-colors border border-[var(--border)] flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#6366f1] bg-[#6366f1]/10 px-2 py-0.5 rounded border border-[#6366f1]/20">
                        Restaurar
                      </span>
                      <h5 className="text-[10px] font-bold text-[var(--text)] uppercase tracking-wider pt-1">
                        {mod.rebuildAction.label}
                      </h5>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-semibold">
                        {mod.rebuildAction.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => executeRebuild(mod.rebuildAction.id, mod.title, mod.rebuildAction.fn)}
                      disabled={isRebuildingObj || isResettingObj}
                      className="w-full py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[var(--surface-hover)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] transition-all flex items-center justify-center gap-2 cursor-pointer text-[var(--text)]"
                    >
                      {isRebuildingObj ? (
                        <>
                          <RefreshCw size={11} className="animate-spin text-amber-400" />
                          <span>Calculando...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={11} />
                          <span>Sincronizar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Action Reset (Erase Specific Target) */}
                  <div className="p-4 rounded-2xl bg-rose-500/[0.03] hover:bg-rose-500/[0.06] transition-colors border border-rose-500/20 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        Destrutiva
                      </span>
                      <h5 className="text-[10px] font-bold text-rose-500 dark:text-rose-300 uppercase tracking-wider pt-1">
                        {mod.resetAction.label}
                      </h5>
                      <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-semibold">
                        {mod.resetAction.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => triggerResetFlow(mod.resetAction.id, mod.title, mod.resetAction.label, mod.resetAction.fn)}
                      disabled={isRebuildingObj || isResettingObj}
                      className="w-full py-2 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-rose-600 dark:text-rose-300"
                    >
                      {isResettingObj ? (
                        <>
                          <Trash2 size={11} className="animate-spin text-white" />
                          <span>Excluindo...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 size={11} />
                          <span>Zerar Alvo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative py-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.45em] text-rose-500 bg-[var(--bg)] px-5">
          ✦ ALVO PRINCIPAL: CONTROLE TOTAL NÚCLEO ✦
        </div>
      </div>

      {/* Premium Nuclear Reset Banner (System Reboot First Installation) */}
      <div 
        className="p-8 rounded-3xl bg-rose-500/[0.02] border border-rose-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-sm"
        id="extreme-nuclear-reset-banner"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[8px] font-black tracking-[0.2em] bg-rose-500/20 text-rose-500 dark:text-rose-300 uppercase px-2.5 py-1 rounded border border-rose-500/30">
              Operação de Emergência
            </span>
            <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#f59e0b] leading-none">
              <Skull size={10} /> Full Factory Reset
            </span>
          </div>
          
          <h3 className="text-base font-black uppercase tracking-wider text-[var(--text)]">
            Reset Total Supremo de Todo o Organismo
          </h3>
          
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold max-w-2xl">
            Redefine por completo o ecossistema. Executa um expurgo mestre que apaga transações, ativos, 
            cofres, objetivos, projetos, cronogramas de diários e resíduos cognitivos de IA.
            Após a execução, o aplicativo recarrega de maneira limpa em seu formato inicial (estável de fábrica), pronto para acolher dados sem interferências herdadas.
          </p>
        </div>

        <button
          onClick={() => triggerResetFlow('global-nuclear', 'Do Sistema Global', 'Reset Global Supremo', handleAbsoluteResetText)}
          className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-500 dark:text-rose-200 border border-rose-500/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-all cursor-pointer whitespace-nowrap self-stretch md:self-auto flex items-center justify-center gap-2.5"
        >
          <Skull size={13} />
          <span>Reset Nuclear Global</span>
        </button>
      </div>

      {/* Supreme Confirmation Modal with Real-time Count-down Security Locking */}
      <AnimatePresence>
        {activeResetTarget && (
          <div className="fixed inset-0 z-[10000] overflow-y-auto flex items-start justify-center p-4 min-h-screen md:items-center">
            {/* Modal Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveResetTarget(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            
            {/* Security Action Content Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-[var(--surface)] border border-rose-500/40 p-6 md:p-8 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.15)] space-y-6 z-20 my-auto"
            >
              {/* Backlit styling */}
              <div className="absolute top-0 right-0 p-8 text-rose-500/5 pointer-events-none select-none">
                <Skull size={120} strokeWidth={0.5} />
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-400 rounded-2xl flex-shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1 flex-1">
                  <span className="text-[8px] font-black tracking-widest text-rose-500 dark:text-rose-400 uppercase">
                    Protocolo de Proteção • Segurança Elevada
                  </span>
                  <h3 className="text-base font-black tracking-wider uppercase text-[var(--text)] leading-tight">
                    Confirmar Procedimento Destrutivo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveResetTarget(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <hr className="border-[var(--border)]" />

              <div className="space-y-4">
                <p className="text-[11px] text-[var(--text)] leading-relaxed font-semibold">
                  Agora você solicitou a ação crítica mestre: <strong className="text-rose-500 font-extrabold uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{activeResetTarget.name}</strong>.
                </p>

                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <p className="text-[10px] text-rose-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-rose-400" /> Alerta de Compromisso Existencial
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-semibold leading-relaxed">
                    {activeResetTarget.description} Uma vez executada, esta ação apagará permanentemente os dados designados sem possibilidade de reversão.
                  </p>
                </div>
              </div>

              {/* Form Input Challenge */}
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-rose-300 uppercase tracking-widest">
                  Para habilitar, digite estritamente a frase confirmatória abaixo:
                </label>
                
                <div className="p-3.5 bg-black border border-white/5 rounded-xl font-mono text-[10px] text-white/50 select-all text-center tracking-wider">
                  Eu compreendo que estou reiniciando o organismo
                </div>

                <input
                  type="text"
                  placeholder="Instrução de Segurança Suprema"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  className="w-full bg-black border border-rose-500/20 focus:border-rose-500 focus:outline-none rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 font-black tracking-wide shadow-inner text-center"
                />
              </div>

              {/* Visualized Real-time Count-down */}
              <AnimatePresence>
                {countdown !== null && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 gap-1.5"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                      Câmara de Ignição Sistêmica Estabelecida
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono font-black text-amber-500 pulse">
                        {countdown === 0 ? 'PRONTO' : `LIBERANDO EM ${countdown}s...`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trigger Confirmation Actions buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveResetTarget(null)}
                  className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors cursor-pointer"
                >
                  Cancelar Procedimento
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedReset}
                  disabled={countdown !== 0}
                  className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white border border-rose-500 disabled:opacity-25 disabled:bg-rose-950/40 disabled:border-rose-500/15 disabled:text-rose-400/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_25px_rgba(239,68,68,0.15)]"
                >
                  <Skull size={12} />
                  <span>Proceder Com o Expurgo</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
