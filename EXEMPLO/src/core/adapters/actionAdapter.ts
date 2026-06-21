import { ActionResult } from '../actionEngine';
import { OrchestratorResponse, OrchestratorBlock } from '../orchestrator';

export const actionAdapter = {
  toOrchestratorResponse(actionResult: ActionResult | null): OrchestratorResponse {
    if (!actionResult) {
      return {
        type: "text",
        blocks: [{
          id: Math.random().toString(36).substring(2, 11),
          type: "text",
          content: "Não foi possível executar a ação solicitada.",
          createdAt: Date.now()
        }]
      };
    }

    const blocks: OrchestratorBlock[] = [
      {
        id: Math.random().toString(36).substring(2, 11),
        type: "card",
        content: {
          title: actionResult.message,
          data: actionResult.data,
          success: actionResult.success
        },
        createdAt: Date.now()
      }
    ];

    return {
      type: "action",
      blocks,
      meta: {
        success: actionResult.success,
        suggestions: actionResult.suggestions,
        event: actionResult.event
      }
    };
  }
};
