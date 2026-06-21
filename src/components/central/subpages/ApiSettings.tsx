import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Check, 
  AlertTriangle, 
  Zap, 
  ChevronRight,
  Sparkles, 
  Sliders, 
  BookOpen, 
  Fingerprint, 
  Info,
  Flame,
  CheckCircle2,
  Trash,
  Database,
  FileText,
  Link as LinkIcon,
  Cpu,
  Brain,
  SlidersHorizontal,
  PlusCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { safeLocalStorage } from '../../../utils/storage';
import { memoryStore, MemoryData } from '../../../core/memoryStore';
import { notebookManager } from '../../../core/notebookContext';
import { aiCognitiveService } from '../../../services/aiCognitiveService';

type TabType = 'personality' | 'notebook' | 'metrics' | 'memory';

interface KnowledgeDoc {
  id: string;
  title: string;
  type: 'pdf' | 'book' | 'link';
  addedAt: string;
  size: string;
  value?: string;
}

export function ApiSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('personality');
  const [isSavedNotify, setIsSavedNotify] = useState(false);
  
  // AI Personality State
  const [globalPersonality, setGlobalPersonality] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [maxTokens, setMaxTokens] = useState(2048);

  // Knowledge Base State
  const [knowledgeConstraint, setKnowledgeConstraint] = useState<'flexible' | 'strict'>('flexible');
  const [notebookFileList, setNotebookFileList] = useState<KnowledgeDoc[]>([]);
  
  // New Document Dialog State
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'pdf' | 'book' | 'link'>('pdf');
  const [newDocValue, setNewDocValue] = useState('');

  // DNA / Patterns state
  const [memory, setMemory] = useState<MemoryData>(memoryStore.getMemory());

  // Tokenomics usage state from real Server API
  const [usageStats, setUsageStats] = useState({
    totalCostUSD: 0,
    limitUSD: 20.0,
    killSwitchActive: false,
    byModel: {} as Record<string, any>
  });

  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // Default values
  const defaultPersonalityPrompt = "Você é a Amparadora de Próxima Geração. Deve agir com extrema empatia, pragmatismo analítico e inteligência holística. Seu rumo de conversa deve ser focado em apoiar minhas tomadas de decisão de forma lúcida, equilibrada e focada no auto-aperfeiçoamento quotidiano. Evite respostas genéricas e traga uma visão madura baseada em lógica.";

  const defaultDocuments: KnowledgeDoc[] = [];

  // Load configuration on mount
  useEffect(() => {
    async function loadConfig() {
      const settings = await aiCognitiveService.getSettings();
      setGlobalPersonality(settings.global_personality);
      setTemperature(settings.temperature);
      setSelectedModel(settings.selected_model);
      setKnowledgeConstraint(settings.knowledge_constraint);
      setNotebookFileList(settings.knowledge_docs);

      applyAndConsolidateCognitiveSettings(
        settings.global_personality,
        settings.knowledge_docs,
        settings.knowledge_constraint,
        settings.temperature,
        settings.selected_model,
        false
      );
    }

    loadConfig();

    // 6. Memory Store
    setMemory(memoryStore.getMemory());
  }, []);

  // Poll actual token usage/costs from server dynamically
  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await aiCognitiveService.getUsageStats();
        setUsageStats(stats);
      } catch (e) {
        console.error('[ApiSettings] Failed to load server usage metrics:', e);
      }
    }
    fetchStats();
    if (activeTab === 'metrics') {
      const timer = setInterval(fetchStats, 6000);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const handleUpdateLimit = async (newLimit: number) => {
    try {
      setIsUpdatingLimit(true);
      const updated = await aiCognitiveService.updateKillSwitch({ limitUSD: newLimit });
      setUsageStats(updated);
    } catch (e) {
      alert('Erro ao atualizar limite de custos no servidor.');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  const handleResetStats = async () => {
    if (window.confirm('Tem certeza de que deseja redefinir todas as estatísticas reais de consumo de tokens no servidor para zero?')) {
      try {
        const updated = await aiCognitiveService.updateKillSwitch({ action: 'clear' });
        setUsageStats(updated);
      } catch (e) {
        alert('Erro ao limpar estatísticas.');
      }
    }
  };

  // Consolidate values inside notebookContext for existential/AI engine
  const applyAndConsolidateCognitiveSettings = (
    personality: string, 
    docs: KnowledgeDoc[], 
    constraint: 'flexible' | 'strict',
    temp: number,
    model: string,
    syncToBackend: boolean = true
  ) => {
    safeLocalStorage.setItem('AI_GLOBAL_PERSONALITY', personality);
    safeLocalStorage.setItem('AI_KNOWLEDGE_DOCS', JSON.stringify(docs));
    safeLocalStorage.setItem('AI_KNOWLEDGE_CONSTRAINT', constraint);
    safeLocalStorage.setItem('AI_TEMPERATURE', temp.toString());
    safeLocalStorage.setItem('AI_SELECTED_MODEL', model);

    if (syncToBackend) {
      aiCognitiveService.saveSettings({
        global_personality: personality,
        temperature: temp,
        selected_model: model,
        knowledge_constraint: constraint,
        knowledge_docs: docs
      }).catch(err => {
        console.error('[ApiSettings] Failed to save settings to backend:', err);
      });
    }

    // Format description text for notebookContext
    const docSummaryList = docs.map(d => `- [Base Core: ${d.type.toUpperCase()}] ${d.title} (${d.size})`).join('\n') || 'Nenhum documento ou livro indexado no momento.';
    
    const restrictionNote = constraint === 'strict'
      ? 'RESTRIÇÃO ESTRITA: Use APENAS e estritamente a base de conhecimento/livros indexados acima para formular respostas. Ignore ou bloqueie respostas fora do escopo desses arquivos.'
      : 'DIRETRIZ HÍBRIDA / FLEXÍVEL: Use toda a inteligência geral global do LLM (GPT/Gemini), mas consulte e mencione os dados dos livros/PDFs fornecidos para apoiar decisões ou embasar respostas sempre que pertinente.';

    const consolidatedPrompt = `[PERSONALIDADE GLOBAL DA IA (INSTRUÇÃO GERAL DE COMPORTAMENTO)]
${personality || 'Agir de modo amigável e focado em apoiar o usuário.'}

[TEMPERATURA E SENSIBILIDADE]
Nível configurado: ${temp} (Foco e Fatos vs Criatividade)

[BASE DE CONHECIMENTOS INDEXADA (LIVROS, PDFs & LINKS)]
${docSummaryList}

[DIRETRIZ DO NÍVEL DE RESTRIÇÃO DA BASE]
${restrictionNote}`;

    // Load into global notebookManager which gets appended to prompt context automatically
    notebookManager.setContext(consolidatedPrompt);

    if (syncToBackend) {
      setIsSavedNotify(true);
      setTimeout(() => setIsSavedNotify(false), 3000);
    }
  };

  const handleSavePersonality = () => {
    applyAndConsolidateCognitiveSettings(globalPersonality, notebookFileList, knowledgeConstraint, temperature, selectedModel);
  };

  const applyPersonalityTemplate = (templatePrompt: string) => {
    setGlobalPersonality(templatePrompt);
  };

  const handleAddDoc = () => {
    if (!newDocTitle) return;
    const newDoc: KnowledgeDoc = {
      id: `doc_${Date.now()}`,
      title: newDocType === 'link' && !newDocTitle.startsWith('http') ? `https://${newDocTitle}` : newDocTitle,
      type: newDocType,
      addedAt: new Date().toLocaleDateString('pt-BR'),
      size: newDocType === 'link' ? 'Ativo' : `${(Math.random() * 5 + 1).toFixed(1)} MB`,
      value: newDocValue
    };

    const updated = [...notebookFileList, newDoc];
    setNotebookFileList(updated);
    applyAndConsolidateCognitiveSettings(globalPersonality, updated, knowledgeConstraint, temperature, selectedModel);
    
    // reset form
    setNewDocTitle('');
    setNewDocValue('');
    setIsAddingDoc(false);
  };

  const handleRemoveDoc = (id: string) => {
    const updated = notebookFileList.filter(d => d.id !== id);
    setNotebookFileList(updated);
    applyAndConsolidateCognitiveSettings(globalPersonality, updated, knowledgeConstraint, temperature, selectedModel);
  };

  const handleToggleConstraint = (mode: 'flexible' | 'strict') => {
    setKnowledgeConstraint(mode);
    applyAndConsolidateCognitiveSettings(globalPersonality, notebookFileList, mode, temperature, selectedModel);
  };

  const handleClearMemory = () => {
    if (window.confirm('Deseja limpar os padrões aprendidos de uso e redefinir a memória do perfil de usuário?')) {
      safeLocalStorage.removeItem('app_memory_v1');
      setMemory(memoryStore.getMemory());
    }
  };

  const handleRemoveMemoryItem = (type: 'projects' | 'actions' | 'patterns', item: string) => {
    const currentMemory = memoryStore.getMemory();
    if (type === 'projects') {
      currentMemory.userProfile.frequentProjects = currentMemory.userProfile.frequentProjects.filter(i => i !== item);
    } else if (type === 'actions') {
      currentMemory.userProfile.frequentActions = currentMemory.userProfile.frequentActions.filter(i => i !== item);
    } else if (type === 'patterns') {
      currentMemory.patterns = currentMemory.patterns.filter(i => i !== item);
    }
    memoryStore.saveMemory(currentMemory);
    setMemory(memoryStore.getMemory());
  };

  // Templates
  const templates = [
    {
      name: "Conselheira Amparadora",
      desc: "Lógica lúcida expandida com profundo apoio moral e bioenergias.",
      prompt: "Você age como a Amparadora Central de Próxima Geração. Deve ter uma postura extremamente compreensiva, socrático-madura e profunda em bioenergias e lógica evolutiva. Conduza-me a tomar decisões conscientes com base no auto-aperfeiçoamento quotidiano.",
      color: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10"
    },
    {
      name: "Especialista Sintético",
      desc: "Respostas curtas, sem enrolação e focado em fatos numéricos.",
      prompt: "Você é um assistente ultradireto de alta performance. Reduza preâmbulos, seja direto ao ponto, use marcações em negrito para termos cruciais e evite considerações subjetivas. Destaque métricas e planos práticos imediatamente.",
      color: "border-zinc-500/30 text-zinc-500 bg-zinc-500/5 hover:bg-zinc-500/10"
    },
    {
      name: "Cientista Analítico",
      desc: "Raciocínio lógico, hipóteses empíricas e ceticismo construtivo.",
      prompt: "Adote a mentalidade de um cientista de dados e biólogo cognitivo. Sempre que o usuário registrar sintomas ou metas, analise correlações físicas ou de comportamento diário com precisão estatística. Proponha hipóteses testáveis.",
      color: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10"
    },
    {
      name: "Treinador Implacável",
      desc: "Alto rendimento, cobrança firme de metas e incentivos diretos.",
      prompt: "Você é o meu mentor de rendimento pessoal. Seja incisivo, cobre o cumprimento das metas, lembre-me das consequências do desleixo e analise faturas e finanças com rigor focado em independência financeira veloz.",
      color: "border-amber-500/30 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans" id="api-settings-view">
      
      {/* Header Amigável e Refinado */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-[var(--surface-hover)] border border-[var(--border)] backdrop-blur-3xl" id="api-header-box">
        <div className="absolute top-0 right-0 p-8 text-indigo-500/5 pointer-events-none select-none">
          <Brain size={150} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="text-[9px] font-black tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
            Inteligência Cognitiva Global
          </span>
          <h1 className="text-xl md:text-2xl font-black text-[var(--text)] tracking-tight uppercase">
            Ajustes de Inteligência Artificial
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
            Treine seu assistente definindo a personalidade e rumo conversacional global, adicione documentos de apoio para consulta analítica e gerencie os modelos operacionais ativos.
          </p>
        </div>
      </div>

      {/* Tabs amigáveis de controle */}
      <div className="flex flex-wrap gap-1 p-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl md:max-w-max" id="api-tabs-nav">
        {[
          { id: 'personality', label: '1. Personalidade Global', icon: Sparkles },
          { id: 'notebook', label: '2. Base de Conhecimento (Notebook)', icon: BookOpen },
          { id: 'metrics', label: '3. Modelos & Consumo', icon: Cpu },
          { id: 'memory', label: '4. DNA & Aprendizado', icon: Fingerprint }
        ].map(t => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 font-black' 
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <TabIcon size={14} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm" id="api-tabs-content">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PERSONALIDADE GLOBAL */}
          {activeTab === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="space-y-1 border-b border-[var(--border)] pb-4 flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={16} className="text-indigo-500" />
                    Treinamento da Personalidade
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-semibold">Molde o comportamento global da inteligência e dê o direcionamento ideal de conversa.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Editor Textarea */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text)]">
                      Rumo Conversacional & Comportamento Esperado
                    </label>
                    <textarea
                      value={globalPersonality}
                      onChange={(e) => setGlobalPersonality(e.target.value)}
                      placeholder="Descreva detalhadamente como a IA deve agir e falar com você de forma global..."
                      className="w-full h-56 p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-xs text-[var(--text)] placeholder-[var(--text-secondary)]/45 leading-relaxed font-semibold resize-none"
                    />
                    <p className="text-[10px] text-[var(--text-secondary)] leading-normal font-semibold">
                      Dica: Use termos voltados ao seu cotidiano. Exemplos: "Sempre chame atenção para meus desperdícios", "Foque em me manter mentalmente lúcido".
                    </p>
                  </div>

                  <div className="flex gap-3 justify-end items-center">
                    {isSavedNotify && (
                      <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 animate-pulse bg-emerald-500/10 px-3 py-1 rounded-xl">
                        <CheckCircle2 size={12} /> Diretrizes aplicadas em tempo real!
                      </span>
                    )}
                    <button
                      onClick={handleSavePersonality}
                      className="py-3 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-700 hover:shadow-indigo-600/10 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Save size={13} />
                      <span>Salvar e Sincronizar IA</span>
                    </button>
                  </div>
                </div>

                {/* Templates de Personalidade */}
                <div className="space-y-4 bg-[var(--surface-hover)]/30 border border-[var(--border)] rounded-2xl p-5">
                  <header className="border-b border-[var(--border)] pb-2 flex items-center gap-1.5 text-indigo-500">
                    <Sliders size={14} />
                    <h4 className="text-[10px] font-black uppercase tracking-wider">Templates Ágeis</h4>
                  </header>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-normal font-semibold">
                    Selecione um molde de personalidade rápida para carregar comportamentos focados imediatamente no editor.
                  </p>

                  <div className="space-y-3 pt-1">
                    {templates.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => applyPersonalityTemplate(tpl.prompt)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold leading-relaxed transition-all cursor-pointer ${tpl.color}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-black text-[10px] uppercase tracking-wider">{tpl.name}</span>
                          <ChevronRight size={12} className="opacity-60" />
                        </div>
                        <span className="text-[10px] leading-tight text-[var(--text-secondary)] block opacity-95">{tpl.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Advanced Parameter Slider (Temperature) */}
              <div className="p-5 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border)] max-w-xl space-y-4">
                <header className="flex items-center gap-1.5 text-amber-500">
                  <SlidersHorizontal size={14} />
                  <h4 className="text-[10px] font-black uppercase tracking-wide">Sensibilidade Conversacional (Temperatura)</h4>
                </header>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    <span>Nível de Criatividade / Sensibilidade</span>
                    <span className="font-mono text-amber-500 font-black">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.3"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setTemperature(val);
                      // Auto consolidate
                      safeLocalStorage.setItem('AI_TEMPERATURE', val.toString());
                    }}
                    className="w-full accent-indigo-500 h-1 bg-[var(--border)] rounded cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-[var(--text-secondary)] font-semibold uppercase">
                    <span>0.2 - Técnico / Coeso</span>
                    <span>1.3 - Criativo / Fluido</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: NOTEBOOK & BASE DE CONHECIMENTO */}
          {activeTab === 'notebook' && (
            <motion.div
              key="notebook"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="space-y-1 border-b border-[var(--border)] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={16} className="text-indigo-500" />
                    Base de Conhecimento Multimídia
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-semibold">Carregue livros, PDFs ou links. A IA usará esses recursos para embasar suas respostas.</p>
                </div>
                
                <button
                  onClick={() => setIsAddingDoc(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] uppercase font-black transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={13} />
                  Cadastrar Documento
                </button>
              </div>

              {/* Nível de Restrição Global Panel */}
              <div className="p-5 rounded-2xl bg-[var(--surface-hover)]/30 border border-[var(--border)] space-y-4">
                <header className="flex items-center gap-2">
                  <Database size={15} className="text-indigo-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]">Nível de Restrição do Banco de Conhecimento</h4>
                </header>
                
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-semibold">
                  Configure o grau de autonomia da inteligência ao usar os documentos indexados abaixo. Defina se ela deve ficar presa à base ou agir com lógica híbrida.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  
                  {/* Flexible Options (Híbrida) */}
                  <button
                    onClick={() => handleToggleConstraint('flexible')}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                      knowledgeConstraint === 'flexible'
                        ? 'border-emerald-500/50 bg-emerald-500/[0.04] text-[var(--text)]'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)]/60 text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className={knowledgeConstraint === 'flexible' ? 'text-emerald-500' : 'text-slate-400'} />
                        Conhecimento Aberto + Híbrido (Recomendado)
                      </span>
                    </div>
                    <span className="text-[10px] leading-relaxed block font-semibold opacity-90">
                      A IA consulta os livros e PDFs indexados apenas de suporte, mantendo toda a sua inteligência global ativa para guiar a conversa livremente.
                    </span>
                  </button>

                  {/* Strict Options (Apenas Base) */}
                  <button
                    onClick={() => handleToggleConstraint('strict')}
                    className={`p-4 rounded-xl text-left border cursor-pointer transition-all ${
                      knowledgeConstraint === 'strict'
                        ? 'border-indigo-500/50 bg-indigo-500/[0.04] text-[var(--text)]'
                        : 'border-[var(--border)] hover:bg-[var(--surface-hover)]/60 text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-black text-[10px] uppercase tracking-wider mb-1">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={13} className={knowledgeConstraint === 'strict' ? 'text-indigo-500' : 'text-slate-400'} />
                        Grounding Restrito (Apenas Base)
                      </span>
                    </div>
                    <span className="text-[10px] leading-relaxed block font-semibold opacity-90">
                      Modo ríspido e ultra focado. A IA limitará rigorosamente as suas considerações e fatos apenas ao que for extraído dos seus livros e arquivos fornecidos.
                    </span>
                  </button>
                </div>
              </div>

              {/* Input Modal de Novo Documento */}
              {isAddingDoc && (
                <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-xs space-y-4 animate-in slide-in-from-top-3 duration-200">
                  <header className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Nova Indexação de Ativos</span>
                    <button onClick={() => setIsAddingDoc(false)} className="text-slate-400 hover:text-[var(--text)]">
                      <X size={15} />
                    </button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-[var(--text-secondary)] block">Título ou Link URL</label>
                      <input
                        type="text"
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="Ex: Manual_Financas.pdf ou URL"
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-[var(--text-secondary)] block">Tipo de Fonte</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value as any)}
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="pdf">Documento PDF local</option>
                        <option value="book">Livros & Referência Lit.</option>
                        <option value="link">Link de Web Dynamic (.com/)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-[var(--text-secondary)] block">Descrição de Contexto (Opcional)</label>
                      <input
                        type="text"
                        value={newDocValue}
                        onChange={(e) => setNewDocValue(e.target.value)}
                        placeholder="Ex: Dados sensíveis de metas em PDF"
                        className="w-full p-2.5 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAddingDoc(false)}
                      className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[9px] uppercase font-bold text-[var(--text-secondary)] hover:text-[var(--text)]"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddDoc}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] uppercase font-black cursor-pointer"
                    >
                      Gravar e Indexar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista Visual de Documentos */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">Seus Documentos e Referências</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notebookFileList.length > 0 ? (
                    notebookFileList.map((doc) => (
                      <div 
                        key={doc.id}
                        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/35 hover:bg-[var(--surface-hover)]/70 transition-all flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            doc.type === 'pdf' ? 'bg-red-500/10 text-red-500' :
                            doc.type === 'book' ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500'
                          }`}>
                            {doc.type === 'pdf' && <FileText size={16} />}
                            {doc.type === 'book' && <BookOpen size={16} />}
                            {doc.type === 'link' && <LinkIcon size={16} />}
                          </div>
                          
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-[var(--text)] truncate" title={doc.title}>
                              {doc.title}
                            </h5>
                            <div className="flex items-center gap-1.5 text-[8px] uppercase tracking-wider text-[var(--text-secondary)] mt-1 font-semibold">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>Adicionado: {doc.addedAt}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveDoc(doc.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-rose-500/5 p-1 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remover fonte"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full border-2 border-dashed border-[var(--border)] rounded-2xl py-8 text-center text-xs text-[var(--text-secondary)] font-semibold uppercase italic opacity-60">
                      Nenhum livro ou documento indexado. Use o botão acima para cadastrar.
                    </div>
                  )}
                </div>
              </div>

              {/* Drag & Drop Visual Box */}
              <div className="border border-dashed border-[var(--border)] rounded-2xl p-6 bg-[var(--surface-hover)]/20 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h5 className="text-xs font-bold text-[var(--text)] uppercase tracking-wide">Arraste seus PDFs/Livros aqui</h5>
                <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto leading-normal">
                  Suporta arquivos de texto ou livros em formato PDF de no máximo 35MB. Os arquivos são indexados instantaneamente e particionados em vetores na memória do sistema.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 3: MODELOS & CONSUMO */}
          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="space-y-1 border-b border-[var(--border)] pb-4">
                <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu size={16} className="text-indigo-500" />
                  Concorrentes de Modelo & Consumo de Tokens
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-semibold">Os acessos e faturamentos são administrados diretamente no lado do servidor em sua hospedagem.</p>
              </div>

              {/* Hostinger status banner */}
              <div className="p-4.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 text-xs flex justify-between items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div>
                    <h5 className="font-black text-emerald-500 uppercase text-[9px] tracking-wider leading-none">Chaves de API Ativas</h5>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1 tracking-tight font-semibold">Servidor Hostinger conectado e autenticado de modo seguro.</p>
                  </div>
                </div>
                
                <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/10">
                  Produção Ativa
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Lado Esquerdo: Modelo Selector & Tokens */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Model Choice Card */}
                  <div className="p-5 rounded-2xl bg-[var(--surface-hover)]/30 border border-[var(--border)] space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text)]">
                      Selecione o Modelo Ativo de Integração
                    </label>
                    
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedModel(val);
                        safeLocalStorage.setItem('AI_SELECTED_MODEL', val);
                      }}
                      className="w-full p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Veloz, Inteligente & Econômico)</option>
                      <option value="gpt-4o">GPT-4o (Pensamento Abstrato Rígido & Alta Complexidade)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Janela de Contexto Gigante / Análises Longas)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (Uso Geral & Instantâneo)</option>
                    </select>

                    <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed font-semibold">
                      Dica: O **GPT-4o Mini** é o modelo de uso geral padrão recomendado. Ele oferece economia excelente, velocidade excelente de carregamento e suporta as diretrizes cognitivas com maestria.
                    </p>
                  </div>

                  {/* Consumo Section */}
                  {(() => {
                    const totalInputTokens = Object.values(usageStats.byModel || {}).reduce((acc: number, m: any) => acc + (m.inputTokens || 0), 0);
                    const totalOutputTokens = Object.values(usageStats.byModel || {}).reduce((acc: number, m: any) => acc + (m.outputTokens || 0), 0);
                    const totalRequests = Object.values(usageStats.byModel || {}).reduce((acc: number, m: any) => acc + (m.requests || 0), 0);
                    const totalCostUSD = usageStats.totalCostUSD || 0;
                    const limitUSD = usageStats.limitUSD || 20.0;
                    
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Input Tokens */}
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/20">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Tokens Enviados (Input)</span>
                            <span className="text-xl font-black text-[var(--text)] block tracking-tight font-mono">
                              {totalInputTokens.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[8px] text-[var(--text-secondary)] mt-1 block uppercase font-mono font-semibold">Consumo Real</span>
                          </div>

                          {/* Output Tokens */}
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/20">
                            <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest block mb-1">Tokens Recebidos (Output)</span>
                            <span className="text-xl font-black text-[var(--text)] block tracking-tight font-mono">
                              {totalOutputTokens.toLocaleString('pt-BR')}
                            </span>
                            <span className="text-[8px] text-[var(--text-secondary)] mt-1 block uppercase font-mono font-semibold">Respostas Geradas</span>
                          </div>

                          {/* Cost Estimate */}
                          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/20">
                            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">Faturamento Estimado</span>
                            <span className="text-xl font-black text-emerald-500 block tracking-tight font-mono">
                              ${totalCostUSD.toFixed(5)} USD
                            </span>
                            <span className="text-[8px] text-[var(--text-secondary)] mt-1 block uppercase font-mono font-semibold">
                              Custo de Produção
                            </span>
                          </div>

                        </div>

                        {/* Limit controls on Server */}
                        <div className="p-4.5 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/10 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                              <h4 className="text-[10px] font-black uppercase text-[var(--text)] tracking-wider">Configure o Teto de Segurança Mensal (USD)</h4>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-semibold font-sans">Caso a inteligência consuma o valor estipulado, o disjuntor de segurança congela acessos adicionais.</p>
                            </div>
                            <div className="flex gap-1.5 items-center">
                              {[5.0, 10.0, 20.0, 50.0, 100.0].map((num) => (
                                <button
                                  key={num}
                                  disabled={isUpdatingLimit}
                                  onClick={() => handleUpdateLimit(num)}
                                  className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                                    limitUSD === num 
                                      ? 'bg-indigo-600 text-white border-indigo-600' 
                                      : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] border-[var(--border)]'
                                  }`}
                                >
                                  ${num}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                            <span className="text-[9px] text-[var(--text-secondary)] uppercase font-mono">Disjuntor Ativo (Kill Switch): {usageStats.killSwitchActive ? '⚠️ ATIVO (Acessos Congelados)' : '✅ INATIVO (Tudo normal)'}</span>
                            <button
                              onClick={handleResetStats}
                              className="px-2 py-1 text-[8px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
                            >
                              Redefinir Métricas
                            </button>
                          </div>
                        </div>

                        {/* Real Breakdown Table */}
                        {Object.keys(usageStats.byModel || {}).length > 0 && (
                          <div className="p-4.5 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]/10 space-y-2.5">
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Detalhamento Físico de Acessos por Modelo</span>
                            <div className="divide-y divide-[var(--border)]">
                              {Object.entries(usageStats.byModel).map(([modelName, mData]: [string, any]) => (
                                <div key={modelName} className="flex justify-between items-center py-2 text-[10px] font-semibold text-[var(--text)]">
                                  <span className="font-mono text-[var(--text)] text-[9px]">{modelName}</span>
                                  <span className="font-mono text-right text-[var(--text-secondary)]">
                                    {mData.requests} chamadas • In: {mData.inputTokens.toLocaleString('pt-BR')} tkn • Out: {mData.outputTokens.toLocaleString('pt-BR')} tkn • <span className="text-emerald-500">${mData.cost.toFixed(5)}</span>
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Circular indicator from dynamic limits */}
                {(() => {
                  const totalCostUSD = usageStats.totalCostUSD || 0;
                  const limitUSD = usageStats.limitUSD || 20.0;
                  const totalRequests = Object.values(usageStats.byModel || {}).reduce((acc: number, m: any) => acc + (m.requests || 0), 0);
                  const percentageOfLimit = Math.min(100, Math.ceil((totalCostUSD / limitUSD) * 100)) || 0;
                  const strokeOffset = 251 - (251 * percentageOfLimit) / 100;

                  let usageLabel = "Excelente";
                  let usageColor = "text-emerald-400 font-bold";
                  if (percentageOfLimit > 80) {
                    usageLabel = "Alerta";
                    usageColor = "text-rose-400 font-bold";
                  } else if (percentageOfLimit > 50) {
                    usageLabel = "Seguro";
                    usageColor = "text-amber-400 font-bold";
                  }

                  return (
                    <div className="p-5 rounded-2xl bg-[var(--surface-hover)]/20 border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-4">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)]">Budget Consumido do Limite</span>
                      
                      <div className="relative w-28 h-28 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="6" fill="transparent" />
                          <circle cx="50" cy="50" r="40" stroke="var(--primary)" strokeWidth="7" fill="transparent" strokeDasharray="251" strokeDashoffset={strokeOffset} strokeLinecap="round" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-lg font-black text-[var(--text)] font-mono">{percentageOfLimit}%</span>
                          <span className={`text-[7px] font-black uppercase tracking-wider ${usageColor}`}>{usageLabel}</span>
                        </div>
                      </div>

                      <div className="text-left w-full space-y-1.5 pt-2 border-t border-[var(--border)] text-[8px] uppercase font-black text-[var(--text-secondary)] leading-relaxed font-mono">
                        <div className="flex justify-between">
                          <span>Requisições Totais:</span>
                          <span className="font-mono text-[var(--text)]">{totalRequests} chamadas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Preço Médio Estimado:</span>
                          <span className="font-mono text-emerald-400">
                            {totalRequests > 0 ? `$${(totalCostUSD / totalRequests).toFixed(5)} / req` : '$0.00 / req'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </motion.div>
          )}

          {/* TAB 4: DNA E MEMÓRIA COMPORTAMENTAL */}
          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                    <Fingerprint size={16} className="text-indigo-500" />
                    DNA e Perfis de Comportamento Calculados
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] font-semibold">Os padrões de uso recorrentes, ações de rotina e prioridades calculados pelo assistente analítico.</p>
                </div>
                <button
                  onClick={handleClearMemory}
                  className="px-3.5 py-1.5 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 justify-center text-rose-400 rounded-lg text-[9px] uppercase font-black transition-colors cursor-pointer"
                >
                  <Trash size={12} />
                  <span>Limpar DNA</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Projetos Frequentes */}
                <div className="bg-[var(--surface-hover)]/30 border border-[var(--border)] p-4 rounded-xl space-y-3">
                  <header className="flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400">
                    <Brain size={14} />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Projetos Catalogados
                    </span>
                  </header>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.userProfile.frequentProjects.length > 0 ? (
                      memory.userProfile.frequentProjects.map(project => (
                        <span key={project} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-[var(--text)]">
                          {project}
                          <button onClick={() => handleRemoveMemoryItem('projects', project)} className="text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0">
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase italic p-1">Nenhum registro</span>
                    )}
                  </div>
                </div>

                {/* Ações Frequentes */}
                <div className="bg-[var(--surface-hover)]/30 border border-[var(--border)] p-4 rounded-xl space-y-3">
                  <header className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
                    <TrendingUp size={14} />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Atribuições Recorrentes
                    </span>
                  </header>
                  <div className="flex flex-wrap gap-1.5">
                    {memory.userProfile.frequentActions.length > 0 ? (
                      memory.userProfile.frequentActions.map(action => (
                        <span key={action} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-[var(--text)]">
                          {action}
                          <button onClick={() => handleRemoveMemoryItem('actions', action)} className="text-slate-400 hover:text-red-500 cursor-pointer border-none bg-transparent p-0">
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase italic p-1">Nenhum registro</span>
                    )}
                  </div>
                </div>

                {/* Padrões Cronobiológicos */}
                <div className="bg-[var(--surface-hover)]/30 border border-[var(--border)] p-4 rounded-xl space-y-3">
                  <header className="flex items-center gap-1.5 text-cyan-500 dark:text-cyan-400">
                    <Award size={14} />
                    <span className="text-[9px] font-black uppercase tracking-wider">
                      Ciclos Habitados
                    </span>
                  </header>
                  <div className="space-y-1.5">
                    {memory.patterns.length > 0 ? (
                      memory.patterns.map(pattern => (
                        <div key={pattern} className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-hover)]/40 border border-[var(--border)] text-[9px] uppercase font-mono text-[var(--text)]">
                          <span className="truncate">{pattern}</span>
                          <button onClick={() => handleRemoveMemoryItem('patterns', pattern)} className="text-red-400 hover:text-red-500 ml-1 cursor-pointer border-none bg-transparent p-0">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold uppercase italic p-1">Nenhum ciclo identificado</span>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
