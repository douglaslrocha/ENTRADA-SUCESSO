import React from 'react';
import { StudioLabel, StudioTextArea, StudioInput } from './StudioAtoms';

interface InfluenceSectionProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const PresenceInfluenceSection: React.FC<InfluenceSectionProps> = ({ formData, setFormData }) => {
  const handleWeightChange = (val: string) => {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    num = Math.max(0, Math.min(10, num));
    setFormData({ ...formData, peso: num });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Ativação de Áreas - Influência */}
        <div className="space-y-3">
          <StudioLabel>Influência (Quais áreas ativa)</StudioLabel>
          <StudioTextArea
            placeholder="Ex: Criatividade radical, invenção futurista, foco profundo de abstração e intuição refinada..."
            value={formData.influencia || ''}
            onChange={(v) => setFormData({ ...formData, influencia: v })}
          />
          <p className="text-[10px] text-zinc-400 pl-1">
            Descreva as faculdades mentais, energéticas ou cognitivas despertadas por esta presença.
          </p>
        </div>

        {/* Acionar Quando */}
        <div className="space-y-3">
          <StudioLabel>Acionar Quando (Situações específicas)</StudioLabel>
          <StudioTextArea
            placeholder="Ex: Bloqueios criativos profundos, necessidade de pensar além do ordinário e idealização inicial..."
            value={formData.acionar_quando || ''}
            onChange={(v) => setFormData({ ...formData, acionar_quando: v })}
          />
          <p className="text-[10px] text-zinc-400 pl-1">
            Gatilhos existenciais ou momentos críticos da sua vida sob os quais você evoca esta força.
          </p>
        </div>

        {/* DNA */}
        <div className="space-y-3">
          <StudioLabel>DNA (Princípios centrais de conduta)</StudioLabel>
          <StudioTextArea
            placeholder="Ex: Abstração mental absoluta, experimentação incansável e visualização espacial impecável..."
            value={formData.dna || ''}
            onChange={(v) => setFormData({ ...formData, dna: v })}
          />
          <p className="text-[10px] text-zinc-400 pl-1">
            Traços de caráter primorosos e pilares fundamentais de integridade desta referência.
          </p>
        </div>

        {/* Impacto Vital */}
        <div className="space-y-3">
          <StudioLabel>Impacto (Como altera a sua vida)</StudioLabel>
          <StudioTextArea
            placeholder="Ex: Estimula pensamentos inventivos audaciosos e rompe limitações cotidianas..."
            value={formData.impacto || ''}
            onChange={(v) => setFormData({ ...formData, impacto: v })}
          />
          <p className="text-[10px] text-zinc-400 pl-1">
            Qual a transformação ou realinhamento na sua direção existencial de longo prazo.
          </p>
        </div>

        {/* Alerta de Absorção */}
        <div className="space-y-3">
          <StudioLabel>Alerta (Traços de risco que NÃO devem ser absorvidos)</StudioLabel>
          <StudioTextArea
            placeholder="Ex: Evitar isolamento antissocial completo debilitante e obsessões intransponíveis..."
            value={formData.alerta || ''}
            onChange={(v) => setFormData({ ...formData, alerta: v })}
          />
          <p className="text-[10px] text-zinc-400 pl-1 text-amber-600/80">
            Aspectos de sombra, hábitos nocivos ou desalinhamentos mentais para manter sob estrita vigília.
          </p>
        </div>

        {/* Peso / Importância Subjetiva (0-10) */}
        <div className="space-y-4 bg-zinc-50/40 border border-zinc-100 p-6 rounded-3xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-1">
            <StudioLabel className="mb-0">Peso Subjetivo de Influência</StudioLabel>
            <span className="text-sm font-mono font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
              {formData.peso !== undefined ? formData.peso.toFixed(1) : '5.0'} / 10
            </span>
          </div>
          
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.peso !== undefined ? formData.peso : 5}
            onChange={(e) => setFormData({ ...formData, peso: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900 focus:outline-none"
          />

          <p className="text-[10px] text-zinc-400 mt-3 leading-relaxed">
            Representa a intensidade em que esta força interfere nas suas escolhas estratégicas ou direcionamento mental atual (0 a 10).
          </p>
        </div>

      </div>
    </div>
  );
};
