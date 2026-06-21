export interface DecisionResult {
  shouldExecute: boolean;
  requiresConfirmation: boolean;
  reason: string;
}

export const decisionEngine = {
  decide(aiResponse: any): DecisionResult {
    const { intent, entities } = aiResponse;

    console.log(`[DecisionEngine] Avaliando intent: ${intent}`, entities);

    // 0. Verificar se há uma regra HARD forçando a execução
    if (aiResponse.forceExecute) {
      return {
        shouldExecute: true,
        requiresConfirmation: false,
        reason: 'Execução forçada por regra HARD do TrainingEngine.'
      };
    }

    // 1. Regras de Decisão
    switch (intent) {
      // SAFE: Executar automaticamente
      case 'create_task':
      case 'log_activity':
      case 'financial_entry':
        return {
          shouldExecute: true,
          requiresConfirmation: false,
          reason: 'Ação de baixo risco ou solicitada pelo usuário para execução automática.'
        };

      // CONFIRM: Pedir confirmação
      case 'create_document':
        // Documentos longos ou importantes devem ser confirmados
        return {
          shouldExecute: false,
          requiresConfirmation: true,
          reason: 'Criação de documento requer revisão e confirmação do usuário.'
        };

      case 'create_project':
        return {
          shouldExecute: false,
          requiresConfirmation: true,
          reason: 'Novos projetos são ações estruturais e requerem confirmação.'
        };

      // BLOCK: Não executar
      case 'unknown':
      case 'general':
      default:
        return {
          shouldExecute: false,
          requiresConfirmation: false,
          reason: 'Nenhuma ação automática definida para este contexto.'
        };
    }
  }
};
