import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CentralSidebar } from './CentralSidebar';
import { ApiSettings } from './subpages/ApiSettings';
import { PlaceholderSection } from './subpages/PlaceholderSection';

export type CentralSubPage = 'ia-api' | 'integrations' | 'database' | 'automation' | 'logs';

interface CentralPageProps {
  onBack: () => void;
}

export function CentralPage({ onBack }: CentralPageProps) {
  const [activeSubPage, setActiveSubPage] = useState<CentralSubPage>('ia-api');

  const renderContent = () => {
    switch (activeSubPage) {
      case 'ia-api':
        return <ApiSettings />;
      case 'integrations':
        return (
          <PlaceholderSection 
            title="Integrações" 
            description="Conecte seu sistema com ferramentas externas como Slack, Discord, Notion e mais." 
          />
        );
      case 'database':
        return (
          <PlaceholderSection 
            title="Banco de Dados" 
            description="Gerencie o armazenamento de dados, backups e estrutura relacional do seu sistema." 
          />
        );
      case 'automation':
        return (
          <PlaceholderSection 
            title="Automação" 
            description="Crie fluxos de trabalho automáticos baseados em gatilhos e ações." 
          />
        );
      case 'logs':
        return (
          <PlaceholderSection 
            title="Logs do Sistema" 
            description="Acompanhe todas as atividades, erros e execuções em tempo real." 
          />
        );
      default:
        return <ApiSettings />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-[var(--bg)]">
      {/* Sidebar Interna (Desktop) */}
      <div className="hidden md:block">
        <CentralSidebar 
          activeSubPage={activeSubPage} 
          onSelect={setActiveSubPage} 
          onBack={onBack}
        />
      </div>

      {/* Mobile Header & Sub-nav */}
      <div className="md:hidden flex flex-col border-b border-[var(--border)] bg-[var(--surface)] z-20">
        <div className="flex items-center gap-3 p-4">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)]"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-[var(--foreground)]">Central</h1>
        </div>
        
        <div className="flex overflow-x-auto no-scrollbar px-4 pb-3 gap-2">
          {[
            { id: 'ia-api', label: 'IA / API', icon: 'smart_toy' },
            { id: 'integrations', label: 'Integrações', icon: 'hub' },
            { id: 'database', label: 'Banco de Dados', icon: 'database' },
            { id: 'automation', label: 'Automação', icon: 'bolt' },
            { id: 'logs', label: 'Logs', icon: 'history' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubPage(item.id as CentralSubPage)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all text-xs font-bold
                ${activeSubPage === item.id 
                  ? 'bg-[#4285F4] text-white shadow-lg shadow-[#4285F4]/20' 
                  : 'bg-[var(--surface-hover)] text-[var(--muted)]'}
              `}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Conteúdo */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Espaçador para mobile (evitar sobreposição do chat) */}
        <div className="h-24 md:hidden" />
      </main>
    </div>
  );
}
