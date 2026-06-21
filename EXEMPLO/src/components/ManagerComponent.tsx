import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Folder, 
  FolderOpen,
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Plus, 
  MoreVertical, 
  Search, 
  LayoutGrid, 
  List,
  Menu,
  ArrowLeft,
  Trash2,
  Palette,
  Briefcase,
  X,
  PanelLeft,
  Clock,
  LayoutDashboard,
  Star,
  Activity,
  FolderMinus,
  Pencil,
  FolderPlus,
  Pen,
  Paperclip,
  FileBarChart,
  Sun,
  Moon,
  Settings,
  Pin,
  EyeOff,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { organismEventBus } from '../services/organismEventBus';
import { Workspace as WS, Folder as FLD, Page as PG } from '../types';
import { PerfProfiler } from '../utils/perfProfiler';

interface FileItem {
  id: string;
  name: string;
  type: 'workspace' | 'folder' | 'document';
  color: string;
  icon?: string; // Emoji or Icon name
  iconType?: 'emoji' | 'lucide' | 'image';
  imageUrl?: string;
  children: FileItem[];
  content?: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt?: string;
  coverImage?: string | null;
  coverPosition?: number;
  docIcon?: string | null;
  isPinned?: boolean;
  isHidden?: boolean;
}

interface ManagerComponentProps {
  onToggleSidebar: () => void;
  onBackToEditor: () => void;
  theme?: string;
  onToggleTheme?: () => void;
}

const COLORS = [
  '#000000', // Absolute Black
  '#4285F4', // Google Blue
  '#EA4335', // Google Red
  '#FBBC05', // Google Yellow
  '#34A853', // Google Green
  '#2962FF', // Royal Blue
  '#D50000', // Crimson
  '#FF6D00', // Deep Orange
  '#304FFE', // Deep Indigo
  '#00BFA5', // Vibrant Teal
];

const FolderCard = ({ 
  item, 
  isHolding, 
  setHoldingItemId, 
  handleHoldStart, 
  handleHoldMove, 
  handleHoldEnd, 
  setCurrentFolderId, 
  expandedFolders, 
  toggleFolder,
  setItemToDelete,
  setItemToMove,
  setItemToEdit,
  togglePin,
  renderIcon
}: { 
  item: FileItem, 
  isHolding: boolean,
  setHoldingItemId: (id: string | null) => void,
  handleHoldStart: (id: string, e: any) => void,
  handleHoldMove: (e: any) => void,
  handleHoldEnd: () => void,
  setCurrentFolderId: (id: string | null) => void,
  expandedFolders: Set<string>,
  toggleFolder: (id: string) => void,
  setItemToDelete: (item: FileItem) => void,
  setItemToMove: (item: FileItem) => void,
  setItemToEdit: (item: FileItem) => void,
  togglePin: (id: string) => void,
  renderIcon: (item: FileItem, size?: number) => React.ReactNode
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      key={item.id}
      whileHover={{ y: -5, scale: 1.02 }}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
      className={`group relative bg-white dark:bg-zinc-900/50 border-2 border-[var(--border)] rounded-[2.5rem] p-6 hover:shadow-xl transition-all cursor-pointer flex flex-col gap-4 overflow-hidden shadow-sm no-system-menu ${localExpanded ? 'ring-4 ring-[var(--primary)]/10 border-[var(--primary)]/50' : ''}`}
      style={{ borderColor: item.color }}
      onMouseDown={(e) => handleHoldStart(item.id, e)}
      onMouseMove={(e) => handleHoldMove(e)}
      onMouseUp={handleHoldEnd}
      onMouseLeave={handleHoldEnd}
      onTouchStart={(e) => handleHoldStart(item.id, e)}
      onTouchMove={(e) => handleHoldMove(e)}
      onTouchEnd={handleHoldEnd}
      onClick={(e) => {
        if (isHolding) return;
        setCurrentFolderId(item.id);
        if (!expandedFolders.has(item.id)) toggleFolder(item.id);
      }}
    >
      <AnimatePresence>
        {isHolding && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/10"
              onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-2xl flex flex-col items-center justify-center p-4 rounded-[2.5rem]"
            >
              <div className="grid grid-cols-2 gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToDelete(item);
                    setHoldingItemId(null);
                  }}
                  className="aspect-square bg-red-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-red-500/30"
                >
                  <Trash2 size={24} strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToMove(item);
                    setHoldingItemId(null);
                  }}
                  className="aspect-square bg-indigo-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-500/30"
                >
                  <Briefcase size={24} strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setItemToEdit(item);
                    setHoldingItemId(null);
                  }}
                  className="aspect-square bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-emerald-500/30"
                >
                  <Pencil size={24} strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(item.id);
                  }}
                  className={`aspect-square rounded-[1.5rem] flex items-center justify-center shadow-xl ${item.isPinned ? 'bg-amber-500 text-white border-2 border-amber-200' : 'bg-white text-amber-500 dark:bg-zinc-800'}`}
                >
                  <Pin size={24} strokeWidth={2.5} className={item.isPinned ? 'fill-current text-red-500' : ''} />
                </motion.button>
              </div>
              <X onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }} size={16} className="mt-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className={`w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center rounded-2xl transition-all duration-300 shadow-md border ${localExpanded ? 'bg-amber-500 text-white' : 'bg-white dark:bg-black/80 border-[var(--border)]'}`} style={{ borderColor: localExpanded ? undefined : item.color + '40' }}>
          {renderIcon(item, 28)}
        </div>
        
        <div className="flex -space-x-2">
          {(localExpanded ? item.children : item.children?.slice(0, 3))?.map((child: any, i: number) => (
            <div key={`prev-${item.id}-${child.id}`} className="w-6 h-6 rounded-full border-2 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm" style={{ zIndex: 10 - i }}>
              {renderIcon(child, 12)}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 dark:text-white text-xl truncate uppercase tracking-tighter leading-none flex items-center gap-2">
              {item.name}
              {item.isPinned && <Pin size={14} className="text-red-500 fill-current" />}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-black uppercase tracking-widest mt-2 px-0.5">
              {localExpanded ? 'Conteúdo Expandido' : 'Pasta de Destino'}
            </p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setLocalExpanded(!localExpanded);
            }}
            className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center transition-all duration-300 shadow-xl border-2 ${localExpanded ? 'bg-amber-500 text-white border-amber-400 rotate-180' : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-100 dark:border-white/10 hover:border-amber-500 hover:text-amber-500'}`}
          >
            {localExpanded ? <ChevronDown size={16} strokeWidth={3} /> : <ChevronUp size={16} strokeWidth={3} />}
          </button>
        </div>

        {/* Preview of items inside */}
        <div className={`space-y-1.5 pt-2 transition-all duration-500 ${localExpanded ? 'max-h-[300px] overflow-y-auto pr-2' : ''}`}>
          {(localExpanded ? item.children : item.children?.slice(0, 3)).map((child: any) => (
            <div key={`list-${item.id}-${child.id}`} className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all">
              <div className="opacity-50">{renderIcon(child, 10)}</div>
              <span className="truncate">{child.name}</span>
            </div>
          ))}
          {(!item.children || item.children.length === 0) && (
            <p className="text-[9px] text-slate-400 dark:text-zinc-500 italic">Pasta vazia</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5">
         <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
            {item.children?.length || 0} Itens
         </span>
         <ChevronRight size={14} className="text-slate-300" />
      </div>
    </motion.div>
  );
};

export default function ManagerComponent({ onToggleSidebar, onBackToEditor, theme = 'light', onToggleTheme }: ManagerComponentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const mapToItems = useCallback((workspaces: WS[]): FileItem[] => {
    return PerfProfiler.measure('ManagerComponent.mapToItems', () => {
      return workspaces.map(ws => {
        console.log("RENDER/REIDRATADO [ManagerComponent]: Workspace id=" + ws.id + " color=" + ws.color + " icon=" + ws.icon);
        return {
          id: ws.id,
          name: ws.name,
          type: 'workspace',
          color: ws.color || '#000000',
          icon: ws.icon || '📁',
          iconType: ws.iconType || 'emoji',
          imageUrl: ws.imageUrl || '',
          createdAt: new Date().toISOString(),
          isPinned: ws.isPinned,
          isHidden: ws.isHidden,
          children: ws.folders.map(f => ({
            id: f.id,
            name: f.name,
            type: 'folder',
            color: f.color || '#000000',
            icon: f.icon || '📁',
            iconType: f.iconType || 'emoji',
            imageUrl: f.imageUrl || '',
            createdAt: new Date().toISOString(),
            isPinned: f.isPinned,
            children: f.pages.map(p => ({
              id: p.id,
              name: p.title,
              type: 'document',
              color: '#10b981',
              content: p.content,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt,
              coverImage: p.coverImage,
              coverPosition: p.coverPosition,
              docIcon: p.icon,
              isPinned: p.isPinned,
              children: [],
              parentId: f.id
            })),
            parentId: ws.id
          })),
          parentId: null
        };
      });
    });
  }, []);

  const sortPinned = useCallback((list: FileItem[]): FileItem[] => {
    const sorted = [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
    return sorted.map(item => ({
      ...item,
      children: item.children ? sortPinned(item.children) : []
    }));
  }, []);

  const [items, setItems] = useState<FileItem[]>(() => sortPinned(mapToItems(documentService.getWorkspaces())));

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['ws-1', '1']));
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);
  const [isCreating, setIsCreating] = useState<{ parentId: string | null, type: 'workspace' | 'folder' | 'document' } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemColor, setNewItemColor] = useState(COLORS[0]);
  const [newItemIcon, setNewItemIcon] = useState('📁');
  const [newItemIconType, setNewItemIconType] = useState<'emoji' | 'lucide' | 'image'>('image');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  React.useEffect(() => {
    if (location.state && location.state.action) {
      const action = location.state.action;
      if (action === 'create-workspace') {
        setIsCreating({ parentId: null, type: 'workspace' });
      } else if (action === 'create-folder') {
        setIsCreating({ parentId: null, type: 'folder' });
      } else if (action === 'create-document') {
        setIsCreating({ parentId: null, type: 'document' });
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  React.useEffect(() => {
    if (isCreating) {
      if (isCreating.parentId) {
        setSelectedParentId(isCreating.parentId);
        const wsList = items.filter(i => i.type === 'workspace');
        const parentWs = wsList.find(ws => ws.id === isCreating.parentId || ws.children?.some(f => f.id === isCreating.parentId));
        if (parentWs) {
          setSelectedWorkspaceId(parentWs.id);
          const parentFolderId = isCreating.parentId !== parentWs.id ? isCreating.parentId : '';
          setSelectedFolderId(parentFolderId);
        } else {
          setSelectedWorkspaceId(null);
          setSelectedFolderId(null);
        }
      } else {
        setSelectedParentId(null);
        setSelectedWorkspaceId(null);
        setSelectedFolderId(null);
      }
    }
  }, [isCreating, items]);

  React.useEffect(() => {
    if (isCreating) {
      setNewItemName('');
      setNewItemColor(COLORS[0]);
      setNewItemIcon('📁');
      setNewItemIconType('image');
      setNewItemImageUrl('');
    }
  }, [isCreating]);
  const [showHeaderNewMenu, setShowHeaderNewMenu] = useState(false);
  const [isLocalNavOpen, setIsLocalNavOpen] = useState(false);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [holdingItemId, setHoldingItemId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [itemToMove, setItemToMove] = useState<FileItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<FileItem | null>(null);
  const holdTimer = React.useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = React.useRef<{ x: number, y: number } | null>(null);

  const [showHiddenWorkspaces, setShowHiddenWorkspaces] = useState(false);
  const [countdownItem, setCountdownItem] = useState<{ id: string; type: 'hide' | 'reveal' | 'unlock_hidden'; secondsLeft: number } | null>(null);
  const countdownIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [safeCode, setSafeCode] = useState<string>('');
  const [safeStatus, setSafeStatus] = useState<'idle' | 'granted' | 'error'>('idle');

  const playBeep = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  };

  const playSuccessChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const playNote = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };
      playNote(523.25, 0, 0.12);
      playNote(659.25, 0.08, 0.12);
      playNote(783.99, 0.16, 0.12);
      playNote(1046.50, 0.24, 0.25);
    } catch (e) {}
  };

  const playErrorSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const handleSafeSuccess = (item: { id: string; type: 'hide' | 'reveal' | 'unlock_hidden'; secondsLeft: number }) => {
    if (item.type === 'hide') {
      setItems(currentItems => {
        const updated = currentItems.map(itemToMod => {
          if (itemToMod.id === item.id) {
            return { ...itemToMod, isHidden: true };
          }
          return itemToMod;
        });
        syncWorkspaces(updated);
        return updated;
      });
    } else if (item.type === 'reveal') {
      setItems(currentItems => {
        const updated = currentItems.map(itemToMod => {
          if (itemToMod.id === item.id) {
            return { ...itemToMod, isHidden: false };
          }
          return itemToMod;
        });
        syncWorkspaces(updated);
        return updated;
      });
    } else if (item.type === 'unlock_hidden') {
      setShowHiddenWorkspaces(true);
    }
  };

  const startCountdownAction = (itemId: string, type: 'hide' | 'reveal' | 'unlock_hidden') => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setSafeCode('');
    setSafeStatus('idle');
    setCountdownItem({ id: itemId, type, secondsLeft: 15 });
  };

  const handleKeyPress = (num: string) => {
    if (safeStatus === 'granted') return;
    playBeep();
    setSafeCode(prev => {
      if (prev.length >= 3) return prev;
      return prev + num;
    });
  };

  // Safe Code monitor for side-effects when lock combination is registered
  React.useEffect(() => {
    if (safeCode.length === 3) {
      if (safeCode === '007') {
        setSafeStatus('granted');
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        playSuccessChime();
        const itemOnSuccess = countdownItem;
        const timer = setTimeout(() => {
          if (itemOnSuccess) {
            handleSafeSuccess(itemOnSuccess);
          }
          setCountdownItem(null);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        setSafeStatus('error');
        playErrorSound();
        const timer = setTimeout(() => {
          setSafeCode('');
          setSafeStatus('idle');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [safeCode, countdownItem]);

  // Handle countdown interval decrementing
  React.useEffect(() => {
    if (countdownItem) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownItem(prev => {
          if (!prev) return null;
          if (safeStatus === 'granted') {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return prev;
          }
          if (prev.secondsLeft <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return { ...prev, secondsLeft: 0 };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [countdownItem, safeStatus]);

  // Handle countdown timeout trigger
  React.useEffect(() => {
    if (countdownItem && countdownItem.secondsLeft === 0 && safeStatus !== 'granted' && safeStatus !== 'error') {
      setSafeStatus('error');
      playErrorSound();
      const timer = setTimeout(() => {
        setCountdownItem(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [countdownItem?.secondsLeft, safeStatus]);

  React.useEffect(() => {
    if (!countdownItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (safeStatus === 'granted') return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        playBeep();
        setSafeCode(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        setCountdownItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [countdownItem, safeStatus]);

  const toggleWorkspaceExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(expandedWorkspaces);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedWorkspaces(newSet);
  };

  const syncWorkspaces = (newItems: FileItem[]) => {
    const workspaces: WS[] = newItems.filter(i => i.type === 'workspace').map(ws => {
      const mapped = {
        id: ws.id,
        name: ws.name,
        isPinned: ws.isPinned,
        isHidden: ws.isHidden,
        color: ws.color,
        icon: ws.icon,
        iconType: ws.iconType,
        imageUrl: ws.imageUrl,
        folders: ws.children.map(f => {
          if (f.type === 'folder') {
            return {
              id: f.id,
              name: f.name,
              isPinned: f.isPinned,
              color: f.color,
              icon: f.icon,
              iconType: f.iconType,
              imageUrl: f.imageUrl,
              pages: f.children.filter(p => p.type === 'document').map(p => ({
                id: p.id,
                title: p.name,
                content: p.content || '',
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                coverImage: p.coverImage,
                coverPosition: p.coverPosition,
                icon: p.docIcon,
                isPinned: p.isPinned
              }))
            };
          }
          return null;
        }).filter(Boolean) as any
      };
      console.log("SALVANDO [ManagerComponent - syncWorkspaces]:", mapped);
      return mapped;
    });
    documentService.saveWorkspaces(workspaces);
  };
  
  const togglePin = (itemId: string) => {
    const toggle = (list: FileItem[]): FileItem[] => {
      return list.map(item => {
        if (item.id === itemId) {
          const newState = !item.isPinned;
          return { ...item, isPinned: newState };
        }
        if (item.children) {
          return { ...item, children: toggle(item.children) };
        }
        return item;
      });
    };
    
    const newItems = sortPinned(toggle(items));
    setItems(newItems);
    syncWorkspaces(newItems);
    setHoldingItemId(null);
  };

  const updateItem = (itemId: string, updates: Partial<FileItem>) => {
    const applyUpdates = (list: FileItem[]): FileItem[] => {
      return list.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: applyUpdates(item.children) };
        }
        return item;
      });
    };

    const newItems = applyUpdates(items);
    setItems(newItems);
    syncWorkspaces(newItems);
    setItemToEdit(null);
  };

  // Item selection handling (empty)
  React.useEffect(() => {
    setIsLocalNavOpen(false);
    
    // Inscrever-se no barramento de eventos para re-hidratar o estado local em qualquer mudança física externa, evitando stale state overwrites!
    const unsubscribe = organismEventBus.subscribe('managerChanged', () => {
      const freshWorkspaces = documentService.getWorkspaces();
      console.log("REIDRATADO [ManagerComponent - Event Subscription Listener]:", freshWorkspaces);
      setItems(sortPinned(mapToItems(freshWorkspaces)));
    });
    return () => unsubscribe();
  }, [sortPinned, mapToItems]);

  const getCurrentFolder = () => {
    if (!currentFolderId) return null;
    const findFolder = (list: FileItem[]): FileItem | null => {
      for (const item of list) {
        if (item.id === currentFolderId) return item;
        if (item.children) {
          const found = findFolder(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(items);
  };

  const getBreadcrumbs = () => {
    if (!currentFolderId) return [];
    const path: FileItem[] = [];
    const findPath = (list: FileItem[], targetId: string): boolean => {
      for (const item of list) {
        if (item.id === targetId) {
          path.push(item);
          return true;
        }
        if (item.children) {
          if (findPath(item.children, targetId)) {
            path.unshift(item);
            return true;
          }
        }
      }
      return false;
    };
    findPath(items, currentFolderId);
    return path;
  };

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEdit && itemToEdit) {
          setItemToEdit({ ...itemToEdit, imageUrl: result, iconType: 'image' });
        } else {
          setNewItemImageUrl(result);
          setNewItemIconType('image');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderIcon = (item: FileItem, size = 18) => {
    if (item.iconType === 'image' && item.imageUrl) {
      return <img src={item.imageUrl} alt="" className="rounded-lg object-cover flex-shrink-0 pointer-events-none select-none" style={{ width: size, height: size }} referrerPolicy="no-referrer" draggable={false} />;
    }
    if (item.iconType === 'emoji' && item.icon) {
      return <span className="flex-shrink-0 pointer-events-none select-none" style={{ fontSize: size }}>{item.icon}</span>;
    }
    
    const color = item.color || '#000000';
    const fillOpacity = theme === 'dark' ? 'ff' : '30';
    const iconStyle = { color, opacity: 1 };
    
    if (item.type === 'workspace') return <Briefcase size={size} style={iconStyle} fill={color + fillOpacity} className="flex-shrink-0 pointer-events-none select-none" />;
    if (item.type === 'folder') return <Folder size={size} style={iconStyle} fill={color + fillOpacity} className="flex-shrink-0 pointer-events-none select-none" />;
    return <FileText size={size} style={iconStyle} fill={color + fillOpacity} className="flex-shrink-0 pointer-events-none select-none" />;
  };

  const addItem = async (parentId: string | null, type: 'workspace' | 'folder' | 'document', name: string) => {
    let targetParentId = parentId;

    if (type === 'folder' && selectedParentId) {
      targetParentId = selectedParentId;
    }

    if (type === 'document') {
      const workspaces = documentService.getWorkspaces();
      const wsId = selectedWorkspaceId || parentId ? (workspaces.find(ws => ws.id === (selectedWorkspaceId || parentId) || ws.folders.some(f => f.id === (selectedWorkspaceId || parentId)))?.id || workspaces[0]?.id) : workspaces[0]?.id;
      
      let targetFolderId = null;
      if (selectedFolderId) {
        targetFolderId = selectedFolderId;
      } else {
        // Try to find the folder if parentId is a folder
        for (const ws of workspaces) {
          const folder = ws.folders.find(f => f.id === parentId);
          if (folder) {
            targetFolderId = folder.id;
            break;
          }
        }
        
        // If no folder found but we have a workspace, use first folder
        if (!targetFolderId && wsId) {
          const ws = workspaces.find(ws => ws.id === wsId);
          targetFolderId = ws?.folders[0]?.id || null;
        }
      }

      if (!wsId) {
        const defaultWs: any = {
          id: 'ws-' + Math.random().toString(36).substr(2, 9),
          name: 'Novo Workspace',
          folders: [
            {
              id: 'f-' + Math.random().toString(36).substr(2, 9),
              name: 'Nova Pasta',
              pages: []
            }
          ]
        };
        const updatedWorkspaces = [...workspaces, defaultWs];
        documentService.saveWorkspaces(updatedWorkspaces);
        const newPage = documentService.addPage(defaultWs.id, defaultWs.folders[0].id, name || 'Novo Documento', '');
        setItems(mapToItems(documentService.getWorkspaces()));
        navigate(`/editor/${newPage.id}`);
        return;
      }

      const newPage = documentService.addPage(wsId, targetFolderId, name || 'Novo Documento', '');
      
      // Refresh local items
      setItems(mapToItems(documentService.getWorkspaces()));
      
      // Redirect to editor
      navigate(`/editor/${newPage.id}`);
      return;
    }

    const newItem: FileItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || (type === 'workspace' ? 'Novo Workspace' : type === 'folder' ? 'Nova Pasta' : 'Novo Documento'),
      type,
      color: newItemColor,
      icon: newItemIcon,
      iconType: newItemIconType,
      imageUrl: newItemImageUrl,
      children: [],
      parentId: type === 'workspace' ? null : targetParentId,
      createdAt: new Date().toISOString()
    };

    const updateItems = (list: FileItem[]): FileItem[] => {
      if (!targetParentId || type === 'workspace') return [...list, newItem];
      return list.map(item => {
        if (item.id === targetParentId) {
          return { ...item, children: [...(item.children || []), newItem] };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };

    const newItems = updateItems(items);
    setItems(newItems);
    syncWorkspaces(newItems);

    setIsCreating(null);
    setNewItemName('');
  };

  const deleteItem = (id: string) => {
    const removeItem = (list: FileItem[]): FileItem[] => {
      return list.filter(item => {
        if (item.id === id) return false;
        if (item.children) item.children = removeItem(item.children);
        return true;
      });
    };
    const newItems = removeItem([...items]);
    setItems(newItems);
    syncWorkspaces(newItems);
  };

  const moveItem = (itemId: string, targetParentId: string | null) => {
    // 1. Get the item to move
    let itemMoving: FileItem | null = null;
    const findAndRemove = (list: FileItem[]): FileItem[] => {
      return list.filter(item => {
        if (item.id === itemId) {
          itemMoving = { ...item, parentId: targetParentId };
          return false;
        }
        if (item.children) item.children = findAndRemove(item.children);
        return true;
      });
    };

    const itemsWithoutTarget = findAndRemove([...items]);
    if (!itemMoving) return;

    // 2. Insert into target
    const insertIntoTarget = (list: FileItem[]): FileItem[] => {
      if (!targetParentId) return [...list, itemMoving!];
      return list.map(item => {
        if (item.id === targetParentId) {
          return { ...item, children: [...(item.children || []), itemMoving!] };
        }
        if (item.children) {
          return { ...item, children: insertIntoTarget(item.children) };
        }
        return item;
      });
    };

    const newItems = insertIntoTarget(itemsWithoutTarget);
    setItems(newItems);
    syncWorkspaces(newItems);
    setItemToMove(null);
  };

  const renderItem = (item: FileItem, depth = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isHolding = holdingItemId === item.id;

    return (
      <div key={item.id} className="w-full relative">
        <div 
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          className={`
            group relative flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer no-system-menu
            ${selectedItem?.id === item.id 
              ? 'bg-slate-100 dark:bg-white/10 shadow-sm' 
              : 'hover:bg-slate-50 dark:hover:bg-white/5'}
          `}
          style={{ marginLeft: `${depth * 1}rem` }}
          onMouseDown={(e) => handleHoldStart(item.id, e)}
          onMouseMove={(e) => handleHoldMove(e)}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={(e) => handleHoldStart(item.id, e)}
          onTouchMove={(e) => handleHoldMove(e)}
          onTouchEnd={handleHoldEnd}
          onClick={() => {
            if (isHolding) return;
            if (item.type === 'folder' || hasChildren) toggleFolder(item.id);
            setSelectedItem(item);
            if (item.type === 'document') {
              navigate(`/editor/${item.id}`);
            }
          }}
        >
          <AnimatePresence>
            {isHolding && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-black/5"
                  onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-2xl"
                >
                  <div className="grid grid-cols-2 gap-2 w-full max-w-[140px]">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToMove(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
                    >
                      <Briefcase size={16} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToEdit(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                    >
                      <Pencil size={16} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item.id);
                      }}
                      className={`aspect-square rounded-2xl flex items-center justify-center shadow-lg ${item.isPinned ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-white text-amber-500 shadow-white/10'}`}
                    >
                      <Pin size={16} strokeWidth={2.5} className={item.isPinned ? 'fill-current text-red-500' : ''} />
                    </motion.button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                    className="mt-2 p-1.5 rounded-full hover:bg-white/10 text-white/40 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div 
              className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded transition-colors"
              onClick={(e) => {
                if (item.type === 'folder' || hasChildren) {
                  e.stopPropagation();
                  toggleFolder(item.id);
                }
              }}
            >
              {hasChildren || item.type === 'folder' ? (
                isExpanded ? <ChevronDown size={14} className="text-slate-500 dark:text-white/40" /> : <ChevronRight size={14} className="text-slate-500 dark:text-white/40" />
              ) : (
                <div className="w-3.5" />
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {renderIcon(item)}
              <span className={`text-sm truncate ${item.type !== 'document' ? 'font-black' : 'font-bold'} text-slate-900 dark:text-white uppercase tracking-tighter`}>
                {item.name}
              </span>
              {item.isPinned && <Pin size={10} className="text-red-500 fill-current flex-shrink-0" rotate={45} />}
            </div>
          </div>
          
          <div className="hidden group-hover:flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating({ parentId: item.id, type: 'document' });
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
              title="Nova Página"
            >
              <FileText size={14} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating({ parentId: item.id, type: 'folder' });
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white"
              title="Nova Pasta"
            >
              <Folder size={14} />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-0.5">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleHoldStart = (id: string, e?: React.MouseEvent | React.TouchEvent) => {
    // Store starting position if event is provided
    if (e) {
      const pos = 'touches' in e 
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY } 
        : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
      touchStartPos.current = pos;
    }

    if (holdTimer.current) clearTimeout(holdTimer.current);
    
    holdTimer.current = setTimeout(() => {
      setHoldingItemId(id);
      touchStartPos.current = null;
    }, 4000); // 4000ms = 4 seconds as requested
  };

  const handleHoldMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touchStartPos.current || !holdTimer.current) return;
    
    const pos = 'touches' in e 
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY } 
      : { x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY };
    
    const dx = Math.abs(pos.x - touchStartPos.current.x);
    const dy = Math.abs(pos.y - touchStartPos.current.y);
    
    // If moved more than 5px, cancel (tighter threshold to avoid accidental triggers during slow scroll)
    if (dx > 5 || dy > 5) {
      handleHoldEnd();
    }
  };

  const handleHoldEnd = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    touchStartPos.current = null;
  };

  const renderGridItem = (item: FileItem) => {
    const isHolding = holdingItemId === item.id;
     if (item.type === 'workspace') {
      return (
        <motion.div
          layout
          key={item.id}
          whileHover={{ y: -5, scale: 1.02 }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          className="group relative bg-white/10 dark:bg-white/[0.01] backdrop-blur-lg border-2 dark:border-white/5 rounded-[2rem] p-6 hover:shadow-xl transition-all cursor-pointer flex flex-col gap-4 min-h-[200px] overflow-hidden shadow-sm no-system-menu"
          style={{ borderColor: item.color + '30' }}
          onMouseDown={(e) => handleHoldStart(item.id, e)}
          onMouseMove={(e) => handleHoldMove(e)}
          onMouseUp={handleHoldEnd}
          onMouseLeave={handleHoldEnd}
          onTouchStart={(e) => handleHoldStart(item.id, e)}
          onTouchMove={(e) => handleHoldMove(e)}
          onTouchEnd={handleHoldEnd}
          onClick={(e) => {
            if (isHolding) return;
            setCurrentFolderId(item.id);
            if (!expandedFolders.has(item.id)) toggleFolder(item.id);
          }}
        >
          <AnimatePresence>
            {isHolding && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] bg-black/10"
                  onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="absolute inset-0 z-[70] bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-6 rounded-[2rem]"
                >
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-red-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-500/30"
                    >
                      <Trash2 size={32} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToMove(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-indigo-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-500/30"
                    >
                      <Briefcase size={32} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToEdit(item);
                        setHoldingItemId(null);
                      }}
                      className="aspect-square bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-500/30"
                    >
                      <Pencil size={32} strokeWidth={2.5} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(item.id);
                      }}
                      className={`aspect-square rounded-[2rem] flex items-center justify-center shadow-xl ${item.isPinned ? 'bg-amber-500 text-white shadow-amber-500/30 border-4 border-amber-200' : 'bg-white text-amber-500 shadow-white/10 dark:bg-zinc-800'}`}
                    >
                      <Pin size={32} strokeWidth={2.5} className={item.isPinned ? 'fill-current text-red-500' : ''} />
                    </motion.button>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                    className="mt-6 font-black uppercase text-[10px] text-white/40 hover:text-white transition-all flex items-center gap-2"
                  >
                    <X size={14} /> Fechar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-5 blur-2xl transition-transform group-hover:scale-150" style={{ backgroundColor: item.color }} />
          
          <div className="flex items-start justify-between relative z-10">
            <div className="p-4 rounded-2xl bg-white dark:bg-black/40 shadow-inner border border-slate-100 dark:border-white/20" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : item.color + '20' }}>
              {renderIcon(item, 32)}
            </div>
          </div>
          
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl truncate flex items-center gap-2">
                {item.name}
                {item.isPinned && <Pin size={14} className="text-red-500 fill-current" />}
              </h3>
              <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white font-bold uppercase tracking-widest border border-slate-200 dark:border-white/20">
                Workspace
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-xs text-slate-500 dark:text-white font-medium opacity-60">
                {item.children.length} itens
              </span>
            </div>
          </div>
        </motion.div>
      );
    }

    if (item.type === 'folder') {
      return (
        <FolderCard 
          key={item.id} 
          item={item} 
          isHolding={isHolding}
          setHoldingItemId={setHoldingItemId}
          handleHoldStart={handleHoldStart}
          handleHoldMove={handleHoldMove}
          handleHoldEnd={handleHoldEnd}
          setCurrentFolderId={setCurrentFolderId}
          expandedFolders={expandedFolders}
          toggleFolder={toggleFolder}
          setItemToDelete={setItemToDelete}
          setItemToMove={setItemToMove}
          setItemToEdit={setItemToEdit}
          togglePin={togglePin}
          renderIcon={renderIcon}
        />
      );
    }

    return (
      <motion.div
        layout
        key={item.id}
        whileHover={{ y: -8, scale: 1.03 }}
        onContextMenu={(e) => e.preventDefault()}
        draggable={false}
        className="group relative bg-white dark:bg-zinc-900/50 border-2 border-[var(--border)] rounded-[2rem] p-4 sm:p-5 hover:shadow-2xl transition-all cursor-pointer flex flex-col gap-4 aspect-square sm:aspect-[4/5] overflow-hidden shadow-sm no-system-menu"
        style={{ borderColor: item.color + '40' }}
        onMouseDown={(e) => handleHoldStart(item.id, e)}
        onMouseMove={(e) => handleHoldMove(e)}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={(e) => handleHoldStart(item.id, e)}
        onTouchMove={(e) => handleHoldMove(e)}
        onTouchEnd={handleHoldEnd}
        onClick={(e) => {
          if (isHolding) return;
          navigate(`/editor/${item.id}`);
        }}
      >
        <AnimatePresence>
          {isHolding && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/10"
                onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="absolute inset-0 z-[70] bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-4 rounded-[2rem]"
              >
                <div className="grid grid-cols-2 gap-3 w-full">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                      setHoldingItemId(null);
                    }}
                    className="aspect-square bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20"
                  >
                    <Trash2 size={24} strokeWidth={2.5} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToMove(item);
                      setHoldingItemId(null);
                    }}
                    className="aspect-square bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20"
                  >
                    <Briefcase size={24} strokeWidth={2.5} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToEdit(item);
                      setHoldingItemId(null);
                    }}
                    className="aspect-square bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <Pencil size={24} strokeWidth={2.5} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(item.id);
                    }}
                    className={`aspect-square rounded-2xl flex items-center justify-center shadow-lg ${item.isPinned ? 'bg-amber-500 text-white border-2 border-amber-200' : 'bg-white text-amber-500 dark:bg-zinc-800'}`}
                  >
                    <Pin size={24} strokeWidth={2.5} className={item.isPinned ? 'fill-current text-red-500' : ''} />
                  </motion.button>
                </div>
                <X onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }} size={14} className="mt-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Abstract Document Preview */}
        <div className="flex-1 overflow-hidden pointer-events-none relative rounded-3xl border-2 border-[var(--border)] bg-slate-50/50 dark:bg-black/20 p-6 shadow-inner group-hover:border-[var(--primary)]/20 transition-colors">
          <div className="space-y-3 opacity-20 group-hover:opacity-60 transition-opacity">
            <div className="h-2.5 w-2/3 bg-slate-400 rounded-full" />
            <div className="h-2 w-full bg-slate-300 rounded-full" />
            <div className="h-2 w-[90%] bg-slate-300 rounded-full" />
            <div className="h-2 w-[95%] bg-slate-300 rounded-full" />
            <div className="h-2 w-[85%] bg-slate-300 rounded-full" />
            <div className="mt-6 h-2.5 w-1/3 bg-slate-400 rounded-full" />
            <div className="h-2 w-full bg-slate-300 rounded-full" />
            <div className="h-2 w-[80%] bg-slate-300 rounded-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Action Overlay Icon */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:translate-y-0 translate-y-8">
            <div className="w-16 h-16 rounded-[2rem] bg-[var(--primary)] text-white shadow-2xl shadow-[var(--primary)]/40 flex items-center justify-center rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <FileText size={32} strokeWidth={1.5} />
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 border-2 border-zinc-200 dark:border-white/10 transition-all group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 flex items-center justify-center text-zinc-400 group-hover:text-indigo-500">
              {renderIcon(item, 24)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                {item.name}
                {item.isPinned && <Pin size={10} className="text-red-500 fill-current" />}
              </h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-[0.2em] mt-2">Documento Digital</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-100 dark:border-white/5">
            <div className="flex gap-1.5">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
               <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
               <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
               <span>REV 4.0</span>
               <div className="w-[1px] h-3 bg-zinc-200 dark:bg-zinc-800" />
               <ChevronRight size={12} />
            </div>
          </div>
        </div>
      </motion.div>
    );

  };

  const currentFolder = getCurrentFolder();
  const breadcrumbs = getBreadcrumbs();
  const displayItems = currentFolder ? (currentFolder.children || []) : items;

  const folders = displayItems.filter(i => i.type === 'folder');
  const documents = displayItems.filter(i => i.type === 'document');
  const workspaces = displayItems.filter(i => i.type === 'workspace');

  // Derive recent items
  const getAllPages = (list: FileItem[]): FileItem[] => {
    let pages: FileItem[] = [];
    list.forEach(item => {
      if (item.type === 'document') pages.push(item);
      if (item.children) pages = [...pages, ...getAllPages(item.children)];
    });
    return pages;
  };

  const recentDocuments = getAllPages(items).slice(-4).reverse();

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <div className={`flex flex-col h-screen text-[var(--foreground)] overflow-hidden font-sans relative ${theme === 'dark' ? 'dark bg-[#031315]' : ''}`}>
      {/* Layer 1: Background Environment - Standardized to z-0 */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--bg)]">
        {/* Base Image with Parallax */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute -inset-[10%]"
        >
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" 
            alt="Nature Background"
            className="w-full h-full object-cover opacity-50 transition-opacity duration-500"
            referrerPolicy="no-referrer"
          />
          {/* Blur & Overlays */}
          <div className={`absolute inset-0 backdrop-blur-[2px] ${theme === 'light' ? 'bg-white/40' : 'bg-black/40'} transition-colors duration-500`} />
          
          {/* Radial Focus - Light in the center */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg)_100%)]" />
          
          {/* Subtle Breathing Light Animation */}
          <motion.div 
            animate={{ 
              opacity: [0.03, 0.1, 0.03],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent pointer-events-none"
          />
        </motion.div>
      </div>

      {/* Header */}
      <header 
        id="manager-header"
        className="h-[47px] border-b border-[var(--border)] flex items-center justify-between px-4 bg-white/30 dark:bg-[#031315] backdrop-blur-xl dark:backdrop-blur-none z-50 transition-colors duration-300"
        style={{ backgroundColor: theme === 'dark' ? '#031315' : undefined }}
      >
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleSidebar}
            className="p-2.5 hover:bg-[var(--surface-hover)] rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
            title="Menu Principal"
          >
            <Menu size={20} />
          </button>
        </div>
          
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center bg-[var(--surface)] rounded-xl p-1 border border-[var(--border)] flex-shrink-0">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}
              title="Visualização em Grade"
            >
              <LayoutGrid size={14} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[var(--bg)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted)]'}`}
              title="Visualização em Lista"
            >
              <List size={14} />
            </button>
          </div>

          <div className="h-6 w-[1px] bg-[var(--border)] mx-1" />

          {onToggleTheme && (
            <button 
              onClick={onToggleTheme}
              className="p-2.5 hover:bg-[var(--surface-hover)] rounded-xl transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <button 
            onClick={() => setIsLocalNavOpen(!isLocalNavOpen)}
            className={`p-2.5 rounded-xl transition-all ${isLocalNavOpen ? 'bg-[var(--surface-hover)] text-[var(--foreground)]' : 'hover:bg-[var(--surface-hover)] text-[var(--muted)]'}`}
            title={isLocalNavOpen ? "Recolher Navegação" : "Expandir Navegação"}
          >
            <FolderOpen size={18} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowHeaderNewMenu(!showHeaderNewMenu)}
              className={`p-2.5 rounded-xl transition-all ${showHeaderNewMenu ? 'bg-indigo-500 text-white shadow-lg' : 'hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
              title="Novo Item"
            >
              <Plus size={20} />
            </button>

            <AnimatePresence>
              {showHeaderNewMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[16001]" 
                    onClick={() => setShowHeaderNewMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-[#111111]/95 border border-[#eee] dark:border-white/10 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.3)] z-[16002] overflow-hidden p-1.5 backdrop-blur-3xl"
                  >
                    <div className="px-4 py-3 mb-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">Criar Novo</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsCreating({ parentId: null, type: 'workspace' });
                        setShowHeaderNewMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <LayoutDashboard size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Workspace</span>
                        <span className="text-[9px] text-slate-500 dark:text-white/40 font-bold tracking-wide">Espaço Central</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsCreating({ parentId: currentFolderId, type: 'folder' });
                        setShowHeaderNewMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FolderMinus size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Pasta</span>
                        <span className="text-[9px] text-slate-500 dark:text-white/40 font-bold tracking-wide">Sub-ambiente</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsCreating({ parentId: currentFolderId, type: 'document' });
                        setShowHeaderNewMenu(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Documento</span>
                        <span className="text-[9px] text-slate-500 dark:text-white/40 font-bold tracking-wide">Página de Notas</span>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative lg:flex-row-reverse">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {isLocalNavOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLocalNavOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar (Local File Tree) */}
        <aside className={`
          fixed lg:relative z-40 h-full lg:h-auto right-0
          w-72 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#031315]/80 backdrop-blur-3xl shadow-[-20px_0_50px_rgba(0,0,0,0.05)]
          flex flex-col transition-all duration-300 ease-in-out
          ${isLocalNavOpen ? 'translate-x-0' : 'translate-x-full lg:w-0 lg:opacity-0 lg:border-none'}
        `}>
          <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-white/5 mb-2">
            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Navegação</span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setIsCreating({ parentId: null, type: 'workspace' })}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white/60 transition-colors"
                title="Novo Workspace"
              >
                <Briefcase size={14} />
              </button>
              <button 
                onClick={() => setIsCreating({ parentId: currentFolderId, type: 'folder' })}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white/60 transition-colors"
                title="Nova Pasta"
              >
                <Folder size={14} />
              </button>
              <button 
                onClick={() => setIsCreating({ parentId: currentFolderId, type: 'document' })}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white/60 transition-colors"
                title="Novo Documento"
              >
                <FileText size={14} />
              </button>
              <button 
                onClick={() => setIsLocalNavOpen(false)}
                className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white/60"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 pb-4 no-scrollbar">
            {items.map(item => renderItem(item))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-12 bg-transparent no-scrollbar relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs (only if in folder) */}
            {currentFolder && (
              <nav className="flex items-center gap-2 mb-8 text-sm">
                <button 
                  onClick={() => setCurrentFolderId(null)}
                  className="bg-[var(--surface)] px-3 py-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-all flex items-center gap-2 border border-[var(--border)]"
                >
                  <LayoutDashboard size={14} />
                  <span>Raiz</span>
                </button>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={crumb.id}>
                    <ChevronRight size={14} className="text-[var(--muted)]" />
                    <button 
                      onClick={() => setCurrentFolderId(crumb.id)}
                      className={`hover:text-[var(--foreground)] transition-colors ${idx === breadcrumbs.length - 1 ? 'text-[var(--foreground)] font-semibold' : 'text-[var(--muted)]'}`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </nav>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
              <div className="min-w-0 flex-1">
                {currentFolder && (
                  <>
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter truncate leading-none text-[var(--foreground)]">
                      {currentFolder.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="h-1 w-12 bg-slate-600 dark:bg-white/40 rounded-full flex-shrink-0" />
                      <p className="text-slate-500 dark:text-white/50 text-[10px] font-black uppercase tracking-[0.2em] truncate">
                        Navegando na Estrutura
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 w-full sm:w-auto pb-2 sm:pb-0">
              </div>
            </div>

            {/* Notion-style Sections */}
            <div className="space-y-16">
      {/* Root Content Section */}
      {!currentFolder && (
        <div className="space-y-16 mt-4">
          {/* Workspaces Section */}
          <section className="w-full">
            <div className="mb-8 px-2">
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-2">
                {items.filter(i => i.type === 'workspace' && !i.isHidden).map(workspace => {
                  const isExpanded = expandedWorkspaces.has(workspace.id);
                  const isHolding = holdingItemId === workspace.id;
                  const hasItems = workspace.children.length > 0;
                  
                  return (
                    <motion.div 
                      key={workspace.id}
                      layout
                      whileHover={{ y: -8, scale: 1.01 }}
                      className={`group relative flex flex-col gap-0 shadow-2xl transition-all duration-500 w-full overflow-hidden rounded-[2.5rem] border-2 bg-white/10 dark:bg-white/[0.01] backdrop-blur-lg dark:border-black`}
                      style={{ 
                        borderColor: theme === 'dark' ? '#000000' : workspace.color + '20',
                        boxShadow: `0 20px 40px -12px rgba(0,0,0,0.5)`,
                        minHeight: isHolding ? '420px' : 'auto',
                      }}
                      onMouseDown={(e) => handleHoldStart(workspace.id, e)}
                      onMouseMove={(e) => handleHoldMove(e)}
                      onMouseUp={handleHoldEnd}
                      onMouseLeave={handleHoldEnd}
                      onTouchStart={(e) => handleHoldStart(workspace.id, e)}
                      onTouchMove={(e) => handleHoldMove(e)}
                      onTouchEnd={handleHoldEnd}
                    >
                      <AnimatePresence>
                        {isHolding && (
                          <>
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-[60] bg-black/10"
                              onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                            />
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.1 }}
                              className="absolute inset-0 z-[70] bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-6 rounded-[2.5rem]"
                            >
                              <div className="grid grid-cols-2 gap-4 w-full max-w-[300px]" style={{ paddingRight: '0px', marginRight: '0px', paddingLeft: '11px' }}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToDelete(workspace);
                                    setHoldingItemId(null);
                                  }}
                                  className="aspect-square bg-red-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-500/30 font-black"
                                  style={{
                                    width: '123.17699999999999px',
                                    height: '123.17699999999999px',
                                    marginTop: '10px'
                                  }}
                                >
                                  <Trash2 size={32} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToEdit(workspace);
                                    setHoldingItemId(null);
                                  }}
                                  className="aspect-square bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-500/30 font-black"
                                  style={{
                                    width: '123.17699999999999px',
                                    height: '123.17699999999999px',
                                    marginTop: '10px'
                                  }}
                                >
                                  <Pencil size={32} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    togglePin(workspace.id);
                                  }}
                                  className={`aspect-square rounded-[2rem] flex items-center justify-center shadow-xl ${workspace.isPinned ? 'bg-amber-500 text-white border-2 border-amber-100 shadow-amber-500/30' : 'bg-white text-amber-500 shadow-white/10 dark:bg-zinc-800'}`}
                                  style={{
                                    width: '123.17699999999999px',
                                    height: '123.17699999999999px',
                                    marginTop: '0px'
                                  }}
                                >
                                  <Pin size={32} strokeWidth={2.5} className={workspace.isPinned ? 'fill-current text-red-500' : ''} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHoldingItemId(null);
                                  }}
                                  className="aspect-square bg-white/10 text-white rounded-[2rem] flex items-center justify-center border border-white/20 backdrop-blur-md"
                                  style={{
                                    width: '123.17699999999999px',
                                    height: '123.17699999999999px'
                                  }}
                                >
                                  <X size={32} strokeWidth={2.5} />
                                </motion.button>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHoldingItemId(null);
                                  startCountdownAction(workspace.id, 'hide');
                                }}
                                className="w-full max-w-[200px] mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-black/40 hover:bg-black/50 border border-red-500/20 text-red-400 hover:text-red-300 font-black text-[10px] uppercase tracking-widest leading-none shadow-lg cursor-pointer"
                              >
                                <EyeOff size={14} />
                                Ocultar Workspace
                              </motion.button>
                              <p className="mt-4 font-black uppercase text-[10px] text-white/40 tracking-[0.2em]">Gerenciar</p>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
  
                      {/* Decorative Background */}
                      <div 
                        className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full opacity-[0.05] blur-[100px] group-hover:opacity-15 transition-opacity duration-700" 
                        style={{ backgroundColor: workspace.color }} 
                      />

                      <div className="p-6 pb-1 flex flex-col flex-1 relative z-10">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-[50px] h-[50px] flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm"
                              style={{ backgroundColor: workspace.color + '30', border: `1px solid ${workspace.color}50`, boxShadow: `0 4px 15px rgba(0,0,0,0.4)` }}
                            >
                              {renderIcon(workspace, 22)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-black text-lg tracking-tight uppercase leading-tight break-words text-slate-900 dark:text-white"
                                style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
                              >
                                {workspace.name}
                                {workspace.isPinned && <Pin size={14} className="text-red-500 fill-current ml-2 inline-block" />}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: workspace.color }} />
                                <span 
                                  className="text-[8px] text-slate-500 dark:text-[#9a9a9a] font-black uppercase tracking-[0.2em]"
                                  style={{ color: theme === 'dark' ? '#9a9a9a' : undefined }}
                                >
                                  Workspace Ativo
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setHoldingItemId(workspace.id); }}
                            className="p-2 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex flex-row gap-1 items-center justify-center w-8 h-8 flex-shrink-0"
                            title="Opções"
                          >
                            <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-white" />
                            <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-white" />
                          </button>
                        </div>

                        {/* Simplified Document Graphic Representation */}
                        <div 
                          onClick={(e) => { e.stopPropagation(); toggleWorkspaceExpand(workspace.id, e); }}
                          className="flex-1 flex items-center justify-center py-2 perspective-[2000px] relative cursor-pointer group/folder"
                        >
                           {/* Pages appearing behind the folder */}
                           <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                              <AnimatePresence>
                                {isExpanded && [
                                  { id: 1, x: -90, y: -40, rotate: -15, delay: 0.1, color: '#000000' },
                                  { id: 2, x: 85, y: -30, rotate: 12, delay: 0.2, color: '#1a1a1a' },
                                  { id: 3, x: 0, y: -70, rotate: 0, delay: 0.3, color: '#000000' }
                                ].map((item) => (
                                  <motion.div
                                    key={`folder-paper-bg-${workspace.id}-${item.id}`}
                                    initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 0 }}
                                    animate={{ opacity: 1, x: item.x, y: item.y, rotate: item.rotate, scale: 1 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.8, rotate: 0 }}
                                    transition={{ type: 'spring', damping: 20, stiffness: 100, delay: item.delay }}
                                    className="absolute w-24 h-32 bg-white dark:bg-white/10 backdrop-blur-md rounded shadow-2xl border border-slate-200 dark:border-white/10 p-3 flex flex-col gap-2 overflow-hidden"
                                  >
                                    <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: item.color }} />
                                    <div className="space-y-1.5 mt-1 opacity-20">
                                      <div className="h-1 w-full bg-slate-400 rounded-full" />
                                      <div className="h-1 w-full bg-slate-400 rounded-full" />
                                      <div className="h-1 w-2/3 bg-slate-400 rounded-full" />
                                    </div>
                                    <div className="space-y-1 mt-2 opacity-10">
                                      <div className="h-1 w-full bg-slate-400 rounded-full" />
                                      <div className="h-1 w-5/6 bg-slate-400 rounded-full" />
                                    </div>
                                    <div className="mt-auto flex justify-between items-center">
                                      <div className="h-1.5 w-8 bg-slate-400 opacity-20 rounded" />
                                      <div className="w-4 h-4 rounded-full bg-slate-400 opacity-10" />
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                           </div>

                           <motion.div 
                             animate={{ 
                               rotateY: isExpanded ? 10 : 15,
                               rotateX: isExpanded ? -2 : -2,
                               scale: isExpanded ? 0.95 : 1,
                               y: isExpanded ? 15 : 0
                             }}
                             transition={{ type: 'spring', damping: 25, stiffness: 80 }}
                             className="relative z-10 w-44 h-28 preserve-3d"
                           >
                              {/* Simple Folder Structure */}
                              <div 
                                className="absolute inset-0 rounded-xl shadow-xl border border-white/20"
                                style={{ 
                                  backgroundColor: workspace.color === '#000000' ? '#080808' : workspace.color,
                                  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`,
                                  boxShadow: `inset 0 0 40px rgba(0,0,0,0.3)`
                                }}
                              />
                              
                              {/* Inner contents hint */}
                              <div className="absolute top-2 left-2 right-2 bottom-4 bg-black/20 rounded-lg transform -translate-y-1" />

                              {/* Shadow beneath papers */}
                              <div className="absolute inset-x-2 bottom-2 top-6 bg-black/60 rounded-xl blur-[2px]" />

                              {/* Front flap - Subtle motion only */}
                              <motion.div 
                                animate={{ 
                                  rotateX: isExpanded ? -15 : -3 
                                }}
                                style={{ transformOrigin: 'bottom', perspective: '1000px' }}
                                className="absolute inset-0 rounded-xl shadow-2xl border-t border-white/40"
                              >
                                 <div 
                                   className="absolute inset-0 rounded-xl overflow-hidden"
                                   style={{ 
                                     backgroundColor: workspace.color === '#000000' ? '#111111' : workspace.color,
                                     backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)'
                                   }}
                                 >
                                    {/* Texture effect */}
                                    <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.5),transparent)]" />

                                    {/* Icon on folder front */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-40 transform -translate-y-1 drop-shadow-lg">
                                       {workspace.icon === 'Folder' ? (
                                         <Folder size={44} className="text-white" strokeWidth={2.5} />
                                       ) : workspace.icon === 'Briefcase' ? (
                                         <Briefcase size={44} className="text-white" strokeWidth={2.5} />
                                       ) : (
                                         <LayoutGrid size={44} className="text-white" strokeWidth={2.5} />
                                       )}
                                    </div>
                                    
                                    {/* Folder Tab Improved */}
                                    <div 
                                      className="absolute top-0 left-0 w-20 h-6 -translate-y-[90%] rounded-t-xl"
                                      style={{ 
                                        backgroundColor: workspace.color === '#000000' ? '#111111' : workspace.color,
                                        backgroundImage: 'linear-gradient(to top, transparent, rgba(255,255,255,0.1))'
                                      }}
                                    >
                                       <div className="absolute top-0 inset-x-3 h-[1px] bg-white/30" />
                                    </div>
                                    
                                    {/* Highlights */}
                                    <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                                    <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/40 rounded-full border-t border-white/5" />
                                 </div>
                              </motion.div>
                           </motion.div>
                        </div>
                        
                        {/* Preview Items (visible when closed) */}
                        <AnimatePresence>
                          {!isExpanded && hasItems && (
                            <motion.div 
                              key={`preview-${workspace.id}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0, height: 100 }}
                              exit={{ opacity: 0, y: -10 }}
                              style={{ marginTop: '2px', marginBottom: '4px', paddingTop: '0px', paddingBottom: '2px' }}
                              className="px-2 space-y-1 overflow-hidden"
                            >
                              <div className="flex items-center justify-between px-2 mb-0.5">
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white">Pastas Recentes</span>
                                <div className="flex -space-x-2">
                                  {workspace.children.slice(0, 3).map((child, i) => (
                                    <div 
                                      key={`avatar-${child.id}`}
                                      className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center bg-white dark:bg-zinc-800"
                                      style={{ zIndex: 10 - i }}
                                    >
                                      {renderIcon(child, 10)}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {workspace.children.slice(0, 2).map(child => (
                                   <div 
                                    key={`grid-item-${child.id}`}
                                    className="p-2 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/preview shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (child.type !== 'document') setCurrentFolderId(child.id);
                                      else navigate(`/editor/${child.id}`);
                                    }}
                                  >
                                    <div 
                                      className="w-[30px] h-[30px] flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-700 shadow-sm transition-transform group-hover/preview:scale-110" 
                                      style={{ 
                                        backgroundColor: child.color + '15', 
                                        border: `1px solid ${child.color}40`,
                                        paddingTop: '3px',
                                        paddingLeft: '8px',
                                        paddingBottom: '4px',
                                        paddingRight: '8px'
                                      }}
                                    >
                                      {renderIcon(child, 12)}
                                    </div>
                                    <span 
                                      className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-[#949494] truncate"
                                      style={{ color: theme === 'dark' ? '#949494' : undefined }}
                                    >
                                      {child.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expanded Items List Full */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              key={`expanded-${workspace.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-slate-50 dark:bg-black/60 rounded-3xl mt-2 border border-slate-100 dark:border-white/20 shadow-inner"
                            >
                              <div className="p-2 space-y-0.5">
                                {workspace.children.map(child => (
                                  <div 
                                    key={child.id}
                                    className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer text-sm font-black border border-transparent hover:border-slate-100 dark:hover:border-white/20 group/item min-w-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (child.type !== 'document') setCurrentFolderId(child.id);
                                      else navigate(`/editor/${child.id}`);
                                    }}
                                  >
                                    <div 
                                      className="w-[34px] h-[34px] flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-black/60 shadow-sm group-hover/item:scale-110 transition-transform" 
                                      style={{ 
                                        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : child.color + '30', 
                                        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : child.color + '80'}`,
                                        paddingTop: '3px',
                                        paddingLeft: '8px',
                                        paddingBottom: '4px',
                                        paddingRight: '8px'
                                      }}
                                    >
                                      {renderIcon(child, 16)}
                                    </div>
                                    <span className="flex-1 truncate text-slate-600 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-white uppercase tracking-tight font-extrabold text-[12px]">{child.name}</span>
                                    <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 translate-x-[-10px] group-hover/item:translate-x-0 transition-all text-slate-400 dark:text-zinc-600 flex-shrink-0" />
                                  </div>
                                ))}

                                {!hasItems && (
                                  <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-600 mb-3">
                                      <Folder size={16} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nenhuma pasta ainda</p>
                                    <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-black leading-relaxed max-w-[140px] mt-1">Crie pastas para organizar seus projetos</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="p-4 pt-0 relative z-10">
                        <button 
                          onClick={() => setCurrentFolderId(workspace.id)}
                          className="w-full py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 group/btn relative overflow-hidden text-white"
                          style={{ 
                            backgroundColor: workspace.color,
                            boxShadow: `0 10px 20px -5px rgba(0,0,0,0.6)`
                          }}
                        >
                          <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity" />
                          <span className="relative z-10">Acessar Ambiente</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                
                {/* Add Workspace Box */}
                <button 
                  onClick={() => setIsCreating({ parentId: null, type: 'workspace' })}
                  className="border-2 border-dashed border-slate-200 dark:border-black rounded-[2.5rem] p-6 flex flex-col items-center justify-center gap-4 text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-white/40 bg-white/10 dark:bg-white/[0.02] backdrop-blur-lg transition-all group min-h-[250px] shadow-xl"
                  style={{ borderColor: theme === 'dark' ? '#000000' : undefined }}
                >
                  <div className="p-5 rounded-full bg-slate-50 dark:bg-zinc-800 transition-transform shadow-sm border border-slate-100 dark:border-white/10 group-hover:scale-125">
                    <Plus size={40} strokeWidth={3} className="text-slate-400 dark:text-black" style={{ color: theme === 'dark' ? '#000000' : undefined }} />
                  </div>
                  <div className="text-center w-full px-4">
                    <span 
                      className="font-black text-xl uppercase tracking-tighter block leading-none truncate text-slate-900 dark:text-white"
                      style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
                    >
                      Novo Workspace
                    </span>
                    <span 
                      className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-[#aaaaaa] block mt-2"
                      style={{ color: theme === 'dark' ? '#aaaaaa' : undefined }}
                    >
                      Clique para expandir
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="bg-[var(--surface)]/20 dark:bg-black/40 backdrop-blur-xl border border-[var(--border)] dark:border-black rounded-[2.5rem] overflow-hidden shadow-sm w-full relative z-10">
                {items.filter(i => i.type === 'workspace' && !i.isHidden).map((workspace, idx, arr) => (
                  <div 
                    key={workspace.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 hover:bg-slate-50/50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer overflow-hidden ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}
                    onClick={() => setCurrentFolderId(workspace.id)}
                    onMouseDown={(e) => handleHoldStart(workspace.id, e)}
                    onMouseMove={(e) => handleHoldMove(e)}
                    onMouseUp={handleHoldEnd}
                    onMouseLeave={handleHoldEnd}
                    onTouchStart={(e) => handleHoldStart(workspace.id, e)}
                    onTouchMove={(e) => handleHoldMove(e)}
                    onTouchEnd={handleHoldEnd}
                  >
                    <AnimatePresence>
                      {holdingItemId === workspace.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.05 }}
                          className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center gap-6 text-white px-8"
                        >
                          <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(workspace);
                              setHoldingItemId(null);
                            }}
                            className="p-4 bg-white dark:bg-white/20 text-red-600 dark:text-red-400 rounded-full shadow-2xl border-2 border-red-50 dark:border-red-500/20 backdrop-blur-md"
                          >
                            <Trash2 size={24} strokeWidth={2.5} />
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToMove(workspace);
                              setHoldingItemId(null);
                            }}
                            className="p-4 bg-white dark:bg-white/20 text-indigo-600 dark:text-indigo-400 rounded-full shadow-2xl border-2 border-indigo-50 dark:border-indigo-500/20 backdrop-blur-md"
                          >
                            <Briefcase size={24} strokeWidth={2.5} />
                          </motion.button>
                           <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToEdit(workspace);
                              setHoldingItemId(null);
                            }}
                            className="p-4 bg-white dark:bg-white/20 text-emerald-600 dark:text-emerald-400 rounded-full shadow-2xl border-2 border-emerald-50 dark:border-emerald-500/20 backdrop-blur-md"
                          >
                            <Pencil size={24} strokeWidth={2.5} />
                          </motion.button>
                          <motion.button
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', damping: 10, delay: 0.3 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoldingItemId(null);
                              startCountdownAction(workspace.id, 'hide');
                            }}
                            className="p-4 bg-white dark:bg-white/20 text-red-400 dark:text-red-400 rounded-full shadow-2xl border-2 border-slate-50 dark:border-red-500/20 backdrop-blur-md"
                          >
                            <EyeOff size={24} strokeWidth={2.5} />
                          </motion.button>
                          <div className="flex-1 text-left">
                            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Ações Integradas</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setHoldingItemId(null);
                            }}
                            className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest"
                          >
                            Cancelar
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                      <div 
                        className="p-3 sm:p-4 rounded-xl bg-white dark:bg-black/20 shadow-inner border-2 dark:border-white/5 flex-shrink-0 transition-all duration-500"
                        style={{ backgroundColor: workspace.color + '10', borderColor: workspace.color + '20' }}
                      >
                        {renderIcon(workspace, 24)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 
                          className="font-black text-lg sm:text-2xl tracking-tighter uppercase leading-none truncate text-slate-900 dark:text-white flex items-center gap-2"
                          style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
                        >
                          {workspace.name}
                          {workspace.isPinned && <Pin size={18} className="text-red-500 fill-current" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 min-w-0">
                          <span 
                            className="text-[8px] sm:text-[9px] text-slate-500 dark:text-[#9a9a9a] font-black uppercase tracking-[0.3em] truncate"
                            style={{ color: theme === 'dark' ? '#9a9a9a' : undefined }}
                          >
                            Ambiente Ativo
                          </span>
                          <span className="text-slate-300 dark:text-zinc-700 text-xs flex-shrink-0">•</span>
                          <span className="text-xs text-slate-600 dark:text-white font-bold flex-shrink-0">{workspace.children.length} itens</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 transition-opacity mt-4 sm:mt-0">
                      <ChevronRight size={24} className="text-slate-300 dark:text-white group-hover:translate-x-1 transition-transform" style={{ color: theme === 'dark' ? '#ffffff' : undefined }} />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => setIsCreating({ parentId: null, type: 'workspace' })}
                  className="w-full p-8 flex items-center justify-center gap-3 text-slate-400 dark:text-white/40 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-all group border-t border-slate-100 dark:border-white/5"
                >
                  <Plus size={20} strokeWidth={3} className="text-slate-400 dark:text-white/60" />
                  <span className="font-black text-xs uppercase tracking-widest text-slate-500 dark:text-white/60">Adicionar Workspace</span>
                </button>
              </div>
            )}
          </section>

          {/* Root-level Folders & Pages Section (Moved further down as requested) */}
        </div>
      )}

              {/* All Items Section (Grid/List) - Only visible when inside a folder, since workspaces have their own section above */}
              {currentFolder && (
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-[var(--surface)] text-[var(--muted)] flex-shrink-0">
                        {currentFolder?.type === 'workspace' ? <Briefcase size={20} /> : <Folder size={20} />}
                      </div>
                      <h2 className="text-xl font-bold tracking-tight truncate">
                        Conteúdo de {currentFolder.name}
                      </h2>
                    </div>
                    <div className="flex items-center justify-end gap-4 w-full sm:w-auto">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setIsCreating({ parentId: currentFolderId, type: 'folder' })}
                          className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                          title="Nova Pasta"
                        >
                          <Folder size={20} />
                        </button>
                        <button 
                          onClick={() => setIsCreating({ parentId: currentFolderId, type: 'document' })}
                          className="p-2.5 bg-[var(--foreground)] text-[var(--bg)] rounded-xl hover:opacity-90 transition-opacity"
                          title="Nova Página"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <div className="space-y-12">
                      {folders.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-4">Pastas</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {folders.map(item => renderGridItem(item))}
                          </div>
                        </div>
                      )}

                      {documents.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest mb-4">Documentos</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                            {documents.map(item => renderGridItem(item))}
                          </div>
                        </div>
                      )}

                      {displayItems.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-[var(--muted)] border-2 border-dashed border-[var(--border)] rounded-[2.5rem] bg-[var(--surface)]/20">
                          <div className="p-6 rounded-full bg-[var(--surface)] mb-6 shadow-sm">
                            <Plus size={48} className="opacity-10" />
                          </div>
                          <h3 className="font-bold text-xl text-[var(--foreground)]">Vazio por aqui</h3>
                          <p className="text-sm opacity-60 mt-2 max-w-xs text-center">Organize seu workspace criando pastas e documentos para seus projetos.</p>
                          <div className="flex gap-3 mt-8">
                            <button 
                              onClick={() => setIsCreating({ parentId: currentFolderId, type: 'folder' })}
                              className="px-6 py-3 border border-[var(--border)] rounded-2xl font-bold hover:bg-[var(--surface)] transition-colors"
                            >
                              Nova Pasta
                            </button>
                            <button 
                              onClick={() => setIsCreating({ parentId: currentFolderId, type: 'document' })}
                              className="px-6 py-3 bg-[var(--foreground)] text-[var(--bg)] rounded-2xl font-bold hover:opacity-90 transition-opacity"
                            >
                              Nova Página
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] overflow-hidden shadow-sm">
                      {displayItems.map((item, idx) => (
                        <div 
                          key={item.id}
                          className={`group relative flex items-center justify-between p-5 hover:bg-[var(--surface-hover)] transition-colors cursor-pointer overflow-hidden ${idx !== displayItems.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                          onClick={() => {
                            if (item.type !== 'document') setCurrentFolderId(item.id);
                            else navigate(`/editor/${item.id}`);
                          }}
                          onMouseDown={(e) => handleHoldStart(item.id, e)}
                          onMouseMove={(e) => handleHoldMove(e)}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={(e) => handleHoldStart(item.id, e)}
                          onTouchMove={(e) => handleHoldMove(e)}
                          onTouchEnd={handleHoldEnd}
                        >
                          <AnimatePresence>
                            {holdingItemId === item.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center gap-4 text-white px-6"
                              >
                                 <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToDelete(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-red-600 rounded-full shadow-xl border-2 border-red-50"
                                >
                                  <Trash2 size={20} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToMove(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-indigo-600 rounded-full shadow-xl border-2 border-indigo-50"
                                >
                                  <Briefcase size={20} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToEdit(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-emerald-600 rounded-full shadow-xl border-2 border-emerald-50"
                                >
                                  <Pencil size={20} strokeWidth={2.5} />
                                </motion.button>
                                <p className="font-black uppercase tracking-[0.2em] text-[9px] flex-1">Excluir?</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHoldingItemId(null);
                                  }}
                                  className="text-[9px] font-black text-white/40 hover:text-white uppercase"
                                >
                                  Cancelar
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-5 min-w-0 flex-1">
                            <div className="p-3 rounded-xl bg-[var(--bg)] shadow-sm flex-shrink-0">
                              {renderIcon(item, 22)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-lg block text-[var(--foreground)] truncate">{item.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded-full flex-shrink-0">
                                  {item.type}
                                </span>
                                <span className="text-[var(--muted)] text-xs flex-shrink-0">•</span>
                                <span className="text-xs text-[var(--muted)] truncate">
                                  {item.type !== 'document' ? `${item.children.length} itens` : 'Documento'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 transition-opacity">
                            <ChevronRight size={24} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </div>

          {/* Dashboard Visual (Secondary State - Moved to bottom) */}
          {!currentFolder && (
            <div className="space-y-24 pb-20">
              {/* Loose Items Section - Root-level Folders & Pages */}
              {(folders.length > 0 || documents.length > 0) && (
                <section className="w-full pt-16 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between mb-6 px-2">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 dark:text-white/70">Conteúdo Independente</h2>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest mt-1">Pastas e Páginas na Raiz</p>
                    </div>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="space-y-8 px-2">
                      {folders.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                          {folders.map(item => renderGridItem(item))}
                        </div>
                      )}
                      {documents.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                          {documents.map(item => renderGridItem(item))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--surface)]/20 dark:bg-black/60 backdrop-blur-xl border border-[var(--border)] dark:border-white/10 rounded-[2.5rem] overflow-hidden shadow-sm w-full relative z-10">
                      {[...folders, ...documents].map((item, idx, arr) => (
                        <div 
                          key={item.id}
                          className={`group relative flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-white/10 transition-colors cursor-pointer overflow-hidden ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-white/10' : ''}`}
                          onClick={() => {
                            if (holdingItemId === item.id) return;
                            if (item.type !== 'document') setCurrentFolderId(item.id);
                            else navigate(`/editor/${item.id}`);
                          }}
                          onMouseDown={(e) => handleHoldStart(item.id, e)}
                          onMouseMove={(e) => handleHoldMove(e)}
                          onMouseUp={handleHoldEnd}
                          onMouseLeave={handleHoldEnd}
                          onTouchStart={(e) => handleHoldStart(item.id, e)}
                          onTouchMove={(e) => handleHoldMove(e)}
                          onTouchEnd={handleHoldEnd}
                        >
                          <AnimatePresence>
                            {holdingItemId === item.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="absolute inset-0 z-50 bg-black/60 backdrop-blur-2xl flex items-center justify-center gap-4 text-white px-6"
                              >
                                 <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToDelete(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-red-600 rounded-full shadow-xl border-2 border-red-50"
                                >
                                  <Trash2 size={20} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10, delay: 0.1 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToMove(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-indigo-600 rounded-full shadow-xl border-2 border-indigo-50"
                                >
                                  <Briefcase size={20} strokeWidth={2.5} />
                                </motion.button>
                                <motion.button
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setItemToEdit(item);
                                    setHoldingItemId(null);
                                  }}
                                  className="p-3 bg-white text-emerald-600 rounded-full shadow-xl border-2 border-emerald-50"
                                >
                                  <Pencil size={20} strokeWidth={2.5} />
                                </motion.button>
                                <p className="font-black uppercase tracking-[0.2em] text-[9px] flex-1">Ações</p>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setHoldingItemId(null);
                                  }}
                                  className="text-[9px] font-black text-white/40 hover:text-white uppercase"
                                >
                                  Cancelar
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex items-center gap-6 min-w-0 flex-1">
                            <div 
                              className="w-[50px] h-[50px] flex-shrink-0 rounded-xl bg-white/80 dark:bg-black/60 shadow-sm flex items-center justify-center border border-transparent dark:border-white/10"
                              style={{ backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : item.color + '10' }}
                            >
                              {renderIcon(item, 24)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-xl block text-slate-900 dark:text-white truncate">{item.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white" style={{ opacity: theme === 'dark' ? 0.6 : undefined }}>
                                  {item.type === 'folder' ? 'Pasta Individual' : 'Página Solta'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight size={24} className="text-slate-300 dark:text-white group-hover:translate-x-1 transition-transform" style={{ opacity: theme === 'dark' ? 0.4 : undefined }} />
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="pt-20 border-t border-[var(--border)] mt-20 space-y-12"
                >
                  {/* Welcome & Search Combined */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-white/40 mb-2">
                         <Star size={14} className="text-slate-400 dark:text-white/40" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Insights do Sistema</span>
                      </div>
                      <h2 className="text-3xl font-black tracking-tight leading-none mb-4 uppercase truncate text-[var(--foreground)]">
                        Seu Ecossistema
                      </h2>
                      <p className="text-[var(--muted)] font-medium max-w-xl text-sm leading-relaxed">
                        Visualize o crescimento do seu ambiente de trabalho. Cada página e workspace é um passo em direção à sua organização ideal.
                      </p>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                      <div className="flex-1 sm:flex-none bg-[var(--surface)] dark:bg-white/5 backdrop-blur-md border border-[var(--border)] rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm min-w-[110px]">
                        <Activity size={20} className="text-slate-500 dark:text-white/60 flex-shrink-0" />
                        <div className="min-w-0">
                           <div className="text-xl font-black leading-none truncate text-[var(--foreground)]">{getAllPages(items).length}</div>
                           <div className="text-[8px] font-black text-[var(--muted)] uppercase tracking-tighter truncate">Páginas</div>
                        </div>
                      </div>
                      <div className="flex-1 sm:flex-none bg-[var(--surface)] dark:bg-white/5 backdrop-blur-md border border-[var(--border)] rounded-2xl p-3 sm:p-4 flex items-center gap-3 shadow-sm min-w-[110px]">
                        <Briefcase size={20} className="text-slate-500 dark:text-white/60 flex-shrink-0" />
                        <div className="min-w-0">
                           <div className="text-xl font-black leading-none truncate text-[var(--foreground)]">{items.length}</div>
                           <h2 className="text-[8px] font-black text-[var(--muted)] uppercase tracking-tighter truncate">Workspaces</h2>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Items Bento */}
                  <div className="grid grid-cols-1 gap-6">
                     <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">Atividades Recentes</h2>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {recentDocuments.map(doc => (
                            <motion.div
                              key={doc.id}
                              whileHover={{ y: -4, scale: 1.01 }}
                              onClick={() => {
                                navigate(`/editor/${doc.id}`);
                                setSelectedItem(doc);
                              }}
                              className="bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 rounded-3xl p-5 cursor-pointer hover:shadow-xl transition-all flex items-center gap-5 overflow-hidden group shadow-sm"
                            >
                              <div 
                                className="w-16 h-20 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden"
                                style={{ backgroundColor: doc.color + '15' }}
                              >
                                {renderIcon(doc, 32)}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-black text-slate-900 dark:text-white truncate uppercase tracking-tighter text-sm">{doc.name}</h4>
                                 <div className="text-[10px] text-slate-500 dark:text-white/40 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                   <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                   Documento
                                 </div>
                              </div>
                              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-white/20 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                                 <ChevronRight size={18} />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                     </div>
                  </div>
                </motion.div>

                {/* Secret Workspaces Section with 4s Lock protection */}
                <div className="pt-20 border-t border-[var(--border)] dark:border-white/5 mt-20 flex flex-col items-center">
                  {!showHiddenWorkspaces ? (
                    <motion.button
                      id="unhide-workspaces-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startCountdownAction('reveal-all', 'unlock_hidden')}
                      className="flex items-center gap-3 px-6 py-3 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-gray-300 font-bold text-xs uppercase tracking-widest transition-all shadow-sm cursor-pointer"
                    >
                      <Lock size={14} className="text-slate-400 dark:text-gray-400 animate-pulse" />
                      <span>Acessar Espaço Oculto</span>
                    </motion.button>
                  ) : (
                    <div className="w-full space-y-12">
                      {/* Premium Secure Sanctum Hero Banner */}
                      <div className="relative w-full rounded-[2.5rem] bg-slate-50 dark:bg-[#09090b] border border-slate-100 dark:border-white/5 py-12 md:py-8 px-6 md:px-12 overflow-hidden flex flex-col md:flex-row items-center justify-between select-none shadow-sm gap-8 md:gap-4 md:min-h-[350px]">
                        
                        {/* Left Side: Information and Actions */}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-40 relative">
                          {/* Ambient top tag similar to Skillfire header nav */}
                          <div className="flex items-center gap-2 mb-6 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-white/10 px-4 py-1.5 rounded-full shadow-sm text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                            <Lock size={12} className="text-red-500 animate-pulse" />
                            <span>Ambiente Protegido</span>
                          </div>

                          {/* Large gorgeous display heading */}
                          <h2 className="text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-[-0.04em] leading-tight mb-4 max-w-xl">
                            SANTUÁRIO <span className="font-extralight text-slate-400 dark:text-zinc-500 block md:inline">DE PRIVACIDADE</span>
                          </h2>

                          {/* Descriptive subtitle */}
                          <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400 max-w-xl md:max-w-md leading-relaxed uppercase tracking-wide mb-6 md:mb-8">
                            <span className="font-extrabold text-slate-700 dark:text-zinc-200">Santuário Seguro</span> é o espaço oculto estritamente confidencial para as suas ideias privadas.
                          </p>

                          {/* Sleek Dark Pill Button replicating the App Store button of reference */}
                          <div className="relative">
                            <button
                              id="hide-workspaces-btn"
                              onClick={() => setShowHiddenWorkspaces(false)}
                              className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-black text-[9px] uppercase tracking-[0.25em] transition-all shadow-[0_12px_24px_-10px_rgba(0,0,0,0.5)] dark:shadow-[0_12px_24px_-10px_rgba(255,255,255,0.1)] active:scale-95 cursor-pointer"
                            >
                              <EyeOff size={12} strokeWidth={2.5} />
                              Ocultar Novamente
                            </button>
                          </div>
                        </div>

                        {/* Right Side: Interactive bento graphic & smartphone device mockup simulation */}
                        <div className="flex-1 flex items-center justify-center relative w-full md:w-auto h-56 md:h-full z-30">
                          <div className="relative w-[335.713px] border-[1px] border-slate-200/50 dark:border-white/5 h-56 md:h-64 flex items-center justify-center overflow-hidden rounded-[40px]">
                            
                            {/* Spectrum of cards sliding and fading in the background represent workspace cards */}
                            <div className="absolute inset-x-0 h-full flex items-center justify-center gap-4 opacity-40 dark:opacity-20 pointer-events-none scale-90 sm:scale-100">
                              {[-3, -2, -1, 1, 2, 3].map((pos) => {
                                const colors = [
                                  'from-indigo-500 to-purple-600',
                                  'from-rose-500 to-orange-500',
                                  'from-emerald-400 to-teal-600',
                                  'from-amber-400 to-red-500',
                                  'from-cyan-405 to-blue-600',
                                  'from-violet-500 to-fuchsia-600'
                                ];
                                const colorClass = colors[Math.abs(pos) % colors.length];
                                return (
                                  <div 
                                    key={`mock-card-${pos}`}
                                    className={`w-28 h-36 bg-gradient-to-br ${colorClass} rounded-[1.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.25)] transform transition-all duration-700`}
                                    style={{
                                      transform: `translateX(${pos * 44}px) scale(${1 - Math.abs(pos) * 0.12}) rotate(${pos * 6}deg)`,
                                      opacity: 1 - Math.abs(pos) * 0.25,
                                      zIndex: 10 - Math.abs(pos),
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Beautiful gradient fog mask that fades out elements perfectly to the sides */}
                            <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-50 dark:from-[#09090b] to-transparent pointer-events-none z-20" />
                            <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-50 dark:from-[#09090b] to-transparent pointer-events-none z-20" />

                            {/* Central Floating widescreen secure cryptographic console */}
                            <div className="relative z-30 w-[314.376px] h-36 bg-gradient-to-br from-slate-950 via-zinc-900 to-black ring-4 ring-slate-900/10 dark:ring-white/5 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] p-6 overflow-hidden border border-white/10 flex items-center justify-between gap-6">
                              {/* Inner ambient mesh glow */}
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_left_bottom,rgba(239,68,68,0.1),transparent_60%)] pointer-events-none" />
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_top,rgba(99,102,241,0.08),transparent_60%)] pointer-events-none" />
                              
                              {/* Left Panel: Glowing Biometric / Cryptographic Dial Shield */}
                              <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
                                {/* Layered concentric security orbits */}
                                <div 
                                  className="absolute rounded-full animate-[spin_10s_linear_infinite]" 
                                  style={{
                                    color: '#9b9b9b',
                                    borderWidth: '1.663768px',
                                    borderColor: '#6c6c6c',
                                    borderStyle: 'dashed',
                                    width: '105.9974px',
                                    height: '105.9974px',
                                    marginLeft: '-8px',
                                    marginRight: '0px',
                                    marginTop: '-8px',
                                  }}
                                />
                                <div className="absolute inset-2 rounded-full border border-dashed border-indigo-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                                <div 
                                  className="absolute rounded-full bg-gradient-to-tr from-red-650/20 to-indigo-500/20 border border-white/10 flex items-center justify-center shadow-inner"
                                  style={{ width: '99.0071px', height: '55.0027px', marginLeft: '-7px', marginTop: '-3px' }}
                                >
                                  <Lock 
                                    className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
                                    style={{
                                      fontSize: '21px',
                                      width: '32.997699999999995px',
                                      height: '33.997699999999995px'
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Right Panel: Clean Elegant Status Layout */}
                              <div className="flex-1 flex flex-col justify-center min-w-0">
                                <span 
                                  className="text-[9px] font-black tracking-[0.25em] text-red-500 uppercase block"
                                  style={{ width: '144.049px' }}
                                >
                                  Criptografia Ativa
                                </span>
                                <h4 
                                  className="text-sm font-extrabold text-white uppercase tracking-tight mt-1 truncate"
                                  style={{ width: '144.049px' }}
                                >
                                  Santuário Seguro
                                </h4>
                                <div className="flex items-center gap-2 mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full w-2/3 bg-gradient-to-r from-red-500 via-indigo-500 to-emerald-400 rounded-full" />
                                </div>
                                <div className="flex items-center justify-between text-[8px] text-zinc-500 tracking-wider uppercase font-black mt-2">
                                  <span>STATUS: PROTEGIDO</span>
                                  <span 
                                    className="text-emerald-400 text-right"
                                    style={{ width: '94.6682px' }}
                                  >
                                    100% OFFLINE
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {items.filter(i => i.type === 'workspace' && i.isHidden).length === 0 ? (
                        <div className="text-center py-12 px-6 border border-dashed border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50/50 dark:bg-black/10 w-full">
                          <p className="text-xs text-slate-400 font-medium">Nenhum workspace ocultado neste ambiente temporário.</p>
                          <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-2">Use a opção "Ocultar" no menu de opções de um de seus workspaces ativos.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
                          {items.filter(i => i.type === 'workspace' && i.isHidden).map(workspace => {
                            const isExpanded = expandedWorkspaces.has(workspace.id);
                            const isHolding = holdingItemId === workspace.id;
                            const hasItems = workspace.children.length > 0;
                            
                            return (
                              <motion.div 
                                key={workspace.id}
                                layout
                                whileHover={{ y: -8, scale: 1.01 }}
                                className={`group relative flex flex-col gap-0 shadow-2xl transition-all duration-500 w-full overflow-hidden rounded-[2.5rem] border-2 bg-white/10 dark:bg-white/[0.01] backdrop-blur-lg dark:border-black`}
                                style={{ 
                                  borderColor: theme === 'dark' ? '#000000' : workspace.color + '20',
                                  boxShadow: `0 20px 40px -12px rgba(0,0,0,0.5)`,
                                  minHeight: isHolding ? '420px' : 'auto',
                                }}
                                onMouseDown={(e) => handleHoldStart(workspace.id, e)}
                                onMouseMove={(e) => handleHoldMove(e)}
                                onMouseUp={handleHoldEnd}
                                onMouseLeave={handleHoldEnd}
                                onTouchStart={(e) => handleHoldStart(workspace.id, e)}
                                onTouchMove={(e) => handleHoldMove(e)}
                                onTouchEnd={handleHoldEnd}
                              >
                                <AnimatePresence>
                                  {isHolding && (
                                    <>
                                      <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[60] bg-black/10"
                                        onClick={(e) => { e.stopPropagation(); setHoldingItemId(null); }}
                                      />
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="absolute inset-0 z-[70] bg-black/70 backdrop-blur-2xl flex flex-col items-center justify-center p-6 rounded-[2.5rem]"
                                      >
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-[300px]" style={{ paddingRight: '0px', marginRight: '0px', paddingLeft: '11px' }}>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setItemToDelete(workspace);
                                              setHoldingItemId(null);
                                            }}
                                            className="aspect-square bg-red-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-red-500/30 font-black"
                                            style={{
                                              width: '123.17699999999999px',
                                              height: '123.17699999999999px',
                                              marginTop: '10px'
                                            }}
                                          >
                                            <Trash2 size={32} strokeWidth={2.5} />
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setItemToEdit(workspace);
                                              setHoldingItemId(null);
                                            }}
                                            className="aspect-square bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-500/30 font-black"
                                            style={{
                                              width: '123.17699999999999px',
                                              height: '123.17699999999999px',
                                              marginTop: '10px'
                                            }}
                                          >
                                            <Pencil size={32} strokeWidth={2.5} />
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              togglePin(workspace.id);
                                            }}
                                            className={`aspect-square rounded-[2rem] flex items-center justify-center shadow-xl ${workspace.isPinned ? 'bg-amber-500 text-white border-2 border-amber-100 shadow-amber-500/30' : 'bg-white text-amber-500 shadow-white/10 dark:bg-zinc-800'}`}
                                            style={{
                                              width: '123.17699999999999px',
                                              height: '123.17699999999999px',
                                              marginTop: '0px'
                                            }}
                                          >
                                            <Pin size={32} strokeWidth={2.5} className={workspace.isPinned ? 'fill-current text-red-500' : ''} />
                                          </motion.button>
                                          <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setHoldingItemId(null);
                                            }}
                                            className="aspect-square bg-white/10 text-white rounded-[2rem] flex items-center justify-center border border-white/20 backdrop-blur-md"
                                            style={{
                                              width: '123.17699999999999px',
                                              height: '123.17699999999999px'
                                            }}
                                          >
                                            <X size={32} strokeWidth={2.5} />
                                          </motion.button>
                                        </div>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setHoldingItemId(null);
                                            startCountdownAction(workspace.id, 'reveal');
                                          }}
                                          className="w-full max-w-[200px] mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-black/40 hover:bg-black/50 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-black text-[10px] uppercase tracking-widest leading-none shadow-lg cursor-pointer"
                                        >
                                          <Eye size={14} />
                                          Tirar dos Ocultos
                                        </motion.button>
                                        <p className="mt-4 font-black uppercase text-[10px] text-white/40 tracking-[0.2em]">Gerenciar Oculto</p>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
            
                                {/* Decorative Background */}
                                <div 
                                  className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 rounded-full opacity-[0.05] blur-[100px] group-hover:opacity-15 transition-opacity duration-700" 
                                  style={{ backgroundColor: workspace.color }} 
                                />
                          
                                <div className="p-6 pb-1 flex flex-col flex-1 relative z-10">
                                  {/* Header */}
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-[50px] h-[50px] flex-shrink-0 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm"
                                        style={{ backgroundColor: workspace.color + '30', border: `1px solid ${workspace.color}50`, boxShadow: `0 4px 15px rgba(0,0,0,0.4)` }}
                                      >
                                        {renderIcon(workspace, 22)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 
                                          className="font-black text-lg tracking-tight uppercase leading-tight break-words text-slate-900 dark:text-white"
                                          style={{ color: theme === 'dark' ? '#ffffff' : undefined }}
                                        >
                                          {workspace.name}
                                          {workspace.isPinned && <Pin size={14} className="text-red-500 fill-current ml-2 inline-block" />}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                          <span 
                                            className="text-[8px] text-red-500 font-black uppercase tracking-[0.2em]"
                                          >
                                            Workspace Ocultado
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setHoldingItemId(workspace.id); }}
                                      className="p-2 transition-all duration-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full flex flex-row gap-1 items-center justify-center w-8 h-8 flex-shrink-0"
                                      title="Opções"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-white" />
                                      <div className="w-1 h-1 rounded-full bg-slate-600 dark:bg-white" />
                                    </button>
                                  </div>
                          
                                  {/* Simplified Document Graphic Representation */}
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); toggleWorkspaceExpand(workspace.id, e); }}
                                    className="flex-1 flex items-center justify-center py-2 perspective-[2000px] relative cursor-pointer group/folder"
                                  >
                                     {/* Pages appearing behind the folder */}
                                     <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                                        <AnimatePresence>
                                          {isExpanded && [
                                            { id: 1, x: -90, y: -40, rotate: -15, delay: 0.1, color: '#000000' },
                                            { id: 2, x: 85, y: -30, rotate: 12, delay: 0.2, color: '#1a1a1a' },
                                            { id: 3, x: 0, y: -70, rotate: 0, delay: 0.3, color: '#000000' }
                                          ].map((item) => (
                                            <motion.div
                                              key={`folder-paper-bg-hidden-${workspace.id}-${item.id}`}
                                              initial={{ opacity: 0, y: 20, scale: 0.8, rotate: 0 }}
                                              animate={{ opacity: 1, x: item.x, y: item.y, rotate: item.rotate, scale: 1 }}
                                              exit={{ opacity: 0, y: 20, scale: 0.8, rotate: 0 }}
                                              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: item.delay }}
                                              className="absolute w-24 h-32 bg-white dark:bg-white/10 backdrop-blur-md rounded shadow-2xl border border-slate-200 dark:border-white/10 p-3 flex flex-col gap-2 overflow-hidden"
                                            >
                                              <div className="h-1.5 w-3/4 rounded" style={{ backgroundColor: item.color }} />
                                              <div className="space-y-1.5 mt-1 opacity-20">
                                                <div className="h-1 w-full bg-slate-400 rounded-full" />
                                                <div className="h-1 w-full bg-slate-400 rounded-full" />
                                                <div className="h-1 w-2/3 bg-slate-400 rounded-full" />
                                              </div>
                                              <div className="space-y-1 mt-2 opacity-10">
                                                <div className="h-1 w-full bg-slate-400 rounded-full" />
                                                <div className="h-1 w-5/6 bg-slate-400 rounded-full" />
                                              </div>
                                              <div className="mt-auto flex justify-between items-center">
                                                <div className="h-1.5 w-8 bg-slate-400 opacity-20 rounded" />
                                                <div className="w-4 h-4 rounded-full bg-slate-400 opacity-10" />
                                              </div>
                                            </motion.div>
                                          ))}
                                        </AnimatePresence>
                                     </div>
                          
                                     <motion.div 
                                       animate={{ 
                                         rotateY: isExpanded ? 10 : 15,
                                         rotateX: isExpanded ? -2 : -2,
                                         scale: isExpanded ? 0.95 : 1,
                                         y: isExpanded ? 15 : 0
                                       }}
                                       transition={{ type: 'spring', damping: 25, stiffness: 80 }}
                                       className="relative z-10 w-44 h-28 preserve-3d"
                                     >
                                        {/* Simple Folder Structure */}
                                        <div 
                                          className="absolute inset-0 rounded-xl shadow-xl border border-white/20"
                                          style={{ 
                                            backgroundColor: workspace.color === '#000000' ? '#080808' : workspace.color,
                                            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`,
                                            boxShadow: `inset 0 0 40px rgba(0,0,0,0.3)`
                                          }}
                                        />
                                        
                                        {/* Inner contents hint */}
                                        <div className="absolute top-2 left-2 right-2 bottom-4 bg-black/20 rounded-lg transform -translate-y-1" />
                          
                                        {/* Shadow beneath papers */}
                                        <div className="absolute inset-x-2 bottom-2 top-6 bg-black/60 rounded-xl blur-[2px]" />
                          
                                        {/* Front flap - Subtle motion only */}
                                        <motion.div 
                                          animate={{ 
                                            rotateX: isExpanded ? -15 : -3 
                                          }}
                                          style={{ transformOrigin: 'bottom', perspective: '1000px' }}
                                          className="absolute inset-0 rounded-xl shadow-2xl border-t border-white/40"
                                        >
                                           <div 
                                             className="absolute inset-0 rounded-xl overflow-hidden"
                                             style={{ 
                                               backgroundColor: workspace.color === '#000000' ? '#111111' : workspace.color,
                                               backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)'
                                             }}
                                           >
                                              {/* Texture effect */}
                                              <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.5),transparent)]" />
                          
                                              {/* Icon on folder front */}
                                              <div className="absolute inset-0 flex items-center justify-center opacity-40 transform -translate-y-1 drop-shadow-lg">
                                                 {workspace.icon === 'Folder' ? (
                                                   <Folder size={44} className="text-white" strokeWidth={2.5} />
                                                 ) : workspace.icon === 'Briefcase' ? (
                                                   <Briefcase size={44} className="text-white" strokeWidth={2.5} />
                                                 ) : (
                                                   <LayoutGrid size={44} className="text-white" strokeWidth={2.5} />
                                                 )}
                                              </div>
                                              
                                              {/* Folder Tab Improved */}
                                              <div 
                                                className="absolute top-0 left-0 w-20 h-6 -translate-y-[90%] rounded-t-xl"
                                                style={{ 
                                                  backgroundColor: workspace.color === '#000000' ? '#111111' : workspace.color,
                                                  backgroundImage: 'linear-gradient(to top, transparent, rgba(255,255,255,0.1))'
                                                }}
                                              >
                                                 <div className="absolute top-0 inset-x-3 h-[1px] bg-white/30" />
                                              </div>
                                              
                                              {/* Highlights */}
                                              <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
                                              <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/40 rounded-full border-t border-white/5" />
                                           </div>
                                        </motion.div>
                                     </motion.div>
                                  </div>
                                  
                                  {/* Preview Items (visible when closed) */}
                                  <AnimatePresence>
                                    {!isExpanded && hasItems && (
                                      <motion.div 
                                        key={`hint-preview-${workspace.id}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0, height: 100 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{ marginTop: '2px', marginBottom: '4px', paddingTop: '0px', paddingBottom: '2px' }}
                                        className="px-2 space-y-1 overflow-hidden"
                                      >
                                        <div className="flex items-center justify-between px-2 mb-0.5">
                                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white">Pastas Ocultas</span>
                                          <div className="flex -space-x-2">
                                            {workspace.children.slice(0, 3).map((child, i) => (
                                              <div 
                                                key={`avatar-hidden-${child.id}`}
                                                className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm flex items-center justify-center bg-white dark:bg-zinc-800"
                                                style={{ zIndex: 10 - i }}
                                              >
                                                {renderIcon(child, 10)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          {workspace.children.slice(0, 2).map(child => (
                                             <div 
                                              key={`grid-item-hidden-${child.id}`}
                                              className="p-2 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all group/preview shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (child.type !== 'document') setCurrentFolderId(child.id);
                                                else navigate(`/editor/${child.id}`);
                                              }}
                                            >
                                              <div 
                                                className="w-[30px] h-[30px] flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-zinc-700 shadow-sm transition-transform group-hover/preview:scale-110" 
                                                style={{ 
                                                  backgroundColor: child.color + '15', 
                                                  border: `1px solid ${child.color}40`,
                                                  paddingTop: '3px',
                                                  paddingLeft: '8px',
                                                  paddingBottom: '4px',
                                                  paddingRight: '8px'
                                                }}
                                              >
                                                {renderIcon(child, 12)}
                                              </div>
                                              <span 
                                                className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-[#949494] truncate"
                                                style={{ color: theme === 'dark' ? '#949494' : undefined }}
                                              >
                                                {child.name}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                          
                                  {/* Expanded Items List Full */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div 
                                        key={`expanded-hidden-${workspace.id}`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-slate-50 dark:bg-black/60 rounded-3xl mt-2 border border-slate-100 dark:border-white/20 shadow-inner"
                                      >
                                        <div className="p-2 space-y-0.5">
                                          {workspace.children.map(child => (
                                            <div 
                                              key={child.id}
                                              className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer text-sm font-black border border-transparent hover:border-slate-100 dark:hover:border-white/20 group/item min-w-0"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (child.type !== 'document') setCurrentFolderId(child.id);
                                                else navigate(`/editor/${child.id}`);
                                              }}
                                            >
                                              <div 
                                                className="w-[34px] h-[34px] flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-black/60 shadow-sm group-hover/item:scale-110 transition-transform" 
                                                style={{ 
                                                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : child.color + '30', 
                                                  border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : child.color + '80'}`,
                                                  paddingTop: '3px',
                                                  paddingLeft: '8px',
                                                  paddingBottom: '4px',
                                                  paddingRight: '8px'
                                                }}
                                              >
                                                {renderIcon(child, 16)}
                                              </div>
                                              <span className="flex-1 truncate text-slate-600 dark:text-white group-hover/item:text-slate-900 dark:group-hover/item:text-white uppercase tracking-tight font-extrabold text-[12px]">{child.name}</span>
                                              <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-100 translate-x-[-10px] group-hover/item:translate-x-0 transition-all text-slate-400 dark:text-zinc-600 flex-shrink-0" />
                                            </div>
                                          ))}
                          
                                          {!hasItems && (
                                            <div className="py-8 flex flex-col items-center justify-center text-center px-4">
                                              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-600 mb-3">
                                                <Folder size={16} />
                                              </div>
                                              <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nenhuma pasta ainda</p>
                                              <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-black leading-relaxed max-w-[140px] mt-1">Crie pastas para organizar seus projetos</p>
                                            </div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                          
                                <div className="p-4 pt-0 relative z-10">
                                  <button 
                                    onClick={() => setCurrentFolderId(workspace.id)}
                                    className="w-full py-3.5 rounded-[1.25rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 group/btn relative overflow-hidden text-white"
                                    style={{ 
                                      backgroundColor: workspace.color === '#000000' ? '#111111' : workspace.color,
                                    }}
                                  >
                                    <div className="absolute inset-0 w-full h-full bg-black/10 group-hover/btn:bg-white/10 duration-350 transition-colors pointer-events-none" />
                                    <span>Entrar Oculto</span>
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {itemToEdit && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToEdit(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl mx-auto overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Editar {itemToEdit.type === 'workspace' ? 'Workspace' : itemToEdit.type === 'folder' ? 'Pasta' : 'Documento'}</h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mt-1">Personalize a identidade do item</p>
                </div>
                <button onClick={() => setItemToEdit(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400 dark:text-white/30">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-8 pb-4">
                {/* Preview Section */}
                <div className="bg-slate-50 dark:bg-white/[0.03] rounded-[2rem] border border-slate-100 dark:border-white/5 p-6 flex items-center gap-6 shadow-inner">
                  <div 
                    className="p-5 rounded-2xl shadow-xl flex-shrink-0"
                    style={{ backgroundColor: itemToEdit.color }}
                  >
                    {renderIcon(itemToEdit, 32)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{itemToEdit.name}</h3>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Visualização em Tempo Real</span>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-white/50 uppercase tracking-[0.2em] mb-3 block">Nome</label>
                    <input 
                      type="text"
                      value={itemToEdit.name}
                      onChange={(e) => setItemToEdit({ ...itemToEdit, name: e.target.value })}
                      placeholder="Identificação do item..."
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-white/10 focus:border-indigo-500 outline-none transition-all shadow-inner"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-white/50 uppercase tracking-[0.2em] mb-4 block">Cor de Identidade</label>
                    <div className="flex flex-wrap gap-3 px-4 py-2">
                      {COLORS.map(color => (
                        <button 
                          key={color}
                          type="button"
                          onClick={() => setItemToEdit({ ...itemToEdit, color })}
                          className={`w-10 h-10 rounded-xl transition-all ${
                            itemToEdit.color === color 
                              ? 'scale-110 shadow-lg ring-4 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-zinc-900' 
                              : 'opacity-40 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-white/50 uppercase tracking-[0.2em] mb-4 block flex items-center justify-between">
                      <span>Identidade Visual</span>
                      <div className="flex gap-1 bg-slate-100 dark:bg-white/20 p-0.5 rounded-lg">
                        <button 
                          onClick={() => setItemToEdit({ ...itemToEdit, iconType: 'emoji' })}
                          className={`px-2 py-1 rounded-[6px] text-[7px] font-black uppercase transition-all ${itemToEdit.iconType !== 'image' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          Ícone
                        </button>
                        <button 
                          onClick={() => setItemToEdit({ ...itemToEdit, iconType: 'image' })}
                          className={`px-2 py-1 rounded-[6px] text-[7px] font-black uppercase transition-all ${itemToEdit.iconType === 'image' ? 'bg-white dark:bg-zinc-800 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}`}
                        >
                          Imagem
                        </button>
                      </div>
                    </label>
                    
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4">
                      {itemToEdit.iconType !== 'image' ? (
                        <div className="grid grid-cols-6 gap-2">
                          {['📁', '📄', '🚀', '⭐', '🔥', '💡', '🎨', '💼', '📊', '🌐', '🛠️', '📝', '📂', '📜', '🎐', '🏷️', '📌', '📎'].map(emoji => (
                            <button 
                              key={emoji}
                              onClick={() => setItemToEdit({ ...itemToEdit, icon: emoji, iconType: 'emoji' })}
                              className={`p-2 text-xl rounded-xl transition-all ${itemToEdit.icon === emoji ? 'bg-white dark:bg-white/10 shadow-md ring-2 ring-indigo-500/20' : 'hover:bg-white dark:hover:bg-white/10'}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group relative overflow-hidden">
                            {itemToEdit.imageUrl ? (
                              <>
                                <img src={itemToEdit.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Activity size={24} className="text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-6">
                                <Activity size={32} className="text-slate-400 mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Upload da Galeria</p>
                              </div>
                            )}
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, true)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setItemToEdit(null)}
                  className="px-8 py-4 font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/5 rounded-2xl"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => updateItem(itemToEdit.id, { name: itemToEdit.name, color: itemToEdit.color, icon: itemToEdit.icon, iconType: itemToEdit.iconType, imageUrl: itemToEdit.imageUrl })}
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95"
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move Item Modal */}
      <AnimatePresence>
        {itemToMove && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToMove(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl mx-auto overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Mover Item</h2>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mt-1">Selecione o destino para: {itemToMove.name}</p>
                </div>
                <button onClick={() => setItemToMove(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400 dark:text-white/30">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {/* Root Destination */}
                <button 
                  onClick={() => moveItem(itemToMove.id, null)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-left bg-slate-50 dark:bg-white/5 group"
                >
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm text-slate-400 dark:text-white/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <LayoutDashboard size={20} />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block uppercase tracking-tight">Raiz (Solto)</span>
                    <span className="text-[10px] text-slate-500 dark:text-white/40 font-bold uppercase tracking-widest leading-none">Sem workspace pai</span>
                  </div>
                </button>

                <div className="py-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-white/40 mb-4 px-2">Destinos Disponíveis</p>
                  
                  <div className="space-y-2">
                    {items.map(item => {
                      // Don't show the item itself as a target, or its children
                      if (item.id === itemToMove.id) return null;
                      
                      // Workspaces and Folders are valid targets
                      if (item.type !== 'workspace' && item.type !== 'folder') return null;

                      const renderDest = (node: FileItem, depth = 0) => {
                        if (node.id === itemToMove.id) return null;
                        if (node.type !== 'workspace' && node.type !== 'folder') return null;

                        return (
                          <div key={node.id}>
                            <button 
                              onClick={() => moveItem(itemToMove.id, node.id)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 group transition-all text-left"
                              style={{ marginLeft: `${depth * 1.5}rem` }}
                            >
                              <div className="p-2 rounded-lg bg-white dark:bg-black border border-slate-100 dark:border-white/10 shadow-sm transition-transform group-hover:scale-110">
                                {node.type === 'workspace' ? <Briefcase size={16} className="text-indigo-500 dark:text-indigo-400" /> : <Folder size={16} className="text-orange-400 dark:text-orange-300" />}
                              </div>
                              <span className="font-bold text-sm text-slate-700 dark:text-white/80 group-hover:text-indigo-900 dark:group-hover:text-white truncate">{node.name}</span>
                            </button>
                            {node.children && node.children.some(c => c.type === 'folder') && (
                              <div className="mt-1">
                                {node.children.filter(c => c.type === 'folder').map(c => renderDest(c, depth + 1))}
                              </div>
                            )}
                          </div>
                        );
                      };

                      return renderDest(item);
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => setItemToMove(null)}
                  className="px-6 py-3 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#111111] border border-slate-200 dark:border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-5 sm:p-8 md:p-10 w-full max-w-md shadow-[0_40px_80px_rgba(0,0,0,0.5)] mx-auto overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Criar {isCreating.type === 'workspace' ? 'Workspace' : isCreating.type === 'folder' ? 'Pasta' : 'Documento'}
                </h2>
                <button onClick={() => setIsCreating(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400 dark:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-5 md:space-y-6 overflow-y-auto max-h-[65vh] md:max-h-[70vh] px-2 md:px-1 custom-scrollbar pb-2">
                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block">Nome Identificador</label>
                  <input 
                    autoFocus
                    type="text"
                    placeholder={`Nome do ${isCreating.type === 'workspace' ? 'workspace' : isCreating.type === 'folder' ? 'pasta' : 'página'}...`}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/20"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem(isCreating.parentId, isCreating.type, newItemName)}
                  />
                </div>

                {isCreating.type === 'folder' && (
                  <div>
                    <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block">Vincular ao Workspace</label>
                    <select
                      value={selectedParentId || ''}
                      onChange={(e) => setSelectedParentId(e.target.value || null)}
                      className="w-full bg-slate-50 dark:bg-[#151515] dark:text-white border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
                    >
                      <option value="" className="text-slate-900 dark:text-black">-- Selecione o Workspace --</option>
                      {items.filter(i => i.type === 'workspace').map(ws => (
                        <option key={ws.id} value={ws.id} className="text-slate-900 dark:text-black">
                          {ws.icon} {ws.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isCreating.type === 'document' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block">Vincular ao Workspace</label>
                      <select
                        value={selectedWorkspaceId || ''}
                        onChange={(e) => {
                          const wsId = e.target.value || null;
                          setSelectedWorkspaceId(wsId);
                          const ws = items.find(i => i.id === wsId);
                          if (ws && ws.children && ws.children.length > 0) {
                            setSelectedFolderId(ws.children.filter(c => c.type === 'folder')[0]?.id || '');
                          } else {
                            setSelectedFolderId('');
                          }
                        }}
                        className="w-full bg-slate-50 dark:bg-[#151515] dark:text-white border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
                      >
                        <option value="" className="text-slate-900 dark:text-black">-- Selecione o Workspace --</option>
                        {items.filter(i => i.type === 'workspace').map(ws => (
                          <option key={ws.id} value={ws.id} className="text-slate-905 dark:text-black">
                            {ws.icon} {ws.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedWorkspaceId && (
                      <div>
                        <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block">Vincular à Pasta (Opcional)</label>
                        <select
                          value={selectedFolderId || ''}
                          onChange={(e) => setSelectedFolderId(e.target.value || '')}
                          className="w-full bg-slate-50 dark:bg-[#151515] dark:text-white border border-slate-100 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-all font-bold text-sm text-slate-900 dark:text-white"
                        >
                          <option value="" className="text-slate-900 dark:text-black">Direto no Workspace (Sem Pasta)</option>
                          {(items.find(i => i.id === selectedWorkspaceId)?.children || [])
                            .filter(c => c.type === 'folder')
                            .map(f => (
                              <option key={f.id} value={f.id} className="text-slate-905 dark:text-black">
                                📂 {f.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-3 block">Espectro de Cor</label>
                  <div className="flex flex-nowrap gap-2 overflow-x-auto px-4 py-2 scrollbar-none snap-x pointer-events-auto">
                    {COLORS.map(color => (
                       <button 
                        key={color}
                        type="button"
                        onClick={() => setNewItemColor(color)}
                        className={`w-7 h-7 rounded-[8px] flex-shrink-0 snap-start transition-all relative ${
                          newItemColor === color 
                            ? 'scale-110 shadow-lg ring-2 ring-indigo-500 dark:ring-indigo-400 ring-offset-2 dark:ring-offset-zinc-900 border-none' 
                            : 'hover:scale-105 opacity-80 hover:opacity-100 border border-slate-200/50 dark:border-white/5'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block flex items-center justify-between">
                    <span>Identidade Visual</span>
                    <div className="flex gap-1 bg-slate-100 dark:bg-white/20 p-0.5 rounded-lg">
                      <button 
                        type="button"
                        onClick={() => setNewItemIconType('image')}
                        className={`px-2 py-1 rounded-[6px] text-[7px] font-black uppercase transition-all ${newItemIconType === 'image' ? 'bg-white dark:bg-zinc-805 shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-white hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        Imagem
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewItemIconType('emoji')}
                        className={`px-2 py-1 rounded-[6px] text-[7px] font-black uppercase transition-all ${newItemIconType === 'emoji' ? 'bg-white dark:bg-zinc-805 shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-white hover:text-slate-900 dark:hover:text-white'}`}
                      >
                        Ícone
                      </button>
                    </div>
                  </label>
                  
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl p-4">
                    {newItemIconType === 'image' ? (
                      <div className="space-y-4">
                        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group relative overflow-hidden">
                          {newItemImageUrl ? (
                            <>
                              <img src={newItemImageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Activity size={24} className="text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                              <Activity size={32} className="text-slate-400 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Upload da Galeria</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e)}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {['📁', '💼', '📊', '📈', '🚀', '🎯', '💡', '🧠', '⚡', '🔥', '⚙️', '🛠️', '📝', '📜', '🏷️', '📌', '🌎', '🎨', '🔍', '📅', '💬', '🏆', '💎', '🔒'].map(emoji => (
                          <button 
                            key={emoji}
                            type="button"
                            onClick={() => setNewItemIcon(emoji)}
                            className={`p-2 text-xl rounded-xl transition-all ${newItemIcon === emoji ? 'bg-white dark:bg-zinc-700 shadow-md ring-2 ring-indigo-500/20' : 'hover:bg-white dark:hover:bg-white/10'}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 dark:text-white uppercase tracking-[0.2em] mb-2 block">Tipo de Recurso</label>
                  <div className="flex gap-1.5 p-1.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl">
                    {[
                      { id: 'workspace', label: 'Workspace', color: 'indigo' },
                      { id: 'folder', label: 'Pasta', color: 'orange' },
                      { id: 'document', label: 'Página', color: 'emerald' }
                    ].map((type) => (
                      <button 
                        key={type.id}
                        type="button"
                        onClick={() => setIsCreating({ ...isCreating, type: type.id as any })}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          isCreating.type === type.id 
                            ? type.color === 'indigo' ? 'bg-indigo-600 text-white shadow-lg' :
                              type.color === 'orange' ? 'bg-orange-500 text-white shadow-lg' :
                              'bg-emerald-500 text-white shadow-lg'
                            : 'text-slate-500 dark:text-white hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 flex gap-4">
                <button 
                  onClick={() => setIsCreating(null)}
                  className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-slate-400 dark:text-white hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => addItem(isCreating.parentId, isCreating.type, newItemName)}
                  className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95"
                >
                  Criar Agora
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-[#111111] rounded-[3rem] p-10 w-full max-w-sm shadow-2xl text-center overflow-hidden border border-slate-100 dark:border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600" />
              <div className="p-8 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
                <Trash2 size={48} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-3">Excluir Item?</h3>
              <p className="text-slate-500 dark:text-white/40 text-sm font-medium leading-relaxed mb-10 px-4">
                O {itemToDelete.type === 'workspace' ? 'workspace' : itemToDelete.type === 'folder' ? 'pasta' : 'documento'} <span className="text-slate-900 dark:text-white font-black">"{itemToDelete.name}"</span> será removido permanentemente.
              </p>
              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    deleteItem(itemToDelete.id);
                    setItemToDelete(null);
                  }}
                  className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-500 transition-all"
                >
                  Confirmar Exclusão
                </motion.button>
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="w-full py-5 text-[var(--muted)] font-black uppercase tracking-[0.2em] text-[10px] hover:text-[var(--foreground)] transition-colors"
                >
                  Manter Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 15-Seconds Safety Countdown and Safe Lock Keypad Modal Overlay */}
      <AnimatePresence>
        {countdownItem && (
          <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 md:p-6 select-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
              onClick={() => setCountdownItem(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="relative max-w-md w-full bg-slate-950 border border-zinc-800 rounded-[2.5rem] p-6 md:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-center flex flex-col items-center space-y-5"
            >
              {/* Outer light glowing safe lock border decorative effects */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.06),transparent_50%)] pointer-events-none" />
              
              {/* Top Shield Icon Header */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-zinc-800 flex items-center justify-center shadow-inner text-amber-500">
                  <Lock size={20} className={safeStatus === 'granted' ? 'text-emerald-400' : safeStatus === 'error' ? 'text-red-500 animate-bounce' : 'animate-pulse'} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500 mt-2">
                  AUTENTICAÇÃO DE SEGURANÇA
                </h3>
                <span className="text-lg font-extrabold text-white uppercase tracking-tight leading-none mt-1">
                  {countdownItem.type === 'hide' 
                    ? 'Bloqueio de Workspace' 
                    : countdownItem.type === 'reveal' 
                    ? 'Desbloqueio de Workspace' 
                    : 'Acesso ao Espaço Oculto'}
                </span>
              </div>

              {/* High-Tech Glowing LCD Screen Display */}
              <div className="w-full bg-black border-2 border-zinc-800/80 rounded-2xl p-4 flex flex-col space-y-3 font-mono text-left relative overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,1)]">
                {/* Scanlines / LCD grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    SISTEMA DE COFRE CRIPTOGRÁFICO
                  </span>
                  
                  {/* Glowing Status Indicator */}
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-0.5 rounded-full border border-zinc-800/50">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      safeStatus === 'granted' 
                        ? 'bg-emerald-500 animate-pulse' 
                        : safeStatus === 'error' 
                        ? 'bg-red-500 animate-ping' 
                        : 'bg-amber-500 animate-pulse'
                    }`} />
                    <span className={`text-[8px] font-black uppercase tracking-wider ${
                      safeStatus === 'granted' 
                        ? 'text-emerald-400' 
                        : safeStatus === 'error' 
                        ? 'text-red-400' 
                        : 'text-amber-400'
                    }`}>
                      {safeStatus === 'granted' ? 'LIBERADO' : safeStatus === 'error' ? 'ALERTA INCORRETO' : 'PENDENTE'}
                    </span>
                  </div>
                </div>

                {/* Main LCD Reading Metrics Row */}
                <div className="flex items-center justify-between gap-4">
                  {/* Countdown T-Minus timer in retro digital segment look */}
                  <div className="flex flex-col leading-none">
                    <span className="text-[8px] text-zinc-500 uppercase tracking-widest">EXPIRA EM</span>
                    <span className={`text-2xl font-black ${
                      countdownItem.secondsLeft <= 4 ? 'text-red-500 animate-pulse' : 'text-zinc-200'
                    }`}>
                      {countdownItem.secondsLeft < 10 ? `0${countdownItem.secondsLeft}` : countdownItem.secondsLeft}s
                    </span>
                  </div>

                  {/* 3 Cathode Passcode Slots */}
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((idx) => {
                      const active = safeCode.length > idx;
                      const isError = safeStatus === 'error';
                      const isSuccess = safeStatus === 'granted';
                      
                      return (
                        <motion.div
                          key={idx}
                          animate={isError ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                          transition={{ duration: 0.3 }}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center font-mono font-black text-xl border-2 ${
                            isSuccess 
                              ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : isError
                              ? 'border-red-500/80 bg-red-950/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                              : active
                              ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'border-zinc-800 bg-zinc-950/80 text-zinc-700'
                          }`}
                        >
                          {active ? (safeStatus === 'granted' ? '007'[idx] : '•') : '_'}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* System Subtitles inside screen */}
                <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span>SEGURANÇA ATIVA</span>
                  <span className="text-zinc-400 font-mono">SENHA DO COFRE: 045</span>
                </div>
              </div>

              {/* Physical Vault dial numeric key matrix */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[300px]">
                {[
                  { n: '1', letters: 'ABC' },
                  { n: '2', letters: 'DEF' },
                  { n: '3', letters: 'GHI' },
                  { n: '4', letters: 'JKL' },
                  { n: '5', letters: 'MNO' },
                  { n: '6', letters: 'PRS' },
                  { n: '7', letters: 'TUV' },
                  { n: '8', letters: 'WXY' },
                  { n: '9', letters: 'QZ' },
                ].map((item) => (
                  <motion.button
                    key={item.n}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeyPress(item.n)}
                    className="h-14 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-slate-950 border border-zinc-700/50 text-zinc-200 active:text-white shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] font-black text-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:border-zinc-500/50"
                  >
                    <span>{item.n}</span>
                    <span className="text-[7.5px] font-bold opacity-40 mt-[-1px] tracking-widest">{item.letters}</span>
                  </motion.button>
                ))}

                {/* Row 4: C (Clear), 0, backspace */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playBeep(); setSafeCode(''); }}
                  className="h-14 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-red-400 hover:text-red-300 font-black text-xs flex items-center justify-center cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.6)]"
                >
                  LIMPAR
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleKeyPress('0')}
                  className="h-14 rounded-2xl bg-gradient-to-b from-zinc-800 via-zinc-900 to-slate-950 border border-zinc-700/50 text-zinc-200 active:text-white shadow-[0_3px_6px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.08)] font-black text-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:border-zinc-500/50"
                >
                  <span>0</span>
                  <span className="text-[7.5px] font-bold opacity-40 mt-[-1px] tracking-widest">+</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { playBeep(); setSafeCode(prev => prev.slice(0, -1)); }}
                  className="h-14 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white font-black text-lg flex items-center justify-center cursor-pointer shadow-[0_3px_6px_rgba(0,0,0,0.6)]"
                >
                  ⌫
                </motion.button>
              </div>

              {/* Action Description */}
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-black px-4 leading-relaxed max-w-sm">
                {countdownItem.type === 'hide'
                  ? 'Aperte os botões acima ou use o teclado físico para registrar a combinação de cofre 045 e cifrar os dados.'
                  : countdownItem.type === 'reveal'
                  ? 'Combinação necessária para restaurar a integridade pública deste workspace.'
                  : 'Desbloqueie o circuito criptográfico digitando a senha principal.'}
              </p>

              {/* Cancel overlay button */}
              <button 
                onClick={() => setCountdownItem(null)}
                className="mt-2 px-6 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[9px] font-black uppercase tracking-[0.15em] transition-all cursor-pointer border border-red-500/20 w-full max-w-[300px]"
              >
                CANCELAR PROCEDIMENTO
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
