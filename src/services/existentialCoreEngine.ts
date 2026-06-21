import { fakeDB } from '../core/fakeDB';
import { db } from './db';
import { CategoryType } from '../types';
import { dashboardSemanticService } from './dashboardSemanticService';
import { semanticLifeEngine } from './semanticLifeEngine';
import { GlobalMemoryService } from './GlobalMemoryService';
import { safeLocalStorage } from '../utils/storage';
import { documentService } from './documentService';
import { notebookManager } from '../core/notebookContext';

export interface GlobalExistentialMemory {
  mind: {
    dreamSymbols: string[];
    recurrentEmotions: string[];
    insightsCount: number;
  };
  energy: {
    avgEnergy: number;
    evFrequency: number;
    highEnergyPlaces: string;
  };
  sleep: {
    avgWakeTime: string;
    avgSleepTime: string;
  };
  habits: {
    consistency: number;
    checkedToday: number;
  };
  focus: {
    avgFocus: number;
    activeHours: number;
  };
  goals: {
    total: number;
    completed: number;
    progress: number;
  };
  finance: {
    balance: number;
    monthlyBurn: number;
    financialHealth: string;
  };
  social: {
    recurrentPeople: string[];
    mentorSintonia: boolean;
  };
  patterns: {
    emotionalEvolution: string;
    criticalTrends: string[];
  };
  correlations: {
    energyVsLucidity: string;
    sleepVsFoco: string;
  };
  longitudinal: {
    totalRegisters: number;
    yearsProjected: number;
  };
  documents: {
    total: number;
    recentTitles: string[];
    activeWorkspace: string;
  };
  organization: {
    workspaceCount: number;
    folderCount: number;
    activeWorkspace: string;
    recentDocuments: string[];
  };
  knowledge: {
    notesCount: number;
    noteCount: number;
    recurringTopics: string[];
    activeDrafts: number;
  };
  assets: {
    totalAssets: number;
    estimatedValue: number;
    categories: string[];
    vaultItems: number;
  };
  planning: {
    monthlyProjections: number[];
    futureEvents: string[];
    projections: number[];
    upcomingEvents: string[];
    tomorrowActions: string[];
  };
  operations: {
    activeProjects: number;
    activeGoals: number;
    activeTasks: number;
  };
}

const EXISTENTIAL_CACHE_KEY = 'global_existential_memory_cache';

export const existentialCoreEngine = {
  /**
   * Compila em tempo real todos os sistemas persistentes do organismo,
   * gerando correlações matemáticas e psicológicas avançadas.
   */
  generateGlobalMemory(): GlobalExistentialMemory {
    console.log('[ExistentialCoreEngine] Compilando Cérebro Global...');

    // 1. Obter snapshot do dashboard e memória longitudinal
    const categories = db.getCategories();
    const transactions = db.getTransactions();
    const dashSnap = dashboardSemanticService.getOrGenerateSnapshot(categories, transactions);
    const longitudinalMemory = semanticLifeEngine.getLongitudinalMemory(fakeDB.diaries);

    // 2. Extrair dados das tarefas, objetivos, projetos do fakeDB
    const objectives = fakeDB.objectives || [];
    const goals = fakeDB.goals || [];
    const projects = fakeDB.projects || [];
    const tasks = fakeDB.tasks || [];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
    const tasksProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 80;

    // 3. Financeiro
    const muralData = db.getMuralData();
    const balance = muralData.netWorth?.current_cash ?? 0.00;
    
    let burnSum = 0;
    transactions.forEach(t => {
      const cat = categories.find(c => c.id === t.category_id);
      if (cat && cat.type !== CategoryType.INCOME) {
        burnSum += t.value;
      }
    });
    const monthlyBurn = burnSum || 3800;
    const financialHealth = balance > monthlyBurn * 6 ? 'Sólida (Reserva > 6m)' : 'Atenção (Reserva sensível)';

    // 4. Diários, Hábitos e Fogo Lucidez (Sonhos, EV)
    const diaries = fakeDB.diaries || [];
    const totalRegisters = diaries.length;

    // Obter dados longos da memória semântica
    const long = longitudinalMemory.longitudinal;
    const avgEnergy = long?.averageEnergy ?? Number(dashSnap.diario?.energiaMedio ?? 8.5);
    const evFrequency = long?.evFrequency ?? 35; // default fallback do EV

    // Hábitos resolvidos por diário recente
    let habitsCheckedSum = 0;
    let totalHabitsCount = 0;
    diaries.slice(0, 5).forEach(d => {
      const rec = d.recurringActions || [];
      totalHabitsCount += rec.length;
      habitsCheckedSum += rec.filter((r: any) => r.completed).length;
    });
    const habitsConsistency = totalHabitsCount > 0 ? Math.round((habitsCheckedSum / totalHabitsCount) * 100) : (dashSnap.consistencia?.score ?? 90);

    // Hoje hábitos concluidos
    const todayDiary = diaries[0];
    const checkedTodayCount = todayDiary?.recurringActions?.filter((r: any) => r.completed).length ?? 0;

    // 5. Contatos Sociais e Conexão de Mentores
    const recurPeople = long?.recurrentPeople?.slice(0, 3) ?? ['Orientador', 'Guia_assistencial'];
    const textCombined = diaries.slice(0, 10).map((d: any) => JSON.stringify(d)).join(' ').toLowerCase();
    const mentorSintonia = textCombined.includes('amparador') || textCombined.includes('mentor') || textCombined.includes('guia') || textCombined.includes('outor');

    // 6. Correlações e Inteligência Avançada
    const avgWake = long?.averageWakeTime ?? '06:30';
    const numWakeHour = parseInt(avgWake.split(':')[0]) || 6;
    const sleepVsFoco = numWakeHour <= 7 
      ? `Sintonia Circadiana Ótima: Acordar às ${avgWake} potencializa cognição e foco diário (+15% no snapshot).`
      : `Desalinhamento Circadiano Sutil: Despertar às ${avgWake} gera dispersão de energia de foco vespertino.`;

    const energyVsLucidity = evFrequency > 40
      ? `Autodeterminação Bioenergética Forte: Frequência de EV em ${evFrequency}% estabelece blindagem áurica e lucidez onírica ativa.`
      : `Dispersão Energética Ordinária: Frequência de EV em ${evFrequency}% demanda exercícios adicionais de circulação de energia voluntária.`;

    // 7. Agregações para os silos integrados (conhecimento, documentos, patrimônio, planejamento)
    const workspaces = documentService.getWorkspaces();
    let totalDocs = 0;
    let folderCount = 0;
    const allPages: any[] = [];
    workspaces.forEach(ws => {
      if (ws.isHidden) return; // Skip hidden workspaces entirely from the AI's existential core learning or reference
      const folders = ws.folders || [];
      folderCount += folders.length;
      folders.forEach(f => {
        totalDocs += (f.pages || []).length;
        (f.pages || []).forEach(p => {
          allPages.push(p);
        });
      });
    });

    const sortedPages = [...allPages].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    const recentTitles = sortedPages.slice(0, 3).map(p => p.title || 'Sem título');
    const activeWorkspace = workspaces[0]?.name || 'Meu Workspace';

    // knowledge
    const notesCount = (diaries.filter(d => d.notes || d.insightsContent).length || 0) + totalDocs;
    const topicsSet = new Set<string>();
    diaries.forEach(d => {
      if (d.tags) d.tags.forEach((t: string) => topicsSet.add(t));
    });
    allPages.forEach(p => {
      if (p.title) {
        const words = p.title.toLowerCase().split(/\s+/).filter((w: string) => w.length > 4);
        words.slice(0, 2).forEach((w: string) => topicsSet.add(w));
      }
    });
    let recurringTopics = Array.from(topicsSet).slice(0, 4);
    if (recurringTopics.length === 0) {
      recurringTopics = ['Projeção astral', 'Estágio mental', 'Evolução financeira', 'Organismo bioenergético'];
    }

    // assets & vault & links
    const assetsList = muralData.assets || [];
    const vaultList = muralData.vault || [];
    const totalAssets = assetsList.length + vaultList.length;
    let estimatedValue = assetsList.reduce((acc, a) => acc + (Number(a.value) || 0), 0);
    vaultList.forEach(v => {
      if (v.value) estimatedValue += Number(v.value);
    });
    const assetCategories = Array.from(new Set(assetsList.map(a => a.category || 'Geral')));

    // planning & projections
    const projections = db.getProjections();
    let monthlyProjections = projections.map(p => Number(p.allowed_value || 0)).slice(0, 7);
    if (monthlyProjections.length === 0) {
      monthlyProjections = [12000, 15000, 14000, 16000];
    }
    const futureEvents: string[] = [];
    goals.forEach(g => {
      if (g.targetDate || g.deadline) {
        futureEvents.push(`${g.title} (${g.targetDate || g.deadline})`);
      }
    });
    if (futureEvents.length === 0) {
      futureEvents.push('Consolidação Patrimonial (2026-12)', 'Refinamento do Motor Onírico (2026-06)');
    }

    // tomorrowActions from the most recent diary 
    const latestDiaryWithTomorrowActions = diaries.find(d => d.tomorrowActions && d.tomorrowActions.length > 0);
    const tomorrowActionsList = latestDiaryWithTomorrowActions
      ? latestDiaryWithTomorrowActions.tomorrowActions.map((act: any) => typeof act === 'string' ? act : (act.text || act.title || ''))
      : ['Prática diária de EV', 'Preparação onírica lúcida'];

    // 8. Compilar o Objeto Global
    const globalMemory: GlobalExistentialMemory = {
      mind: {
        dreamSymbols: long?.recurrentSymbols ?? ['Lucidez', 'Voo', 'Natureza'],
        recurrentEmotions: long?.recurrentEmotions ?? ['Paz', 'Foco', 'Calma'],
        insightsCount: diaries.filter(d => d.insightsContent || d.insights?.length > 0).length || 14
      },
      energy: {
        avgEnergy,
        evFrequency,
        highEnergyPlaces: dashSnap.diario?.places?.slice(0, 2).join(', ') || 'Dimensão Sutil, Natureza'
      },
      sleep: {
        avgWakeTime: avgWake,
        avgSleepTime: long?.averageSleepTime ?? '23:15'
      },
      habits: {
        consistency: habitsConsistency,
        checkedToday: checkedTodayCount
      },
      focus: {
        avgFocus: parseFloat(dashSnap.foco?.coeficiente ?? '8.5'),
        activeHours: Math.round(completedTasks * 1.5 + tasks.filter(t => t.status === 'doing').length * 2) || 12
      },
      goals: {
        total: objectives.length,
        completed: objectives.filter(o => fakeDB.getObjectiveProgress(o.id) === 100).length,
        progress: objectives.reduce((acc, o) => acc + fakeDB.getObjectiveProgress(o.id), 0) / (objectives.length || 1)
      },
      finance: {
        balance,
        monthlyBurn,
        financialHealth
      },
      social: {
        recurrentPeople: recurPeople,
        mentorSintonia
      },
      patterns: {
        emotionalEvolution: long?.emotionalEvolution ?? 'Estável com oscilação positiva',
        criticalTrends: long?.trends ?? ['Foco alto', 'Reserva financeira estável']
      },
      correlations: {
        energyVsLucidity,
        sleepVsFoco
      },
      longitudinal: {
        totalRegisters,
        yearsProjected: parseFloat((totalRegisters / 365).toFixed(2)) || 0.1
      },
      documents: {
        total: totalDocs,
        recentTitles,
        activeWorkspace
      },
      organization: {
        workspaceCount: workspaces.length,
        folderCount,
        activeWorkspace,
        recentDocuments: recentTitles
      },
      knowledge: {
        notesCount,
        noteCount: notesCount,
        recurringTopics,
        activeDrafts: allPages.filter(p => !p.content || p.content.length < 100).length || 2
      },
      assets: {
        totalAssets,
        estimatedValue,
        categories: assetCategories,
        vaultItems: vaultList.length
      },
      planning: {
        monthlyProjections,
        futureEvents,
        projections: monthlyProjections,
        upcomingEvents: futureEvents,
        tomorrowActions: tomorrowActionsList
      },
      operations: {
        activeProjects: projects.filter(p => p.status !== 'done' && p.status !== 'completed').length || projects.length,
        activeGoals: goals.filter(g => g.status !== 'done' && g.status !== 'completed').length || goals.length,
        activeTasks: tasks.filter(t => t.status !== 'done' && t.status !== 'completed').length || tasks.length
      }
    };

    safeLocalStorage.setItem(EXISTENTIAL_CACHE_KEY, JSON.stringify(globalMemory));
    return globalMemory;
  },

  /**
   * Obtém a memória existencial agregada instantaneamente (O(1)) do cache, ou recalcula se estiver 'dirty'.
   */
  getGlobalMemory(): GlobalExistentialMemory {
    const isDirty = safeLocalStorage.getItem('dashboard_snapshot_dirty') === 'true';
    const cached = safeLocalStorage.getItem(EXISTENTIAL_CACHE_KEY);
    if (cached && !isDirty) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('[ExistentialCoreEngine] Cache inválido ou corrompido, recalculando...', e);
      }
    }
    return this.generateGlobalMemory();
  },

  /**
   * Invalida explicitamente o cache existencial.
   */
  invalidate() {
    safeLocalStorage.removeItem(EXISTENTIAL_CACHE_KEY);
  }
};
