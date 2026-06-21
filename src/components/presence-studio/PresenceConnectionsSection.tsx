import React, { useState } from 'react';
import { StudioLabel, StudioInput, StudioAction } from './StudioAtoms';
import { Connection } from '../../services/presenceService';
import { MapPicker } from '../MapPicker';

interface ConnectionsSectionProps {
  connections: Connection[];
  setConnections: (c: Connection[]) => void;
}

export const PresenceConnectionsSection: React.FC<ConnectionsSectionProps> = ({ connections, setConnections }) => {
  const [addressPicker, setAddressPicker] = useState<{ idx: number; value: string } | null>(null);
  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {connections.map((conn, idx) => {
          const isAddress = conn.type === 'Endereço' || conn.type === 'Localização';
          
          return (
            <div key={conn.id} className="flex flex-col sm:flex-row gap-3 bg-zinc-50 border border-zinc-100 p-4 sm:p-2 sm:pl-4 rounded-[32px] sm:rounded-full items-start sm:items-center shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  value={conn.type} 
                  onChange={(e) => { const n = [...connections]; n[idx].type = e.target.value as any; setConnections(n); }} 
                  className="bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2 text-[9px] focus:outline-none font-black uppercase tracking-widest text-zinc-900 shadow-sm min-w-[120px]"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Email">E-mail</option>
                  <option value="Website">Website</option>
                  <option value="Instituição">Instituição</option>
                  <option value="Endereço">Endereço</option>
                  <option value="Localização">Localização</option>
                  <option value="Personalizado">Outro</option>
                </select>
                <button onClick={() => setConnections(connections.filter(c => c.id !== conn.id))} className="sm:hidden ml-auto text-zinc-300 hover:text-red-500">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              
              <div className="flex-1 flex items-center w-full">
                <input 
                  value={conn.value} 
                  onChange={(e) => { const n = [...connections]; n[idx].value = e.target.value; setConnections(n); }} 
                  placeholder={isAddress ? "Rua, n, Cidade..." : "Link, @usuario ou identificação..."} 
                  className="flex-1 bg-transparent border-none text-xs font-medium focus:outline-none placeholder:text-zinc-300 px-2" 
                />
                {isAddress && (
                  <button 
                    onClick={() => setAddressPicker({ idx, value: conn.value })}
                    className="p-2 mr-2 bg-white border border-zinc-100 rounded-full text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm flex items-center justify-center"
                    title="Mapear Localização"
                  >
                    <span className="material-symbols-outlined text-base">map</span>
                  </button>
                )}
              </div>

              <button onClick={() => setConnections(connections.filter(c => c.id !== conn.id))} className="hidden sm:flex text-zinc-300 hover:text-red-500 mr-2 transition-colors">
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          );
        })}
      </div>

      {addressPicker && (
        <MapPicker 
          initialValue={addressPicker.value}
          onSelect={(address) => {
            const n = [...connections];
            n[addressPicker.idx].value = address;
            setConnections(n);
          }}
          onClose={() => setAddressPicker(null)}
        />
      )}

      <div className="flex justify-center sm:justify-start">
        <StudioAction icon="share" label="Novo Canal de Aproximação" onClick={() => setConnections([...connections, { id: generateId(), type: 'Instagram', value: '' }])} />
      </div>
    </div>
  );
};
