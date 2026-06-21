import React from 'react';
import { StudioLabel, StudioInput, StudioAction } from './StudioAtoms';
import { ReferenceContent, AssociateReference } from '../../services/presenceService';

interface UniverseSectionProps {
  livingGallery: { id: string, url: string }[];
  setLivingGallery: (g: { id: string, url: string }[]) => void;
  livingContent: ReferenceContent[];
  setLivingContent: (c: ReferenceContent[]) => void;
  associatedReferences: AssociateReference[];
  setAssociatedReferences: (r: AssociateReference[]) => void;
}

const GalleryItem = ({ img, idx, livingGallery, setLivingGallery }: { img: { id: string, url: string }, idx: number, livingGallery: any[], setLivingGallery: (g: any[]) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const n = [...livingGallery];
        n[idx].url = reader.result as string;
        setLivingGallery(n);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div key={img.id} className="aspect-square bg-zinc-50 border border-zinc-100 rounded-3xl overflow-hidden relative group shadow-sm transition-all hover:shadow-xl">
      {img.url ? <img src={img.url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><span className="material-symbols-outlined text-4xl">image</span></div>}
      
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-3 p-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-12 h-12 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <span className="material-symbols-outlined text-lg">upload</span>
        </button>
        <input 
          value={img.url.startsWith('data:') ? 'Imagem Local' : img.url} 
          onChange={(e) => { const n = [...livingGallery]; n[idx].url = e.target.value; setLivingGallery(n); }}
          placeholder="Link da imagem..." 
          className="w-full bg-white/30 backdrop-blur-xl rounded-xl p-2.5 text-[9px] text-white focus:outline-none text-center font-bold tracking-widest placeholder:text-white/60 border border-white/20"
        />
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      <button 
        onClick={() => setLivingGallery(livingGallery.filter(g => g.id !== img.id))}
        className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
      >
        <span className="material-symbols-outlined text-[14px]">close</span>
      </button>
    </div>
  );
};

const ContentItem = ({ c, idx, livingContent, setLivingContent }: { c: ReferenceContent, idx: number, livingContent: ReferenceContent[], setLivingContent: (c: ReferenceContent[]) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div key={c.id} className="p-5 sm:p-8 bg-zinc-50 border border-zinc-100 rounded-[32px] sm:rounded-[40px] relative space-y-6 shadow-sm hover:shadow-md transition-all">
      <button onClick={() => setLivingContent(livingContent.filter(item => item.id !== c.id))} className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-base">close</span></button>
      <div className="flex flex-wrap gap-2">
        {['video', 'article', 'book', 'podcast'].map(type => (
          <button key={type} onClick={() => { const n = [...livingContent]; n[idx].type = type as any; setLivingContent(n); }} className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold border transition-all ${c.type === type ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-100 text-zinc-300 hover:border-zinc-200'}`}>{type}</button>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <StudioInput placeholder="Título da Obra / Conteúdo..." value={c.title} onChange={(v) => { const n = [...livingContent]; n[idx].title = v; setLivingContent(n); }} className="bg-white flex-1" />
          {c.type === 'video' && (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-white border border-zinc-100 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
            </button>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const n = [...livingContent];
                n[idx].url = `Local: ${file.name}`;
                setLivingContent(n);
              }
            }}
          />
        </div>
        <StudioInput 
          placeholder="Link de Acesso (URL)..." 
          value={c.url} 
          onChange={(v) => { const n = [...livingContent]; n[idx].url = v; setLivingContent(n); }} 
          className="bg-white" 
        />
      </div>
    </div>
  );
};

export const PresenceUniverseSection: React.FC<UniverseSectionProps> = ({
  livingGallery, setLivingGallery, livingContent, setLivingContent, associatedReferences, setAssociatedReferences
}) => {
  const generateId = () => Math.random().toString(36).substr(2, 9);

  return (
    <div className="space-y-20">
      {/* Living Gallery */}
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <StudioLabel className="text-zinc-400">Galeria Viva (Imagens & Fragmentos)</StudioLabel>
          <p className="text-[10px] text-zinc-300 tracking-wider">Mosaico visual que compõe o estilo de vida desse ser.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {livingGallery.map((img, idx) => (
            <GalleryItem key={img.id} img={img} idx={idx} livingGallery={livingGallery} setLivingGallery={setLivingGallery} />
          ))}
          <button onClick={() => setLivingGallery([...livingGallery, { id: generateId(), url: '' }])} className="aspect-square border border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-3 text-zinc-300 hover:text-zinc-900 transition-all hover:bg-zinc-50">
            <span className="material-symbols-outlined text-4xl font-light">add_photo_alternate</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Adicionar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
        {/* Content */}
        <div className="space-y-10">
          <div className="flex flex-col gap-1">
            <StudioLabel className="text-zinc-400">Conteúdos & Media Digitais</StudioLabel>
            <p className="text-[10px] text-zinc-300 tracking-wider">Vídeos, artigos ou podcasts que materializam sua voz.</p>
          </div>
          <div className="space-y-6">
            {livingContent.map((c, idx) => (
              <ContentItem key={c.id} c={c} idx={idx} livingContent={livingContent} setLivingContent={setLivingContent} />
            ))}
            <StudioAction icon="play_circle" label="Adicionar Mídia" onClick={() => setLivingContent([...livingContent, { id: generateId(), title: '', url: '', type: 'video' }])} />
          </div>
        </div>

        {/* References */}
        <div className="space-y-10">
          <div className="flex flex-col gap-1">
            <StudioLabel className="text-zinc-400">Referências de Alma & Filtros</StudioLabel>
            <p className="text-[10px] text-zinc-300 tracking-wider">Livros, filosofias ou ideias que moldam seu pensamento.</p>
          </div>
          <div className="space-y-6">
            {associatedReferences.map((r, idx) => (
              <div key={r.id} className="p-5 sm:p-8 bg-white border border-zinc-100 rounded-[32px] sm:rounded-[40px] relative space-y-6 shadow-md">
                <button onClick={() => setAssociatedReferences(associatedReferences.filter(item => item.id !== r.id))} className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-base">close</span></button>
                <div className="flex flex-wrap gap-2">
                  {['book', 'idea', 'philosophy'].map(type => (
                    <button key={type} onClick={() => { const n = [...associatedReferences]; n[idx].type = type as any; setAssociatedReferences(n); }} className={`px-4 py-2 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold border transition-all ${r.type === type ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-zinc-50 border-zinc-100 text-zinc-300 hover:border-zinc-200'}`}>{type}</button>
                  ))}
                </div>
                <div className="space-y-4">
                  <StudioInput placeholder="Nome da Fonte / Conceito..." value={r.title} onChange={(v) => { const n = [...associatedReferences]; n[idx].title = v; setAssociatedReferences(n); }} />
                  <StudioInput placeholder="Essência (O que representa?)..." value={r.subtitle || ''} onChange={(v) => { const n = [...associatedReferences]; n[idx].subtitle = v; setAssociatedReferences(n); }} />
                  <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-2xl">
                    <span className="material-symbols-outlined text-zinc-400 text-lg">{r.icon || 'star'}</span>
                    <StudioInput placeholder="Ícone (Google Symbols)..." value={r.icon || ''} onChange={(v) => { const n = [...associatedReferences]; n[idx].icon = v; setAssociatedReferences(n); }} className="text-[10px] py-1 border-none bg-transparent" />
                  </div>
                </div>
              </div>
            ))}
            <StudioAction icon="menu_book" label="Eternizar Referência" onClick={() => setAssociatedReferences([...associatedReferences, { id: generateId(), title: '', subtitle: '', icon: '', type: 'book' }])} />
          </div>
        </div>
      </div>
    </div>
  );
};
