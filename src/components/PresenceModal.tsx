
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Presence } from '../services/presenceService';

interface PresenceModalProps {
  presence: Presence | null;
  onClose: () => void;
  onEdit?: (presence: Presence) => void;
  onDelete?: (presence: Presence) => void;
}

export const PresenceModal: React.FC<PresenceModalProps> = ({ presence, onClose, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  if (!presence) return null;

  const handleDelete = () => {
    if (window.confirm(`Deseja realmente excluir a presença de ${presence.name}? Esta ação é irreversível.`)) {
      if (onDelete) onDelete(presence);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[200] flex flex-col bg-white overflow-y-auto no-scrollbar scroll-smooth"
      >
        {/* Navigation Header */}
        <header className="sticky top-0 z-[210] w-full bg-white/80 backdrop-blur-xl border-b border-zinc-50 px-6 py-6 md:px-12 md:py-8 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-1">Registro de Presença</span>
            <h2 className="text-xl md:text-2xl font-light text-zinc-900 tracking-tight">{presence.name}</h2>
          </div>
          <div className="flex items-center gap-2 md:gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-xl md:text-2xl">more_vert</span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-[5]" 
                      onClick={() => setMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-white border border-zinc-100 rounded-3xl shadow-2xl z-[10] overflow-hidden p-2"
                    >
                      <button 
                        onClick={() => { onEdit?.(presence); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-all rounded-2xl"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        <span className="text-xs font-semibold uppercase tracking-widest">Editar</span>
                      </button>
                      <button 
                        onClick={() => { handleDelete(); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-5 py-4 text-red-300 hover:bg-red-50 hover:text-red-600 transition-all rounded-2xl"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                        <span className="text-xs font-semibold uppercase tracking-widest">Excluir</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-8 bg-zinc-100 mx-1 md:mx-2" />
            <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all">
              <span className="material-symbols-outlined text-2xl md:text-3xl">close</span>
            </button>
          </div>
        </header>

        <div className="flex-1 w-full max-w-5xl mx-auto px-6 md:px-12 py-10 md:py-20 pb-40">
          
          {/* Stage 1 & 2: Identity & Essence */}
          <section className="mb-24 md:mb-40 flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl border border-zinc-100 mb-12"
            >
              <img src={presence.photo} alt={presence.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </motion.div>
            
            <div className="space-y-6 max-w-3xl">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-7xl font-light text-zinc-900 tracking-tighter"
              >
                {presence.name}
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-2xl text-zinc-400 font-light tracking-tight max-w-xl mx-auto"
              >
                {presence.profession || 'Presença Inspiradora'}
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                 <span className="px-5 py-2.5 rounded-full bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border border-zinc-100 flex items-center gap-2">
                   <span className="material-symbols-outlined text-sm">location_on</span>
                   {presence.city}, {presence.country}
                 </span>
                 {presence.age && <span className="px-5 py-2.5 rounded-full bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border border-zinc-100">{presence.age} Ciclos</span>}
                 {presence.visitedCountries && (
                   <span className="px-5 py-2.5 rounded-full bg-zinc-50 text-[10px] uppercase tracking-widest text-zinc-400 font-bold border border-zinc-100 flex items-center gap-2">
                     <span className="material-symbols-outlined text-sm">public</span>
                     Explorou: {presence.visitedCountries}
                   </span>
                 )}
              </motion.div>
            </div>
          </section>

          {/* Section: Motor de Influência Existencial (MÓDULO: PRESENÇAS) */}
          <section className="mb-24 md:mb-40 space-y-12">
            <div className="text-center">
              <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-3">Motor de Influência Existencial</h4>
              <p className="text-3xl md:text-5xl font-light text-zinc-900 tracking-tight leading-none mb-1">Impacto Relacional Holístico</p>
              {presence.peso !== undefined && (
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-zinc-900 text-white border border-zinc-800 text-[10px] font-mono font-bold tracking-widest uppercase">
                  <span>Força Existencial:</span>
                  <span className="text-amber-400">{presence.peso.toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto pt-6 px-4 md:px-0">
              {/* Influência / Áreas Ativas */}
              {presence.influencia && (
                <div className="p-8 bg-zinc-50/50 border border-zinc-100/80 rounded-[40px] space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">insights</span>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Áreas Ativadas</h5>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-light">{presence.influencia}</p>
                </div>
              )}

              {/* Acionar Quando */}
              {presence.acionar_quando && (
                <div className="p-8 bg-zinc-50/50 border border-zinc-100/80 rounded-[40px] space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">notification_important</span>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Acionar Quando</h5>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-light">{presence.acionar_quando}</p>
                </div>
              )}

              {/* DNA */}
              {presence.dna && (
                <div className="p-8 bg-zinc-50/50 border border-zinc-100/80 rounded-[40px] space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">fingerprint</span>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">DNA / Princípios</h5>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-light">{presence.dna}</p>
                </div>
              )}

              {/* Impacto */}
              {presence.impacto && (
                <div className="p-8 bg-zinc-50/50 border border-zinc-100/80 rounded-[40px] space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400 text-xl">trending_up</span>
                    <h5 className="text-[10px] uppercase tracking-widest font-black text-zinc-600">Impacto na Vida</h5>
                  </div>
                  <p className="text-sm text-zinc-700 leading-relaxed font-light">{presence.impacto}</p>
                </div>
              )}

              {/* Alerta */}
              {presence.alerta && (
                <div className="p-8 bg-amber-50/20 border border-amber-100/30 rounded-[40px] space-y-4 md:col-span-2">
                  <div className="flex items-center gap-3 text-amber-700">
                    <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
                    <h5 className="text-[10px] uppercase tracking-widest font-black">Alerta de Absorção (Risco)</h5>
                  </div>
                  <p className="text-sm text-amber-900/80 leading-relaxed font-light">{presence.alerta}</p>
                </div>
              )}
            </div>
          </section>

          {/* Section: Journey Fragments (MOVED TO TOP FOR IMPACT) */}
          {presence.livingGallery && presence.livingGallery.length > 0 && (
            <section className="mb-24 md:mb-40">
              <div className="text-center mb-16 px-6">
                <h4 className="text-[10px] uppercase tracking-[0.5em] text-zinc-300 font-black mb-4">Fragmentos da Jornada</h4>
                <p className="text-xl md:text-2xl font-light text-zinc-400">Um vislumbre visual da trajetória.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 md:px-0">
                {presence.livingGallery.map((url, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="aspect-[4/5] rounded-[48px] overflow-hidden border border-zinc-50 shadow-sm hover:shadow-2xl transition-all duration-700 group"
                  >
                    <img src={url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 scale-[1.1] group-hover:scale-100" referrerPolicy="no-referrer" />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Essência & Impacto Vital */}
          {presence.essentials && (
            <section className="mb-40 md:mb-56 space-y-32">
               <div className="text-center">
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-6">Essência & Impacto Vital</h4>
                  <p className="text-3xl md:text-6xl font-light text-zinc-900 tracking-tighter">O Significado da Existência</p>
               </div>

               <div className="space-y-32 md:space-y-48">
                  {[
                    { key: 'representation', label: 'O que representa?', text: presence.essentials.representation, img: presence.essentials.representationImage },
                    { key: 'impact', label: 'Impacto Vital', text: presence.essentials.impact, img: presence.essentials.impactImage },
                    { key: 'learning', label: 'O Aprendizado', text: presence.essentials.learning, img: presence.essentials.learningImage },
                    { key: 'awakening', label: 'Despertar Interno', text: presence.essentials.awakening, img: presence.essentials.awakeningImage },
                    { key: 'influence', label: 'Influência Prática', text: presence.essentials.influence, img: presence.essentials.influenceImage },
                  ].filter(item => item.text).map((item, idx) => (
                    <motion.div 
                      key={item.key}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-24`}
                    >
                      {/* Image Container: White Card on Mobile, Side block on Desktop */}
                      <div className="w-full md:w-6/12 bg-zinc-50 rounded-[48px] md:rounded-[64px] overflow-hidden shadow-sm border border-zinc-100/50 aspect-[4/5] md:aspect-square flex items-center justify-center p-4 md:p-0">
                        {item.img ? (
                          <img 
                            src={item.img} 
                            className="w-full h-full object-contain md:object-cover transition-transform duration-[2.5s] hover:scale-105" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-zinc-200">
                            <span className="material-symbols-outlined text-6xl font-light">image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-8 md:space-y-10 py-6 md:py-0">
                        <div className="flex items-center gap-4">
                          <span className="text-[12px] font-black text-zinc-200 italic serif leading-none">0{idx + 1}</span>
                          <div className="h-px flex-1 bg-zinc-50 md:hidden" />
                          <div className="h-px w-16 bg-zinc-100 hidden md:block" />
                          <h4 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">
                            {item.label}
                          </h4>
                        </div>
                        <p className="text-2xl md:text-5xl font-light text-zinc-900 leading-[1.15] tracking-tight text-pretty serif italic">
                          {item.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </section>
          )}

          {/* Section: Human Value Notes (REDISEGNER WITH IMAGES) */}
          {presence.humanNotes && (
            <section className="mb-40 md:mb-56 space-y-24 md:space-y-32">
              <div className="text-center max-w-2xl mx-auto">
                <h4 className="text-[10px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-6">Mergulho de Valor</h4>
                <p className="text-2xl md:text-4xl font-light text-zinc-900 leading-relaxed italic font-serif">
                  Notas de Percepção Humana e Evolução Consciente
                </p>
              </div>

              <div className="space-y-32 md:space-y-48">
                {[
                  { label: 'Dom de Manifestação', value: presence.humanNotes.goodFor, img: presence.humanNotes.goodForImage, icon: 'auto_awesome' },
                  { label: 'Impulso Evolutivo', value: presence.humanNotes.evolutionImpact, img: presence.humanNotes.evolutionImpactImage, icon: 'trending_up' },
                  { label: 'Identidade Única', value: presence.humanNotes.specialTraits, img: presence.humanNotes.specialTraitsImage, icon: 'fingerprint' },
                  { label: 'Valor Situacional', value: presence.humanNotes.situationalValue, img: presence.humanNotes.situationalValueImage, icon: 'bolt' },
                  { label: 'Despertar Ativo', value: presence.humanNotes.positiveAwakening, img: presence.humanNotes.positiveAwakeningImage, icon: 'sunny' },
                  { label: 'Direção & Norte', value: presence.humanNotes.direction, img: presence.humanNotes.directionImage, icon: 'explore' },
                  { label: 'Horizonte Mental', value: presence.humanNotes.thoughtExpansion, img: presence.humanNotes.thoughtExpansionImage, icon: 'psychology' },
                  { label: 'Nova Percepção', value: presence.humanNotes.perceptionChange, img: presence.humanNotes.perceptionChangeImage, icon: 'visibility' }
                ].filter(item => item.value).map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 50 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-100px" }} 
                    className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-24`}
                  >
                    {/* Image Area - White Card feel on mobile, side by side on desktop */}
                    <div className="w-full md:w-6/12 bg-white rounded-[56px] border border-zinc-100 shadow-sm overflow-hidden aspect-[4/5] md:aspect-square flex items-center justify-center p-4 md:p-8">
                      {item.img ? (
                        <img 
                          src={item.img} 
                          className="w-full h-full object-contain transition-all duration-700" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-zinc-100">
                          <span className="material-symbols-outlined text-7xl font-light">{item.icon}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-8 md:space-y-10 py-4">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-zinc-200 text-lg">{item.icon}</span>
                        <div className="h-px flex-1 bg-zinc-50 md:hidden" />
                        <div className="h-px w-16 bg-zinc-100 hidden md:block" />
                        <h5 className="text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-black">
                          {item.label}
                        </h5>
                      </div>
                      
                      <p className="text-2xl md:text-5xl font-light text-zinc-900 leading-[1.15] tracking-tight serif italic">
                        {item.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Citations (Voz & Sabedoria) */}
          {presence.quotes && presence.quotes.length > 0 && (
            <section className="mb-40 md:mb-56 space-y-16">
               <div className="text-center mb-16">
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-4">Voz & Sabedoria</h4>
                  <p className="text-2xl md:text-3xl font-light text-zinc-900 tracking-tight">O Som da Consciência</p>
               </div>
               <div className="space-y-24 md:space-y-40">
                  {presence.quotes.map(q => (
                    <div key={q.id} className="relative group max-w-4xl mx-auto flex flex-col items-center text-center">
                       <span className="text-[80px] md:text-[140px] font-serif text-zinc-50 select-none pointer-events-none h-10 mb-8 italic">"</span>
                       <blockquote className="relative z-10 w-full">
                          <p className="text-2xl md:text-5xl font-light text-zinc-900 leading-[1.3] md:leading-[1.2] tracking-tight mb-12 text-balance">
                             {q.text}
                          </p>
                          {q.context && (
                             <footer className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold">— {q.context}</footer>
                          )}
                       </blockquote>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Section: Realização e Traços (Technical but Aesthetic) */}
          <section className="mb-40 md:mb-56 space-y-40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              {/* Professional Ocean */}
              {(presence.companies?.length || presence.projects?.length) && (
                <div className="space-y-16">
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold border-b border-zinc-100 pb-8">Manifestação Profissional</h4>
                  <div className="space-y-12">
                    {presence.companies?.map(c => (
                      <div key={c.id} className="group">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-300 font-bold mb-2">{c.role} — {c.period}</p>
                        <h5 className="text-2xl md:text-3xl font-light text-zinc-900 group-hover:pl-2 transition-all duration-500">{c.name}</h5>
                      </div>
                    ))}
                    {presence.projects?.map(p => (
                      <div key={p.id} className="group">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-300 font-bold mb-2">Projeto — {p.year}</p>
                        <div className="flex items-center gap-4">
                          <h5 className="text-2xl md:text-3xl font-light text-zinc-900 group-hover:pl-2 transition-all duration-500">{p.name}</h5>
                          {p.url && <a href={p.url} target="_blank" className="w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">link</span></a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequência (Traits) */}
              <div className="space-y-16">
                <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold border-b border-zinc-100 pb-8">Frequência Humanitária</h4>
                <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-8">
                    {presence.characteristics?.map(c => (
                      <div key={c.id} className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden shrink-0">
                          {c.image ? <img src={c.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-50 flex items-center justify-center"><span className="material-symbols-outlined text-zinc-200">bolt</span></div>}
                        </div>
                        <span className="text-xl md:text-2xl font-light text-zinc-800 tracking-tight">{c.label}</span>
                      </div>
                    ))}
                    {presence.sensations?.map(s => (
                      <div key={s.id} className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-xl overflow-hidden shrink-0">
                          {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-50 flex items-center justify-center"><span className="material-symbols-outlined text-zinc-200">spa</span></div>}
                        </div>
                        <span className="text-xl md:text-2xl font-light text-zinc-800 tracking-tight">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Mergulho de Sabedoria (Associated References) */}
          {presence.associatedReferences && presence.associatedReferences.length > 0 && (
            <section className="mb-40 md:mb-56 space-y-24">
               <div className="text-center">
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-4">Mergulho de Sabedoria</h4>
                  <p className="text-2xl md:text-4xl font-light text-zinc-900 tracking-tight">Referenciais de Alma</p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                  {presence.associatedReferences.map(ref => (
                    <motion.div 
                      key={ref.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      className="p-10 bg-white border border-zinc-100 rounded-[48px] shadow-sm hover:shadow-2xl transition-all group"
                    >
                      <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all mb-8 shadow-sm">
                        <span className="material-symbols-outlined text-2xl">{ref.icon || (ref.type === 'book' ? 'menu_book' : ref.type === 'idea' ? 'psychology' : 'history_edu')}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-300 font-bold mb-4 block underline decoration-zinc-100 underline-offset-8">{ref.type}</span>
                      <h5 className="text-2xl font-light text-zinc-900 mb-4">{ref.title}</h5>
                      <p className="text-sm font-light text-zinc-400 leading-relaxed italic">{ref.subtitle}</p>
                    </motion.div>
                  ))}
               </div>
            </section>
          )}

          {/* Section: Universo Vivo (CONTENT ONLY) */}
          {presence.livingContent && presence.livingContent.length > 0 && (
             <section className="mb-40 md:mb-56 space-y-24">
                <div className="text-center">
                   <h4 className="text-[11px] uppercase tracking-[0.5em] text-zinc-300 font-bold mb-6">Universo Vivo</h4>
                   <p className="text-3xl md:text-5xl font-light text-zinc-900 tracking-tighter">Expansão de Conteúdo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {presence.livingContent.map((content) => (
                    <a key={content.id} href={content.url} target="_blank" className="p-10 bg-zinc-50/50 border border-zinc-50 rounded-[56px] hover:bg-white hover:shadow-2xl hover:border-zinc-100 transition-all group relative overflow-hidden flex flex-col md:flex-row gap-8 items-start md:items-center">
                       <div className="w-20 h-20 shrink-0 rounded-full bg-white flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all shadow-md">
                          <span className="material-symbols-outlined text-3xl">{content.type === 'video' ? 'play_circle' : content.type === 'book' ? 'book' : content.type === 'podcast' ? 'podcasts' : 'article'}</span>
                       </div>
                       <div className="space-y-2">
                         <span className="text-[9px] uppercase tracking-[0.4em] text-zinc-300 font-bold">{content.type}</span>
                         <h5 className="text-2xl md:text-3xl font-light text-zinc-900 leading-tight pr-10">{content.title}</h5>
                       </div>
                       <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-20 transition-opacity">
                         <span className="material-symbols-outlined text-4xl">arrow_outward</span>
                       </div>
                    </a>
                  ))}
                </div>
             </section>
          )}

          {/* Section: Insights de Fluxo Livre */}
          {presence.freeNotes && (
            <section className="mb-40 md:mb-56 space-y-16 py-20 px-10 md:px-20 bg-zinc-900 rounded-[80px] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl bg-zinc-400 rounded-full" />
              <div className="max-w-3xl space-y-8 relative z-10">
                <h4 className="text-[10px] uppercase tracking-[0.6em] text-zinc-500 font-bold">Insights de Fluxo Livre</h4>
                <div className="w-12 h-px bg-zinc-700" />
                <p className="text-xl md:text-3xl font-light text-zinc-200 leading-relaxed tracking-wide">
                  {presence.freeNotes}
                </p>
              </div>
            </section>
          )}

          {/* Final Section: Connections (ENHANCED) */}
          {presence.connections && presence.connections.length > 0 && (
            <section className="pt-24 border-t border-zinc-50 flex flex-col items-center gap-16">
              <div className="text-center">
                <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-300 font-black mb-4 block">Canais de Conexão</span>
                <p className="text-xl font-light text-zinc-500 tracking-tight">Onde a consciência se funde com a realidade.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl">
                  {presence.connections.map(c => {
                    const isLocation = c.type === 'Endereço' || c.type === 'Localização';
                    const isLink = c.value.startsWith('http');
                    const mapsUrl = isLink ? c.value : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.value)}`;
                    const targetUrl = isLocation ? mapsUrl : (isLink ? c.value : '#');
                    
                    return (
                      <motion.a 
                        key={c.id} 
                        href={targetUrl} 
                        target="_blank" 
                        whileHover={{ y: -8 }}
                        className={`group relative flex flex-col p-10 rounded-[56px] border shadow-sm transition-all ${
                          isLocation 
                          ? 'bg-zinc-900 border-zinc-800 text-white hover:shadow-2xl' 
                          : 'bg-white border-zinc-50 hover:bg-zinc-50 hover:border-zinc-200'
                        }`}
                      >
                         {isLocation && (
                           <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden rounded-[56px]">
                             <div className="absolute inset-0 bg-[url('https://grainydesigns.com/noise.svg')] opacity-20" />
                             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 blur-[100px] rounded-full" />
                           </div>
                         )}
                         
                         <div className="flex justify-between items-start mb-8 relative z-10">
                           <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                             isLocation ? 'bg-white text-zinc-900' : 'bg-zinc-900 text-white'
                           }`}>
                             <span className="material-symbols-outlined text-2xl">
                               {c.type === 'Instagram' ? 'photo_camera' : 
                                c.type === 'WhatsApp' ? 'chat' : 
                                c.type === 'LinkedIn' ? 'work' : 
                                c.type === 'Endereço' ? 'map' :
                                c.type === 'Localização' ? 'explore' :
                                c.type === 'Instituição' ? 'account_balance' :
                                'link'}
                             </span>
                           </div>
                           <span className={`text-[8px] uppercase tracking-widest font-black ${
                             isLocation ? 'text-zinc-500' : 'text-zinc-200'
                           }`}>{c.type}</span>
                         </div>

                         <div className="space-y-4 relative z-10">
                           <p className={`text-base font-light leading-relaxed break-words ${
                             isLocation ? 'text-zinc-100' : 'text-zinc-600'
                           }`}>
                             {c.value}
                           </p>
                           {isLocation && (
                             <div className="flex items-center gap-2 text-white font-bold py-3 pr-4 border-t border-zinc-800 mt-6 group-hover:pl-2 transition-all">
                               <span className="text-[10px] uppercase tracking-widest">Abrir no Google Maps</span>
                               <span className="material-symbols-outlined text-[10px]">arrow_forward</span>
                             </div>
                           )}
                           {!isLocation && isLink && (
                             <div className="text-zinc-900 font-bold py-3 text-[10px] uppercase tracking-widest border-t border-zinc-100 flex items-center gap-2 group-hover:pl-2 transition-all">
                               Acessar conexão
                               <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                             </div>
                           )}
                         </div>
                      </motion.a>
                    );
                  })}
              </div>
            </section>
          )}

        </div>

        {/* Global Grain Texture */}
        <div className="fixed inset-0 pointer-events-none z-[300] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
      </motion.div>
    </AnimatePresence>
  );
};
