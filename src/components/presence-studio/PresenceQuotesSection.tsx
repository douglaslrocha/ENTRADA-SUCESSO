import React from 'react';
import { StudioLabel, StudioTextArea, StudioInput, StudioAction } from './StudioAtoms';
import { motion } from 'motion/react';

interface QuotesSectionProps {
  quotes: { id: string, text: string, context?: string }[];
  setQuotes: (q: { id: string, text: string, context?: string }[]) => void;
}

export const PresenceQuotesSection: React.FC<QuotesSectionProps> = ({ quotes, setQuotes }) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="space-y-6">
      {quotes.map((q, idx) => (
        <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-zinc-50/50 border border-zinc-100 rounded-[32px] relative space-y-4 shadow-sm group">
          <button onClick={() => setQuotes(quotes.filter(item => item.id !== q.id))} className="absolute top-5 right-5 text-zinc-300 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
          <div className="space-y-4">
            <StudioLabel>Frase / Pensamento</StudioLabel>
            <StudioTextArea 
              placeholder="Escreva algo que ecoe a verdade deste ser..." 
              value={q.text} 
              onChange={(v) => { const n = [...quotes]; n[idx].text = v; setQuotes(n); }} 
              className="bg-white"
            />
            <StudioInput 
              placeholder="Contexto ou Origem (Ex: Em conversa sobre futuro...)" 
              value={q.context || ''} 
              onChange={(v) => { const n = [...quotes]; n[idx].context = v; setQuotes(n); }} 
              className="bg-white"
            />
          </div>
        </motion.div>
      ))}
      <StudioAction icon="format_quote" label="Eternizar nova Frase" onClick={() => setQuotes([...quotes, { id: generateId(), text: '' }])} />
    </div>
  );
};
