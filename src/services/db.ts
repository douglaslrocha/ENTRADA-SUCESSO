import { Category, CategoryType, Transaction } from '../types';
import { safeLocalStorage } from '../utils/storage';
import { financialObservers } from '../engines/financialObservers';
import { organismEventBus } from './organismEventBus';
import { financialEpisodeEngine } from '../engines/financialEpisodeEngine';
import { financialService } from './financialService';
import { api } from './api';

class Database {
  private categories: Category[] = [];
  private transactions: Transaction[] = [];

  constructor() {
    // Load from localStorage if available
    const savedCategories = safeLocalStorage.getItem('categories');
    const savedTransactions = safeLocalStorage.getItem('transactions');
    
    if (savedCategories) this.categories = JSON.parse(savedCategories);
    if (savedTransactions) this.transactions = JSON.parse(savedTransactions);

    // Silent migration to schema_v2
    setTimeout(() => {
      try {
        financialObservers.migrateSchemaV2();
      } catch (e) {
        console.error('[Database] Falha ao disparar migração schema_v2', e);
      }
    }, 100);
  }

  private save() {
    safeLocalStorage.setItem('categories', JSON.stringify(this.categories));
    safeLocalStorage.setItem('transactions', JSON.stringify(this.transactions));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
  }

  /**
   * Sincroniza com o backend carregando os dados na inicialização
   */
  async syncWithBackend() {
    try {
      console.log('[Database] Sincronizando finanças com o backend...');
      const data = await financialService.getFinancialData();
      
      // Se tiver dados no backend, atualiza o cache local
      if (data.categories && data.categories.length > 0) {
        this.categories = data.categories;
        safeLocalStorage.setItem('categories', JSON.stringify(data.categories));
      }
      if (data.transactions) {
        this.transactions = data.transactions;
        safeLocalStorage.setItem('transactions', JSON.stringify(data.transactions));
      }
      if (data.projections) {
        safeLocalStorage.setItem('projections', JSON.stringify(data.projections));
      }
      if (data.mural) {
        safeLocalStorage.setItem('mural_data', JSON.stringify(data.mural));
      }
      
      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      financialObservers.refreshCognitiveIndexes();
      financialObservers.invalidate();
      financialObservers.rebuild();
      financialObservers.notifyChange();
      organismEventBus.emit('transactionUpdated', this.transactions);
      
      console.log('[Database] Sincronização de finanças concluída com sucesso.');
    } catch (error) {
      console.warn('[Database] Falha ao sincronizar finanças com o backend (usando offline cache):', error);
    }
  }

  /**
   * Pushes the current local state to the backend in batch
   */
  private async pushToBackend() {
    try {
      const mural = this.getMuralData();
      const projections = this.getProjections();
      await financialService.syncFinancialData({
        categories: this.categories,
        transactions: this.transactions,
        projections,
        mural
      });
    } catch (e) {
      console.warn('[Database] Falha ao empurrar lote de finanças para o backend:', e);
    }
  }

  getMuralData(): { netWorth: any; assets: any[]; vault: any[]; links: any[] } {
    const saved = safeLocalStorage.getItem('mural_data');
    const defaults = {
      netWorth: { current_cash: 0.00 },
      assets: [],
      vault: [],
      links: []
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          netWorth: parsed.netWorth ?? defaults.netWorth,
          assets: parsed.assets ?? defaults.assets,
          vault: parsed.vault ?? defaults.vault,
          links: parsed.links ?? defaults.links
        };
      } catch (e) {
        console.error("Error parsing mural data", e);
        return defaults;
      }
    }
    
    return defaults;
  }

  saveMuralData(data: { netWorth: any; assets: any[]; vault: any[]; links: any[] }) {
    safeLocalStorage.setItem('mural_data', JSON.stringify(data));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    financialObservers.assetChanged(data.assets);
    financialObservers.vaultChanged(data.vault);
    organismEventBus.emit('assetUpdated', data.assets);
    organismEventBus.emit('vaultUpdated', data.vault);

    // Salva no backend em background
    financialService.saveMural(data).catch(e => console.warn(e));
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  addCategory(category: Omit<Category, 'id'>) {
    const newCategory = {
      ...category,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.categories.push(newCategory);
    this.save();

    // Salva no backend em background
    financialService.saveCategory(newCategory.id, category).catch(e => console.warn(e));

    return newCategory;
  }

  deleteCategory(id: string) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.save();

    // Salva no backend em background
    financialService.deleteCategory(id).catch(e => console.warn(e));
  }

  reorderCategories(newOrder: Category[]) {
    this.categories = newOrder;
    this.save();

    // Sincroniza ordem completa em background
    this.pushToBackend().catch(e => console.warn(e));
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9)
    };
    this.transactions.push(newTransaction);
    this.save();
    financialObservers.transactionCreated(newTransaction);
    organismEventBus.emit('transactionCreated', newTransaction);

    // Salva no backend em background
    financialService.saveTransaction(newTransaction.id, transaction).catch(e => console.warn(e));

    return newTransaction;
  }

  updateTransaction(id: string, updatedFields: Partial<Transaction>) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index > -1) {
      this.transactions[index] = {
        ...this.transactions[index],
        ...updatedFields
      };
      this.save();
      financialObservers.transactionUpdated(this.transactions[index]);
      organismEventBus.emit('transactionUpdated', this.transactions[index]);

      // Salva no backend em background
      const updated = this.transactions[index];
      financialService.saveTransaction(id, {
        value: updated.value,
        category_id: updated.category_id,
        date: updated.date,
        note: updated.note
      }).catch(e => console.warn(e));

      return this.transactions[index];
    }
    return null;
  }

  deleteTransaction(id: string) {
    const tx = this.transactions.find(t => t.id === id);
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
    if (tx) {
      financialObservers.transactionUpdated(tx);
      organismEventBus.emit('transactionDeleted', tx);
    }

    // Salva no backend em background
    financialService.deleteTransaction(id).catch(e => console.warn(e));
  }

  saveAllTransactions(transactions: Transaction[]) {
    this.transactions = JSON.parse(JSON.stringify(transactions));
    this.save();
    financialObservers.refreshCognitiveIndexes();
    financialObservers.invalidate();
    financialObservers.rebuild();
    financialObservers.notifyChange();
    organismEventBus.emit('transactionUpdated', transactions);

    // Sincroniza em background
    this.pushToBackend().catch(e => console.warn(e));
  }

  getProjections(): any[] {
    const saved = safeLocalStorage.getItem('projections');
    return saved ? JSON.parse(saved) : [];
  }

  saveProjection(projection: { category_id: string; allowed_value: number; month: number; year: number }) {
    const projections = this.getProjections();
    const index = projections.findIndex(p => 
      p.category_id === projection.category_id && 
      p.month === projection.month && 
      p.year === projection.year
    );

    if (index > -1) {
      projections[index] = projection;
    } else {
      projections.push(projection);
    }

    safeLocalStorage.setItem('projections', JSON.stringify(projections));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    financialObservers.projectionChanged(projection);
    organismEventBus.emit('projectionUpdated', projection);

    // Salva no backend em background
    financialService.saveProjection(projection).catch(e => console.warn(e));
  }

  public resetToFirstInstallation() {
    this.categories = [];
    this.transactions = [];
    safeLocalStorage.removeItem('categories');
    safeLocalStorage.removeItem('transactions');
    safeLocalStorage.removeItem('mural_data');
    safeLocalStorage.removeItem('projections');
    safeLocalStorage.removeItem('dashboard_snapshot_dirty');
    safeLocalStorage.removeItem('dashboard_snapshot');
    safeLocalStorage.removeItem('financial_schema_v2');
    try {
      financialEpisodeEngine.clear();
    } catch (e) {
      console.error(e);
    }
    this.save();
    organismEventBus.emit('systemReset');

    // Sincroniza exclusão no backend
    api.delete('/api/system/reset/financial')
      .catch(e => console.warn('[Database] Erro ao resetar financeiro no backend:', e));
  }

  public resetFinancialHistory() {
    this.transactions = [];
    safeLocalStorage.removeItem('transactions');
    safeLocalStorage.removeItem('projections');
    
    const mural = this.getMuralData();
    mural.assets = [];
    mural.vault = [];
    mural.links = [];
    mural.netWorth = { current_cash: 0.00 };
    this.saveMuralData(mural);
    
    safeLocalStorage.removeItem('financial_semantic_memory');
    safeLocalStorage.removeItem('transaction_fingerprint_cache');
    safeLocalStorage.removeItem('global_cognitive_finance_cache');
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    try {
      financialEpisodeEngine.clear();
    } catch (e) {
      console.error(e);
    }
    this.save();
    organismEventBus.emit('systemReset');

    // Sincroniza exclusão no backend
    api.delete('/api/system/reset/financial')
      .catch(e => console.warn('[Database] Erro ao resetar financeiro no backend:', e));
  }

  public resetAssetsOnly() {
    const mural = this.getMuralData();
    mural.assets = [];
    this.saveMuralData(mural);
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
  }

  public resetVaultOnly() {
    const mural = this.getMuralData();
    mural.vault = [];
    this.saveMuralData(mural);
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
  }

  public resetLinksOnly() {
    const mural = this.getMuralData();
    mural.links = [];
    this.saveMuralData(mural);
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    organismEventBus.emit('cognitiveChanged');
  }
}

export const db = new Database();
