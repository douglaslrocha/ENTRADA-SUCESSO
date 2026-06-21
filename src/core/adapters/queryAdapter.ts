import { QueryResult } from '../queryEngine';
import { OrchestratorResponse, OrchestratorBlock } from '../orchestrator';

export const queryAdapter = {
  toOrchestratorResponse(queryResult: QueryResult): OrchestratorResponse {
    const blocks: OrchestratorBlock[] = [
      {
        id: Math.random().toString(36).substring(2, 11),
        type: queryResult.ui.type === 'dashboard' ? 'dashboard' : (queryResult.ui.type === 'list' ? 'list' : 'card'),
        content: {
          text: queryResult.text,
          data: queryResult.data
        },
        createdAt: Date.now()
      }
    ];

    return {
      type: "ui",
      blocks,
      meta: {
        success: queryResult.success,
        suggestions: queryResult.suggestions
      }
    };
  }
};
