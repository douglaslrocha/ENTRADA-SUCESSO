import { safeLocalStorage } from '../utils/storage';
import { semanticLifeEngine } from '../services/semanticLifeEngine';
import { existentialCoreEngine } from '../services/existentialCoreEngine';
import { existentialVectorsEngine } from '../services/existentialVectorsEngine';
import { organismEventBus } from '../services/organismEventBus';
import { diaryService } from '../services/diaryService';
import { objectivesService } from '../services/objectivesService';
import { api } from '../services/api';

/**
 * Banco de dados em memória para simular persistência com modelo relacional completo.
 */
export const fakeDB = {
  objectives: [] as any[],
  goals: [] as any[],
  projects: [] as any[],
  tasks: [] as any[],
  subtasks: [] as any[],
  documents: [] as any[],
  workspaces: [] as any[],
  folders: [] as any[],
  events: [] as any[],
  diaries: [] as any[],

  createObjective(data: { 
    title: string; 
    description?: string; 
    media?: any[];
    deadline?: any;
    type?: 'Estratégico' | 'Pessoal' | 'Profissional' | 'Financeiro';
    burningDesire?: string;
    sacrifice?: string;
    feelings?: string;
    plan?: string;
    kpis?: any[];
    risks?: any[];
    metas?: any[];
  }) {
    const objective = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description || '',
      type: data.type || 'Estratégico',
      deadline: data.deadline || Date.now() + (Math.random() * 365 * 24 * 60 * 60 * 1000), // Random deadline within a year
      media: data.media || [
        { id: 'm1', type: 'image', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80', name: 'Visão de Futuro' },
        { id: 'm2', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', name: 'Inspiração' }
      ],
      burningDesire: data.burningDesire || '',
      sacrifice: data.sacrifice || '',
      feelings: data.feelings || '',
      plan: data.plan || '',
      kpis: data.kpis || [],
      risks: data.risks || [],
      metas: data.metas || [],
      goalIds: [],
      createdAt: Date.now()
    };
    this.objectives.unshift(objective); // New objectives at the top as requested
    safeLocalStorage.setItem('objectives_order', JSON.stringify(this.objectives));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Objetivo criado:', objective);
    organismEventBus.emit('goalUpdated', objective);

    // Criar workspace correspondente no fakeDB
    const ws = this.createWorkspace(objective.title);
    (ws as any).objectiveId = objective.id;
    const folder = this.createFolder('Documentos da Visão', ws.id);
    this.createDocument({
      title: 'Manifesto da Visão',
      content: `<h1>Manifesto: ${objective.title}</h1><h3>Desejo Ardente</h3><p>${objective.burningDesire || 'Não definido'}</p><h3>Sentimentos</h3><p>${objective.feelings || 'Não definido'}</p><h3>Sacrifício</h3><p>${objective.sacrifice || 'Não definido'}</p><h3>Plano Definido</h3><p>${objective.plan || 'Não definido'}</p>`,
      workspaceId: ws.id,
      folderId: folder.id
    });

    // Sync do vinculo objectiveId para o documentService e workspaceService
    import('../services/documentService').then(({ documentService }) => {
      const workspaces = documentService.getWorkspaces();
      const existingWS: any = workspaces.find((w: any) => w.id === ws.id || w.name.toLowerCase() === objective.title.toLowerCase());
      if (existingWS) {
        existingWS.objectiveId = objective.id;
        documentService.saveWorkspaces([...workspaces]);
      }
    }).catch(e => console.error('[FakeDB] Error updating documentService workspace for objective:', e));


    // Sincroniza com backend assincronamente
    objectivesService.saveObjective(objective.id, objective).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar novo objetivo com o backend:', err);
    });

    return objective;
  },

  updateObjective(id: string, data: any) {
    const index = this.objectives.findIndex(o => o.id === id);
    if (index !== -1) {
      const oldObj = this.objectives[index];
      const updated = {
        ...oldObj,
        ...data,
      };
      this.objectives[index] = updated;
      safeLocalStorage.setItem('objectives_order', JSON.stringify(this.objectives));
      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      console.log('[FakeDB] Objetivo atualizado:', updated);
      organismEventBus.emit('goalUpdated', updated);

      // Atualizar workspace correspondente no fakeDB e documentService se o título mudar
      const wsFakeDB = this.workspaces.find((w: any) => w.objectiveId === id || w.title.toLowerCase() === oldObj.title.toLowerCase());
      if (wsFakeDB) {
        wsFakeDB.title = updated.title;
        wsFakeDB.objectiveId = id;
        organismEventBus.emit('workspaceUpdated');
      }

      import('../services/documentService').then(({ documentService }) => {
        const workspaces = documentService.getWorkspaces();
        const ws = workspaces.find(w => (w as any).objectiveId === id || w.name.toLowerCase() === oldObj.title.toLowerCase());
        if (ws) {
          ws.name = updated.title;
          (ws as any).objectiveId = id;
          documentService.saveWorkspaces([...workspaces]);
          organismEventBus.emit('workspaceUpdated');
        }
      }).catch(e => console.error('[FakeDB] Error updating workspace for objective:', e));


      // Sincroniza com backend assincronamente
      objectivesService.saveObjective(id, updated).catch(err => {
        console.warn('[FakeDB] Erro ao sincronizar atualização de objetivo com o backend:', err);
      });

      return updated;
    }
    return null;
  },

  deleteObjective(id: string) {
    // 1. Cascata de Deleção Local
    this.objectives = this.objectives.filter(o => o.id !== id);
    
    const goalsToDelete = this.goals.filter(g => g.objectiveId === id);
    this.goals = this.goals.filter(g => g.objectiveId !== id);
    
    const goalIds = goalsToDelete.map(g => g.id);
    this.projects = this.projects.filter(p => !goalIds.includes(p.goalId));
    this.tasks = this.tasks.filter(t => !goalIds.includes(t.goalId));

    safeLocalStorage.setItem('objectives_order', JSON.stringify(this.objectives));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Objetivo deletado em cascata:', id);
    organismEventBus.emit('goalUpdated');

    // Sincroniza com backend assincronamente
    objectivesService.deleteObjective(id).catch(err => {
      console.error('[FakeDB] Erro CRÍTICO ao deletar objetivo no backend. O item poderá reaparecer no próximo sync.', err);
      organismEventBus.emit('backendError', { type: 'deleteObjective', message: 'Falha ao deletar no servidor.' });
    });
  },

  reorderObjectives(newOrder: any[]) {
    this.objectives = newOrder;
    safeLocalStorage.setItem('objectives_order', JSON.stringify(newOrder));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Objetivos reordenados e salvos');
    organismEventBus.emit('goalUpdated');

    // Sincroniza com backend assincronamente via lote
    objectivesService.syncTree({
      objectives: this.objectives,
      goals: this.goals,
      projects: this.projects,
      tasks: this.tasks
    }).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar reordenação de objetivos com o backend:', err);
    });
  },

  createGoal(data: { title: string; objectiveId: string; [key: string]: any }) {
    const goal: any = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      ...data,
      projectIds: data.projectIds || [],
      createdAt: Date.now()
    };
    
    // Update parent
    const objective = this.objectives.find(o => o.id === data.objectiveId);
    if (objective) {
      if (!objective.goalIds) {
        objective.goalIds = [];
      }
      if (!objective.goalIds.includes(goal.id)) {
        objective.goalIds.push(goal.id);
      }
      
      // Sincroniza meta na lista metas do objetivo
      if (!objective.metas) {
        objective.metas = [];
      }
      const metaForm: any = {
        id: goal.id,
        intention: goal.title || goal.intention || '',
        description: goal.description || '',
        meaning: goal.meaning || '',
        formaMedicao: goal.formaMedicao || '',
        objetivoDesejado: goal.objetivoDesejado || '',
        deadline: goal.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        consequence: goal.consequence || '',
        risks: goal.risks || '',
        impact: goal.impact || 'medium',
        strategy: goal.strategy || '',
        actions: goal.actions || [],
        rhythm: goal.rhythm || 'daily',
        color: goal.color || '#c3b1e1',
        createdAt: goal.createdAt ? new Date(goal.createdAt).toISOString() : new Date().toISOString()
      };

      const metaIdx = objective.metas.findIndex((m: any) => m.id === goal.id);
      if (metaIdx > -1) {
        objective.metas[metaIdx] = { ...objective.metas[metaIdx], ...metaForm };
      } else {
        objective.metas.push(metaForm);
      }

      // Sincroniza metatestore no localStorage
      try {
        const storedKey = `metas_${objective.title}`;
        const existingStored = safeLocalStorage.getItem(storedKey);
        let parsedStored = [];
        if (existingStored) {
          parsedStored = JSON.parse(existingStored);
        }
        if (!Array.isArray(parsedStored)) {
          parsedStored = [];
        }
        const storedIdx = parsedStored.findIndex((m: any) => m.id === goal.id);
        if (storedIdx > -1) {
          parsedStored[storedIdx] = { ...parsedStored[storedIdx], ...metaForm };
        } else {
          parsedStored.push(metaForm);
        }
        safeLocalStorage.setItem(storedKey, JSON.stringify(parsedStored));
      } catch (e) {
        console.error('[FakeDB] Erro ao sincronizar cache metas localStorage:', e);
      }

      safeLocalStorage.setItem('objectives_order', JSON.stringify(this.objectives));
      console.log(`[FakeDB] Vínculo realizado: Goal ${goal.id} -> Objective ${objective.id}`);
    } else {
      console.warn(`[FakeDB] Falha de relacionamento: Objective ${data.objectiveId} não encontrado.`);
    }

    if (!this.goals.some(g => g.id === goal.id)) {
      this.goals.push(goal);
    }
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Meta criada:', goal);
    organismEventBus.emit('goalUpdated', goal);

    // Sincroniza com backend assincronamente
    objectivesService.saveGoal(goal.id, goal).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar nova meta com o backend:', err);
    });

    return goal;
  },

  createProject(data: { title: string; goalId?: string; [key: string]: any }) {
    const project = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      title: data.title,
      goalId: data.goalId || 'none',
      taskIds: data.taskIds || [],
      progress: data.progress || 0,
      createdAt: Date.now()
    };

    // Update parent if exists
    if (data.goalId && data.goalId !== 'none') {
      const goal = this.goals.find(g => g.id === data.goalId);
      if (goal) {
        if (!goal.projectIds) {
          goal.projectIds = [];
        }
        if (!goal.projectIds.includes(project.id)) {
          goal.projectIds.push(project.id);
        }
        console.log(`[FakeDB] Vínculo realizado: Project ${project.id} -> Goal ${goal.id}`);
      } else {
        console.warn(`[FakeDB] Falha de relacionamento: Goal ${data.goalId} não encontrado.`);
      }
    }

    if (!this.projects.some(p => p.id === project.id)) {
      this.projects.push(project);
    }
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Projeto criado:', project);
    organismEventBus.emit('goalUpdated', project);

    // Sincroniza com backend assincronamente
    objectivesService.saveProject(project.id, project).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar novo projeto com o backend:', err);
    });

    return project;
  },

  createTask(data: { title: string; id?: string; projectId?: string; goalId?: string; parentTaskId?: string; status?: "todo" | "doing" | "done"; date?: number; [key: string]: any }) {
    const task = {
      id: data.id || Math.random().toString(36).substr(2, 9),
      title: data.title,
      projectId: data.projectId || 'none',
      goalId: data.goalId || 'none',
      parentTaskId: data.parentTaskId || null,
      status: data.status || "todo",
      date: data.date,
      documentIds: [],
      subtaskIds: [],
      createdAt: Date.now(),
      ...data
    };

    // Update parent project if exists
    if (data.projectId && data.projectId !== 'none') {
      const project = this.projects.find(p => p.id === data.projectId);
      if (project) {
        if (!project.taskIds) {
          project.taskIds = [];
        }
        if (!project.taskIds.includes(task.id)) {
          project.taskIds.push(task.id);
        }
        console.log(`[FakeDB] Vínculo realizado: Task ${task.id} -> Project ${project.id}`);
      }
    }

    // Update parent task if exists (Subtask)
    if (data.parentTaskId) {
      const parentTask = this.tasks.find(t => t.id === data.parentTaskId);
      if (parentTask) {
        if (!parentTask.subtaskIds) {
          parentTask.subtaskIds = [];
        }
        if (!parentTask.subtaskIds.includes(task.id)) {
          parentTask.subtaskIds.push(task.id);
        }
        console.log(`[FakeDB] Vínculo realizado: Subtask ${task.id} -> Task ${parentTask.id}`);
      }
    }

    if (!this.tasks.some(t => t.id === task.id)) {
      this.tasks.push(task);
    }
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Tarefa criada:', task);
    organismEventBus.emit('goalUpdated', task);

    // Sincroniza com backend assincronamente
    objectivesService.saveTask(task.id, task).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar nova tarefa com o backend:', err);
    });

    return task;
  },

  completeTask(taskId: string) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'done';
      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      console.log(`[FakeDB] Tarefa ${taskId} marcada como concluída.`);
      organismEventBus.emit('goalUpdated', task);

      // Sincroniza com backend assincronamente
      objectivesService.saveTask(task.id, task).catch(err => {
        console.warn('[FakeDB] Erro ao sincronizar conclusão de tarefa com o backend:', err);
      });

      return task;
    }
    return null;
  },

  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    console.log('[FakeDB] Tarefa excluída:', taskId);
    organismEventBus.emit('goalUpdated');

    // Sincroniza com backend assincronamente
    objectivesService.deleteTask(taskId).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar remoção de tarefa com o backend:', err);
    });
  },

  createDocument(data: { title: string; content: string; workspaceId?: string; folderId?: string }) {
    const doc = {
      id: 'p-' + Math.random().toString(36).substr(2, 9),
      title: data.title,
      content: data.content,
      workspaceId: data.workspaceId,
      folderId: data.folderId,
      createdAt: Date.now()
    };
    this.documents.push(doc);
    console.log('[FakeDB] Documento criado:', doc);
    organismEventBus.emit('workspaceUpdated', doc);

    // Sync to Postgres
    if (data.folderId) {
      import('../services/workspaceService').then(({ workspaceService }) => {
        workspaceService.savePage(doc.id, {
          folderId: data.folderId!,
          title: doc.title,
          content: doc.content
        }).catch(err => console.warn('[FakeDB] Erro ao salvar page no backend:', err));
      });
    }

    // Sync to documentService
    import('../services/documentService').then(({ documentService }) => {
      const workspaces = documentService.getWorkspaces();
      const ws = workspaces.find(w => w.id === data.workspaceId);
      if (ws) {
        let folder = ws.folders.find(f => f.id === data.folderId);
        if (!folder && ws.folders.length > 0) {
          folder = ws.folders[0];
        }
        if (folder) {
          if (!folder.pages) folder.pages = [];
          if (!folder.pages.some(p => p.id === doc.id)) {
            folder.pages.push({
              id: doc.id,
              title: doc.title,
              content: doc.content,
              createdAt: new Date().toISOString()
            });
            documentService.saveWorkspaces(workspaces);
            organismEventBus.emit('workspaceUpdated');
          }
        }
      }
    }).catch(e => console.error(e));

    return doc;
  },

  createEvent(data: { title: string; date: number; relatedType: "task" | "project"; relatedId: string }) {
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      date: data.date,
      relatedType: data.relatedType,
      relatedId: data.relatedId,
      createdAt: Date.now()
    };
    this.events.push(event);
    console.log('[FakeDB] Evento criado:', event);
    return event;
  },

  createWorkspace(title: string) {
    const workspace = {
      id: 'ws-' + Math.random().toString(36).substr(2, 9),
      title,
      createdAt: Date.now()
    };
    this.workspaces.push(workspace);
    organismEventBus.emit('workspaceUpdated', workspace);

    // Sync to Postgres
    import('../services/workspaceService').then(({ workspaceService }) => {
      workspaceService.saveWorkspace(workspace.id, {
        name: title,
        isPinned: false,
        isHidden: false,
        color: '#000000',
        icon: '📄',
        iconType: 'emoji',
        imageUrl: ''
      }).catch(err => console.warn('[FakeDB] Erro ao salvar workspace no backend:', err));
    });

    // Sync to documentService (localStorage)
    import('../services/documentService').then(({ documentService }) => {
      const workspaces = documentService.getWorkspaces();
      if (!workspaces.some(w => w.id === workspace.id)) {
        const newWS: any = {
          id: workspace.id,
          name: title,
          folders: []
        };
        workspaces.push(newWS);
        documentService.saveWorkspaces(workspaces);
        organismEventBus.emit('workspaceUpdated');
      }
    }).catch(e => console.error(e));

    return workspace;
  },

  createFolder(title: string, workspaceId: string) {
    const folder = {
      id: 'f-' + Math.random().toString(36).substr(2, 9),
      title,
      workspaceId,
      createdAt: Date.now()
    };
    this.folders.push(folder);
    organismEventBus.emit('workspaceUpdated', folder);

    // Sync to Postgres
    import('../services/workspaceService').then(({ workspaceService }) => {
      workspaceService.saveFolder(folder.id, {
        workspaceId,
        name: title
      }).catch(err => console.warn('[FakeDB] Erro ao salvar folder no backend:', err));
    });

    // Sync to documentService
    import('../services/documentService').then(({ documentService }) => {
      const workspaces = documentService.getWorkspaces();
      const ws = workspaces.find(w => w.id === workspaceId);
      if (ws) {
        if (!ws.folders) ws.folders = [];
        if (!ws.folders.some(f => f.id === folder.id)) {
          ws.folders.push({
            id: folder.id,
            name: title,
            pages: []
          });
          documentService.saveWorkspaces(workspaces);
          organismEventBus.emit('workspaceUpdated');
        }
      }
    }).catch(e => console.error(e));

    return folder;
  },

  // Progress calculation helpers for UI
  getProjectProgress(projectId: string) {
    const projectTasks = this.tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  },

  getGoalProgress(goalId: string) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal && typeof goal.progress === 'number') {
      return goal.progress;
    }
    const goalProjects = this.projects.filter(p => p.goalId === goalId);
    if (goalProjects.length === 0) return 0;
    const totalProgress = goalProjects.reduce((acc, p) => acc + this.getProjectProgress(p.id), 0);
    return Math.round(totalProgress / goalProjects.length);
  },

  getObjectiveProgress(objId: string) {
    const objective = this.objectives.find(o => o.id === objId);
    if (objective && objective.metas && objective.metas.length > 0) {
      const totalProgress = objective.metas.reduce((acc: number, m: any) => acc + (m.progress || 0), 0);
      return Math.round(totalProgress / objective.metas.length);
    }
    const objGoals = this.goals.filter(g => g.objectiveId === objId);
    if (objGoals.length === 0) return 0;
    const totalProgress = objGoals.reduce((acc, g) => acc + this.getGoalProgress(g.id), 0);
    return Math.round(totalProgress / objGoals.length);
  },

  // Search helpers for Action Engine
  findProjectByName(name: string) {
    return this.projects.find(p => p.title.toLowerCase().includes(name.toLowerCase()));
  },
  
  findGoalByName(name: string) {
    return this.goals.find(g => g.title.toLowerCase().includes(name.toLowerCase()));
  },

  findObjectiveByName(name: string) {
    return this.objectives.find(o => o.title.toLowerCase().includes(name.toLowerCase()));
  },

  seed() {
    // Try to load from localStorage first
    let savedOrder = safeLocalStorage.getItem('objectives_order');
    let savedDiaries = safeLocalStorage.getItem('diary_entries');

    // Purga cirúrgica e imediata de dados legados do cache local (localStorage) se presentes
    if (savedDiaries) {
      try {
        const parsed = JSON.parse(savedDiaries);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(e => String(e.id) !== '1' && String(e.id) !== '2' && e.location !== 'ALOHA SURF SPOT' && e.location !== 'RESERVA SUL');
          if (filtered.length !== parsed.length) {
            safeLocalStorage.setItem('diary_entries', JSON.stringify(filtered));
            savedDiaries = JSON.stringify(filtered);
          }
        }
      } catch (e) {}
    }

    if (savedOrder) {
      try {
        const parsed = JSON.parse(savedOrder);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(o => 
            o.title !== 'Expansão Global 2026' && 
            o.title !== 'Liberdade Financeira' &&
            o.title !== 'Mestrado em Oxford' &&
            o.title !== 'Maratona de Nova York' &&
            o.title !== 'Novo Escritório Design' &&
            o.title !== 'Aprender Japonês' &&
            o.title !== 'Investimento em Cripto'
          );
          if (filtered.length !== parsed.length) {
            safeLocalStorage.setItem('objectives_order', JSON.stringify(filtered));
            savedOrder = JSON.stringify(filtered);
          }
        }
      } catch (e) {}
    }

    const hasSeeded = safeLocalStorage.getItem('has_seeded_fake_db') === 'true';

    if (savedDiaries) {
      this.diaries = JSON.parse(savedDiaries);
    }

    if (savedOrder) {
      try {
        this.objectives = JSON.parse(savedOrder);
        console.log('[FakeDB] Objetivos carregados do localStorage');
        
        // Rebuild goals from objective.metas and load tasks from storage
        this.goals = [];
        this.tasks = [];
        this.objectives.forEach(obj => {
          if (!obj.goalIds) {
            obj.goalIds = [];
          }
          if (obj.metas && Array.isArray(obj.metas)) {
            obj.metas.forEach((meta: any) => {
              const goal = {
                id: meta.id,
                objectiveId: obj.id,
                title: meta.intention || meta.title || '',
                progress: meta.progress || 0,
                status: meta.status || 'todo',
                color: meta.color,
                deadline: meta.deadline,
                projectIds: meta.projectIds || [],
                createdAt: meta.createdAt ? new Date(meta.createdAt).getTime() : Date.now()
              };
              if (!this.goals.some(g => g.id === goal.id)) {
                this.goals.push(goal);
              }
              if (!obj.goalIds.includes(goal.id)) {
                obj.goalIds.push(goal.id);
              }
            });
          }
          
          // Load tasks for this objective from storage
          const tasksKey = `tasks_${obj.title}`;
          const savedTasksString = safeLocalStorage.getItem(tasksKey);
          if (savedTasksString) {
            try {
              const savedTasks = JSON.parse(savedTasksString);
              if (Array.isArray(savedTasks)) {
                savedTasks.forEach((t: any) => {
                  const task = {
                    id: t.id,
                    title: t.title || '',
                    projectId: t.projectId || 'none',
                    goalId: t.metaId || t.goalId || 'none',
                    objectiveId: obj.id,
                    objectiveTitle: obj.title,
                    parentTaskId: t.parentTaskId || null,
                    status: t.status === 'completed' || t.status === 'done' ? 'done' : (t.status === 'in-progress' || t.status === 'doing' ? 'doing' : 'todo'),
                    date: t.date ? new Date(t.date).getTime() : undefined,
                    documentIds: t.documentIds || [],
                    subtaskIds: t.subtaskIds || [],
                    createdAt: t.createdAt ? new Date(t.createdAt).getTime() : Date.now()
                  };
                  if (!this.tasks.some(taskItem => taskItem.id === task.id)) {
                    this.tasks.push(task);
                  }
                });
              }
            } catch (e) {
              console.error(`[FakeDB] Erro ao carregar tarefas para ${obj.title}:`, e);
            }
          }
        });
      } catch (e) {
        console.error('[FakeDB] Erro ao carregar do localStorage', e);
      }
    }

    // Always attempt a backend sync to ensure the latest data
    this.syncWithBackend().catch(err => console.warn('[FakeDB] Falha na sync inicial', err));
  },

  async syncWithBackend() {
    // Sincroniza Diários
    try {
      const data = await diaryService.getDiaries({ page: 1, limit: 100 });
      if (data.entries && Array.isArray(data.entries)) {
        this.diaries = data.entries;
        safeLocalStorage.setItem('diary_entries', JSON.stringify(this.diaries));
        
        try {
          semanticLifeEngine.rebuildLongitudinalMemory(this.diaries);
          existentialCoreEngine.invalidate();
          existentialVectorsEngine.invalidate();
        } catch (e) {
          console.error('[FakeDB] Error rebuilding longitudinal memory inside sync:', e);
        }
        
        organismEventBus.emit('diaryUpdated');
        console.log('[FakeDB] Sincronização de diários com o backend concluída.');
      }
    } catch (e) {
      console.warn('[FakeDB] Falha ao sincronizar diários com o backend, usando cache local:', e);
    }

    // Sincroniza Objetivos, Metas, Projetos e Tarefas
    try {
      const objData = await objectivesService.getObjectivesTree();
      if (objData) {
        this.objectives = objData.objectives || [];
        this.goals = objData.goals || [];
        this.projects = objData.projects || [];
        this.tasks = objData.tasks || [];
        console.log('[FakeDB] Sincronização de objetivos com o backend concluída.');
      }
    } catch (e) {
      console.warn('[FakeDB] Falha ao sincronizar objetivos com o backend:', e);
    }

    // Sincroniza Workspaces, Folders e Documents(Pages)
    try {
      const { workspaceService } = await import('../services/workspaceService');
      const wsData = await workspaceService.getWorkspaces();
      if (wsData && wsData.workspaces) {
        const flatWorkspaces = [];
        const flatFolders = [];
        const flatDocuments = [];

        for (const ws of wsData.workspaces) {
          flatWorkspaces.push({ ...ws, title: ws.name });
          for (const folder of ws.folders || []) {
            flatFolders.push({ ...folder, title: folder.name, workspaceId: ws.id });
            for (const page of folder.pages || []) {
              flatDocuments.push({ ...page, folderId: folder.id, workspaceId: ws.id });
            }
          }
        }

        this.workspaces = flatWorkspaces;
        this.folders = flatFolders;
        this.documents = flatDocuments;
        console.log('[FakeDB] Sincronização de workspaces com o backend concluída.');
        organismEventBus.emit('workspaceUpdated');
      }
    } catch (e) {
      console.warn('[FakeDB] Falha ao sincronizar workspaces com o backend:', e);
    }
  },

  getAll() {
    return {
      objectives: this.objectives,
      goals: this.goals,
      projects: this.projects,
      tasks: this.tasks,
      documents: this.documents,
      events: this.events,
      diaries: this.diaries,
      workspaces: this.workspaces,
      folders: this.folders
    };
  },

  saveDiaryEntries(entries: any[]) {
    this.diaries = entries;
    safeLocalStorage.setItem('diary_entries', JSON.stringify(entries));
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    if (entries.length > 0) {
      safeLocalStorage.removeItem('dashboard_life_reset');
    }
    // Active Real-time Existential Sync
    try {
      semanticLifeEngine.rebuildLongitudinalMemory(entries);
      existentialCoreEngine.invalidate();
      existentialVectorsEngine.invalidate();
    } catch (e) {
      console.error('[FakeDB] Error rebuilding longitudinal memory inside save:', e);
    }
    organismEventBus.emit('diaryUpdated');
  },

  updateDiaryEntry(id: string | number, data: any) {
    const index = this.diaries.findIndex(e => String(e.id) === String(id));
    if (index !== -1) {
      // In-place safe deep key merge to solve race conditions
      const oldEntry = this.diaries[index];
      const merged = { ...oldEntry };
      
      for (const key of Object.keys(data)) {
        if (data[key] !== undefined) {
          merged[key] = data[key];
        }
      }

      // Compute silent local cognitive enrichments of meaning
      const enriched = extractSemanticEntitiesLocal(merged);
      
      this.diaries[index] = enriched;
      this.saveDiaryEntries(this.diaries);

      // Sincroniza com backend de forma assíncrona
      diaryService.saveDiary(String(id), enriched).catch(err => {
        console.warn('[FakeDB] Erro ao sincronizar atualização com o backend:', err);
      });

      return this.diaries[index];
    }
    return null;
  },

  createDiaryEntry() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear().toString().slice(-2);
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const weekday = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const entry: any = {
      id: Math.random().toString(36).substr(2, 9),
      location: 'NOVA LOCALIZAÇÃO',
      status: 'active',
      startAt: Date.now(),
      createdAt: Date.now(),
      title: 'Novo Diário\nSem Título',
      temp: '20°C',
      waves: '1.0 M',
      rating: 'N/A',
      mainImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop',
      eventTitle: 'Novo Evento',
      eventDate: `${day} ${weekday.slice(0, 3)}, Nova`,
      eventImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop',
      circleImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2070&auto=format&fit=crop',
      description: 'Diário recém-criado. Clique para detalhar sua jornada e progresso contínuo.',
      categories: ['GERAL'],
      time,
      day,
      month,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      year,
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1)
    };

    // Pre-initialize basic semantic layout
    const initialized = extractSemanticEntitiesLocal(entry);

    this.diaries.unshift(initialized);
    this.saveDiaryEntries(this.diaries);

    // Sincroniza com backend de forma assíncrona
    diaryService.saveDiary(initialized.id, initialized).catch(err => {
      console.warn('[FakeDB] Erro ao sincronizar nova entrada com o backend:', err);
    });

    return initialized;
  },

  finishDiaryEntry(id: string | number) {
    const entry = this.diaries.find(e => String(e.id) === String(id));
    if (entry && entry.status === 'active') {
      const endAt = Date.now();
      entry.endAt = endAt;
      entry.duration = endAt - (entry.startAt || entry.createdAt);
      entry.status = 'completed';
      this.saveDiaryEntries(this.diaries);
      console.log(`[FakeDB] Diário ${id} finalizado:`, entry);

      // Sincroniza com backend de forma assíncrona
      diaryService.saveDiary(String(id), entry).catch(err => {
        console.warn('[FakeDB] Erro ao sincronizar finalização com o backend:', err);
      });

      return entry;
    }
    return null;
  },

  getSleepMetrics(entryId: string | number) {
    // Ordena os diários cronologicamente pelo timestamp de criação
    const sorted = [...this.diaries]
      .filter(e => e.createdAt || e.startAt)
      .sort((a, b) => (a.createdAt || a.startAt) - (b.createdAt || b.startAt));
    
    const currentIndex = sorted.findIndex(e => String(e.id) === String(entryId));
    const currentEntry = sorted[currentIndex];
    
    let currentSleepMs: number | null = null;
    if (currentIndex > 0 && currentEntry) {
      const prevEntry = sorted[currentIndex - 1];
      if (prevEntry.endAt) {
        const diff = (currentEntry.createdAt || currentEntry.startAt) - prevEntry.endAt;
        // Valida se o período de descanso é realista (entre 1h e 24h)
        if (diff > 1 * 60 * 60 * 1000 && diff < 24 * 60 * 60 * 1000) {
          currentSleepMs = diff;
        }
      }
    }

    // Calcula a média de todas as noites de descanso válidas entre diários consecutivos
    let totalSleepMs = 0;
    let validNightsCount = 0;
    
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (prev.endAt && (curr.createdAt || curr.startAt)) {
        const diff = (curr.createdAt || curr.startAt) - prev.endAt;
        if (diff > 1 * 60 * 60 * 1000 && diff < 24 * 60 * 60 * 1000) {
          totalSleepMs += diff;
          validNightsCount++;
        }
      }
    }

    const averageSleepMs = validNightsCount > 0 ? totalSleepMs / validNightsCount : null;

    return {
      currentSleepMs,
      averageSleepMs,
      validNightsCount
    };
  },

  deleteDiaryEntry(id: string | number) {
    const initialLength = this.diaries.length;
    this.diaries = this.diaries.filter(e => String(e.id) !== String(id));
    if (this.diaries.length !== initialLength) {
       this.saveDiaryEntries(this.diaries);
       console.log(`[FakeDB] Diário ${id} excluído.`);

       // Sincroniza exclusão com backend de forma assíncrona
       diaryService.deleteDiary(String(id)).catch(err => {
         console.warn('[FakeDB] Erro ao excluir diário do backend:', err);
       });

       return true;
    }
    return false;
  },

  resetObjectives() {
    this.objectives = [];
    this.goals = [];
    this.projects = [];
    this.tasks = [];
    this.subtasks = [];
    this.events = [];
    safeLocalStorage.removeItem('objectives_order');
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    safeLocalStorage.setItem('has_seeded_fake_db', 'true');
    console.log('[FakeDB] Objetivos e tarefas resetados.');
    organismEventBus.emit('goalUpdated');

    api.delete('/api/system/reset/objectives')
      .catch(e => console.warn('[FakeDB] Erro ao resetar objetivos no backend:', e));
  },

  resetDiaries() {
    this.diaries = [];
    safeLocalStorage.removeItem('diary_entries');
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    safeLocalStorage.setItem('has_seeded_fake_db', 'true');
    console.log('[FakeDB] Diários resetados.');
    organismEventBus.emit('diaryUpdated');

    api.delete('/api/system/reset/diaries')
      .catch(e => console.warn('[FakeDB] Erro ao resetar diários no backend:', e));
  },

  resetWorkspaces() {
    this.workspaces = [];
    this.folders = [];
    this.documents = [];
    safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
    safeLocalStorage.setItem('has_seeded_fake_db', 'true');
    console.log('[FakeDB] Workspaces, folders, e documentos resetados.');
    organismEventBus.emit('workspaceUpdated');

    api.delete('/api/system/reset/workspaces')
      .catch(e => console.warn('[FakeDB] Erro ao resetar workspaces no backend:', e));
  },

  resetDB() {
    // 1. Wipe all data structures
    this.objectives = [];
    this.goals = [];
    this.projects = [];
    this.tasks = [];
    this.subtasks = [];
    this.documents = [];
    this.workspaces = [];
    this.folders = [];
    this.events = [];
    this.diaries = [];

    // 2. Clear all relevant localStorage
    const keysToClear = [
        'objectives_order',
        'diary_entries',
        'dashboard_snapshot_dirty',
        'has_seeded_fake_db',
        'dashboard_life_reset',
        'personal_os_documents'
    ];
    keysToClear.forEach(key => safeLocalStorage.removeItem(key));
    
    // Set seeded flag to true to prevent re-seeding until explicitly called
    safeLocalStorage.setItem('has_seeded_fake_db', 'true');

    console.log('[FakeDB] Banco de dados e localStorage resetados.');
    
    // 3. Notify the rest of the application
    organismEventBus.emit('systemReset');

    // 4. Backend sync
    api.delete('/api/system/reset/all')
      .catch(e => console.warn('[FakeDB] Erro ao resetar banco completo no backend:', e));
  }
};

/**
 * Extrator semântico local Heurístico (Síncrono)
 * Garante que a estrutura cognitiva esteja sempre presente, sem delays e sem chamadas externas.
 */
function extractSemanticEntitiesLocal(entry: any): any {
  // 1. Abertura do dia (wakeTime, weekday, timezone, initialState, location, climate)
  const dayOpening = entry.dayOpening || {
    date: entry.dayName ? `${entry.day} ${entry.monthName}` : (entry.day ? `${entry.day}/${entry.month}/${entry.year}` : new Date().toLocaleDateString('pt-BR')),
    weekday: entry.weekday || new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
    wakeTime: entry.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    initialState: entry.rating || 'N/A',
    location: entry.location || 'NOVA LOCALIZAÇÃO',
    climate: entry.temp || '20°C'
  };

  // 2. Sonhos (rawText, symbols[], people[], places[], emotions[], themes[])
  const dreams = entry.dreams || [];
  if (dreams.length === 0 && entry.content) {
    const rawText = stripHtml(entry.content);
    dreams.push({
      rawText,
      symbols: extractTagsRegex(rawText, ['#', 'símbolo:', 'simbolo:']),
      people: extractTagsRegex(rawText, ['@', 'pessoa:']),
      places: extractTagsRegex(rawText, ['local:', 'lugar:']),
      emotions: extractTagsRegex(rawText, ['sentimento:', 'emoção:', 'emocao:']),
      themes: []
    });
  } else if (dreams.length > 0 && entry.content) {
    // Sync the first item's raw text if edited
    dreams[0].rawText = stripHtml(entry.content);
    dreams[0].symbols = extractTagsRegex(dreams[0].rawText, ['#', 'símbolo:', 'simbolo:']);
    dreams[0].people = extractTagsRegex(dreams[0].rawText, ['@', 'pessoa:']);
    dreams[0].places = extractTagsRegex(dreams[0].rawText, ['local:', 'lugar:']);
    dreams[0].emotions = extractTagsRegex(dreams[0].rawText, ['sentimento:', 'emoção:', 'emocao:']);
  }

  // 3. Ações (title, priority, completed, continuity, duration)
  const actions = (entry.essentialActions || []).map((act: any) => ({
    title: act.text || act.title || '',
    priority: act.priority || 'medium',
    completed: !!act.completed,
    continuity: act.continuity || false,
    duration: act.duration || 0
  }));

  // 4. Hábitos (name, frequency, streak)
  const habits = (entry.recurringActions || []).map((hab: any) => ({
    name: hab.text || hab.title || '',
    frequency: hab.frequency || 'diária',
    streak: hab.streak || 0
  }));

  // 5. Insights (content, source, importance, relatedProjects[])
  const insights = entry.insights || [];
  if (insights.length === 0 && entry.insightsContent) {
    const raw = stripHtml(entry.insightsContent);
    insights.push({
      content: raw,
      source: 'Autoconsciência',
      importance: 'alta',
      relatedProjects: []
    });
  } else if (insights.length > 0 && entry.insightsContent) {
    insights[0].content = stripHtml(entry.insightsContent);
  }

  // 6. Estado (physical, mental, emotional, energetic)
  const state = {
    physical: Array.isArray(entry.posture) ? entry.posture.join(', ') : (entry.posture || ''),
    mental: Array.isArray(entry.mental) ? entry.mental.join(', ') : (entry.mental || ''),
    emotional: Array.isArray(entry.emotion) ? entry.emotion.join(', ') : (entry.emotion || ''),
    energetic: Array.isArray(entry.energy) ? entry.energy.join(', ') : (entry.energy || '')
  };

  // 7. Amparadora Guidance (message, theme, context, relatedState)
  const guidance = entry.guidance || {
    message: stripHtml(entry.guidanceContent || ''),
    theme: 'conselho',
    context: 'assistencial',
    relatedState: Array.isArray(entry.energy) ? entry.energy[0] : ''
  };
  if (entry.guidanceContent) {
    guidance.message = stripHtml(entry.guidanceContent);
  }

  // 8. Day Synthesis (consolidation summary, lessons[], transformations[])
  const daySynthesis = entry.daySynthesis || {
    summary: stripHtml(entry.consolidationContent || entry.description || ''),
    lessons: [],
    transformations: []
  };
  if (entry.consolidationContent) {
    daySynthesis.summary = stripHtml(entry.consolidationContent);
  }

  // 9. Semantic Entities (people, places, symbols, themes, emotions, projects, dreamPatterns, repeatedElements)
  const semanticEntities = entry.semanticEntities || {
    people: [],
    places: [],
    symbols: [],
    themes: [],
    emotions: [],
    projects: [],
    dreamPatterns: [],
    repeatedElements: []
  };

  // Sync basic global lists
  if (dreams[0]) {
    semanticEntities.symbols = [...new Set([...semanticEntities.symbols, ...dreams[0].symbols])];
    semanticEntities.people = [...new Set([...semanticEntities.people, ...dreams[0].people])];
    semanticEntities.places = [...new Set([...semanticEntities.places, ...dreams[0].places])];
    semanticEntities.emotions = [...new Set([...semanticEntities.emotions, ...dreams[0].emotions])];
  }

  // 10. Escrita Livre block conversion
  const blocks = entry.blocks || [];
  if (blocks.length === 0 && entry.freeContent) {
    const text = stripHtml(entry.freeContent);
    if (text.trim()) {
      blocks.push({
        type: 'text',
        value: text
      });
    }
  } else if (blocks.length > 0 && entry.freeContent) {
    const text = stripHtml(entry.freeContent);
    const existingIdx = blocks.findIndex((b: any) => b.type === 'text');
    if (existingIdx !== -1) {
      blocks[existingIdx].value = text;
    } else {
      blocks.push({ type: 'text', value: text });
    }
  }

  return {
    ...entry,
    dayOpening,
    dreams,
    actions,
    habits,
    insights,
    state,
    guidance,
    daySynthesis,
    semanticEntities,
    blocks
  };
}

function stripHtml(html: string): string {
  if (!html) return '';
  // Convert standard break tags to spacing for readability, then strip
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTagsRegex(text: string, prefixes: string[]): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const found: string[] = [];
  for (const word of words) {
    for (const prefix of prefixes) {
      if (word.toLowerCase().startsWith(prefix) && word.length > prefix.length) {
        const item = word.slice(prefix.length).replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '');
        if (item && !found.includes(item)) {
          found.push(item);
        }
      }
    }
  }
  return found;
}

