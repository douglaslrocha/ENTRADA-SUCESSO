import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, Compass, Heart, Brain, Zap, Clock, Calendar, 
  Search, Sliders, ChevronDown, Check, ArrowLeft, Plus, MessageSquare, 
  Sparkles, Award, TrendingUp, Filter, AlertCircle, Share2, Eye, FileText, Save,
  Menu, X, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { haptics } from '../services/HapticService';
import { db as financeDb } from '../services/db'; // used for some hooks/org sync if needed
import { useOrganismSync } from '../hooks/useOrganismSync';
import { energyCatalogService } from '../services/energyCatalogService';
import { organismEventBus } from '../services/organismEventBus';

// Since the objectives & tasks are fetched from the backend or local store,
// let's integrate with the API or localStorage to load real data!
interface Task {
  id: string;
  title: string;
  projectId?: string;
  goalId?: string;
  status: 'todo' | 'completed';
  date?: number;
  actualDuration?: number;
  executionType?: 'standard' | 'energy-work';
  energyWorkExecution?: {
    intensity: number;
    technique: string;
    holosomaticImpacts: {
      physical: number;
      energy: number;
      emotional: number;
      mental: number;
    };
    symmetry: number;
    signals: string;
    sensations: string[];
    lucidity: number;
    phenomena: string[];
  };
}

interface DiaryEntry {
  id: string;
  title: string;
  date?: number;
  createdAt?: number;
  content?: string;
  energy?: string[];
  mental?: string[];
  emotion?: string[];
  posture?: string[];
  dreams?: any[];
  daySynthesis?: {
    notes?: string;
    vibeRating?: number;
  };
}

export default function AmparoPage({ onToggleSidebar, theme }: { onToggleSidebar: () => void; theme: 'light' | 'dark' }) {
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'signals' | 'practices' | 'grid_records' | 'paper_sheet'>('overview');
  
  // Data State
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [energyTasks, setEnergyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick EV logger state
  const [showEVModal, setShowEVModal] = useState(false);
  const [isGlobalEditActive, setIsGlobalEditActive] = useState(false);
  const [evIntensity, setEvIntensity] = useState(5);
  const [evSymmetry, setEvSymmetry] = useState(3);
  const [evLucidity, setEvLucidity] = useState(3);
  const [evTechnique, setEvTechnique] = useState('ev');
  const [evNotes, setEvNotes] = useState('');
  const [evSensations, setEvSensations] = useState<string[]>([]);
  const [evPhenomena, setEvPhenomena] = useState<string[]>([]);

  // Dynamic Sensations and Phenomena Options linked to LocalStorage
  const DEFAULT_SENSATIONS = [
    'Parestesia', 'Calafrio benigno', 'Vassouramento energético', 'Presença amparadora', 
    'Expansibilidade', 'Balonamento', 'Mini-decolagem', 'EV espontâneo', 'Sonoridades intracranianas',
    'Vibração', 'Calor', 'Frio', 'Leveza', 'Expansão', 'Pulsação', 'Formigamento'
  ];

  const DEFAULT_PHENOMENA = [
    'Absorção de Energia', 'Exteriorização de Energia', 'Estado Vibracional (EV)', 
    'Projeção Lúcida', 'Clarividência Espontânea', 'Intuição Amparadora', 'Acoplamento Áurico',
    'Clarividência', 'Projeção', 'Pangrafia', 'Psicometria', 'Autofania'
  ];

  const DEFAULT_FATUISTICA = [
    { value: 'ev', label: 'Circularização de Energias (EV)' },
    { value: 'absorcao', label: 'Absorção de Energias' },
    { value: 'exteriorizacao', label: 'Exteriorização Cosmoconstante' },
    { value: 'tenepes', label: 'Pesquisa Assistencial / Equipe' },
    { value: 'consciencia_cosmica', label: 'Consciência Cósmica (Cosmoconsciência)' },
    { value: 'fenomenos_registrados', label: 'Fenômenos Registrados (Autopesquisa)' },
    { value: 'fenomenos_externos', label: 'Fenômenos Externos (Parafatos)' },
    { value: 'desassim', label: 'Desassimilação Simpática (Desassim)' },
    { value: 'projecao_lucida', label: 'Projeção Lúcida (Projeciologia)' },
    { value: 'acoplamento', label: 'Acoplamento Interconsciencial' },
    { value: 'auto_retrocognicao', label: 'Auto-retrocognição (Memória Holosomática)' }
  ];

  const [customSensations, setCustomSensations] = useState<string[]>([]);

  const [customPhenomena, setCustomPhenomena] = useState<string[]>([]);

  const [customFatuistica, setCustomFatuistica] = useState<string[]>([]);

  useEffect(() => {
    // Carrega dados iniciais da VPS
    energyCatalogService.getCatalog().then(data => {
      setCustomSensations(data.sensations);
      setCustomPhenomena(data.phenomena);
      setCustomFatuistica(data.fatuistica);
    });

    // Escuta por atualizações de outras partes do sistema
    const unsub = organismEventBus.subscribe('energyCatalogUpdated', () => {
      energyCatalogService.getCatalog().then(data => {
        setCustomSensations(data.sensations);
        setCustomPhenomena(data.phenomena);
        setCustomFatuistica(data.fatuistica);
      });
    });
    return () => unsub();
  }, []);


  const sensationsOptions = customSensations.map((cs, idx) => ({ id: `s_${idx}`, label: cs, isDefault: false }));

  const phenomenaOptions = customPhenomena.map((cp, idx) => ({ id: `p_${idx}`, label: cp, isDefault: false }));

  const fatuisticaOptions = customFatuistica.map((cf, idx) => ({ value: cf, label: cf, isDefault: false }));

  const [newSensationInput, setNewSensationInput] = useState('');
  const [showNewSensationInput, setShowNewSensationInput] = useState(false);
  
  const [newPhenomenonInput, setNewPhenomenonInput] = useState('');
  const [showNewPhenomenonInput, setShowNewPhenomenonInput] = useState(false);

  const [newFatuisticaInput, setNewFatuisticaInput] = useState('');
  const [showNewFatuisticaInput, setShowNewFatuisticaInput] = useState(false);

  // Diary linkage state
  const [selectedDiaryId, setSelectedDiaryId] = useState<string>('auto_today');

  // Comparison State
  const [compareDayA, setCompareDayA] = useState<string>('');
  const [compareDayB, setCompareDayB] = useState<string>('');

  // Search and filters
  const [searchSignal, setSearchSignal] = useState('');
  const [selectedPhenomenonFilter, setSelectedPhenomenonFilter] = useState<string>('');

  // Editing and Continuous Document States
  const [editingTitles, setEditingTitles] = useState<Record<string, string>>({});
  const [editingContents, setEditingContents] = useState<Record<string, string>>({});
  const [editingEnergies, setEditingEnergies] = useState<Record<string, string[]>>({});
  const [editingMentals, setEditingMentals] = useState<Record<string, string[]>>({});
  const [editingEmotions, setEditingEmotions] = useState<Record<string, string[]>>({});
  const [editingPostures, setEditingPostures] = useState<Record<string, string[]>>({});

  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
  const [sheetSearch, setSheetSearch] = useState('');
  const [gridSearch, setGridSearch] = useState('');
  const [sheetSortOrder, setSheetSortOrder] = useState<'asc' | 'desc'>('desc');

  // Custom non-blocking inline editors for tags
  const [editingSensation, setEditingSensation] = useState<string | null>(null);
  const [editingSensationValue, setEditingSensationValue] = useState<string>('');

  const [editingPhenomenon, setEditingPhenomenon] = useState<string | null>(null);
  const [editingPhenomenonValue, setEditingPhenomenonValue] = useState<string>('');

  const [editingFatuistica, setEditingFatuistica] = useState<string | null>(null);
  const [editingFatuisticaValue, setEditingFatuisticaValue] = useState<string>('');

  // AI Conscienciologia state
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('amparo_ai_synthesis');
    if (cached) {
      try {
        setAiSynthesis(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleGenerateAiSynthesis = async () => {
    haptics.mediumClick();
    setIsGeneratingAi(true);
    try {
      const userId = localStorage.getItem('userId') || 'default';
      const res = await fetch('/api/diary/amparo/synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.synthesis) {
          setAiSynthesis(data.synthesis);
          localStorage.setItem('amparo_ai_synthesis', JSON.stringify(data.synthesis));
        }
      }
    } catch (err) {
      console.error('Erro na síntese inteligente:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Predefined Tags options for direct checklists
  const energyOptionTags = [
    'Absorção de Energia', 'Exteriorização de Energia', 'Estado Vibracional (EV)', 
    'Acoplamento Áurico', 'Labilidade Energética', 'Vitalidade Plena', 'Bloqueio Energético', 'Desassimilação'
  ];
  const mentalOptionTags = [
    'Discernimento Alto', 'Foco Autopesquisa', 'Dispersão Mental', 
    'Inspiração Parapsíquica', 'Calbínio Retentor', 'Saturação Mental', 'Hiperacuidade', 'Lucidez Existencial'
  ];
  const emotionOptionTags = [
    'Serenidade Consciencial', 'Vibe Harmoniosa', 'Ansiedade', 
    'Melancolia Extrafísica', 'Fraternidade Ativa', 'Instabilidade Emocional', 'Euforia Evolutiva', 'Autocontrole'
  ];
  const postureOptionTags = [
    'Cosmoética Prática', 'Abertura Assistencial', 'Autodiscernimento', 
    'Autoindulgência', 'Pesquisa Científica', 'Egocentrismo', 'Universalismo', 'Escrita Lúcida'
  ];

  const dStripTags = (html: string): string => {
    return html.replace(/<[^>]*>/g, '').trim();
  };

  const toggleTagInEditingState = (dId: string, tag: string, category: 'energy' | 'mental' | 'emotion' | 'posture', currentList: string[]) => {
    const updatedList = currentList.includes(tag)
      ? currentList.filter(item => item !== tag)
      : [...currentList, tag];

    if (category === 'energy') {
      setEditingEnergies(prev => ({ ...prev, [dId]: updatedList }));
    } else if (category === 'mental') {
      setEditingMentals(prev => ({ ...prev, [dId]: updatedList }));
    } else if (category === 'emotion') {
      setEditingEmotions(prev => ({ ...prev, [dId]: updatedList }));
    } else if (category === 'posture') {
      setEditingPostures(prev => ({ ...prev, [dId]: updatedList }));
    }
  };

  const handleSaveDiaryEntry = async (dId: string) => {
    haptics.mediumClick();
    setSavingEntryId(dId);
    try {
      const userId = localStorage.getItem('userId') || 'default';
      const currentEntry = diaries.find(d => d.id === dId);
      if (!currentEntry) return;

      const payload = {
        ...currentEntry,
        title: editingTitles[dId] !== undefined ? editingTitles[dId] : (currentEntry.title || ''),
        content: editingContents[dId] !== undefined ? editingContents[dId] : (currentEntry.content || ''),
        energy: editingEnergies[dId] !== undefined ? editingEnergies[dId] : (currentEntry.energy || []),
        mental: editingMentals[dId] !== undefined ? editingMentals[dId] : (currentEntry.mental || []),
        emotion: editingEmotions[dId] !== undefined ? editingEmotions[dId] : (currentEntry.emotion || []),
        posture: editingPostures[dId] !== undefined ? editingPostures[dId] : (currentEntry.posture || []),
      };

      const res = await fetch(`/api/diary/${dId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSaveSuccessId(dId);
        setTimeout(() => setSaveSuccessId(null), 3000);
        
        // Refresh local memory and statistics
        const checkRes = await fetch('/api/diary', {
          headers: { 'x-user-id': userId }
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData && checkData.entries) {
            setDiaries(checkData.entries);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao salvar diário:', err);
    } finally {
      setSavingEntryId(null);
    }
  };

  // Fetch data on mount
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Diaries
      const userId = localStorage.getItem('userId') || 'default';
      const response = await fetch('/api/diary', {
        headers: { 'x-user-id': userId }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.entries) {
          setDiaries(data.entries);
          if (data.entries.length >= 2) {
            setCompareDayA(data.entries[0].id);
            setCompareDayB(data.entries[1].id);
          } else if (data.entries.length === 1) {
            setCompareDayA(data.entries[0].id);
          }
        }
      }

      // 2. Fetch Tasks (from Objectives system) to get energy-work records
      const objectivesRes = await fetch('/api/objectives', {
        headers: { 'x-user-id': userId }
      });
      if (objectivesRes.ok) {
        const objData = await objectivesRes.json();
        if (objData && objData.tasks) {
          const finishedEnergyTasks = (objData.tasks as Task[]).filter(
            t => t.executionType === 'energy-work' && t.status === 'completed'
          );
          setEnergyTasks(finishedEnergyTasks);
        }
      }
    } catch (error) {
      console.error('[AmparoPage] Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync when notifications or bus triggers update
  useOrganismSync(['diaryUpdated', 'goalUpdated'], () => {
    loadData();
  });

  const handleCreateQuickEV = async () => {
    haptics.mediumClick();
    try {
      const userId = localStorage.getItem('userId') || 'default';
      
      const newEVTask: Partial<Task> = {
        id: 'ev_' + Date.now(),
        title: `Paradiretrize de Fatuística: ${evTechnique.toUpperCase()}`,
        status: 'completed',
        date: Date.now(),
        executionType: 'energy-work',
        energyWorkExecution: {
          intensity: evIntensity,
          technique: evTechnique,
          holosomaticImpacts: {
            physical: Math.min(evIntensity, 4),
            energy: evIntensity,
            emotional: Math.max(1, 4),
            mental: evIntensity
          },
          symmetry: evSymmetry,
          signals: evNotes,
          sensations: evSensations,
          lucidity: evLucidity,
          phenomena: evPhenomena
        }
      };

      // 1. Put task
      const res = await fetch(`/api/tasks/${newEVTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(newEVTask)
      });

      if (!res.ok) {
        throw new Error('Erro ao salvar o registro técnico de Fatuística');
      }

      // 2. Dynamic Diary Linking
      let targetDiaryId = selectedDiaryId;

      if (selectedDiaryId === 'auto_today') {
        const todayStr = new Date().toLocaleDateString('pt-BR');
        const todayDiary = diaries.find(d => {
          const dDate = new Date(d.date || d.createdAt || 0);
          return dDate.toLocaleDateString('pt-BR') === todayStr;
        });

        if (todayDiary) {
          targetDiaryId = todayDiary.id;
        } else {
          // Auto create today's diary entry to keep the phenomena record linked!
          const newId = 'diary_' + Date.now();
          const newDiary = {
            id: newId,
            title: `Diário de Bordo - ${todayStr}`,
            createdAt: Date.now(),
            date: Date.now(),
            content: `Fenômenos e Fatuística relativos ao dia de hoje (${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}):\n\nTécnica: ${evTechnique.toUpperCase()}\nVolume de Bioenergias: ${evIntensity}/10\nSinaléticas de Sinalética: ${evSensations.join(', ')}\nFenômenos Parapsíquicos: ${evPhenomena.join(', ')}\n\nRelato: ${evNotes || 'Nenhum insight documentado ainda.'}`,
            energy: evSensations,
            emotion: ['Serenidade Consciencial'],
            mental: ['Lucidez Existencial'],
            posture: ['Cosmoética Prática']
          };

          const createRes = await fetch(`/api/diary/${newId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify(newDiary)
          });
          if (createRes.ok) {
            targetDiaryId = newId;
          }
        }
      }

      if (targetDiaryId !== 'none' && targetDiaryId !== 'auto_today') {
        // Encontra o diário e une os dados
        const getDiaryRes = await fetch(`/api/diary/${targetDiaryId}`, {
          headers: { 'x-user-id': userId }
        });
        if (getDiaryRes.ok) {
          const diaryData = await getDiaryRes.json();
          if (diaryData && diaryData.entry) {
            const entry = diaryData.entry;
            
            // Une os fenômenos (tags)
            const nEnergies = Array.from(new Set([...(entry.energy || []), ...evSensations]));
            const nMental = Array.from(new Set([...(entry.mental || []), 'Lucidez Existencial']));
            const nPosture = Array.from(new Set([...(entry.posture || []), ...evPhenomena]));
            
            const additionalLog = `\n\n--- [Fatuística & Fenômenos Vinculados — ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}] ---\nTécnica: ${evTechnique.toUpperCase()}\nVolume VBE: ${evIntensity}/10 | Hiperlucidez: ${evLucidity}/5\nSinaléticas: ${evSensations.join(', ')}\nFenômenos: ${evPhenomena.join(', ')}\nRelato / Cognições: ${evNotes || 'Sem relato adicional.'}`;
            const nContent = (entry.content || '') + additionalLog;

            await fetch(`/api/diary/${targetDiaryId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId
              },
              body: JSON.stringify({
                ...entry,
                energy: nEnergies,
                mental: nMental,
                posture: nPosture,
                content: nContent
              })
            });
          }
        }
      }

      setShowEVModal(false);
      setEvNotes('');
      setEvSensations([]);
      setEvPhenomena([]);
      setSelectedDiaryId('auto_today');
      loadData();
    } catch (err) {
      console.error('Erro ao salvar prática integrada:', err);
    }
  };

  const toggleSensation = (sensName: string) => {
    setEvSensations(prev => 
      prev.includes(sensName) ? prev.filter(s => s !== sensName) : [...prev, sensName]
    );
  };

  const togglePhenomenon = (phenName: string) => {
    setEvPhenomena(prev => 
      prev.includes(phenName) ? prev.filter(p => p !== phenName) : [...prev, phenName]
    );
  };

  const addCustomSensation = () => {
    const val = newSensationInput.trim();
    if (val && !DEFAULT_SENSATIONS.includes(val) && !customSensations.includes(val)) {
      const updated = [...customSensations, val];
      setCustomSensations(updated);
      energyCatalogService.updateCatalog('sensations', updated);
      
      setEvSensations(prev => [...prev, val]);
      setNewSensationInput('');
      setShowNewSensationInput(false);
    }
  };

  const handleEditSensation = (oldVal: string) => {
    setEditingSensation(oldVal);
    setEditingSensationValue(oldVal);
  };

  const handleSaveSensation = (oldVal: string, newVal: string) => {
    const val = newVal.trim();
    if (val && val !== oldVal) {
      const updated = customSensations.map(s => s === oldVal ? val : s);
      setCustomSensations(updated);
      energyCatalogService.updateCatalog('sensations', updated);
      
      if (evSensations.includes(oldVal)) {
        setEvSensations(prev => prev.map(s => s === oldVal ? val : s));
      }
    }
    setEditingSensation(null);
  };

  const handleDeleteSensation = (val: string) => {
    const updated = customSensations.filter(s => s !== val);
    setCustomSensations(updated);
    energyCatalogService.updateCatalog('sensations', updated);
    
    setEvSensations(prev => prev.filter(s => s !== val));
  };

  const addCustomPhenomenon = () => {
    const val = newPhenomenonInput.trim();
    if (val && !DEFAULT_PHENOMENA.includes(val) && !customPhenomena.includes(val)) {
      const updated = [...customPhenomena, val];
      setCustomPhenomena(updated);
      energyCatalogService.updateCatalog('phenomena', updated);
      
      setEvPhenomena(prev => [...prev, val]);
      setNewPhenomenonInput('');
      setShowNewPhenomenonInput(false);
    }
  };

  const handleEditPhenomenon = (oldVal: string) => {
    setEditingPhenomenon(oldVal);
    setEditingPhenomenonValue(oldVal);
  };

  const handleSavePhenomenon = (oldVal: string, newVal: string) => {
    const val = newVal.trim();
    if (val && val !== oldVal) {
      const updated = customPhenomena.map(s => s === oldVal ? val : s);
      setCustomPhenomena(updated);
      energyCatalogService.updateCatalog('phenomena', updated);
      
      if (evPhenomena.includes(oldVal)) {
        setEvPhenomena(prev => prev.map(s => s === oldVal ? val : s));
      }
    }
    setEditingPhenomenon(null);
  };

  const handleDeletePhenomenon = (val: string) => {
    const updated = customPhenomena.filter(s => s !== val);
    setCustomPhenomena(updated);
    energyCatalogService.updateCatalog('phenomena', updated);
    
    setEvPhenomena(prev => prev.filter(s => s !== val));
  };

  const addCustomFatuistica = () => {
    const trimmed = newFatuisticaInput.trim();
    if (trimmed && !DEFAULT_FATUISTICA.some(opt => opt.label.toLowerCase() === trimmed.toLowerCase()) && !customFatuistica.includes(trimmed)) {
      const updated = [...customFatuistica, trimmed];
      setCustomFatuistica(updated);
      energyCatalogService.updateCatalog('fatuistica', updated);
      
      setEvTechnique(trimmed);
      setNewFatuisticaInput('');
      setShowNewFatuisticaInput(false);
    }
  };

  const handleEditFatuistica = (oldVal: string) => {
    setEditingFatuistica(oldVal);
    setEditingFatuisticaValue(oldVal);
  };

  const handleSaveFatuistica = (oldVal: string, newVal: string) => {
    const val = newVal.trim();
    if (val && val !== oldVal) {
      const updated = customFatuistica.map(s => s === oldVal ? val : s);
      setCustomFatuistica(updated);
      energyCatalogService.updateCatalog('fatuistica', updated);
      
      if (evTechnique === oldVal) {
        setEvTechnique(val);
      }
    }
    setEditingFatuistica(null);
  };

  const handleDeleteFatuistica = (val: string) => {
    const updated = customFatuistica.filter(s => s !== val);
    setCustomFatuistica(updated);
    energyCatalogService.updateCatalog('fatuistica', updated);
    
    if (evTechnique === val) {
      setEvTechnique('ev');
    }
  };

  // Aggregated calculations
  const totalEVs = energyTasks.length;
  const avgIntensity = totalEVs > 0 
    ? (energyTasks.reduce((acc, t) => acc + (t.energyWorkExecution?.intensity || 0), 0) / totalEVs).toFixed(1)
    : '0';
  const avgLucidity = totalEVs > 0 
    ? (energyTasks.reduce((acc, t) => acc + (t.energyWorkExecution?.lucidity || 1), 0) / totalEVs).toFixed(1)
    : '0';

  // Extract catalog of signals & phenomena found in completed tasks & diaries
  const allSignals: { text: string; source: string; date: number; intensity?: number }[] = [];
  const allRecordedPhenomena: { text: string; date: number; source: string; intensity?: number }[] = [];

  energyTasks.forEach(t => {
    if (t.energyWorkExecution?.signals) {
      allSignals.push({
        text: t.energyWorkExecution.signals,
        source: t.title,
        date: t.date || Date.now(),
        intensity: t.energyWorkExecution.intensity
      });
    }
    if (t.energyWorkExecution?.phenomena) {
      t.energyWorkExecution.phenomena.forEach(p => {
        allRecordedPhenomena.push({
          text: p,
          date: t.date || Date.now(),
          source: t.title,
          intensity: t.energyWorkExecution?.intensity
        });
      });
    }
  });

  diaries.forEach(d => {
    // If we have postural interferences or other items we can append
    if (d.posture && d.posture.length > 0) {
      d.posture.forEach(p => {
        allSignals.push({
          text: `Postura Consciencial: ${p}`,
          source: `Diário: ${d.title}`,
          date: d.date || d.createdAt || Date.now()
        });
      });
    }
    if (d.energy && d.energy.length > 0) {
      d.energy.forEach(e => {
        allSignals.push({
          text: `Sinal Energossoma: ${e}`,
          source: `Diário: ${d.title}`,
          date: d.date || d.createdAt || Date.now()
        });
      });
    }
  });

  // Filter signals based on search
  const filteredSignals = allSignals.filter(s => 
    s.text.toLowerCase().includes(searchSignal.toLowerCase()) || 
    s.source.toLowerCase().includes(searchSignal.toLowerCase())
  );

  // Compare Days Data
  const dayA = diaries.find(d => d.id === compareDayA);
  const dayB = diaries.find(d => d.id === compareDayB);

  const formatShortDate = (timestamp?: number) => {
    if (!timestamp) return 'Sem data';
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div id="amparo-layout-root" className={`min-h-screen font-sans overflow-x-hidden antialiased transition-colors duration-300 ${
      isDark ? 'bg-neutral-black text-[#eaeaea]' : 'bg-[#f6f8fb] text-slate-800'
    }`}>
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[150px] rounded-full ${isDark ? 'bg-indigo-500/[0.03]' : 'bg-indigo-500/[0.05]'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[150px] rounded-full ${isDark ? 'bg-emerald-500/[0.03]' : 'bg-emerald-500/[0.05]'}`} />
        <div className={`absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] ${isDark ? 'opacity-100' : 'opacity-30'}`} />
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        {/* Navigation & Header */}
        <header className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 sm:pb-5 border-b mb-6 sm:mb-8 md:mb-12 ${
          isDark ? 'border-neutral-white/10' : 'border-slate-200'
        }`}>
          {/* Top Row: Back Button + Title + Mobile Menu */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-4 pb-[9px] pl-[8px] pt-[6px] sm:pb-0 sm:pl-0 sm:pt-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button 
                onClick={() => {
                  haptics.lightClick();
                  navigate('/');
                }}
                className={`group flex items-center justify-center p-2.5 sm:p-3 rounded-full border active:scale-95 transition-all ${
                  isDark 
                    ? 'bg-neutral-white/[0.02] hover:bg-neutral-white/5 border-neutral-white/10 text-[#888] hover:text-[#fff]' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
                }`}
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-1" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 animate-pulse shrink-0" />
                  <span className={`text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>CENTRAL DE AMPARO</span>
                </div>
                <h1 className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter font-headline leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Laboratório <span className="text-indigo-500">Multidimensional</span>
                </h1>
              </div>
            </div>

            {/* Menu Button - Mobile Only inside Top Row */}
            <button 
              onClick={onToggleSidebar}
              className={`flex sm:hidden items-center justify-center p-2.5 rounded-full border transition-all active:scale-95 ${
                isDark 
                  ? 'bg-neutral-white/[0.02] border-neutral-white/10 text-[#888] hover:text-[#fff]' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
              }`}
            >
              <Menu className="w-4 h-4 text-zinc-500 hover:text-indigo-500" />
            </button>
          </div>

          {/* Action Row: Registrar Fenômenos + Desktop Menu */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <motion.button 
              onClick={() => {
                haptics.mediumClick();
                setShowEVModal(true);
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              animate={{ 
                boxShadow: [
                  "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)",
                  "0 10px 25px -3px rgba(16, 185, 129, 0.45), 0 4px 12px -2px rgba(16, 185, 129, 0.3)",
                  "0 10px 15px -3px rgba(99, 102, 241, 0.3), 0 4px 6px -2px rgba(99, 102, 241, 0.2)"
                ],
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                boxShadow: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                backgroundPosition: { repeat: Infinity, duration: 8, ease: "linear" }
              }}
              style={{ backgroundSize: "200% auto" }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-7 sm:py-4 rounded-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 font-extrabold text-xs sm:text-sm text-white cursor-pointer border-none outline-none select-none relative overflow-hidden shadow-lg"
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span className="font-sans font-black tracking-wider uppercase text-[10px] sm:text-xs">Registrar Fenômenos</span>
            </motion.button>
            <button 
              id="global-menu-toggle-btn"
              onClick={onToggleSidebar}
              className={`hidden sm:flex items-center justify-center p-2.5 sm:p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                isDark 
                  ? 'bg-neutral-white/[0.02] border-neutral-white/10 text-[#888] hover:text-[#fff]' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm'
              }`}
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* AI Conscienciologia Evolution Intelligence */}
        <section id="amparo-ai-evolution-panel" className={`border rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 mb-8 md:mb-10 relative overflow-hidden transition-all duration-500 ${
          isDark 
            ? 'bg-[#020305] border-neutral-white/5 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)]' 
            : 'bg-white border-slate-200 text-slate-800 shadow-xl'
        }`}>
          {/* Ambient Cosmic Accents */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -mr-48 -mt-48 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -ml-32 -mb-32" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-10 mb-8 md:mb-12 relative z-10">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                  isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                }`}>
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Sínese Evolutiva Neural
                </div>
                <div className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border text-[8px] sm:text-[9px] font-mono uppercase tracking-widest ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                  Model: Quantum Flash 3.5
                </div>
              </div>
              <h2 className={`text-2xl sm:text-3xl md:text-5xl font-black font-headline tracking-tighter leading-[0.95] ${isDark ? 'text-white' : 'text-slate-950'}`}>
                Sincronização de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-500">Fluxos Multidimensionais</span>
              </h2>
              <p className={`text-xs sm:text-sm md:text-base leading-relaxed max-w-xl ${isDark ? 'text-neutral-white/40' : 'text-slate-605'}`}>
                Nossa inteligência avançada correlaciona seus registros de parapsiquismo, sonhos e práticas energéticas para decodificar o seu atual <span className="font-bold text-indigo-400 italic">Holopensene Dominante</span>.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateAiSynthesis}
              disabled={isGeneratingAi}
              className={`relative group px-6 py-4 sm:px-10 sm:py-5 rounded-[1.25rem] sm:rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 sm:gap-4 cursor-pointer transition-all shrink-0 overflow-hidden ${
                isGeneratingAi 
                  ? 'bg-zinc-900 text-zinc-600 border border-zinc-800' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-t border-indigo-400'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isGeneratingAi ? (
                <>
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  Processar Síntese
                </>
              )}
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {isGeneratingAi ? (
              <motion.div
                key="ai-loading"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-24 flex flex-col items-center justify-center text-center gap-8 border border-dashed border-indigo-500/20 rounded-[2rem] bg-indigo-500/[0.02] relative z-10"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full animate-ping absolute inset-0" />
                  <div className="w-24 h-24 border border-indigo-500/30 rounded-full flex items-center justify-center bg-indigo-500/5">
                    <Activity className="w-10 h-10 text-indigo-500 animate-spin" strokeWidth={1} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className={`text-xl font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Analizando Holossoma...
                  </h4>
                  <div className="flex items-center justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-0" />
                      <span className="text-[8px] font-mono uppercase text-indigo-400">Energossoma</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-150" />
                      <span className="text-[8px] font-mono uppercase text-emerald-400">Mentalsoma</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-300" />
                      <span className="text-[8px] font-mono uppercase text-pink-400">Psicossoma</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : aiSynthesis ? (
              <motion.div
                key="ai-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Result Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Insight Quote Card - Occupies 2 columns */}
                  <div className={`lg:col-span-2 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border relative overflow-hidden group ${
                    isDark ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50/50 border-indigo-100'
                  }`}>
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                      <MessageSquare size={120} strokeWidth={1} className="text-indigo-500" />
                    </div>
                    <div className="relative z-10 space-y-3 sm:space-y-4">
                      <span className={`text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full border inline-block ${
                        isDark ? 'border-indigo-500/30 text-indigo-400' : 'border-indigo-200 text-indigo-700'
                      }`}>
                        Insight Amparador
                      </span>
                      <p className={`text-lg sm:text-xl md:text-3xl font-black font-headline leading-[1.1] italic tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        "{aiSynthesis.vibeConselho}"
                      </p>
                    </div>
                  </div>

                  {/* Rest of analysis cards */}
                  <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col justify-between group transition-all duration-300 ${
                    isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="space-y-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Clock size={18} />
                      </div>
                      <span className={`block font-black text-[10px] sm:text-xs uppercase tracking-widest ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Retrospectiva</span>
                      <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-neutral-white/60' : 'text-slate-700'}`}>
                        {aiSynthesis.retrospectiva}
                      </p>
                    </div>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[60%]" />
                    </div>
                  </div>

                  <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col justify-between group transition-all duration-300 ${
                    isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="space-y-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Activity size={18} />
                      </div>
                      <span className={`block font-black text-[10px] sm:text-xs uppercase tracking-widest ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Estado Atual</span>
                      <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-neutral-white/60' : 'text-slate-700'}`}>
                        {aiSynthesis.estadoAtual}
                      </p>
                    </div>
                    <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[80%]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`md:col-span-2 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col justify-between group transition-all duration-300 ${
                    isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 hover:border-purple-500/30' : 'bg-slate-50 border-slate-200 hover:bg-white'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <TrendingUp size={18} />
                        </div>
                        <span className={`block font-black text-[10px] sm:text-xs uppercase tracking-widest ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Diretrizes Evolutivas</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-neutral-white/80' : 'text-slate-700'}`}>
                        {aiSynthesis.futuroAtitude}
                      </p>
                    </div>
                  </div>

                  {/* Scientific Jargon Box */}
                  <div className={`p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col justify-center items-center text-center gap-4 transition-all duration-300 ${
                    isDark ? 'bg-[#000] border-indigo-500/20' : 'bg-slate-900 border-slate-800 text-white shadow-2xl'
                  }`}>
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                      <Brain className="w-5.5 h-5.5 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] ${isDark ? 'text-neutral-white/40' : 'text-slate-400'}`}>Síntese Paradigmática</span>
                      <span className={`text-base sm:text-lg font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 leading-tight`}>
                        {aiSynthesis.sinteseCientifica}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-12 sm:py-20 px-4 flex flex-col items-center justify-center text-center gap-6 border border-dashed border-neutral-white/10 rounded-[1.5rem] sm:rounded-[2rem] bg-neutral-white/[0.01]">
                <div className="relative">
                  <Brain strokeWidth={1} className={`w-10 h-10 sm:w-12 sm:h-12 ${isDark ? 'text-neutral-white/20' : 'text-slate-300'}`} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse blur-[8px] opacity-50" />
                </div>
                <div className="space-y-2">
                  <h4 className={`font-black uppercase tracking-widest text-xs sm:text-sm ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Nenhuma Análise Projetiva Iniciada</h4>
                  <p className={`text-[11px] sm:text-xs max-w-sm mx-auto ${isDark ? 'text-neutral-white/20' : 'text-slate-400'}`}>
                    Para decodificar padrões multidimensionais, necessitamos da sínese dos seus últimos 30 registros de diário e 20 práticas energéticas.
                  </p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateAiSynthesis}
                  className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-xl cursor-pointer"
                >
                  Inicializar Processador
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Top Highlight Stats cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12">
          <div className={`${
            isDark ? 'bg-[#0f1115] border-neutral-white/5' : 'bg-white border-slate-200 shadow-sm'
          } border p-3.5 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden flex flex-col justify-between h-28 sm:h-32 hover:border-indigo-500/30 transition-all`}>
            <div className="absolute top-2 right-2 p-1.5 sm:p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className={`text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-mono line-clamp-1 truncate pr-6 ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Total de Práticas de EV</span>
            <span className={`text-2xl sm:text-4xl font-headline font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalEVs}</span>
          </div>

          <div className={`${
            isDark ? 'bg-[#0f1115] border-neutral-white/5' : 'bg-white border-slate-200 shadow-sm'
          } border p-3.5 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden flex flex-col justify-between h-28 sm:h-32 hover:border-indigo-400/30 transition-all`}>
            <div className="absolute top-2 right-2 p-1.5 sm:p-2 bg-indigo-400/10 text-indigo-400 rounded-lg">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className={`text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-mono line-clamp-1 truncate pr-6 ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Intensidade Média</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-4xl font-headline font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{avgIntensity}</span>
              <span className={`text-[9px] sm:text-xs font-mono ${isDark ? 'text-neutral-white/30' : 'text-slate-400'}`}>/10</span>
            </div>
          </div>

          <div className={`${
            isDark ? 'bg-[#0f1115] border-neutral-white/5' : 'bg-white border-slate-100 shadow-sm'
          } border p-3.5 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden flex flex-col justify-between h-28 sm:h-32 hover:border-emerald-400/30 transition-all`}>
            <div className="absolute top-2 right-2 p-1.5 sm:p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className={`text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-mono line-clamp-1 truncate pr-6 ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Lucidez Média</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-4xl font-headline font-black text-emerald-500">{avgLucidity}</span>
              <span className={`text-[9px] sm:text-xs font-mono ${isDark ? 'text-neutral-white/30' : 'text-slate-400'}`}>/5</span>
            </div>
          </div>

          <div className={`${
            isDark ? 'bg-[#0f1115] border-neutral-white/5' : 'bg-white border-slate-200 shadow-sm'
          } border p-3.5 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden flex flex-col justify-between h-28 sm:h-32 hover:border-purple-400/30 transition-all`}>
            <div className="absolute top-2 right-2 p-1.5 sm:p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <span className={`text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest font-mono line-clamp-1 truncate pr-6 ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>Fenômenos Catalogados</span>
            <span className={`text-2xl sm:text-4xl font-headline font-black ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>{allRecordedPhenomena.length}</span>
          </div>
        </section>


        {/* Main Interactive Navigation Tabs */}
        <section className={`flex border-b gap-2 sm:gap-4 mb-8 md:mb-10 overflow-x-auto pb-px custom-scrollbar scrollbar-none ${
          isDark ? 'border-neutral-white/5' : 'border-slate-200'
        }`}>
          {[
            { id: 'overview', label: 'Dashboard Holossoma', icon: Activity },
            { id: 'comparison', label: 'Análise de Delta', icon: TrendingUp },
            { id: 'signals', label: 'Sinalética Gnosiana', icon: Zap },
            { id: 'practices', label: 'Log de Bioenergias', icon: Sliders },
            { id: 'grid_records', label: 'Matriz Periódica', icon: Menu },
            { id: 'paper_sheet', label: 'Folha de Pesquisador', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => { haptics.lightClick(); setActiveTab(tab.id as any); }}
                className={`flex items-center gap-2 px-4 py-3.5 sm:px-6 sm:py-5 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] border-b-2 transition-all whitespace-nowrap cursor-pointer relative group ${
                  isActive 
                    ? isDark ? 'border-indigo-500 text-white' : 'border-indigo-600 text-indigo-700'
                    : isDark ? 'border-transparent text-neutral-white/30 hover:text-white hover:border-neutral-white/10' : 'border-transparent text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-500' : ''}`} />
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="tab-active-glow"
                    className="absolute inset-0 bg-indigo-500/5 blur-xl -z-10"
                  />
                )}
              </button>
            );
          })}
        </section>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-neutral-white/40"
            >
              <Activity className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
              <span>Sincronizando registros holossomáticos...</span>
            </motion.div>
          ) : (
            <>
              {/* Tab 1: Overview Dashboard */}
              {activeTab === 'overview' && (
                <motion.div 
                  key="tab-overview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* The Holosoma Model - Interactive Evolution */}
                    <div className={`lg:col-span-2 border rounded-[1.5rem] sm:rounded-3xl p-4 sm:p-6 md:p-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden group ${
                      isDark 
                        ? 'bg-[#050608] border-neutral-white/5 text-white shadow-[0_20px_80px_rgba(0,0,0,0.8)]' 
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                    }`}>
                      {/* Decorative Background Element */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                      
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                              <Activity className="w-5.5 h-5.5 text-indigo-400" />
                            </div>
                            <div>
                              <h3 className={`text-lg sm:text-xl md:text-2xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Comitê de Veículos do Holossoma
                              </h3>
                              <p className={`text-[10px] sm:text-xs font-mono uppercase tracking-widest ${isDark ? 'text-neutral-white/30' : 'text-slate-400'}`}>
                                Monitoramento de Multidimensionabilidade
                              </p>
                            </div>
                          </div>
                          <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 sm:gap-2 shrink-0 self-start sm:self-auto ${
                            isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Sincronia Consciencial: 98%
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                          {/* SOMA */}
                          <motion.div 
                            whileHover={{ y: -4, scale: 1.01 }}
                            className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                              isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5 hover:border-emerald-500/30' : 'bg-slate-50 border-slate-200/60'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-start gap-3 sm:gap-4 h-full">
                              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg sm:rounded-xl shrink-0">
                                <Zap className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5 mb-1">
                                  <span className={`block font-black text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>SOMA</span>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-emerald-500 opacity-80 truncate">Homeostase</span>
                                </div>
                                <span className={`block text-[11px] leading-relaxed ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                                  Vínculo intrafísico. Manutenção biológica e base para projeção.
                                </span>
                                <div className="mt-3 flex items-center gap-1.5">
                                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-400 w-[85%]" />
                                  </div>
                                  <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400">85%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* ENERGOSSOMA */}
                          <motion.div 
                            whileHover={{ y: -4, scale: 1.01 }}
                            className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                              isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-200/60'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-start gap-3 sm:gap-4 h-full">
                              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg sm:rounded-xl shrink-0">
                                <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5 mb-1">
                                  <span className={`block font-black text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>ENERGOSSOMA</span>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-indigo-400 opacity-80 truncate">EV Ativo</span>
                                </div>
                                <span className={`block text-[11px] leading-relaxed ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                                  Duplo etérico. Ponte vibratória e assepsia energética diária.
                                </span>
                                <div className="mt-3 flex items-center gap-1.5">
                                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 w-[72%]" />
                                  </div>
                                  <span className="text-[9px] sm:text-[10px] font-mono text-indigo-400">72%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* PSICOSSOMA */}
                          <motion.div 
                            whileHover={{ y: -4, scale: 1.01 }}
                            className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                              isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5 hover:border-pink-500/30' : 'bg-slate-50 border-slate-200/60'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-start gap-3 sm:gap-4 h-full">
                              <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-lg sm:rounded-xl shrink-0">
                                <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5 mb-1">
                                  <span className={`block font-black text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>PSICOSSOMA</span>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-pink-400 opacity-80 truncate">Estável</span>
                                </div>
                                <span className={`block text-[11px] leading-relaxed ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                                  Corpo das emoções. Veículo para projeções extrafísicas lúcidas.
                                </span>
                                <div className="mt-3 flex items-center gap-1.5">
                                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-pink-400 w-[60%]" />
                                  </div>
                                  <span className="text-[9px] sm:text-[10px] font-mono text-pink-400">60%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>

                          {/* MENTALSOMA */}
                          <motion.div 
                            whileHover={{ y: -4, scale: 1.01 }}
                            className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                              isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5 hover:border-purple-500/30' : 'bg-slate-50 border-slate-200/60'
                            }`}
                          >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.03] rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex items-start gap-3 sm:gap-4 h-full">
                              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg sm:rounded-xl shrink-0">
                                <Compass className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap justify-between items-baseline gap-x-2 gap-y-0.5 mb-1">
                                  <span className={`block font-black text-xs sm:text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>MENTALSOMA</span>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-purple-400 opacity-80 truncate">Hiperlucidez</span>
                                </div>
                                <span className={`block text-[11px] leading-relaxed ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                                  Sede do discernimento. O corpo mental livre da para-anatomia.
                                </span>
                                <div className="mt-3 flex items-center gap-1.5">
                                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-400 w-[95%]" />
                                  </div>
                                  <span className="text-[9px] sm:text-[10px] font-mono text-purple-400">95%</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      </div>

                      <div className={`mt-8 sm:mt-10 pt-5 border-t flex flex-wrap items-center justify-between gap-4 text-[10px] sm:text-xs ${
                        isDark ? 'border-neutral-white/5 text-neutral-white/30' : 'border-slate-100 text-slate-400'
                      }`}>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                          <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-indigo-400 shrink-0" /> Blindagem Holopensênica</span>
                          <span className="flex items-center gap-1.5"><Compass className="w-3 h-3 text-purple-400 shrink-0" /> Foco Evoluciológico</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>DATABASE: HOLOSSONDA ACTIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Guidance Card */}
                    <div className={`border rounded-[1.5rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 flex flex-col justify-between transition-all duration-300 ${
                      isDark 
                        ? 'bg-gradient-to-br from-indigo-950/20 to-zinc-950 border-indigo-500/10 text-white' 
                        : 'bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border-indigo-200 text-slate-800 shadow-md'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-5 h-5 text-indigo-500" />
                          <h3 className={`text-lg sm:text-xl font-black font-headline ${isDark ? 'text-white' : 'text-indigo-950 font-black'}`}>Auto-Diretrizes</h3>
                        </div>
                        <p className={`text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 ${isDark ? 'text-neutral-white/50' : 'text-slate-650'}`}>
                          Para desenvolver o autoconhecimento parapsíquico e a projetabilidade lúcida (PL), mantenha uma postura ativa através do EV Diário espontâneo. Anote reações energéticas em seus diários para correlacionar o seu estresse com as pressões do holofote pensênico ("holopensene").
                        </p>

                        <div className="space-y-3">
                          <div className={`flex gap-2 text-[11px] sm:text-xs ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                            <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span><strong>Estado Vibracional:</strong> Pratique pelo menos 3x ao dia com foco em circular as energias da cabeça aos pés.</span>
                          </div>
                          <div className={`flex gap-2 text-[11px] sm:text-xs ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                            <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span><strong>Anotação Imediata:</strong> Anote seus insights projetivos no início da manhã. No diário, adicione as opções do Energossoma e Holopensene.</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 sm:mt-8">
                        <span className={`block text-[10px] sm:text-xs mb-2 uppercase tracking-wide ${isDark ? 'text-neutral-white/40' : 'text-slate-400 font-bold'}`}>Amparadora IA Integrada</span>
                        <button 
                          onClick={() => { haptics.lightClick(); navigate('/amparadora'); }}
                          className={`w-full py-2.5 sm:py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            isDark 
                              ? 'bg-neutral-white/[0.03] hover:bg-neutral-white/5 border-neutral-white/15 text-white' 
                              : 'bg-indigo-650 hover:bg-indigo-700 border-indigo-600 text-white shadow-sm'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Perguntar à Amparadora sobre PL
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Highlights of latest signals */}
                  <div className={`border rounded-[1.5rem] sm:rounded-3xl p-4 sm:p-6 md:p-8 transition-all duration-300 ${
                    isDark ? 'bg-[#0b0c10] border-neutral-white/5 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-md'
                  }`}>
                    <div className="flex items-center justify-between mb-5 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400 shrink-0" />
                        <h3 className={`text-lg sm:text-xl font-black font-headline ${isDark ? 'text-white' : 'text-slate-900 font-black'}`}>Resumo Recente de Sinais</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('signals')}
                        className="text-[10px] sm:text-xs text-indigo-500 hover:text-indigo-600 font-bold tracking-wider uppercase cursor-pointer"
                      >
                        Ver todos
                      </button>
                    </div>

                    {filteredSignals.length === 0 ? (
                      <div className={`text-center py-10 sm:py-12 border border-dashed rounded-2xl ${
                        isDark ? 'border-neutral-white/5 bg-neutral-white/[0.01] text-neutral-white/30' : 'border-slate-200 bg-slate-50 text-slate-450'
                      }`}>
                        <p className="text-xs sm:text-sm px-4">Nenhum sinal ou postura consciencial registrado ainda nas suas práticas de EV ou diários.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {filteredSignals.slice(0, 6).map((sig, i) => (
                          <div key={i} className={`p-3.5 sm:p-4 rounded-[1.25rem] border hover:scale-[1.01] transition-all flex flex-col justify-between h-24 sm:h-28 ${
                            isDark 
                              ? 'bg-neutral-white/[0.01] border-neutral-white/10 hover:border-indigo-500/20' 
                              : 'bg-slate-50 border-slate-200/60 hover:border-indigo-300 shadow-sm'
                          }`}>
                            <span className={`text-xs sm:text-[13px] font-medium line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-white/80' : 'text-slate-700'}`}>"{sig.text}"</span>
                            <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[9px] sm:text-[10px] font-mono ${
                              isDark ? 'border-neutral-white/5 text-neutral-white/45' : 'border-slate-200/60 text-slate-400'
                            }`}>
                              <span className="truncate max-w-[120px]" title={sig.source}>{sig.source}</span>
                              <span>{formatShortDate(sig.date)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Compare Days Side-by-Side (Comparative Holosomatology) */}
              {activeTab === 'comparison' && (
                <motion.div 
                  key="tab-comparison"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className={`p-4 sm:p-6 md:p-12 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden ${
                    isDark 
                      ? 'bg-[#050608] border-neutral-white/5 text-white shadow-2xl' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                  }`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-20" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                          </div>
                          <h3 className={`text-lg sm:text-xl md:text-2xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Análise de Sincronograma Delta
                          </h3>
                        </div>
                        <p className={`text-xs sm:text-sm max-w-lg ${isDark ? 'text-neutral-white/40' : 'text-slate-600'}`}>
                          Identifique padrões repetitivos e divergências evolutivas entre dois períodos distinctos de sua autopesquisa.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                         <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border flex flex-col ${isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5' : 'bg-slate-50 border-slate-200'}`}>
                           <span className="text-[8px] font-mono uppercase text-indigo-400">Variação Holofote</span>
                           <span className="text-xs sm:text-sm font-black">+12.4%</span>
                         </div>
                         <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl border flex flex-col ${isDark ? 'bg-neutral-white/[0.02] border-neutral-white/5' : 'bg-slate-50 border-slate-200'}`}>
                           <span className="text-[8px] font-mono uppercase text-emerald-400">Lucidez Delta</span>
                           <span className="text-xs sm:text-sm font-black">+2.1</span>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 md:mb-10">
                      {/* Selectors with more style */}
                      {['A', 'B'].map((label, idx) => (
                        <div key={label} className="space-y-2">
                          <label className={`text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border self-start inline-block ${
                            isDark ? 'border-neutral-white/10 text-neutral-white/40' : 'border-slate-200 text-slate-400'
                          }`}>
                            Ponto de Controle {label}
                          </label>
                          <div className="relative group">
                            <select 
                              value={idx === 0 ? compareDayA : compareDayB}
                              onChange={(e) => { haptics.lightClick(); idx === 0 ? setCompareDayA(e.target.value) : setCompareDayB(e.target.value); }}
                              className={`w-full p-3.5 pl-10 pr-8 sm:p-5 sm:pl-12 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-bold appearance-none outline-none transition-all group-hover:border-indigo-500/50 ${
                                isDark ? 'bg-[#08090c] border-neutral-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                              }`}
                            >
                              <option value="">Selecione um diário...</option>
                              {diaries.map(d => (
                                <option key={d.id} value={d.id}>
                                  {formatShortDate(d.date || d.createdAt)} — {d.title || 'Sem título'}
                                </option>
                              ))}
                            </select>
                            <Calendar className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-indigo-500/40" />
                            <ChevronDown className="absolute right-3.5 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-white/20" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {!dayA || !dayB ? (
                      <div className={`text-center py-16 sm:py-24 border border-dashed rounded-[1.5rem] sm:rounded-[2rem] ${
                        isDark ? 'border-neutral-white/5 bg-neutral-white/[0.01] text-neutral-white/20' : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}>
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-neutral-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-white/10">
                           <Activity className="w-6 h-6 sm:w-8 sm:h-8 opacity-20" />
                        </div>
                        <p className="text-xs sm:text-sm uppercase tracking-widest font-black px-4">Aguardando Parâmetros para Diferenciação</p>
                      </div>
                    ) : (
                      <div className="space-y-8 sm:space-y-12">
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 text-left sm:text-center">
                          {[dayA, dayB].map((day, idx) => (
                            <div key={idx} className="space-y-1 border-l-2 border-indigo-500/20 pl-4 sm:pl-0 sm:border-l-0">
                              <h4 className={`text-base sm:text-xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {day?.title || 'Diário Selecionado'}
                              </h4>
                              <span className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] block ${isDark ? 'text-neutral-white/40' : 'text-slate-500'}`}>
                                {formatShortDate(day?.date || day?.createdAt)}
                              </span>
                            </div>
                          ))}
                        </div>

                         {/* Comparative Matrix Blocks */}
                         <div className="space-y-6">
                            {[
                              { label: 'Energossoma', field: 'energy', color: 'indigo', icon: Zap },
                              { label: 'Mentalsoma', field: 'mental', color: 'purple', icon: Brain },
                              { label: 'Holopensene', field: 'emotion', color: 'pink', icon: Heart },
                              { label: 'Postura', field: 'posture', color: 'orange', icon: Compass },
                            ].map((item) => (
                              <div key={item.field} className="group">
                                <div className="flex items-center gap-2 mb-3">
                                  <item.icon className="w-3.5 h-3.5 text-zinc-500" />
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{item.label}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 group-hover:gap-5 sm:group-hover:gap-10 transition-all duration-500">
                                  <div className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] border relative overflow-hidden transition-all ${
                                    isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 group-hover:border-indigo-500/20' : 'bg-slate-50 border-slate-200'
                                  }`}>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
                                      {dayA?.[item.field as keyof DiaryEntry] ? (
                                        (dayA[item.field as keyof DiaryEntry] as string[]).map((val, i) => (
                                          <span key={i} className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {val}
                                          </span>
                                        ))
                                      ) : <span className="text-zinc-650 italic text-xs">Sem registros</span>}
                                    </div>
                                  </div>

                                  <div className={`p-4 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] border relative overflow-hidden transition-all ${
                                    isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 group-hover:border-emerald-500/20' : 'bg-slate-50 border-slate-200'
                                  }`}>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 relative z-10">
                                      {dayB?.[item.field as keyof DiaryEntry] ? (
                                        (dayB[item.field as keyof DiaryEntry] as string[]).map((val, i) => (
                                          <span key={i} className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {val}
                                          </span>
                                        ))
                                      ) : <span className="text-zinc-650 italic text-xs">Sem registros</span>}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                         </div>

                         {/* Narrative Comparison */}
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-zinc-500/10">
                            {[dayA, dayB].map((day, idx) => (
                              <div key={idx} className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'} italic border-l-2 border-indigo-505/10 pl-3 sm:pl-0 sm:border-l-0`}>
                                "{day?.content ? dStripTags(day.content).substring(0, 300) + '...' : 'Sem narrativa registrada.'}"
                              </div>
                            ))}
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Signals & Phenomena */}
              {activeTab === 'signals' && (
                <motion.div 
                  key="tab-signals"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch lg:items-end justify-between">
                    <div className="space-y-4 w-full lg:max-w-xl">
                       <h3 className={`text-lg sm:text-xl md:text-2xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                         Dossiê de Sinalética Gnosiana
                       </h3>
                       <div className="relative group">
                          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${isDark ? 'text-neutral-white/20 group-focus-within:text-indigo-500' : 'text-slate-400'}`} />
                          <input 
                            type="text" 
                            placeholder="Pesquisar termo específico..."
                            value={searchSignal}
                            onChange={(e) => setSearchSignal(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 sm:pl-12 sm:pr-4 sm:py-4 border rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold outline-none transition-all ${
                              isDark 
                                ? 'bg-[#050608] border-neutral-white/10 text-white focus:border-indigo-500' 
                                : 'bg-white border-slate-200 text-slate-800'
                            }`}
                          />
                       </div>
                    </div>

                    <div className="flex gap-1.5 p-1 sm:p-1.5 bg-neutral-white/5 rounded-xl sm:rounded-2xl border border-neutral-white/5 overflow-x-auto pb-1.5 scrollbar-none max-w-full flex-nowrap self-start sm:self-auto">
                      <button 
                        onClick={() => { haptics.lightClick(); setSelectedPhenomenonFilter(''); }}
                        className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                          selectedPhenomenonFilter === '' ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-white/30 hover:text-white'
                        }`}
                      >
                        Global
                      </button>
                      {phenomenaOptions.slice(0, 3).map(p => (
                        <button 
                          key={p.id}
                          onClick={() => { haptics.lightClick(); setSelectedPhenomenonFilter(p.label); }}
                          className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                            selectedPhenomenonFilter === p.label ? 'bg-indigo-600 text-white shadow-lg' : 'text-neutral-white/30 hover:text-white'
                          }`}
                        >
                          {p.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                     <div className={`p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 ${
                       isDark ? 'bg-[#050608] border-neutral-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'
                     }`}>
                        <div className="flex items-center gap-2.5 mb-5 sm:mb-8">
                          <div className="p-2 bg-indigo-500/10 rounded-xl">
                             <Zap className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-indigo-400" />
                          </div>
                          <h3 className="text-base sm:text-xl font-black font-headline tracking-tight">Sinais Bioenergéticos</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                           {filteredSignals.length === 0 ? (
                             <div className="py-8 sm:py-12 text-center text-zinc-650 italic text-xs sm:text-sm">Sem correspondência.</div>
                           ) : filteredSignals.map((sig, i) => (
                             <motion.div 
                               initial={{ opacity: 0, x: -10 }}
                               animate={{ opacity: 1, x: 0 }}
                               key={i} 
                               className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border relative group transition-all duration-300 ${isDark ? 'bg-neutral-white/[0.01] border-neutral-white/5 hover:bg-indigo-500/[0.02] hover:border-indigo-500/20' : 'bg-slate-50 border-slate-200'}`}
                             >
                               <div className="flex justify-between items-start gap-3 mb-2">
                                  <p className="text-xs sm:text-[13px] font-bold leading-relaxed italic">"{sig.text}"</p>
                                  {sig.intensity && (
                                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold shrink-0">{sig.intensity}/10</span>
                                  )}
                               </div>
                               <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                                  <span className="truncate max-w-[120px] sm:max-w-[150px]">{sig.source}</span>
                                  <span>{formatShortDate(sig.date)}</span>
                               </div>
                             </motion.div>
                           ))}
                        </div>
                     </div>

                     <div className={`p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border transition-all duration-500 ${
                       isDark ? 'bg-[#050608] border-neutral-white/5 text-white shadow-2xl' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                     }`}>
                        <div className="flex items-center gap-2.5 mb-5 sm:mb-8">
                          <div className="p-2 bg-purple-500/10 rounded-xl">
                             <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-purple-400" />
                          </div>
                          <h3 className="text-base sm:text-xl font-black font-headline tracking-tight">Ecorrências Fenomenológicas</h3>
                        </div>

                        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto no-scrollbar pr-1">
                           {allRecordedPhenomena.length === 0 ? (
                             <div className="py-12 text-center text-zinc-600 italic text-sm">Nenhum evento registrado.</div>
                           ) : allRecordedPhenomena
                                .filter(ph => selectedPhenomenonFilter === '' || ph.text === selectedPhenomenonFilter)
                                .map((ph, i) => (
                             <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={i} 
                              className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border flex justify-between items-center transition-all duration-300 ${isDark ? 'bg-[#020305] border-neutral-white/5 hover:border-purple-500/20 shadow-lg' : 'bg-slate-50 border-slate-200'}`}
                             >
                               <div className="space-y-1 min-w-0 pr-2">
                                  <span className="block font-black text-xs sm:text-sm uppercase tracking-wider text-purple-400 truncate">{ph.text}</span>
                                  <span className="block text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase truncate">{ph.source}</span>
                               </div>
                               <div className="text-right shrink-0">
                                  <span className="block text-[9px] sm:text-[10px] font-black text-zinc-400 font-mono">{formatShortDate(ph.date)}</span>
                                  <div className="flex gap-1 mt-1.5 justify-end">
                                    {[1,2,3].map(dot => (
                                      <div key={dot} className={`w-1 h-1 rounded-full ${dot <= (ph.intensity ? ph.intensity / 3 : 1) ? 'bg-purple-500' : 'bg-zinc-800'}`} />
                                    ))}
                                  </div>
                               </div>
                             </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Diary of Energy Work Practices */}
              {activeTab === 'practices' && (
                <motion.div 
                  key="tab-practices"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 px-1">
                     <div className="space-y-1">
                       <h3 className={`text-lg sm:text-xl md:text-2xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Log de Bioenergias</h3>
                       <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Registros técnicos de circularidade energética e assepsia simpática.</p>
                     </div>
                     <button 
                        onClick={() => { haptics.lightClick(); setShowEVModal(true); }}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 text-center flex justify-center"
                     >
                       Nova Prática
                     </button>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                    {energyTasks.length === 0 ? (
                      <div className="py-20 sm:py-32 text-center bg-neutral-white/[0.01] border border-dashed border-neutral-white/10 rounded-[1.5rem] sm:rounded-[3rem] px-4">
                        <Activity size={36} className="mx-auto mb-4 text-zinc-850" strokeWidth={1} />
                        <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-650">Nenhum registro técnico detectado</p>
                      </div>
                    ) : (
                      energyTasks.map(t => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={t.id} 
                          className={`p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 group ${
                            isDark ? 'bg-[#050608] border-neutral-white/5 hover:border-indigo-500/20' : 'bg-white border-slate-200 shadow-xl'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-6 mb-5 sm:mb-8 pb-5 sm:pb-8 border-b border-zinc-500/10">
                            <div className="space-y-2 sm:space-y-3">
                              <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-indigo-500/10 rounded-lg sm:rounded-xl">
                                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                                </div>
                                <h4 className={`text-base sm:text-xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.title}</h4>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                <span className="text-[8px] sm:text-[10px] font-mono text-indigo-500 font-black px-2 py-0.5 sm:px-3 sm:py-1 rounded bg-indigo-500/5 border border-indigo-500/10 uppercase tracking-widest">
                                  ID-PRX: {t.id.split('_').pop()?.substring(0, 8)}
                                </span>
                                <span className={`text-[8px] sm:text-[10px] font-mono ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>TIMESTAMP: {formatShortDate(t.date)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3 self-start lg:self-center">
                                <div className={`px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl border text-[8px] sm:text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                  Técnica: {t.energyWorkExecution?.technique || 'EV'}
                                </div>
                                <div className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                  Finalizado
                                </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                            {[
                              { label: 'Intensidade', value: t.energyWorkExecution?.intensity, max: 10, color: 'indigo' },
                              { label: 'Simetria', value: t.energyWorkExecution?.symmetry, max: 5, color: 'indigo' },
                              { label: 'Lucidez', value: t.energyWorkExecution?.lucidity, max: 5, color: 'emerald' },
                              { label: 'Bioenergia', value: t.energyWorkExecution?.intensity ? Math.round(t.energyWorkExecution.intensity * 0.9) : 0, max: 10, color: 'purple' }
                            ].map((stat, i) => (
                              <div key={i} className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl border flex flex-col gap-1.5 sm:gap-2 ${isDark ? 'bg-[#020305] border-neutral-white/5' : 'bg-slate-50 border-slate-150'}`}>
                                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">{stat.label}</span>
                                <div className="flex items-end gap-1">
                                  <span className="text-xl sm:text-2xl font-black text-indigo-500 font-headline leading-none">{stat.value || 0}</span>
                                  <span className="text-[8px] sm:text-[10px] font-mono text-zinc-650 mb-0.5">/{stat.max}</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1">
                                   <div className="h-full bg-indigo-500" style={{ width: `${((stat.value || 0) / stat.max) * 100}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                             <div className="space-y-2 sm:space-y-4">
                               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Sinalética Específica</span>
                               <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'} italic`}>
                                 "{t.energyWorkExecution?.signals || 'Sem notas de sinalética registrada.'}"
                               </p>
                             </div>
                             <div className="space-y-2 sm:space-y-4">
                               <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fenomenologia</span>
                               <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {(t.energyWorkExecution?.phenomena || []).map((ph, i) => (
                                    <span key={i} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                                      {ph}
                                    </span>
                                  ))}
                                  {(t.energyWorkExecution?.sensations || []).map((se, i) => (
                                    <span key={i} className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                      {se}
                                    </span>
                                  ))}
                               </div>
                             </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 5: Scrollable Day-by-Day Grid */}
              {activeTab === 'grid_records' && (
                <motion.div
                  key="tab-grid-records"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className={`p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 ${
                    isDark ? 'bg-[#050608] border-neutral-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <div className="space-y-1">
                      <h3 className={`text-lg sm:text-xl font-black font-headline tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Matriz Periódica Holossomática</h3>
                      <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Consulta rápida por fragmentos de lucidez cronológica.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:max-w-md">
                      <div className="relative flex-1 group">
                        <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-zinc-600 group-focus-within:text-indigo-400' : 'text-slate-400'}`} />
                        <input 
                          type="text"
                          placeholder="Cruzar dados na matriz..."
                          value={gridSearch}
                          onChange={(e) => setGridSearch(e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 text-[12px] sm:text-[13px] font-bold rounded-xl sm:rounded-2xl border outline-none transition-all ${
                            isDark ? 'bg-[#08090c] border-neutral-white/5 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                          }`}
                        />
                      </div>
                      <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center min-w-[64px] sm:min-w-[70px] shrink-0 ${isDark ? 'bg-neutral-white/[0.01] border-neutral-white/10' : 'bg-slate-50 border-slate-200'}`}>
                         <span className="text-xs sm:text-[11px] font-black text-indigo-400 leading-none">{diaries.length}</span>
                         <span className="text-[7px] font-mono uppercase tracking-widest text-zinc-600 mt-1">NÓDULOS</span>
                      </div>
                    </div>
                  </div>

                  {diaries.length === 0 ? (
                    <div className="text-center py-20 sm:py-32 border border-dashed border-neutral-white/10 rounded-[1.5rem] sm:rounded-[3rem] bg-neutral-white/[0.01] px-4">
                      <FileText className="w-12 h-12 text-zinc-805 mx-auto mb-4" strokeWidth={1} />
                      <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-650">Matriz Vazia: Nenhum registro localizado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {diaries
                        .filter(d => {
                          if (!gridSearch) return true;
                          const tMatch = (d.title || '').toLowerCase().includes(gridSearch.toLowerCase());
                          const cMatch = dStripTags(d.content || '').toLowerCase().includes(gridSearch.toLowerCase());
                          return tMatch || cMatch;
                        })
                        .map(d => (
                          <div 
                            key={d.id} 
                            className={`p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2rem] border flex flex-col justify-between group transition-all duration-500 ${
                              isDark ? 'bg-[#050608] border-neutral-white/5 hover:border-indigo-500/30' : 'bg-white border-slate-200 hover:shadow-2xl'
                            }`}
                          >
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex justify-between items-start gap-3">
                                <div className="space-y-1 min-w-0">
                                   <span className={`text-[8px] sm:text-[9px] font-black font-mono tracking-[0.2em] uppercase block ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>
                                     {formatShortDate(d.date || d.createdAt)}
                                   </span>
                                   <h4 className={`text-base sm:text-lg font-black font-headline tracking-tight leading-tight group-hover:text-indigo-400 transition-colors truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                     {d.title || 'Sem título'}
                                   </h4>
                                </div>
                                {d.daySynthesis?.vibeRating && (
                                  <div className="flex flex-col items-end shrink-0">
                                     <span className="text-indigo-500 text-base sm:text-lg font-black leading-none">{d.daySynthesis.vibeRating}</span>
                                     <span className="text-[7px] font-mono uppercase tracking-widest text-zinc-600">Lucidez</span>
                                  </div>
                                )}
                              </div>
                              
                              <p className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 italic ${isDark ? 'text-zinc-550' : 'text-slate-650'}`}>
                                "{d.content ? dStripTags(d.content) : 'Nenhum resumo escrito.'}"
                              </p>

                              <div className="flex flex-wrap gap-1.5 pt-2">
                                {d.energy?.slice(0, 3).map((e, index) => (
                                  <span key={index} className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-500/5 text-indigo-400/60 border border-indigo-500/10">
                                    {e}
                                  </span>
                                ))}
                                {d.mental?.slice(0, 2).map((m, index) => (
                                  <span key={index} className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-500/5 text-purple-400/60 border border-purple-500/10">
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                haptics.mediumClick();
                                setActiveTab('paper_sheet');
                                setTimeout(() => {
                                  const element = document.getElementById(`paper-entry-${d.id}`);
                                  if (element) {
                                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }
                                }, 150);
                              }}
                              className={`w-full mt-6 sm:mt-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] border transition-all active:scale-95 ${
                                isDark 
                                  ? 'bg-neutral-white/[0.02] hover:bg-indigo-500/10 border-neutral-white/5 text-zinc-400 hover:text-indigo-400' 
                                  : 'bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border-slate-200'
                              }`}
                            >
                              Expandir Manuscrito
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 6: Continuous Single Document View */}
              {activeTab === 'paper_sheet' && (
                <motion.div
                  key="tab-paper-sheet"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-12"
                >
                  {/* Ledger Utility Toolbar */}
                  <div className={`p-4 sm:p-6 rounded-xl sm:rounded-[2rem] border flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 sm:gap-6 ${
                    isDark ? 'bg-[#050608] border-neutral-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
                  }`}>
                    <div className="flex items-center gap-3 sm:gap-4 w-full lg:max-w-md">
                      <div className="p-2 bg-indigo-500/10 rounded-lg sm:rounded-xl shrink-0">
                         <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                      </div>
                      <div className="relative flex-1 group">
                         <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-zinc-600 group-focus-within:text-white' : 'text-slate-400'}`} />
                         <input 
                           type="text" 
                           placeholder="Buscar termo no corpus..." 
                           value={sheetSearch} 
                           onChange={(e) => setSheetSearch(e.target.value)}
                           className={`w-full pl-10 pr-4 py-3 rounded-lg sm:rounded-2xl border text-[12px] sm:text-[13px] font-bold outline-none transition-all ${
                             isDark ? 'bg-[#08090c] border-neutral-white/10 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-indigo-600'
                           }`}
                         />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-6">
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className={`text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Ordenação:</span>
                        <select 
                          value={sheetSortOrder} 
                          onChange={(e) => setSheetSortOrder(e.target.value as 'asc' | 'desc')}
                          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-bold outline-none cursor-pointer flex-1 sm:flex-initial ${
                            isDark ? 'bg-[#08090c] border-neutral-white/5 text-zinc-400' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <option value="desc">Sincronicidade Descendente</option>
                          <option value="asc">Evolução Histórica</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <span className={`text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-slate-400'}`}>Âncora:</span>
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              haptics.lightClick();
                              const element = document.getElementById(`paper-entry-${val}`);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }
                          }}
                          className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl border text-[10px] sm:text-[11px] font-bold outline-none cursor-pointer flex-1 sm:flex-initial ${
                            isDark ? 'bg-[#08090c] border-neutral-white/5 text-zinc-400' : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <option value="">Cronologia...</option>
                          {diaries.map(d => (
                            <option key={d.id} value={d.id}>
                              {formatShortDate(d.date || d.createdAt)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Endless parchments ledger stack */}
                  <div className="space-y-16">
                    {diaries.length === 0 ? (
                      <div className="text-center py-32 border border-dashed border-neutral-white/10 rounded-[3rem] bg-neutral-white/[0.01]">
                        <p className="text-sm font-black uppercase tracking-widest text-zinc-600 italic">O Manuscrito Holossomático está em branco.</p>
                      </div>
                    ) : (
                      diaries
                        .filter(d => {
                          if (!sheetSearch) return true;
                          const tMatch = (d.title || '').toLowerCase().includes(sheetSearch.toLowerCase());
                          const cMatch = dStripTags(d.content || '').toLowerCase().includes(sheetSearch.toLowerCase());
                          return tMatch || cMatch;
                        })
                        .sort((a, b) => {
                          const dateA = a.date || a.createdAt || 0;
                          const dateB = b.date || b.createdAt || 0;
                          return sheetSortOrder === 'asc' ? Number(dateA) - Number(dateB) : Number(dateB) - Number(dateA);
                        })
                        .map(d => {
                          const currentEnergy = editingEnergies[d.id] ?? d.energy ?? [];
                          const currentMental = editingMentals[d.id] ?? d.mental ?? [];
                          const currentEmotion = editingEmotions[d.id] ?? d.emotion ?? [];
                          const currentPosture = editingPostures[d.id] ?? d.posture ?? [];

                          const isSaving = savingEntryId === d.id;
                          const isSaved = saveSuccessId === d.id;

                          return (
                            <motion.div 
                              layout
                              key={d.id}
                              id={`paper-entry-${d.id}`}
                              className={`p-5 sm:p-8 md:p-14 rounded-[1.5rem] sm:rounded-[3rem] border relative scroll-mt-24 transition-all duration-700 group hover:shadow-2xl ${
                                isDark 
                                  ? 'bg-[#050608] border-neutral-white/5 shadow-[0_0_85px_rgba(0,0,0,0.55)]' 
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              {/* Margin line decoration */}
                              <div className={`absolute top-0 bottom-0 left-[6%] sm:left-[8%] w-px border-l border-dashed group-hover:left-[7%] sm:group-hover:left-[9%] transition-all duration-700 pointer-events-none opacity-20 ${
                                isDark ? 'border-indigo-400' : 'border-indigo-600'
                              }`} />

                              <div className="relative z-10 space-y-6 sm:space-y-10 pl-2 sm:pl-0">
                                {/* Header Info */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                                   <div className="space-y-1.5 sm:space-y-2">
                                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                         <span className="text-[8px] sm:text-[10px] font-black font-mono px-2 py-0.5 sm:px-3 sm:py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/10">
                                            LOG-{d.id.split('_').pop()?.substring(0, 6)}
                                         </span>
                                         <span className="text-[8px] sm:text-[10px] font-black font-mono tracking-widest text-zinc-500 uppercase">Entrada Conscienciográfica</span>
                                      </div>
                                      <h4 className={`text-xl sm:text-2xl md:text-3xl font-black font-headline tracking-tighter ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600 transition-colors'}`}>
                                        {formatShortDate(d.date || d.createdAt)}
                                      </h4>
                                   </div>

                                   <button
                                     onClick={() => handleSaveDiaryEntry(d.id)}
                                     disabled={isSaving}
                                     className={`w-full md:w-auto px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 cursor-pointer text-center ${
                                       isSaved
                                         ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                         : isDark
                                           ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/10'
                                           : 'bg-indigo-600 text-white shadow-indigo-500/20'
                                     }`}
                                   >
                                     {isSaving ? 'Sincronizando...' : isSaved ? '✓ Sincronizado' : 'Sincronizar Corpus'}
                                   </button>
                                </div>

                                {/* Title Input */}
                                <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
                                  <label className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Cognição e Síntese</label>
                                  <input 
                                    type="text" 
                                    value={editingTitles[d.id] ?? d.title ?? ''}
                                    onChange={(e) => setEditingTitles(prev => ({ ...prev, [d.id]: e.target.value }))}
                                    placeholder="Tópico Central do Dia..."
                                    className={`w-full text-lg sm:text-2xl font-black bg-transparent border-none outline-none placeholder:text-zinc-700 ${
                                      isDark ? 'text-neutral-white/90' : 'text-slate-900'
                                    }`}
                                  />
                                </div>

                                {/* Main Body Textarea */}
                                <div className="space-y-2 sm:space-y-3">
                                  <label className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Corpus Conscienciográfico</label>
                                  <textarea
                                    value={editingContents[d.id] ?? d.content ?? ''}
                                    onChange={(e) => setEditingContents(prev => ({ ...prev, [d.id]: e.target.value }))}
                                    placeholder="Descreva as para-percepções aqui..."
                                    className={`w-full min-h-[200px] sm:min-h-[350px] p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-[2rem] font-sans text-xs sm:text-base leading-relaxed outline-none border transition-all resize-none shadow-inner ${
                                      isDark ? 'bg-[#030406] border-neutral-white/5 text-zinc-400 focus:text-white focus:border-indigo-500/40' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:shadow-2xl'
                                    }`}
                                  />
                                </div>

                                {/* Checklist Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                   {[
                                     { label: 'Energossoma', field: 'energy', options: energyOptionTags, color: 'indigo' },
                                     { label: 'Mentalsoma', field: 'mental', options: mentalOptionTags, color: 'purple' },
                                     { label: 'Holopensene', field: 'emotion', options: emotionOptionTags, color: 'pink' },
                                     { label: 'Posturas', field: 'posture', options: postureOptionTags, color: 'orange' },
                                   ].map((vehicle) => (
                                      <div key={vehicle.field} className="space-y-2 sm:space-y-4">
                                         <label className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-550 block">{vehicle.label}</label>
                                         <div className="flex flex-col gap-1.5">
                                            {vehicle.options.map(tag => {
                                               let active = false;
                                               if (vehicle.field === 'energy') active = currentEnergy.includes(tag);
                                               if (vehicle.field === 'mental') active = currentMental.includes(tag);
                                               if (vehicle.field === 'emotion') active = currentEmotion.includes(tag);
                                               if (vehicle.field === 'posture') active = currentPosture.includes(tag);

                                               return (
                                                 <button
                                                   key={tag}
                                                   onClick={() => toggleTagInEditingState(d.id, tag, vehicle.field as any, (vehicle.field === 'energy' ? currentEnergy : vehicle.field === 'mental' ? currentMental : vehicle.field === 'emotion' ? currentEmotion : currentPosture))}
                                                   className={`text-[8px] sm:text-[10px] text-left px-2 sm:px-4 py-2 rounded-lg sm:rounded-xl border transition-all relative overflow-hidden group/tag ${
                                                     active 
                                                       ? `bg-${vehicle.color}-500/10 border-${vehicle.color}-500/30 text-${vehicle.color}-400 font-extrabold` 
                                                       : isDark ? 'border-neutral-white/5 text-zinc-550 hover:text-zinc-450' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                   }`}
                                                 >
                                                   {tag}
                                                   {active && <div className={`absolute right-0 top-0 bottom-0 w-0.5 sm:w-1 bg-${vehicle.color}-500`} />}
                                                 </button>
                                               );
                                            })}
                                         </div>
                                      </div>
                                   ))}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                    )}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Manual EV addition Modal */}
      <AnimatePresence>
        {showEVModal && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto pt-6 pb-28 sm:py-6 bg-transparent">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEVModal(false)}
              className="absolute inset-0 bg-neutral-black/85 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className={`relative w-full max-w-2xl lg:max-w-5xl xl:max-w-6xl border rounded-[2rem] sm:rounded-[2.8rem] overflow-hidden flex flex-col max-h-[85vh] mb-24 sm:mb-0 shadow-2xl ${
                isDark 
                  ? 'bg-gradient-to-b from-[#0f111a] via-[#08090d] to-[#030406] border-neutral-white/10 text-white shadow-[0_20px_100px_rgba(0,0,0,0.95)]' 
                  : 'bg-gradient-to-b from-white to-slate-50 border-slate-250 text-slate-800 shadow-[0_20px_80px_rgba(15,23,42,0.16)]'
              }`}
            >
              <header className={`p-4 px-5 sm:p-5 sm:px-6 md:p-6 border-b flex items-center justify-between relative overflow-hidden shrink-0 ${
                isDark ? 'border-neutral-white/10 bg-[#0c0e14]/95 backdrop-blur-md' : 'border-slate-100 bg-slate-50/95 backdrop-blur-md'
              }`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-600" />
                <div className="flex items-center gap-2.5 sm:gap-3.5">
                  <div className="p-1.5 sm:p-2.5 bg-indigo-500/10 rounded-lg sm:rounded-xl shrink-0">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm sm:text-lg md:text-xl font-black font-sans tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Fatuística & Parapercepções</h3>
                    <button
                      type="button"
                      onClick={() => setIsGlobalEditActive(!isGlobalEditActive)}
                      className={`p-1 rounded transition-all flex items-center justify-center shrink-0 border-none bg-transparent outline-none cursor-pointer ${
                        isGlobalEditActive 
                          ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                          : 'text-zinc-550 hover:text-zinc-300 dark:text-zinc-500 dark:hover:text-white'
                      }`}
                      title="Alternar Modo de Edições de Itens"
                    >
                      <Sliders size={14} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setShowEVModal(false)}
                  className={`rounded-lg sm:rounded-xl w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border transition-all active:scale-95 ${
                    isDark ? 'bg-neutral-white/5 border-neutral-white/10 text-neutral-white/30 hover:text-white' : 'bg-white border-slate-200 text-slate-500'
                  }`}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </header>

              <div className="flex-1 p-5 sm:p-6 md:p-8 overflow-y-auto scrollbar-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                  
                  {/* Left Column: Technique, Level & Slider Settings */}
                  <div className="space-y-5 sm:space-y-6">
                    {/* Diary linkage configuration */}
                    <div className="space-y-2 sm:space-y-3 p-4 rounded-2xl border border-dashed border-indigo-500/25 bg-gradient-to-r from-indigo-550/[0.04] to-purple-550/[0.04] dark:from-indigo-500/[0.03] dark:to-purple-500/[0.03]">
                      <label className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400 block">Vincular relato ao Diário</label>
                      <div className="relative group">
                        <select 
                          value={selectedDiaryId}
                          onChange={(e) => setSelectedDiaryId(e.target.value)}
                          className={`w-full p-3 rounded-xl border outline-none text-xs font-bold transition-all appearance-none cursor-pointer ${
                            isDark ? 'bg-[#030406] border-neutral-white/5 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-750 focus:border-indigo-600 shadow-sm'
                          }`}
                        >
                          <option value="auto_today">Vincular Automaticamente ao Diário de Hoje (Cria se não existir)</option>
                          <option value="none">Não vincular a diários (Apenas log de práticas)</option>
                          {diaries.map(d => (
                            <option key={d.id} value={d.id}>
                              {formatShortDate(d.date || d.createdAt)} — {d.title || 'Sem título'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>

                    {/* Mode Select Technique */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Fatuística (Fatos & Fenômenos)</label>
                        {!showNewFatuisticaInput ? (
                          <button 
                            type="button"
                            onClick={() => setShowNewFatuisticaInput(true)}
                            className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1 uppercase tracking-wider bg-transparent border-none cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Mais
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-zinc-950/90 dark:bg-zinc-900 border border-neutral-white/10 rounded-xl p-1">
                            <input 
                              type="text"
                              placeholder="Inserir fato/fenômeno"
                              value={newFatuisticaInput}
                              onChange={(e) => setNewFatuisticaInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomFatuistica();
                                }
                              }}
                              className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white max-w-[120px] border-none"
                            />
                            <button 
                              type="button"
                              onClick={addCustomFatuistica}
                              className="p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer border-none"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setShowNewFatuisticaInput(false);
                                setNewFatuisticaInput('');
                              }}
                              className="p-1 text-zinc-500 hover:text-red-400 cursor-pointer border-none bg-transparent"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="relative group">
                        <select 
                          value={evTechnique}
                          onChange={(e) => setEvTechnique(e.target.value)}
                          className={`w-full p-3 sm:p-4 rounded-xl border outline-none text-xs sm:text-sm font-black transition-all appearance-none cursor-pointer ${
                            isDark ? 'bg-[#08090c] border-neutral-white/10 text-white focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-850 focus:border-indigo-600 shadow-sm'
                          }`}
                        >
                          {fatuisticaOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                      {customFatuistica.length > 0 && (
                        <div className="horizontal-flow-4-rows">
                          {customFatuistica.map((cf, idx) => {
                            const isEditing = editingFatuistica === cf;
                            const isSelected = evTechnique === cf || DEFAULT_FATUISTICA.find(opt => opt.label === cf)?.value === evTechnique;
                            return isEditing ? (
                              <div key={`f_edit_${idx}`} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner shrink-0 max-h-[38px]" onClick={(e) => e.stopPropagation()}>
                                <input 
                                  type="text"
                                  value={editingFatuisticaValue}
                                  onChange={(e) => setEditingFatuisticaValue(e.target.value)}
                                  className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white flex-1 min-w-0 border-none font-bold"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveFatuistica(cf, editingFatuisticaValue);
                                    if (e.key === 'Escape') setEditingFatuistica(null);
                                  }}
                                />
                                <button 
                                  type="button"
                                  onClick={() => handleSaveFatuistica(cf, editingFatuisticaValue)}
                                  className="p-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded flex items-center justify-center border-none cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setEditingFatuistica(null)}
                                  className="p-1 text-zinc-550 hover:text-red-400 flex items-center justify-center border-none cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div key={`f_${idx}`} className="flex items-center gap-1.5 bg-neutral-white/[0.01] p-0.5 rounded-xl transition-all shrink-0">
                                <button 
                                  type="button"
                                  onClick={() => setEvTechnique(cf)}
                                  className={`text-[9px] sm:text-[10px] px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                    isSelected
                                      ? isDark
                                        ? 'bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-indigo-500/25 border-indigo-500 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] font-black scale-[1.02]'
                                        : 'bg-gradient-to-r from-indigo-50 via-purple-100/40 to-indigo-50 border-indigo-400 text-indigo-800 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                                      : isDark
                                        ? 'bg-[#08090c] border-neutral-white/10 text-zinc-500 hover:text-zinc-400'
                                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {isSelected && <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
                                  {cf}
                                </button>
                                {isGlobalEditActive && (
                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditFatuistica(cf);
                                      }}
                                      className="p-1 hover:bg-zinc-800/60 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Editar"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFatuistica(cf);
                                      }}
                                      className="p-1 hover:bg-red-500/10 text-red-050 hover:text-red-300 rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                      title="Excluir"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Intensity Slider */}
                    <div className="space-y-3 sm:space-y-4 p-4 rounded-2xl bg-zinc-500/[0.04] border border-zinc-550/10 dark:border-zinc-500/5">
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Volume Bioenergético (VBE)</span>
                        <span className={`px-3 py-1 text-white rounded-full text-[10px] sm:text-xs font-black tracking-wider shadow-lg ${
                          isDark 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20' 
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-slate-200'
                        }`}>{evIntensity}/10</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="10" 
                        value={evIntensity} 
                        onChange={(e) => setEvIntensity(parseInt(e.target.value, 10))}
                        className="w-full h-1.5 bg-neutral-white/10 dark:bg-zinc-900 rounded-full appearance-none accent-indigo-505 cursor-pointer transition-all focus:outline-none" 
                      />
                      <div className="flex justify-between items-center text-[8px] font-mono font-black uppercase tracking-widest text-[#777885] dark:text-zinc-500">
                        <span className="text-indigo-500 dark:text-indigo-400">Prática Leve (Linfático)</span>
                        <span className="text-purple-600 dark:text-purple-400">Carga Máxima (Tsunami)</span>
                      </div>
                    </div>

                    {/* Symmetry & Lucidity */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 p-4 rounded-2xl bg-zinc-500/[0.04] border border-zinc-555/10 dark:border-zinc-500/5">
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500 truncate">Equilibração Bilateral</span>
                          <span className="text-purple-500 dark:text-purple-400 font-mono text-xs font-black">{evSymmetry}/5</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={evSymmetry} 
                          onChange={(e) => setEvSymmetry(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-neutral-white/10 dark:bg-zinc-900 rounded-full appearance-none accent-purple-500 cursor-pointer" 
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500 truncate">Fator de Hiperlucidez</span>
                          <span className="text-emerald-500 dark:text-emerald-400 font-mono text-xs font-black">{evLucidity}/5</span>
                        </div>
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          value={evLucidity} 
                          onChange={(e) => setEvLucidity(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-neutral-white/10 dark:bg-zinc-900 rounded-full appearance-none accent-emerald-500 cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sensations, Phenomena & Description Notes */}
                  <div className="space-y-5 sm:space-y-6">
                    {/* Sensations Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Detecção de Sinalética</span>
                      <div className="horizontal-flow-4-rows">
                        {sensationsOptions.map(s => {
                          const isEditing = editingSensation === s.label;
                          return isEditing ? (
                            <div key={s.id} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner shrink-0 max-h-[38px]">
                              <input 
                                type="text"
                                value={editingSensationValue}
                                onChange={(e) => setEditingSensationValue(e.target.value)}
                                className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white max-w-[110px] border-none font-bold"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveSensation(s.label, editingSensationValue);
                                  if (e.key === 'Escape') setEditingSensation(null);
                                }}
                              />
                              <button 
                                type="button"
                                onClick={() => handleSaveSensation(s.label, editingSensationValue)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded flex items-center justify-center border-none cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingSensation(null)}
                                className="p-1 text-zinc-500 hover:text-red-400 flex items-center justify-center border-none cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div key={s.id} className="flex items-center gap-1.5 bg-neutral-white/[0.01] p-0.5 rounded-xl transition-all shrink-0">
                              <button 
                                type="button"
                                onClick={() => toggleSensation(s.label)}
                                className={`text-[9px] sm:text-[10px] px-3.5 py-1.5 sm:px-4.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                  evSensations.includes(s.label)
                                    ? isDark
                                      ? 'bg-gradient-to-r from-emerald-500/25 via-teal-500/20 to-emerald-500/25 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] font-black scale-[1.02]'
                                      : 'bg-gradient-to-r from-emerald-50 via-teal-100/40 to-emerald-50 border-emerald-400 text-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold'
                                    : isDark
                                      ? 'bg-[#08090c] border-neutral-white/10 text-zinc-500 hover:text-zinc-400'
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {evSensations.includes(s.label) && <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                                {s.label}
                              </button>
                              {isGlobalEditActive && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditSensation(s.label);
                                    }}
                                    className="p-1 hover:bg-zinc-800/60 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteSensation(s.label);
                                    }}
                                    className="p-1 hover:bg-red-500/10 text-red-405 hover:text-red-300 rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                    title="Excluir"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!showNewSensationInput ? (
                          <button 
                            type="button"
                            onClick={() => setShowNewSensationInput(true)}
                            className="p-1 px-2.5 sm:p-2 border border-dashed border-zinc-500/30 hover:border-zinc-400 text-zinc-500 hover:text-zinc-300 rounded-lg sm:rounded-xl text-xs flex items-center gap-1 transition-all bg-transparent cursor-pointer whitespace-nowrap shrink-0 min-h-[38px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold">Mais</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-lg sm:rounded-xl p-1 shrink-0">
                            <input 
                              type="text"
                              placeholder="Inserir sinalética"
                              value={newSensationInput}
                              onChange={(e) => setNewSensationInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addCustomSensation();
                                }
                              }}
                              className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white max-w-[120px] border-none"
                            />
                            <button 
                              type="button"
                              onClick={addCustomSensation}
                              className="p-1 bg-zinc-700 hover:bg-zinc-650 text-white rounded flex items-center justify-center border-none cursor-pointer"
                            >
                              <Check className="w-3" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowNewSensationInput(false)}
                              className="p-1 text-zinc-500 hover:text-red-450 flex items-center justify-center border-none bg-transparent cursor-pointer"
                            >
                              <X className="w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phenomena Selection */}
                    <div className="space-y-2 sm:space-y-3">
                      <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Acontecimentos Parapsíquicos</span>
                      <div className="horizontal-flow-4-rows">
                        {phenomenaOptions.map(p => {
                          const isEditing = editingPhenomenon === p.label;
                          return isEditing ? (
                            <div key={p.id} className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-xl p-1 shadow-inner shrink-0 max-h-[38px]">
                              <input 
                                type="text"
                                value={editingPhenomenonValue}
                                onChange={(e) => setEditingPhenomenonValue(e.target.value)}
                                className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white max-w-[110px] border-none font-bold"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSavePhenomenon(p.label, editingPhenomenonValue);
                                  if (e.key === 'Escape') setEditingPhenomenon(null);
                                }}
                              />
                              <button 
                                type="button"
                                onClick={() => handleSavePhenomenon(p.label, editingPhenomenonValue)}
                                className="p-1 bg-emerald-600 hover:bg-emerald-750 text-white rounded flex items-center justify-center border-none cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button 
                                type="button"
                                onClick={() => setEditingPhenomenon(null)}
                                className="p-1 text-zinc-500 hover:text-red-400 flex items-center justify-center border-none cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div key={p.id} className="flex items-center gap-1.5 bg-neutral-white/[0.01] p-0.5 rounded-xl transition-all shrink-0">
                              <button 
                                type="button"
                                onClick={() => togglePhenomenon(p.label)}
                                className={`text-[9px] sm:text-[10px] px-3 py-1.5 sm:px-4.5 sm:py-2 rounded-lg sm:rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                                  evPhenomena.includes(p.label)
                                    ? isDark
                                      ? 'bg-gradient-to-r from-indigo-500/25 via-purple-500/20 to-indigo-500/25 border-indigo-500 text-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] font-black scale-[1.02]'
                                      : 'bg-gradient-to-r from-indigo-50 via-purple-100/40 to-indigo-50 border-indigo-400 text-indigo-800 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold'
                                    : isDark
                                      ? 'bg-[#08090c] border-neutral-white/10 text-zinc-500 hover:text-zinc-400'
                                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {evPhenomena.includes(p.label) && <span className="relative flex h-2 w-2 shrink-0"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>}
                                {p.label}
                              </button>
                              {isGlobalEditActive && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditPhenomenon(p.label);
                                    }}
                                    className="p-1 hover:bg-zinc-800/60 text-zinc-400 hover:text-white rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeletePhenomenon(p.label);
                                    }}
                                    className="p-1 hover:bg-red-500/10 text-red-505 hover:text-red-300 rounded flex items-center justify-center transition-all cursor-pointer border-none bg-transparent"
                                    title="Excluir"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {!showNewPhenomenonInput ? (
                          <button 
                            type="button"
                            onClick={() => setShowNewPhenomenonInput(true)}
                            className="p-1 px-2.5 sm:p-2 border border-dashed border-zinc-500/30 hover:border-zinc-400 text-zinc-500 hover:text-zinc-300 rounded-lg sm:rounded-xl text-xs flex items-center gap-1 transition-all bg-transparent cursor-pointer whitespace-nowrap shrink-0 min-h-[38px]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold">Mais</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 bg-zinc-900 border border-neutral-white/10 rounded-lg sm:rounded-xl p-1 shrink-0">
                            <input 
                              type="text"
                              placeholder="Inserir fenômeno"
                              value={newPhenomenonInput}
                              onChange={(e) => setNewPhenomenonInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addCustomPhenomenon();
                                }
                              }}
                              className="bg-transparent outline-none text-[9px] sm:text-[10px] px-2 py-1 text-white max-w-[120px] border-none"
                            />
                            <button 
                              type="button"
                              onClick={addCustomPhenomenon}
                              className="p-1 bg-zinc-700 hover:bg-zinc-650 text-white rounded flex items-center justify-center border-none cursor-pointer"
                            >
                              <Check className="w-3" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowNewPhenomenonInput(false)}
                              className="p-1 text-zinc-500 hover:text-red-450 flex items-center justify-center border-none bg-transparent cursor-pointer"
                            >
                              <X className="w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Signals field */}
                    <div className="space-y-2">
                      <span className="text-[8px] sm:text-[9px] font-black font-mono uppercase tracking-[0.2em] text-zinc-500">Sumário de Cognições Extra-físicas</span>
                      <textarea 
                        value={evNotes}
                        onChange={(e) => setEvNotes(e.target.value)}
                        placeholder="Capture aqui o insight fenomenológico imediato..."
                        className={`w-full min-h-[120px] p-3.5 sm:p-4 rounded-xl border font-sans text-sm font-normal text-slate-800 dark:text-zinc-300 leading-relaxed outline-none transition-all resize-none ${
                          isDark ? 'bg-[#030406] border-neutral-white/5 focus:text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-600 focus:shadow-sm'
                        }`}
                      />
                    </div>
                  </div>

                </div>
              </div>

              <footer className={`p-4 px-5 sm:p-4 sm:px-6 border-t flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-4 shrink-0 ${
                isDark ? 'bg-[#0c0e14] border-neutral-white/5' : 'bg-slate-50 border-slate-100'
              }`}>
                <button 
                  onClick={() => setShowEVModal(false)}
                  className={`px-3 py-2 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition-all cursor-pointer text-center bg-transparent border-none ${
                    isDark ? 'text-zinc-500 hover:text-white hover:bg-neutral-white/[0.02]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Cancelar Procedimento
                </button>
                <motion.button 
                  onClick={handleCreateQuickEV}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ 
                    boxShadow: [
                      "0 10px 15px -3px rgba(99, 102, 241, 0.2)",
                      "0 10px 25px -3px rgba(16, 185, 129, 0.35)",
                      "0 10px 15px -3px rgba(99, 102, 241, 0.2)"
                    ],
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ 
                    boxShadow: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
                    backgroundPosition: { repeat: Infinity, duration: 8, ease: "linear" }
                  }}
                  style={{ backgroundSize: "200% auto" }}
                  className="px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.15em] cursor-pointer text-center border-none shadow-lg outline-none select-none overflow-hidden"
                >
                  Registrar Fenômenos
                </motion.button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility to safely strip HTML tags
function dStripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}
