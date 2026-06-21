import React from 'react';
import { StudioLabel, StudioInput, StudioAction } from './StudioAtoms';
import { HumanTrait } from '../../services/presenceService';
import { motion } from 'motion/react';

interface TraitsSectionProps {
  characteristics: HumanTrait[];
  setCharacteristics: (c: HumanTrait[]) => void;
  sensations: HumanTrait[];
  setSensations: (s: HumanTrait[]) => void;
}

const TraitCard = ({ trait, onUpdate, onRemove, icon }: { trait: HumanTrait, onUpdate: (v: string, field: 'label' | 'image') => void, onRemove: () => void, icon: string }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(reader.result as string, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const suggestions = icon === 'spa' 
    ? ['Paz', 'Vigor', 'Mistério', 'Leveza', 'Sabedoria', 'Euforia', 'Foco']
    : ['Coragem', 'Inovação', 'Empatia', 'Disciplina', 'Caos Criativo', 'Ordem'];

  return (
    <motion.div layout className="p-5 sm:p-6 bg-zinc-50 border border-zinc-100 rounded-[32px] relative flex flex-col items-center text-center gap-4 group">
      <button onClick={onRemove} className="absolute top-4 right-4 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-20 h-20 bg-white rounded-full border border-zinc-100 shadow-sm overflow-hidden flex items-center justify-center p-1 cursor-pointer hover:border-zinc-300 transition-all relative"
      >
        {trait.image ? <img src={trait.image} className="w-full h-full object-cover rounded-full" /> : <span className="material-symbols-outlined text-zinc-200 text-3xl">{icon}</span>}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
          <span className="material-symbols-outlined text-white text-xs">add_a_photo</span>
        </div>
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      
      <div className="w-full space-y-3 mt-2">
        <StudioInput placeholder={icon === 'spa' ? "Sensação..." : "Traço..."} value={trait.label} onChange={(v) => onUpdate(v, 'label')} />
        <div className="flex flex-wrap justify-center gap-1.5 overflow-hidden max-h-[60px] hover:max-h-none transition-all duration-500">
          {suggestions.map(s => (
            <button key={s} onClick={() => onUpdate(s, 'label')} className="px-2 py-1 bg-white border border-zinc-100 rounded-full text-[8px] text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 transition-all">
              {s}
            </button>
          ))}
        </div>
        <StudioInput placeholder="Ou cole URL..." value={trait.image?.startsWith('data:') ? 'Imagem Local' : trait.image || ''} onChange={(v) => onUpdate(v, 'image')} className="text-[9px] py-1.5 px-3 rounded-xl opacity-40 focus:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
};

export const PresenceTraitsSection: React.FC<TraitsSectionProps> = ({ 
  characteristics, setCharacteristics, sensations, setSensations 
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <StudioLabel className="text-zinc-400">Virtudes & Traços Predominantes</StudioLabel>
          <p className="text-[10px] text-zinc-300 tracking-wider">O que define a força ativa desse ser no mundo.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {characteristics.map((c, idx) => (
            <TraitCard key={c.id} trait={c} icon="bolt" onRemove={() => setCharacteristics(characteristics.filter(item => item.id !== c.id))} onUpdate={(v, field) => {
              const n = [...characteristics];
              n[idx] = { ...n[idx], [field]: v };
              setCharacteristics(n);
            }} />
          ))}
          <button onClick={() => setCharacteristics([...characteristics, { id: generateId(), label: '' }])} className="aspect-square border border-dashed border-zinc-200 rounded-[32px] flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-zinc-600 hover:border-zinc-300 transition-all min-h-[180px]">
            <span className="material-symbols-outlined text-3xl">add_reaction</span>
            <span className="text-[9px] uppercase tracking-widest font-bold">Nova Virtude</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <StudioLabel className="text-zinc-400">Atmosfera & Sensação da Alma</StudioLabel>
          <p className="text-[10px] text-zinc-300 tracking-wider">O perfume emocional que essa pessoa deixa nos lugares.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensations.map((s, idx) => (
            <TraitCard key={s.id} trait={s} icon="spa" onRemove={() => setSensations(sensations.filter(item => item.id !== s.id))} onUpdate={(v, field) => {
              const n = [...sensations];
              n[idx] = { ...n[idx], [field]: v };
              setSensations(n);
            }} />
          ))}
          <button onClick={() => setSensations([...sensations, { id: generateId(), label: '' }])} className="aspect-square border border-dashed border-zinc-200 rounded-[32px] flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-zinc-600 hover:border-zinc-300 transition-all min-h-[180px]">
            <span className="material-symbols-outlined text-3xl">sunny</span>
            <span className="text-[9px] uppercase tracking-widest font-bold">Nova Sensação</span>
          </button>
        </div>
      </div>
    </div>
  );
};
