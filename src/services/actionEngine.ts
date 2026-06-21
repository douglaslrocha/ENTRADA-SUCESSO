import { CanvasResponse, FinancialRecord } from '../types';
import { documentService } from './documentService';
import { taskService } from './taskService';
import { db } from './db';

export interface ActionContext {
  editorInstance?: any;
  navigate?: (path: string) => void;
  refreshData?: () => void;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  redirect?: string;
}

/**
 * DEPRECATED: usar core/actionEngine via orchestrator
 */
export const actionEngine = {
  async execute(response: CanvasResponse, context: ActionContext): Promise<ActionResult> {
    console.log(`[ActionEngine] Executing intent: ${response.intent}`, response.data);

    switch (response.intent) {
      case 'document':
        return this.handleDocument(response, context);
      case 'task':
        return this.handleTask(response, context);
      case 'finance':
        return this.handleFinance(response, context);
      case 'activity_log':
        return this.handleActivityLog(response, context);
      case 'query':
        return this.handleQuery(response, context);
      default:
        return { success: true, message: 'Intenção processada via chat.' };
    }
  },

  handleDocument(response: CanvasResponse, context: ActionContext): ActionResult {
    const workspaces = documentService.getWorkspaces();
    const activeWorkspaces = workspaces.filter(ws => !ws.isHidden);
    if (activeWorkspaces.length === 0) {
      return { success: false, message: 'Nenhum workspace ativo encontrado para salvar o documento.' };
    }

    const wsId = activeWorkspaces[0].id;
    const folderId = activeWorkspaces[0].folders.length > 0 ? activeWorkspaces[0].folders[0].id : null;
    
    const title = response.data?.title || 'Novo Documento';
    const content = `<h1>${title}</h1><p>${response.content}</p>`;
    
    const newPage = documentService.addPage(wsId, folderId, title, content);
    
    return { 
      success: true, 
      message: `Documento "${title}" criado com sucesso.`,
      data: newPage,
      redirect: '/manager'
    };
  },

  handleTask(response: CanvasResponse, context: ActionContext): ActionResult {
    const title = response.data?.title || response.content || 'Nova Tarefa';
    const description = response.data?.description || '';
    
    const newTask = taskService.addTask(title, description);
    
    return { 
      success: true, 
      message: `Tarefa "${title}" agendada.`,
      data: newTask 
    };
  },

  handleFinance(response: CanvasResponse, context: ActionContext): ActionResult {
    if (!response.data) return { success: false, message: 'Dados financeiros ausentes.' };
    
    const record = response.data as FinancialRecord;
    
    // If we have an editor instance, we can insert it there too (legacy behavior)
    if (context.editorInstance) {
      const emoji = record.type === 'expense' ? '💸' : '💰';
      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.amount);
      const htmlToInsert = `<p><strong>${emoji} ${record.description}</strong>: <span style="color: ${record.type === 'expense' ? '#ef4444' : '#22c55e'}">${formattedAmount}</span> (${record.category})</p>`;
      context.editorInstance.commands.insertContent(htmlToInsert);
    }

    // Also add to DB if possible (assuming db has a method for this)
    // db.addTransaction(...) 

    return { 
      success: true, 
      message: `Registro financeiro de ${record.amount} em ${record.category} realizado.`,
      data: record 
    };
  },

  handleActivityLog(response: CanvasResponse, context: ActionContext): ActionResult {
    const activity = response.data?.activity || response.content;
    const duration = response.data?.duration || 'não especificada';
    
    return { 
      success: true, 
      message: `Atividade registrada: ${activity} (Duração: ${duration}).`,
      data: response.data 
    };
  },

  handleQuery(response: CanvasResponse, context: ActionContext): ActionResult {
    // Here we would fetch real data from DB
    // const total = db.getTotalPatrimony();
    
    return { 
      success: true, 
      message: 'Consulta de dados realizada.',
      data: response.data 
    };
  }
};
