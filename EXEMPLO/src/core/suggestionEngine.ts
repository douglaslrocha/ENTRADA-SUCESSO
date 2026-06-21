import { SessionState } from './sessionContext';
import { memoryStore } from './memoryStore';

/**
 * Motor de Sugestões Inteligentes.
 * Gera próximos passos baseados no contexto da sessão e na intenção atual.
 */
export const suggestionEngine = {
  generateSuggestions(aiResponse: any, sessionState: SessionState): string[] {
    const { intent } = aiResponse;
    const suggestions: string[] = [];
    const memory = memoryStore.getMemory();

    console.log(`[SuggestionEngine] Gerando sugestões para intent: ${intent}`);

    // 1. Sugestões Baseadas em Intent
    switch (intent) {
      case 'create_task':
        suggestions.push('Criar outra tarefa', 'Vincular a um projeto', 'Definir prioridade');
        break;

      case 'create_document':
        suggestions.push('Salvar documento', 'Exportar para PDF', 'Vincular a projeto');
        break;

      case 'log_activity':
        suggestions.push('Ver histórico de treinos', 'Registrar outra atividade', 'Definir meta diária');
        break;

      case 'financial_entry':
        suggestions.push('Ver saldo atual', 'Categorizar gasto', 'Adicionar nota fiscal');
        break;

      case 'create_project':
        suggestions.push('Adicionar primeira tarefa', 'Definir prazos', 'Convidar colaboradores');
        break;

      case 'query':
        suggestions.push('Exportar resultados', 'Nova consulta', 'Ver detalhes');
        break;

      default:
        // Sugestões genéricas baseadas no estado da sessão
        if (sessionState.status === 'awaiting_confirmation') {
          suggestions.push('Sim, confirmar', 'Não, cancelar');
        } else {
          suggestions.push('O que você pode fazer?', 'Ver minhas tarefas', 'Registrar gasto');
        }
    }

    // 2. Refinamento baseado no contexto histórico (exemplo simples)
    if (sessionState.lastIntent === 'create_project' && intent === 'create_task') {
      suggestions.unshift('Vincular ao projeto anterior');
    }

    // 3. Sugestões baseadas na Memória de Longo Prazo (DNA do Usuário)
    const profile = memory.userProfile;
    if (profile.frequentProjects.length > 0 && intent === 'create_task') {
      suggestions.push(`Vincular a ${profile.frequentProjects[0]}`);
    }

    if (profile.frequentActions.includes('Criação de roteiros/conteúdo') && intent === 'create_document') {
      suggestions.push('Adicionar ao canal do YouTube');
    }

    console.log('[SuggestionEngine] Sugestões geradas:', suggestions);
    return suggestions;
  }
};
