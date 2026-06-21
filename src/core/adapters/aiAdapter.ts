import { AIProcessedResponse } from '../aiEngine';
import { OrchestratorResponse, OrchestratorBlock } from '../orchestrator';

export const aiAdapter = {
  toOrchestratorResponse(aiResponse: AIProcessedResponse): OrchestratorResponse {
    const blocks: OrchestratorBlock[] = [
      {
        id: Math.random().toString(36).substring(2, 11),
        type: "text",
        content: aiResponse.text,
        createdAt: Date.now()
      }
    ];

    return {
      type: "text",
      blocks,
      meta: {
        intent: aiResponse.intent,
        suggestions: aiResponse.suggestions
      }
    };
  }
};
