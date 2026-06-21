import React from 'react';
import { StudioLabel, StudioInput, StudioAction } from './StudioAtoms';
import { Company, Project } from '../../services/presenceService';
import { motion } from 'motion/react';

interface RealizationSectionProps {
  companies: Company[];
  setCompanies: (c: Company[]) => void;
  projects: Project[];
  setProjects: (p: Project[]) => void;
}

export const PresenceRealizationSection: React.FC<RealizationSectionProps> = ({ 
  companies, setCompanies, projects, setProjects 
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Companies */}
      <div className="space-y-8">
        <StudioLabel className="text-zinc-300">Entidades & Organizações</StudioLabel>
        <div className="space-y-6">
          {companies.map((co, idx) => (
            <motion.div key={co.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-zinc-50/50 border border-zinc-100 rounded-3xl relative space-y-4">
              <button 
                onClick={() => setCompanies(companies.filter(c => c.id !== co.id))}
                className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <StudioInput placeholder="Nome da Organização" value={co.name} onChange={(v) => { const n = [...companies]; n[idx].name = v; setCompanies(n); }} />
              <StudioInput placeholder="Papel / Cargo" value={co.role} onChange={(v) => { const n = [...companies]; n[idx].role = v; setCompanies(n); }} />
              <StudioInput placeholder="Período" value={co.period} onChange={(v) => { const n = [...companies]; n[idx].period = v; setCompanies(n); }} />
            </motion.div>
          ))}
          <StudioAction icon="add" label="Nova Entidade" onClick={() => setCompanies([...companies, { id: generateId(), name: '', role: '', period: '', description: '', website: '' }])} />
        </div>
      </div>

      {/* Projects */}
      <div className="space-y-8">
        <StudioLabel className="text-zinc-300">Projetos & Símbolos</StudioLabel>
        <div className="space-y-6">
          {projects.map((proj, idx) => (
            <motion.div key={proj.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-zinc-50/50 border border-zinc-100 rounded-3xl relative space-y-4">
              <button 
                onClick={() => setProjects(projects.filter(p => p.id !== proj.id))}
                className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
              <StudioInput placeholder="Título do Projeto" value={proj.name} onChange={(v) => { const n = [...projects]; n[idx].name = v; setProjects(n); }} />
              <StudioInput placeholder="Ano" value={proj.year} onChange={(v) => { const n = [...projects]; n[idx].year = v; setProjects(n); }} />
              <StudioInput placeholder="Link" value={proj.url || ''} onChange={(v) => { const n = [...projects]; n[idx].url = v; setProjects(n); }} />
            </motion.div>
          ))}
          <StudioAction icon="bolt" label="Novo Projeto" onClick={() => setProjects([...projects, { id: generateId(), name: '', year: '', url: '' }])} />
        </div>
      </div>
    </div>
  );
};
