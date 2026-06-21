
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { presenceService, Presence, Company, Connection, ReferenceContent, AssociateReference, HumanTrait, Project, HumanValueNotes } from '../services/presenceService';
import { StudioSection, StudioLabel, StudioTextArea } from './presence-studio/StudioAtoms';
import { PresenceIdentitySection } from './presence-studio/PresenceIdentitySection';
import { PresenceEssenceSection } from './presence-studio/PresenceEssenceSection';
import { PresenceRealizationSection } from './presence-studio/PresenceRealizationSection';
import { PresenceTraitsSection } from './presence-studio/PresenceTraitsSection';
import { PresenceUniverseSection } from './presence-studio/PresenceUniverseSection';
import { PresenceConnectionsSection } from './presence-studio/PresenceConnectionsSection';
import { PresenceQuotesSection } from './presence-studio/PresenceQuotesSection';
import { PresenceHumanNotesSection } from './presence-studio/PresenceHumanNotesSection';
import { PresenceInfluenceSection } from './presence-studio/PresenceInfluenceSection';

interface NewPresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialPresence?: Presence | null;
}

export const NewPresenceModal: React.FC<NewPresenceModalProps> = ({ isOpen, onClose, onSave, initialPresence }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    photo: '',
    city: '',
    country: '',
    age: '',
    profession: '',
    influencia: '',
    acionar_quando: '',
    dna: '',
    impacto: '',
    alerta: '',
    peso: 5,
    essentials: {
      representation: '',
      representationImage: '',
      impact: '',
      impactImage: '',
      learning: '',
      learningImage: '',
      awakening: '',
      awakeningImage: '',
      influence: '',
      influenceImage: ''
    } as NonNullable<Presence['essentials']>,
    humanNotes: {
      goodFor: '',
      goodForImage: '',
      evolutionImpact: '',
      evolutionImpactImage: '',
      specialTraits: '',
      specialTraitsImage: '',
      situationalValue: '',
      situationalValueImage: '',
      positiveAwakening: '',
      positiveAwakeningImage: '',
      direction: '',
      directionImage: '',
      thoughtExpansion: '',
      thoughtExpansionImage: '',
      perceptionChange: '',
      perceptionChangeImage: ''
    } as HumanValueNotes,
    freeNotes: ''
  });

  const [secondaryImages, setSecondaryImages] = React.useState<{id: string, url: string}[]>([]);
  const [mainVideos, setMainVideos] = React.useState<{id: string, url: string}[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [characteristics, setCharacteristics] = React.useState<HumanTrait[]>([]);
  const [quotes, setQuotes] = React.useState<{ id: string; text: string; context?: string }[]>([]);
  const [sensations, setSensations] = React.useState<HumanTrait[]>([]);
  const [livingGallery, setLivingGallery] = React.useState<{id: string, url: string}[]>([]);
  const [livingContent, setLivingContent] = React.useState<ReferenceContent[]>([]);
  const [associatedReferences, setAssociatedReferences] = React.useState<AssociateReference[]>([]);

  // Populate data when editing
  React.useEffect(() => {
    if (initialPresence) {
      setFormData({
        name: initialPresence.name || '',
        photo: initialPresence.photo || '',
        city: initialPresence.city || '',
        country: initialPresence.country || '',
        age: initialPresence.age || '',
        profession: initialPresence.profession || '',
        influencia: initialPresence.influencia || '',
        acionar_quando: initialPresence.acionar_quando || '',
        dna: initialPresence.dna || '',
        impacto: initialPresence.impacto || '',
        alerta: initialPresence.alerta || '',
        peso: initialPresence.peso !== undefined ? initialPresence.peso : 5,
        essentials: {
          representation: initialPresence.essentials?.representation || '',
          representationImage: initialPresence.essentials?.representationImage || '',
          impact: initialPresence.essentials?.impact || '',
          impactImage: initialPresence.essentials?.impactImage || '',
          learning: initialPresence.essentials?.learning || '',
          learningImage: initialPresence.essentials?.learningImage || '',
          awakening: initialPresence.essentials?.awakening || '',
          awakeningImage: initialPresence.essentials?.awakeningImage || '',
          influence: initialPresence.essentials?.influence || '',
          influenceImage: initialPresence.essentials?.influenceImage || ''
        },
        humanNotes: {
          goodFor: initialPresence.humanNotes?.goodFor || '',
          goodForImage: initialPresence.humanNotes?.goodForImage || '',
          evolutionImpact: initialPresence.humanNotes?.evolutionImpact || '',
          evolutionImpactImage: initialPresence.humanNotes?.evolutionImpactImage || '',
          specialTraits: initialPresence.humanNotes?.specialTraits || '',
          specialTraitsImage: initialPresence.humanNotes?.specialTraitsImage || '',
          situationalValue: initialPresence.humanNotes?.situationalValue || '',
          situationalValueImage: initialPresence.humanNotes?.situationalValueImage || '',
          positiveAwakening: initialPresence.humanNotes?.positiveAwakening || '',
          positiveAwakeningImage: initialPresence.humanNotes?.positiveAwakeningImage || '',
          direction: initialPresence.humanNotes?.direction || '',
          directionImage: initialPresence.humanNotes?.directionImage || '',
          thoughtExpansion: initialPresence.humanNotes?.thoughtExpansion || '',
          thoughtExpansionImage: initialPresence.humanNotes?.thoughtExpansionImage || '',
          perceptionChange: initialPresence.humanNotes?.perceptionChange || '',
          perceptionChangeImage: initialPresence.humanNotes?.perceptionChangeImage || ''
        },
        freeNotes: initialPresence.freeNotes || ''
      });

      setSecondaryImages((initialPresence.secondaryImages || []).map(url => ({ id: Math.random().toString(), url })));
      setMainVideos((initialPresence.mainVideos || []).map(url => ({ id: Math.random().toString(), url })));
      setCompanies(initialPresence.companies || []);
      setProjects(initialPresence.projects || []);
      setConnections(initialPresence.connections || []);
      setCharacteristics(initialPresence.characteristics || []);
      setQuotes(initialPresence.quotes || []);
      setSensations(initialPresence.sensations || []);
      setLivingGallery((initialPresence.livingGallery || []).map(url => ({ id: Math.random().toString(), url })));
      setLivingContent(initialPresence.livingContent || []);
      setAssociatedReferences(initialPresence.associatedReferences || []);
    } else {
      // Reset if no initialPresence (creating new)
      setFormData({
        name: '', photo: '', city: '', country: '', age: '', profession: '',
        influencia: '', acionar_quando: '', dna: '', impacto: '', alerta: '', peso: 5,
        essentials: { representation: '', representationImage: '', impact: '', impactImage: '', learning: '', learningImage: '', awakening: '', awakeningImage: '', influence: '', influenceImage: '' },
        humanNotes: { goodFor: '', goodForImage: '', evolutionImpact: '', evolutionImpactImage: '', specialTraits: '', specialTraitsImage: '', situationalValue: '', situationalValueImage: '', positiveAwakening: '', positiveAwakeningImage: '', direction: '', directionImage: '', thoughtExpansion: '', thoughtExpansionImage: '', perceptionChange: '', perceptionChangeImage: '' },
        freeNotes: ''
      });
      setSecondaryImages([]); setMainVideos([]); setCompanies([]); setProjects([]); setConnections([]); setCharacteristics([]); setQuotes([]); setSensations([]); setLivingGallery([]); setLivingContent([]); setAssociatedReferences([]);
    }
  }, [initialPresence, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.name) return;

    const presencePayload = {
      ...formData,
      secondaryImages: secondaryImages.map(img => img.url).filter(Boolean),
      mainVideos: mainVideos.map(v => v.url).filter(Boolean),
      companies,
      projects,
      connections,
      characteristics,
      quotes,
      sensations,
      livingGallery: livingGallery.map(img => img.url).filter(Boolean),
      livingContent,
      associatedReferences
    };

    if (initialPresence) {
      presenceService.updatePresence(initialPresence.id, presencePayload);
    } else {
      presenceService.addPresence(presencePayload);
    }

    if (onSave) onSave();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 md:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/40 backdrop-blur-3xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-5xl h-full max-h-[90vh] bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-zinc-100 flex flex-col overflow-hidden"
        >
          {/* Main Scroll Container */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative">
            
            {/* Header - Subtle and Cinematic (Now scrolls with content) */}
            <header className="px-10 py-8 md:py-10 flex justify-between items-start bg-white w-full">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.6em] text-zinc-300 font-extrabold mb-2 underline decoration-zinc-100 underline-offset-8">Studio de Presença</span>
                <h2 className="text-2xl md:text-4xl font-light text-zinc-900 tracking-tighter">Materializar Consciência</h2>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-sm group"
              >
                <span className="material-symbols-outlined text-xl transition-transform group-hover:rotate-90">close</span>
              </button>
            </header>

            {/* Body Content */}
            <div className="px-4 sm:px-10 pb-10">
              <div className="max-w-4xl mx-auto space-y-12 md:space-y-16 py-6">
                
                <div className="space-y-4 md:space-y-6">
                  <StudioSection 
                    title="Identidade Visual & Origem" 
                    icon="portrait" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceIdentitySection formData={formData} setFormData={setFormData} />
                  </StudioSection>

                  <StudioSection 
                    title="Motor de Influência Existencial" 
                    icon="mindfulness" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceInfluenceSection formData={formData} setFormData={setFormData} />
                  </StudioSection>

                  <StudioSection 
                    title="Essência & Impacto Vital" 
                    icon="psychology" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceEssenceSection essentials={formData.essentials} onChange={(v) => setFormData({...formData, essentials: v})} />
                  </StudioSection>

                  <StudioSection 
                    title="Notas de Valor Humano" 
                    icon="auto_awesome_motion" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceHumanNotesSection notes={formData.humanNotes} onChange={(v) => setFormData({...formData, humanNotes: v})} />
                  </StudioSection>

                  <StudioSection 
                    title="Voz & Pensamento" 
                    icon="format_quote" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceQuotesSection quotes={quotes} setQuotes={setQuotes} />
                  </StudioSection>

                  <StudioSection 
                    title="Trilha de Realização" 
                    icon="account_balance" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceRealizationSection 
                      companies={companies} 
                      setCompanies={setCompanies} 
                      projects={projects} 
                      setProjects={setProjects} 
                    />
                  </StudioSection>

                  <StudioSection 
                    title="Frequência & Sensações" 
                    icon="bolt" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceTraitsSection 
                      characteristics={characteristics} 
                      setCharacteristics={setCharacteristics} 
                      sensations={sensations} 
                      setSensations={setSensations} 
                    />
                  </StudioSection>

                  <StudioSection 
                    title="Universo Vivo" 
                    icon="auto_awesome" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceUniverseSection 
                      livingGallery={livingGallery}
                      setLivingGallery={setLivingGallery}
                      livingContent={livingContent}
                      setLivingContent={setLivingContent}
                      associatedReferences={associatedReferences}
                      setAssociatedReferences={setAssociatedReferences}
                    />
                  </StudioSection>

                  <StudioSection 
                    title="Canais de Conexão" 
                    icon="share" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <PresenceConnectionsSection connections={connections} setConnections={setConnections} />
                  </StudioSection>

                  <StudioSection 
                    title="Anotações Complementares" 
                    icon="edit_note" 
                    isOpen={true} 
                    onToggle={() => {}}
                  >
                    <div className="space-y-4">
                      <StudioLabel>Insights de Fluxo Livre</StudioLabel>
                      <StudioTextArea 
                        placeholder="O que flui livremente sobre esta presença..." 
                        value={formData.freeNotes} 
                        onChange={(v) => setFormData({...formData, freeNotes: v})} 
                      />
                    </div>
                  </StudioSection>
                </div>

                {/* Footer Save - Now part of the scroll flow */}
                <footer className="py-12 flex justify-center border-t border-zinc-50 pt-16 px-4 md:px-0">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="w-full max-w-sm py-6 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:bg-black transition-all"
                  >
                    Eternizar Presença
                  </motion.button>
                </footer>
              </div>
            </div>
          </div>

          {/* Film Grain inside studio */}
          <div className="absolute inset-0 pointer-events-none z-[100] opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
