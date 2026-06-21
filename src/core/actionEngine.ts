import { fakeDB } from './fakeDB';
import { db } from '../services/db';
import { CategoryType } from '../types';
import { fingerprintService } from '../services/fingerprintService';

function parsePortugueseNumber(cleanStr: string): number | null {
  if (!cleanStr) return null;
  // If there's a comma:
  if (cleanStr.includes(',')) {
    // Remove all dots (thousands separators)
    const noDots = cleanStr.replace(/\./g, '');
    // Replace comma with dot for JavaScript parseFloat
    const withDot = noDots.replace(',', '.');
    const parsed = parseFloat(withDot);
    return isNaN(parsed) ? null : parsed;
  }
  
  // If there's no comma, but there is at least one dot:
  if (cleanStr.includes('.')) {
    const parts = cleanStr.split('.');
    const lastPart = parts[parts.length - 1];
    
    // If there are multiple dots, they are all thousands separators (e.g., 1.500.000)
    if (parts.length > 2) {
      const parsed = parseFloat(cleanStr.replace(/\./g, ''));
      return isNaN(parsed) ? null : parsed;
    }
    
    // If there is exactly one dot:
    // If the last part has exactly 3 digits, it's a thousands separator in PT-BR (e.g., 150.000 -> 150000)
    if (lastPart.length === 3) {
      const parsed = parseFloat(cleanStr.replace(/\./g, ''));
      return isNaN(parsed) ? null : parsed;
    } else {
      // Otherwise like 150.00 or 150.5 (decimal separator)
      const parsed = parseFloat(cleanStr);
      return isNaN(parsed) ? null : parsed;
    }
  }
  
  // Clear integers
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? null : parsed;
}

function extractAndParsePtBRMoney(userInput: string, aiExtractedAmount: number): number {
  if (!userInput) return aiExtractedAmount;
  
  // Find all matches for numbers with or without R$ prefix
  // e.g., R$ 150.000, R$150.000, 150.000, R$ 150, 150,00, etc.
  // We prefer matches prefixed with R$ if present, otherwise any matching number pattern
  const matches = [...userInput.matchAll(/(?:r\$\s*)?(\d+(?:[\d.,]*\d)?)/gi)];
  if (matches.length === 0) return aiExtractedAmount;
  
  // If there is a match with R$, let's prioritize it
  let bestMatch = '';
  const r$Match = matches.find(m => m[0].toLowerCase().includes('r$'));
  if (r$Match) {
    // Get the numeric group
    bestMatch = r$Match[1];
  } else {
    // Otherwise, pick the first matching pattern
    bestMatch = matches[0][1];
  }
  
  const parsed = parsePortugueseNumber(bestMatch);
  if (parsed !== null && parsed > 0) {
    console.log(`[AmountExtractor] Override amount from raw input: "${bestMatch}" -> ${parsed} (AI returned ${aiExtractedAmount})`);
    return parsed;
  }
  
  return aiExtractedAmount;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data: any;
  ui: string;
  event?: string;
  suggestions?: string[];
}

/**
 * Motor de execução de ações do sistema.
 * Interpreta intents da IA e executa operações no fakeDB, gerenciando relacionamentos.
 */
export const actionEngine = {
  async executeAction(aiResponse: any): Promise<ActionResult | null> {
    const { intent, entities } = aiResponse;

    console.log(`[ActionEngine] Executando ação para intent: ${intent}`, entities);

    try {
      switch (intent) {
        case 'create_objective':
          return this.handleCreateObjective(entities);
        case 'create_goal':
          return this.handleCreateGoal(entities);
        case 'create_project':
          return this.handleCreateProject(entities);
        case 'create_task':
          return this.handleCreateTask(entities);
        case 'complete_task':
          return this.handleCompleteTask(entities);
        case 'create_document':
          return this.handleCreateDocument(entities);
        case 'create_event':
          return this.handleCreateEvent(entities);
        case 'financial_entry':
          if (entities) {
            entities.userInput = aiResponse.userInput || aiResponse.text || '';
          }
          return this.handleFinancialEntry(entities);
        default:
          console.log('[ActionEngine] Nenhuma ação automática mapeada para este intent.');
          return null;
      }
    } catch (error) {
      console.error('[ActionEngine] Erro ao executar ação:', error);
      return {
        success: false,
        message: 'Ocorreu um erro ao processar a ação no sistema.',
        data: null,
        ui: 'error'
      };
    }
  },

  handleFinancialEntry(entities: any) {
    const { amount, category, note, type, date, userInput } = entities;
    if (!amount) return null;

    let calculatedAmount = Math.abs(amount);
    if (userInput) {
      calculatedAmount = extractAndParsePtBRMoney(userInput, calculatedAmount);
    }

    const lowerInput = (userInput || '').toLowerCase();
    const lowerNote = (note || '').toLowerCase();
    const lowerCat = (category || '').toLowerCase();

    // 1. CLASSIFICAÇÃO SEMÂNTICA & REGRAS SEMÂNTICAS
    const isIncomeText = 
      lowerInput.includes('recebi') || lowerInput.includes('ganhei') || lowerInput.includes('entrou') ||
      lowerInput.includes('deposito') || lowerInput.includes('depósito') || lowerInput.includes('depositei') ||
      lowerInput.includes('salário') || lowerInput.includes('salario') || lowerInput.includes('pix recebido') ||
      lowerInput.includes('receita') ||
      lowerNote.includes('recebi') || lowerNote.includes('ganhei') || lowerNote.includes('entrou') ||
      lowerCat.includes('receita');

    const isExpenseText =
      lowerInput.includes('gastei') || lowerInput.includes('comprei') || lowerInput.includes('paguei') ||
      lowerInput.includes('perdi') || lowerInput.includes('saquei') || lowerInput.includes('retirei') ||
      lowerInput.includes('retirar') || lowerInput.includes('despesa') || lowerInput.includes('gasto') ||
      lowerInput.includes('pagamento') || lowerInput.includes('negativo') ||
      lowerNote.includes('gastei') || lowerNote.includes('comprei') || lowerNote.includes('paguei') ||
      lowerCat.includes('despesa') || lowerCat.includes('gasto');

    let transactionType: CategoryType = CategoryType.CUTTABLE;
    if (isIncomeText && !isExpenseText) {
      transactionType = CategoryType.INCOME;
    } else if (isExpenseText && !isIncomeText) {
      transactionType = CategoryType.CUTTABLE;
    } else if (type?.toLowerCase() === 'income' || type?.toLowerCase() === 'receita') {
      transactionType = CategoryType.INCOME;
    } else if (type?.toLowerCase() === 'essential' || type?.toLowerCase() === 'essencial') {
      transactionType = CategoryType.ESSENTIAL;
    } else if (isIncomeText) {
      transactionType = CategoryType.INCOME;
    }

    const categories = db.getCategories();

    // 2. CORREÇÃO CONTEXTUAL (A: edita a transação anterior)
    const isCorrection = 
      lowerInput.includes('corrige') || lowerInput.includes('não era isso') || 
      lowerInput.includes('nao era isso') || lowerInput.includes('foi errado') || 
      lowerInput.includes('arruma') || lowerInput.includes('errado') || 
      lowerInput.includes('corrigir');

    if (isCorrection) {
      const transactions = db.getTransactions();
      const lastTx = transactions[transactions.length - 1];
      if (lastTx) {
        console.log('[ActionEngine] Correção contextual acionada. Modificando transação anterior:', lastTx.id);

        // Parse amount if specified in input specifically; otherwise keep existing value or update with new amount
        let updatedAmount = calculatedAmount || lastTx.value;
        const amountMatch = lowerInput.match(/r\$\s*(\d+([.,]\d+)?)/i) || lowerInput.match(/(\d+([.,]\d+)?)/);
        if (amountMatch && lowerInput.includes('novo') || lowerInput.includes('novamente')) {
          const numericStr = amountMatch[1].replace(/\./g, '').replace(',', '.');
          const parsedNum = parseFloat(numericStr);
          if (!isNaN(parsedNum) && parsedNum > 0) {
            updatedAmount = parsedNum;
          }
        }

        // Determine correct type for corrector
        let corrType = lastTx.category_id ? (categories.find(c => c.id === lastTx.category_id)?.type || CategoryType.CUTTABLE) : CategoryType.CUTTABLE;
        const changeToIncomePhrases = [
          'negativo errado', 'não é negativo', 'nao e negativo', 'foi negativo errado', 'era positivo', 'era receita', 'era ganho',
          'não era gasto', 'nao era gasto', 'não era despesa', 'nao era despesa', 'não era negativo', 'nao era negativo', 'não foi negativo'
        ];
        const changeToExpensePhrases = [
          'positivo errado', 'não é positivo', 'nao e positivo', 'foi positivo errado', 'era despesa', 'era gasto', 'era custo',
          'não era receita', 'nao era receita', 'não era ganho', 'nao era ganho', 'não era positivo', 'nao era positivo', 'não foi positivo'
        ];

        const wantsIncome = isIncomeText || 
                            lowerInput.includes('positivo') || 
                            lowerInput.includes('ganho') || 
                            changeToIncomePhrases.some(p => lowerInput.includes(p));
        const wantsExpense = isExpenseText || 
                             lowerInput.includes('negativo') || 
                             lowerInput.includes('perda') || 
                             lowerInput.includes('gasto') || 
                             changeToExpensePhrases.some(p => lowerInput.includes(p));

        if (wantsIncome && !changeToExpensePhrases.some(p => lowerInput.includes(p)) && !lowerInput.includes('positivo errado')) {
          corrType = CategoryType.INCOME;
        } else if (wantsExpense && !changeToIncomePhrases.some(p => lowerInput.includes(p)) && !lowerInput.includes('negativo errado')) {
          corrType = CategoryType.CUTTABLE;
        } else {
          // Invert signal if just generic corrects
          corrType = corrType === CategoryType.INCOME ? CategoryType.CUTTABLE : CategoryType.INCOME;
        }

        const currentCatName = categories.find(c => c.id === lastTx.category_id)?.name || category || 'Geral';
        let targetCat = categories.find(c => c.type === corrType && c.name.toLowerCase() === currentCatName.toLowerCase());
        if (!targetCat) {
          targetCat = db.addCategory({
            name: currentCatName,
            type: corrType
          });
        }

        const updatedTx = db.updateTransaction(lastTx.id, {
          value: updatedAmount,
          category_id: targetCat.id,
          note: note || lastTx.note || `Corrigido via comando: "${userInput}"`,
          date: new Date().toISOString()
        });

        if (updatedTx) {
          fingerprintService.createFingerprint(
            updatedTx.id,
            corrType === CategoryType.INCOME ? 'income' : 'expense',
            updatedTx.value,
            updatedTx.category_id,
            updatedTx.note || '',
            lowerInput
          );
        }

        return {
          success: true,
          message: `Arrumado! Transação anterior corrigida com sucesso. Mudou para ${corrType === CategoryType.INCOME ? 'Receita (+)' : 'Custo (-)'} de R$ ${updatedAmount.toLocaleString('pt-BR')} em "${targetCat.name}".`,
          data: updatedTx,
          ui: 'card',
          event: 'financial_entry_created'
        };
      }
    }

    // 3. CATEGORY MATCHING (ensure same type to prevent sign mismatch)
    let matchedCategory = categories.find(c => 
      c.name.toLowerCase().includes((category || '').toLowerCase()) ||
      (category || '').toLowerCase().includes(c.name.toLowerCase())
    );

    if (matchedCategory) {
      if (transactionType === CategoryType.INCOME && matchedCategory.type !== CategoryType.INCOME) {
        matchedCategory = categories.find(c => 
          c.type === CategoryType.INCOME && 
          (c.name.toLowerCase().includes((category || '').toLowerCase()) ||
           (category || '').toLowerCase().includes(c.name.toLowerCase()))
        );
      } else if (transactionType !== CategoryType.INCOME && matchedCategory.type === CategoryType.INCOME) {
        matchedCategory = categories.find(c => 
          c.type !== CategoryType.INCOME && 
          (c.name.toLowerCase().includes((category || '').toLowerCase()) ||
           (category || '').toLowerCase().includes(c.name.toLowerCase()))
        );
      }
    }

    if (!matchedCategory && category) {
      matchedCategory = db.addCategory({
        name: category,
        type: transactionType
      });
    }

    const tCategoryId = matchedCategory?.id || 'uncategorized';

    // 4. ANTI DUPLICAÇÃO WITH EMBEDDINGS (check if entry is within 2 minutes)
    const transactions = db.getTransactions();
    const timeLimit = 2 * 60 * 1000; // 2 minutes
    const nowTime = Date.now();

    const duplicateTx = transactions.find(t => {
      const timeDiff = Math.abs(nowTime - new Date(t.date).getTime());
      if (timeDiff >= timeLimit) return false;
      if (t.value !== calculatedAmount) return false;
      if (t.category_id !== tCategoryId) return false;

      // Check context similarity
      const f1 = fingerprintService.getEmbeddingSimplificado(t.note || '', '');
      const f2 = fingerprintService.getEmbeddingSimplificado(note || '', lowerInput);
      return fingerprintService.checkSimilarity(f1, f2) || (t.note || '').trim().toLowerCase() === (note || '').trim().toLowerCase();
    });

    if (duplicateTx) {
      console.log('[ActionEngine] Entrada duplicada detectada em menos de 2 minutos. Ignorando criação e atualizando anterior.');
      const mergedNote = note ? `${duplicateTx.note || ''} / ${note}`.slice(0, 150) : duplicateTx.note;
      const updatedTx = db.updateTransaction(duplicateTx.id, {
        note: mergedNote,
        date: new Date().toISOString()
      });

      if (updatedTx) {
        fingerprintService.createFingerprint(
          updatedTx.id,
          transactionType === CategoryType.INCOME ? 'income' : 'expense',
          updatedTx.value,
          updatedTx.category_id,
          updatedTx.note || '',
          lowerInput
        );
      }

      return {
        success: true,
        message: `Entrada identificada como repetida nos últimos 2 minutos. Mantida única em "${matchedCategory?.name || 'Geral'}" para evitar duplicação.`,
        data: updatedTx || duplicateTx,
        ui: 'card',
        event: 'financial_entry_created'
      };
    }

    // 5. SAVE NEW TRANSACTION
    const transaction = db.addTransaction({
      category_id: tCategoryId,
      value: calculatedAmount,
      date: date || new Date().toISOString(),
      note: note || (transactionType === CategoryType.INCOME ? `Receita registrada via Amparadora` : `Gasto registrado via Amparadora`)
    });

    // 6. PERSIST FINGERPRINT CACHE
    fingerprintService.createFingerprint(
      transaction.id,
      transactionType === CategoryType.INCOME ? 'income' : 'expense',
      transaction.value,
      transaction.category_id,
      transaction.note || '',
      lowerInput
    );

    return {
      success: true,
      message: `${transactionType === CategoryType.INCOME ? 'Recebeu' : 'Gastou'} R$ ${calculatedAmount.toLocaleString('pt-BR')} registrado em "${matchedCategory?.name || 'Geral'}".`,
      data: transaction,
      ui: 'card',
      event: 'financial_entry_created'
    };
  },

  handleCreateObjective(entities: any) {
    if (!entities?.title) return null;
    const objective = fakeDB.createObjective(entities);
    return {
      success: true,
      message: `Objetivo "${objective.title}" definido com sucesso.`,
      data: objective,
      ui: 'card',
      event: 'objective_created'
    };
  },

  handleCreateGoal(entities: any) {
    if (!entities?.title) return null;
    
    let objectiveId = entities.objectiveId;
    
    // Resolução inteligente de relacionamento
    if (!objectiveId && entities.objectiveName) {
      const obj = fakeDB.findObjectiveByName(entities.objectiveName);
      if (obj) objectiveId = obj.id;
    }

    if (!objectiveId) {
      return {
        success: false,
        message: `Não foi possível encontrar o objetivo "${entities.objectiveName || 'pai'}".`,
        data: null,
        ui: 'suggestion',
        suggestions: [`Criar objetivo "${entities.objectiveName || 'Novo Objetivo'}" primeiro`]
      };
    }

    const goal = fakeDB.createGoal({ title: entities.title, objectiveId });
    return {
      success: true,
      message: `Meta "${goal.title}" estabelecida e vinculada ao objetivo estratégico.`,
      data: goal,
      ui: 'card',
      event: 'goal_created'
    };
  },

  handleCreateProject(entities: any) {
    const title = entities.title || entities.name;
    if (!title) return null;

    let goalId = entities.goalId;
    if (!goalId && entities.goalName) {
      const goal = fakeDB.findGoalByName(entities.goalName);
      if (goal) goalId = goal.id;
    }

    if (!goalId) {
      return {
        success: false,
        message: `Não foi possível encontrar a meta "${entities.goalName || 'pai'}".`,
        data: null,
        ui: 'suggestion',
        suggestions: [`Criar meta "${entities.goalName || 'Nova Meta'}" primeiro`]
      };
    }

    const project = fakeDB.createProject({ title, goalId });
    return {
      success: true,
      message: `Projeto "${project.title}" iniciado e vinculado à meta correspondente.`,
      data: project,
      ui: 'card',
      event: 'project_created'
    };
  },

  handleCreateTask(entities: any) {
    if (!entities?.title) return null;

    let projectId = entities.projectId;
    if (!projectId && entities.projectName) {
      const project = fakeDB.findProjectByName(entities.projectName);
      if (project) {
        projectId = project.id;
      } else {
        // Se o projeto não existe, cria um novo "Geral" ou usa o nome especificado
        const newProj = fakeDB.createProject({ title: entities.projectName, goalId: 'none' });
        projectId = newProj.id;
      }
    }

    const task = fakeDB.createTask({ 
      title: entities.title, 
      projectId: projectId || 'none',
      status: entities.status,
      date: entities.date
    });

    return {
      success: true,
      message: `Tarefa "${task.title}" criada e vinculada ao projeto operacional.`,
      data: task,
      ui: 'card',
      event: 'task_created'
    };
  },

  handleCompleteTask(entities: any) {
    let taskId = entities.taskId;
    
    if (!taskId && entities.title) {
      const task = fakeDB.tasks.find(t => t.title.toLowerCase().includes(entities.title.toLowerCase()));
      if (task) taskId = task.id;
    }

    if (!taskId) {
      return {
        success: false,
        message: `Não encontrei a tarefa "${entities.title || 'especificada'}" para concluir.`,
        data: null,
        ui: 'suggestion',
        suggestions: ['Listar todas as tarefas']
      };
    }

    const task = fakeDB.completeTask(taskId);
    return {
      success: true,
      message: `Tarefa "${task?.title}" concluída com sucesso.`,
      data: task,
      ui: 'card',
      event: 'task_completed'
    };
  },

  handleCreateDocument(entities: any) {
    if (!entities?.title || !entities?.content) return null;
    const doc = fakeDB.createDocument(entities);
    return {
      success: true,
      message: `Documento "${doc.title}" salvo com sucesso no workspace.`,
      data: doc,
      ui: 'card'
    };
  },

  handleCreateEvent(entities: any) {
    if (!entities?.title || !entities?.date) return null;
    
    let relatedId = entities.relatedId;
    let relatedType = entities.relatedType || 'project';

    if (!relatedId && entities.relatedName) {
      const proj = fakeDB.findProjectByName(entities.relatedName);
      if (proj) {
        relatedId = proj.id;
        relatedType = 'project';
      }
    }

    const event = fakeDB.createEvent({
      title: entities.title,
      date: entities.date,
      relatedType: relatedType as any,
      relatedId: relatedId || 'none'
    });

    return {
      success: true,
      message: `Evento "${event.title}" agendado no calendário operacional.`,
      data: event,
      ui: 'card'
    };
  }
};
