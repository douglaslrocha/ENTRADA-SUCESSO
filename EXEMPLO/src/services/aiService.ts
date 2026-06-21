import { AI_CONFIG, BACKEND_URL } from '../config/aiConfig';

export interface AIResponse {
  text: string;
  raw: any;
}

const Type = {
  OBJECT: 'OBJECT',
  ARRAY: 'ARRAY',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER'
};

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const aiService = {
  async generateDiarySummary(diaryContent: string): Promise<string> {
    console.log('[AIService] Gerando resumo do diário (via backend)...');

    try {
      const prompt = `Analise o seguinte conteúdo de diário e gere um resumo de EXATAMENTE CINCO LINHAS. 
      O resumo deve conter:
      - As KPIs mais importantes (métricas, números, frequências mencionadas)
      - As palavras mais importantes
      - As frases mais importantes
      - O que é mais fundamental e essencial no relato.
      
      Mantenha um tom profissional, inspirador e direto.
      
      CONTEÚDO DO DIÁRIO:
      ${diaryContent}`;

      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'user', content: prompt }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor ao gerar resumo: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text?.trim() || "Não foi possível gerar o resumo.";

    } catch (error) {
      console.error('[AIService] Erro ao gerar resumo:', error);
      return "Erro ao processar o resumo da jornada.";
    }
  },

  async generateDiarySemanticAnalysis(entry: any): Promise<any> {
    console.log('[AIService] Gerando extração de entidade semântica profunda (via backend)...');

    // Combine all different portions of the diary text
    const fullText = `
      -- DIARIO DA JORNADA --
      ABERTURA DO DIA: data=${entry.dayOpening?.date || ''}, local=${entry.dayOpening?.location || ''}, clima=${entry.dayOpening?.climate || ''}
      SONHOS (CONTEÚDO PRINCIPAL):
      ${stripHtml(entry.content || '')}

      NOVIDADES DO DIA (NEWS):
      ${stripHtml(entry.newsContent || '')}

      INSIGHTS DO DIA:
      ${stripHtml(entry.insightsContent || '')}

      ESCRITA LIVRE:
      ${stripHtml(entry.freeContent || '')}

      CONSOLIDAÇÃO E CONTRAPONTOS:
      ${stripHtml(entry.consolidationContent || '')}

      DIRECIONAMENTO DA AMPARADORA:
      ${stripHtml(entry.guidanceContent || '')}

      ESTADOS DE EQUILÍBRIO INTERNO ADICIONADOS:
      Energia: ${JSON.stringify(entry.energy || [])}
      Mental: ${JSON.stringify(entry.mental || [])}
      Emoção: ${JSON.stringify(entry.emotion || [])}
      Consciencial: ${JSON.stringify(entry.internalState || [])}
      Interferências: ${JSON.stringify(entry.interferences || [])}
      Postura: ${JSON.stringify(entry.posture || [])}
    `;

    try {
      const prompt = `Analise o diário completo acima e extraia todo o significado semântico estruturado para a memória cognitiva de 10 anos do usuário. Conecte temas, símbolos, sentimentos, pessoas e ideias de forma ultra-precisa.
      Retorne estritamente o objeto JSON especificado.`;

      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'user', content: `${fullText}\n\n${prompt}` }
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                dreams: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      rawText: { type: Type.STRING, description: "O relato completo e cru do sonho extraído do texto principal." },
                      symbols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Símbolos e arquétipos encontrados no sonho (ex: água, floresta, chave)." },
                      people: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Personagens presentes no sonho." },
                      places: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ambientes ou lugares onde se passou o sonho." },
                      emotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sentimentos sentidos no sonho (medo, paz, euforia)." },
                      themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Instâncias ou grandes temas (ex: fuga, voo, aprendizado)." },
                      entities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Outras entidades ou termos de destaque." },
                      intensity: { type: Type.NUMBER, description: "Intensidade energética ou de lucidez do sonho de 0.0 a 1.0." }
                    }
                  }
                },
                insights: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      content: { type: Type.STRING, description: "O insight ou ideias que surgiram (do bloco de insights)." },
                      source: { type: Type.STRING, description: "De onde veio a ideia (ex: meditação, leitura, incidente)." },
                      importance: { type: Type.STRING, description: "Grau de importância (baixa, media, alta)." },
                      relatedProjects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Projetos novos ou existentes relacionados a este insight." }
                    }
                  }
                },
                habits: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Nome do hábito ou ação recorrente ativa listada ou descrita." },
                      frequency: { type: Type.STRING, description: "Frequência (diária, semanal, mensal)." },
                      streak: { type: Type.INTEGER, description: "Streak atual ou estimado." }
                    }
                  }
                },
                state: {
                  type: Type.OBJECT,
                  properties: {
                    physical: { type: Type.STRING, description: "Resumo do estado físico do dia." },
                    mental: { type: Type.STRING, description: "Resumo do estado mental/pensamentos do dia." },
                    emotional: { type: Type.STRING, description: "Resumo do estado emocional do dia." },
                    energetic: { type: Type.STRING, description: "Resumo do estado energético geral do dia." }
                  }
                },
                guidance: {
                  type: Type.OBJECT,
                  properties: {
                    message: { type: Type.STRING, description: "O direcionamento ou conselho recebido/refletido (do bloco da Amparadora)." },
                    theme: { type: Type.STRING },
                    context: { type: Type.STRING },
                    relatedState: { type: Type.STRING }
                  }
                },
                daySynthesis: {
                  type: Type.OBJECT,
                  properties: {
                    summary: { type: Type.STRING, description: "Resumo analítico profundo do dia em 5 linhas." },
                    lessons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lições extraídas da experiência do dia." },
                    transformations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mudanças de perspectiva ou transformações percebidas." }
                  }
                },
                semanticEntities: {
                  type: Type.OBJECT,
                  properties: {
                    people: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Relação de todas as pessoas marcadas ou citadas no dia." },
                    places: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Todos os lugares físicos ou metafísicos significativos." },
                    symbols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Símbolos e arquétipos identificados ao longo de todos os textos." },
                    themes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Temas recorrentes ou manifestados (ex: evolução, disciplina, conexão)." },
                    emotions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Sentimentos dominantes observados no relato completo." },
                    projects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Projetos correlacionados mencionados nos textos." },
                    dreamPatterns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Padrões identificados nos sonhos." },
                    repeatedElements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Elementos de comportamento ou incidentes repetidos." }
                  }
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      value: { type: Type.STRING }
                    }
                  },
                  description: "Conversão interna de blocos de escrita livre."
                }
              }
            }
          },
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API do Gemini via backend: ${response.statusText}`);
      }

      const result = await response.json();
      const rawText = result.text || "{}";
      return JSON.parse(rawText);

    } catch (error) {
      console.error('[AIService] Erro ao extrair entidades cognitivas via Gemini:', error);
      return {};
    }
  },

  async sendMessageToAI(message: string, context?: any): Promise<AIResponse> {
    console.log('[AIService] Enviando request para AI (via backend)...');
    try {
      const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'gemini',
          model: 'gemini-3.5-flash',
          messages: [
            { role: 'user', content: `${message}${context ? `\n\nContexto: ${JSON.stringify(context)}` : ''}` }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro no AI Gateway: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        text: result.text || "Sem resposta.",
        raw: result
      };
    } catch (error) {
       console.error('[AIService] Erro sendMessageToAI:', error);
       return { text: "Erro na conexão.", raw: error };
    }
  }
};

