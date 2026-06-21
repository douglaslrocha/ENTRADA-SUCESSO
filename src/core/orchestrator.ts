import { marked } from 'marked';
import { aiEngine } from './aiEngine';
import { decisionEngine } from './decisionEngine';
import { actionEngine } from './actionEngine';
import { queryEngine } from './queryEngine';
import { aiAdapter } from './adapters/aiAdapter';
import { actionAdapter } from './adapters/actionAdapter';
import { queryAdapter } from './adapters/queryAdapter';
import { blockPlanner } from './blockPlanner';
import { eventEngine, UIEventType } from './eventEngine';
import { cognitiveSyncPlugin } from '../plugins/CognitiveSyncPlugin';

export type OrchestratorBlock = {
  id: string;
  type: "text" | "dashboard" | "list" | "card" | "system";
  content: any;
  createdAt: number;
};

export type OrchestratorResponse = {
  type: "text" | "ui" | "action";
  blocks: OrchestratorBlock[];
  meta?: any;
};

/**
 * Orchestrator central que organiza o fluxo de processamento do sistema.
 * Envolve os engines existentes sem substituí-los.
 */
export const orchestrator = {
  async processUserInput(input: string): Promise<OrchestratorResponse> {
    console.log(`[Orchestrator] Input recebido: ${input}`);

    try {
      // Garantir alinhamento absoluto com a última versão cognitiva antes de qualquer processamento ou resposta
      await cognitiveSyncPlugin.waitForReady();
      const latestVer = cognitiveSyncPlugin.getVersion();
      const lastRanVer = sessionStorage.getItem('orchestrator_last_cognitive_version');
      if (!lastRanVer || parseInt(lastRanVer) !== latestVer.version) {
        console.log(`[Orchestrator] Alinhando bases com a versão cognitiva atual: ${latestVer.version}`);
        await cognitiveSyncPlugin.rebuildAll();
        sessionStorage.setItem('orchestrator_last_cognitive_version', String(latestVer.version));
      }

      // 1. Interpretar intenção (aiEngine)
      const aiResponse = await aiEngine.interpret(input);
      console.log(`[Orchestrator] Intenção detectada: ${aiResponse.intent}`);

      // 2. Decidir ação (decisionEngine)
      const decision = decisionEngine.decide(aiResponse);
      console.log(`[Orchestrator] Decisão tomada: ${decision.reason} (Executar: ${decision.shouldExecute})`);

      let actionResult: any = null;
      let finalResponse: OrchestratorResponse = {
        type: "text",
        blocks: [],
        meta: {}
      };

      // 3. SE houver ação, executar actionEngine ou queryEngine PRIMEIRO
      if (decision.shouldExecute) {
        console.log(`[Orchestrator] Execução autorizada para: ${aiResponse.intent}`);
        if (aiResponse.intent.startsWith('query_')) {
          console.log(`[Orchestrator] Executando Query: ${aiResponse.intent}`);
          actionResult = await queryEngine.processQuery(aiResponse.intent, aiResponse.entities);
          finalResponse = queryAdapter.toOrchestratorResponse(actionResult);
        } else {
          console.log(`[Orchestrator] Executando Ação: ${aiResponse.intent}`);
          actionResult = await actionEngine.executeAction(aiResponse);
          console.log(`[Orchestrator] Resultado do ActionEngine:`, actionResult);
          
          if (actionResult && actionResult.success) {
            console.log(`[Orchestrator] SUCESSO na execução: ${actionResult.message}`);
            // Adicionar bloco de confirmação do sistema
            finalResponse.blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "system",
              content: { message: actionResult.message },
              createdAt: Date.now()
            });
          } else if (actionResult && !actionResult.success) {
            console.warn(`[Orchestrator] FALHA na execução: ${actionResult.message}`);
          }
          
          // Se não houver blocos planejados pela IA, usamos o adaptador padrão para a ação
          if (!aiResponse.blocks || aiResponse.blocks.length === 0) {
            console.log(`[Orchestrator] Usando actionAdapter para gerar visualização da ação`);
            const actionResponse = actionAdapter.toOrchestratorResponse(actionResult);
            finalResponse.blocks = [...finalResponse.blocks, ...actionResponse.blocks];
            finalResponse.type = "action";
            finalResponse.meta = { ...finalResponse.meta, ...actionResponse.meta };
          }
        }
      } else {
        console.log(`[Orchestrator] Execução ignorada ou requer confirmação: ${decision.reason}`);
      }

      // 4. DEPOIS, se houver blocos planejados, gerar visualização (blockPlanner)
      if (aiResponse.blocks && aiResponse.blocks.length > 0) {
        console.log(`[Orchestrator] IA solicitou ${aiResponse.blocks.length} blocos visuais. Processando...`);
        const visualResponse = await blockPlanner.planBlocks(aiResponse);
        
        // Mesclar blocos visuais com a resposta (mantendo a confirmação se houver)
        console.log(`[Orchestrator] Mesclando ${visualResponse.blocks.length} blocos do BlockPlanner`);
        finalResponse.blocks = [...finalResponse.blocks, ...visualResponse.blocks];
        finalResponse.type = visualResponse.type;
        finalResponse.meta = { ...finalResponse.meta, ...visualResponse.meta };
      }

      // Se nada foi gerado ainda (apenas interpretação)
      if (finalResponse.blocks.length === 0) {
        console.log(`[Orchestrator] Engine chamado: aiEngine (apenas interpretação)`);
        finalResponse = aiAdapter.toOrchestratorResponse(aiResponse);
      }

      console.log(`[Orchestrator] Resposta final estruturada:`, finalResponse);
      
      // Adiciona o texto original da IA no meta para renderização
      if (!finalResponse.meta) finalResponse.meta = {};
      finalResponse.meta.text = aiResponse.text;
      finalResponse.meta.suggestions = aiResponse.suggestions || [];

      // 5. Disparar Event Engine se houver um evento na resposta da IA ou na ação executada
      const eventToDispatch = aiResponse.event || finalResponse.meta?.event;
      if (eventToDispatch) {
        eventEngine.dispatch(eventToDispatch as UIEventType, aiResponse.data || aiResponse.entities || finalResponse.blocks[0]?.content?.data);
      }

      return finalResponse;

    } catch (error) {
      console.error('[Orchestrator] Erro no processamento:', error);
      return {
        type: "text",
        blocks: [{
          id: Math.random().toString(36).substring(2, 11),
          type: "text",
          content: "Ocorreu um erro ao processar sua solicitação no orquestrador.",
          createdAt: Date.now()
        }]
      };
    }
  },

  /**
   * Executa uma ação direta sem passar pela interpretação da IA.
   * Útil para interações de UI (cliques em botões, checkboxes).
   */
  async executeDirectAction(intent: string, entities: Record<string, any>): Promise<OrchestratorResponse> {
    console.log(`[Orchestrator] Ação direta: ${intent}`, entities);
    
    try {
      if (intent.startsWith('query_')) {
        const queryResult = await queryEngine.processQuery(intent, entities);
        return queryAdapter.toOrchestratorResponse(queryResult);
      } else {
        const mockAIResponse = {
          intent,
          entities,
          text: `Processando ${intent}...`,
          suggestions: [],
          actions: [],
          ui: null
        };
        const actionResult = await actionEngine.executeAction(mockAIResponse);
        const response = actionAdapter.toOrchestratorResponse(actionResult);
        
        // Disparar evento para ações diretas
        if (response.meta?.event) {
          eventEngine.dispatch(response.meta.event as UIEventType, response.blocks[0]?.content?.data || entities);
        }
        
        return response;
      }
    } catch (error) {
      console.error('[Orchestrator] Erro na ação direta:', error);
      throw error;
    }
  },

  /**
   * Insere os blocos gerados pelo orquestrador no canvas atual.
   * Mantém compatibilidade com o sistema de eventos do EditorComponent.
   */
  appendBlocksFromOrchestrator(response: OrchestratorResponse) {
    console.log('[Orchestrator] Inserindo blocos no canvas:', response.blocks);
    
    // 1. Se houver um texto geral na resposta (meta), insere primeiro
    if (response.meta?.text) {
      // Parse markdown to HTML
      const html = marked.parse(response.meta.text, { async: false }) as string;
      
      const textEvent = new CustomEvent('insert-ai-text', {
        detail: { text: html, isHtml: true }
      });
      window.dispatchEvent(textEvent);
    }

    // 2. Insere cada bloco individualmente
    response.blocks.forEach(block => {
      // Se o bloco for de texto e for igual ao meta.text, ignoramos para não duplicar
      if (block.type === 'text' && block.content === response.meta?.text) return;
      if (block.type === 'text' && block.content?.text === response.meta?.text) return;

      // Dispara evento customizado que o EditorComponent escuta
      const event = new CustomEvent('insert-ai-block', {
        detail: {
          type: block.type,
          data: block.content.data || block.content,
          content: block.content.text && block.content.text !== response.meta?.text ? block.content.text : ''
        }
      });
      window.dispatchEvent(event);
    });
  }
};
