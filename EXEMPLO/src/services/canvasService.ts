import { CanvasResponse } from "../types";
import { BACKEND_URL } from "../config/aiConfig";
import { safeLocalStorage } from "../utils/storage";

export async function interpretCanvasInput(text: string, context?: any): Promise<CanvasResponse | null> {
  try {
    const userApiKey = safeLocalStorage.getItem('AI_API_KEY') || '';

    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(userApiKey ? { "x-user-api-key": userApiKey } : {}),
      },
      body: JSON.stringify({
        provider: "gemini",
        model: "gemini-3.5-flash",
        messages: [
          { role: "user", content: `Interprete a seguinte entrada do usuário em um sistema operacional pessoal inteligente: "${text}"` }
        ],
        config: {
          systemInstruction: `Você é o motor de inteligência de um sistema operacional pessoal avançado (SaaS Profissional).
Sua tarefa é interpretar a intenção do usuário e retornar um JSON estruturado com dados puros. O sistema (frontend) será responsável por toda a renderização visual.

Intenções obrigatórias para consultas:
- query_summary: Resumo geral do sistema (Dashboard).
- query_projects: Lista e cards de projetos ativos.
- query_tasks: Lista estruturada de tarefas com status.
- query_timeline: Visualização cronológica de eventos/tarefas.
- query_objective_progress: Progresso de objetivos estratégicos.

Outras intenções:
- task_create: Criar uma nova tarefa.
- project_create: Criar um novo projeto.
- document_create: Gerar conteúdo para um Crypto ou novo documento.
- chat: Conversa geral ou ajuda.

Regras de Resposta:
1. NUNCA retorne apenas texto se houver dados estruturados disponíveis.
2. O campo 'intent' deve ser um dos listados acima.
3. O campo 'data' deve conter as entidades e valores puros (ex: counts, arrays de objetos com title, status, date, progress, etc).
4. O campo 'content' deve ser usado apenas para insights curtos ou complementos textuais, nunca como conteúdo principal.
5. Sempre retorne 'suggestions' (próximas ações lógicas).

Exemplo de estrutura para 'query_summary':
{
  "intent": "query_summary",
  "data": {
    "stats": [
      { "label": "Total de Tarefas", "value": 48, "trend": "+12 esta semana", "status": "info" },
      { "label": "Projetos Ativos", "value": 5, "trend": "2 em atraso", "status": "warning" }
    ],
    "insights": ["Você completou 80% das tarefas planejadas para hoje."]
  },
  "suggestions": ["Ver tarefas pendentes", "Revisar projeto X"]
}

Contexto do sistema: ${JSON.stringify(context || {})}
`,
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              intent: { type: "STRING" },
              content: { type: "STRING" },
              data: { type: "OBJECT" },
              suggestions: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["intent", "data"]
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini via backend: ${response.statusText}`);
    }

    const result = await response.json();
    const resultText = result.text || "null";
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Error interpreting canvas input:", error);
    return null;
  }
}
