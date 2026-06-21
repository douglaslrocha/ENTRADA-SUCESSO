export type RuleType = 'HARD' | 'SOFT';

export interface Rule {
  id: string;
  trigger: string; // Intent ou palavra-chave
  action: string;  // O que deve ser feito (ex: forçar intent ou adicionar sugestão)
  type: RuleType;
  priority: number;
  enabled: boolean;
}

let rules: Rule[] = [
  {
    id: 'rule_1',
    trigger: 'create_task',
    action: 'FORCE_AUTO_EXECUTE',
    type: 'HARD',
    priority: 10,
    enabled: true
  },
  {
    id: 'rule_2',
    trigger: 'financial_entry',
    action: 'SUGGEST_SAVINGS_TIPS',
    type: 'SOFT',
    priority: 5,
    enabled: true
  }
];

export const trainingEngine = {
  getRules(): Rule[] {
    return rules.filter(r => r.enabled).sort((a, b) => b.priority - a.priority);
  },

  addRule(rule: Rule) {
    rules.push(rule);
    console.log('[TrainingEngine] Regra adicionada:', rule);
  },

  updateRule(ruleId: string, updates: Partial<Rule>) {
    rules = rules.map(r => r.id === ruleId ? { ...r, ...updates } : r);
    console.log(`[TrainingEngine] Regra ${ruleId} atualizada.`);
  },

  removeRule(ruleId: string) {
    rules = rules.filter(r => r.id !== ruleId);
    console.log(`[TrainingEngine] Regra ${ruleId} removida.`);
  },

  /**
   * Aplica regras HARD antes da decisão final.
   * Pode modificar o comportamento do DecisionEngine.
   */
  applyHardRules(aiResponse: any): any {
    const activeRules = this.getRules().filter(r => r.type === 'HARD');
    const matchingRule = activeRules.find(r => r.trigger === aiResponse.intent);

    if (matchingRule) {
      console.log(`[TrainingEngine] Aplicando regra HARD: ${matchingRule.id}`);
      if (matchingRule.action === 'FORCE_AUTO_EXECUTE') {
        // Modifica a resposta para o DecisionEngine entender que deve executar
        return {
          ...aiResponse,
          forceExecute: true
        };
      }
    }

    return aiResponse;
  },

  /**
   * Aplica regras SOFT para enriquecer a resposta com sugestões baseadas em treinamento.
   */
  applySoftRules(aiResponse: any): string[] {
    const activeRules = this.getRules().filter(r => r.type === 'SOFT');
    const matchingRules = activeRules.filter(r => r.trigger === aiResponse.intent);
    
    const extraSuggestions: string[] = [];
    
    matchingRules.forEach(rule => {
      console.log(`[TrainingEngine] Aplicando regra SOFT: ${rule.id}`);
      if (rule.action === 'SUGGEST_SAVINGS_TIPS') {
        extraSuggestions.push('Ver dicas de economia', 'Comparar com mês anterior');
      }
      // Adicionar mais lógicas de ação conforme necessário
    });

    return extraSuggestions;
  }
};
