import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import EditorComponent from './components/EditorComponent';
import ManagerComponent from './components/ManagerComponent';
import { Dashboard } from './components/Dashboard';
import { MuralSucessoPage } from './pages/MuralSucessoPage';
import { DiaryPage } from './pages/DiaryPage';
import { IdentityPage } from './pages/IdentityPage';
import { IdentityViewPage } from './pages/IdentityViewPage';
import DiaryEditorPage from './pages/DiaryEditorPage';
import { CortesPage } from './pages/CortesPage';
import { CentralPage } from './pages/CentralPage';
import { AIControlPage } from './pages/AIControlPage';
import CentralDeComandoPage from './pages/CentralDeComandoPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { PresencesPage } from './pages/PresencesPage';
import AmparadoraPage from './pages/AmparadoraPage';
import AmparoPage from './pages/AmparoPage';
import { DatabaseMapPage } from './pages/DatabaseMapPage';
import { DayClosureSection } from './components/DayClosureSection';
import ChatComponent from './components/ChatComponent';
import Sidebar from './components/Sidebar';
import { FeedbackSystem } from './components/ui/FeedbackSystem';
import { RichNotificationSystem } from './components/notifications/RichNotificationSystem';
import { FinancialRecord, Category, Transaction, CanvasResponse } from './types';
import { Editor } from '@tiptap/react';
import { db } from './services/db';
import { documentService } from './services/documentService';
import { taskService } from './services/taskService';
import { actionEngine, ActionContext } from './services/actionEngine';
import { flowEngine } from './services/flowEngine';
import { useCanvasState, resetCanvasState } from './core/canvasState';
import { safeLocalStorage } from './utils/storage';
import { useSwipeBack } from './hooks/useSwipeBack';
import { haptics } from './services/HapticService';
import { useOrganismSync } from './hooks/useOrganismSync';
import { PerfProfiler } from './utils/perfProfiler';
import { supabase } from './services/supabaseClient';
import { organismEventBus } from './services/organismEventBus';

import { useAuth } from './lib/AuthContext';
import WelcomePage from './components/auth/WelcomePage';
import LoginPage from './components/auth/LoginPage';
import ProfilePage from './components/auth/ProfilePage';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Habilita o gesto de deslizar para voltar globalmente
  useSwipeBack();

  // Som de transição em mudanças de rota e restauração de scroll automática (Reset de rolagem)
  useEffect(() => {
    haptics.transition();

    // 1. Reseta o scroll da janela global (window)
    window.scrollTo(0, 0);

    // 2. Reseta o scroll de contêineres internos com overflow de rolagem (ex: div com overflow-y-auto, no-scrollbar, etc)
    const resetInternalScrolls = () => {
      const scrollableElements = document.querySelectorAll(
        'main, .overflow-y-auto, [class*="overflow-y-auto"], .custom-scrollbar, .no-scrollbar, [style*="overflow-y: auto"], [style*="overflow-y: scroll"]'
      );
      scrollableElements.forEach((el) => {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      });
    };

    // Executa o reset imediatamente
    resetInternalScrolls();

    // Executa em quadros seguintes para dar tempo do React & framer-motion montarem os elementos por completo
    const animId = requestAnimationFrame(resetInternalScrolls);
    const timeoutId = setTimeout(resetInternalScrolls, 50);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
    };
  }, [location.pathname]);

  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = safeLocalStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    
    // Default to light as requested, but check system preference if no saved value
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [canvasResponse, setCanvasResponse] = useState<CanvasResponse | null>(null);
  const canvasState = useCanvasState();
  const { isAuthenticated, isReady } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // Reset showLogin when logging out to go back to WelcomePage
  useEffect(() => {
    if (!isAuthenticated) {
      setShowLogin(false);
    }
  }, [isAuthenticated]);

  // Derive currentPage from location
  const currentPage = location.pathname === '/' || location.pathname === '/projects' ? 'projects' : 
                      location.pathname.startsWith('/editor') ? 'editor' : 
                      location.pathname === '/manager' ? 'manager' : 
                      location.pathname === '/dashboard' ? 'dashboard' : 
                      location.pathname === '/cortes' ? 'cortes' :
                      location.pathname === '/mural' ? 'mural' : 
                      location.pathname === '/diary' ? 'diary' : 
                      location.pathname === '/ai' ? 'ai' : 
                      location.pathname === '/amparadora' ? 'amparadora' :
                      location.pathname === '/amparo' ? 'amparo' :
                      location.pathname === '/central' ? 'central' : 
                      location.pathname === '/profile' ? 'profile' :
                      location.pathname === '/presences' ? 'presences' :
                      location.pathname === '/identity' ? 'identity' :
                      location.pathname === '/identity-view' ? 'identity-view' :
                      location.pathname === '/database-map' ? 'database-map' :
                      location.pathname === '/central-de-comando' ? 'central-de-comando' : 'projects';

  useEffect(() => {
    // 1. Carrega dados do cache local offline
    setCategories(db.getCategories());
    setTransactions(db.getTransactions());
    
    // 2. Dispara sincronização em background com o servidor
    db.syncWithBackend().then(() => {
      setCategories(db.getCategories());
      setTransactions(db.getTransactions());
    }).catch(err => {
      console.warn('[App] Erro na sincronização inicial de finanças:', err);
    });

    // 3. Dispara sincronização inicial de workspaces
    documentService.syncWithBackend().catch(err => {
      console.warn('[App] Erro na sincronização inicial de workspaces:', err);
    });

    // 4. Dispara sincronização inicial de tarefas
    taskService.syncWithBackend().catch(err => {
      console.warn('[App] Erro na sincronização inicial de tarefas:', err);
    });
  }, []);

  const refreshCategories = useCallback(() => {
    return PerfProfiler.measure('App.refreshCategories', () => {
      setCategories(db.getCategories());
      setTransactions(db.getTransactions());
    });
  }, []);

  // 5. Configurar canal de comunicação em tempo real (Realtime) com o Supabase
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        console.log('[Realtime] Mudança no banco de dados detectada:', payload);
        const { table } = payload;
        
        if (['financial_transactions', 'financial_categories', 'financial_projections', 'financial_mural'].includes(table)) {
          db.syncWithBackend().then(() => {
            refreshCategories();
            organismEventBus.emit('transactionUpdated');
          });
        } else if (['objetivos', 'metas', 'tarefas'].includes(table)) {
          organismEventBus.emit('goalUpdated', payload.new);
        } else if (['workspaces', 'folders', 'pages'].includes(table)) {
          documentService.syncWithBackend().then(() => {
            organismEventBus.emit('managerChanged');
          });
        } else if (table === 'diary_entries') {
          organismEventBus.emit('diaryUpdated', payload.new);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshCategories]);

  // Listen to any changes in the organism and propagate them instantly!
  useOrganismSync(undefined, useCallback(() => {
    PerfProfiler.measure('App.useOrganismSync.callback', () => {
      refreshCategories();
    });
  }, [refreshCategories]));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    safeLocalStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if the user hasn't manually set a preference in this session
      // or if we want to strictly follow system. 
      // Given the request "integre junto com o modo white modo dark do sistema", 
      // we'll update it.
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sincronização dinâmica de marca personalizada (Nome, Descrição, Ícone/Favicon)
  useEffect(() => {
    const applyBranding = () => {
      const customName = safeLocalStorage.getItem('app_custom_name') || 'Remix 1.7';
      const customDesc = safeLocalStorage.getItem('app_custom_description') || 'Evolução Pessoal';
      const iconType = safeLocalStorage.getItem('app_custom_icon_type') || 'default';
      const iconValue = safeLocalStorage.getItem('app_custom_icon_value') || '/pwa-icon.svg';

      // 1. Atualiza o título dinamicamente da aba do navegador
      document.title = `${customName} - ${customDesc}`;

      // 2. Resolve o Favicon da aba
      let newIconHref = '/pwa-icon.svg';
      if (iconType === 'emoji' && iconValue) {
        newIconHref = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${iconValue}</text></svg>`;
      } else if ((iconType === 'url' || iconType === 'upload') && iconValue) {
        newIconHref = iconValue;
      }

      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconLink) {
        faviconLink.href = newIconHref;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = newIconHref;
        document.head.appendChild(link);
      }

      const appleIconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (appleIconLink) {
        appleIconLink.href = newIconHref;
      }
    };

    applyBranding();

    window.addEventListener('app-brand-updated', applyBranding);
    return () => {
      window.removeEventListener('app-brand-updated', applyBranding);
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => {
      if (!prev) haptics.open();
      else haptics.close();
      return !prev;
    });
  }, []);

  const handleOpenDocument = useCallback((content: string) => {
    // Legacy: if we still want to pass content for non-ID docs, but better to use IDs
    navigate('/editor');
  }, [navigate]);

  const handleRecordInterpreted = useCallback((record: FinancialRecord) => {
    if (editorInstance) {
      const emoji = record.type === 'expense' ? '💸' : '💰';
      const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(record.amount);
      
      const htmlToInsert = `
        <p><strong>${emoji} ${record.description}</strong>: <span style="color: ${record.type === 'expense' ? '#ef4444' : '#22c55e'}">${formattedAmount}</span> (${record.category})</p>
      `;
      
      editorInstance.commands.insertContent(htmlToInsert);
      editorInstance.commands.focus();
    }
  }, [editorInstance]);

  const handleCanvasResponse = useCallback((response: CanvasResponse) => {
    // Instead of setting state to trigger overlay, dispatch event to editor
    window.dispatchEvent(new CustomEvent('insert-ai-block', {
      detail: {
        type: response.intent || 'query_summary',
        data: {
          ...response.data,
          _content: response.content,
          _suggestions: response.suggestions
        }
      }
    }));
  }, []);

  const handleSaveAsDocument = useCallback(async (response: CanvasResponse) => {
    const context: ActionContext = {
      editorInstance,
      navigate,
      refreshData: () => {
        setCategories(db.getCategories());
        setTransactions(db.getTransactions());
      }
    };

    const result = await actionEngine.execute(response, context);
    
    if (result.success) {
      setCanvasResponse(null);
      if (result.redirect) {
        navigate(result.redirect);
      }
    }
  }, [editorInstance, navigate]);

  const handleExecuteAction = useCallback(async (action: string) => {
    console.log('Executing action:', action);
    
    if (action === 'create_task' && canvasResponse) {
      const context: ActionContext = {
        editorInstance,
        navigate,
        refreshData: () => {
          setCategories(db.getCategories());
          setTransactions(db.getTransactions());
        }
      };

      const result = await actionEngine.execute(canvasResponse, context);
      if (result.success) {
        setCanvasResponse(null);
      }
    } else if ((action === 'execute_flow' || action === 'create_project' || canvasResponse?.intent === 'project') && canvasResponse) {
      const context: ActionContext = {
        editorInstance,
        navigate,
        refreshData: () => {
          setCategories(db.getCategories());
          setTransactions(db.getTransactions());
        }
      };

      const result = await flowEngine.execute(canvasResponse, context);
      if (result.success) {
        setCanvasResponse(null);
        if (result.redirect) {
          navigate(result.redirect);
        }
      }
    } else {
      setCanvasResponse(null);
    }
  }, [canvasResponse, editorInstance, navigate]);

  if (!isReady) return null;

  if (!isAuthenticated) {
    if (!showLogin) {
      return <WelcomePage onNext={() => setShowLogin(true)} />;
    }
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <main className="flex-1 relative overflow-hidden">
        <Routes>
          <Route path="/" element={<ProjectsPage onBack={() => navigate('/')} theme={theme} onToggleTheme={toggleTheme} onToggleSidebar={toggleSidebar} categories={categories} transactions={transactions} onRefreshCategories={refreshCategories} />} />
          <Route path="/profile" element={<ProfilePage onToggleSidebar={toggleSidebar} />} />
          <Route path="/editor/:id?" element={
            <EditorComponent 
              onEditorReady={setEditorInstance}
              theme={theme}
              onToggleTheme={toggleTheme}
              onToggleSidebar={toggleSidebar}
            />
          } />
          <Route path="/manager" element={
            <ManagerComponent 
              onToggleSidebar={toggleSidebar}
              onBackToEditor={() => navigate('/')}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard 
              onNavigate={(page: any) => navigate(`/${page === 'editor' ? '' : page}`)} 
              categories={categories}
              transactions={transactions}
              onRefreshCategories={refreshCategories}
              onToggleSidebar={toggleSidebar}
            />
          } />
          <Route path="/cortes" element={
            <CortesPage 
              onBack={() => navigate(-1)}
              onToggleSidebar={toggleSidebar}
              categories={categories}
              transactions={transactions}
              onRefreshCategories={refreshCategories}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          } />
          <Route path="/mural" element={<MuralSucessoPage onBack={() => navigate(-1)} onToggleSidebar={toggleSidebar} />} />
          <Route path="/diary" element={<DiaryPage onBack={() => navigate(-1)} onToggleSidebar={toggleSidebar} />} />
          <Route path="/identity" element={<IdentityPage />} />
          <Route path="/identity-view" element={<IdentityViewPage />} />
          <Route path="/diary/new" element={
            <DiaryEditorPage 
              content="" 
              onUpdate={() => {}} 
              theme={theme}
              onToggleTheme={toggleTheme}
              onToggleSidebar={toggleSidebar}
            />
          } />
          <Route path="/diary/:id" element={
            <DiaryEditorPage 
              content="" 
              onUpdate={() => {}} 
              theme={theme}
              onToggleTheme={toggleTheme}
              onToggleSidebar={toggleSidebar}
            />
          } />
          <Route path="/diary/closure/:id?" element={<DayClosureSection onComplete={() => navigate('/diary')} />} />
          <Route path="/central" element={<CentralPage onBack={() => navigate(-1)} />} />
          <Route path="/ai" element={<AIControlPage onBack={() => navigate(-1)} />} />
          <Route path="/amparadora" element={<AmparadoraPage onToggleSidebar={toggleSidebar} theme={theme} onToggleTheme={toggleTheme} />} />
          <Route path="/amparo" element={<AmparoPage onToggleSidebar={toggleSidebar} theme={theme} />} />
          <Route path="/central-de-comando" element={<CentralDeComandoPage onToggleSidebar={toggleSidebar} theme={theme} />} />
          <Route path="/presences" element={<PresencesPage onToggleSidebar={toggleSidebar} theme={theme} />} />
          <Route path="/database-map" element={<DatabaseMapPage />} />
          <Route path="/projects" element={<ProjectsPage onBack={() => navigate('/')} theme={theme} onToggleTheme={toggleTheme} onToggleSidebar={toggleSidebar} categories={categories} transactions={transactions} onRefreshCategories={refreshCategories} />} />
        </Routes>
      </main>
      
      {currentPage !== 'amparadora' && (
        <ChatComponent 
          onRecordInterpreted={handleRecordInterpreted} 
          onCanvasResponse={handleCanvasResponse}
        />
      )}
      
      <FeedbackSystem />
      <RichNotificationSystem />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onToggleTheme={toggleTheme}
        theme={theme}
        onNavigate={(page) => {
          if (page === 'ai' || page === 'amparadora' || page === 'central-de-comando') {
             haptics.success(); // Som de acesso a áreas de alto nível
          } else {
             haptics.mediumClick();
          }
          
          if (page === 'amparadora' && location.pathname === '/amparadora') {
             window.dispatchEvent(new CustomEvent('amparadora-reset'));
          }
          navigate(page === 'projects' ? '/' : `/${page}`);
          setIsSidebarOpen(false);
          resetCanvasState();
        }}
        currentPage={currentPage as any}
      />
      
      {/* Subtle overlay for the chat area to prevent text from being hidden behind it - Standardized to z-0 (Background layer) */}
      {currentPage !== 'amparadora' && (
        <div className="h-32 pointer-events-none bg-gradient-to-t from-[var(--bg)] to-transparent fixed bottom-0 left-0 right-0 z-0" />
      )}
    </div>
  );
}
