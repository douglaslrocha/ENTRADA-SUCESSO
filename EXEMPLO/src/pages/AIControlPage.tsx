import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Settings, 
  Book, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  ChevronRight,
  Database,
  Zap,
  Activity
} from 'lucide-react';
import { memoryStore, MemoryData } from '../core/memoryStore';
import { trainingEngine, Rule } from '../core/trainingEngine';
import { notebookManager } from '../core/notebookContext';
import { safeLocalStorage } from '../utils/storage';

interface AIControlPageProps {
  onBack: () => void;
}

export const AIControlPage: React.FC<AIControlPageProps> = ({ onBack }) => {
  const [memory, setMemory] = useState<MemoryData>(memoryStore.getMemory());
  const [rules, setRules] = useState<Rule[]>(trainingEngine.getRules());
  const [notebook, setNotebook] = useState<string>(notebookManager.getContext().replace('### CONTEXTO DINÂMICO (LLM NOTEBOOK)\n- ', '').replace('\n', ''));
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    trigger: '',
    action: '',
    type: 'SOFT',
    priority: 5,
    enabled: true
  });

  // Refresh data
  const refreshData = () => {
    setMemory(memoryStore.getMemory());
    setRules(trainingEngine.getRules());
  };

  // Memory Actions
  const handleClearMemory = () => {
    if (window.confirm('Deseja realmente limpar toda a memória de longo prazo?')) {
      safeLocalStorage.removeItem('app_memory_v1');
      refreshData();
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
    refreshData();
  };

  // Rule Actions
  const handleAddRule = () => {
    if (newRule.trigger && newRule.action) {
      const rule: Rule = {
        id: `rule_${Date.now()}`,
        trigger: newRule.trigger as string,
        action: newRule.action as string,
        type: newRule.type as any,
        priority: Number(newRule.priority),
        enabled: true
      };
      trainingEngine.addRule(rule);
      setIsAddingRule(false);
      setNewRule({ trigger: '', action: '', type: 'SOFT', priority: 5, enabled: true });
      refreshData();
    }
  };

  const handleToggleRule = (id: string, enabled: boolean) => {
    trainingEngine.updateRule(id, { enabled: !enabled });
    refreshData();
  };

  const handleRemoveRule = (id: string) => {
    if (window.confirm('Remover esta regra?')) {
      trainingEngine.removeRule(id);
      refreshData();
    }
  };

  // Notebook Actions
  const handleSaveNotebook = () => {
    notebookManager.setContext(notebook);
    alert('Contexto do Notebook salvo com sucesso!');
  };

  const handleClearNotebook = () => {
    setNotebook('');
    notebookManager.clearContext();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 pb-24" style={{ color: 'var(--ink)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Brain size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Controle da IA</h1>
            <p className="text-sm opacity-60">Gerencie a memória, regras e o contexto dinâmico do sistema.</p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors"
        >
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Memória (DNA) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-[var(--line)] bg-[var(--bg)] space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-500">
              <Database size={20} />
              <h2 className="text-xl font-semibold">Memória (DNA do Usuário)</h2>
            </div>
            <button 
              onClick={handleClearMemory}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Limpar Memória"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Projetos Frequentes */}
            <div>
              <h3 className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Projetos Frequentes</h3>
              <div className="flex flex-wrap gap-2">
                {memory.userProfile.frequentProjects.length > 0 ? (
                  memory.userProfile.frequentProjects.map(project => (
                    <span key={project} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/5 border border-indigo-500/20 text-sm">
                      {project}
                      <button onClick={() => handleRemoveMemoryItem('projects', project)} className="hover:text-red-500">
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm opacity-40 italic">Nenhum projeto registrado ainda.</p>
                )}
              </div>
            </div>

            {/* Ações Frequentes */}
            <div>
              <h3 className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Ações Frequentes</h3>
              <div className="flex flex-wrap gap-2">
                {memory.userProfile.frequentActions.length > 0 ? (
                  memory.userProfile.frequentActions.map(action => (
                    <span key={action} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-sm">
                      {action}
                      <button onClick={() => handleRemoveMemoryItem('actions', action)} className="hover:text-red-500">
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-sm opacity-40 italic">Nenhuma ação frequente detectada.</p>
                )}
              </div>
            </div>

            {/* Padrões Detectados */}
            <div>
              <h3 className="text-xs uppercase tracking-widest opacity-50 mb-2 font-bold">Padrões de Comportamento</h3>
              <div className="space-y-2">
                {memory.patterns.length > 0 ? (
                  memory.patterns.map(pattern => (
                    <div key={pattern} className="flex items-center justify-between p-3 rounded-xl bg-[var(--line)]/30 text-sm">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-indigo-500" />
                        {pattern}
                      </div>
                      <button onClick={() => handleRemoveMemoryItem('patterns', pattern)} className="text-red-500 opacity-0 hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm opacity-40 italic">Aguardando detecção de padrões...</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section 3: Notebook (Contexto Dinâmico) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl border border-[var(--line)] bg-[var(--bg)] space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-500">
              <Book size={20} />
              <h2 className="text-xl font-semibold">Notebook (Contexto Dinâmico)</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleClearNotebook}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Limpar Notebook"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={handleSaveNotebook}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors text-sm font-bold"
              >
                <Save size={16} />
                Salvar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm opacity-60">
              Defina instruções temporárias que a IA deve seguir imediatamente. 
              Ex: "Responda de forma curta", "Foque em marketing", "Use tom formal".
            </p>
            <textarea 
              value={notebook}
              onChange={(e) => setNotebook(e.target.value)}
              placeholder="Digite as instruções aqui..."
              className="w-full h-48 p-4 rounded-2xl bg-[var(--line)]/20 border border-[var(--line)] focus:outline-none focus:border-amber-500 transition-colors resize-none font-mono text-sm"
            />
          </div>
        </motion.div>

        {/* Section 2: Regras (Training) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 p-6 rounded-3xl border border-[var(--line)] bg-[var(--bg)] space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-500">
              <Zap size={20} />
              <h2 className="text-xl font-semibold">Regras de Treinamento (Training Engine)</h2>
            </div>
            <button 
              onClick={() => setIsAddingRule(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-bold"
            >
              <Plus size={16} />
              Nova Regra
            </button>
          </div>

          {isAddingRule && (
            <div className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50 ml-2">Gatilho (Intent)</label>
                  <input 
                    type="text" 
                    value={newRule.trigger}
                    onChange={(e) => setNewRule({...newRule, trigger: e.target.value})}
                    placeholder="Ex: create_task"
                    className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50 ml-2">Ação</label>
                  <input 
                    type="text" 
                    value={newRule.action}
                    onChange={(e) => setNewRule({...newRule, action: e.target.value})}
                    placeholder="Ex: FORCE_AUTO_EXECUTE"
                    className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50 ml-2">Tipo</label>
                  <select 
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value as any})}
                    className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="HARD">HARD (Execução Direta)</option>
                    <option value="SOFT">SOFT (Sugestão)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold opacity-50 ml-2">Prioridade</label>
                  <input 
                    type="number" 
                    value={newRule.priority}
                    onChange={(e) => setNewRule({...newRule, priority: Number(e.target.value)})}
                    className="w-full p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddingRule(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--line)] hover:bg-[var(--line)] transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddRule}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-bold"
                >
                  Salvar Regra
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50">Gatilho</th>
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50">Ação</th>
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50">Tipo</th>
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50 text-center">Prioridade</th>
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50 text-center">Status</th>
                  <th className="py-4 px-4 text-[10px] uppercase font-bold opacity-50 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? (
                  rules.map(rule => (
                    <tr key={rule.id} className="border-b border-[var(--line)]/50 hover:bg-[var(--line)]/10 transition-colors">
                      <td className="py-4 px-4 font-mono text-sm">{rule.trigger}</td>
                      <td className="py-4 px-4 text-sm opacity-80">{rule.action}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${rule.type === 'HARD' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          {rule.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-sm">{rule.priority}</td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => handleToggleRule(rule.id, rule.enabled)}
                          className={`w-10 h-5 rounded-full transition-colors relative ${rule.enabled ? 'bg-indigo-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${rule.enabled ? 'left-6' : 'left-1'}`} />
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleRemoveRule(rule.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center opacity-40 italic">Nenhuma regra configurada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
