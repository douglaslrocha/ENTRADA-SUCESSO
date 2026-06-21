import { Transaction, Category, CategoryType, ExistentialInsight } from '../types';

export const existentialFinancialService = {
  calculateExistentialInsight(
    transactions: Transaction[],
    categories: Category[]
  ): ExistentialInsight {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Filter transactions to the last full month
    const lastMonthTransactions = transactions.filter(t => new Date(t.date) >= lastMonthStart && new Date(t.date) < new Date(now.getFullYear(), now.getMonth(), 1));

    let income = 0;
    let essentialExpenses = 0;
    let cuttableExpenses = 0;

    lastMonthTransactions.forEach(t => {
      const cat = categories.find(c => c.id === t.category_id);
      if (cat?.type === CategoryType.INCOME) {
        income += t.value;
      } else if (cat?.type === CategoryType.ESSENTIAL) {
        essentialExpenses += Math.abs(t.value);
      } else if (cat?.type === CategoryType.CUTTABLE) {
        cuttableExpenses += Math.abs(t.value);
      }
    });

    const totalExpenses = essentialExpenses + cuttableExpenses;
    const netCash = income - totalExpenses; // Monthly surplus

    // Simple runway estimation: (Liquid Assets Placeholder) / Monthly Expenses
    // For now, let's assume assets are tracked elsewhere, using monthly surplus to 
    // estimate runway of "new freedom" bought.
    const runwayMonths = totalExpenses > 0 ? (income / totalExpenses) : 12;

    const evolutionRatio = income > 0 ? (Math.max(0, income - essentialExpenses) / income) : 0;
    
    let status: 'critical' | 'stable' | 'thriving' = 'stable';
    if (runwayMonths < 3) status = 'critical';
    else if (runwayMonths > 6) status = 'thriving';
    
    return {
      runwayMonths: parseFloat(runwayMonths.toFixed(1)),
      evolutionRatio: parseFloat(evolutionRatio.toFixed(2)),
      status
    };
  },

  calculateAverageMonthlyExpense(transactions: Transaction[], categories: Category[]): number {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const expenseTransactions = transactions.filter(t => {
      const cat = categories.find(c => c.id === t.category_id);
      return cat && cat.type !== CategoryType.INCOME;
    });

    const recentExpenses = expenseTransactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= thirtyDaysAgo && tDate <= now;
    });

    const sumRecent = recentExpenses.reduce((sum, t) => sum + t.value, 0);
    if (sumRecent > 0) {
      return Math.round(sumRecent);
    }

    if (expenseTransactions.length > 0) {
      const dates = expenseTransactions.map(t => new Date(t.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const timespanDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
      const totalExp = expenseTransactions.reduce((sum, t) => sum + t.value, 0);
      const calculatedMonthly = Math.round((totalExp / timespanDays) * 30);
      if (calculatedMonthly > 100) return calculatedMonthly;
    }

    return 4500;
  }
};
