import React from 'react';

interface PlaceholderSectionProps {
  title: string;
  description: string;
}

export function PlaceholderSection({ title, description }: PlaceholderSectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="mb-4">
        <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">{title}</h2>
        <p className="text-[var(--muted)] text-sm">{description}</p>
      </header>

      <section className="bg-[var(--surface)] p-8 md:p-12 rounded-3xl border border-[var(--border)] border-dashed shadow-sm flex flex-col items-center justify-center text-center gap-6">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center border border-[var(--border)]">
          <span className="material-symbols-outlined text-3xl md:text-4xl text-[var(--muted)]">construction</span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg md:text-xl font-bold text-[var(--foreground)]">Em Desenvolvimento</h3>
          <p className="text-[var(--muted)] text-xs md:text-sm max-w-md">
            Esta funcionalidade está sendo preparada para a próxima fase do sistema operacional pessoal. 
            Em breve você poderá gerenciar {title.toLowerCase()} diretamente por aqui.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 md:h-32 bg-[var(--surface-hover)] rounded-2xl border border-[var(--border)] opacity-50 animate-pulse"></div>
          ))}
        </div>
      </section>
    </div>
  );
}
