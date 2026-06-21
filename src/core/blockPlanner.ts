import { AIProcessedResponse } from './aiEngine';
import { queryEngine } from './queryEngine';
import { queryAdapter } from './adapters/queryAdapter';
import { OrchestratorResponse, OrchestratorBlock } from './orchestrator';

export const blockPlanner = {
  /**
   * Planeja a composição de blocos baseada na interpretação da IA.
   * Se a IA já retornou múltiplos blocos, processa cada um.
   * Se retornou apenas um intent, converte para o formato de bloco único.
   */
  async planBlocks(aiResponse: AIProcessedResponse): Promise<OrchestratorResponse> {
    console.log('[BlockPlanner] Planejando blocos para intent:', aiResponse.intent);
    
    const blocks: OrchestratorBlock[] = [];
    
    // 1. Se a IA retornou uma lista de blocos planejados
    if (aiResponse.blocks && aiResponse.blocks.length > 0) {
      console.log(`[BlockPlanner] Processando ${aiResponse.blocks.length} blocos planejados pela IA`);
      
      for (const plannedBlock of aiResponse.blocks) {
        const block = await this.resolveBlock(plannedBlock);
        if (block) {
          blocks.push(...block.blocks);
        }
      }
    } else {
      // 2. Fallback: Comportamento atual de bloco único baseado no intent
      console.log('[BlockPlanner] Usando fallback de bloco único');
      // O orquestrador já lida com isso, mas para manter o fluxo centralizado aqui:
      // Se for uma query, processamos aqui. Se for ação, deixamos o orquestrador lidar.
    }

    return {
      type: blocks.length > 0 ? "ui" : "text",
      blocks,
      meta: {
        intent: aiResponse.intent,
        suggestions: aiResponse.suggestions
      }
    };
  },

  /**
   * Resolve um bloco planejado, buscando os dados necessários via queryEngine.
   */
  async resolveBlock(plannedBlock: any): Promise<OrchestratorResponse | null> {
    const typeMap: Record<string, string> = {
      'timeline': 'query_timeline',
      'task_list': 'query_tasks',
      'project_list': 'query_projects',
      'dashboard': 'query_summary'
    };

    const intent = typeMap[plannedBlock.type] || plannedBlock.intent;
    if (!intent) return null;

    try {
      const queryResult = await queryEngine.processQuery(intent, plannedBlock.filters || plannedBlock.entities || {});
      return queryAdapter.toOrchestratorResponse(queryResult);
    } catch (error) {
      console.error(`[BlockPlanner] Erro ao resolver bloco ${plannedBlock.type}:`, error);
      return null;
    }
  }
};
