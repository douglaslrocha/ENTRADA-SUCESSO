import { financialHistoryEngine } from './financialHistoryEngine';
import { financialEpisodeEngine } from './financialEpisodeEngine';
import { assetCognitiveIndex } from './assetCognitiveIndex';
import { CategoryType } from '../types';
import { vaultSemanticMap } from './vaultSemanticMap';
import { financialSemanticEngine } from './financialSemanticEngine';

export interface FinancialAlert {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class FinancialObservers {
  public transactionCreated(tx: any) {
    console.log('[FinancialObservers] Listener ativado: transactionCreated', tx);
    this.refreshCognitiveIndexes();
    this.invalidate();
    this.rebuild();
    this.notifyChange();
  }

  public transactionUpdated(tx: any) {
    console.log('[FinancialObservers] Listener ativado: transactionUpdated', tx);
    this.refreshCognitiveIndexes();
    this.invalidate();
    this.rebuild();
    this.notifyChange();
  }

  public projectionChanged(projection: any) {
    console.log('[FinancialObservers] Listener ativado: projectionChanged', projection);
    this.refreshCognitiveIndexes();
    this.invalidate();
    this.rebuild();
    this.notifyChange();
  }

  public assetChanged(asset: any) {
    console.log('[FinancialObservers] Listener ativado: assetChanged', asset);
    this.refreshCognitiveIndexes();
    this.invalidate();
    this.rebuild();
    this.notifyChange();
  }

  public vaultChanged(vault: any) {
    console.log('[FinancialObservers] Listener ativado: vaultChanged', vault);
    this.refreshCognitiveIndexes();
    this.invalidate();
    this.rebuild();
    this.notifyChange();
  }

  public invalidate() {
    console.log('[FinancialObservers] Invalidando caches cognitivos...');
    import('../services/financialCognitiveEngine').then(({ financialCognitiveEngine }) => {
      financialCognitiveEngine.invalidate();
    }).catch(e => console.error('[FinancialObservers] Falha ao invalidar financialCognitiveEngine', e));

    import('../services/existentialCoreEngine').then(({ existentialCoreEngine }) => {
      existentialCoreEngine.invalidate();
    }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialCoreEngine', e));

    import('../services/existentialVectorsEngine').then(({ existentialVectorsEngine }) => {
      existentialVectorsEngine.invalidate();
    }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialVectorsEngine', e));
  }

  public rebuild() {
    console.log('[FinancialObservers] Reconstruindo modelos cognitivos...');
    import('../services/financialCognitiveEngine').then(({ financialCognitiveEngine }) => {
      financialCognitiveEngine.rebuildIntelligence();
    }).catch(e => console.error('[FinancialObservers] Falha ao reconstruir financialCognitiveEngine', e));

    import('../services/existentialVectorsEngine').then(({ existentialVectorsEngine }) => {
      existentialVectorsEngine.generateExistentialVectors();
    }).catch(e => console.error('[FinancialObservers] Falha ao reconstruir existentialVectorsEngine', e));
  }

  public refreshCognitiveIndexes() {
    console.log('[FinancialObservers] Atualizando índices cognitivos semânticos...');
    assetCognitiveIndex.refreshIndex();
    vaultSemanticMap.refreshMap();
  }

  public notifyChange() {
    console.log('[FinancialObservers] Mudança financeira ativa detectada. Sincronizando... 🧠');
    
    try {
      // 1. Take snapshot
      financialHistoryEngine.takeSnapshot();
      
      // 2. Refreshes indexes
      assetCognitiveIndex.refreshIndex();
      vaultSemanticMap.refreshMap();
      
      // Double check circular import avoidance to scan transactions
      import('../services/db').then(({ db }) => {
        const txs = db.getTransactions();
        // 3. Detect episodic milestones
        financialEpisodeEngine.detectEpisodes(txs);
      }).catch(err => {
        console.error('[FinancialObservers] Erro ao carregar transações dinamicamente', err);
      });

      // 4. Invalidate existential caches
      import('../services/existentialCoreEngine').then(({ existentialCoreEngine }) => {
        existentialCoreEngine.invalidate();
      }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialCoreEngine no notify', e));

      import('../services/existentialVectorsEngine').then(({ existentialVectorsEngine }) => {
        existentialVectorsEngine.invalidate();
      }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialVectorsEngine no notify', e));
      
      // Dispatch a standard custom event for background systems
      window.dispatchEvent(new CustomEvent('financial_schema_v2_updated'));
      
    } catch (e) {
      console.error('[FinancialObservers] Erro ao sincronizar observador', e);
    }
  }

  public generateAlerts(): FinancialAlert[] {
    const alerts: FinancialAlert[] = [];
    
    try {
      // We load db dynamically to avoid circular references at boot time
      const savedProjections = localStorage.getItem('projections');
      const savedTransactions = localStorage.getItem('transactions');
      const savedCategories = localStorage.getItem('categories');
      const savedMural = localStorage.getItem('mural_data');

      const projections = savedProjections ? JSON.parse(savedProjections) : [];
      const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
      const categories = savedCategories ? JSON.parse(savedCategories) : [];
      const muralData = savedMural ? JSON.parse(savedMural) : {};

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // 1. Calculate spending per category in current month
      const categorySpending: Record<string, number> = {};
      transactions.forEach((t: any) => {
        const date = new Date(t.date);
        if (!isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          const val = Number(t.value || 0);
          const cat = categories.find((c: any) => c.id === t.category_id);
          if (cat && cat.type !== CategoryType.INCOME) {
            categorySpending[t.category_id] = (categorySpending[t.category_id] || 0) + val;
          }
        }
      });

      // Compare spending to projections
      projections.forEach((p: any) => {
        const limit = Number(p.allowed_value || 0);
        const spent = categorySpending[p.category_id] || 0;
        const catName = categories.find((c: any) => c.id === p.category_id)?.name || 'Geral';

        if (spent > limit) {
          alerts.push({
            type: 'projeção_ultrapassada',
            message: `PROJEÇÃO ULTRAPASSADA: Gastos em "${catName}" atingiram R$ ${spent.toFixed(2)}, rompendo o limite planejado de R$ ${limit.toFixed(2)}.`,
            severity: 'high'
          });
        } else if (spent > limit * 0.8) {
          alerts.push({
            type: 'risco_futuro',
            message: `PREVISÃO DE LIMITE: Gastos em "${catName}" já atingiram 80% do teto estipulado (R$ ${spent.toFixed(2)} / R$ ${limit.toFixed(2)}).`,
            severity: 'medium'
          });
        }
      });

      // 2. Budget status (Deficit monitoring)
      let currentMonthIncome = 0;
      let currentMonthExpenses = 0;
      transactions.forEach((t: any) => {
        const date = new Date(t.date);
        if (!isNaN(date.getTime()) && date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
          const val = Number(t.value || 0);
          const cat = categories.find((c: any) => c.id === t.category_id);
          if (cat && cat.type === CategoryType.INCOME) {
            currentMonthIncome += val;
          } else if (cat) {
            currentMonthExpenses += val;
          }
        }
      });

      if (currentMonthExpenses > currentMonthIncome && currentMonthIncome > 0) {
        alerts.push({
          type: 'tendência_negativa',
          message: `TENDÊNCIA NEGATIVA: Rompimento do fluxo positivo! Saídas (R$ ${currentMonthExpenses.toFixed(2)}) superam as entradas (R$ ${currentMonthIncome.toFixed(2)}) neste período.`,
          severity: 'high'
        });
      }

      // 3. Liquidity risk analysis
      const currentCash = Number(muralData.netWorth?.current_cash || 0);
      let totalAssets = 0;
      (muralData.assets || []).forEach((a: any) => { totalAssets += Number(a.value || 0); });
      const netWorth = currentCash + totalAssets;

      if (netWorth > 0 && (currentCash / netWorth) < 0.08) {
        alerts.push({
          type: 'risco_liquidez',
          message: `DESVIO DE PLANEJAMENTO: Imobilização excessiva (ativos confinados representam mais de 92% do patrimônio líquido), reduzindo drasticamente a flexibilidade.`,
          severity: 'critical'
        });
      }
    } catch (e) {
      console.error('[FinancialObservers] Erro ao analisar alertas', e);
    }

    // Default alarm backup if no specific issues
    if (alerts.length === 0) {
      alerts.push({
        type: 'estabilidade',
        message: 'Todas as projeções e metas financeiras operam dentro da margem de segurança.',
        severity: 'low'
      });
    }

    return alerts;
  }

  public migrateSchemaV2() {
    const version = localStorage.getItem('financial_schema_v2');
    if (!version) {
      console.log('[FinancialObservers] Iniciando migração silenciosa para financial_schema_v2...');
      try {
        import('../services/db').then(({ db }) => {
          const txs = db.getTransactions();
          financialSemanticEngine.syncAllTransactions(txs);
          financialHistoryEngine.takeSnapshot();
          financialEpisodeEngine.detectEpisodes(txs);
          assetCognitiveIndex.refreshIndex();
          vaultSemanticMap.refreshMap();
          
          import('../services/existentialCoreEngine').then(({ existentialCoreEngine }) => {
            existentialCoreEngine.invalidate();
          }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialCoreEngine na migracao', e));

          import('../services/existentialVectorsEngine').then(({ existentialVectorsEngine }) => {
            existentialVectorsEngine.invalidate();
          }).catch(e => console.error('[FinancialObservers] Falha ao invalidar existentialVectorsEngine na migracao', e));
          
          localStorage.setItem('financial_schema_v2', 'true');
          console.log('[FinancialObservers] Migração para financial_schema_v2 finalizada com sucesso! 🎉');
        }).catch(err => {
          console.error('[FinancialObservers] Erro ao importar banco de dados para migração', err);
        });
      } catch (e) {
        console.error('[FinancialObservers] Erro na migração silenciosa', e);
      }
    }
  }
}

export const financialObservers = new FinancialObservers();
