import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, Wallet, Shield, Trophy, Star, 
  Plus, ExternalLink, ChevronRight, ChevronLeft, ChevronDown, Check,
  FileText, ArrowLeft, X, Save, 
  Image as ImageIcon, Upload, Download, 
  Trash2, Eye, Calendar, Tag, Fingerprint,
  Link as LinkIcon, MoreHorizontal, Maximize2,
  Menu, Sun, Moon, Sunrise, CloudMoon, Sparkles,
  MoveRight, FilePlus
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { useOrganismSync } from '../hooks/useOrganismSync';

interface DocumentField {
  name: string;
  type: 'text' | 'number' | 'date';
  value: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  link?: string;
  fields: DocumentField[];
  revealed?: boolean;
}

interface Link {
  id: string;
  title: string;
  url: string;
  type?: string;
  revealed?: boolean;
}

interface Achievement {
  id: string;
  name: string;
  value: number;
  date: string;
  description: string;
  category: string;
  image: string; // Cover image
  images: string[]; // Multiple images
  documents: Document[];
  links: Link[];
}

interface MuralSucessoPageProps {
  onBack?: () => void;
  onToggleSidebar?: () => void;
}

// --- Helper Components ---
const getDocIcon = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes('PDF')) return <FileText size={20} />;
  if (t.includes('PNG') || t.includes('JPG') || t.includes('JPEG')) return <ImageIcon size={20} />;
  if (t.includes('XLS') || t.includes('CSV')) return <Wallet size={20} />;
  return <FileText size={20} />;
};

const VaultItem = ({ 
  item, 
  type, 
  assetName, 
  isGlobal, 
  isMasterRevealed, 
  isRevealed, 
  onToggleReveal, 
  onEdit, 
  onDelete 
}: { 
  item: Document | Link, 
  type: 'doc' | 'link', 
  assetName?: string, 
  isGlobal?: boolean,
  isMasterRevealed: boolean,
  isRevealed: boolean,
  onToggleReveal: (id: string) => void,
  onEdit?: (doc: Document) => void,
  onDelete: (item: Document | Link, type: 'doc' | 'link', isGlobal: boolean) => void
}) => {
  const activeIsRevealed = isMasterRevealed || isRevealed;
  const isDoc = type === 'doc';
  const doc = item as Document;
  const link = item as Link;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden group transition-all duration-500 rounded-[32px] border ${activeIsRevealed ? 'bg-white dark:bg-zinc-900 border-primary/50 shadow-2xl p-6 ring-4 ring-primary/5' : 'bg-black/5 dark:bg-white/5 border-dashed border-black/10 dark:border-white/20 p-5 cursor-pointer hover:border-primary/50 shadow-sm'}`}
      onClick={() => !activeIsRevealed && onToggleReveal(item.id)}
    >
      <AnimatePresence mode="wait">
        {!activeIsRevealed ? (
          <motion.div 
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white relative overflow-hidden shadow-[0_10px_20px_rgba(var(--primary-rgb),0.3)]">
                <Fingerprint size={28} />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black dark:text-white">Item Blindado</p>
                <p className="text-[9px] font-bold text-black/60 dark:text-white/60 uppercase tracking-widest mt-1">Autenticação Necessária</p>
              </div>
            </div>
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-full">
              <Shield size={20} className="text-primary" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between group/header">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                  {isDoc ? getDocIcon(doc.type) : <LinkIcon size={24} />}
                </div>
                <div>
                  <h5 className="text-sm font-black uppercase tracking-tight text-black dark:text-white">
                    {isDoc ? doc.name : link.title}
                  </h5>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">
                    {isGlobal ? 'Arquivo Mestre' : assetName || 'Blindado'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleReveal(item.id); }}
                  className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl text-black dark:text-white hover:text-primary transition-all border border-black/10 dark:border-white/20 shadow-sm"
                  title="Ocultar"
                >
                  <Eye size={18} />
                </button>
                {isDoc && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onEdit?.(doc);
                    }}
                    className="p-2.5 bg-black/5 dark:bg-white/10 rounded-xl text-black dark:text-white hover:text-primary transition-all border border-black/10 dark:border-white/20 shadow-sm"
                  >
                    <Maximize2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {isDoc ? (
                <a 
                  href={doc.url} 
                  download={doc.name}
                  className="col-span-1 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg text-center"
                >
                  <Download size={14} /> Download
                </a>
              ) : (
                <a 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="col-span-1 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg text-center"
                >
                  <ExternalLink size={14} /> Link
                </a>
              )}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item, type, !!isGlobal);
                }}
                className="col-span-1 py-3 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10"
              >
                <Trash2 size={14} /> Destruir
              </button>
            </div>

            {isDoc && doc.fields?.length > 0 && (
              <div className="pt-4 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-3">
                {doc.fields.map((f, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[7px] font-black uppercase tracking-widest text-black/40 dark:text-white/40">{f.name}</p>
                    <p className="text-[10px] font-bold truncate text-black dark:text-white">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const MuralSucessoPage: React.FC<MuralSucessoPageProps> = ({ onBack, onToggleSidebar }) => {
  const location = useLocation();

  // --- States ---
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Achievement | null>(null);

  useEffect(() => {
    if (location.state && location.state.openModal === 'add-asset') {
      setSelectedAsset(null);
      setShowAssetModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vaultTab, setVaultTab] = useState<'docs' | 'links'>('docs');
  const [newAssetImages, setNewAssetImages] = useState<string[]>([]);
  const [newAssetDocs, setNewAssetDocs] = useState<Document[]>([]);
  const [newAssetLinks, setNewAssetLinks] = useState<Link[]>([]);
  const [vaultBatchName, setVaultBatchName] = useState('Protocolo de Segurança');
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [pendingLinks, setPendingLinks] = useState<Link[]>([]);
  const [showGlobalVaultModal, setShowGlobalVaultModal] = useState(false);
  const [currentHeaderImageIndex, setCurrentHeaderImageIndex] = useState(0);
  const [categories, setCategories] = useState(['Veículos', 'Imóveis', 'Relógios', 'Investimentos', 'Outros']);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Veículos');
  const [globalVaultDocs, setGlobalVaultDocs] = useState<Document[]>([]);
  const [globalVaultLinks, setGlobalVaultLinks] = useState<Link[]>([]);
  const [editingDoc, setEditingDoc] = useState<{ doc: Document, isGlobal: boolean, assetId?: string } | null>(null);
  const [isMasterRevealed, setIsMasterRevealed] = useState(false);
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});
  
  // Toggle Revelation
  const toggleReveal = (id: string) => {
    setRevealedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMasterReveal = () => {
    const newState = !isMasterRevealed;
    setIsMasterRevealed(newState);
    
    // Also reset individual revealed items if hiding master
    if (!newState) {
      setRevealedItems({});
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const globalDocInputRef = useRef<HTMLInputElement>(null);
  const activePendingDocIdRef = useRef<string | null>(null);

  const addPendingDoc = () => {
    const newDoc: Document = { 
      id: 'pd' + Date.now(), 
      name: '', 
      type: 'DOC', 
      url: '', 
      fields: [],
      revealed: false 
    };
    setPendingDocs(prev => [...prev, newDoc]);
  };

  const addPendingLink = () => {
    const newLink: Link = { 
      id: 'pl' + Date.now(), 
      title: '', 
      url: '',
      revealed: false 
    };
    setPendingLinks(prev => [...prev, newLink]);
  };

  const commitPendingToVault = () => {
    if (pendingDocs.length === 0 && pendingLinks.length === 0) {
      setShowGlobalVaultModal(false);
      return;
    }
    
    // Validate names
    const hasInvalidDocs = pendingDocs.some(d => !d.name || !d.url);
    const hasInvalidLinks = pendingLinks.some(l => !l.title || !l.url);
    
    if (hasInvalidDocs || hasInvalidLinks) {
      alert('Por favor, preencha todos os nomes e arquivos nos campos adicionados.');
      return;
    }

    setGlobalVaultDocs(prev => [...prev, ...pendingDocs]);
    setGlobalVaultLinks(prev => [...prev, ...pendingLinks]);
    setPendingDocs([]);
    setPendingLinks([]);
    setShowGlobalVaultModal(false);
    alert('Dossiê blindado com sucesso no cofre mestre.');
  };

  const handlePendingFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docId = activePendingDocIdRef.current;
    if (!file || !docId) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPendingDocs(prev => prev.map(d => d.id === docId ? { 
        ...d, 
        url: base64, 
        type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
        name: d.name || file.name
      } : d));
    };
    reader.readAsDataURL(file);
  };

  
  // Persistent Data
  const [netWorth, setNetWorth] = useState({ current_cash: 0.00 });
  const [assets, setAssets] = useState<Achievement[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Background Animation States (Moved here to avoid ReferenceError with 'assets')
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (assets.length > 0) {
      // Collect only images from assets (bens adquiridos)
      const allImages = assets.flatMap(a => [a.image, ...(a.images || [])]).filter(img => img && typeof img === 'string' && img.startsWith('http'));
      const uniqueImages = Array.from(new Set(allImages));
      if (uniqueImages.length > 0) {
        setBackgroundImages(uniqueImages);
      }
    }
  }, [assets]);

  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setBgIndex(prev => (prev + 1) % backgroundImages.length);
      }, 10000); // Cycle every 10 seconds for a contemplative feel
      return () => clearInterval(interval);
    }
  }, [backgroundImages.length]);

  const handleDeleteVaultItem = (item: Document | Link, type: 'doc' | 'link', isGlobal: boolean) => {
    if(!confirm('Garantir exclusão definitiva do sistema blindado?')) return;
    
    if(isGlobal) {
      if(type === 'doc') setGlobalVaultDocs(prev => prev.filter(d => d.id !== item.id));
      else setGlobalVaultLinks(prev => prev.filter(l => l.id !== item.id));
    } else {
      setAssets(prev => prev.map(a => ({
        ...a,
        documents: a.documents.filter(d => d.id !== item.id),
        links: a.links.filter(l => l.id !== item.id)
      })));
    }
    // Also remove from revealed items
    setRevealedItems(prev => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });
  };

  const handleEditDoc = (doc: Document, isGlobal: boolean) => {
    setEditingDoc({ 
      doc, 
      isGlobal: !!isGlobal, 
      assetId: isGlobal ? null : assets.find(a => a.documents.some(d => d.id === doc.id))?.id || null 
    });
  };

  // Carousel Ref for Mural
  const carouselRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    const data = db.getMuralData();
    setNetWorth(data.netWorth);
    // Ensure new fields exist
    const sanitizedAssets = data.assets.map((a: any) => ({
      ...a,
      images: a.images || [a.image],
      links: a.links || [],
      documents: (a.documents || []).map((d: any) => ({
        ...d,
        fields: d.fields || []
      }))
    }));
    setAssets(sanitizedAssets);
    setGlobalVaultDocs((data.vault || []).map((d: any) => ({
      ...d,
      fields: d.fields || []
    })));
    setGlobalVaultLinks(data.links || []);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (showAssetModal) {
      if (selectedAsset) {
        setSelectedCategory(selectedAsset.category || 'Veículos');
        setNewAssetImages(selectedAsset.images || [selectedAsset.image] || []);
        setNewAssetDocs(selectedAsset.documents || []);
        setNewAssetLinks(selectedAsset.links || []);
      } else {
        setSelectedCategory('Veículos');
        setNewAssetImages([]);
        setNewAssetDocs([]);
        setNewAssetLinks([]);
      }
      setIsAddingCategory(false);
      setNewCategoryName('');
      setCurrentHeaderImageIndex(0);
    }
  }, [showAssetModal, selectedAsset]);

  const syncKey = useOrganismSync();
  const totalAssetsValue = assets.reduce((acc, a) => acc + a.value, 0);
  const currentCash = React.useMemo(() => {
    const transactions = db.getTransactions();
    const categories = db.getCategories();
    return transactions.reduce((acc, t) => {
      const cat = categories.find(c => c.id === t.category_id);
      const isInc = cat?.type === 'INCOME';
      return isInc ? acc + Number(t.value) : acc - Number(t.value);
    }, 0);
  }, [syncKey]);
  const globalValue = totalAssetsValue + currentCash;

  // Header Image Rotation Effect
  useEffect(() => {
    if (newAssetImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeaderImageIndex(prev => (prev + 1) % newAssetImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [newAssetImages.length]);

  // Save data whenever it changes
  useEffect(() => {
    if (isLoaded) {
      db.saveMuralData({ 
        netWorth: { current_cash: currentCash }, 
        assets, 
        vault: globalVaultDocs, 
        links: globalVaultLinks 
      });
    }
  }, [currentCash, assets, globalVaultDocs, globalVaultLinks, isLoaded]);

  // Header Logic (from ProjectsPage)
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [activeHeaderSlide, setActiveHeaderSlide] = useState(0);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1200], [0, 400]);
  const opacityHeader = useTransform(scrollY, [0, 1000], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Olá, bom dia, Douglas.');
    else if (hour >= 12 && hour < 18) setGreeting('Olá, boa tarde, Douglas.');
    else if (hour >= 18 && hour <= 23) setGreeting('Olá, boa noite, Douglas.');
    else setGreeting('Olá, boa madrugada, Douglas.');
  }, []);

  const handleSaveAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newAsset: Achievement = {
      id: selectedAsset?.id || 'a' + Date.now(),
      name: formData.get('name') as string,
      value: parseFloat(formData.get('value') as string) || 0,
      date: formData.get('date') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      image: newAssetImages[0] || formData.get('image') as string || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200',
      images: newAssetImages.length > 0 ? newAssetImages : [formData.get('image') as string || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200'],
      documents: newAssetDocs,
      links: newAssetLinks
    };

    if (selectedAsset) {
      setAssets(prev => prev.map(a => a.id === selectedAsset.id ? newAsset : a));
    } else {
      setAssets(prev => [...prev, newAsset]);
    }
    setShowAssetModal(false);
    setSelectedAsset(null);
  };

  const handleAddDocument = (assetId: string | null) => {
    const name = prompt('Nome do documento:');
    if (!name) return;
    const newDoc: Document = { 
      id: 'd' + Date.now(), 
      name, 
      type: 'PDF', 
      url: '#', 
      fields: [],
      revealed: false
    };
    if (assetId) {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, documents: [...a.documents, newDoc] } : a));
    } else {
      setGlobalVaultDocs(prev => [...prev, newDoc]);
    }
  };

  const handleAddLink = (assetId: string | null) => {
    const title = prompt('Título do link:');
    const url = prompt('URL do link:');
    if (!title || !url) return;
    const newLink: Link = { 
      id: 'l' + Date.now(), 
      title, 
      url,
      revealed: false
    };
    if (assetId) {
      setAssets(prev => prev.map(a => a.id === assetId ? { ...a, links: [...a.links, newLink] } : a));
    } else {
      setGlobalVaultLinks(prev => [...prev, newLink]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'asset-image' | 'asset-doc' | 'global-doc') => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'asset-image') {
          setNewAssetImages(prev => [...prev, base64]);
        } else if (type === 'asset-doc' || type === 'global-doc') {
          const docName = prompt(`Como deseja blindar este arquivo: ${file.name}?`, file.name) || file.name;
          const newDoc: Document = {
            id: (type === 'global-doc' ? 'gd' : 'd') + Date.now() + Math.random().toString(36).substr(2, 9),
            name: docName,
            type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
            url: base64,
            fields: []
          };
          
          if (type === 'asset-doc') {
            setNewAssetDocs(prev => [...prev, newDoc]);
          } else {
            setGlobalVaultDocs(prev => [...prev, newDoc]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
    // Clear input
    e.target.value = '';
  };

  const nextImage = () => {
    if (selectedAsset && selectedAsset.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedAsset.images.length);
    }
  };

  const prevImage = () => {
    if (selectedAsset && selectedAsset.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedAsset.images.length) % selectedAsset.images.length);
    }
  };

  const handleSaveDoc = (doc: Document) => {
    if (editingDoc?.isGlobal) {
      setGlobalVaultDocs(prev => prev.map(d => d.id === doc.id ? doc : d));
    } else if (editingDoc?.assetId) {
      setAssets(prev => prev.map(a => a.id === editingDoc.assetId ? {
        ...a,
        documents: a.documents.map(d => d.id === doc.id ? doc : d)
      } : a));
    } else {
      // New asset doc being edited before save
      setNewAssetDocs(prev => prev.map(d => d.id === doc.id ? doc : d));
    }
    setEditingDoc(null);
  };



  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] pb-32 px-4 sm:px-8 font-sans selection:bg-primary/30 transition-colors duration-300 overflow-x-hidden">
      
      {/* Layer 1: Background Environment - Animated Asset Slideshow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg)]">
        <AnimatePresence mode="wait">
          <motion.div 
            key={backgroundImages.length > 0 ? backgroundImages[bgIndex] : 'default-bg'}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={backgroundImages.length > 0 ? backgroundImages[bgIndex] : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920"} 
              alt="Background Context"
              className="w-full h-full object-cover grayscale opacity-60"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlays for Depth and Glass Effect */}
        <div className="absolute inset-0 backdrop-blur-[2px] bg-[var(--bg)]/60 transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)] via-transparent to-[var(--bg)]" />
      </div>

      {/* Hidden Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => handleFileUpload(e, 'asset-image')} 
        className="hidden" 
        accept="image/*" 
        multiple
      />
      <input 
        type="file" 
        ref={docInputRef} 
        onChange={(e) => handleFileUpload(e, 'asset-doc')} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
        multiple
      />
      <input 
        type="file" 
        ref={globalDocInputRef} 
        onChange={(e) => handleFileUpload(e, 'global-doc')} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
        multiple
      />

      {/* HEADER (ProjectsPage style) */}
      <header className="relative z-10 min-h-[40vh] md:min-h-[50vh] flex flex-col items-center justify-start pt-20 md:pt-24 px-8 md:px-16 text-center mb-6">
        {/* Navigation Area */}
        <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-6">
          <button 
            onClick={onToggleSidebar}
            style={{ width: '72.9981px', height: '32.9988px', marginLeft: '-25px', marginRight: '0px' }}
            className="rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--surface-hover)] transition-all active:scale-95 backdrop-blur-2xl group shadow-xl"
          >
            <Menu size={18} className="text-[var(--text)] group-hover:scale-110 transition-transform" />
          </button>
          
          <span className="text-[11px] md:text-sm font-black text-primary tracking-[0.3em] uppercase animate-pulse drop-shadow-sm">
            Vamos evoluir Douglas
          </span>
        </div>

        {/* Top Right Buttons removed as requested */}
        <div className="absolute top-8 right-8 md:top-12 md:right-12 hidden md:flex items-center gap-1.5 md:gap-3 z-50">
        </div>

        <motion.div 
          style={{ opacity: opacityHeader }}
          className="flex flex-col items-center w-full max-w-6xl relative mt-[50px]"
        >
          <div className="relative mb-24 md:mb-12">
            <motion.h1 
              className="text-[12vw] md:text-[clamp(5rem,14vw,10rem)] font-black tracking-tighter text-[var(--text)] leading-[0.8] uppercase"
            >
              <span className="opacity-30 block text-[10px] md:text-sm tracking-[0.6em] font-sans mb-6 ml-2">Mural do Sucesso</span>
              <span className="relative flex flex-col md:block items-center">
                Quadro de 
                <span className="relative inline-block mt-4 md:mt-0">
                  <span className="relative animate-shine ml-0 md:ml-10 pr-2 block md:inline text-[1.15em] md:text-[1.3em]">
                    Conquistas
                  </span>
                  
                  {/* OVERLAYING DASHBOARD (Desktop only) */}
                  <div className="hidden md:flex absolute -bottom-16 left-1/2 -translate-x-1/2 items-center gap-8 px-10 py-6 animate-bg-shine animate-border-glow-silver border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] z-50 min-w-[800px] backdrop-blur-2xl">
                    {/* Mirror Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none rounded-2xl" />
                    
                    <button 
                      onClick={() => { 
                          setSelectedAsset(null); 
                          setNewAssetImages([]);
                          setNewAssetDocs([]);
                          setNewAssetLinks([]);
                          setShowAssetModal(true); 
                      }}
                      className="flex items-center gap-4 hover:scale-105 transition-all group mr-8"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#7c5cff] to-[#ffffff] flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                        <Plus size={24} strokeWidth={4} className="text-white" />
                      </div>
                      <span className="animate-shine text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">Adicionar Riqueza</span>
                    </button>

                    <div className="flex items-center gap-10 border-l border-white/10 pl-10">
                      <div className="space-y-1 group/val transition-transform hover:scale-105 duration-300 text-left">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">Consolidado Total</p>
                        <p className="text-4xl font-black italic tracking-tighter text-primary leading-none">
                          <span className="text-sm not-italic font-bold opacity-30 mr-1">R$</span>
                          {globalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>

                      <div className="h-10 w-px bg-white/10" />

                      <div className="space-y-1 group/val transition-transform hover:scale-105 duration-300 text-left">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">Bens & Ativos</p>
                        <p className="text-4xl font-black italic tracking-tighter leading-none">
                          <span className="text-sm not-italic font-bold opacity-30 mr-1">R$</span>
                          {totalAssetsValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Only Dashboard */}
                  <div className="md:hidden absolute -bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 w-[92vw] z-20 mt-0 mb-[-23px]">
                    <button 
                      onClick={() => { 
                          setSelectedAsset(null); 
                          setNewAssetImages([]);
                          setNewAssetDocs([]);
                          setNewAssetLinks([]);
                          setShowAssetModal(true); 
                      }}
                      className="px-6 py-3 animate-bg-shine animate-border-glow-silver border-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl flex items-center gap-3 active:scale-95 group h-[45px] bg-[var(--surface)]"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1a1a1a] via-[#7c5cff] to-[#ffffff] flex items-center justify-center -ml-1 group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                        <Plus size={18} strokeWidth={4} className="text-white" />
                      </div>
                      <span className="text-[var(--text)] font-black uppercase tracking-[0.2em] whitespace-nowrap">Adicionar Riqueza</span>
                    </button>

                    <div className="flex flex-row items-center justify-center gap-3 w-full px-2">
                      <div className="space-y-4 group/val transition-transform hover:scale-105 duration-300">
                        <p className="text-[8px] md:text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] whitespace-nowrap">Consolidado Total</p>
                        <p className="text-2xl sm:text-4xl md:text-7xl font-black italic tracking-tighter text-primary leading-none">
                          <span className="text-[10px] sm:text-xs md:text-xl not-italic font-bold opacity-30 mr-2">R$</span>
                          {globalValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      
                      <div className="h-10 md:h-24 w-px bg-[var(--border)] opacity-50" />

                      <div className="space-y-4 group/val transition-transform hover:scale-105 duration-300">
                        <p className="text-[8px] md:text-xs font-black uppercase tracking-[0.3em] text-[var(--muted)] whitespace-nowrap">Bens & Ativos</p>
                        <p className="text-2xl sm:text-4xl md:text-7xl font-black italic tracking-tighter leading-none">
                          <span className="text-[10px] sm:text-xs md:text-xl not-italic font-bold opacity-30 mr-2">R$</span>
                          {totalAssetsValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </span>
              </span>
            </motion.h1>
          </div>
          {/* REMOVED: Patrimônio & Evolução Constante — Douglas Rocha */}
          
        </motion.div>
      </header>

      {/* REMOVED OLD SUMMARY CARD SECTION */}


      {/* MURAL DE CONQUISTAS (CARROSSEL) */}
      <div className="max-w-[1800px] mx-auto mb-20">
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter flex items-center gap-4">
              <Trophy className="text-primary" size={28} /> Mural de Vitórias
            </h2>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => carouselRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
              className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-full hover:bg-[var(--surface-hover)] transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => carouselRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
              className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-full hover:bg-[var(--surface-hover)] transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div 
          ref={carouselRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 pt-10 px-2"
          style={{ scrollBehavior: 'smooth' }}
        >
          {assets.map((asset) => (
            <motion.div
              key={asset.id}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => { setSelectedAsset(asset); setCurrentImageIndex(0); }}
              className="flex-shrink-0 w-[320px] sm:w-[400px] snap-start group relative aspect-[4/5] rounded-[40px] overflow-hidden border border-[var(--border)] shadow-2xl cursor-pointer"
            >
              <div className="absolute inset-0 bg-black/20" />
              <img 
                src={asset.image} 
                className="absolute inset-0 w-full h-full object-contain transition-transform duration-1000 group-hover:scale-105" 
                alt={asset.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
              
              <div className="absolute inset-0 p-10 flex flex-col justify-end space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{asset.category}</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-white italic leading-tight">{asset.name}</h3>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white tracking-tighter">
                      <span className="text-xs font-bold opacity-40 mr-1">R$</span>
                      {asset.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{new Date(asset.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white group-hover:bg-primary transition-all">
                    <Maximize2 size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Placeholder */}
          <div
            onClick={() => { setSelectedAsset(null); setShowAssetModal(true); }}
            className="flex-shrink-0 w-[320px] sm:w-[400px] snap-start aspect-[4/5] rounded-[40px] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-[var(--surface-hover)] transition-all group"
          >
            <div className="w-20 h-20 bg-[var(--border)] rounded-full flex items-center justify-center text-[var(--muted)] group-hover:bg-primary group-hover:text-white transition-all">
              <Plus size={40} strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[0.3em] opacity-40">Nova Conquista</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EVOLUÇÃO TOTAL */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-[1800px] bg-[var(--bg)] rounded-[48px] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col lg:flex-row h-full max-h-[90vh]"
            >
              {/* LADO ESQUERDO: CARROSSEL DE IMAGENS */}
              <div className="lg:w-3/5 h-[40vh] lg:h-auto relative bg-black group/car">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={currentImageIndex}
                    src={selectedAsset.images[currentImageIndex]} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full object-contain" 
                    alt="Gallery"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Navigation Arrows */}
                {selectedAsset.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover/car:opacity-100 transition-all hover:bg-primary"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white opacity-0 group-hover/car:opacity-100 transition-all hover:bg-primary"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Thumbnails */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 px-6 py-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                  {selectedAsset.images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all bg-black/20 ${idx === currentImageIndex ? 'border-primary scale-110' : 'border-transparent opacity-50'}`}
                    >
                      <img src={img} className="w-full h-full object-contain" alt="Thumb" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-8 left-8 p-4 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* LADO DIREITO: INFORMAÇÕES & COFRE */}
              <div className="lg:w-2/5 p-8 sm:p-12 overflow-y-auto no-scrollbar bg-[var(--bg)]">
                <div className="space-y-12">
                  {/* Header */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedAsset.category}</span>
                      </div>
                      <p className="text-[var(--muted)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> {new Date(selectedAsset.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none">
                      {selectedAsset.name}
                    </h3>
                    <p className="text-4xl font-black italic text-primary tracking-tighter">
                      <span className="text-sm not-italic font-bold opacity-40 mr-1">R$</span>
                      {selectedAsset.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[var(--muted)] text-sm leading-relaxed font-medium">
                      {selectedAsset.description}
                    </p>
                  </div>

                  {/* COFRE DIGITAL */}
                  <div className="space-y-8 pt-10 border-t border-[var(--border)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h4 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Shield className="text-primary" size={24} /> Cofre Digital Sigiloso
                      </h4>
                      
                      <div className="flex bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)]">
                        <button 
                          onClick={() => setVaultTab('docs')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${vaultTab === 'docs' ? 'bg-primary text-white shadow-lg' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                        >
                          Docs
                        </button>
                        <button 
                          onClick={() => setVaultTab('links')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${vaultTab === 'links' ? 'bg-primary text-white shadow-lg' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                        >
                          Links
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {vaultTab === 'docs' ? (
                        <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => docInputRef.current?.click()}
                            className="w-full py-5 border-2 border-dashed border-[var(--border)] rounded-3xl flex flex-col items-center justify-center gap-3 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-primary transition-all group overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Upload size={22} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Blindar Novo Arquivo</span>
                          </button>

                          {selectedAsset.documents.map(doc => (
                            <VaultItem 
                              key={doc.id} 
                              item={doc} 
                              type="doc" 
                              assetName={selectedAsset.name} 
                              isMasterRevealed={isMasterRevealed}
                              isRevealed={!!revealedItems[doc.id]}
                              onToggleReveal={toggleReveal}
                              onEdit={(d) => handleEditDoc(d, false)}
                              onDelete={handleDeleteVaultItem}
                            />
                          ))}
                          {selectedAsset.documents.length === 0 && (
                            <div className="py-12 border border-dashed border-[var(--border)] rounded-3xl flex flex-col items-center justify-center opacity-20 bg-[var(--surface)]">
                              <Shield size={32} />
                              <p className="text-[9px] font-black uppercase tracking-widest mt-4">Nenhum documento</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-4">
                          <button 
                            onClick={() => handleAddLink(selectedAsset.id)}
                            className="w-full py-5 border-2 border-dashed border-[var(--border)] rounded-3xl flex flex-col items-center justify-center gap-3 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-primary transition-all group overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <LinkIcon size={22} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Anexar Link Blindado</span>
                          </button>

                          {selectedAsset.links.map(link => (
                            <VaultItem 
                              key={link.id} 
                              item={link} 
                              type="link" 
                              assetName={selectedAsset.name} 
                              isMasterRevealed={isMasterRevealed}
                              isRevealed={!!revealedItems[link.id]}
                              onToggleReveal={toggleReveal}
                              onDelete={handleDeleteVaultItem}
                            />
                          ))}
                          {selectedAsset.links.length === 0 && (
                            <div className="py-12 border border-dashed border-[var(--border)] rounded-3xl flex flex-col items-center justify-center opacity-20 bg-[var(--surface)]">
                              <LinkIcon size={32} />
                              <p className="text-[9px] font-black uppercase tracking-widest mt-4">Nenhum link</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-4 pt-10 border-t border-[var(--border)]">
                    <button 
                      onClick={() => { 
                        setNewAssetImages(selectedAsset.images);
                        setNewAssetDocs(selectedAsset.documents);
                        setNewAssetLinks(selectedAsset.links);
                        setShowAssetModal(true); 
                      }}
                      className="flex-1 py-6 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                    >
                      <ImageIcon size={18} /> Editar Ativo
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Deseja realmente remover esta conquista?')) {
                          setAssets(prev => prev.filter(a => a.id !== selectedAsset.id));
                          setSelectedAsset(null);
                        }
                      }}
                      className="p-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-3xl border border-red-500/20 transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM MODAL (UPLOAD MÚLTIPLO) - REESTILIZADO CONFORME REFERÊNCIA */}
      <AnimatePresence>
        {showAssetModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAssetModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 50 }}
              onDoubleClick={(e) => {
                const target = e.target as HTMLElement;
                const isFormInput = target.closest('input, textarea, select, button');
                if (!isFormInput) {
                  setShowAssetModal(false);
                }
              }}
              className="relative w-full max-w-3xl h-full sm:h-auto sm:max-h-[90vh] bg-[#F4F4F4] sm:rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col text-black font-sans"
            >
              {/* Top Handle like the image */}
              <div className="w-full flex justify-center pt-5 pb-2">
                <div className="w-16 h-1.5 bg-black/10 rounded-full" />
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-16 pb-12">
                {/* Header Section with dynamic background */}
                <div className="relative flex flex-col items-center text-center mt-8 mb-12 p-8 rounded-[40px] overflow-hidden group">
                  {/* Reverberating Background */}
                  <AnimatePresence mode="wait">
                    {newAssetImages.length > 0 ? (
                      <motion.div
                        key={currentHeaderImageIndex}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 z-0"
                      >
                        <img 
                          src={newAssetImages[currentHeaderImageIndex]} 
                          className="w-full h-full object-cover blur-[2px]"
                          alt="Background"
                        />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 bg-black/[0.02] z-0" />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 mb-6 bg-white shadow-2xl rounded-[40px] flex items-center justify-center text-black/20 group-hover:scale-110 transition-transform duration-500">
                      <Trophy size={48} strokeWidth={1.5} className="text-primary" />
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
                      {selectedAsset ? 'Refinar Conquista' : 'Nova Conquista de Elite'}
                    </h3>
                    <p className="text-black/40 font-medium text-sm sm:text-base max-w-[300px]">
                      Preencha os detalhes para consolidar este novo patrimônio no seu mural.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveAsset} className="space-y-10">
                  {/* Redesigned Media Gallery Section - MOVED TO TOP */}
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 bg-black/5 rounded-[24px] flex items-center justify-center text-black/10">
                        <ImageIcon size={28} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black tracking-tight">Galeria de Mídias</h4>
                        <p className="text-[9px] font-black uppercase text-black/30 tracking-[0.15em]">Sua conquista em alta resolução</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/60 p-5 rounded-[48px] border border-black/5 shadow-xl backdrop-blur-sm">
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-white border-2 border-dashed border-black/10 rounded-[32px] flex flex-col items-center justify-center gap-2 hover:border-black hover:bg-black/5 transition-all group relative overflow-hidden shadow-sm"
                      >
                        <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-black group-hover:text-white transition-all">
                          <Upload size={16} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-black/40">Upload</span>
                      </button>

                      {newAssetImages.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="aspect-square rounded-[32px] overflow-hidden relative group shadow-md border-4 border-white"
                        >
                          <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <button 
                              type="button" 
                              onClick={() => setNewAssetImages(prev => prev.filter((_, i) => i !== idx))}
                              className="p-2.5 bg-red-600 rounded-full shadow-lg hover:scale-110 transition-all"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-1">Ativo / Bem</label>
                        <input 
                          name="name" 
                          required 
                          defaultValue={selectedAsset?.name} 
                          placeholder="Ex: Ferrari Roma" 
                          className="w-full bg-white border-2 border-black/5 p-5 rounded-[24px] font-bold text-base outline-none focus:border-black transition-all box-border" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-1">Valor Estimado</label>
                        <input 
                          name="value" 
                          type="number" 
                          required 
                          defaultValue={selectedAsset?.value} 
                          placeholder="Valor em R$" 
                          className="w-full bg-white border-2 border-black/5 p-5 rounded-[24px] font-bold text-base outline-none focus:border-black transition-all box-border" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-1">Data da Conquista</label>
                        <input 
                          name="date" 
                          type="date" 
                          required 
                          defaultValue={selectedAsset?.date} 
                          className="w-full bg-white border-2 border-black/5 p-5 rounded-[24px] font-bold text-base outline-none focus:border-black transition-all box-border appearance-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[11px] font-bold text-black/30 uppercase tracking-widest">Categoria de Ativo</label>
                          <button 
                            type="button"
                            onClick={() => {
                              if (isAddingCategory && newCategoryName.trim()) {
                                const cat = newCategoryName.trim();
                                if (!categories.includes(cat)) {
                                  setCategories(prev => [...prev, cat]);
                                }
                                setSelectedCategory(cat);
                                setIsAddingCategory(false);
                                setNewCategoryName('');
                              } else {
                                setIsAddingCategory(!isAddingCategory);
                              }
                            }}
                            className={`p-1.5 rounded-full transition-all ${isAddingCategory ? 'bg-primary text-white' : 'bg-black/5 hover:bg-black hover:text-white'}`}
                          >
                            {isAddingCategory ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                          </button>
                        </div>
                        <div className="relative">
                          {isAddingCategory ? (
                            <div className="flex gap-2">
                              <input 
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nova categoria..."
                                autoFocus
                                className="w-full bg-white border-2 border-primary/20 p-5 rounded-[24px] font-bold text-base outline-none focus:border-primary transition-all"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const cat = newCategoryName.trim();
                                    if (cat) {
                                      if (!categories.includes(cat)) {
                                        setCategories(prev => [...prev, cat]);
                                      }
                                      setSelectedCategory(cat);
                                      setIsAddingCategory(false);
                                      setNewCategoryName('');
                                    }
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <>
                              <select 
                                name="category" 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-white border-2 border-black/5 p-5 pr-10 rounded-[24px] font-bold outline-none focus:border-black transition-all appearance-none cursor-pointer box-border h-full min-h-[64px]"
                              >
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                              <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-black/20" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-black/30 uppercase tracking-widest ml-1">Experiência / Detalhes</label>
                      <textarea 
                        name="description" 
                        rows={3} 
                        defaultValue={selectedAsset?.description} 
                        placeholder="Como foi essa conquista?" 
                        className="w-full bg-white border-2 border-black/5 p-6 rounded-[32px] font-medium outline-none focus:border-black transition-all resize-none shadow-sm box-border" 
                      />
                    </div>
                  </div>

                  {/* Digital Vault / Documents Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 bg-black/5 rounded-[24px] flex items-center justify-center text-black/10">
                        <FileText size={28} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black tracking-tight">Cofre de Documentos</h4>
                        <p className="text-[9px] font-black uppercase text-black/30 tracking-[0.15em]">Posse, Registros e Certificados</p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white/40 p-6 rounded-[40px] border border-black/5 shadow-inner">
                      <button 
                        type="button" 
                        onClick={() => docInputRef.current?.click()}
                        className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-3 hover:border-black hover:bg-black/5 transition-all group"
                      >
                        <Upload size={18} className="text-black/30 group-hover:text-black transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black">Anexar Documento / Vídeo</span>
                      </button>

                      <div className="space-y-2">
                        {newAssetDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-black/5 group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-black/20 shrink-0">
                                <FileText size={20} />
                              </div>
                              <div className="flex flex-col truncate">
                                <span className="text-xs font-bold truncate max-w-[150px] sm:max-w-[300px]">{doc.name}</span>
                                <span className="text-[9px] font-bold text-black/30 uppercase tracking-tighter">{doc.type}</span>
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => setNewAssetDocs(prev => prev.filter(d => d.id !== doc.id))}
                              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Links Section */}
                  <div className="space-y-6">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-14 h-14 bg-black/5 rounded-[24px] flex items-center justify-center text-black/10">
                        <LinkIcon size={28} strokeWidth={1.5} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-lg font-black tracking-tight">Links de Referência</h4>
                        <p className="text-[9px] font-black uppercase text-black/30 tracking-[0.15em]">URLs, Localização e Redes</p>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white/40 p-6 rounded-[40px] border border-black/5 shadow-inner">
                      <div className="grid grid-cols-1 gap-4">
                        {newAssetLinks.map((link, idx) => (
                          <motion.div 
                            key={link.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm space-y-3 relative group"
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <LinkIcon size={16} />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Link de Referência #{idx + 1}</span>
                              
                              <button 
                                type="button"
                                onClick={() => setNewAssetLinks(prev => prev.filter(l => l.id !== link.id))}
                                className="ml-auto w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-all"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input 
                                type="text"
                                value={link.title}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewAssetLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: val } : l));
                                }}
                                placeholder="Título (Ex: Google Maps)"
                                className="w-full bg-black/[0.03] border-none p-3.5 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                              <input 
                                type="text"
                                value={link.url}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewAssetLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: val } : l));
                                }}
                                placeholder="URL (https://...)"
                                className="w-full bg-black/[0.03] border-none p-3.5 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <button 
                        type="button" 
                        onClick={() => {
                          const newLink = { id: 'l' + Date.now(), title: '', url: '' };
                          setNewAssetLinks(prev => [...prev, newLink]);
                        }}
                        className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl flex items-center justify-center gap-3 hover:border-black hover:bg-black/5 transition-all group"
                      >
                        <Plus size={18} className="text-black/30 group-hover:text-black transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/40 group-hover:text-black">Adicionar Outro Link</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Actions mirrored from image */}
                  <div className="flex flex-col items-center gap-4 pt-6">
                    <button 
                      type="submit"
                      className="w-full py-6 md:py-8 bg-black text-white hover:bg-black/90 active:scale-95 transition-all rounded-[32px] font-black text-lg sm:text-xl tracking-tight shadow-[0_20px_40px_rgba(0,0,0,0.2)]"
                    >
                      {selectedAsset ? 'Salvar Edição' : 'Consolidar Ativo'}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setShowAssetModal(false)}
                      className="text-black/40 hover:text-black font-black text-sm uppercase tracking-widest py-2 transition-all"
                    >
                      Voltar para o Mural
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COFRE DIGITAL GLOBAL - 100% FIDELIDADE À IMAGEM (MOBILE & DESKTOP) */}
      <div className="max-w-4xl mx-auto mb-20 px-4">
        {/* Header Section */}
        <div className="space-y-4 mb-10 text-left">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-black/30 dark:text-white/30 ml-1">Patrimônio Seguro</p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex items-center justify-center border border-black/10 dark:border-white/10 rounded-2xl shrink-0">
              <Shield className="text-black dark:text-white" size={28} strokeWidth={1} />
            </div>
            <h2 className="text-[32px] sm:text-5xl font-black uppercase tracking-tight text-black dark:text-white leading-[0.95]">
              Cofre Digital<br/>Sigiloso
            </h2>
          </div>
          <p className="text-black/60 dark:text-white/60 text-[11px] sm:text-sm font-medium max-w-[280px] sm:max-w-sm leading-relaxed ml-1">
            Sua documentação blindada, organizada por ativos e acesso global instantâneo.
          </p>
        </div>

        {/* Dual Card Segmented (High Fidelity Side-by-Side) */}
        <div className="relative bg-[#F2F2F2] dark:bg-zinc-900 rounded-[40px] shadow-[0_30px_80px_rgba(0,0,0,0.05)] flex h-[360px] sm:h-[450px] overflow-hidden border border-black/[0.03] dark:border-white/[0.03] mb-12">
          
          {/* Left Card: Ver Documentos (Preto) */}
          <motion.div 
            onClick={toggleMasterReveal}
            className={`relative w-[55%] p-6 sm:p-12 flex flex-col justify-between cursor-pointer transition-all duration-700 z-20 group/left ${isMasterRevealed ? 'bg-[#7c5cff]' : 'bg-black'}`}
          >
            {/* The Notch Divider (Precise Image Match) */}
            <div className="absolute top-0 bottom-0 -right-10 w-20 z-10 pointer-events-none">
              <svg width="80" height="100%" viewBox="0 0 80 450" preserveAspectRatio="none" fill="none" className="h-full">
                <path 
                  d="M0 0H25C25 0 65 50 65 110V340C65 400 25 450 25 450H0V0Z" 
                  fill={isMasterRevealed ? '#7c5cff' : '#000000'} 
                  className="transition-colors duration-700"
                />
              </svg>
            </div>

            <div className="space-y-6 relative z-20">
              {/* Icon Container with Concentric Effect */}
              <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-white/10 scale-125 opacity-20" />
                <div className="absolute inset-0 rounded-full bg-white/5 border border-white/20" />
                <Eye size={32} className="text-white sm:size-48" strokeWidth={1.2} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-3xl font-black uppercase tracking-tight text-white leading-tight">Ver Documentos</h4>
                <p className="text-white text-[8px] sm:text-[13px] font-bold uppercase tracking-widest leading-tight">
                  Acessar e visualizar<br/>documentos ocultos
                </p>
              </div>
            </div>

            <div className="relative z-20 text-white group-hover/left:translate-x-2 transition-transform">
              <MoveRight size={24} className="sm:size-42" strokeWidth={1} />
            </div>
          </motion.div>

          {/* Right Card: Colocar no Cofre (Branco/Light) */}
          <motion.div 
            onClick={() => setShowGlobalVaultModal(true)}
            className="relative w-[45%] p-6 sm:p-12 flex flex-col justify-between cursor-pointer group/right"
          >
            <div className="space-y-6 relative z-0 ml-[10px] mr-[-20px]">
               {/* Icon Container with Concentric Effect */}
              <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-black/10 dark:border-white/10 scale-125 opacity-20" />
                <div className="absolute inset-0 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10" />
                <FilePlus size={32} className="text-black dark:text-white sm:size-48" strokeWidth={1.2} />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm sm:text-3xl font-black uppercase tracking-tight text-black dark:text-white leading-tight">Colocar no Cofre</h4>
                <p className="text-black dark:text-white text-[8px] sm:text-[13px] font-bold uppercase tracking-widest leading-tight">
                  Adicionar e blindar<br/>novos documentos
                </p>
              </div>
            </div>

            <div className="text-black/60 dark:text-white/60 group-hover/right:text-black dark:group-hover/right:text-white transition-all transform group-hover/right:translate-x-2">
              <MoveRight size={24} className="sm:size-42" strokeWidth={1} />
            </div>
          </motion.div>
        </div>

        {/* Existing Vault Items Grid - Now part of the same section flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-12">
          {/* Global Documents and Links */}
          {globalVaultDocs.map(doc => (
            <VaultItem 
              key={doc.id} 
              item={doc} 
              type="doc" 
              isGlobal 
              isMasterRevealed={isMasterRevealed}
              isRevealed={!!revealedItems[doc.id]}
              onToggleReveal={toggleReveal}
              onEdit={(d) => handleEditDoc(d, true)}
              onDelete={handleDeleteVaultItem}
            />
          ))}
          {globalVaultLinks.map(link => (
            <VaultItem 
              key={link.id} 
              item={link} 
              type="link" 
              isGlobal 
              isMasterRevealed={isMasterRevealed}
              isRevealed={!!revealedItems[link.id]}
              onToggleReveal={toggleReveal}
              onDelete={handleDeleteVaultItem}
            />
          ))}

          {/* Asset Specific Items */}
          {assets.flatMap(asset => [
            ...asset.documents.map(doc => (
              <VaultItem 
                key={doc.id} 
                item={doc} 
                type="doc" 
                assetName={asset.name} 
                isMasterRevealed={isMasterRevealed}
                isRevealed={!!revealedItems[doc.id]}
                onToggleReveal={toggleReveal}
                onEdit={(d) => handleEditDoc(d, false)}
                onDelete={handleDeleteVaultItem}
              />
            )),
            ...asset.links.map(link => (
              <VaultItem 
                key={link.id} 
                item={link} 
                type="link" 
                assetName={asset.name} 
                isMasterRevealed={isMasterRevealed}
                isRevealed={!!revealedItems[link.id]}
                onToggleReveal={toggleReveal}
                onDelete={handleDeleteVaultItem}
              />
            ))
          ])}

          {/* Empty State */}
          {globalVaultDocs.length === 0 && globalVaultLinks.length === 0 && !assets.some(a => a.documents.length > 0 || a.links.length > 0) && (
            <div className="col-span-full p-24 bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[60px] flex flex-col items-center justify-center gap-8 group hover:border-primary/40 transition-all">
              <div className="w-24 h-24 bg-black/5 dark:bg-white/10 rounded-[40px] flex items-center justify-center text-black/20 dark:text-white/20 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                <Shield size={42} strokeWidth={1} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-black uppercase tracking-[0.5em] text-black/40 dark:text-white/40">Cofre de Segurança Máxima</p>
                <p className="text-[10px] font-bold text-black/30 dark:text-white/30 max-w-xs mx-auto uppercase tracking-widest">Nenhum documento ou link blindado no momento.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL COFRE GLOBAL */}
      <AnimatePresence>
        {showGlobalVaultModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGlobalVaultModal(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-5xl bg-[var(--bg)] rounded-[32px] sm:rounded-[60px] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col h-[95vh] sm:h-auto sm:max-h-[94vh] mx-1 sm:mx-0"
            >
              {/* Header Compacto */}
              <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#0a0a0a] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tighter italic whitespace-nowrap text-black dark:text-white">Blindagem de <span className="text-primary">Ativos</span></h3>
                    <p className="text-black/40 dark:text-white/40 text-[7px] sm:text-[8px] font-black uppercase tracking-widest mt-0.5">Protocolo de Segurança</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGlobalVaultModal(false)} 
                  className="p-2 sm:p-3 bg-black/5 dark:bg-white/5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all shadow-md active:scale-90 text-black dark:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 sm:p-12 overflow-y-auto no-scrollbar flex-1">
                <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12 pb-8">
                  
                  <div className="space-y-3 sm:space-y-4 text-center px-4">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-primary">Grupo / Dossiê Pai</label>
                    <input 
                      type="text"
                      value={vaultBatchName}
                      onChange={(e) => setVaultBatchName(e.target.value)}
                      className="w-full text-center bg-transparent text-xl sm:text-5xl font-black uppercase tracking-tighter italic text-black dark:text-white border-none outline-none focus:ring-0 placeholder:opacity-10 focus:text-primary dark:focus:text-primary transition-colors"
                      placeholder="NOME DO GRUPO"
                    />
                    <div className="h-1 w-16 sm:h-1.5 sm:w-24 bg-primary/20 rounded-full mx-auto" />
                  </div>

                  {/* Seção de Documentos */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between px-2 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center text-primary">
                          <FileText size={16} />
                        </div>
                        <h4 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Documentos</h4>
                      </div>
                      <button 
                        onClick={addPendingDoc}
                        className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-all group shadow-xl active:scale-95"
                      >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform text-primary" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none">Novo Item</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      {pendingDocs.map((doc, idx) => (
                        <div key={doc.id} className="p-4 sm:p-8 bg-black/5 dark:bg-white/5 rounded-[24px] sm:rounded-[48px] border border-black/10 dark:border-white/10 shadow-inner flex flex-col gap-4 sm:gap-6 relative group hover:border-primary/30 transition-all border-dashed">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-primary/30 tracking-widest uppercase">Blindagem #{idx + 1}</span>
                            <button 
                              onClick={() => setPendingDocs(prev => prev.filter(d => d.id !== doc.id))}
                              className="p-1 text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 ml-1">Identificar Documento</label>
                            <input 
                              type="text"
                              placeholder="NOME DO ARQUIVO"
                              value={doc.name}
                              onChange={(e) => setPendingDocs(prev => prev.map(d => d.id === doc.id ? { ...d, name: e.target.value } : d))}
                              className="w-full bg-white dark:bg-black rounded-xl sm:rounded-2xl px-4 py-3 sm:px-8 sm:py-5 border border-black/10 dark:border-white/10 text-xs sm:text-sm font-bold text-black dark:text-white placeholder:opacity-20 focus:border-primary transition-all outline-none"
                            />
                          </div>

                          <button 
                            onClick={() => {
                              activePendingDocIdRef.current = doc.id;
                              globalDocInputRef.current?.click();
                            }}
                            className={`w-full py-4 sm:py-10 rounded-xl sm:rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-2 sm:gap-3 transition-all ${doc.url ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-white dark:bg-black border-black/10 dark:border-white/10 hover:border-primary/50 text-black/40 dark:text-white/40 hover:text-primary'}`}
                          >
                            {doc.url ? (
                              <>
                                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                                  <Check size={18} className="sm:size-24" />
                                </div>
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">ARQUIVO INJETADO</span>
                              </>
                            ) : (
                              <>
                                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                  <Upload size={18} className="sm:size-24" />
                                </div>
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Selecionar Arquivo</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seção de Links */}
                  <div className="space-y-6 sm:space-y-8">
                    <div className="flex items-center justify-between px-2 sm:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black/5 dark:bg-white/5 rounded-lg flex items-center justify-center text-primary">
                          <LinkIcon size={16} />
                        </div>
                        <h4 className="text-[10px] sm:text-[12px] font-black uppercase tracking-[0.2em] text-black dark:text-white">Links</h4>
                      </div>
                      <button 
                        onClick={addPendingLink}
                        className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-all group shadow-xl active:scale-95"
                      >
                        <Plus size={14} className="group-hover:rotate-90 transition-transform text-primary" />
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none">Novo Link</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                      {pendingLinks.map((link, idx) => (
                        <div key={link.id} className="p-4 sm:p-8 bg-black/5 dark:bg-white/5 rounded-[24px] sm:rounded-[48px] border border-black/10 dark:border-white/10 shadow-inner flex flex-col gap-4 sm:gap-6 relative border-dashed hover:border-primary/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-primary/30 tracking-widest uppercase">Link Mestre #{idx + 1}</span>
                            <button 
                              onClick={() => setPendingLinks(prev => prev.filter(l => l.id !== link.id))}
                              className="p-1 text-red-500 opacity-40 hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 ml-1">Título</label>
                              <input 
                                type="text"
                                placeholder="EX: BANCO INTERNACIONAL"
                                value={link.title}
                                onChange={(e) => setPendingLinks(prev => prev.map(l => l.id === link.id ? { ...l, title: e.target.value } : l))}
                                className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 border border-black/10 dark:border-white/10 text-xs font-bold text-black dark:text-white outline-none focus:border-primary transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[8px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 ml-1">URL / Endereço</label>
                              <input 
                                type="text"
                                placeholder="https://..."
                                value={link.url}
                                onChange={(e) => setPendingLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                                className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 border border-black/10 dark:border-white/10 text-[10px] font-medium text-black/60 dark:text-white/60 outline-none focus:border-primary transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer de Ação Mobile-Optimized */}
              <div className="p-5 sm:p-10 border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="hidden sm:block">
                  <p className="text-xl font-black italic uppercase tracking-tighter text-black dark:text-white">Prontos: <span className="text-primary">{pendingDocs.length + pendingLinks.length}</span></p>
                  <p className="text-[9px] font-bold text-black/40 dark:text-white/40 uppercase tracking-widest">Protocolo de Confirmação</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowGlobalVaultModal(false)}
                    className="flex-1 sm:px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 whitespace-nowrap"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={commitPendingToVault}
                    className="flex-[2] sm:px-12 py-4 sm:py-5 bg-primary text-white rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Fingerprint size={16} />
                    Finalizar Blindagem
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL EDIÇÃO DE DOCUMENTO (MODULAR) */}
      <AnimatePresence>
        {editingDoc && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingDoc(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg)] rounded-[40px] border border-[var(--border)] shadow-2xl overflow-hidden"
            >
              <div className="p-8 sm:p-12 space-y-10 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      {getDocIcon(editingDoc.doc.type)}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Editar <span className="text-primary">Documento</span></h3>
                  </div>
                  <button onClick={() => setEditingDoc(null)} className="p-3 bg-[var(--surface)] rounded-2xl hover:bg-[var(--surface-hover)] transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black opacity-30 uppercase tracking-widest pl-2">Nome do Documento</label>
                      <input 
                        value={editingDoc.doc.name} 
                        onChange={(e) => setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, name: e.target.value } })}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl font-bold outline-none focus:border-primary transition-all" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black opacity-30 uppercase tracking-widest pl-2">Tipo / Categoria</label>
                      <input 
                        value={editingDoc.doc.type} 
                        onChange={(e) => setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, type: e.target.value } })}
                        placeholder="Ex: Nota Fiscal, Contrato"
                        className="w-full bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl font-bold outline-none focus:border-primary transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black opacity-30 uppercase tracking-widest pl-2">Link Externo (Opcional)</label>
                    <div className="flex gap-3">
                      <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] p-5 rounded-2xl flex items-center gap-3">
                        <LinkIcon size={18} className="text-[var(--muted)]" />
                        <input 
                          value={editingDoc.doc.link || ''} 
                          onChange={(e) => setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, link: e.target.value } })}
                          placeholder="https://..."
                          className="w-full bg-transparent font-bold outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* CAMPOS PERSONALIZADOS (MODULAR) */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black opacity-30 uppercase tracking-widest pl-2">Campos Personalizados</label>
                      <button 
                        onClick={() => {
                          const newField: DocumentField = { name: 'Novo Campo', type: 'text', value: '' };
                          setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, fields: [...editingDoc.doc.fields, newField] } });
                        }}
                        className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all"
                      >
                        <Plus size={14} /> Adicionar Campo
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editingDoc.doc.fields.map((field, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-[var(--surface)] border border-[var(--border)] rounded-3xl relative group">
                          <div className="space-y-2">
                            <label className="text-[8px] font-black opacity-30 uppercase tracking-widest">Nome</label>
                            <input 
                              value={field.name}
                              onChange={(e) => {
                                const newFields = [...editingDoc.doc.fields];
                                newFields[idx].name = e.target.value;
                                setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, fields: newFields } });
                              }}
                              className="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-xs font-bold outline-none focus:border-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black opacity-30 uppercase tracking-widest">Tipo</label>
                            <select 
                              value={field.type}
                              onChange={(e) => {
                                const newFields = [...editingDoc.doc.fields];
                                newFields[idx].type = e.target.value as any;
                                setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, fields: newFields } });
                              }}
                              className="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-xs font-bold outline-none focus:border-primary appearance-none"
                            >
                              <option value="text">Texto</option>
                              <option value="number">Número</option>
                              <option value="date">Data</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[8px] font-black opacity-30 uppercase tracking-widest">Valor</label>
                            <input 
                              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                              value={field.value}
                              onChange={(e) => {
                                const newFields = [...editingDoc.doc.fields];
                                newFields[idx].value = e.target.value;
                                setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, fields: newFields } });
                              }}
                              className="w-full bg-[var(--bg)] border border-[var(--border)] p-3 rounded-xl text-xs font-bold outline-none focus:border-primary"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newFields = editingDoc.doc.fields.filter((_, i) => i !== idx);
                              setEditingDoc({ ...editingDoc, doc: { ...editingDoc.doc, fields: newFields } });
                            }}
                            className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {editingDoc.doc.fields.length === 0 && (
                        <div className="p-10 border-2 border-dashed border-[var(--border)] rounded-[32px] text-center opacity-20">
                          <p className="text-[10px] font-black uppercase tracking-widest">Nenhum campo personalizado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => handleSaveDoc(editingDoc.doc)}
                      className="flex-1 py-6 bg-primary hover:bg-primary-hover text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95"
                    >
                      Salvar Alterações
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm('Deseja excluir este documento permanentemente?')) {
                          if (editingDoc.isGlobal) {
                            setGlobalVaultDocs(prev => prev.filter(d => d.id !== editingDoc.doc.id));
                          } else if (editingDoc.assetId) {
                            setAssets(prev => prev.map(a => a.id === editingDoc.assetId ? {
                              ...a,
                              documents: a.documents.filter(d => d.id !== editingDoc.doc.id)
                            } : a));
                          } else {
                            setNewAssetDocs(prev => prev.filter(d => d.id !== editingDoc.doc.id));
                          }
                          setEditingDoc(null);
                        }
                      }}
                      className="p-6 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-3xl border border-red-500/20 transition-all"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple
        onChange={(e) => handleFileUpload(e, 'asset-image')} 
      />
      <input 
        type="file" 
        ref={docInputRef} 
        className="hidden" 
        accept="*/*" 
        multiple
        onChange={(e) => handleFileUpload(e, 'asset-doc')} 
      />
      <input 
        type="file" 
        ref={globalDocInputRef} 
        className="hidden" 
        accept="*/*" 
        multiple
        onChange={(e) => handleFileUpload(e, 'global-doc')} 
      />
    </div>
  );
};

export default MuralSucessoPage;
