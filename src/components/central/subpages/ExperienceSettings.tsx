import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Monitor, 
  Smartphone,
  CheckCircle2,
  Upload,
  Layout,
  X
} from 'lucide-react';
import { PageType, backgroundService, DEFAULT_IMAGES } from '../../../services/backgroundService';

export const ExperienceSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PageType>('diary');
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setImages(backgroundService.getImages(activeTab));
  }, [activeTab]);

  const handleAddImageUrl = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url && url.startsWith('http')) {
      const newImages = [...images, url];
      setImages(newImages);
      backgroundService.setImages(activeTab, newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    backgroundService.setImages(activeTab, newImages);
  };

  const handleReset = () => {
    if (confirm('Deseja resetar para as imagens padrão?')) {
      backgroundService.reset(activeTab);
      setImages(backgroundService.getImages(activeTab));
    }
  };

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            // Check session storage limits (vague but useful)
            if (result.length > 2 * 1024 * 1024) {
              alert('Imagem muito grande. Prefira URLs para melhor performance.');
              return;
            }
            const newImages = [...images, result];
            setImages(newImages);
            backgroundService.setImages(activeTab, newImages);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const tabs: { id: PageType; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout },
    { id: 'amparadora', label: 'Amparadora', icon: Layout },
    { id: 'diary', label: 'Diário', icon: Layout },
    { id: 'finance', label: 'Financeiro', icon: Layout },
    { id: 'objectives', label: 'Objetivos', icon: Layout },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2 text-[var(--text)]">
            <Monitor className="text-indigo-500 dark:text-indigo-400" size={20} />
            Experiência Visual
          </h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Gerencie os carrosséis de fundo para cada ambiente.</p>
        </div>
        
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-[var(--text)]"
        >
          <RotateCcw size={12} />
          Resetar Padrão
        </button>
      </div>

      {/* Page Selector Tabs */}
      <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-2xl border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-lg scale-[1.02]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text)]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Gallery Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {images.map((img, idx) => (
            <motion.div
              key={`${activeTab}-${idx}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"
            >
              <img 
                src={img} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                alt={`Background ${idx}`} 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => handleRemoveImage(idx)}
                  className="p-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all transform hover:scale-110"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-black text-white/80">
                #{idx + 1}
              </div>
            </motion.div>
          ))}

          {/* Add New Button */}
          <motion.div layout className="contents">
            <div 
              className="relative aspect-video rounded-2xl border-2 border-dashed border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center gap-3 group cursor-pointer overflow-hidden"
            >
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={onFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="p-3 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <Upload size={20} className="text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/50 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">Upload</span>
                <p className="text-[8px] text-zinc-300 dark:text-white/20 group-hover:text-zinc-400 dark:group-hover:text-white/40 hidden md:block mt-1">Clique ou solte imagens</p>
              </div>
            </div>
            
            <button 
              onClick={handleAddImageUrl}
              className="relative aspect-video rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="p-3 rounded-full bg-zinc-200/50 dark:bg-white/10 group-hover:bg-zinc-200 dark:group-hover:bg-white/20 transition-colors">
                <Plus size={20} className="text-zinc-500 dark:text-white/60 group-hover:text-zinc-700 dark:group-hover:text-white transition-colors" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-white/50 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">Inserir URL</span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10">
        <div className="flex gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 h-fit">
            <Smartphone className="text-indigo-600 dark:text-indigo-400" size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)] mb-1 leading-none tracking-tight">Dica de Performance</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xl opacity-85">
              Imagens carregadas via URL de serviços como Unsplash são otimizadas automaticamente. O upload de arquivos locais usa o armazenamento do seu navegador e pode impactar a velocidade se abusar de imagens pesadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
