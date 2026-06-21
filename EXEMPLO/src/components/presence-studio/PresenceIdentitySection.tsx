import React from 'react';
import { StudioLabel, StudioInput } from './StudioAtoms';

interface IdentitySectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const PresenceIdentitySection: React.FC<IdentitySectionProps> = ({ formData, setFormData }) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/3 aspect-[3/4] relative group">
          <div 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setFormData({ ...formData, photo: reader.result as string });
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className="absolute inset-0 bg-white rounded-[40px] border border-zinc-100 overflow-hidden shadow-sm flex items-center justify-center p-3 cursor-pointer hover:border-zinc-300 transition-all"
          >
            {formData.photo ? (
              <img src={formData.photo} alt="Identity" className="w-full h-full object-cover rounded-[30px]" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-10 text-zinc-900 group-hover:opacity-30 transition-opacity">
                <span className="material-symbols-outlined text-7xl font-light">add_a_photo</span>
                <p className="text-[8px] uppercase tracking-[0.3em] font-extrabold">Carregar Retrato</p>
              </div>
            )}
            
            {formData.photo && (
              <div className="absolute inset-x-0 bottom-0 py-4 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[8px] font-bold uppercase tracking-widest">Trocar Imagem</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <StudioLabel>Nome da Presença</StudioLabel>
            <StudioInput 
              large 
              placeholder="Ex: Douglas L. Rocha" 
              value={formData.name} 
              onChange={(v) => setFormData({ ...formData, name: v })} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <StudioLabel>Cidade Atual</StudioLabel>
              <StudioInput 
                placeholder="Ex: São Paulo" 
                value={formData.city} 
                onChange={(v) => setFormData({ ...formData, city: v })} 
              />
            </div>
            <div className="space-y-4">
              <StudioLabel>País de Origem</StudioLabel>
              <StudioInput 
                placeholder="Ex: Brasil" 
                value={formData.country || ''} 
                onChange={(v) => setFormData({ ...formData, country: v })} 
              />
            </div>
            <div className="md:col-span-2 space-y-4">
              <StudioLabel>Exploração Global</StudioLabel>
              <StudioInput 
                placeholder="Já visitou outros países? Quais marcaram sua jornada?" 
                value={formData.visitedCountries || ''} 
                onChange={(v) => setFormData({ ...formData, visitedCountries: v })} 
              />
            </div>
            <div className="space-y-4">
              <StudioLabel>Ciclos (Idade)</StudioLabel>
              <StudioInput 
                placeholder="Ex: 32" 
                value={formData.age} 
                onChange={(v) => setFormData({ ...formData, age: v })} 
              />
            </div>
            <div className="space-y-4">
              <StudioLabel>Manifestação (Ofício)</StudioLabel>
              <StudioInput 
                placeholder="Ex: Arquiteto de Sistemas" 
                value={formData.profession} 
                onChange={(v) => setFormData({ ...formData, profession: v })} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
