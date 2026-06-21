import { config } from './config.js';
import { tokenomicsService, estimateTokens } from './tokenomics.js';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface GatewayRequest {
  provider: 'gemini' | 'openrouter';
  model: string;
  messages: Message[];
  config?: {
    systemInstruction?: string;
    temperature?: number;
    responseMimeType?: string;
    responseSchema?: any;
  };
  stream?: boolean;
}

// Mapeia mensagens do formato padrão (OpenAI) para o formato do Gemini API
function mapToGeminiPayload(gatewayReq: GatewayRequest) {
  const geminiContents: any[] = [];
  let systemInstructionText = gatewayReq.config?.systemInstruction || '';

  for (const msg of gatewayReq.messages) {
    if (msg.role === 'system') {
      // Adiciona ao system instruction (concatena se houver múltiplos, embora o ideal seja um)
      systemInstructionText += (systemInstructionText ? '\n' : '') + msg.content;
    } else {
      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  const payload: any = {
    contents: geminiContents,
  };

  if (systemInstructionText) {
    payload.systemInstruction = {
      parts: [{ text: systemInstructionText }],
    };
  }

  const generationConfig: any = {};
  if (gatewayReq.config?.temperature !== undefined) {
    generationConfig.temperature = gatewayReq.config.temperature;
  }
  if (gatewayReq.config?.responseMimeType) {
    generationConfig.responseMimeType = gatewayReq.config.responseMimeType;
  }
  if (gatewayReq.config?.responseSchema) {
    generationConfig.responseSchema = gatewayReq.config.responseSchema;
  }

  if (Object.keys(generationConfig).length > 0) {
    payload.generationConfig = generationConfig;
  }

  return payload;
}

export const aiGateway = {
  async handleRequest(gatewayReq: GatewayRequest, sendSSEChunk?: (chunk: string) => void, userApiKey?: string): Promise<any> {
    // 1. Check if Kill Switch is active
    if (tokenomicsService.isKillSwitchActive()) {
      throw new Error('AI_GATEWAY_BLOCKED: O disjuntor de emergência (Kill Switch) está ativo devido ao consumo limite.');
    }

    const { provider, model, messages, stream } = gatewayReq;

    // Calcular tokens de entrada estimados para fins de auditoria primária
    const promptText = messages.map(m => `${m.role}: ${m.content}`).join('\n') + 
                      (gatewayReq.config?.systemInstruction || '');
    const estimatedInputTokens = estimateTokens(promptText);

    if (provider === 'gemini') {
      return this.executeGemini(gatewayReq, estimatedInputTokens, stream, sendSSEChunk, userApiKey);
    } else if (provider === 'openrouter') {
      return this.executeOpenRouter(gatewayReq, estimatedInputTokens, stream, sendSSEChunk);
    } else {
      throw new Error(`Provider não suportado: ${provider}`);
    }
  },

  async executeGemini(
    gatewayReq: GatewayRequest,
    estimatedInputTokens: number,
    stream?: boolean,
    sendSSEChunk?: (chunk: string) => void,
    userApiKey?: string
  ): Promise<any> {
    const apiKey = userApiKey || config.geminiApiKey;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }

    const modelName = gatewayReq.model || 'gemini-3.5-flash';
    const geminiPayload = mapToGeminiPayload(gatewayReq);

    if (stream && sendSSEChunk) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do Gemini (Stream): ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedOutputText = '';
      let actualInputTokens = estimatedInputTokens;
      let actualOutputTokens = 0;
      let usageMetadataLogged = false;

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              const dataStr = line.replace('data: ', '').trim();
              try {
                const parsed = JSON.parse(dataStr);
                const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (textChunk) {
                  accumulatedOutputText += textChunk;
                  sendSSEChunk(JSON.stringify({ content: textChunk }));
                }

                // Captura a contagem oficial de tokens ao final
                if (parsed.usageMetadata) {
                  actualInputTokens = parsed.usageMetadata.promptTokenCount ?? actualInputTokens;
                  actualOutputTokens = parsed.usageMetadata.candidatesTokenCount ?? actualOutputTokens;
                  usageMetadataLogged = true;
                }
              } catch (e) {
                // Ignore chunk parse error
              }
            }
          }
        }
      }

      // Se a contagem oficial não veio na resposta sse, estimamos
      if (!usageMetadataLogged) {
        actualOutputTokens = estimateTokens(accumulatedOutputText);
      }

      tokenomicsService.trackUsage(modelName, actualInputTokens, actualOutputTokens);
      return { success: true };
    } else {
      // Chamada Síncrona
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do Gemini (Síncrono): ${response.status} - ${errorText}`);
      }

      const result: any = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const actualInputTokens = result.usageMetadata?.promptTokenCount ?? estimatedInputTokens;
      const actualOutputTokens = result.usageMetadata?.candidatesTokenCount ?? estimateTokens(text);

      tokenomicsService.trackUsage(modelName, actualInputTokens, actualOutputTokens);

      return {
        text,
        raw: result,
      };
    }
  },

  async executeOpenRouter(
    gatewayReq: GatewayRequest,
    estimatedInputTokens: number,
    stream?: boolean,
    sendSSEChunk?: (chunk: string) => void
  ): Promise<any> {
    const apiKey = config.openRouterApiKey;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY não configurada no servidor.');
    }

    const modelName = gatewayReq.model || 'openai/gpt-4o-mini';
    
    // Converte mensagens para o formato padrão do OpenRouter/OpenAI
    const openRouterMessages = gatewayReq.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Se houver instrução de sistema na config, podemos inseri-la no início como mensagem system
    if (gatewayReq.config?.systemInstruction) {
      openRouterMessages.unshift({
        role: 'system',
        content: gatewayReq.config.systemInstruction,
      });
    }

    const body: any = {
      model: modelName,
      messages: openRouterMessages,
      stream: !!stream,
    };

    if (gatewayReq.config?.temperature !== undefined) {
      body.temperature = gatewayReq.config.temperature;
    }
    if (gatewayReq.config?.responseMimeType === 'application/json') {
      body.response_format = { type: 'json_object' };
    }

    if (stream && sendSSEChunk) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do OpenRouter (Stream): ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedOutputText = '';
      let actualInputTokens = estimatedInputTokens;
      let actualOutputTokens = 0;
      let openRouterTokensCounted = false;

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
                const textChunk = parsed.choices?.[0]?.delta?.content || '';
                if (textChunk) {
                  accumulatedOutputText += textChunk;
                  sendSSEChunk(JSON.stringify({ content: textChunk }));
                }

                // OpenRouter às vezes envia os metadados de uso no final do stream
                if (parsed.usage) {
                  actualInputTokens = parsed.usage.prompt_tokens ?? actualInputTokens;
                  actualOutputTokens = parsed.usage.completion_tokens ?? actualOutputTokens;
                  openRouterTokensCounted = true;
                }
              } catch (e) {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

      if (!openRouterTokensCounted) {
        actualOutputTokens = estimateTokens(accumulatedOutputText);
      }

      tokenomicsService.trackUsage(modelName, actualInputTokens, actualOutputTokens);
      return { success: true };
    } else {
      // Chamada Síncrona
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do OpenRouter (Síncrono): ${response.status} - ${errorText}`);
      }

      const result: any = await response.json();
      const text = result.choices?.[0]?.message?.content || '';
      
      const actualInputTokens = result.usage?.prompt_tokens ?? estimatedInputTokens;
      const actualOutputTokens = result.usage?.completion_tokens ?? estimateTokens(text);

      tokenomicsService.trackUsage(modelName, actualInputTokens, actualOutputTokens);

      return {
        text,
        raw: result,
      };
    }
  },
};
