import React from 'react';
import { StudioLabel, StudioTextArea } from './StudioAtoms';
import { HumanValueNotes } from '../../services/presenceService';

interface HumanNotesSectionProps {
  notes: HumanValueNotes;
  onChange: (v: HumanValueNotes) => void;
}

interface NoteItemProps {
  field: { key: keyof HumanValueNotes, label: string, placeholder: string };
  notes: HumanValueNotes;
  onChange: (v: HumanValueNotes) => void;
}

const NoteItem = ({ field, notes, onChange }: NoteItemProps) => {
  const imageKey = `${field.key}Image` as keyof HumanValueNotes;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ ...notes, [imageKey]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div key={field.key} className="p-6 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-[32px] sm:rounded-[40px] space-y-6">
      <div className="flex flex-col gap-6">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[2/1] sm:aspect-[3/1] bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center cursor-pointer hover:border-zinc-300 transition-all shrink-0 group relative"
        >
          {notes[imageKey] ? (
            <img src={notes[imageKey] as string} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 opacity-20 text-zinc-900">
              <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              <span className="text-[8px] uppercase font-bold tracking-widest text-center">Imagem de Valor</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-base">upload</span>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        
        <div className="space-y-4">
          <StudioLabel className="text-zinc-400 text-[10px] uppercase font-black tracking-widest">{field.label}</StudioLabel>
          <StudioTextArea 
            placeholder={field.placeholder} 
            value={(notes[field.key] as string) || ''} 
            onChange={(v) => onChange({ ...notes, [field.key]: v })} 
            className="min-h-[120px] bg-white border-zinc-100 text-xs py-4 px-5 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};

export const PresenceHumanNotesSection: React.FC<HumanNotesSectionProps> = ({ notes, onChange }) => {
  const fields: { key: keyof HumanValueNotes, label: string, placeholder: string }[] = [
    { key: 'goodFor', label: 'Para que essa pessoa é boa?', placeholder: 'Habilidades, talentos ou virtudes práticas...' },
    { key: 'evolutionImpact', label: 'Impacto na minha Evolução', placeholder: 'Como ela ajuda meu crescimento pessoal...' },
    { key: 'specialTraits', label: 'O que existe de Especial?', placeholder: 'Aquele "algo mais" que só ela tem...' },
    { key: 'situationalValue', label: 'Momento de Valor', placeholder: 'Em quais situações ela mais soma na minha vida...' },
    { key: 'positiveAwakening', label: 'Despertar Positivo', placeholder: 'O que ela desperta de melhor em mim...' },
    { key: 'direction', label: 'Direcionamento', placeholder: 'Que tipo de direção ou clareza ela traz...' },
    { key: 'thoughtExpansion', label: 'Expansão de Pensamento', placeholder: 'Como ela faz meu horizonte mental crescer...' },
    { key: 'perceptionChange', label: 'Percepção da Vida', placeholder: 'O que ela me faz ver com novos olhos...' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
      {fields.map((field) => (
        <NoteItem key={field.key} field={field} notes={notes} onChange={onChange} />
      ))}
    </div>
  );
};
