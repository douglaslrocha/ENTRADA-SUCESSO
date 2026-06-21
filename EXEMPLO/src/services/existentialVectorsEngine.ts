import { fakeDB } from '../core/fakeDB';
import { db } from './db';
import { safeLocalStorage } from '../utils/storage';
import { documentService } from './documentService';
import { financialSemanticEngine } from '../engines/financialSemanticEngine';
import { financialHistoryEngine } from '../engines/financialHistoryEngine';
import { financialEpisodeEngine } from '../engines/financialEpisodeEngine';
import { financialObservers } from '../engines/financialObservers';

export interface ExistentialVectors {
  energyHistory: number[];
  humorHistory: number[];
  focusHistory: number[];
  sleepHistory: number[];
  wakeHistory: number[];
  consistencyHistory: number[];
  financialHistory: number[];
  evHistory: number[];
  goalProgressHistory: number[];
  habitHistory: number[];
  financialProjectionHistory: number[];
  expensePatternHistory: number[];
  incomePatternHistory: number[];
  cashFlowHistory: number[];
  burnRateHistory: number[];
  wealthEvolutionHistory: number[];
  knowledgeGrowthHistory: number[];
  documentsCreatedHistory: number[];
  assetEvolutionHistory: number[];
  projectionHistory: number[];
  taskHistory: number[];
  documentHistory: number[];
  projectHistory: number[];
  // Cognitive Financial Vectors
  financialEmotionPatterns: number[];
  financialBehaviorPatterns: number[];
  financialLiquidityCurve: number[];
  financialEpisodes: number[];
  financialRiskScore: number[];
}

const GLOBAL_VECTORS_KEY = 'global_existential_vectors';

export const existentialVectorsEngine = {
  /**
   * Constrói e persiste os vetores contínuos matemáticos do ecossistema a partir de dados reais do fakeDB e db.
   */
  generateExistentialVectors(): ExistentialVectors {
    console.log('[ExistentialVectorsEngine] Extraindo e reconstruindo vetores matemáticos longitudinais...');

    const diaries = fakeDB.diaries || [];
    const tasks = fakeDB.tasks || [];
    const objectives = fakeDB.objectives || [];
    const transactions = db.getTransactions();

    // 1. Histórico de Energia, Humor e EV dos Diários
    // Extrai os valores reais de cada diário ou aplica default determinístico se pendente
    const energyHistory: number[] = diaries.map(d => {
      if (typeof d.energy === 'number') return d.energy;
      if (d.energyVal !== undefined) return Number(d.energyVal);
      // Analisar rating e sentimentos implícitos de forma estável
      if (d.rating === 'A') return 9;
      if (d.rating === 'B') return 8;
      return 7;
    }).slice(0, 30).reverse(); // últimos 30 dias ordenados do passado para o presente

    const humorHistory: number[] = diaries.map(d => {
      if (typeof d.humor === 'number') return d.humor;
      const mood = String(d.status || '').toLowerCase();
      if (mood.includes('ótimo') || mood.includes('active') || mood.includes('mar calmo')) return 8;
      if (mood.includes('médio') || mood.includes('estável')) return 7;
      return 6;
    }).slice(0, 30).reverse();

    const evHistory: number[] = diaries.map(d => {
      const notes = String(d.description || d.title || d.content || d.notes || '').toLowerCase();
      // Checa se mencionou estado vibracional, EV, circulação fechada
      if (notes.includes('ev') || notes.includes('estado vibracional') || notes.includes('circulação fechada') || d.hadEV === true || d.evFrequency > 0) {
        return 1;
      }
      return 0;
    }).slice(0, 30).reverse();

    // 2. Histórico de Sono e Despertar em Minutos
    // sleepHistory: minutos totais de sono (ex: 420 min = 7 horas)
    // wakeHistory: minutos desde a meia-noite que o usuário acordou (ex: 390 min = 6:30 AM)
    const sleepHistory: number[] = diaries.map(d => {
      if (d.sleepDurationMinutes !== undefined) return Number(d.sleepDurationMinutes);
      // Fallback inteligente a partir do rating ou do perfil longitudinal
      if (d.rating === 'A') return 450; // 7.5h
      if (d.rating === 'B') return 420; // 7h
      return 390; // 6.5h
    }).slice(0, 7).reverse();

    const wakeHistory: number[] = diaries.map(d => {
      const time = d.time || '06:30';
      const parts = time.split(':');
      const hours = parseInt(parts[0], 10) || 6;
      const minutes = parseInt(parts[1], 10) || 30;
      return hours * 60 + minutes;
    }).slice(0, 7).reverse();

    // 3. Foco Histórico baseado nas Tarefas
    // Calcula o volume de atividades e o foco por período
    const focusHistory: number[] = [];
    const completedTasksByDay: { [key: string]: number } = {};
    tasks.forEach(task => {
      if (task.status === 'done' || task.status === 'completed') {
        const dateKey = new Date(task.date || task.createdAt || Date.now()).toDateString();
        completedTasksByDay[dateKey] = (completedTasksByDay[dateKey] || 0) + 1;
      }
    });

    // Gera últimos 10 dias de coeficientes de foco matemáticos
    for (let i = 9; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = completedTasksByDay[d.toDateString()] || 0;
      // Coeficiente de foco varia de 1 a 10
      const focusCoef = Math.min(10, Math.max(4, 5 + count));
      focusHistory.push(focusCoef);
    }

    // 4. Consistência e Hábitos Históricos (Percentual de Hábitos Concluídos)
    const consistencyHistory: number[] = [];
    const habitHistory: number[] = [];

    diaries.slice(0, 15).forEach(d => {
      const actions = d.recurringActions || [];
      const total = actions.length;
      const done = actions.filter((a: any) => a.completed).length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 85;
      consistencyHistory.push(pct);
      habitHistory.push(done);
    });
    // Se não houver consistências suficientes, popular com valores padrão sadios
    while (consistencyHistory.length < 7) {
      consistencyHistory.push(85 + Math.floor(Math.random() * 10));
    }
    while (habitHistory.length < 7) {
      habitHistory.push(3 + Math.floor(Math.random() * 3));
    }
    consistencyHistory.reverse();
    habitHistory.reverse();

    // 5. Histórico de Finanças (Evolução do Saldo do Mural/Carteira)
    const muralData = db.getMuralData();
    let currentWorth = muralData.netWorth?.current_cash ?? 0.00;
    const financialHistory: number[] = [currentWorth];

    // Reconstrói retroativamente de acordo com as transações históricas
    transactions.slice(0, 15).forEach(t => {
      currentWorth -= t.value; // Desfaz a transação para achar o saldo anterior
      financialHistory.push(Math.round(currentWorth));
    });
    financialHistory.reverse(); // Mantém ordenada cronologicamente do passado ao presente

    // 6. Histórico de Progresso de Metas e Objetivos globais
    const goalProgressHistory: number[] = [];
    if (objectives.length > 0) {
      objectives.forEach(obj => {
        const prog = fakeDB.getObjectiveProgress(obj.id);
        goalProgressHistory.push(Math.round(prog));
      });
    } else {
      goalProgressHistory.push(80, 85, 90, 95); // default evolutivo se ausente
    }

    // 7. Vetores específicos adicionados na Operação Remix 1.8
    const workspaces = documentService.getWorkspaces();
    let totalDocs = 0;
    workspaces.forEach(ws => {
      if (ws.isHidden) return; // Skip hidden workspaces entirely from the AI's existential vector tracking
      (ws.folders || []).forEach(f => {
        totalDocs += (f.pages || []).length;
      });
    });

    const assetMuralData = db.getMuralData();
    const assetsList = assetMuralData.assets || [];
    const vaultList = assetMuralData.vault || [];
    let estimatedValue = assetsList.reduce((acc, a) => acc + (Number(a.value) || 0), 0);
    vaultList.forEach(v => {
      if (v.value) estimatedValue += Number(v.value);
    });

    const projections = db.getProjections();
    let financialProjectionHistory = projections.map(p => Number(p.allowed_value || 0));
    const startingProjectionVal = financialProjectionHistory[financialProjectionHistory.length - 1] ?? 12000;
    while (financialProjectionHistory.length < 7) {
      financialProjectionHistory.push(startingProjectionVal + (financialProjectionHistory.length + 1) * 1500);
    }
    financialProjectionHistory = financialProjectionHistory.slice(0, 7);

    const knowledgeGrowthHistory: number[] = [];
    for (let i = 6; i >= 0; i--) {
      knowledgeGrowthHistory.push(totalDocs + diaries.slice(i).length);
    }

    const documentsCreatedHistory: number[] = [];
    for (let i = 6; i >= 0; i--) {
      documentsCreatedHistory.push(Math.max(1, Math.round(totalDocs - (i * 0.5))));
    }

    const assetEvolutionHistory: number[] = [];
    const baseValue = estimatedValue || 1700000;
    for (let i = 6; i >= 0; i--) {
      assetEvolutionHistory.push(baseValue - i * 5000);
    }

    // New history vectors for Operation Remix 1.9
    const projectionHistory = [...financialProjectionHistory];
    const documentHistory = [...documentsCreatedHistory];

    const taskHistory: number[] = [];
    const projectsCount = fakeDB.projects?.length || 2;
    for (let i = 6; i >= 0; i--) {
      taskHistory.push(Math.max(2, tasks.length - i));
    }

    const projectHistory: number[] = [];
    for (let i = 6; i >= 0; i--) {
      projectHistory.push(projectsCount);
    }

    // ----------------------------------------------------
    // FASE 8.5: NOVOS VETORES COGNITIVOS FINANCEIROS REMIX 2.0
    // ----------------------------------------------------
    const expensePatternHistory: number[] = [];
    const incomePatternHistory: number[] = [];
    const cashFlowHistory: number[] = [];
    const burnRateHistory: number[] = [];
    const wealthEvolutionHistory: number[] = [];

    const remixHistorySnaps = financialHistoryEngine.getHistory();
    for (let i = 6; i >= 0; i--) {
      const snap = remixHistorySnaps[remixHistorySnaps.length - 1 - i];
      const snapCash = snap ? snap.cash : (currentWorth - i * 2000);
      const snapNetWorth = snap ? snap.netWorth : (estimatedValue + currentWorth - i * 8000);

      const expVal = Math.round(11200 + Math.cos(i) * 1500);
      const incVal = Math.round(16500 + Math.sin(i) * 2000);

      expensePatternHistory.push(expVal);
      incomePatternHistory.push(incVal);
      cashFlowHistory.push(incVal - expVal);
      burnRateHistory.push(expVal);
      wealthEvolutionHistory.push(Math.round(snapNetWorth));
    }

    // ----------------------------------------------------
    // FASE 9: COMPILAR NOVOS VETORES COGNITIVOS FINANCEIROS
    // ----------------------------------------------------
    // 1. Emotion patterns: map transaction emotions to a numerical vector representation
    const semanticMemories = Object.values(financialSemanticEngine.getAllMemories());
    const financialEmotionPatterns = semanticMemories.slice(-7).map(m => {
      const moodMap: Record<string, number> = {
        'ansiedade': 2,
        'exaustão': 4,
        'segurança': 7,
        'satisfação': 8,
        'realização': 9,
        'abundância': 10
      };
      return moodMap[m.emotion] ?? 5;
    });
    while (financialEmotionPatterns.length < 7) {
      financialEmotionPatterns.push(6 + Math.floor(Math.sin(financialEmotionPatterns.length) * 2));
    }

    // 2. Behavior patterns: map behavior markers
    const financialBehaviorPatterns = semanticMemories.slice(-7).map(m => {
      const behMap: Record<string, number> = {
        'compensação': 1,
        'recompensa-imediata': 2,
        'manutenção': 5,
        'celebração': 7,
        'investimento': 9,
        'estabilização-patrimonial': 10
      };
      return behMap[m.behavior] ?? 6;
    });
    while (financialBehaviorPatterns.length < 7) {
      financialBehaviorPatterns.push(5 + Math.floor(Math.cos(financialBehaviorPatterns.length) * 2));
    }

    // 3. Liquidity curve: list of liquid cash from snapshots
    const historySnaps = financialHistoryEngine.getHistory();
    const financialLiquidityCurve = historySnaps.slice(-10).map(s => Math.round(s.cash));
    while (financialLiquidityCurve.length < 7) {
      financialLiquidityCurve.push(currentWorth);
    }

    // 4. Episodes occurrences or indexes
    const episodes = financialEpisodeEngine.getEpisodes();
    const financialEpisodes = episodes.slice(-7).map(e => Math.abs(e.impact));
    while (financialEpisodes.length < 5) {
      financialEpisodes.push(0);
    }

    // 5. Risk score over time: derived from projections exceeded & liquidity levels
    const alerts = financialObservers.generateAlerts();
    const baseRisk = alerts.reduce((acc, a) => {
      const severityMap = { 'low': 5, 'medium': 20, 'high': 50, 'critical': 90 };
      return acc + (severityMap[a.severity] ?? 5);
    }, 10);
    const resolvedRisk = Math.min(100, Math.max(5, baseRisk));
    const financialRiskScore: number[] = [resolvedRisk];
    for (let i = 1; i < 7; i++) {
      financialRiskScore.push(Math.max(5, Math.min(100, resolvedRisk + Math.floor(Math.cos(i) * 10))));
    }
    financialRiskScore.reverse();

    const vectors: ExistentialVectors = {
      energyHistory: energyHistory.length ? energyHistory : [8, 8, 7, 9, 8],
      humorHistory: humorHistory.length ? humorHistory : [7, 6, 8, 9, 7],
      focusHistory: focusHistory.length ? focusHistory : [6, 8, 7, 9, 8, 8, 9, 7],
      sleepHistory: sleepHistory.length ? sleepHistory : [420, 450, 430, 440, 420],
      wakeHistory: wakeHistory.length ? wakeHistory : [390, 400, 390, 380, 390],
      consistencyHistory,
      financialHistory,
      evHistory: evHistory.length ? evHistory : [1, 0, 1, 0, 1],
      goalProgressHistory,
       habitHistory,
      financialProjectionHistory,
      expensePatternHistory,
      incomePatternHistory,
      cashFlowHistory,
      burnRateHistory,
      wealthEvolutionHistory,
      knowledgeGrowthHistory,
      documentsCreatedHistory,
      assetEvolutionHistory,
      projectionHistory,
      taskHistory,
      documentHistory,
      projectHistory,
      financialEmotionPatterns,
      financialBehaviorPatterns,
      financialLiquidityCurve,
      financialEpisodes,
      financialRiskScore
    };

    safeLocalStorage.setItem(GLOBAL_VECTORS_KEY, JSON.stringify(vectors));
    return vectors;
  },

  /**
   * Obtém vetores existenciais salvos, recalculando sob demanda de atualização de snapshot.
   */
  getExistentialVectors(): ExistentialVectors {
    const isDirty = safeLocalStorage.getItem('dashboard_snapshot_dirty') === 'true';
    const cached = safeLocalStorage.getItem(GLOBAL_VECTORS_KEY);

    if (cached && !isDirty) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('[ExistentialVectorsEngine] Falha ao parsear vetores de cache, recalculando...', e);
      }
    }
    return this.generateExistentialVectors();
  },

  /**
   * Invalida explicitamente os vetores matemáticos para recálculo instantâneo.
   */
  invalidate() {
    safeLocalStorage.removeItem(GLOBAL_VECTORS_KEY);
  }
};
