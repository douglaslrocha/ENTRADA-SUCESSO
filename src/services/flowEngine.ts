import { CanvasResponse } from '../types';
import { projectService } from './projectService';
import { taskService } from './taskService';
import { documentService } from './documentService';
import { ActionContext, ActionResult } from './actionEngine';

export const flowEngine = {
  async execute(response: CanvasResponse, context: ActionContext): Promise<ActionResult> {
    console.log(`[FlowEngine] Executing flow: ${response.intent}`, response.data);

    switch (response.intent) {
      case 'flow':
        return this.handleFlow(response, context);
      case 'project':
        return this.handleProject(response, context);
      default:
        return { success: false, message: 'Intenção não suportada pelo FlowEngine.' };
    }
  },

  async handleProject(response: CanvasResponse, context: ActionContext): Promise<ActionResult> {
    const title = response.data?.title || response.content || 'Novo Projeto';
    const description = response.data?.description || '';
    const project = projectService.addProject(title, description);
    return { success: true, message: `Projeto "${title}" criado.`, data: project };
  },

  async handleFlow(response: CanvasResponse, context: ActionContext): Promise<ActionResult> {
    const flowType = response.data?.flowType;

    switch (flowType) {
      case 'create_batch_project':
        return this.createBatchProject(response.data, context);
      case 'create_daily_routine':
        return this.createDailyRoutine(response.data, context);
      case 'generate_multiple_documents':
        return this.generateMultipleDocuments(response.data, context);
      default:
        return { success: false, message: `Fluxo "${flowType}" não reconhecido.` };
    }
  },

  async createBatchProject(data: any, context: ActionContext): Promise<ActionResult> {
    const { projectTitle, projectDescription, tasks, documents } = data;

    // 1. Create Project
    const project = projectService.addProject(projectTitle, projectDescription);

    // 2. Create Tasks and link to project
    const createdTasks = [];
    if (tasks && Array.isArray(tasks)) {
      for (const t of tasks) {
        const newTask = taskService.addTask(t.title, t.description);
        projectService.linkTask(project.id, newTask.id);
        createdTasks.push(newTask);
      }
    }

    // 3. Create Documents and link to project
    const createdDocs = [];
    if (documents && Array.isArray(documents)) {
      const workspaces = documentService.getWorkspaces();
      const activeWorkspaces = workspaces.filter(ws => !ws.isHidden);
      if (activeWorkspaces.length > 0) {
        const wsId = activeWorkspaces[0].id;
        const folderId = activeWorkspaces[0].folders.length > 0 ? activeWorkspaces[0].folders[0].id : null;
        for (const d of documents) {
          const newDoc = documentService.addPage(wsId, folderId, d.title, d.content);
          projectService.linkDocument(project.id, newDoc.id);
          createdDocs.push(newDoc);
        }
      }
    }

    return {
      success: true,
      message: `Projeto "${projectTitle}" criado com ${createdTasks.length} tarefas e ${createdDocs.length} documentos vinculados.`,
      data: { project, tasks: createdTasks, documents: createdDocs },
      redirect: '/manager'
    };
  },

  async createDailyRoutine(data: any, context: ActionContext): Promise<ActionResult> {
    const { routineName, tasks } = data;
    const createdTasks = [];

    if (tasks && Array.isArray(tasks)) {
      for (const t of tasks) {
        const newTask = taskService.addTask(t.title, t.description);
        createdTasks.push(newTask);
      }
    }

    return {
      success: true,
      message: `Rotina "${routineName}" criada com ${createdTasks.length} tarefas agendadas.`,
      data: createdTasks
    };
  },

  async generateMultipleDocuments(data: any, context: ActionContext): Promise<ActionResult> {
    const { documents } = data;
    const createdDocs = [];

    if (documents && Array.isArray(documents)) {
      const workspaces = documentService.getWorkspaces();
      if (workspaces.length > 0) {
        const wsId = workspaces[0].id;
        const folderId = workspaces[0].folders.length > 0 ? workspaces[0].folders[0].id : null;
        for (const d of documents) {
          const newDoc = documentService.addPage(wsId, folderId, d.title, d.content);
          createdDocs.push(newDoc);
        }
      }
    }

    return {
      success: true,
      message: `${createdDocs.length} documentos gerados em lote.`,
      data: createdDocs,
      redirect: '/manager'
    };
  }
};
