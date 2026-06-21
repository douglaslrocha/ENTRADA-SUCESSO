import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { CategoryManager } from './CategoryManager';
import { Category } from '../types';
import { haptics } from '../services/HapticService';

interface UnifiedFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: 'income' | 'expense' | 'categories';
  categories: Category[];
  onRefreshCategories: () => void;
}

const TABS = [
  { id: 'income', label: 'GANHO', icon: <TrendingUp size={16} /> },
  { id: 'expense', label: 'GASTO', icon: <TrendingDown size={16} /> },
  { id: 'categories', label: 'CATEGORIA', icon: <Layers size={16} /> },
];

const UnifiedFinanceModalContent: React.FC<Omit<UnifiedFinanceModalProps, 'isOpen'>> = ({
  onClose,
  initialTab,
  categories,
  onRefreshCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'categories'>(initialTab);
  const lastTabChangeTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || 'unset';
    };
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Detect if horizontal scroll exists and is dominant
    const threshold = 15;
    if (Math.abs(e.deltaX) < threshold) return; 
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return; 

    const now = Date.now();
    if (now - lastTabChangeTime.current < 450) return; // 450ms cooldown to make it feel responsive but stable

    const currentIndex = TABS.findIndex(t => t.id === activeTab);

    if (e.deltaX > threshold) {
      // Scroll right -> next tab
      if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1].id as any);
        lastTabChangeTime.current = now;
        haptics.success();
      }
    } else if (e.deltaX < -threshold) {
      // Scroll left -> prev tab
      if (currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1].id as any);
        lastTabChangeTime.current = now;
        haptics.success();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Only handle horizontal swipes that are wider than vertical swipe movement
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      const now = Date.now();
      if (now - lastTabChangeTime.current < 450) return;

      const currentIndex = TABS.findIndex(t => t.id === activeTab);

      if (diffX < 0) {
        // Swiped Left -> trigger next tab
        if (currentIndex < TABS.length - 1) {
          setActiveTab(TABS[currentIndex + 1].id as any);
          lastTabChangeTime.current = now;
          haptics.success();
        }
      } else {
        // Swiped Right -> trigger prev tab
        if (currentIndex > 0) {
          setActiveTab(TABS[currentIndex - 1].id as any);
          lastTabChangeTime.current = now;
          haptics.success();
        }
      }
    }
  };

  // Contextual colors logic
  const contextColors = {
    income: {
      border: 'border-emerald-500/30',
      glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]',
      bg: 'bg-emerald-500/[0.02]',
      accent: 'bg-emerald-500'
    },
    expense: {
      border: 'border-rose-500/30',
      glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.3)]',
      bg: 'bg-rose-500/[0.02]',
      accent: 'bg-rose-500'
    },
    categories: {
      border: 'border-blue-500/30',
      glow: 'shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]',
      bg: 'bg-blue-500/[0.02]',
      accent: 'bg-blue-500'
    }
  }[activeTab];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
        }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-lg md:max-w-4xl lg:max-w-6xl bg-[#0a0a0a] border ${contextColors.border} rounded-[2.5rem] ${contextColors.glow} flex flex-col max-h-[90vh] transition-colors duration-500`}
      >
        {/* Ambient background glow inside the modal */}
        <div className={`absolute inset-0 ${contextColors.bg} pointer-events-none transition-colors duration-500`} />

        {/* Header / Tabs - Gestures localized only here to prevent blocking input interactions */}
        <div 
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative z-10 flex items-center justify-between p-6 pb-2 border-b border-white/5 backdrop-blur-xl bg-black/20 cursor-ew-resize select-none"
          title="Role ou deslize horizontalmente aqui para alternar abas"
        >
          <div className="flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-3 px-1 transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'text-white font-bold' 
                    : 'text-zinc-500 hover:text-zinc-300 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-opacity duration-300 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`}>
                    {tab.label}
                  </span>
                </div>
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabUnderline"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${contextColors.accent} rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                  />
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-all active:scale-90"
          >
            <ChevronLeft size={20} className="rotate-[-90deg] translate-y-[-1px]" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto no-scrollbar p-6">
          <div className="w-full h-full">
            {activeTab === 'income' && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <TransactionForm 
                  type="INCOME" 
                  categories={categories} 
                  onBack={onClose} 
                  onSave={() => { onRefreshCategories(); onClose(); }}
                  isEmbedded
                  isActive={true}
                  onCreateCategorySuccess={onRefreshCategories}
                />
              </motion.div>
            )}
            {activeTab === 'expense' && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <TransactionForm 
                  type="EXPENSE" 
                  categories={categories} 
                  onBack={onClose} 
                  onSave={() => { onRefreshCategories(); onClose(); }}
                  isEmbedded
                  isActive={true}
                  onCreateCategorySuccess={onRefreshCategories}
                />
              </motion.div>
            )}
            {activeTab === 'categories' && (
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <CategoryManager 
                  categories={categories} 
                  onBack={onClose} 
                  onUpdate={onRefreshCategories}
                  isEmbedded
                />
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const UnifiedFinanceModal: React.FC<UnifiedFinanceModalProps> = (props) => {
  return (
    <AnimatePresence>
      {props.isOpen && <UnifiedFinanceModalContent key="unified-finance-modal" {...props} />}
    </AnimatePresence>
  );
};
