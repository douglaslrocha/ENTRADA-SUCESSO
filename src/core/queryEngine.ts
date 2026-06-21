import { fakeDB } from './fakeDB';
import { db } from '../services/db';
import { CategoryType } from '../types';

export interface QueryResult {
  success: boolean;
  text: string;
  data: any;
  ui: {
    type: "card" | "list" | "dashboard";
  };
  suggestions: string[];
}

/**
 * Motor de consulta do sistema.
 * Responsável por extrair dados reais do fakeDB e calcular métricas.
 */
export const queryEngine = {
  processQuery(intent: string, entities: any): QueryResult {
    console.log(`[QueryEngine] Processando consulta: ${intent}`, entities);

    try {
      switch (intent) {
        case 'query_objective_progress':
          return this.handleObjectiveProgress(entities);
        case 'query_project_progress':
          return this.handleProjectProgress(entities);
        case 'query_tasks':
          return this.handleQueryTasks(entities);
        case 'query_projects':
          return this.handleQueryProjects(entities);
        case 'query_timeline':
          return this.handleQueryTimeline(entities);
        case 'query_summary':
          return this.handleQuerySummary();
        case 'query_financial_history':
          return this.handleFinancialHistory(entities);
        case 'query_global_search':
          return this.handleGlobalSearch(entities);
        default:
          return this.handleUnknownQuery();
      }
    } catch (error) {
      console.error('[QueryEngine] Erro ao processar consulta:', error);
      return {
        success: false,
        text: "Ocorreu um erro ao consultar os dados do sistema.",
        data: null,
        ui: { type: 'card' },
        suggestions: ['Tentar novamente', 'Ver meus projetos']
      };
    }
  },

  handleFinancialHistory(entities: any): QueryResult {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    let filtered = [...transactions];

    if (entities.category) {
      const cat = categories.find(c => c.name.toLowerCase().includes(entities.category.toLowerCase()));
      if (cat) {
        filtered = filtered.filter(t => t.category_id === cat.id);
      }
    }

    if (entities.period === '3_years') {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      filtered = filtered.filter(t => new Date(t.date) >= threeYearsAgo);
    }

    const total = filtered.reduce((acc, t) => acc + t.value, 0);
    
    return {
      success: true,
      text: `Análise histórica concluída. Encontrei ${filtered.length} transações no período solicitado, totalizando R$ ${total.toLocaleString('pt-BR')}.`,
      data: { transactions: filtered.slice(0, 50), total, count: filtered.length },
      ui: { type: 'list' },
      suggestions: ['Ver gráfico de evolução', 'Comparar com orçamento']
    };
  },

  handleGlobalSearch(entities: any): QueryResult {
    const query = (entities.query || '').toLowerCase();
    const allTasks = fakeDB.tasks.filter(t => t.title.toLowerCase().includes(query));
    const allProjects = fakeDB.projects.filter(p => p.title.toLowerCase().includes(query));
    const allTransactions = db.getTransactions().filter(t => (t.note || '').toLowerCase().includes(query));

    const results = [
      ...allTasks.map(t => ({ type: 'task', title: t.title, id: t.id })),
      ...allProjects.map(p => ({ type: 'project', title: p.title, id: p.id })),
      ...allTransactions.map(t => ({ type: 'transaction', title: t.note || 'Transação', value: t.value, id: t.id }))
    ];

    return {
      success: true,
      text: `Busca global finalizada para "${query}". Encontrei ${results.length} resultados relevantes em todo o ecossistema.`,
      data: { results },
      ui: { type: 'list' },
      suggestions: ['Filtrar por data', 'Nova busca']
    };
  },

  handleObjectiveProgress(entities: any): QueryResult {
    const objName = entities.objectiveName || entities.title;
    const objective = objName ? fakeDB.findObjectiveByName(objName) : fakeDB.objectives[0];

    if (!objective) {
      return {
        success: false,
        text: `Não encontrei o objetivo "${objName || 'estratégico'}".`,
        data: null,
        ui: { type: 'card' },
        suggestions: ['Listar todos os objetivos', 'Criar novo objetivo']
      };
    }

    const progress = fakeDB.getObjectiveProgress(objective.id);
    const goals = fakeDB.goals.filter(g => g.objectiveId === objective.id);

    return {
      success: true,
      text: `O progresso atual do objetivo "${objective.title}" é de ${progress}%. Ele possui ${goals.length} metas vinculadas.`,
      data: { objective, progress, goalsCount: goals.length },
      ui: { type: 'card' },
      suggestions: ['Ver metas vinculadas', 'Ver projetos deste objetivo']
    };
  },

  handleProjectProgress(entities: any): QueryResult {
    const projName = entities.projectName || entities.title;
    const project = projName ? fakeDB.findProjectByName(projName) : null;

    if (!project) {
      return {
        success: false,
        text: `Não encontrei o projeto "${projName || 'especificado'}".`,
        data: null,
        ui: { type: 'card' },
        suggestions: ['Listar meus projetos', 'Criar novo projeto']
      };
    }

    const progress = fakeDB.getProjectProgress(project.id);
    const tasks = fakeDB.tasks.filter(t => t.projectId === project.id);
    const completed = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;

    return {
      success: true,
      text: `O projeto "${project.title}" está com ${progress}% de conclusão. (${completed}/${tasks.length} tarefas finalizadas).`,
      data: { project, progress, tasksCount: tasks.length, completedCount: completed },
      ui: { type: 'card' },
      suggestions: ['Ver tarefas pendentes', 'Adicionar nova tarefa']
    };
  },

  handleQueryTasks(entities: any): QueryResult {
    let filteredTasks = [...fakeDB.tasks];

    if (entities.status) {
      filteredTasks = filteredTasks.filter(t => t.status === entities.status);
    }

    if (entities.projectName) {
      const project = fakeDB.findProjectByName(entities.projectName);
      if (project) {
        filteredTasks = filteredTasks.filter(t => t.projectId === project.id);
      }
    }

    const text = filteredTasks.length > 0 
      ? `Encontrei ${filteredTasks.length} tarefas que correspondem aos seus critérios.`
      : "Não encontrei tarefas com esses filtros.";

    return {
      success: true,
      text,
      data: { tasks: filteredTasks },
      ui: { type: 'list' },
      suggestions: ['Ver todas as tarefas', 'Criar nova tarefa']
    };
  },

  handleQueryProjects(entities: any): QueryResult {
    const projects = fakeDB.projects.map(p => ({
      ...p,
      progress: fakeDB.getProjectProgress(p.id)
    }));

    return {
      success: true,
      text: `Você tem ${projects.length} projetos ativos no momento.`,
      data: { projects },
      ui: { type: 'list' },
      suggestions: ['Ver progresso geral', 'Criar novo projeto']
    };
  },

  handleQueryTimeline(): QueryResult {
    const events = [...fakeDB.events].sort((a, b) => a.date - b.date);
    const upcomingTasks = fakeDB.tasks
      .filter(t => t.date && t.status !== 'done')
      .sort((a, b) => (a.date || 0) - (b.date || 0));

    return {
      success: true,
      text: "Aqui está sua linha do tempo operacional para os próximos dias.",
      data: { timeline: [...events, ...upcomingTasks] },
      ui: { type: 'list' },
      suggestions: ['Agendar novo evento', 'Ver calendário completo']
    };
  },

  handleQuerySummary(): QueryResult {
    const allData = fakeDB.getAll();
    const totalTasks = allData.tasks.length;
    const completedTasks = allData.tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const pendingTasks = totalTasks - completedTasks;
    const activeProjects = allData.projects.length;
    const objectivesCount = allData.objectives.length;

    const stats = [
      { label: 'Projetos Ativos', value: activeProjects.toString(), trend: '+2 esta semana', status: 'primary' },
      { label: 'Tarefas Pendentes', value: pendingTasks.toString(), trend: '-5% vs ontem', status: 'warning' },
      { label: 'Conclusão Geral', value: `${Math.round((completedTasks / (totalTasks || 1)) * 100)}%`, trend: '+12% este mês', status: 'success' },
      { label: 'Objetivos', value: objectivesCount.toString(), trend: 'Em dia', status: 'info' }
    ];

    const insights = [
      `Você concluiu ${completedTasks} tarefas até agora. Bom trabalho!`,
      `Existem ${pendingTasks} tarefas aguardando sua ação.`,
      `Seu projeto mais ativo tem ${Math.max(...allData.projects.map(p => allData.tasks.filter(t => t.projectId === p.id).length), 0)} tarefas.`
    ];

    return {
      success: true,
      text: `Resumo operacional: Você tem ${activeProjects} projetos ativos, com ${pendingTasks} tarefas pendentes.`,
      data: {
        stats,
        insights,
        raw: {
          totalTasks,
          completedTasks,
          pendingTasks,
          activeProjects,
          objectivesCount
        }
      },
      ui: { type: 'dashboard' },
      suggestions: ['Ver meus projetos', 'Ver tarefas de hoje']
    };
  },

  handleUnknownQuery(): QueryResult {
    return {
      success: false,
      text: "Desculpe, não entendi qual consulta você deseja realizar.",
      data: null,
      ui: { type: 'card' },
      suggestions: ['Resumo geral', 'Meus projetos', 'Minhas tarefas']
    };
  }
};
