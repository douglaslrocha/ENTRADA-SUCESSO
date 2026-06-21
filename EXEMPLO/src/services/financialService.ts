import { Category, Transaction } from '../types';

const API_BASE = '/api/financial';

async function apiFetch(path: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': 'default',
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.warn('[FinancialService] Erro na API financeira:', error);
    throw error;
  }
}

export const financialService = {
  /**
   * Obtém todo o conjunto de dados financeiros unificados
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
    return await apiFetch('');
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
    return await apiFetch('/sync', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Salva ou atualiza uma categoria
   */
  async saveCategory(id: string, category: Omit<Category, 'id'>): Promise<any> {
    return await apiFetch(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  },

  /**
   * Remove uma categoria
   */
  async deleteCategory(id: string): Promise<boolean> {
    const data = await apiFetch(`/categories/${id}`, {
      method: 'DELETE',
    });
    return !!data.success;
  },

  /**
   * Salva ou atualiza uma transação
   */
  async saveTransaction(id: string, transaction: Omit<Transaction, 'id'>): Promise<any> {
    return await apiFetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    });
  },

  /**
   * Remove uma transação
   */
  async deleteTransaction(id: string): Promise<boolean> {
    const data = await apiFetch(`/transactions/${id}`, {
      method: 'DELETE',
    });
    return !!data.success;
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
    return await apiFetch('/projections', {
      method: 'PUT',
      body: JSON.stringify(projection),
    });
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
    return await apiFetch('/mural', {
      method: 'PUT',
      body: JSON.stringify(mural),
    });
  },
};
