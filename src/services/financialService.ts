import { Category, Transaction } from '../types';
import { supabase, camelToSnake, snakeToCamel } from './supabaseClient';

export const financialService = {
  /**
   * Obtém todo o conjunto de dados financeiros unificados do Supabase
   */
  async getFinancialData(): Promise<{
    categories: Category[];
    transactions: Transaction[];
    projections: any[];
    mural: {
      netWorth: { current_cash: number };
      assets: any[];
      vault: any[];
      links: any[];
    };
  }> {
    const { data: catData } = await supabase.from('financial_categories').select('*');
    const { data: transData } = await supabase.from('financial_transactions').select('*');
    const { data: projData } = await supabase.from('financial_projections').select('*');
    const { data: muralData } = await supabase.from('financial_mural').select('*').limit(1);

    const categories = (catData || []).map(c => snakeToCamel(c));
    const transactions = (transData || []).map(t => snakeToCamel(t));
    const projections = (projData || []).map(p => snakeToCamel(p));

    let mural = {
      netWorth: { current_cash: 0.00 },
      assets: [],
      vault: [],
      links: []
    };

    if (muralData && muralData.length > 0) {
      const rawMural = snakeToCamel(muralData[0]);
      try {
        mural.netWorth = typeof rawMural.netWorth === 'string' ? JSON.parse(rawMural.netWorth) : rawMural.netWorth;
      } catch {}
      try {
        mural.assets = typeof rawMural.assets === 'string' ? JSON.parse(rawMural.assets) : rawMural.assets;
      } catch {}
      try {
        mural.vault = typeof rawMural.vault === 'string' ? JSON.parse(rawMural.vault) : rawMural.vault;
      } catch {}
      try {
        mural.links = typeof rawMural.links === 'string' ? JSON.parse(rawMural.links) : rawMural.links;
      } catch {}
    }

    return {
      categories,
      transactions,
      projections,
      mural
    };
  },

  /**
   * Sincroniza em lote todo o estado financeiro local
   */
  async syncFinancialData(payload: {
    categories: Category[];
    transactions: Transaction[];
    projections: any[];
    mural: any;
  }): Promise<{ success: boolean }> {
    try {
      if (payload.categories?.length) {
        await supabase.from('financial_categories').upsert(payload.categories.map(c => camelToSnake(c)));
      }
      if (payload.transactions?.length) {
        await supabase.from('financial_transactions').upsert(payload.transactions.map(t => camelToSnake(t)));
      }
      if (payload.projections?.length) {
        await supabase.from('financial_projections').upsert(payload.projections.map(p => camelToSnake(p)));
      }
      if (payload.mural) {
        await this.saveMural(payload.mural);
      }
      return { success: true };
    } catch (e) {
      console.error('[FinancialService] Erro no syncFinancialData:', e);
      return { success: false };
    }
  },

  /**
   * Salva ou atualiza uma categoria
   */
  async saveCategory(id: string, category: Omit<Category, 'id'>): Promise<any> {
    const dbPayload = camelToSnake({ ...category, id });
    const { data, error } = await supabase.from('financial_categories').upsert(dbPayload).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Remove uma categoria
   */
  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase.from('financial_categories').delete().eq('id', id);
    return !error;
  },

  /**
   * Salva ou atualiza uma transação
   */
  async saveTransaction(id: string, transaction: Omit<Transaction, 'id'>): Promise<any> {
    const dbPayload = camelToSnake({ ...transaction, id });
    const { data, error } = await supabase.from('financial_transactions').upsert(dbPayload).select().single();
    if (error) throw error;
    return snakeToCamel(data);
  },

  /**
   * Remove uma transação
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
    return !error;
  },

  /**
   * Salva ou atualiza uma projeção (cota) de orçamento
   */
  async saveProjection(projection: {
    category_id: string;
    allowed_value: number;
    month: number;
    year: number;
  }): Promise<any> {
    const { data, error } = await supabase.from('financial_projections').upsert(projection).select().single();
    if (error) throw error;
    return data;
  },

  /**
   * Salva os dados consolidados do Mural do Sucesso
   */
  async saveMural(mural: {
    netWorth: { current_cash: number };
    assets: any[];
    vault: any[];
    links: any[];
  }): Promise<any> {
    const dbPayload = {
      user_id: 'default',
      net_worth: JSON.stringify(mural.netWorth),
      assets: JSON.stringify(mural.assets),
      vault: JSON.stringify(mural.vault),
      links: JSON.stringify(mural.links)
    };
    const { data, error } = await supabase.from('financial_mural').upsert(dbPayload).select().single();
    if (error) throw error;
    return data;
  },
};
