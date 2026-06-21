import { CanvasResponse, IntentType } from '../types';

export const aiParser = {
  parseAIResponse(text: string): CanvasResponse {
    console.log('[AIParser] Iniciando parsing da resposta:', text);

    const lowerText = text.toLowerCase();
    let intent: IntentType = 'chat';

    // Detecção básica de intenção (temporário)
    if (lowerText.includes('roteiro') || lowerText.includes('documento') || lowerText.includes('escrever')) {
      intent = 'document';
    } else if (lowerText.includes('tarefa') || lowerText.includes('lembrar') || lowerText.includes('agendar')) {
      intent = 'task';
    } else if (lowerText.includes('treino') || lowerText.includes('academia') || lowerText.includes('atividade')) {
      intent = 'activity_log';
    } else if (lowerText.includes('gastei') || lowerText.includes('recebi') || lowerText.includes('financeiro')) {
      intent = 'finance';
    } else if (lowerText.includes('projeto') || lowerText.includes('novo projeto')) {
      intent = 'project';
    } else if (lowerText.includes('quanto') || lowerText.includes('consultar') || lowerText.includes('saldo')) {
      intent = 'query';
    } else if (lowerText.includes('fluxo') || lowerText.includes('lote') || lowerText.includes('sequência')) {
      intent = 'flow';
    }

    // Estrutura básica de resposta para o CanvasOverlay
    const response: CanvasResponse = {
      intent,
      content: text,
      suggestions: this.generateSuggestions(intent),
      render: {
        type: 'card',
        props: {
          title: this.getIntentTitle(intent),
          description: text.substring(0, 150) + (text.length > 150 ? '...' : '')
        }
      }
    };

    // Se for documento, preparamos os dados para o ActionEngine
    if (intent === 'document') {
      response.data = {
        title: 'Documento Sugerido',
        content: text
      };
    }

    console.log('[AIParser] Resposta parseada:', response);
    return response;
  },

  getIntentTitle(intent: IntentType): string {
    const titles: Record<IntentType, string> = {
      task: 'Nova Tarefa Detectada',
      project: 'Novo Projeto Detectado',
      document: 'Sugestão de Documento',
      finance: 'Registro Financeiro',
      activity_log: 'Log de Atividade',
      query: 'Consulta de Dados',
      flow: 'Fluxo de Trabalho',
      chat: 'Assistente Pessoal',
      create_task: 'Nova Tarefa Detectada',
      create_project: 'Novo Projeto Detectado',
      create_document: 'Sugestão de Documento',
      financial_entry: 'Registro Financeiro',
      log_activity: 'Log de Atividade',
      general: 'Assistente Pessoal'
    };
    return titles[intent] || 'Assistente Pessoal';
  },

  generateSuggestions(intent: IntentType): string[] {
    const suggestions: Record<IntentType, string[]> = {
      task: ['Criar tarefa', 'Ver minhas tarefas', 'Lembrar mais tarde'],
      project: ['Criar projeto', 'Listar projetos', 'Adicionar etapa'],
      document: ['Salvar como documento', 'Editar conteúdo', 'Criar roteiro'],
      finance: ['Registrar gasto', 'Ver saldo', 'Categorizar'],
      activity_log: ['Confirmar log', 'Ver histórico', 'Adicionar nota'],
      query: ['Ver detalhes', 'Exportar dados', 'Nova consulta'],
      flow: ['Executar fluxo', 'Ver etapas', 'Cancelar'],
      chat: ['Como posso ajudar?', 'O que você sabe fazer?', 'Criar tarefa'],
      create_task: ['Criar tarefa', 'Ver minhas tarefas', 'Lembrar mais tarde'],
      create_project: ['Criar projeto', 'Listar projetos', 'Adicionar etapa'],
      create_document: ['Salvar como documento', 'Editar conteúdo', 'Criar roteiro'],
      financial_entry: ['Registrar gasto', 'Ver saldo', 'Categorizar'],
      log_activity: ['Confirmar log', 'Ver histórico', 'Adicionar nota'],
      general: ['Como posso ajudar?', 'O que você sabe fazer?', 'Criar tarefa']
    };
    return suggestions[intent] || ['Como posso ajudar?'];
  }
};
