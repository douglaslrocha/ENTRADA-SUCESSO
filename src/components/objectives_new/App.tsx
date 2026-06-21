/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ObjectiveManager from './components/ObjectiveManager';
import ManifestationView from './components/ManifestationView';
import MetaBuilderModal, { MetaData } from './components/MetaBuilderModal';
import TaskBuilderModal, { TaskData } from './components/TaskBuilderModal';
import TaskExecutionModal from './components/TaskExecutionModal';
import MultimodalExecutionModal from './components/MultimodalExecutionModal';
import GoalsOverview from './components/GoalsOverview';
import { 
  Plus, Zap, Play, Clock, TrendingUp, 
  CheckCircle2, Layout, Calendar, Brain,
  Activity, Target as TargetIcon, BarChart3,
  Pause as PauseIcon, Square, Trash2, X
} from 'lucide-react';
import { getPerformanceStats, generateMockHistory } from './services/intelligenceService';
import { storage } from './lib/storage';
import { fakeDB } from '../../core/fakeDB';
import { safeLocalStorage } from '../../utils/storage';
import { organismEventBus } from '../../services/organismEventBus';
import { documentService } from '../../services/documentService';

const carouselImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCsbslWFAw-IqJ8-3x_UHC7zCnG1wGASjs701H4eh5SJXLZ4TKjVlvxwPp5cSWgGVaxVVG5RwLCj4XV4gHlTlAjSjUPBuwWzNrs0vVS0jsRi5LcpGa9i8sUyKHaq7BIdKbPplxSdOq5z_AhBh61IvlrZd_s9qhA-0fdXfruYJy2WqgiBLfnUUaSyqGA5jmEVB-6twSX48uuQspREvhBPD0ACiIB5-lh7tafA37Zd741C-aT6iTqLWZ-G2UOnNWHCDPDOjP1VyEXbyGA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYMw4Uei2Ggsk8L3lOMXqRbEbwAW99UKLk0GljfvMRVV05NG910bG1w2sr77Eakc0U-GIIUe3D-Int36lOpO-bRkUmvhu86If2R1zBdBnU8M72g5IGBcnWK4kb-k_Fy7ssoyLyv27YLuk8QlUgDNvs2yOcoOe798zCxZ9E6pqolzwvup1WJgWydIK39ErhaEFcfrIGZj86WPX0fTfQJaBX30S8skn_h8pUKzywOnGJ_2UO5q21kWxg277c8eq_GCQ0yU8RXB1C0cUO",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCiPeixsIKlUAYbnG0VszYdnrZ-vmFEjzzgqFdizzb3KUHvW5sMBfHlgYNsN3e_nKTGWBI5597mc6hOOUiTtTUraWf8pKn6RPv_nn4iOWlQM8kN_-7MYG7Hakcv-OLSLi75PzzrbUhdtzkXPTjIfELWXTyK7ahmleQUppE2rFQq7bXV9QPTDsrISzW1kz9ogxcU0ns-Knglx8YBhStTSYUxuKf3Rss55uOskDbjOuxIbg10MeXAFIP2di9rylj9lnTvnCoICZH4N5la",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZE4F1T8nHh4_aUi2ZOxE8yUTh36iSTaJhq1ABe8_5nyCBDahV1mZcDQnRJUtq5i1WY3QpedNAux84G3UUlscD-oJ3-HOug5tywhIyNb55nCB_MgV-31pQ_fTlTokXBLNfowwfXRBvlZONZiTaEXlR0ZxlrD1bCfCPytqCAUuilSUVTH7wKCXKqriuyCpj5Pk2qJ2H4cMSMnm4MaerrfzogjpD4QSLHFOC56FKSbBpLKjteaye-GFVovWpGvslkRAySpc9Md3KgpU5"
];

export interface IntegratedAppProps {
  initialObjectiveId?: string;
  initialView?: 'dashboard' | 'manager' | 'manifestation' | 'goals-overview';
  initialOpenMetaBuilder?: boolean;
  initialOpenTaskBuilder?: boolean;
  initialMetaId?: string;
  onClose: () => void;
}

export default function App({ 
  initialObjectiveId, 
  initialView = 'dashboard', 
  initialOpenMetaBuilder,
  initialOpenTaskBuilder,
  initialMetaId,
  onClose 
}: IntegratedAppProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<'dashboard' | 'manager' | 'manifestation' | 'goals-overview'>(initialView);
  const [activeObjective, setActiveObjective] = useState<any>(() => {
    if (initialObjectiveId) {
      const found = fakeDB.objectives.find((o: any) => o.id === initialObjectiveId);
      if (found) return found;
    }
    return null;
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpeningVision, setIsOpeningVision] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(initialOpenMetaBuilder || false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(initialOpenTaskBuilder || false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return storage.get('app-theme', 'dark') as 'dark' | 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
    storage.set('app-theme', theme);
  }, [theme]);

  // Sincroniza view e activeObjective quando os props iniciais mudam (essencial para reabertura com outro Id/View)
  useEffect(() => {
    setView(initialView);
    if (initialOpenMetaBuilder) {
      setIsMetaModalOpen(true);
    }
    if (initialOpenTaskBuilder) {
      setIsTaskModalOpen(true);
    }
    if (initialMetaId) {
      setSelectedMetaId(initialMetaId);
    }
    const syncData = async () => {
      await fakeDB.syncWithBackend();
      if (initialObjectiveId) {
        const found = fakeDB.objectives.find((o: any) => o.id === initialObjectiveId);
        if (found) {
          setActiveObjective(found);
        }
      } else if (initialView === 'manager') {
        setActiveObjective(null);
      } else if (fakeDB.objectives.length > 0) {
        setActiveObjective(fakeDB.objectives[0]);
      } else {
        setActiveObjective(null);
      }
    };
    syncData();
  }, [initialObjectiveId, initialView, initialOpenMetaBuilder, initialOpenTaskBuilder, initialMetaId]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const [selectedTaskForExecution, setSelectedTaskForExecution] = useState<TaskData | null>(null);
  const [selectedMetaId, setSelectedMetaId] = useState<string | undefined>(initialMetaId);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [tasksRefreshKey, setTasksRefreshKey] = useState<number>(0);
  const [activeInlineTaskId, setActiveInlineTaskId] = useState<string | null>(null);
  const [inlineElapsedSeconds, setInlineElapsedSeconds] = useState(0);
  const [isInlinePaused, setIsInlinePaused] = useState(false);
  const [activeWorkspaceFolder, setActiveWorkspaceFolder] = useState<string | null>(null);

  const dynamicImages = activeObjective?.media
    ?.filter((m: any) => m.type === 'image' && m.url)
    .map((m: any) => m.url);
  const imagesToRender = dynamicImages && dynamicImages.length > 0 ? dynamicImages : carouselImages;

  const [workspaces, setWorkspaces] = useState<any[]>(() => documentService.getWorkspaces());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<any | null>(null);
  const [editPageTitle, setEditPageTitle] = useState('');
  const [editPageContent, setEditPageContent] = useState('');
  const [isEditingWorkspaceName, setIsEditingWorkspaceName] = useState(false);
  const [tempWorkspaceName, setTempWorkspaceName] = useState('');

  const handleSavePage = () => {
    if (!selectedPageForEdit || !activeWorkspace) return;
    const newWorkspaces = [...workspaces];
    const wsIndex = newWorkspaces.findIndex(w => w.id === activeWorkspace.id);
    if (wsIndex !== -1) {
      for (const folder of newWorkspaces[wsIndex].folders) {
        const pageIndex = folder.pages?.findIndex((p: any) => p.id === selectedPageForEdit.id);
        if (pageIndex !== undefined && pageIndex !== -1) {
          folder.pages[pageIndex].title = editPageTitle;
          folder.pages[pageIndex].content = editPageContent;
          break;
        }
      }
      documentService.saveWorkspaces(newWorkspaces);
      organismEventBus.emit('workspaceUpdated');
    }
    setSelectedPageForEdit(null);
  };

  const handleDeletePage = () => {
    if (!selectedPageForEdit || !activeWorkspace) return;
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      const newWorkspaces = [...workspaces];
      const wsIndex = newWorkspaces.findIndex(w => w.id === activeWorkspace.id);
      if (wsIndex !== -1) {
        for (const folder of newWorkspaces[wsIndex].folders) {
          if (folder.pages) {
            folder.pages = folder.pages.filter((p: any) => p.id !== selectedPageForEdit.id);
          }
        }
        documentService.saveWorkspaces(newWorkspaces);
        organismEventBus.emit('workspaceUpdated');
      }
      setSelectedPageForEdit(null);
    }
  };

  const handleSaveWorkspaceName = () => {
    if (!activeWorkspace || !tempWorkspaceName.trim()) {
      setIsEditingWorkspaceName(false);
      return;
    }

    const updatedName = tempWorkspaceName.trim();

    // 1. Update in documentService
    const currentWorkspaces = documentService.getWorkspaces();
    const updatedWorkspaces = currentWorkspaces.map(w => {
      if (w.id === activeWorkspace.id) {
        return { ...w, name: updatedName };
      }
      return w;
    });
    documentService.saveWorkspaces(updatedWorkspaces);

    // 2. Update local state
    setWorkspaces(updatedWorkspaces);

    // 3. Update in fakeDB workspaces
    const wsFakeDB = fakeDB.workspaces.find((w: any) => w.id === activeWorkspace.id || w.title.toLowerCase() === activeWorkspace.name.toLowerCase());
    if (wsFakeDB) {
      wsFakeDB.title = updatedName;
    }

    // 4. Update core objective if names matched
    if (activeObjective && activeObjective.title.toLowerCase() === activeWorkspace.name.toLowerCase()) {
      fakeDB.updateObjective(activeObjective.id, { title: updatedName });
    }

    // 5. Sync backend
    import('../../services/workspaceService').then(({ workspaceService }) => {
      workspaceService.saveWorkspace(activeWorkspace.id, {
        name: updatedName,
        isPinned: activeWorkspace.isPinned ?? false,
        isHidden: activeWorkspace.isHidden ?? false,
        color: activeWorkspace.color ?? '#000000',
        icon: activeWorkspace.icon ?? '📄',
        iconType: activeWorkspace.iconType ?? 'emoji',
        imageUrl: activeWorkspace.imageUrl ?? ''
      }).catch(err => console.warn('[App] Erro ao salvar workspace atualizado no backend:', err));
    }).catch(e => console.error(e));

    // 6. Emit event to refresh the workspace manager (gerenciador)
    organismEventBus.emit('workspaceUpdated');
    setIsEditingWorkspaceName(false);
  };

  useEffect(() => {
    const handleWorkspaceChange = () => {
      setWorkspaces(documentService.getWorkspaces());
    };
    const handleGoalUpdated = () => {
      setTasksRefreshKey(prev => prev + 1);
      setActiveObjective((currentObj: any) => {
        if (currentObj && currentObj.id) {
          const fresh = fakeDB.objectives.find((o: any) => o.id === currentObj.id);
          if (fresh) {
            return { ...fresh };
          }
        }
        return currentObj;
      });
    };
    const unsubManager = organismEventBus.subscribe('managerChanged', handleWorkspaceChange);
    const unsubWorkspace = organismEventBus.subscribe('workspaceUpdated', handleWorkspaceChange);
    const unsubGoal = organismEventBus.subscribe('goalUpdated', handleGoalUpdated);
    const unsubDiary = organismEventBus.subscribe('diaryUpdated', handleGoalUpdated);
    return () => {
      unsubManager();
      unsubWorkspace();
      unsubGoal();
      unsubDiary();
    };
  }, []);

  const activeWorkspace = useMemo(() => {
    if (!activeObjective) return null;
    return workspaces.find(ws => (ws as any).objectiveId === activeObjective.id || ws.name.toLowerCase() === activeObjective.title.toLowerCase()) || null;
  }, [activeObjective, workspaces]);

  const dynamicWorkspaceFolders = useMemo(() => {
    if (!activeWorkspace) {
      return [
        {
          id: 'create_workspace_placeholder',
          title: 'Sem Espaço de Trabalho',
          tag: 'Objetivo Isolado',
          icon: 'folder_open',
          itemsCount: 0,
          lastActivity: 'N/A',
          colorVar: 'var(--folder-bg-pages)',
          accentVar: 'var(--folder-accent-pages)',
          items: [],
          isPlaceholder: true
        }
      ];
    }

    if (!activeWorkspace.folders || activeWorkspace.folders.length === 0) {
      return [
        {
          id: 'empty_folders_placeholder',
          title: 'Espaço de Trabalho Vazio',
          tag: 'Sem Pastas',
          icon: 'folder_open',
          itemsCount: 0,
          lastActivity: 'N/A',
          colorVar: 'var(--folder-bg-pages)',
          accentVar: 'var(--folder-accent-pages)',
          items: [],
          isEmptyWorkspace: true
        }
      ];
    }

    const colors = [
      { bg: 'var(--folder-bg-workflows)', accent: 'var(--folder-accent-workflows)' },
      { bg: 'var(--folder-bg-pages)', accent: 'var(--folder-accent-pages)' },
      { bg: 'var(--folder-bg-research)', accent: 'var(--folder-accent-research)' }
    ];

    return activeWorkspace.folders.map((folder: any, fIdx: number) => {
      const colorScheme = colors[fIdx % colors.length];
      return {
        id: folder.id,
        title: folder.name,
        tag: 'Pasta',
        icon: 'folder',
        itemsCount: folder.pages ? folder.pages.length : 0,
        lastActivity: 'Recente',
        colorVar: folder.color || colorScheme.bg,
        accentVar: folder.accent || colorScheme.accent,
        items: (folder.pages || []).map((page: any) => ({
          id: page.id,
          title: page.title,
          icon: 'description'
        }))
      };
    });
  }, [activeWorkspace]);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeInlineTaskId && !isInlinePaused) {
      interval = setInterval(() => {
        setInlineElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeInlineTaskId, isInlinePaused]);

  useEffect(() => {
    if (!activeObjective || !activeObjective.id) return;
    
    // Obter metas diretamente do activeObjective atual
    const objMetas = activeObjective.metas || [];
    
    // Em vez de ler do cache falso local, vamos filtrar as tarefas REAIS 
    // que pertencem a este objetivo (através dos projetos e metas).
    // Por enquanto, como o app foi moldado, usaremos fakeDB.tasks para filtrar.
    const realTasks = fakeDB.tasks.filter((t: any) => {
      if (t.objectiveId === activeObjective.id) {
        return true;
      }
      if (t.objectiveTitle && t.objectiveTitle.toLowerCase() === activeObjective.title.toLowerCase()) {
        return true;
      }
      if (t.projectId && t.projectId !== 'none') {
        const parentProject = fakeDB.projects.find((p: any) => p.id === t.projectId);
        if (parentProject) {
          const parentGoal = fakeDB.goals.find((g: any) => g.id === parentProject.goalId);
          if (parentGoal && parentGoal.objectiveId === activeObjective.id) {
            return true;
          }
        }
      } else if (t.goalId && t.goalId !== 'none') {
        const parentGoal = fakeDB.goals.find((g: any) => g.id === t.goalId);
        if (parentGoal && parentGoal.objectiveId === activeObjective.id) {
          return true;
        }
      }
      return false;
    });

    // Converter para o formato local TaskData que a tela espera
    const mappedTasks = realTasks.map((t: any) => ({
      ...t, // propagar todas as propriedades da tarefa
      id: t.id,
      title: t.title,
      duration: t.duration || 25,
      type: t.status === 'done' || t.status === 'completed' ? 'completed' : 'todo',
      status: t.status === 'done' || t.status === 'completed' ? 'completed' : (t.status === 'doing' || t.status === 'in-progress' ? 'in-progress' : 'todo'),
      timestamp: new Date(t.createdAt || Date.now()).toISOString(),
      metaId: (t.projectId && t.projectId !== 'none') ? fakeDB.projects.find((p:any) => p.id === t.projectId)?.goalId : t.goalId,
      energyLevel: 80,
      focusScore: 90,
      projectId: t.projectId
    }));

    setTasks(mappedTasks);
  }, [activeObjective, fakeDB.tasks, tasksRefreshKey]);

  const stats = getPerformanceStats(tasks);

  const handleSaveMeta = (newMeta: MetaData) => {
    const metas = storage.get<MetaData[]>(`metas_${activeObjective.title}`, []);
    const updatedMetas = [...metas, newMeta];
    storage.set(`metas_${activeObjective.title}`, updatedMetas);
    const updatedObjective = { ...activeObjective, metas: updatedMetas };
    setActiveObjective(updatedObjective);
    if (activeObjective && activeObjective.id) {
      fakeDB.updateObjective(activeObjective.id, { metas: updatedMetas });
      fakeDB.createGoal({
        id: newMeta.id,
        objectiveId: activeObjective.id,
        title: newMeta.intention,
        progress: (newMeta as any).progress ?? 0,
        status: (newMeta as any).status ?? 'todo',
        color: newMeta.color,
        deadline: newMeta.deadline
      });
    }
  };

  const handleSaveTask = (newTask: TaskData) => {
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);
    fakeDB.createTask({
      ...newTask,
      id: newTask.id,
      title: newTask.title,
      goalId: newTask.metaId,
      objectiveId: activeObjective.id,
      objectiveTitle: activeObjective.title,
      status: newTask.status === 'completed' ? 'done' : newTask.status === 'in-progress' ? 'doing' : 'todo',
      date: new Date(newTask.date).getTime()
    });
  };

  const handleUpdateTask = (updatedTask: TaskData) => {
    const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);

    const foundTask = fakeDB.tasks.find(t => t.id === updatedTask.id);
    if (foundTask) {
      // Preserve existing valid associations to avoid orphaning tasks when status is changed
      const originalGoalId = foundTask.goalId;
      const originalProjectId = foundTask.projectId;

      Object.assign(foundTask, updatedTask);
      foundTask.status = updatedTask.status === 'completed' ? 'done' : updatedTask.status === 'in-progress' ? 'doing' : 'todo';
      foundTask.title = updatedTask.title;

      let finalGoalId = 'none';
      const uTaskAny = updatedTask as any;
      if (uTaskAny.goalId && uTaskAny.goalId !== 'none') {
        finalGoalId = uTaskAny.goalId;
      } else if (updatedTask.metaId && updatedTask.metaId !== 'none') {
        finalGoalId = updatedTask.metaId;
      } else if (originalGoalId && originalGoalId !== 'none') {
        finalGoalId = originalGoalId;
      }
      foundTask.goalId = finalGoalId;

      if (!foundTask.projectId || foundTask.projectId === 'none') {
        if (originalProjectId && originalProjectId !== 'none') {
          foundTask.projectId = originalProjectId;
        }
      }

      foundTask.date = new Date(updatedTask.date).getTime();
      safeLocalStorage.setItem('dashboard_snapshot_dirty', 'true');
      organismEventBus.emit('goalUpdated', foundTask);
    } else {
      fakeDB.createTask({
        ...updatedTask,
        id: updatedTask.id,
        title: updatedTask.title,
        goalId: updatedTask.metaId,
        status: updatedTask.status === 'completed' ? 'done' : updatedTask.status === 'in-progress' ? 'doing' : 'todo',
        date: new Date(updatedTask.date).getTime()
      });
    }

    if (selectedTaskForExecution?.id === updatedTask.id) {
      setSelectedTaskForExecution(updatedTask);
    }
    
    // Sync with inline timer if this is the active task
    if (activeInlineTaskId === updatedTask.id) {
      setInlineElapsedSeconds(updatedTask.actualDuration || 0);
      setIsInlinePaused(updatedTask.status !== 'in-progress');
      if (updatedTask.status === 'completed') {
        setActiveInlineTaskId(null);
        setInlineElapsedSeconds(0);
      }
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    storage.set(`tasks_${activeObjective.title}`, updatedTasks);
    fakeDB.deleteTask(taskId);
  };

  const openExecution = (task: TaskData) => {
    setSelectedTaskForExecution(task);
    setIsExecutionModalOpen(true);
  };

  const handleStartInline = (e: React.MouseEvent, task: TaskData) => {
    e.stopPropagation();
    if (activeInlineTaskId === task.id) {
      setIsInlinePaused(false);
    } else {
      setActiveInlineTaskId(task.id);
      setInlineElapsedSeconds(task.actualDuration || 0);
      setIsInlinePaused(false);
    }
  };

  const handlePauseInline = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsInlinePaused(true);
  };

  const handleFinishInline = (e: React.MouseEvent, task: TaskData) => {
    e.stopPropagation();
    const updatedTask = {
      ...task,
      status: 'completed' as const,
      actualDuration: inlineElapsedSeconds,
      completedAt: new Date().toISOString()
    };
    handleUpdateTask(updatedTask);
    setActiveInlineTaskId(null);
    setInlineElapsedSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!activeObjective) return;
    // Load metas and tasks for the active objective on mount
    const savedMetas = storage.get<MetaData[]>(`metas_${activeObjective.title}`, []);
    if (savedMetas.length > 0) {
      setActiveObjective((prev: any) => ({ ...prev, metas: savedMetas }));
    } else if (activeObjective.metas) {
      storage.set(`metas_${activeObjective.title}`, activeObjective.metas);
    }
  }, [activeObjective?.title]);

  useEffect(() => {
    if (view === 'dashboard') {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % carouselImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleOpenVision = () => {
    setIsOpeningVision(true);
    setTimeout(() => {
      setView('manifestation');
      setIsOpeningVision(false);
    }, 800);
  };

  if (!activeObjective && view !== 'manager') {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-neutral-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-pastel-indigo border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Carregando Objetivo...</p>
        </div>
      </div>
    );
  }

  if (view === 'manager') {
    return (
      <ObjectiveManager 
        initialData={activeObjective}
        onBack={() => {
          if (activeObjective && activeObjective.id) {
            setView('dashboard');
          } else {
            onClose();
          }
        }} 
        onSave={(data) => {
          if (activeObjective && activeObjective.id) {
            const updated = fakeDB.updateObjective(activeObjective.id, data);
            setActiveObjective(updated || { ...activeObjective, ...data });
          } else {
            const created = fakeDB.createObjective(data);
            setActiveObjective(created);
          }
          setView('manifestation');
        }} 
      />
    );
  }

  if (view === 'manifestation' && activeObjective) {
    return (
      <ManifestationView 
        data={activeObjective} 
        onBack={() => setView('dashboard')} 
        onViewGoals={() => setView('goals-overview')}
        onSaveMeta={handleSaveMeta}
      />
    );
  }

  if (view === 'goals-overview' && activeObjective) {
    return (
      <>
        <GoalsOverview 
          key={`goals-${activeObjective.title}-${activeObjective?.metas?.length || 0}-${tasks.length}`}
          objectiveTitle={activeObjective.title}
          onBack={() => setView('dashboard')}
          onAddTask={(metaId) => {
            setSelectedMetaId(metaId);
            setIsTaskModalOpen(true);
          }}
          onAddMeta={() => setIsMetaModalOpen(true)}
          onExecuteTask={openExecution}
        />

        <MetaBuilderModal 
          isOpen={isMetaModalOpen}
          onClose={() => setIsMetaModalOpen(false)}
          onSave={handleSaveMeta}
          objectiveTitle={activeObjective.title}
          objectiveProgress={45}
          objectiveDeadline={activeObjective.deadline}
        />

        <TaskBuilderModal 
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedMetaId(undefined);
          }}
          onSave={handleSaveTask}
          objectiveTitle={activeObjective.title}
          metas={activeObjective.metas || []}
          initialMetaId={selectedMetaId}
        />

        {selectedTaskForExecution && (
          selectedTaskForExecution.executionType && selectedTaskForExecution.executionType !== 'standard' ? (
            <MultimodalExecutionModal 
              isOpen={isExecutionModalOpen}
              onClose={() => {
                setIsExecutionModalOpen(false);
                setSelectedTaskForExecution(null);
              }}
              task={selectedTaskForExecution}
              onUpdate={handleUpdateTask}
              objectiveTitle={activeObjective.title}
              metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
              initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
              initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
            />
          ) : (
            <TaskExecutionModal 
              isOpen={isExecutionModalOpen}
              onClose={() => {
                setIsExecutionModalOpen(false);
                setSelectedTaskForExecution(null);
              }}
              task={selectedTaskForExecution}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              objectiveTitle={activeObjective.title}
              metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
              initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
              initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
            />
          )
        )}
      </>
    );
  }

  return (
    <div className={`bg-neutral-black text-neutral-white selection:bg-pastel-indigo/30 min-h-screen font-body transition-colors duration-300`}>
      <nav className={`fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 py-3 backdrop-blur-md border-b transition-colors duration-300 bg-neutral-black/80 border-neutral-white/10`}>
        <button 
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-1.5 border rounded-full backdrop-blur-xl transition-all group bg-neutral-white/5 border-neutral-white/10 hover:bg-neutral-white/10`}
        >
          <span className={`material-symbols-outlined text-lg transition-colors text-neutral-white/60 group-hover:text-neutral-white`}>arrow_back</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors text-neutral-white/60 group-hover:text-neutral-white`}>Voltar</span>
        </button>
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`w-10 h-10 rounded-full border flex items-center justify-center hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative bg-neutral-white/5 border-neutral-white/10 text-neutral-white/60`}
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <div className={`absolute -bottom-10 right-0 backdrop-blur-md border px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-neutral-black/80 border-neutral-white/10`}>
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Trocar Tema</p>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setView('goals-overview')}
            className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">grid_view</span>
            <div className="absolute -bottom-10 right-0 bg-neutral-black/80 backdrop-blur-md border border-neutral-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Visão de Metas</p>
            </div>
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenVision}
            className="w-10 h-10 rounded-full bg-neutral-white/5 border border-neutral-white/10 flex items-center justify-center text-neutral-white/60 hover:text-pastel-indigo hover:bg-pastel-indigo/10 transition-all group relative"
          >
            <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
            <div className="absolute -bottom-10 right-0 bg-neutral-black/80 backdrop-blur-md border border-neutral-white/10 px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <p className="text-[8px] font-bold uppercase tracking-widest text-pastel-indigo">Ver Visão</p>
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Refined Header Carousel */}
      <section className="relative h-[380px] md:h-[420px] w-full overflow-hidden flex items-end justify-center pb-8 md:pb-12">
        <div className="absolute inset-0 z-0">
          {imagesToRender.map((img: string, idx: number) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === (activeIndex % imagesToRender.length) ? 'opacity-100' : 'opacity-0'}`}
              >
                <img alt="Carrossel" className="w-full h-full object-cover" src={img} referrerPolicy="no-referrer" />
              </div>
            ))}
        </div>
        <div className="absolute inset-0 z-10 hero-overlay"></div>
        <div className="hero-blur-transition"></div>
        
        <div className="relative z-20 w-full max-w-4xl px-6 md:px-8 flex flex-col items-center">
          <p className="text-pastel-indigo font-medium tracking-[0.4em] uppercase text-[8px] md:text-[10px] mb-3 md:mb-4 opacity-80 text-center">Fase Atual: Alta Execução</p>
          <h1 className="font-[Arial] text-3xl md:text-5xl text-neutral-white mb-6 md:mb-8 tracking-tight text-center leading-tight">{activeObjective?.title || 'Protocolo de Performance Máxima'}</h1>
          <div className="flex flex-col items-center gap-5 md:gap-6 w-full">
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="w-[85%] sm:w-auto px-8 md:px-14 py-4 md:py-5 bg-neutral-white text-neutral-black rounded-[2.5rem] md:rounded-[3.5rem] font-headline font-bold text-lg md:text-xl shadow-[0_25px_60px_-10px_rgba(245,245,247,0.3)] hover:shadow-[0_30px_70px_-5px_rgba(245,245,247,0.4)] transform hover:-translate-y-1.5 transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 border border-neutral-white/20"
            >
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'wght' 700" }}>add_circle</span>
              Nova Tarefa
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('manager')}
                className="px-6 py-2.5 bg-neutral-white/5 hover:bg-neutral-white/10 border border-neutral-white/10 rounded-full text-neutral-white/50 hover:text-neutral-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">architecture</span>
                Objetivo
              </button>
              <button 
                onClick={() => setIsMetaModalOpen(true)}
                className="px-6 py-2.5 bg-pastel-indigo/20 hover:bg-pastel-indigo/30 border border-pastel-indigo/30 rounded-full text-pastel-indigo text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(197,202,233,0.1)]"
              >
                <Plus size={14} />
                Meta
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="relative min-h-screen pt-4 pb-32">
        {/* 1. Stats & Focus */}
        <section className="max-w-5xl mx-auto px-6 md:px-8 mb-12 md:mb-16">
          <div className="flex flex-col items-center justify-center gap-6 md:gap-16 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-white/40 font-bold mb-2">Conclusão da Visão</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-headline font-bold text-neutral-white">{Math.round(stats.completionRate || 0)}%</span>
                  <div className="w-12 h-1 bg-neutral-white/10 rounded-full overflow-hidden">
                    <div className="bg-pastel-indigo h-full" style={{ width: `${Math.round(stats.completionRate || 0)}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="max-w-xs text-center md:text-left">
                <p className={`italic text-xs leading-relaxed text-neutral-white/40`}>
                  &ldquo;{activeObjective?.burningDesire || 'A alma torna-se tingida com a cor dos seus pensamentos. Foque na execução da sua intenção mais elevada.'}&rdquo;
                </p>
              </div>
            </div>

            {/* KPIs */}
            {activeObjective?.kpis && activeObjective.kpis.length > 0 && (
              <div className="w-full max-w-4xl mt-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-pastel-indigo">monitoring</span>
                  <h3 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Métricas de Sucesso (KPIs)</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activeObjective.kpis.map(kpi => {
                    const progresso = (Number(kpi.pontoAtual) / Number(kpi.objetivoDesejado)) * 100 || 0;
                    return (
                      <div key={kpi.id} className="bg-neutral-white/5 border border-neutral-white/10 rounded-2xl p-4 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-1 bg-pastel-indigo/20 w-full">
                          <div className="h-full bg-pastel-indigo" style={{ width: `${Math.min(progresso, 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest truncate">{kpi.name}</span>
                        <div className="flex items-end gap-2">
                          <span className="text-xl font-headline font-bold text-neutral-white">{kpi.pontoAtual}</span>
                          <span className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest mb-1">/ {kpi.objetivoDesejado}</span>
                        </div>
                        <span className="text-[8px] font-bold text-pastel-indigo uppercase tracking-widest mt-1 truncate">{kpi.formaMedicao}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Execution Engine: Real-Time Action */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 space-y-16 md:space-y-24">
          
          {/* Foco do Agora Section */}
          <div className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-pastel-indigo animate-pulse md:w-[24px] md:h-[24px]" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-white/40">Foco do Agora</h2>
              </div>
              <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                {tasks.filter(t => t.status !== 'completed').length} Pendentes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {tasks.filter(t => t.status !== 'completed').slice(0, 2).map((task) => (
                <motion.div 
                  key={task.id}
                  whileHover={{ y: -5 }}
                  onClick={() => openExecution(task)}
                  className={`group relative bg-neutral-white/10 border rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden cursor-pointer backdrop-blur-xl transition-all duration-500 soft-shadow ${
                    activeInlineTaskId === task.id ? 'active-glow ring-1 ring-pastel-indigo/30' : 'border-neutral-white/25 hover:border-neutral-white/45'
                  }`}
                >
                  {/* Visual Anchor background */}
                  {task.imageUrl && (
                    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                      <img 
                        src={task.imageUrl} 
                        className="w-full h-full object-cover opacity-[0.08] group-hover:opacity-20 group-hover:scale-110 transition-all duration-[10s]" 
                        alt="" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-black via-transparent to-neutral-black/90" />
                    </div>
                  )}
                  
                  <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] -z-10 transition-all duration-700 ${
                    activeInlineTaskId === task.id ? 'bg-pastel-indigo/30' : 'bg-pastel-indigo/10 group-hover:bg-pastel-indigo/20'
                  }`} />
                  
                  <div className="flex justify-between items-start mb-6 md:mb-12">
                    <div className="space-y-2 md:space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[8px] md:text-[9px] font-bold rounded uppercase tracking-wider transition-colors ${
                          activeInlineTaskId === task.id ? 'bg-pastel-indigo text-neutral-black' : 'bg-pastel-indigo/20 text-pastel-indigo'
                        }`}>
                          {activeInlineTaskId === task.id ? 'Em Execução' : 'Próxima Ação'}
                        </span>
                        <span className="text-[8px] md:text-[9px] text-neutral-white/30 uppercase tracking-widest font-bold">
                          {activeObjective.metas?.find(m => m.id === task.metaId)?.intention || 'Estratégia'}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-4xl font-headline font-bold text-neutral-white tracking-tight leading-tight max-w-md">{task.title}</h3>
                      
                      {activeInlineTaskId === task.id && (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 pt-2"
                        >
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-4xl font-headline font-black text-pastel-indigo tabular-nums">
                              {formatTime(inlineElapsedSeconds)}
                            </span>
                            <span className="text-[8px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">Cronômetro</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {activeInlineTaskId === task.id ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => isInlinePaused ? handleStartInline(e, task) : handlePauseInline(e)}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-neutral-white text-neutral-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                          >
                            {isInlinePaused ? <Play size={20} fill="currentColor" /> : <PauseIcon size={20} fill="currentColor" />}
                          </button>
                          <button 
                            onClick={(e) => handleFinishInline(e, task)}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl bg-pastel-green text-neutral-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={(e) => handleStartInline(e, task)}
                          className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-pastel-indigo text-neutral-black flex items-center justify-center shadow-2xl shadow-pastel-indigo/20 group-hover:scale-110 transition-transform"
                        >
                          <Play size={24} fill="currentColor" className="md:w-[32px] md:h-[32px]" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-white/20 md:w-[18px] md:h-[18px]" />
                      <span className="text-[10px] md:text-xs font-bold text-neutral-white/40 uppercase tracking-widest">{task.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-neutral-white/20 md:w-[18px] md:h-[18px]" />
                      <span className="text-[10px] md:text-xs font-bold text-neutral-white/40 uppercase tracking-widest">{task.priority}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tasks.filter(t => t.status !== 'completed').length === 0 && (
                <div className="col-span-full py-20 bg-neutral-white/10 border border-dashed border-neutral-white/25 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-pastel-green/10 flex items-center justify-center text-pastel-green/40">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-white/60 font-bold uppercase tracking-widest">Fluxo de execução limpo</p>
                    <p className="text-[10px] text-neutral-white/20 uppercase tracking-widest">Defina novas tarefas para continuar manifestando.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-8 md:space-y-12">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Layout size={18} className="text-pastel-indigo md:w-[24px] md:h-[24px]" />
                <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-neutral-white/40">Linha do Tempo</h2>
              </div>
              <div className="flex items-center gap-6">
                <button className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest hover:text-neutral-white transition-colors">Hoje</button>
                <button className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest hover:text-neutral-white transition-colors">Semana</button>
              </div>
            </div>

            <div className="relative space-y-6 md:space-y-10">
              <div className="absolute left-[23px] md:left-[35px] top-6 bottom-6 w-px bg-gradient-to-b from-pastel-indigo/50 via-neutral-white/5 to-transparent" />
              
              {tasks.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((task, idx) => (
                <motion.div 
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => openExecution(task)}
                  className={`group relative flex items-center gap-6 md:gap-12 cursor-pointer transition-all duration-500 ${
                    activeInlineTaskId === task.id ? 'scale-[1.02]' : ''
                  }`}
                >
                  <div className={`relative z-10 w-12 h-12 md:w-18 md:h-18 rounded-2xl md:rounded-3xl border flex items-center justify-center transition-all overflow-hidden ${
                    task.status === 'completed' 
                      ? 'bg-pastel-green/20 border-pastel-green/30 text-pastel-green shadow-[0_0_20px_rgba(165,214,167,0.1)]' 
                      : activeInlineTaskId === task.id
                        ? 'bg-pastel-indigo border-pastel-indigo text-neutral-black shadow-[0_0_30px_rgba(197,202,233,0.3)]'
                        : 'bg-neutral-black border-neutral-white/10 text-neutral-white/20 group-hover:border-pastel-indigo/50 group-hover:text-pastel-indigo'
                  }`}>
                    {task.imageUrl ? (
                      <img src={task.imageUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      task.status === 'completed' ? <CheckCircle2 size={20} className="md:w-[28px] md:h-[28px]" /> : <Clock size={20} className="md:w-[28px] md:h-[28px]" />
                    )}
                  </div>
                  <div className={`flex-1 bg-neutral-white/10 border rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 transition-all backdrop-blur-sm soft-shadow ${
                    activeInlineTaskId === task.id ? 'active-glow border-pastel-indigo/35 bg-pastel-indigo/[0.05]' : 'border-neutral-white/25 hover:border-neutral-white/45'
                  }`}>
                    <div className="flex justify-between items-start mb-3 md:mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-sm md:text-2xl font-headline font-bold tracking-tight ${task.status === 'completed' ? 'text-neutral-white/20 line-through' : 'text-neutral-white/80'}`}>
                            {task.title}
                          </h4>
                          {activeInlineTaskId === task.id && (
                            <span className="px-2 py-0.5 bg-pastel-indigo text-neutral-black text-[7px] md:text-[9px] font-black rounded uppercase tracking-tighter animate-pulse">Ativo</span>
                          )}
                        </div>
                        <p className="text-[9px] md:text-xs text-neutral-white/30 font-medium italic">
                          {activeObjective.metas?.find(m => m.id === task.metaId)?.intention || 'Estratégia'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[9px] md:text-[11px] font-bold text-neutral-white/20 uppercase tracking-widest">{task.time || 'Sem hora'}</span>
                        {task.status !== 'completed' && (
                          <div className="flex items-center gap-2">
                            {activeInlineTaskId === task.id ? (
                              <>
                                <button 
                                  onClick={(e) => isInlinePaused ? handleStartInline(e, task) : handlePauseInline(e)}
                                  className="w-8 h-8 rounded-xl bg-neutral-white text-neutral-black flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  {isInlinePaused ? <Play size={14} fill="currentColor" /> : <PauseIcon size={14} fill="currentColor" />}
                                </button>
                                <button 
                                  onClick={(e) => handleFinishInline(e, task)}
                                  className="w-8 h-8 rounded-xl bg-pastel-green text-neutral-black flex items-center justify-center hover:scale-110 transition-transform"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={(e) => handleStartInline(e, task)}
                                className="w-8 h-8 rounded-xl bg-pastel-indigo/20 text-pastel-indigo flex items-center justify-center hover:bg-pastel-indigo hover:text-neutral-black transition-all"
                              >
                                <Play size={14} fill="currentColor" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {activeInlineTaskId === task.id && (
                      <div className="mb-6 p-4 bg-neutral-black/40 rounded-2xl border border-neutral-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 rounded-full bg-pastel-indigo animate-ping" />
                          <span className="text-xl md:text-3xl font-headline font-black text-pastel-indigo tabular-nums">
                            {formatTime(inlineElapsedSeconds)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">Tempo Decorrido</p>
                          <p className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-widest">Estimado: {task.estimatedDuration}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-4 md:gap-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-bold uppercase tracking-widest ${
                        task.priority === 'critical' ? 'bg-pastel-pink/20 text-pastel-pink' : 'bg-neutral-white/10 text-neutral-white/40'
                      }`}>
                        {task.priority}
                      </span>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-neutral-white/20" />
                        <span className="text-[9px] md:text-[10px] font-bold text-neutral-white/20 uppercase tracking-widest">
                          {new Date(task.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <div className="pl-20 py-12 bg-neutral-white/10 border border-dashed border-neutral-white/25 rounded-3xl flex flex-col items-center justify-center text-center p-6 w-full">
                  <p className="text-xs text-neutral-white/40 uppercase tracking-widest font-bold italic">Nenhuma tarefa agendada na linha do tempo.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Performance Dashboard */}
        <section className="max-w-7xl mx-auto px-6 md:px-8 mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Intelligence Block */}
          <div className="glass-card p-8 rounded-[2.5rem] border border-neutral-white/5 bg-neutral-white/[0.02] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-indigo/5 blur-3xl -z-10 group-hover:bg-pastel-indigo/10 transition-all" />
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-pastel-indigo/10 flex items-center justify-center text-pastel-indigo">
                <Brain size={20} />
              </div>
              <h4 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.3em]">Camada de Inteligência</h4>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-white/40 font-medium">Precisão de Estimativa</span>
                <span className="text-lg font-headline font-bold text-pastel-indigo">{stats.estimationAccuracy}%</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.estimationAccuracy}%` }}
                  className="h-full bg-pastel-indigo"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Tempo Médio</p>
                  <p className="text-xl font-headline font-bold text-neutral-white">{stats.avgTimePerTask}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">Consistência</p>
                  <p className="text-xl font-headline font-bold text-pastel-green">{stats.consistencyScore}%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] border border-neutral-white/5 bg-neutral-white/[0.02] md:col-span-2">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <BarChart3 size={18} className="text-pastel-indigo" />
                <h4 className="text-[10px] font-bold text-neutral-white/40 uppercase tracking-[0.3em]">Velocidade de Entrega</h4>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-bold text-neutral-white/20 uppercase tracking-widest">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pastel-indigo" /> Concluídas</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-neutral-white/10" /> Pendentes</span>
              </div>
            </div>
            
            <div className="h-32 flex items-end justify-between px-4">
              {[40, 65, 30, 85, 50, 60, 75].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-3 group/bar">
                  <div className="w-10 md:w-14 bg-neutral-white/5 rounded-t-2xl h-full relative overflow-hidden">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      className={`absolute bottom-0 left-0 right-0 transition-all ${i === 3 ? 'bg-pastel-indigo shadow-[0_0_20px_rgba(197,202,233,0.3)]' : 'bg-neutral-white/10 group-hover/bar:bg-neutral-white/20'}`}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-neutral-white/20 uppercase tracking-widest">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Enhanced Objective Workspace (Wallet Style) */}
        <section className="relative w-full mt-20 md:mt-32 mb-24 overflow-hidden">
          {/* Background Carousel for Workspace */}
          <div className="absolute inset-0 z-0 opacity-[0.5] pointer-events-none">
            {imagesToRender.map((img: string, idx: number) => (
              <div 
                key={idx} 
                className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${idx === activeIndex % imagesToRender.length ? 'opacity-100' : 'opacity-0'}`}
              >
                <img alt="Background" className="w-full h-full object-cover" src={img} referrerPolicy="no-referrer" />
              </div>
            ))}
            <div className="absolute inset-0 workspace-bg-overlay"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-20">
            <div className="mb-10 md:mb-16 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {isEditingWorkspaceName ? (
                    <input
                      value={tempWorkspaceName}
                      onChange={(e) => setTempWorkspaceName(e.target.value)}
                      onBlur={handleSaveWorkspaceName}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveWorkspaceName();
                        if (e.key === 'Escape') setIsEditingWorkspaceName(false);
                      }}
                      className="bg-neutral-white/5 border border-neutral-white/20 text-neutral-white font-headline text-2xl md:text-3xl font-extrabold px-3 py-1 rounded focus:outline-none focus:border-pastel-indigo/50"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                      if (activeWorkspace) {
                        setTempWorkspaceName(activeWorkspace.name);
                        setIsEditingWorkspaceName(true);
                      }
                    }}>
                      <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-neutral-white tracking-tight hover:text-pastel-indigo transition-colors mt-0">
                        {activeWorkspace ? activeWorkspace.name : 'Espaço de Trabalho'}
                      </h2>
                      {activeWorkspace && (
                        <span className="material-symbols-outlined text-sm text-neutral-white/40 group-hover:text-neutral-white transition-colors">edit</span>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs md:text-sm text-neutral-white/60 opacity-60 mt-2 font-medium">Repositório tátil para todos os recursos críticos da missão.</p>
              </div>
              
              <div className="flex items-center gap-3">
                {activeWorkspace && !activeWorkspaceFolder && (
                   <button onClick={() => {
                     const name = prompt('Nome da Nova Pasta:');
                     if (name) {
                        const newWorkspaces = [...workspaces];
                        const wsIndex = newWorkspaces.findIndex(w => w.id === activeWorkspace.id);
                        if (wsIndex !== -1) {
                          if (!newWorkspaces[wsIndex].folders) newWorkspaces[wsIndex].folders = [];
                          newWorkspaces[wsIndex].folders.push({
                            id: 'f-' + Math.random().toString(36).substr(2, 9),
                            name: name.trim(),
                            pages: []
                          });
                          documentService.saveWorkspaces(newWorkspaces);
                          organismEventBus.emit('workspaceUpdated');
                        }
                     }
                   }} className="px-4 py-2 rounded-full border border-neutral-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-white/60 hover:bg-neutral-white/5 transition-all">
                     + Criar Pasta
                   </button>
                )}
                {!activeWorkspace && (
                   <button onClick={() => {
                      const ws = {
                        id: 'ws-' + Math.random().toString(36).substr(2, 9),
                        name: activeObjective.title,
                        objectiveId: activeObjective.id,
                        folders: [{
                          id: 'f-' + Math.random().toString(36).substr(2, 9),
                          name: 'Documentos da Visão',
                          pages: [{
                            id: 'p-' + Math.random().toString(36).substr(2, 9),
                            title: 'Manifesto da Visão',
                            content: `<h1>Manifesto: ${activeObjective.title}</h1>`,
                            createdAt: new Date().toISOString()
                          }]
                        }]
                      };
                      documentService.saveWorkspaces([...workspaces, ws]);
                      organismEventBus.emit('workspaceUpdated');
                   }} className="px-4 py-2 rounded-full border border-pastel-indigo/30 bg-pastel-indigo/10 text-[10px] font-bold uppercase tracking-widest text-pastel-indigo hover:bg-pastel-indigo/20 transition-all">
                     Inicializar Espaço
                   </button>
                )}
                <AnimatePresence mode="wait">
                  {activeWorkspaceFolder && (
                    <motion.button
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onClick={() => setActiveWorkspaceFolder(null)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-pastel-indigo/10 border border-pastel-indigo/20 text-pastel-indigo hover:bg-pastel-indigo/20 transition-all group"
                    >
                      <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">Voltar ao Grid</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className={`grid gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16 transition-all duration-500 ${activeWorkspaceFolder ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              <AnimatePresence mode="popLayout">
                {dynamicWorkspaceFolders
                  .filter(folder => !activeWorkspaceFolder || folder.id === activeWorkspaceFolder)
                  .map((folder) => (
                    <motion.div 
                      layout
                      key={folder.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => !activeWorkspaceFolder && setActiveWorkspaceFolder(folder.id)}
                      style={{ 
                        '--folder-bg': folder.colorVar,
                        '--folder-accent': folder.accentVar,
                        background: activeWorkspaceFolder === folder.id ? `color-mix(in srgb, ${folder.colorVar}, transparent 15%)` : 'var(--folder-bg)',
                        backdropFilter: activeWorkspaceFolder === folder.id ? 'blur(24px)' : 'none'
                      } as React.CSSProperties}
                      className={`wallet-folder group ${!activeWorkspaceFolder ? 'cursor-pointer hover:scale-[1.02]' : activeWorkspaceFolder === folder.id ? 'expanded cursor-default' : 'opacity-0 pointer-events-none'} transition-all duration-500 ${activeWorkspaceFolder === folder.id ? 'max-w-4xl mx-auto w-full' : ''}`}
                    >
                      <div className="wallet-card-back"></div>
                      <div className="wallet-card-mid flex items-start justify-between p-4">
                        <span className="text-[8px] font-bold text-black/60 uppercase tracking-widest">{folder.tag}</span>
                        <span className="material-symbols-outlined text-black/30 text-xs">{folder.icon}</span>
                      </div>
                      
                      <div className="pt-6 px-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-headline font-extrabold text-neutral-white">{folder.title}</h3>
                          <span className="text-[10px] font-bold text-pastel-indigo bg-pastel-indigo/10 px-2 py-0.5 rounded">{folder.itemsCount} Itens</span>
                        </div>
                        <p className="text-[10px] text-neutral-white/40 uppercase tracking-[0.1em] font-bold">Última atividade: {folder.lastActivity}</p>
                      </div>

                      <div className={`wallet-front-pocket transition-all duration-500 ${activeWorkspaceFolder === folder.id ? 'min-h-[300px]' : ''}`}>
                        <ul className={`grid gap-4 ${activeWorkspaceFolder === folder.id ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                          {folder.items.slice(0, activeWorkspaceFolder === folder.id ? undefined : 3).map((item) => (
                            <motion.li 
                              layout
                              key={item.id} 
                              onClick={() => {
                                navigate(`/editor/${item.id}`);
                              }}
                              className="flex items-center gap-3 group/page p-2 rounded-xl hover:bg-neutral-white/[0.03] transition-all cursor-pointer"
                            >
                              <div className="w-8 h-8 rounded-lg bg-pastel-indigo/10 flex items-center justify-center text-pastel-indigo">
                                <span className="material-symbols-outlined text-base">{item.icon}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-neutral-white/80 group-hover/page:text-pastel-indigo transition-colors">{item.title}</p>
                                <div className="w-full h-px bg-neutral-white/5 mt-1"></div>
                              </div>
                            </motion.li>
                          ))}
                          
                          {!activeWorkspaceFolder && folder.itemsCount > 3 && (
                            <li className="flex items-center justify-center pt-2">
                              <span className="text-[9px] font-bold text-pastel-indigo uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Ver mais {folder.itemsCount - 3} itens...</span>
                            </li>
                          )}
                        </ul>

                        {activeWorkspaceFolder === folder.id && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 pt-6 border-t border-neutral-white/5 flex flex-col justify-center gap-2"
                          >
                            {isCreatingPage ? (
                              <div className="flex flex-col gap-2">
                                <input 
                                  autoFocus
                                  value={newPageTitle}
                                  onChange={e => setNewPageTitle(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      if (!newPageTitle.trim()) return;
                                      const newWorkspaces = [...workspaces];
                                      const wsIndex = newWorkspaces.findIndex(w => w.id === activeWorkspace.id);
                                      if (wsIndex !== -1) {
                                        const fTarget = newWorkspaces[wsIndex].folders.find((f: any) => f.id === folder.id);
                                        if (fTarget) {
                                          if (!fTarget.pages) fTarget.pages = [];
                                          fTarget.pages.push({
                                            id: 'p-' + Math.random().toString(36).substr(2, 9),
                                            title: newPageTitle.trim(),
                                            content: '',
                                            createdAt: new Date().toISOString()
                                          });
                                          documentService.saveWorkspaces(newWorkspaces);
                                          organismEventBus.emit('workspaceUpdated');
                                        }
                                      }
                                      setNewPageTitle('');
                                      setIsCreatingPage(false);
                                    }
                                    if (e.key === 'Escape') {
                                      setIsCreatingPage(false);
                                      setNewPageTitle('');
                                    }
                                  }}
                                  placeholder="Nome do Documento... (Enter para salvar)"
                                  className="w-full bg-neutral-white/5 border border-neutral-white/10 rounded-lg px-3 py-2 text-xs text-neutral-white focus:outline-none focus:border-pastel-indigo/50"
                                />
                                <div className="flex items-center gap-2">
                                  <button onClick={() => {
                                      if (!newPageTitle.trim()) return;
                                      const newWorkspaces = [...workspaces];
                                      const wsIndex = newWorkspaces.findIndex(w => w.id === activeWorkspace.id);
                                      if (wsIndex !== -1) {
                                        const fTarget = newWorkspaces[wsIndex].folders.find((f: any) => f.id === folder.id);
                                        if (fTarget) {
                                          if (!fTarget.pages) fTarget.pages = [];
                                          fTarget.pages.push({
                                            id: 'p-' + Math.random().toString(36).substr(2, 9),
                                            title: newPageTitle.trim(),
                                            content: '',
                                            createdAt: new Date().toISOString()
                                          });
                                          documentService.saveWorkspaces(newWorkspaces);
                                          organismEventBus.emit('workspaceUpdated');
                                        }
                                      }
                                      setNewPageTitle('');
                                      setIsCreatingPage(false);
                                  }} className="px-3 py-1 bg-pastel-indigo text-neutral-black text-[10px] font-bold rounded">Salvar</button>
                                  <button onClick={() => { setIsCreatingPage(false); setNewPageTitle(''); }} className="px-3 py-1 bg-neutral-white/10 text-neutral-white text-[10px] font-bold rounded">Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setIsCreatingPage(true)} className="px-6 py-2 rounded-full bg-neutral-white/5 border border-neutral-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-white/40 hover:text-pastel-indigo hover:border-pastel-indigo/30 transition-all">
                                Adicionar Novo Item ao {folder.title}
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Portal Transition Overlay */}
      <AnimatePresence>
        {isOpeningVision && (
          <motion.div
            initial={{ scale: 0, opacity: 0, borderRadius: "100%" }}
            animate={{ scale: 50, opacity: 1, borderRadius: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
            className="fixed bottom-10 right-10 w-20 h-20 bg-neutral-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Editor de Documento Overlay */}
      <AnimatePresence>
        {selectedPageForEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-neutral-black/80 backdrop-blur-sm" onClick={() => setSelectedPageForEdit(null)} />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] bg-[#111111] border border-neutral-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2rem] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-white/10 bg-neutral-black/50">
                <input 
                  value={editPageTitle}
                  onChange={e => setEditPageTitle(e.target.value)}
                  className="bg-transparent text-2xl font-headline font-bold text-neutral-white focus:outline-none flex-1 placeholder:text-neutral-white/20"
                  placeholder="Título do Documento"
                />
                <div className="flex items-center gap-3">
                  <button onClick={handleDeletePage} className="p-2.5 rounded-xl bg-neutral-white/5 border border-neutral-white/5 text-neutral-white/40 hover:text-pastel-pink hover:border-pastel-pink/30 hover:bg-pastel-pink/10 transition-all group relative">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={handleSavePage} className="px-6 py-2.5 bg-pastel-indigo text-neutral-black text-xs font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(197,202,233,0.3)]">
                    Salvar
                  </button>
                  <div className="w-px h-6 bg-neutral-white/10 mx-2" />
                  <button onClick={() => setSelectedPageForEdit(null)} className="p-2 text-neutral-white/40 hover:text-neutral-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-b from-neutral-black/20 to-transparent">
                <textarea 
                  value={editPageContent}
                  onChange={e => setEditPageContent(e.target.value)}
                  placeholder="Escreva seu conteúdo aqui..."
                  className="w-full h-full bg-transparent px-8 py-8 text-neutral-white/80 resize-none focus:outline-none font-body text-base leading-relaxed custom-scrollbar placeholder:text-neutral-white/10 placeholder:italic"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MetaBuilderModal 
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        onSave={handleSaveMeta}
        objectiveTitle={activeObjective.title}
        objectiveProgress={45} // Placeholder as in ManifestationView
        objectiveDeadline={activeObjective.deadline}
      />

      <TaskBuilderModal 
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedMetaId(undefined);
        }}
        onSave={handleSaveTask}
        objectiveTitle={activeObjective.title}
        metas={activeObjective.metas || []}
        initialMetaId={selectedMetaId}
      />

      {selectedTaskForExecution && (
        selectedTaskForExecution.executionType && selectedTaskForExecution.executionType !== 'standard' ? (
          <MultimodalExecutionModal 
            isOpen={isExecutionModalOpen}
            onClose={() => {
              setIsExecutionModalOpen(false);
              setSelectedTaskForExecution(null);
            }}
            task={selectedTaskForExecution}
            onUpdate={handleUpdateTask}
            objectiveTitle={activeObjective.title}
            metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
            initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
            initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
          />
        ) : (
          <TaskExecutionModal 
            isOpen={isExecutionModalOpen}
            onClose={() => {
              setIsExecutionModalOpen(false);
              setSelectedTaskForExecution(null);
            }}
            task={selectedTaskForExecution}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            objectiveTitle={activeObjective.title}
            metaIntention={activeObjective.metas?.find(m => m.id === selectedTaskForExecution.metaId)?.intention}
            initialElapsedSeconds={activeInlineTaskId === selectedTaskForExecution.id ? inlineElapsedSeconds : undefined}
            initialStatus={activeInlineTaskId === selectedTaskForExecution.id ? (isInlinePaused ? 'paused' : 'in-progress') : undefined}
          />
        )
      )}
    </div>
  );
}
