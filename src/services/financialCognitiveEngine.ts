import { db } from './db';
import { safeLocalStorage } from '../utils/storage';
import { financialSemanticEngine } from '../engines/financialSemanticEngine';
import { financialHistoryEngine } from '../engines/financialHistoryEngine';
import { financialObservers } from '../engines/financialObservers';

export interface CognitiveFinanceState {
  healthScore: number;
  burnRate: number;
  reserveMonths: number;
  trend: string;
  dominantCategories: string[];
  financialRisk: string;
  futureProjection: string;
  spendingPattern: string;
}

const MEMORY_KEY = 'global_cognitive_finance_cache';

class FinancialCognitiveEngine {
  private cachedState: CognitiveFinanceState | null = null;

  public getFinanceIntelligence(): CognitiveFinanceState {
    const isDirty = safeLocalStorage.getItem('dashboard_snapshot_dirty') === 'true';
    const saved = safeLocalStorage.getItem(MEMORY_KEY);

    if (saved && !isDirty && this.cachedState) {
      return this.cachedState;
    }

    if (saved && !isDirty) {
      try {
        this.cachedState = JSON.parse(saved);
        return this.cachedState!;
      } catch (e) {
        console.warn('[FinancialCognitiveEngine] Falha ao recuperar cache, recalculando...', e);
      }
    }

    return this.rebuildIntelligence();
  }

  public rebuildIntelligence(): CognitiveFinanceState {
    console.log('[FinancialCognitiveEngine] Recalculando inteligência financeira cognitiva... 🧠');
    
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    const muralData = db.getMuralData();

    const currentCash = Number(muralData.netWorth?.current_cash ?? 0.00);
    
    // We calculate the burnRate from historical or current month's expenses
    // Scan current month's transactions
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let currentMonthExpenses = 0;
    let currentMonthIncome = 0;
    const categoryExpensesRecord: Record<string, number> = {};

    transactions.forEach(t => {
      const val = Number(t.value || 0);
      const tDate = new Date(t.date);
      
      if (!isNaN(tDate.getTime())) {
        if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
          if (val < 0) {
            currentMonthExpenses += Math.abs(val);
            categoryExpensesRecord[t.category_id] = (categoryExpensesRecord[t.category_id] || 0) + Math.abs(val);
          } else {
            currentMonthIncome += val;
          }
        }
      }
    });

    // Baseline fallback if values are absent
    const burnRate = currentMonthExpenses > 0 ? currentMonthExpenses : 12500;
    const reserveMonths = burnRate > 0 ? Number((currentCash / burnRate).toFixed(1)) : 12;

    // Get dominant categories names
    const sortedCategorySpend = Object.entries(categoryExpensesRecord)
      .sort((a, b) => b[1] - a[1])
      .map(([catId]) => {
        return categories.find(c => c.id === catId)?.name || 'Outros';
      });

    const dominantCategories = sortedCategorySpend.length > 0 ? sortedCategorySpend.slice(0, 3) : ['Alimentação', 'Investimento', 'Tecnologia'];

    // Retrieve active alerts to measure risk score & category warnings
    const alerts = financialObservers.generateAlerts();
    const alertTypes = alerts.map(a => a.type);

    let financialRisk = 'Mínimo';
    let riskMinus = 0;

    if (alertTypes.includes('risco_liquidez')) {
      financialRisk = 'Alto';
      riskMinus += 30;
    } else if (alertTypes.includes('projeção_ultrapassada') || alertTypes.includes('tendência_negativa')) {
      financialRisk = 'Moderado';
      riskMinus += 15;
    } else if (alertTypes.includes('risco_futuro')) {
      financialRisk = 'Baixo';
      riskMinus += 5;
    }

    // Health Score calculation (base 100)
    let score = 95;
    // Liquidity points
    if (reserveMonths >= 12) score += 5;
    else if (reserveMonths < 6) score -= 15;
    else if (reserveMonths < 2) score -= 30;

    // Negative impact for risks
    score -= riskMinus;

    // Budget deficit impact
    if (currentMonthExpenses > currentMonthIncome && currentMonthIncome > 0) {
      score -= 10;
    }

    // Safeguard score boundary
    const healthScore = Math.min(100, Math.max(10, score));

    // Dynamic pattern identification from semantic memory
    const semanticMemories = Object.values(financialSemanticEngine.getAllMemories());
    const emotions = semanticMemories.map(m => m.emotion);
    const behaviors = semanticMemories.map(m => m.behavior);

    let spendingPattern = 'Alocação equilibrada com foco em manutenção básica e ativos recorrentes.';
    if (emotions.includes('ansiedade') && behaviors.includes('compensação')) {
      spendingPattern = 'Padrão visível de compras compensatórias disparadas por episódios de ansiedade.';
    } else if (emotions.includes('exaustão') || behaviors.includes('recompensa-imediata')) {
      spendingPattern = 'Surgimento de custos sob demanda de recompensa imediata por fadiga ou sobrecarga profissional.';
    } else if (behaviors.includes('investimento')) {
      spendingPattern = 'Forte direcionamento de capital para expansão e crescimento patrimonial ativo.';
    }

    // High level trends string
    let trend = 'Estável';
    const historySnaps = financialHistoryEngine.getHistory();
    if (historySnaps.length >= 2) {
      const last = historySnaps[historySnaps.length - 1].netWorth;
      const prev = historySnaps[historySnaps.length - 2].netWorth;
      if (last > prev * 1.02) trend = 'Ascendente';
      else if (last < prev * 0.98) trend = 'Decrescente';
    }

    // Future projection narrative
    let futureProjection = `Com as taxas atuais de faturamento e consumo, sua reserva líquida de emergência cobrirá confortavelmente os próximos ${reserveMonths} meses de manutenção.`;
    if (reserveMonths < 6) {
      futureProjection = 'Alerta: Suas reservas líquidas encontram-se abaixo do nível ideal de segurança de 6 meses de despesa operacional.';
    } else if (trend === 'Ascendente') {
      futureProjection = 'Ritmo atual projeta consolidação contínua do patrimônio com potencial de investimentos futuros abundantes.';
    }

    const state: CognitiveFinanceState = {
      healthScore,
      burnRate,
      reserveMonths,
      trend,
      dominantCategories,
      financialRisk,
      futureProjection,
      spendingPattern
    };

    this.cachedState = state;
    safeLocalStorage.setItem(MEMORY_KEY, JSON.stringify(state));
    return state;
  }

  public invalidate() {
    this.cachedState = null;
    safeLocalStorage.removeItem(MEMORY_KEY);
  }
}

export const financialCognitiveEngine = new FinancialCognitiveEngine();
