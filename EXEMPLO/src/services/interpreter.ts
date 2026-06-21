import { FinancialRecord } from "../types";
import { BACKEND_URL } from "../config/aiConfig";
import { safeLocalStorage } from "../utils/storage";

export async function interpretFinancialInput(text: string): Promise<FinancialRecord | null> {
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
          { role: "user", content: `Interprete a seguinte frase financeira e retorne um JSON estruturado: "${text}"` }
        ],
        config: {
          systemInstruction: "Você é um assistente financeiro. Extraia o tipo (expense/income), valor (número), categoria e descrição de frases em português. Se não for uma frase financeira, retorne null.",
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              type: { type: "STRING", enum: ["expense", "income"] },
              amount: { type: "NUMBER" },
              category: { type: "STRING" },
              description: { type: "STRING" }
            },
            required: ["type", "amount", "category", "description"]
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
    console.error("Error interpreting financial input:", error);
    return null;
  }
}
