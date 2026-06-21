import React from 'react';
import { motion } from 'motion/react';
import { CentralSubPage } from './CentralPage';

interface CentralSidebarProps {
  activeSubPage: CentralSubPage;
  onSelect: (subPage: CentralSubPage) => void;
  onBack: () => void;
}

export function CentralSidebar({ activeSubPage, onSelect, onBack }: CentralSidebarProps) {
  const menuItems: { id: CentralSubPage; label: string; icon: string }[] = [
    { id: 'ia-api', label: 'IA / API', icon: 'smart_toy' },
    { id: 'integrations', label: 'Integrações', icon: 'hub' },
    { id: 'database', label: 'Banco de Dados', icon: 'database' },
    { id: 'automation', label: 'Automação', icon: 'bolt' },
    { id: 'logs', label: 'Logs', icon: 'history' },
  ];

  return (
    <aside className="w-64 h-full border-r border-[var(--border)] bg-[var(--surface)] flex flex-col p-4 z-10">
      <div className="flex items-center gap-3 mb-8 px-2">
        <button 
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--muted)]"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-[var(--foreground)]">Central</h1>
      </div>

      <nav className="flex flex-col gap-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group
              ${activeSubPage === item.id 
                ? 'bg-[var(--surface-hover)] text-[var(--foreground)]' 
                : 'text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'}
            `}
          >
            {activeSubPage === item.id && (
              <motion.div 
                layoutId="active-subnav"
                className="absolute left-0 w-1 h-5 bg-[#4285F4] rounded-full"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)]">
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-bold mb-1">Status do Sistema</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs text-[var(--foreground)] font-medium">Operacional</span>
        </div>
      </div>
    </aside>
  );
}
