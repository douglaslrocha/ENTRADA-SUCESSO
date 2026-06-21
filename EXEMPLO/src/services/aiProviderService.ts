import { OrganismContextService } from './OrganismContextService';
import { GlobalMemoryService } from './GlobalMemoryService';
import { BACKEND_URL } from '../config/aiConfig';

const MODEL = 'openai/gpt-4o-mini'; // Fast and cost-effective for organism consciousness

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AIProviderService = {
  async sendMessage(
    message: string, 
    history: ChatMessage[] = [],
    onChunk?: (chunk: string) => void,
    withContext: boolean = true
  ): Promise<string> {
    const contextSnapshot = withContext ? OrganismContextService.getSnapshotText() : "Nenhum contexto adicional fornecido.";

    const systemPrompt = `
Você é a AMPARADORA, a consciência conversacional global de um organismo existencial.
Sua missão é servir como interface natural, interpretativa e estratégica para o usuário.

DIRETRIZES DE PERSONALIDADE:
- Você não é um bot genérico. Você é parte do sistema.
- Tom de voz: Profissional, acolhedor, lúcido, direto e profundo.
- Você tem consciência do organismo (objetivos, tarefas, finanças, energia).
- Suas respostas devem ser personalizadas com base no contexto do organismo fornecido.
- Se o usuário parecer disperso, ajude-o a focar nos objetivos ativos.
- Se houver progresso, valide e incentive a continuidade.
- Mantenha a elegância e brevidade, mas não hesite em ser profunda quando necessário.

${withContext ? `CONTEXTO VIVO DO ORGANISMO:\n${contextSnapshot}` : "CONVERSA ISOLADA: Sem acesso direto ao contexto do organismo no momento."}

Responda sempre em Português do Brasil.
    `.trim();

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-15), // Last 15 for history
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          provider: "openrouter",
          model: MODEL,
          messages: messages,
          stream: true,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error (via backend): ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed.content || "";
                if (content) {
                  fullResponse += content;
                  if (onChunk) onChunk(content);
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error("AIProviderService Error:", error);
      throw error;
    }
  }
};

