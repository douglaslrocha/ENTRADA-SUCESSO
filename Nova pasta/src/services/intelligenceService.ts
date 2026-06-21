import { TaskData } from '../components/TaskBuilderModal';

export interface ExecutionInsight {
  type: 'time' | 'effort' | 'pattern' | 'suggestion';
  message: string;
  severity: 'info' | 'warning' | 'success';
}

export interface PerformanceStats {
  avgTimePerTask: string;
  estimationAccuracy: number; // percentage
  completionRate: number; // percentage
  consistencyScore: number; // 0-100
  totalTasks: number;
  completedTasks: number;
}

export const analyzeTaskExecution = (task: TaskData, allTasks: TaskData[]): ExecutionInsight[] => {
  const insights: ExecutionInsight[] = [];
  
  // 1. Time Analysis
  const parseDuration = (dur: string) => {
    let mins = 0;
    const h = dur.match(/(\d+)h/);
    const m = dur.match(/(\d+)m/);
    if (h) mins += parseInt(h[1]) * 60;
    if (m) mins += parseInt(m[1]);
    return mins * 60;
  };

  const estimatedSecs = parseDuration(task.estimatedDuration || '0m');
  const actualSecs = task.actualDuration || 0;

  if (actualSecs > estimatedSecs && estimatedSecs > 0) {
    const diffPercent = Math.round(((actualSecs - estimatedSecs) / estimatedSecs) * 100);
    insights.push({
      type: 'time',
      message: `Você levou ${Math.round(actualSecs / 60)}min (estimado: ${Math.round(estimatedSecs / 60)}min). Esta tarefa exigiu ${diffPercent}% mais tempo do que o previsto.`,
      severity: 'warning'
    });
  } else if (actualSecs > 0) {
    insights.push({
      type: 'time',
      message: `Excelente precisão! Você concluiu a tarefa dentro do tempo estimado.`,
      severity: 'success'
    });
  }

  // 2. Effort Analysis
  if (task.realEffort === 'higher') {
    insights.push({
      type: 'effort',
      message: "Você marcou o esforço como ALTO. Tarefas deste tipo tendem a consumir mais energia mental do que o planejado.",
      severity: 'info'
    });
  }

  // 3. Pattern Analysis (Simulated based on history)
  const strategicTasks = allTasks.filter(t => t.executionStrategy && t.executionStrategy.length > 50);
  const delayedStrategic = strategicTasks.filter(t => (t.actualDuration || 0) > parseDuration(t.estimatedDuration || '0m'));
  
  if (delayedStrategic.length > 1 && task.executionStrategy && task.executionStrategy.length > 50) {
    insights.push({
      type: 'pattern',
      message: "Padrão detectado: Você frequentemente subestima o tempo necessário para tarefas de alta complexidade estratégica.",
      severity: 'warning'
    });
  }

  // 4. Energy Work Analysis
  if (task.executionType === 'energy-work' && task.energyWorkExecution) {
    const { intensity, lucidity, phenomena } = task.energyWorkExecution;
    
    if (intensity && intensity >= 8) {
      insights.push({
        type: 'pattern',
        message: "Manutenção Energética potente detectada. Sua mobilização atingiu níveis de alta parapercepção.",
        severity: 'success'
      });
    }
    
    if (lucidity && lucidity <= 2) {
      insights.push({
        type: 'suggestion',
        message: "Sinal de baixa lucidez. Experimente técnicas de foco mental ou respiração holotrópica antes da próxima mobilização.",
        severity: 'warning'
      });
    }

    if (phenomena && phenomena.length > 0) {
      insights.push({
        type: 'pattern',
        message: `Fenômenos parapsíquicos registrados (${phenomena.length}). Mantenha o mapeamento para identificar gatilhos evolutivos.`,
        severity: 'success'
      });
    }
  }

  return insights;
};

export const getPerformanceStats = (tasks: TaskData[]): PerformanceStats => {
  const completed = tasks.filter(t => t.status === 'completed');
  const total = tasks.length;
  
  if (completed.length === 0) {
    return {
      avgTimePerTask: '0m',
      estimationAccuracy: 0,
      completionRate: 0,
      consistencyScore: 0,
      totalTasks: total,
      completedTasks: 0
    };
  }

  const totalActualTime = completed.reduce((acc, t) => acc + (t.actualDuration || 0), 0);
  const avgMins = Math.round((totalActualTime / completed.length) / 60);

  // Estimation Accuracy
  let accuracySum = 0;
  completed.forEach(t => {
    const est = parseDurationStatic(t.estimatedDuration || '0m');
    const act = t.actualDuration || 0;
    if (est > 0) {
      const accuracy = Math.max(0, 100 - Math.abs(((act - est) / est) * 100));
      accuracySum += accuracy;
    } else {
      accuracySum += 100;
    }
  });
  const avgAccuracy = Math.round(accuracySum / completed.length);

  return {
    avgTimePerTask: `${avgMins}m`,
    estimationAccuracy: avgAccuracy,
    completionRate: Math.round((completed.length / total) * 100),
    consistencyScore: Math.round((completed.length / Math.max(1, total)) * 85 + (avgAccuracy * 0.15)),
    totalTasks: total,
    completedTasks: completed.length
  };
};

const parseDurationStatic = (dur: string) => {
  let mins = 0;
  const h = dur.match(/(\d+)h/);
  const m = dur.match(/(\d+)m/);
  if (h) mins += parseInt(h[1]) * 60;
  if (m) mins += parseInt(m[1]);
  return mins * 60;
};

export const getNextActionSuggestion = (tasks: TaskData[]): TaskData | null => {
  const pending = tasks.filter(t => t.status !== 'completed' && t.status !== 'blocked');
  if (pending.length === 0) return null;

  // Sort by priority and impact
  return pending.sort((a, b) => {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    const impactMap = { high: 3, medium: 2, low: 1 };
    
    const scoreA = priorityMap[a.priority] * 2 + impactMap[a.impact];
    const scoreB = priorityMap[b.priority] * 2 + impactMap[b.impact];
    
    return scoreB - scoreA;
  })[0];
};

export const generateMockHistory = (objectiveTitle: string, metaId: string): TaskData[] => {
  const now = new Date();
  return [
    {
      id: 'mock-1',
      title: 'Análise de Mercado Competitivo',
      description: 'Pesquisa profunda sobre concorrentes diretos.',
      metaId: 'meta-2',
      subtasks: [],
      checklist: [],
      estimatedDuration: '1h',
      actualDuration: 5400, // 1.5h
      date: new Date(now.getTime() - 86400000 * 2).toISOString(),
      time: '10:00',
      recurrence: 'none',
      priority: 'high',
      impact: 'high',
      executionStrategy: 'Analisar os top 3 concorrentes e mapear diferenciais competitivos.',
      linkedPages: [],
      metricType: 'unidade',
      evolucaoEsperada: 'Relatório de diferenciais',
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      status: 'completed',
      realEffort: 'higher',
      completedAt: new Date(now.getTime() - 86400000 * 2 + 5400000).toISOString()
    },
    {
      id: 'mock-2',
      title: 'Definição de Persona Ideal',
      description: 'Criar o perfil do cliente ideal.',
      metaId: 'meta-2',
      subtasks: [],
      checklist: [],
      estimatedDuration: '45m',
      actualDuration: 2400, // 40m
      date: new Date(now.getTime() - 86400000).toISOString(),
      time: '14:00',
      recurrence: 'none',
      priority: 'medium',
      impact: 'medium',
      executionStrategy: 'Entrevistar 2 clientes atuais para validar hipóteses.',
      linkedPages: [],
      metricType: 'entrega',
      evolucaoEsperada: 'Documento de Persona',
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      status: 'completed',
      realEffort: 'equal',
      completedAt: new Date(now.getTime() - 86400000 + 2400000).toISOString()
    },
    {
      id: 'mock-3',
      title: 'Prototipação de Alta Fidelidade',
      description: 'Desenhar as telas principais do fluxo de onboarding.',
      metaId: 'meta-1',
      subtasks: [
        { id: 'st1', text: 'Wireframes estruturais', completed: true },
        { id: 'st2', text: 'Design visual (UI)', completed: false },
        { id: 'st3', text: 'Prototipagem interativa', completed: false }
      ],
      checklist: [],
      estimatedDuration: '2h',
      date: new Date().toISOString(),
      time: '15:30',
      recurrence: 'none',
      priority: 'critical',
      impact: 'high',
      executionStrategy: 'Focar na jornada principal do usuário sem distrações.',
      linkedPages: [],
      metricType: 'entrega',
      evolucaoEsperada: 'Protótipo no Figma',
      createdAt: new Date(now.getTime() - 86400000).toISOString(),
      status: 'pending'
    },
    {
      id: 'mock-4',
      title: 'Revisão de Arquitetura de Componentes',
      description: 'Padronizar os componentes do Design System.',
      metaId: 'meta-1',
      subtasks: [],
      checklist: [],
      estimatedDuration: '1h 30m',
      date: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
      time: '09:00',
      recurrence: 'none',
      priority: 'high',
      impact: 'medium',
      executionStrategy: 'Garantir que todos os botões e inputs sigam a nova paleta.',
      linkedPages: [],
      metricType: 'unidade',
      evolucaoEsperada: 'Design System atualizado',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: 'mock-5',
      title: 'Entrevista com Usuários Beta',
      description: 'Conduzir 3 entrevistas com usuários selecionados.',
      metaId: 'meta-2',
      subtasks: [],
      checklist: [],
      estimatedDuration: '3h',
      date: new Date(now.getTime() + 86400000 * 2).toISOString(), // Day after tomorrow
      time: '14:00',
      recurrence: 'none',
      priority: 'medium',
      impact: 'high',
      executionStrategy: 'Gravar as sessões e transcrever os principais insights.',
      linkedPages: [],
      metricType: 'unidade',
      evolucaoEsperada: 'Insights documentados',
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
  ];
};
