/**
 * Event Engine - Camada de eventos reativa do frontend.
 * Responsável por processar eventos disparados pela IA e executar ações no sistema.
 */

import { memoryEngine } from './memoryEngine';
import { fakeDB } from './fakeDB';
import { notificationService } from '../services/NotificationService';

export type UIEventType = 
  | 'task_created' 
  | 'task_completed' 
  | 'view_timeline' 
  | 'project_progress_updated'
  | 'objective_progress_updated'
  | 'suggestion_generated'
  | 'notification'
  | 'error';

export interface UIEventPayload {
  event: UIEventType;
  data?: any;
  meta?: {
    timestamp: number;
    source: 'ai' | 'user' | 'system';
  };
}

// --- Inteligência de Eventos ---

/**
 * Analisa o evento e toma decisões automáticas.
 */
const analyzeAndDecide = (event: UIEventType, data: any) => {
  console.log(`[EventEngine] Analisando inteligência para: ${event}`);
  
  // 1. Integrar com Memory Engine para aprender padrões
  memoryEngine.recordEventPattern(event, data);

  // 2. Lógica de Decisão e Chaining
  switch (event) {
    case 'task_created':
      handleTaskCreatedIntelligence(data);
      break;
    case 'task_completed':
      handleTaskCompletedIntelligence(data);
      break;
  }
};

const handleTaskCreatedIntelligence = (data: any) => {
  // Sugestão automática: Se não tiver projeto, sugerir vincular
  if (!data.projectId) {
    eventEngine.dispatch('suggestion_generated', {
      text: "Deseja vincular esta tarefa a um projeto estratégico?",
      action: "link_to_project",
      context: data
    });
  }
  
  // Sugestão automática: Sugerir prazo se não houver
  if (!data.date) {
    eventEngine.dispatch('suggestion_generated', {
      text: "Que tal definir um prazo para esta entrega?",
      action: "set_deadline",
      context: data
    });
  }
};

const handleTaskCompletedIntelligence = (data: any) => {
  const task = data.task || data;
  if (task.projectId) {
    const project = fakeDB.projects.find(p => p.id === task.projectId);
    if (project) {
      const newProgress = fakeDB.getProjectProgress(project.id);
      
      // Chaining: Notificar atualização de progresso do projeto
      eventEngine.dispatch('project_progress_updated', {
        projectId: project.id,
        title: project.title,
        progress: newProgress
      });

      // Verificar se o projeto foi concluído
      if (newProgress === 100) {
        window.dispatchEvent(new CustomEvent('ui-feedback', { 
          detail: { type: 'completion', message: `Projeto "${project.title}" finalizado!`, icon: 'trophy' } 
        }));
      }

      // Chaining: Propagar para o objetivo
      if (project.goalId) {
        const goal = fakeDB.goals.find(g => g.id === project.goalId);
        if (goal && goal.objectiveId) {
          const objProgress = fakeDB.getObjectiveProgress(goal.objectiveId);
          eventEngine.dispatch('objective_progress_updated', {
            objectiveId: goal.objectiveId,
            progress: objProgress
          });
        }
      }
    }
  }

  // Sugestão de próxima ação
  eventEngine.dispatch('suggestion_generated', {
    text: "Tarefa concluída! Deseja revisar o progresso do projeto?",
    action: "review_project",
    context: data
  });
};

// --- Handlers de UI (Feedback Visual) ---

const handleTaskCreated = (data: any) => {
  console.log('[EventEngine] Tarefa criada com sucesso:', data);
  window.dispatchEvent(new CustomEvent('ui-feedback', { 
    detail: { type: 'success', message: 'Tarefa criada!', icon: 'check' } 
  }));
};

const handleTaskCompleted = (data: any) => {
  console.log('[EventEngine] Tarefa concluída:', data);
  window.dispatchEvent(new CustomEvent('ui-feedback', { 
    detail: { type: 'completion', message: 'Tarefa finalizada!', icon: 'award' } 
  }));
};

const handleTimelineView = (data: any) => {
  console.log('[EventEngine] Navegando para Timeline:', data);
  window.dispatchEvent(new CustomEvent('ui-feedback', { 
    detail: { type: 'info', message: 'Visualizando linha do tempo', icon: 'clock' } 
  }));
};

const handleSuggestionGenerated = (data: any) => {
  console.log('[EventEngine] Sugestão inteligente gerada:', data.text);
  // Futuro: Renderizar componente de sugestão flutuante
};

const handleError = (data: any) => {
  console.error('[EventEngine] Erro detectado:', data);
  window.dispatchEvent(new CustomEvent('ui-feedback', { 
    detail: { type: 'error', message: 'Ocorreu um erro inesperado', icon: 'alert' } 
  }));
};

const handleNotification = (data: any) => {
  console.log('[EventEngine] Disparando notificação rica:', data);
  notificationService.notify({
    title: data.title || 'Aviso do Sistema',
    body: data.body || '',
    type: data.type || 'info',
    layout: data.layout || 'default',
    data: data.data,
    actionLabel: data.actionLabel,
    onAction: data.onAction
  });
};

/**
 * Mapeamento de Eventos para Handlers.
 */
const EVENT_MAP: Record<UIEventType, (data: any) => void> = {
  'task_created': handleTaskCreated,
  'task_completed': handleTaskCompleted,
  'view_timeline': handleTimelineView,
  'project_progress_updated': (data) => console.log('[EventEngine] Progresso do projeto atualizado:', data),
  'objective_progress_updated': (data) => console.log('[EventEngine] Progresso do objetivo atualizado:', data),
  'notification': handleNotification,
  'suggestion_generated': handleSuggestionGenerated,
  'error': handleError,
};

/**
 * Dispatcher Central de Eventos.
 */
export const eventEngine = {
  dispatch(event: UIEventType, data: any) {
    const handler = EVENT_MAP[event];

    if (handler) {
      console.log(`[EventEngine] Despachando evento: ${event}`);
      
      // 1. Executar Handler Visual/UI
      handler(data);

      // 2. Executar Inteligência e Decisão (Sem bloquear a UI)
      setTimeout(() => analyzeAndDecide(event, data), 0);
    } else {
      console.warn(`[EventEngine] Evento "${event}" não possui um handler mapeado.`);
    }
  }
};
