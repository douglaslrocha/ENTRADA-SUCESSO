import { projectService } from './projectService';
import { taskService } from './taskService';
import { db } from './db';
import { presenceService } from './presenceService';
import { safeLocalStorage } from '../utils/storage';

export interface OrganismSnapshot {
  objectives: {
    active: string[];
    completed: number;
    total: number;
  };
  tasks: {
    pending: string[];
    completedCount: number;
  };
  finances: {
    netWorth: number;
    recentTransactions: string[];
  };
  energyPractices: {
    lastEV?: string;
    recentPresences: string[];
  };
  context: {
    lastDiaryEntry?: string;
    mood?: string;
    direction?: string;
  };
  timestamp: string;
}

export const OrganismContextService = {
  getSnapshot(): OrganismSnapshot {
    const projects = projectService.getProjects();
    const tasks = taskService.getTasksLocal();
    const mural = db.getMuralData();
    const transactions = db.getTransactions();
    const presences = presenceService.getPresences();
    
    // Get last diary from localStorage (presuming it's there based on project structure)
    const lastDiary = safeLocalStorage.getItem('last_diary_entry');
    const organismMeta = safeLocalStorage.getItem('organism_meta');
    const meta = organismMeta ? JSON.parse(organismMeta) : {};

    return {
      objectives: {
        active: projects.filter(p => p.status === 'active').map(p => p.title),
        completed: projects.filter(p => p.status === 'completed').length,
        total: projects.length
      },
      tasks: {
        pending: tasks.filter(t => t.status === 'pending').slice(0, 5).map(t => t.title),
        completedCount: tasks.filter(t => t.status === 'completed').length
      },
      finances: {
        netWorth: mural.netWorth?.current_cash || 0,
        recentTransactions: transactions.slice(-3).map(t => `${t.note || 'Sem descrição'}: R$ ${t.value}`)
      },
      energyPractices: {
        lastEV: meta.lastEV,
        recentPresences: presences.slice(0, 3).map(p => p.name)
      },
      context: {
        lastDiaryEntry: lastDiary ? JSON.parse(lastDiary).content?.substring(0, 200) : undefined,
        mood: meta.mood,
        direction: meta.direction || "Evolução consciencial e profissional"
      },
      timestamp: new Date().toISOString()
    };
  },

  getSnapshotText(): string {
    const s = this.getSnapshot();
    return `
CONTEXTO ATUAL DO ORGANISMO:
- Objetivos Ativos: ${s.objectives.active.join(', ') || 'Nenhum'}
- Tarefas Pendentes: ${s.tasks.pending.join(', ') || 'Nenhuma'}
- Patrimônio Líquido: R$ ${s.finances.netWorth}
- Últimas Transações: ${s.finances.recentTransactions.join('; ')}
- Práticas Energéticas: Último EV em ${s.energyPractices.lastEV || 'não registrado'}. Presenças recentes: ${s.energyPractices.recentPresences.join(', ')}
- Direção Existencial: ${s.context.direction}
- Última reflexão (Diário): ${s.context.lastDiaryEntry || 'Nenhuma'}
- Humor/Foco: ${s.context.mood || 'Estável'}
    `.trim();
  }
};
