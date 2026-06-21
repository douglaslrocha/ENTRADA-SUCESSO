import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Server, HardDrive, Sparkles, CheckCircle2, AlertCircle, HelpCircle, Settings, Activity, BrainCircuit, LineChart, Code, Info, ChevronRight, CornerDownRight } from 'lucide-react';

interface NodeStatus {
  state: 'functional' | 'partial' | 'mock';
  label: string;
}

interface MapNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  status: NodeStatus;
  children?: MapNode[];
}

const systemData: MapNode = {
  id: 'root',
  label: 'Organismo Douglas',
  icon: <BrainCircuit size={20} />,
  description: 'Sistema Unificado de Gestão Pessoal, Hábitos, Projetos de Vida e Planejamento.',
  status: { state: 'functional', label: 'Operacional' },
  children: [
    {
      id: 'projects',
      label: 'Objetivos e Metas',
      icon: <Settings size={18} />,
      description: 'Gestão de metas existenciais de curto, médio e longo prazo compartilhadas com painéis interativos.',
      status: { state: 'functional', label: 'Integrado' },
      children: [
        {
          id: 'proj-sync',
          label: 'Sincronização Cloud/Local',
          icon: <Server size={14} />,
          description: 'Metas e cronogramas salvos diretamente no banco de dados SQLite principal com sincronismo em tempo real.',
          status: { state: 'functional', label: 'Sincronizado' }
        },
        {
          id: 'proj-kanban',
          label: 'Quadro Dinâmico de Tarefas',
          icon: <Activity size={14} />,
          description: 'Quadro interativo para arrastar e avançar marcos, com salvamento automático local no navegador.',
          status: { state: 'functional', label: 'Operante' }
        }
      ]
    },
    {
      id: 'diary',
      label: 'Diário Pessoal',
      icon: <HardDrive size={18} />,
      description: 'Espaço íntimo de reflexão e registro cotidiano que mapeia o bem-estar e a cronobiologia do usuário.',
      status: { state: 'functional', label: 'Integrado' },
      children: [
        {
          id: 'diary-crud',
          label: 'Sincronização Cronológica',
          icon: <Server size={14} />,
          description: 'Lançamentos de diários e autoavaliações de postura gravados diretamente no SQLite com marcação temporal precisa.',
          status: { state: 'functional', label: 'Sincronizado' }
        },
        {
          id: 'diary-state',
          label: 'Indicadores de Postura',
          icon: <Sparkles size={14} />,
          description: 'Acompanhamento veloz de humor e sentimentos salvos no navegador para rápida renderização.',
          status: { state: 'functional', label: 'Operante' }
        }
      ]
    },
    {
      id: 'workspaces',
      label: 'Workspaces e Documentos',
      icon: <Network size={18} />,
      description: 'Módulo tático para segregar rotinas em pastas exclusivas de documentação prática.',
      status: { state: 'partial', label: 'Híbrido' },
      children: [
        {
          id: 'ws-cache',
          label: 'Árvore de Pastas',
          icon: <Code size={14} />,
          description: 'Estruturação lógica de pastas e documentos carregada dinamicamente com base em cache rápido do navegador.',
          status: { state: 'partial', label: 'Híbrido' }
        }
      ]
    },
    {
      id: 'dashboard',
      label: 'Dashboard e Insights',
      icon: <LineChart size={18} />,
      description: 'Painéis analíticos unificados com compilação de hábitos, finanças e previsões de rotina.',
      status: { state: 'partial', label: 'Em Ampliação' },
      children: [
        {
          id: 'dash-metrics',
          label: 'Métricas de Sincronia',
          icon: <Sparkles size={14} />,
          description: 'Calcula seu alinhamento com posturas no diário e conquistas financeiras em tempo real no dispositivo.',
          status: { state: 'functional', label: 'Ativo' }
        },
        {
          id: 'dash-ai',
          label: 'Estímulo de IA Amparadora',
          icon: <Sparkles size={14} />,
          description: 'Assistência empática de IA que extrai inteligência de suas descrições para resumos de rotina.',
          status: { state: 'partial', label: 'Em Ampliação' }
        }
      ]
    },
    {
      id: 'cortes',
      label: 'Finanças e Despesas',
      icon: <Activity size={18} />,
      description: 'Gestão completa do fluxo financeiro, corte de excessos supérfluos e mapeamento patrimonial.',
      status: { state: 'functional', label: 'Integrado' },
      children: [
        {
          id: 'cortes-sync',
          label: 'Gestão de Lançamentos',
          icon: <Server size={14} />,
          description: 'Receitas e investimentos gravados diretamente no banco de dados com categorização automática.',
          status: { state: 'functional', label: 'Sincronizado' }
        },
        {
          id: 'cortes-ai',
          label: 'Projeção de Sobrevivência',
          icon: <Sparkles size={14} />,
          description: 'Cálculo de metas de economia e custo mínimo para orientar aportes conscientes.',
          status: { state: 'functional', label: 'Operante' }
        }
      ]
    }
  ]
};

const getStatusColor = (state: string) => {
  switch (state) {
    case 'functional': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'partial': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'mock': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    default: return 'text-[var(--text-secondary)] bg-[var(--surface-hover)] border-[var(--border)]';
  }
};

const getStatusIcon = (state: string) => {
  switch (state) {
    case 'functional': return <CheckCircle2 size={12} className="text-emerald-500" />;
    case 'partial': return <AlertCircle size={12} className="text-amber-500" />;
    case 'mock': return <HelpCircle size={12} className="text-indigo-500" />;
    default: return null;
  }
};

interface TreeNodeProps {
  node: MapNode;
  onSelect: (node: MapNode) => void;
  selectedId: string | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onSelect, selectedId }) => {
  const isSelected = selectedId === node.id;
  
  return (
    <div className="relative flex items-center">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(node)}
        className={`relative z-10 cursor-pointer min-w-[200px] max-w-[220px] p-4 rounded-2xl border backdrop-blur-md transition-all duration-300
          ${isSelected ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-[0_0_20px_rgba(66,133,244,0.3)]' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]'}
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : getStatusColor(node.status.state)}`}>
            {node.icon}
          </div>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider
            ${isSelected ? 'bg-white/20 border-white/30 text-white' : getStatusColor(node.status.state)}
          `}>
            {!isSelected && getStatusIcon(node.status.state)}
            <span>{node.status.label}</span>
          </div>
        </div>
        
        <h3 className={`font-bold text-xs mb-1 ${isSelected ? 'text-white' : 'text-[var(--text)]'}`}>{node.label}</h3>
        <p className={`text-[10px] leading-snug ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
          {node.description.length > 55 ? `${node.description.substring(0, 52)}...` : node.description}
        </p>
      </motion.div>

      {/* Children connector lines */}
      {node.children && node.children.length > 0 && (
        <div className="flex items-center">
          <div className="w-8 h-[2px] bg-[var(--border)]" />
          <div className="flex flex-col gap-6 py-4 border-l-2 border-[var(--border)] pl-8 relative">
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Horizontal branch line to child */}
                <div className="absolute -left-8 top-1/2 w-8 h-[2px] bg-[var(--border)]" />
                <TreeNode 
                  node={child} 
                  onSelect={onSelect} 
                  selectedId={selectedId} 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export function SystemMap() {
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(systemData);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-visible">
      
      {/* Esquerda: Grafico (para Desktop) ou Seletor Limpo (para Mobile) */}
      <div className="flex-1 flex flex-col min-h-[400px]">
        
        {/* DESKTOP VIEW: Graphical Graph */}
        <div className="hidden md:block flex-1 overflow-auto rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-8 relative hidden-scrollbar select-none">
          <div className="absolute top-6 left-8 flex items-center gap-3">
            <Network className="text-[var(--primary)]" size={24} />
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Estrutura Integrada do Organismo</h2>
              <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Grafo de Sincronismo dos Módulos</p>
            </div>
          </div>
          
          <div className="min-w-max pt-20 pb-10 flex items-center justify-start">
            <TreeNode 
              node={systemData} 
              onSelect={setSelectedNode} 
              selectedId={selectedNode?.id || null} 
            />
          </div>
        </div>

        {/* MOBILE VIEW: Clean vertical interactive list */}
        <div className="md:hidden flex-1 flex flex-col gap-3 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
          <header className="flex items-center gap-2 mb-2 p-1">
            <Network className="text-[var(--primary)]" size={18} />
            <div>
              <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text)]">Módulos do Sistema</h2>
              <p className="text-[9px] text-[var(--text-secondary)] uppercase">Toque para ver detalhes técnicos</p>
            </div>
          </header>

          <button
            onClick={() => setSelectedNode(systemData)}
            className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all ${
              selectedNode?.id === 'root' 
                ? 'bg-[var(--primary)]/5 border-[var(--primary)]' 
                : 'bg-[var(--bg)] border-[var(--border)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-[var(--primary)] text-white">
                {systemData.icon}
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary)]">NÚCLEO PRINCIPAL</span>
                <h4 className="text-xs font-bold text-[var(--text)]">{systemData.label}</h4>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--muted)]" />
          </button>

          <div className="space-y-2 mt-2 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
            {systemData.children?.map((child) => (
              <div key={child.id} className="space-y-1">
                <button
                  onClick={() => setSelectedNode(child)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                    selectedNode?.id === child.id 
                      ? 'bg-[var(--primary)]/5 border-[var(--primary)]' 
                      : 'bg-[var(--bg)] border-[var(--border)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${getStatusColor(child.status.state)}`}>
                      {child.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text)]">{child.label}</h4>
                      <p className="text-[9px] text-[var(--text-secondary)] uppercase font-semibold">{child.status.label}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[var(--muted)]" />
                </button>

                {selectedNode?.id === child.id && child.children && (
                  <div className="pl-4 space-y-1 border-l border-[var(--border)] ml-5 my-1.5 animate-in slide-in-from-left-2 duration-200">
                    {child.children.map((subChild) => (
                      <button
                        key={subChild.id}
                        onClick={() => setSelectedNode(subChild)}
                        className={`w-full text-left p-2.5 rounded-lg border flex items-center gap-2 transition-all ${
                          selectedNode?.id === subChild.id 
                            ? 'bg-[var(--primary)]/5 border-[var(--primary)]' 
                            : 'bg-transparent border-transparent'
                        }`}
                      >
                        <CornerDownRight size={12} className="text-[var(--primary)]" />
                        <div>
                          <h5 className="text-[11px] font-bold text-[var(--text)]">{subChild.label}</h5>
                          <span className="text-[8px] uppercase text-[var(--text-secondary)] font-mono">{subChild.status.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Direita: Painel Lateral de Inspeção */}
      <aside className="w-full lg:w-[320px] shrink-0 flex flex-col gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 flex-1 flex flex-col relative overflow-hidden">
          {/* Decoração sutil de fundo no painel */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary)] opacity-5 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6 flex items-center gap-2 border-b border-[var(--border)] pb-2">
            <Info size={14} className="text-[var(--primary)]" />
            Detalhes do Elemento
          </h3>

          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${getStatusColor(selectedNode.status.state)}`}>
                    {selectedNode.icon}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text)] tracking-tight leading-snug">{selectedNode.label}</h2>
                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusColor(selectedNode.status.state)}`}>
                      {getStatusIcon(selectedNode.status.state)}
                      {selectedNode.status.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] mb-1">Finalidade Técnico-Operacional</h4>
                    <p className="text-xs text-[var(--text)] leading-relaxed font-semibold">
                      {selectedNode.description}
                    </p>
                  </div>

                  {selectedNode.status.state === 'functional' && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <h4 className="text-xs font-bold text-emerald-500 flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} /> Ativo e Conectado
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        Este módulo está salvando informações ativamente no banco de dados e as operações assíncronas estão operando com êxito.
                      </p>
                    </div>
                  )}

                  {selectedNode.status.state === 'partial' && (
                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <h4 className="text-xs font-bold text-amber-500 flex items-center gap-2 mb-1">
                        <AlertCircle size={14} /> Operação Segura Local
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        Este módulo processa e sincroniza dados reais, oferecendo alta performance local e resiliência offline em seu navegador.
                      </p>
                    </div>
                  )}

                  {selectedNode.status.state === 'mock' && (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                      <h4 className="text-xs font-bold text-indigo-500 flex items-center gap-2 mb-1">
                        <Sparkles size={14} /> Em Ampliação Operacional
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        Esta funcionalidade é totalmente utilizável de forma local no seu navegador e está sendo ampliada com integrações e novas conexões estruturadas nativas.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center px-4 opacity-50">
                <p className="text-xs text-[var(--text-secondary)]">Toque ou clique em um elemento da árvore ao lado para conferir seus detalhes técnicos.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Futuras Extensões - Organizado discretamente no fim do Eixo de Integridade */}
        <details className="mt-2 p-4 rounded-2xl bg-[var(--surface-hover)]/40 border border-[var(--border)] text-xs text-[var(--text-secondary)] transition-all group shadow-sm cursor-pointer">
          <summary className="font-bold flex items-center justify-between select-none">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[9px] font-black text-[var(--text)]">
              <Sparkles size={11} className="text-amber-500 animate-pulse" />
              <span>Futuras Extensões (Roadmap)</span>
            </span>
          </summary>
          <div className="mt-3 space-y-3 font-semibold text-[11px] leading-relaxed border-t border-[var(--border)] pt-3 animate-in fade-in duration-250">
            <div>
              <p className="font-bold text-[var(--text)]">Fluxos Automáticos (Automação Tática)</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Gatilhos autônomos para agendar alertas com base nas posturas do seu diário pessoal.</p>
            </div>
            <div className="border-t border-[var(--border)]/60 pt-2.5">
              <p className="font-bold text-[var(--text)]">Integrações de API (Conectores Cloud)</p>
              <p className="text-[10px] text-[var(--text-secondary)]">Integração estrita com Slack, Google Calendar, Discord e Notion para exportações.</p>
            </div>
          </div>
        </details>
      </aside>
    </div>
  );
}
