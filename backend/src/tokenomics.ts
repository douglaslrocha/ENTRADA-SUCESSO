import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'tokenomics.json');

// Preços por token (USD)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Gemini Flash
  'gemini-3.5-flash': { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  'gemini-3-flash-preview': { input: 0.075 / 1_000_000, output: 0.30 / 1_000_000 },
  // Gemini Pro
  'gemini-3.1-pro-preview': { input: 1.25 / 1_000_000, output: 5.00 / 1_000_000 },
  // OpenRouter GPT-4o-mini
  'openai/gpt-4o-mini': { input: 0.150 / 1_000_000, output: 0.600 / 1_000_000 },
};

// Heurística de fallback para contagem de tokens (1 token ~ 4 caracteres)
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

interface ModelUsage {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface TokenomicsData {
  killSwitchActive: boolean;
  limitUSD: number;
  totalCostUSD: number;
  byModel: Record<string, ModelUsage>;
}

const DEFAULT_LIMIT_USD = 20.0; // Teto de segurança mensal/diário padrão

class TokenomicsService {
  private data: TokenomicsData = {
    killSwitchActive: false,
    limitUSD: DEFAULT_LIMIT_USD,
    totalCostUSD: 0,
    byModel: {},
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        this.data = JSON.parse(raw);
        console.log('[Tokenomics] Dados carregados com sucesso de:', DATA_FILE);
      } else {
        this.save();
      }
    } catch (error) {
      console.error('[Tokenomics] Erro ao carregar dados do arquivo:', error);
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('[Tokenomics] Erro ao salvar dados no arquivo:', error);
    }
  }

  public getUsage() {
    return {
      totalCostUSD: this.data.totalCostUSD,
      limitUSD: this.data.limitUSD,
      killSwitchActive: this.data.killSwitchActive,
      byModel: this.data.byModel,
    };
  }

  public trackUsage(model: string, inputTokens: number, outputTokens: number) {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gemini-3.5-flash']; // Fallback
    const cost = (inputTokens * pricing.input) + (outputTokens * pricing.output);

    if (!this.data.byModel[model]) {
      this.data.byModel[model] = { requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 };
    }

    const modelData = this.data.byModel[model];
    modelData.requests += 1;
    modelData.inputTokens += inputTokens;
    modelData.outputTokens += outputTokens;
    modelData.cost += cost;

    this.data.totalCostUSD += cost;

    console.log(`[Tokenomics] Rastreado uso para ${model}: +${inputTokens} In, +${outputTokens} Out. Custo desta chamada: $${cost.toFixed(6)}. Custo Total: $${this.data.totalCostUSD.toFixed(6)}`);

    // Survival Mode: Desligamento Automático se exceder o limite
    if (this.data.totalCostUSD >= this.data.limitUSD && !this.data.killSwitchActive) {
      this.data.killSwitchActive = true;
      console.warn(`[Tokenomics Warning] CUSTO EXCEDEU O LIMITE DE SEGURANÇA ($${this.data.limitUSD})! DISJUNTOR ATIVADO AUTOMATICAMENTE (KILL SWITCH).`);
    }

    this.save();
  }

  public isKillSwitchActive(): boolean {
    return this.data.killSwitchActive;
  }

  public setKillSwitch(state: boolean) {
    this.data.killSwitchActive = state;
    console.log(`[Tokenomics] Kill Switch atualizado manualmente para: ${state}`);
    this.save();
  }

  public setLimit(limit: number) {
    this.data.limitUSD = limit;
    console.log(`[Tokenomics] Limite financeiro atualizado para: $${limit}`);
    
    // Se o novo limite for maior que o custo atual, podemos desativar o kill switch (ou deixar por conta do usuário)
    if (this.data.totalCostUSD < this.data.limitUSD && this.data.killSwitchActive) {
      this.data.killSwitchActive = false;
      console.log('[Tokenomics] Custo está abaixo do novo limite, desativando Kill Switch automaticamente.');
    }
    
    this.save();
  }

  public clearStats() {
    this.data.totalCostUSD = 0;
    this.data.byModel = {};
    this.data.killSwitchActive = false;
    console.log('[Tokenomics] Estatísticas de uso redefinidas.');
    this.save();
  }
}

export const tokenomicsService = new TokenomicsService();
