import React from 'react';
import { StudioLabel, StudioTextArea } from './StudioAtoms';

interface EssenceSectionProps {
  essentials: any;
  onChange: (v: any) => void;
}

const EssenceItem = ({ field, essentials, onChange }: { field: any, essentials: any, onChange: (v: any) => void }) => {
  const imageKey = `${field.key}Image`;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ ...essentials, [imageKey]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div key={field.key} className="p-5 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-[32px] sm:rounded-[40px] space-y-6">
      <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Image Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full md:w-32 aspect-square bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm flex items-center justify-center cursor-pointer hover:border-zinc-300 transition-all shrink-0 group relative"
        >
          {essentials[imageKey] ? (
            <img src={essentials[imageKey]} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 opacity-20 text-zinc-900">
              <span className="material-symbols-outlined text-2xl">add_a_photo</span>
              <span className="text-[7px] uppercase font-bold tracking-widest text-center">Imagem</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-sm">upload</span>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        <div className="flex-1 space-y-4">
          <StudioLabel className="text-zinc-400">{field.label}</StudioLabel>
          <StudioTextArea 
            placeholder={field.placeholder} 
            value={essentials[field.key]} 
            onChange={(v) => onChange({ ...essentials, [field.key]: v })} 
            className="bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export const PresenceEssenceSection: React.FC<EssenceSectionProps> = ({ essentials, onChange }) => {
  const fields = [
    { key: 'representation', label: 'O que representa?', placeholder: 'A visão subjetiva desta presença...' },
    { key: 'impact', label: 'Impacto Vital', placeholder: 'Como esta existência reverbera em seu universo...' },
    { key: 'learning', label: 'O Aprendizado', placeholder: 'Padrões de sabedoria observados...' },
    { key: 'awakening', label: 'Despertar Interno', placeholder: 'Virtudes ativadas na sua consciência...' },
    { key: 'influence', label: 'Influência Prática', placeholder: 'Mudanças no cotidiano que esta presença gerou...' },
  ];

  return (
    <div className="space-y-12">
      {fields.map((field) => (
        <EssenceItem key={field.key} field={field} essentials={essentials} onChange={onChange} />
      ))}
    </div>
  );
};
