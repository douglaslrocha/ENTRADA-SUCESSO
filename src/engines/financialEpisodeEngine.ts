import { db } from '../services/db';
import { safeLocalStorage } from '../utils/storage';
import { Transaction, CategoryType } from '../types';

export interface FinancialEpisode {
  period: string;
  event: string;
  impact: number;
  meaning: string;
  confidence: number;
}

const STORAGE_KEY = 'financial_episodes';

class FinancialEpisodeEngine {
  private episodes: FinancialEpisode[] = [];

  constructor() {
    this.loadEpisodes();
    if (this.episodes.length === 0) {
      this.seedDefaultEpisodes();
    }
  }

  private loadEpisodes() {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.episodes = JSON.parse(saved);
      } catch (e) {
        console.error('[FinancialEpisodeEngine] Erro ao carregar episódios', e);
        this.episodes = [];
      }
    }
  }

  private saveEpisodes() {
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(this.episodes));
  }

  private seedDefaultEpisodes() {
    this.episodes = [
      {
        period: 'Janeiro 2026',
        event: 'Aquisição da Range Rover Velar',
        impact: -450000,
        meaning: 'Realização patrimonial de luxo e mobilidade',
        confidence: 0.95
      },
      {
        period: 'Novembro 2025',
        event: 'Aquisição do Apartamento Jardins',
        impact: -1250000,
        meaning: 'Consolidação de ativo imobiliário de alto padrão',
        confidence: 0.98
      },
      {
        period: 'Março 2026',
        event: 'Grande despesa em infraestrutura e servidores da Amparadora',
        impact: -15000,
        meaning: 'Crescimento e investimento tecnológico no ecossistema cérebro',
        confidence: 0.9
      }
    ];
    this.saveEpisodes();
  }

  public detectEpisodes(transactions: Transaction[]) {
    // We group transactions by month to detect abnormal volume, huge single expenses, or high-income spikes
    const monthlyGroups: Record<string, { income: number; expenses: number; txs: Transaction[] }> = {};
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const categories = db.getCategories();

    transactions.forEach(t => {
      const date = new Date(t.date);
      if (isNaN(date.getTime())) return;
      const periodKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyGroups[periodKey]) {
        monthlyGroups[periodKey] = { income: 0, expenses: 0, txs: [] };
      }
      
      const val = Number(t.value || 0);
      const cat = categories.find(c => c.id === t.category_id);
      if (cat && cat.type === CategoryType.INCOME) {
        monthlyGroups[periodKey].income += val;
      } else {
        monthlyGroups[periodKey].expenses += val;
      }
      monthlyGroups[periodKey].txs.push(t);
    });

    // Detect major episodes
    const detected: FinancialEpisode[] = [...this.episodes];

    // 1. Scan for individual massive transactions (> R$5,000)
    transactions.forEach(t => {
      const val = Number(t.value || 0);
      if (Math.abs(val) >= 5000) {
        const date = new Date(t.date);
        const period = isNaN(date.getTime()) ? 'Recente' : `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        const cat = categories.find(c => c.id === t.category_id);
        const isIncome = cat && cat.type === CategoryType.INCOME;
        const direction = isIncome ? 'Recebimento de alto impacto' : 'Investimento/Despesa expressiva';
        const noteClean = t.note || 'Sem descrição específica';
        
        // Prevent duplicate detection for same transaction id/event
        const eventName = `${direction}: ${noteClean}`;
        if (!detected.some(e => e.event === eventName)) {
          detected.push({
            period,
            event: eventName,
            impact: isIncome ? val : -val,
            meaning: isIncome ? 'Expansão de liquidez' : 'Alocação estratégica de capital',
            confidence: 0.85
          });
        }
      }
    });

    // 2. Scan monthly aggregates for spikes
    Object.entries(monthlyGroups).forEach(([period, data]) => {
      if (data.expenses > 25000) {
        const eventName = `Pico mensal de custos operacionais`;
        if (!detected.some(e => e.period === period && e.event.includes('Pico mensal'))) {
          detected.push({
            period,
            event: `${eventName} (Total: R$ ${data.expenses.toFixed(2)})`,
            impact: -data.expenses,
            meaning: 'Saída concentrada de recursos ou investimento amortizado',
            confidence: 0.8
          });
        }
      }
    });

    // Sort to keep newest or seeded relevant ones first, maximum 10 episodes to keep tokens low
    this.episodes = detected.slice(0, 10);
    this.saveEpisodes();
  }

  public getEpisodes(): FinancialEpisode[] {
    return this.episodes;
  }

  public clear() {
    this.episodes = [];
    safeLocalStorage.removeItem(STORAGE_KEY);
  }
}

export const financialEpisodeEngine = new FinancialEpisodeEngine();
