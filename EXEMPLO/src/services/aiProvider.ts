import { AI_CONFIG, BACKEND_URL } from '../config/aiConfig';

export const aiProvider = {
  async sendToAI(message: string, systemInstruction?: string): Promise<string> {
    console.log('[AIProvider] Enviando request para Gemini (via backend):', { message });

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: AI_CONFIG.model,
          messages: [
            { role: 'user', content: message }
          ],
          config: {
            systemInstruction: systemInstruction || "Você é um assistente inteligente integrado a um sistema operacional pessoal.",
            temperature: 0.7,
            responseMimeType: "application/json",
          },
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let customMessage = `Erro no AI Gateway do Servidor: ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.message) {
            customMessage = parsed.message;
          } else if (parsed && parsed.error) {
            customMessage = parsed.error;
          }
        } catch (_) {}
        throw new Error(customMessage);
      }

      const result = await response.json();
      const text = result.text || 'Sem resposta da IA.';
      console.log('[AIProvider] Resposta do Gemini (via backend):', text);
      return text;

    } catch (error) {
      console.error('[AIProvider] Erro ao enviar mensagem para o backend:', error);
      throw error; 
    }
  },

  async *sendToAIStream(message: string, systemInstruction?: string): AsyncGenerator<string> {
    console.log('[AIProvider] Iniciando stream Gemini (via backend):', { message });

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: AI_CONFIG.model,
          messages: [
            { role: 'user', content: message }
          ],
          config: {
            systemInstruction: systemInstruction || "Você é um assistente inteligente integrado a um sistema operacional pessoal.",
            temperature: 0.7,
          },
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let customMessage = `Erro no AI Gateway do Servidor (Stream): ${response.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed && parsed.message) {
            customMessage = parsed.message;
          } else if (parsed && parsed.error) {
            customMessage = parsed.error;
          }
        } catch (_) {}
        throw new Error(customMessage);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6);
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const textChunk = parsed.content || '';
                if (textChunk) yield textChunk;
              } catch (e) {
                // Ignore chunk parse error
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('[AIProvider] Erro no stream do backend:', error);
      throw error;
    }
  }
};

