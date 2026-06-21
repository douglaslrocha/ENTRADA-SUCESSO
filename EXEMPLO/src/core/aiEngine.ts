import { aiProvider } from '../services/aiProvider';
import { SYSTEM_CONTEXT } from './aiContext';
import { dataContext } from './dataContext';
import { actionEngine, ActionResult } from './actionEngine';
import { queryEngine, QueryResult } from './queryEngine';
import { decisionEngine, DecisionResult } from './decisionEngine';
import { sessionContext } from './sessionContext';
import { suggestionEngine } from './suggestionEngine';
import { memoryEngine } from './memoryEngine';
import { trainingEngine } from './trainingEngine';
import { notebookManager } from './notebookContext';

export interface AIProcessedResponse {
  text: string;
  intent: string;
  event?: string; // Novo campo para o Event Engine
  userInput?: string; // Original user message text
  entities: Record<string, any>;
  data?: any;
  blocks?: Array<{
    type: string;
    filters?: Record<string, any>;
    intent?: string;
    entities?: Record<string, any>;
  }>;
  suggestions: string[];
  actions: string[];
  ui: string | null;
  actionResult?: ActionResult | null;
  queryResult?: QueryResult | null;
  decision?: DecisionResult | null;
  forceExecute?: boolean;
  raw?: any;
}

/**
 * Tenta extrair um JSON válido de uma string que pode conter texto extra ou Markdown.
 */
const extractJSON = (text: string): any => {
  try {
    // 1. Tenta limpar blocos de código Markdown (```json ... ```)
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) cleanText = match[1];
    }

    // 2. Tenta parsear diretamente
    try {
      return JSON.parse(cleanText);
    } catch (e) {
      // 3. Tenta encontrar o primeiro { e o último }
      const start = cleanText.indexOf('{');
      const end = cleanText.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        const jsonStr = cleanText.substring(start, end + 1);
        return JSON.parse(jsonStr);
      }
      throw e;
    }
  } catch (e) {
    console.error('[AIEngine] Falha ao extrair JSON da resposta:', e);
    return null;
  }
};

/**
 * Normaliza a resposta para garantir que todos os campos obrigatórios existam e sejam válidos.
 */
const normalizeResponse = (data: any, originalText: string): AIProcessedResponse => {
  return {
    text: data?.text || originalText || "Processado com sucesso.",
    intent: data?.intent || "general",
    event: data?.event || null,
    entities: data?.entities || {},
    data: data?.data || null,
    blocks: Array.isArray(data?.blocks) ? data?.blocks : undefined,
    suggestions: Array.isArray(data?.suggestions) ? data?.suggestions : [],
    actions: Array.isArray(data?.actions) ? data?.actions : [],
    ui: data?.ui || null,
    raw: data
  };
};

export const aiEngine = {
  async interpret(message: string): Promise<AIProcessedResponse> {
    console.log('[AIEngine] Iniciando interpretação via Gemini para:', message);
    
    // 1. Coletar todos os contextos
    const longTermContext = memoryEngine.getRelevantContext();
    const notebookContext = notebookManager.getContext();
    const runtimeDataContext = dataContext.getPromptContext();
    
    const fullContext = `${SYSTEM_CONTEXT}\n\n${runtimeDataContext}\n\n${longTermContext}\n\n${notebookContext}`;
    
    const aiRawResponse = await aiProvider.sendToAI(message, fullContext);
    
    // 2. Tentar parsear o JSON (Gemini deve retornar JSON limpo)
    let parsedData: any;
    try {
      parsedData = JSON.parse(aiRawResponse);
    } catch (e) {
      console.warn('[AIEngine] JSON.parse falhou, tentando extração manual...', e);
      parsedData = extractJSON(aiRawResponse);
    }

    // 3. Normalizar a resposta
    let processedResponse = normalizeResponse(parsedData, aiRawResponse);
    processedResponse.userInput = message;
    
    // 4. Training Engine: Aplicar regras HARD
    processedResponse = trainingEngine.applyHardRules(processedResponse);

    return processedResponse;
  },

  async processMessage(message: string): Promise<AIProcessedResponse> {
    console.log('[AIEngine] Iniciando processamento de mensagem:', message);
    const lowerMessage = message.toLowerCase();

    // 1. Verificar se é uma confirmação de ação pendente
    if (sessionContext.isAwaitingConfirmation()) {
      const isPositive = lowerMessage.includes('sim') || lowerMessage.includes('pode') || lowerMessage.includes('confirmar') || lowerMessage.includes('ok');
      
      if (isPositive) {
        console.log('[AIEngine] Usuário confirmou ação pendente.');
        const pendingAction = sessionContext.getState().pendingAction;
        const actionResult = await actionEngine.executeAction(pendingAction);
        
        const response: AIProcessedResponse = {
          ...pendingAction,
          text: `Ação confirmada! ${actionResult?.message || 'Processado com sucesso.'}`,
          actionResult,
          suggestions: ['Ver detalhes', 'O que mais posso fazer?'],
          ui: 'card'
        };
        
        // Registrar interação na memória de longo prazo
        memoryEngine.registerInteraction(pendingAction, message);
        
        sessionContext.clearPendingAction();
        return response;
      } else {
        console.log('[AIEngine] Usuário cancelou ou ignorou confirmação.');
        sessionContext.clearPendingAction();
      }
    }

    try {
      // 2. Interpretar a mensagem
      let processedResponse = await this.interpret(message);

      // 3. Decision Engine: Decidir o que fazer com a intenção
      const decision = decisionEngine.decide(processedResponse);
      processedResponse.decision = decision;
      console.log('[AIEngine] Decisão tomada:', decision);

      // 4. Executar ou Aguardar Confirmação
      if (decision.shouldExecute) {
        if (processedResponse.intent.startsWith('query_')) {
          const queryResult = await queryEngine.processQuery(processedResponse.intent, processedResponse.entities);
          if (queryResult) {
            processedResponse.queryResult = queryResult;
            processedResponse.text = queryResult.text;
            processedResponse.ui = queryResult.ui.type;
            processedResponse.suggestions = [...processedResponse.suggestions, ...queryResult.suggestions];
          }
        } else {
          const actionResult = await actionEngine.executeAction(processedResponse);
          if (actionResult) {
            processedResponse.actionResult = actionResult;
            if (actionResult.success) {
              processedResponse.text = `${processedResponse.text}\n\n[Sistema: ${actionResult.message}]`;
              // Registrar interação na memória de longo prazo
              memoryEngine.registerInteraction(processedResponse, message);
            }
          }
        }
      } else if (decision.requiresConfirmation) {
        processedResponse.text = `${processedResponse.text}\n\n⚠️ **Esta ação requer sua confirmação.** Deseja prosseguir?`;
        sessionContext.updateState({
          pendingAction: processedResponse,
          status: 'awaiting_confirmation',
          lastIntent: processedResponse.intent
        });
      }

      // 5. Training Engine: Aplicar regras SOFT (sugestões extras)
      const softSuggestions = trainingEngine.applySoftRules(processedResponse);
      processedResponse.suggestions = [...processedResponse.suggestions, ...softSuggestions];

      // 6. Gerar sugestões inteligentes baseadas no novo estado
      const dynamicSuggestions = suggestionEngine.generateSuggestions(processedResponse, sessionContext.getState());
      processedResponse.suggestions = [...processedResponse.suggestions, ...dynamicSuggestions];
      
      // Remover duplicatas
      processedResponse.suggestions = [...new Set(processedResponse.suggestions)];

      // Atualizar contexto da sessão
      sessionContext.updateState({
        lastIntent: processedResponse.intent,
        lastAIResponse: processedResponse
      });

      return processedResponse;

    } catch (error) {
      console.error('[AIEngine] Erro crítico no processamento:', error);
      
      return {
        text: "Desculpe, tive um problema ao processar sua solicitação. Posso tentar ajudar de outra forma?",
        intent: "general",
        entities: {},
        suggestions: ['Tentar novamente', 'O que você pode fazer?'],
        actions: [],
        ui: null
      };
    }
  }
};
